import { randomUUID } from "crypto"
import type { Request, Response } from "@google-cloud/functions-framework"
import cors from "cors"
import Joi from "joi"
import { version } from "../package.json"
import { sendContactNotification } from "./email"
import { logger } from "./logger"
import { contactFormRateLimiter } from "./rate-limit"

const corsHandler = cors({
  origin: [
    "https://joshwentworth.com",
    "https://www.joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:9000",
  ],
  methods: ["GET", "POST", "OPTIONS"],
})

// Keep the limits in sync with web/src/components/ContactForm.tsx
const contactFormSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().trim().min(10).max(2000).required(),
  honeypot: Joi.string().allow("").optional(), // Bot detection field
})

type Middleware = (req: Request, res: Response, next: (err?: unknown) => void) => unknown

/**
 * Run an Express middleware and report whether the request should continue.
 * Resolves false when the middleware answered the request itself
 * (CORS preflight, rate limit exceeded).
 */
const runMiddleware = (middleware: Middleware, req: Request, res: Response): Promise<boolean> =>
  new Promise((resolve, reject) => {
    res.once("finish", () => resolve(false))
    middleware(req, res, (err) => (err ? reject(err) : resolve(true)))
  })

/**
 * Contact form handler: validate, drop bots, rate limit by IP, email via Mailgun.
 */
export const handleRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = randomUUID()

  try {
    if (!(await runMiddleware(corsHandler, req, res))) {
      return
    }

    if (req.method === "GET" && req.path === "/health") {
      res.status(200).json({
        success: true,
        service: "contact-form",
        status: "healthy",
        version,
        timestamp: new Date().toISOString(),
      })
      return
    }

    if (!(await runMiddleware(contactFormRateLimiter, req, res))) {
      return
    }

    if (req.method !== "POST") {
      res.status(405).json({
        success: false,
        error: "METHOD_NOT_ALLOWED",
        message: "Only POST requests are allowed",
        requestId,
      })
      return
    }

    const { error, value } = contactFormSchema.validate(req.body)

    if (error) {
      // Log messages only: error.details also carries the submitted values
      logger.warning("Validation failed", { requestId, errors: error.details.map((d) => d.message) })
      res.status(400).json({
        success: false,
        error: "VALIDATION_FAILED",
        message: error.details[0].message,
        requestId,
      })
      return
    }

    const { name, email, message, honeypot } = value as {
      name: string
      email: string
      message: string
      honeypot?: string
    }

    // A filled honeypot means a bot. Report success so it doesn't learn it was caught.
    if (honeypot && honeypot.trim() !== "") {
      logger.info("Bot detected via honeypot", { requestId })
      res.status(200).json({ success: true, message: "Thank you for your message!", requestId })
      return
    }

    const messageId = await sendContactNotification({ name, email, message })
    logger.info("Contact form submitted", { requestId, messageId })

    res.status(200).json({
      success: true,
      message: "Thank you for your message! I'll get back to you soon.",
      requestId,
    })
  } catch (error) {
    logger.error("Contact form request failed", { requestId, error })

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "INTERNAL_ERROR",
        message: "Failed to send your message. Please try again later.",
        requestId,
      })
    }
  }
}

/**
 * Cloud Function entry point.
 * Memory, instance limits and secrets are set where it is deployed:
 * .github/workflows/deploy-cloud-functions.yml
 */
export const handleContactForm = handleRequest
