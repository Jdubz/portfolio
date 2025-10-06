import { https } from "firebase-functions/v2"
import type { Request } from "firebase-functions/v2/https"
import type { Response } from "express"
import cors from "cors"
import Joi from "joi"
import { EmailService } from "./services/email.service"
import { FirestoreService } from "./services/firestore.service"
import { SecretManagerService } from "./services/secret-manager.service"

// Error codes for contact form API
const ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_FAILED: { code: "CF_VAL_001", status: 400, message: "Validation failed" },
  METHOD_NOT_ALLOWED: { code: "CF_REQ_001", status: 405, message: "Only POST requests are allowed" },

  // Server errors (5xx)
  EMAIL_DELIVERY_FAILED: {
    code: "CF_EMAIL_001",
    status: 503,
    message: "Unable to send your message at this time. Please try again later or contact me directly."
  },
  EMAIL_SERVICE_ERROR: {
    code: "CF_EMAIL_002",
    status: 503,
    message: "Email service is temporarily unavailable. Please try again later."
  },
  INTERNAL_ERROR: {
    code: "CF_SYS_001",
    status: 500,
    message: "An unexpected error occurred. Please try again later."
  },
} as const

// Simple logger for cloud functions
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

const logger = {
  info: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
  },
  warning: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
  },
  error: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
  },
}

// Initialize services
const secretManager = new SecretManagerService()
const emailService = new EmailService(secretManager)
const firestoreService = new FirestoreService(logger)

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
const handleContactFormHandler = async (req: Request, res: Response): Promise<void> => {
  const log = logger
  const requestId = generateRequestId()

  try {
    // Handle CORS preflight
    corsHandler(req, res, async () => {
      // Only allow POST requests
      if (req.method !== "POST") {
        log.warning(`Invalid method: ${req.method}`, { requestId })
        const err = ERROR_CODES.METHOD_NOT_ALLOWED
        res.status(err.status).json({
          success: false,
          error: "METHOD_NOT_ALLOWED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Validate and parse request body
      const { error, value: formData } = contactFormSchema.validate(req.body)

      if (error) {
        log.warning("Validation failed", {
          error: error.details,
          requestId,
          body: req.body,
        })
        const err = ERROR_CODES.VALIDATION_FAILED
        res.status(err.status).json({
          success: false,
          error: "VALIDATION_FAILED",
          errorCode: err.code,
          message: error.details[0].message,
          details: error.details,
          requestId,
        })
        return
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
        res.status(200).json({
          success: true,
          message: "Thank you for your message!",
          requestId,
        })
        return
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

      // Track which operations succeeded
      let firestoreSaved = false
      let emailSent = false
      let autoReplySent = false

      // Try to save to Firestore (non-blocking - don't fail request if this fails)
      try {
        const docId = await firestoreService.saveContactSubmission({
          name: data.name,
          email: data.email,
          message: data.message,
          metadata,
          requestId,
        })
        firestoreSaved = true
        log.info("Contact submission saved to Firestore", { requestId, docId })
      } catch (firestoreError) {
        // Don't fail the request - just log warning
        log.warning("Failed to save contact submission to Firestore (non-critical)", {
          error: firestoreError,
          requestId,
        })
      }

      // Try to send email notification (critical - must succeed)
      try {
        await emailService.sendContactFormNotification({
          name: data.name,
          email: data.email,
          message: data.message,
          metadata,
          requestId,
        })
        emailSent = true
        log.info("Email notification sent successfully", { requestId })
      } catch (emailError) {
        log.error("Failed to send email notification", {
          error: emailError,
          requestId,
          data: { name: data.name, email: data.email },
        })

        // Email failure is critical - return specific error code
        const err = ERROR_CODES.EMAIL_DELIVERY_FAILED
        res.status(err.status).json({
          success: false,
          error: "EMAIL_DELIVERY_FAILED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      // Try to send auto-reply (non-blocking - nice to have)
      try {
        await emailService.sendAutoReply({
          name: data.name,
          email: data.email,
          requestId,
        })
        autoReplySent = true
        log.info("Auto-reply sent successfully", { requestId })
      } catch (autoReplyError) {
        // Don't fail the request - just log warning
        log.warning("Failed to send auto-reply (non-critical)", {
          error: autoReplyError,
          requestId,
        })
      }

      log.info("Contact form processed successfully", {
        requestId,
        firestoreSaved,
        emailSent,
        autoReplySent,
      })

      // Add rate limiting headers
      res.set({
        "X-RateLimit-Limit": "10",
        "X-RateLimit-Remaining": "9",
        "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 3600),
      })

      res.status(200).json({
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
        requestId,
      })
    })
  } catch (error) {
    log.error("Unexpected error in contact form handler", {
      error,
      requestId,
      method: req.method,
      url: req.url,
    })

    const err = ERROR_CODES.INTERNAL_ERROR
    res.status(err.status).json({
      success: false,
      error: "INTERNAL_ERROR",
      errorCode: err.code,
      message: err.message,
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

/**
 * Export as Firebase HTTP Function (v2)
 * Deployed via: firebase deploy --only functions
 */
export const handleContactForm = https.onRequest(
  {
    region: "us-central1",
    secrets: [
      "mailgun-api-key",
      "mailgun-domain",
      "from-email",
      "to-email",
      "reply-to-email",
    ],
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  handleContactFormHandler
)
