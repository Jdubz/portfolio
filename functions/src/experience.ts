import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import cors from "cors"
import Joi from "joi"
import { ExperienceService } from "./services/experience.service"
import { BlurbService } from "./services/blurb.service"
import { verifyAuthenticatedEditor, type AuthenticatedRequest } from "./middleware/auth.middleware"

// Import package.json to get version
// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require("../package.json")

// Error codes for experience API
const ERROR_CODES = {
  // Client errors (400, 404, 405)
  VALIDATION_FAILED: { code: "EXP_VAL_001", status: 400, message: "Validation failed" },
  INVALID_DATE: { code: "EXP_VAL_002", status: 400, message: "Invalid date format (expected YYYY-MM)" },
  MISSING_TITLE: { code: "EXP_VAL_003", status: 400, message: "Title is required" },
  MISSING_START_DATE: { code: "EXP_VAL_004", status: 400, message: "Start date is required" },
  NOT_FOUND: { code: "EXP_REQ_001", status: 404, message: "Experience entry not found" },
  METHOD_NOT_ALLOWED: { code: "EXP_REQ_002", status: 405, message: "Method not allowed" },

  // Server errors (5xx)
  FIRESTORE_ERROR: { code: "EXP_DB_001", status: 503, message: "Database error" },
  INTERNAL_ERROR: { code: "EXP_SYS_001", status: 500, message: "Internal server error" },
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
const experienceService = new ExperienceService(logger)
const blurbService = new BlurbService(logger)

// CORS configuration
const corsOptions = {
  origin: [
    "https://joshwentworth.com",
    "https://www.joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

const corsHandler = cors(corsOptions)

// Validation schemas
const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  role: Joi.string().trim().max(200).optional().allow(""),
  location: Joi.string().trim().max(200).optional().allow(""),
  body: Joi.string().trim().max(10000).optional().allow(""),
  startDate: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required(),
  endDate: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .allow("")
    .allow(null),
  notes: Joi.string().trim().max(2000).optional().allow(""),
})

const updateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  role: Joi.string().trim().max(200).optional().allow(""),
  location: Joi.string().trim().max(200).optional().allow(""),
  body: Joi.string().trim().max(10000).optional().allow(""),
  startDate: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  endDate: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional()
    .allow("")
    .allow(null),
  notes: Joi.string().trim().max(2000).optional().allow(""),
})

// Blurb validation schemas
const createBlurbSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .required(),
  title: Joi.string().trim().min(1).max(200).required(),
  content: Joi.string().trim().max(50000).required(),
})

const updateBlurbSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  content: Joi.string().trim().max(50000).optional(),
})

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Cloud Function to manage experience entries and blurbs
 *
 * Optimized Routes:
 * - GET    /experience/all          - List all entries + blurbs in single request (public, optimized)
 *
 * Experience Routes:
 * - GET    /experience/entries      - List all entries (public)
 * - POST   /experience/entries      - Create entry (auth required)
 * - PUT    /experience/entries/:id  - Update entry (auth required)
 * - DELETE /experience/entries/:id  - Delete entry (auth required)
 *
 * Blurb Routes:
 * - GET    /experience/blurbs       - List all blurbs (public)
 * - GET    /experience/blurbs/:name - Get single blurb (public)
 * - POST   /experience/blurbs       - Create blurb (auth required)
 * - PUT    /experience/blurbs/:name - Update blurb (auth required)
 * - DELETE /experience/blurbs/:name - Delete blurb (auth required)
 */
const handleExperienceRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = generateRequestId()
  ;(req as Request & { requestId: string }).requestId = requestId

  try {
    // Handle CORS - wrap in Promise to await async callback
    await new Promise<void>((resolve, reject) => {
      corsHandler(req, res, async () => {
        try {
          // Handle OPTIONS preflight
          if (req.method === "OPTIONS") {
            res.status(204).send("")
            resolve()
            return
          }

          const path = req.path || req.url

          // Route: GET /health - Health check (public)
          if (req.method === "GET" && path === "/health") {
            res.status(200).json({
              success: true,
              service: "manageExperience",
              status: "healthy",
              version: packageJson.version,
              timestamp: new Date().toISOString(),
            })
            resolve()
            return
          }

          // Route: GET /experience/all - List all entries and blurbs (public, optimized)
          if (req.method === "GET" && path === "/experience/all") {
            await handleListAll(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /experience/entries - List all (public)
          if (req.method === "GET" && path === "/experience/entries") {
            await handleListEntries(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /experience/blurbs - List all blurbs (public)
          if (req.method === "GET" && path === "/experience/blurbs") {
            await handleListBlurbs(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /experience/blurbs/:name - Get single blurb (public)
          if (req.method === "GET" && path.startsWith("/experience/blurbs/")) {
            const name = path.replace("/experience/blurbs/", "")
            await handleGetBlurb(req, res, requestId, name)
            resolve()
            return
          }

          // All other routes require authentication
          // Apply auth middleware
          await new Promise<void>((resolveAuth, rejectAuth) => {
            verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
              if (err) rejectAuth(err)
              else resolveAuth()
            })
          })

          // Route: POST /experience/entries - Create entry
          if (req.method === "POST" && path === "/experience/entries") {
            await handleCreateEntry(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: PUT /experience/entries/:id - Update entry
          if (req.method === "PUT" && path.startsWith("/experience/entries/")) {
            const id = path.replace("/experience/entries/", "")
            await handleUpdateEntry(req as AuthenticatedRequest, res, requestId, id)
            resolve()
            return
          }

          // Route: DELETE /experience/entries/:id - Delete entry
          if (req.method === "DELETE" && path.startsWith("/experience/entries/")) {
            const id = path.replace("/experience/entries/", "")
            await handleDeleteEntry(req as AuthenticatedRequest, res, requestId, id)
            resolve()
            return
          }

          // Route: POST /experience/blurbs - Create blurb
          if (req.method === "POST" && path === "/experience/blurbs") {
            await handleCreateBlurb(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: PUT /experience/blurbs/:name - Update blurb
          if (req.method === "PUT" && path.startsWith("/experience/blurbs/")) {
            const name = path.replace("/experience/blurbs/", "")
            await handleUpdateBlurb(req as AuthenticatedRequest, res, requestId, name)
            resolve()
            return
          }

          // Route: DELETE /experience/blurbs/:name - Delete blurb
          if (req.method === "DELETE" && path.startsWith("/experience/blurbs/")) {
            const name = path.replace("/experience/blurbs/", "")
            await handleDeleteBlurb(req as AuthenticatedRequest, res, requestId, name)
            resolve()
            return
          }

          // Unknown route
          const err = ERROR_CODES.METHOD_NOT_ALLOWED
          logger.warning("Method not allowed", { method: req.method, path, requestId })
          res.status(err.status).json({
            success: false,
            error: "METHOD_NOT_ALLOWED",
            errorCode: err.code,
            message: err.message,
            requestId,
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  } catch (error) {
    logger.error("Unexpected error in experience handler", {
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
 * GET /experience/all - List all entries and blurbs (public, optimized)
 * Returns both entries and blurbs in a single request for faster page load
 */
async function handleListAll(req: Request, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Listing all experience data", { requestId })

    // Fetch both entries and blurbs in parallel
    const [entries, blurbs] = await Promise.all([experienceService.listEntries(), blurbService.listBlurbs()])

    res.status(200).json({
      success: true,
      data: {
        entries,
        blurbs,
        entriesCount: entries.length,
        blurbsCount: blurbs.length,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to list all experience data", { error, requestId })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * GET /experience/entries - List all entries (public)
 */
async function handleListEntries(req: Request, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Listing experience entries", { requestId })

    const entries = await experienceService.listEntries()

    res.status(200).json({
      success: true,
      data: {
        entries,
        count: entries.length,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to list entries", { error, requestId })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * POST /experience/entries - Create entry (auth required)
 */
async function handleCreateEntry(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = createSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for create", {
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

    const userEmail = req.user!.email

    logger.info("Creating experience entry", {
      requestId,
      title: value.title,
      userEmail,
    })

    const entry = await experienceService.createEntry(value, userEmail)

    res.status(201).json({
      success: true,
      data: { entry },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to create entry", {
      error,
      requestId,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * PUT /experience/entries/:id - Update entry (auth required)
 */
async function handleUpdateEntry(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  id: string
): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for update", {
        error: error.details,
        requestId,
        id,
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

    const userEmail = req.user!.email

    logger.info("Updating experience entry", {
      requestId,
      id,
      userEmail,
      fieldsToUpdate: Object.keys(value),
    })

    const entry = await experienceService.updateEntry(id, value, userEmail)

    res.status(200).json({
      success: true,
      data: { entry },
      requestId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("not found")) {
      logger.warning("Entry not found for update", { id, requestId })

      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: err.message,
        requestId,
      })
      return
    }

    logger.error("Failed to update entry", {
      error,
      requestId,
      id,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * DELETE /experience/entries/:id - Delete entry (auth required)
 */
async function handleDeleteEntry(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  id: string
): Promise<void> {
  try {
    logger.info("Deleting experience entry", {
      requestId,
      id,
      userEmail: req.user?.email,
    })

    await experienceService.deleteEntry(id)

    res.status(200).json({
      success: true,
      message: "Entry deleted successfully",
      requestId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("not found")) {
      logger.warning("Entry not found for delete", { id, requestId })

      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: err.message,
        requestId,
      })
      return
    }

    logger.error("Failed to delete entry", {
      error,
      requestId,
      id,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * GET /experience/blurbs - List all blurbs (public)
 */
async function handleListBlurbs(req: Request, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Listing blurbs", { requestId })

    const blurbs = await blurbService.listBlurbs()

    res.status(200).json({
      success: true,
      data: {
        blurbs,
      count: blurbs.length,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to list blurbs", { error, requestId })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * GET /experience/blurbs/:name - Get single blurb (public)
 */
async function handleGetBlurb(req: Request, res: Response, requestId: string, name: string): Promise<void> {
  try {
    logger.info("Getting blurb", { requestId, name })

    const blurb = await blurbService.getBlurb(name)

    if (!blurb) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Blurb not found",
        requestId,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { blurb },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get blurb", { error, requestId, name })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * POST /experience/blurbs - Create blurb (auth required)
 */
async function handleCreateBlurb(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = createBlurbSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for create blurb", {
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

    const userEmail = req.user!.email

    logger.info("Creating blurb", {
      requestId,
      name: value.name,
      title: value.title,
      userEmail,
    })

    const blurb = await blurbService.createBlurb(value, userEmail)

    res.status(201).json({
      success: true,
      data: { blurb },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to create blurb", {
      error,
      requestId,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * PUT /experience/blurbs/:name - Update blurb (auth required)
 */
async function handleUpdateBlurb(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  name: string
): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateBlurbSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for update blurb", {
        error: error.details,
        requestId,
        name,
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

    const userEmail = req.user!.email

    logger.info("Updating blurb", {
      requestId,
      name,
      userEmail,
      fieldsToUpdate: Object.keys(value),
    })

    const blurb = await blurbService.updateBlurb(name, value, userEmail)

    res.status(200).json({
      success: true,
      data: { blurb },
      requestId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("not found")) {
      logger.warning("Blurb not found for update", { name, requestId })

      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Blurb not found",
        requestId,
      })
      return
    }

    logger.error("Failed to update blurb", {
      error,
      requestId,
      name,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

/**
 * DELETE /experience/blurbs/:name - Delete blurb (auth required)
 */
async function handleDeleteBlurb(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  name: string
): Promise<void> {
  try {
    logger.info("Deleting blurb", {
      requestId,
      name,
      userEmail: req.user?.email,
    })

    await blurbService.deleteBlurb(name)

    res.status(200).json({
      success: true,
      message: "Blurb deleted successfully",
      requestId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("not found")) {
      logger.warning("Blurb not found for delete", { name, requestId })

      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Blurb not found",
        requestId,
      })
      return
    }

    logger.error("Failed to delete blurb", {
      error,
      requestId,
      name,
      userEmail: req.user?.email,
    })

    const err = ERROR_CODES.FIRESTORE_ERROR
    res.status(err.status).json({
      success: false,
      error: "FIRESTORE_ERROR",
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
 * Set custom claims in Firebase Console or via Admin SDK:
 *   admin.auth().setCustomUserClaims(uid, { role: 'editor' })
 */
export const manageExperience = https.onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
    serviceAccount: "789847666726-compute@developer.gserviceaccount.com",
  },
  handleExperienceRequest
)
