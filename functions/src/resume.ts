import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import { Storage } from "@google-cloud/storage"
import busboy from "busboy"
import { verifyAuthenticatedEditor, type AuthenticatedRequest } from "./middleware/auth.middleware"

// Error codes for resume API
const ERROR_CODES = {
  // Client errors (400, 405, 413)
  VALIDATION_FAILED: { code: "RES_VAL_001", status: 400, message: "Validation failed" },
  INVALID_FILE_TYPE: { code: "RES_VAL_002", status: 400, message: "Only PDF files are allowed" },
  FILE_TOO_LARGE: { code: "RES_VAL_003", status: 413, message: "File size must be less than 10MB" },
  NO_FILE_PROVIDED: { code: "RES_VAL_004", status: 400, message: "No file provided" },
  METHOD_NOT_ALLOWED: { code: "RES_REQ_001", status: 405, message: "Method not allowed" },

  // Server errors (5xx)
  STORAGE_ERROR: { code: "RES_STOR_001", status: 503, message: "Storage service error" },
  INTERNAL_ERROR: { code: "RES_SYS_001", status: 500, message: "Internal server error" },
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

// Initialize Google Cloud Storage
const storage = new Storage()
const BUCKET_NAME = "joshwentworth-resume"
const RESUME_FILENAME = "resume.pdf"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Cloud Function to handle resume uploads
 *
 * Routes:
 * - POST /resume/upload - Upload resume (auth required, PDF only, replaces existing)
 */
const handleResumeRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = generateRequestId()

  // Set CORS headers manually to avoid middleware consuming body
  const origin = req.headers.origin || ""
  const isAllowedOrigin = corsOptions.origin.includes(origin)

  if (isAllowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
  }

  res.setHeader("Access-Control-Allow-Methods", corsOptions.methods.join(", "))
  res.setHeader("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(", "))

  // Handle OPTIONS preflight (must be before any auth checks)
  if (req.method === "OPTIONS") {
    res.status(204).send("")
    return
  }

  try {

    // Only allow POST requests
    if (req.method !== "POST") {
      logger.warning("Method not allowed", { method: req.method, requestId })
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

    // Apply auth middleware
    await new Promise<void>((resolveAuth, rejectAuth) => {
      verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
        if (err) rejectAuth(err)
        else resolveAuth()
      })
    })

    // Handle file upload
    await handleResumeUpload(req as AuthenticatedRequest, res, requestId)
  } catch (error) {
    logger.error("Unexpected error in resume handler", {
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
 * POST /resume/upload - Upload resume (auth required)
 */
async function handleResumeUpload(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  const userEmail = req.user!.email

  logger.info("Processing resume upload", {
    requestId,
    userEmail,
  })

  try {
    const contentType = req.headers["content-type"]
    if (!contentType || !contentType.includes("multipart/form-data")) {
      const err = ERROR_CODES.VALIDATION_FAILED
      res.status(err.status).json({
        success: false,
        error: "VALIDATION_FAILED",
        errorCode: err.code,
        message: "Content-Type must be multipart/form-data",
        requestId,
      })
      return
    }

    const bb = busboy({
      headers: req.headers,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only allow one file
      }
    })
    let fileUploaded = false
    let uploadError: Error | null = null
    let responseHandled = false

    bb.on("error", (err: unknown) => {
      logger.error("Busboy error", { error: err, requestId })
      uploadError = err instanceof Error ? err : new Error(String(err))

      // Handle the error immediately if response not already sent
      if (!responseHandled && !res.headersSent) {
        responseHandled = true
        const error = ERROR_CODES.VALIDATION_FAILED
        const errorMessage = err instanceof Error ? err.message : String(err)
        res.status(error.status).json({
          success: false,
          error: "VALIDATION_FAILED",
          errorCode: error.code,
          message: errorMessage || error.message,
          requestId,
        })
      }
    })

    bb.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info

      logger.info("File upload started", {
        requestId,
        fieldname,
        filename,
        mimeType,
      })

      // Validate file type
      if (mimeType !== "application/pdf") {
        uploadError = new Error("INVALID_FILE_TYPE")
        file.resume() // Drain the stream
        return
      }

      // Upload to GCS
      const bucket = storage.bucket(BUCKET_NAME)
      const blob = bucket.file(RESUME_FILENAME)
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: "application/pdf",
          metadata: {
            uploadedBy: userEmail,
            uploadedAt: new Date().toISOString(),
            originalFilename: filename,
          },
        },
      })

      blobStream.on("error", (err) => {
        logger.error("Upload stream error", { error: err, requestId })
        uploadError = err
      })

      blobStream.on("finish", () => {
        logger.info("File uploaded successfully", {
          requestId,
          bucket: BUCKET_NAME,
          filename: RESUME_FILENAME,
          userEmail,
        })
        fileUploaded = true
      })

      file.on("limit", () => {
        uploadError = new Error("FILE_TOO_LARGE")
        file.resume() // Drain the stream
      })

      file.pipe(blobStream)
    })

    bb.on("finish", () => {
      // Skip if response already handled (e.g., from error handler)
      if (responseHandled) {
        return
      }
      responseHandled = true

      if (uploadError) {
        const errorType = uploadError.message
        const err =
          errorType === "INVALID_FILE_TYPE"
            ? ERROR_CODES.INVALID_FILE_TYPE
            : errorType === "FILE_TOO_LARGE"
              ? ERROR_CODES.FILE_TOO_LARGE
              : ERROR_CODES.STORAGE_ERROR

        logger.warning("Upload failed", { error: errorType, requestId })
        res.status(err.status).json({
          success: false,
          error: errorType,
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      if (!fileUploaded) {
        const err = ERROR_CODES.NO_FILE_PROVIDED
        logger.warning("No file provided", { requestId })
        res.status(err.status).json({
          success: false,
          error: "NO_FILE_PROVIDED",
          errorCode: err.code,
          message: err.message,
          requestId,
        })
        return
      }

      const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${RESUME_FILENAME}`

      res.status(200).json({
        success: true,
        message: "Resume uploaded successfully",
        url: publicUrl,
        requestId,
      })
    })

    // Important: Handle request piping carefully to prevent stream issues
    // The request might be paused or in an odd state after middleware processing

    // Set up error handler for request stream
    req.on("error", (err) => {
      logger.error("Request stream error", { error: err, requestId })
      if (!responseHandled && !res.headersSent) {
        responseHandled = true
        const error = ERROR_CODES.VALIDATION_FAILED
        res.status(error.status).json({
          success: false,
          error: "VALIDATION_FAILED",
          errorCode: error.code,
          message: "Error reading request data",
          requestId,
        })
      }
    })

    // Pipe request to busboy
    req.pipe(bb)
  } catch (error) {
    logger.error("Failed to upload resume", {
      error,
      requestId,
      userEmail,
    })

    const err = ERROR_CODES.STORAGE_ERROR
    res.status(err.status).json({
      success: false,
      error: "STORAGE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * Export as Firebase HTTP Function (v2)
 *
 * Authorization: Uses Firebase Auth custom claims (role: 'editor')
 */
export const uploadResume = https.onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    maxInstances: 5,
    timeoutSeconds: 60,
    serviceAccount: "cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com",
  },
  handleResumeRequest
)
