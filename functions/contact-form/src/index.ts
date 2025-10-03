import { Request, Response } from "express"
import cors from "cors"
import Joi from "joi"
import { EmailService } from "./services/email.service"
import { SecretManagerService } from "./services/secret-manager.service"

// Simple logger for cloud functions
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

const logger = {
  info: (message: string, data?: any) => {
    if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
  },
  warning: (message: string, data?: any) => {
    if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
  },
  error: (message: string, data?: any) => {
    if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
  },
}

// Initialize services
const secretManager = new SecretManagerService()
const emailService = new EmailService(secretManager)

// CORS configuration
const corsOptions = {
  origin: [
    "https://joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

const corsHandler = cors(corsOptions)

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

interface ContactFormMetadata {
  ip?: string
  userAgent?: string
  timestamp: string
  referrer?: string
}

/**
 * Cloud Function to handle contact form submissions
 *
 * Features:
 * - Input validation and sanitization
 * - CORS handling for frontend integration
 * - Bot detection via honeypot field
 * - Rate limiting headers
 * - Comprehensive logging
 * - Email service abstraction (ready for SendGrid, SES, etc.)
 * - Error handling with appropriate HTTP status codes
 */
export const handleContactForm = async (req: Request, res: Response) => {
  const log = logger
  const requestId = generateRequestId()

  try {
    // Handle CORS preflight
    corsHandler(req, res, async () => {
      // Only allow POST requests
      if (req.method !== "POST") {
        log.warning(`Invalid method: ${req.method}`, { requestId })
        return res.status(405).json({
          error: "Method Not Allowed",
          message: "Only POST requests are allowed",
          requestId,
        })
      }

      // Validate and parse request body
      const { error, value: formData } = contactFormSchema.validate(req.body)

      if (error) {
        log.warning("Validation failed", {
          error: error.details,
          requestId,
          body: req.body,
        })
        return res.status(400).json({
          error: "Validation Error",
          message: error.details[0].message,
          requestId,
        })
      }

      const data: ContactFormData = formData

      // Bot detection - if honeypot field is filled, likely a bot
      if (data.honeypot && data.honeypot.trim() !== "") {
        log.warning("Honeypot triggered - potential bot", {
          requestId,
          honeypot: data.honeypot,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        })
        // Return success to not reveal the honeypot to bots
        return res.status(200).json({
          success: true,
          message: "Thank you for your message!",
          requestId,
        })
      }

      // Collect metadata
      const metadata: ContactFormMetadata = {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date().toISOString(),
        referrer: req.get("Referer"),
      }

      log.info("Processing contact form submission", {
        requestId,
        name: data.name,
        email: data.email,
        messageLength: data.message.length,
        metadata,
      })

      try {
        // Send email notification
        await emailService.sendContactFormNotification({
          name: data.name,
          email: data.email,
          message: data.message,
          metadata,
          requestId,
        })

        // Send auto-reply to user (optional)
        await emailService.sendAutoReply({
          name: data.name,
          email: data.email,
          requestId,
        })

        log.info("Contact form processed successfully", { requestId })

        // Add rate limiting headers
        res.set({
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "9",
          "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 3600),
        })

        return res.status(200).json({
          success: true,
          message: "Thank you for your message! I'll get back to you soon.",
          requestId,
        })
      } catch (emailError) {
        log.error("Failed to send email", {
          error: emailError,
          requestId,
          data: { name: data.name, email: data.email },
        })

        return res.status(500).json({
          error: "Email Service Error",
          message: "Failed to process your message. Please try again later.",
          requestId,
        })
      }
    })
  } catch (error) {
    log.error("Unexpected error in contact form handler", {
      error,
      requestId,
      method: req.method,
      url: req.url,
    })

    return res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred. Please try again later.",
      requestId,
    })
  }
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
