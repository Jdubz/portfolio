import { https } from "firebase-functions/v2"
import type { Request } from "firebase-functions/v2/https"
import type { Response } from "express"
import cors from "cors"
import Joi from "joi"
import { EmailService } from "./services/email.service"
import { FirestoreService } from "./services/firestore.service"
import { SecretManagerService } from "./services/secret-manager.service"
import { verifyAppCheck } from "./middleware/app-check.middleware"
import { contactFormRateLimiter } from "./middleware/rate-limit.middleware"

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
    "https://www.joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Firebase-AppCheck"],
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

  // Extract trace context for debugging (Cloud Trace integration)
  const traceHeader = req.get ? req.get("x-cloud-trace-context") : undefined
  let traceId: string | undefined
  let spanId: string | undefined

  if (traceHeader) {
    const [trace, span] = traceHeader.split("/")
    traceId = trace
    spanId = span?.split(";")[0]
  }

  try {
    // Handle CORS preflight
    corsHandler(req, res, async () => {
      // Handle OPTIONS preflight request
      if (req.method === "OPTIONS") {
        res.status(204).send("")
        return
      }

      // Apply rate limiting
      await new Promise<void>((resolve, reject) => {
        contactFormRateLimiter(req, res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Verify App Check token (defense in depth)
      await new Promise<void>((resolve, reject) => {
        verifyAppCheck(req, res, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // Only allow POST requests
      if (req.method !== "POST") {
        log.warning(`Invalid method: ${req.method}`, { requestId, traceId, spanId })
        const err = ERROR_CODES.METHOD_NOT_ALLOWED
        res.status(err.status).json({
          success: false,
          error: "METHOD_NOT_ALLOWED",
          errorCode: err.code,
          message: err.message,
          requestId,
          ...(traceId && { traceId }),
          ...(spanId && { spanId }),
        })
        return
      }

      // Validate and parse request body
      const { error, value: formData } = contactFormSchema.validate(req.body)

      if (error) {
        log.warning("Validation failed", {
          error: error.details,
          requestId,
          traceId,
          spanId,
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
          ...(traceId && { traceId }),
          ...(spanId && { spanId }),
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

      // Track transaction details for Firestore
      const errors: string[] = []
      let contactEmailResponse: { messageId: string; status?: string; accepted: boolean } | undefined
      let autoReplyResponse: { messageId: string; status?: string; accepted: boolean } | undefined
      let contactEmailError: string | undefined
      let autoReplyError: string | undefined
      let contactEmailErrorCode: string | undefined
      let autoReplyErrorCode: string | undefined

      // STEP 1: Send contact notification email (critical - must succeed)
      try {
        contactEmailResponse = await emailService.sendContactFormNotification({
          name: data.name,
          email: data.email,
          message: data.message,
          metadata,
          requestId,
        })
        log.info("Contact notification sent successfully", {
          requestId,
          mailgunMessageId: contactEmailResponse.messageId,
        })
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)
        const isConfigError = errorMessage.includes("configuration") || errorMessage.includes("Unauthorized")
        const err = isConfigError ? ERROR_CODES.EMAIL_SERVICE_ERROR : ERROR_CODES.EMAIL_DELIVERY_FAILED

        contactEmailError = errorMessage
        contactEmailErrorCode = err.code
        errors.push(`Contact email failed: ${errorMessage}`)

        log.error("Failed to send contact notification", {
          error: emailError,
          requestId,
          traceId,
          spanId,
          errorCode: err.code,
        })

        // Critical failure - return error immediately
        res.status(err.status).json({
          success: false,
          error: isConfigError ? "EMAIL_SERVICE_ERROR" : "EMAIL_DELIVERY_FAILED",
          errorCode: err.code,
          message: err.message,
          requestId,
          ...(traceId && { traceId }),
          ...(spanId && { spanId }),
        })
        return
      }

      // STEP 2: Send auto-reply email (non-critical, continue on failure)
      try {
        autoReplyResponse = await emailService.sendAutoReply({
          name: data.name,
          email: data.email,
          requestId,
        })
        log.info("Auto-reply sent successfully", {
          requestId,
          mailgunMessageId: autoReplyResponse.messageId,
        })
      } catch (autoReplyErr) {
        const errorMessage = autoReplyErr instanceof Error ? autoReplyErr.message : String(autoReplyErr)
        autoReplyError = errorMessage
        autoReplyErrorCode = ERROR_CODES.EMAIL_DELIVERY_FAILED.code
        errors.push(`Auto-reply failed: ${errorMessage}`)

        log.warning("Failed to send auto-reply (non-critical)", {
          error: autoReplyErr,
          requestId,
        })
      }

      // STEP 3: Record transaction in Firestore (non-critical, continue on failure)
      let firestoreSaved = false
      let firestoreDocId: string | undefined
      try {
        firestoreDocId = await firestoreService.saveContactSubmission({
          name: data.name,
          email: data.email,
          message: data.message,
          metadata,
          requestId,
          ...(traceId && { traceId }),
          ...(spanId && { spanId }),
          transaction: {
            contactEmail: {
              success: !!contactEmailResponse,
              response: contactEmailResponse,
              error: contactEmailError,
              errorCode: contactEmailErrorCode,
            },
            autoReply: {
              success: !!autoReplyResponse,
              response: autoReplyResponse,
              error: autoReplyError,
              errorCode: autoReplyErrorCode,
            },
            errors,
          },
        })
        firestoreSaved = true
        log.info("Transaction saved to Firestore", {
          requestId,
          docId: firestoreDocId,
          errors: errors.length,
        })
      } catch (firestoreError) {
        const errorMessage = firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
        errors.push(`Firestore save failed: ${errorMessage}`)

        log.warning("Failed to save transaction to Firestore (non-critical)", {
          error: firestoreError,
          requestId,
          traceId,
          spanId,
        })
      }

      log.info("Contact form processed successfully", {
        requestId,
        firestoreSaved,
        contactEmailSent: !!contactEmailResponse,
        autoReplySent: !!autoReplyResponse,
        totalErrors: errors.length,
      })

      // STEP 4: Send response to client
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
        ...(errors.length > 0 && {
          warnings: errors,
          details: {
            contactEmailSent: !!contactEmailResponse,
            autoReplySent: !!autoReplyResponse,
            transactionRecorded: firestoreSaved,
          },
        }),
      })
    })
  } catch (error) {
    log.error("Unexpected error in contact form handler", {
      error,
      requestId,
      traceId,
      spanId,
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
      ...(traceId && { traceId }),
      ...(spanId && { spanId }),
    })
  }
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
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

/**
 * Experience management endpoint
 * Deployed via: firebase deploy --only functions:manageExperience
 */
export { manageExperience } from "./experience"

/**
 * Resume upload endpoint
 * Deployed via: firebase deploy --only functions:uploadResume
 */
export { uploadResume } from "./resume"

/**
 * AI Resume Generator endpoint
 * Deployed via: firebase deploy --only functions:manageGenerator
 */
export { manageGenerator } from "./generator"

