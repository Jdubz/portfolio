import { https } from "firebase-functions/v2"
import type { Request } from "firebase-functions/v2/https"
import type { Response } from "express"
import Joi from "joi"
import { EmailService } from "./services/email.service"
import { FirestoreService } from "./services/firestore.service"
import { SecretManagerService } from "./services/secret-manager.service"
import { verifyAppCheck } from "./middleware/app-check.middleware"
import { contactFormRateLimiter } from "./middleware/rate-limit.middleware"
import { logger } from "./utils/logger"
import { generateRequestId } from "./utils/request-id"
import { contactFormCorsHandler } from "./config/cors"
import { CONTACT_FORM_ERROR_CODES as ERROR_CODES } from "./config/error-codes"
import { PACKAGE_VERSION } from "./config/versions"

// Initialize services
const secretManager = new SecretManagerService()
const emailService = new EmailService(secretManager)
const firestoreService = new FirestoreService(logger)

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
    contactFormCorsHandler(req, res, async () => {
      // Handle OPTIONS preflight request
      if (req.method === "OPTIONS") {
        res.status(204).send("")
        return
      }

      // Health check endpoint (no rate limiting or AppCheck required)
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
        logger.warning(`Invalid method: ${req.method}`, { requestId, traceId, spanId })
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
        logger.warning("Validation failed", {
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
        logger.warning("Honeypot triggered - potential bot", {
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

      logger.info("Processing contact form submission", {
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
        logger.info("Contact notification sent successfully", {
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

        logger.error("Failed to send contact notification", {
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
        logger.info("Auto-reply sent successfully", {
          requestId,
          mailgunMessageId: autoReplyResponse.messageId,
        })
      } catch (autoReplyErr) {
        const errorMessage = autoReplyErr instanceof Error ? autoReplyErr.message : String(autoReplyErr)
        autoReplyError = errorMessage
        autoReplyErrorCode = ERROR_CODES.EMAIL_DELIVERY_FAILED.code
        errors.push(`Auto-reply failed: ${errorMessage}`)

        logger.warning("Failed to send auto-reply (non-critical)", {
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
        logger.info("Transaction saved to Firestore", {
          requestId,
          docId: firestoreDocId,
          errors: errors.length,
        })
      } catch (firestoreError) {
        const errorMessage = firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
        errors.push(`Firestore save failed: ${errorMessage}`)

        logger.warning("Failed to save transaction to Firestore (non-critical)", {
          error: firestoreError,
          requestId,
          traceId,
          spanId,
        })
      }

      logger.info("Contact form processed successfully", {
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
    logger.error("Unexpected error in contact form handler", {
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
 * Contact Form Function
 * Uses the 'portfolio' Firestore database
 * Deployed via: firebase deploy --only functions
 */
export const handleContactForm = https.onRequest(
  {
    region: "us-central1",
    secrets: ["mailgun-api-key", "mailgun-domain", "from-email", "to-email", "reply-to-email"],
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  handleContactFormHandler
)
