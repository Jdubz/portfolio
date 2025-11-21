import { https } from "firebase-functions/v2"
import type { Request } from "firebase-functions/v2/https"
import type { Response } from "express"
import Joi from "joi"
import { EmailService } from "./services/email.service"
import { SecretManagerService } from "./services/secret-manager.service"
import { contactFormRateLimiter } from "./middleware/rate-limit.middleware"
import { logger } from "./utils/logger"
import { generateRequestId } from "./utils/request-id"
import { contactFormCorsHandler } from "./config/cors"
import { PACKAGE_VERSION } from "./config/versions"

// Initialize services
const secretManager = new SecretManagerService()
const emailService = new EmailService(secretManager)

// Request validation schema
const contactFormSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().required(),
  message: Joi.string().trim().min(10).max(2000).required(),
  honeypot: Joi.string().allow("").optional(), // Bot detection field
})

interface ContactFormData {
  name: string
  email: string
  message: string
  honeypot?: string
}

/**
 * Simplified Contact Form Cloud Function
 *
 * Simple flow:
 * 1. Validate form data
 * 2. Check honeypot for bots
 * 3. Rate limit by IP
 * 4. Send email via Mailgun
 * 5. Done
 */
const handleContactFormHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = generateRequestId()

  try {
    // Handle CORS preflight
    contactFormCorsHandler(req, res, async () => {
      // Handle OPTIONS preflight request
      if (req.method === "OPTIONS") {
        res.status(204).send("")
        return
      }

      // Health check endpoint
      if (req.method === "GET" && (req.path === "/health" || req.url === "/health")) {
        res.status(200).json({
          success: true,
          service: "contact-form",
          status: "healthy",
          version: PACKAGE_VERSION,
          timestamp: new Date().toISOString(),
        })
        return
      }

      // Apply rate limiting (3 requests per 15 minutes per IP)
      await new Promise<void>((resolve, reject) => {
        contactFormRateLimiter(req, res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Only allow POST requests
      if (req.method !== "POST") {
        logger.warning(`Invalid method: ${req.method}`, { requestId })
        res.status(405).json({
          success: false,
          error: "METHOD_NOT_ALLOWED",
          message: "Only POST requests are allowed",
          requestId,
        })
        return
      }

      // Validate and parse request body
      const { error, value: formData } = contactFormSchema.validate(req.body)

      if (error) {
        logger.warning("Validation failed", {
          error: error.details,
          requestId,
        })
        res.status(400).json({
          success: false,
          error: "VALIDATION_FAILED",
          message: error.details[0].message,
          requestId,
        })
        return
      }

      const data: ContactFormData = formData

      // Bot detection - if honeypot field is filled, silently succeed
      if (data.honeypot && data.honeypot.trim() !== "") {
        logger.info("Bot detected via honeypot", {
          requestId,
          honeypotValue: data.honeypot,
        })
        // Return success to the bot (don't reveal detection)
        res.status(200).json({
          success: true,
          message: "Thank you for your message!",
          requestId,
        })
        return
      }

      // Send email notification
      try {
        await emailService.sendContactNotification({
          name: data.name,
          email: data.email,
          message: data.message,
        })

        logger.info("Contact form submitted successfully", {
          requestId,
          email: data.email,
          name: data.name,
        })

        res.status(200).json({
          success: true,
          message: "Thank you for your message! I'll get back to you soon.",
          requestId,
        })
      } catch (emailError) {
        logger.error("Failed to send email", {
          error: emailError,
          requestId,
        })

        res.status(500).json({
          success: false,
          error: "EMAIL_SEND_FAILED",
          message: "Failed to send your message. Please try again later.",
          requestId,
        })
      }
    })
  } catch (error) {
    logger.error("Unexpected error in contact form handler", {
      error,
      requestId,
    })

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
      requestId,
    })
  }
}

/**
 * Contact Form Function
 * Uses the 'portfolio' Firestore database
 * Deployed via: firebase deploy --only functions
 */
export const handleContactForm = https.onRequest(
  {
    region: "us-central1",
    secrets: ["mailgun-api-key", "mailgun-domain", "from-email", "to-email"],
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  handleContactFormHandler
)
