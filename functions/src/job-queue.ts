import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import Joi from "joi"
import { JobQueueService } from "./services/job-queue.service"
import {
  verifyAuthenticatedEditor,
  verifyAuthenticatedUser,
  type AuthenticatedRequest,
} from "./middleware/auth.middleware"
import { logger } from "./utils/logger"
import { generateRequestId } from "./utils/request-id"
import { corsHandler } from "./config/cors"
import { JOB_QUEUE_ERROR_CODES as ERROR_CODES } from "./config/error-codes"
import { PACKAGE_VERSION } from "./config/versions"

// Initialize service
const jobQueueService = new JobQueueService(logger)

// Validation schemas
const submitJobSchema = Joi.object({
  url: Joi.string().uri().trim().required(),
  companyName: Joi.string().trim().max(200).optional().allow(""),
  generationId: Joi.string().trim().optional(), // Optional generation ID for pre-generated documents
})

const updateStopListSchema = Joi.object({
  excludedCompanies: Joi.array().items(Joi.string().trim().max(200)).required(),
  excludedKeywords: Joi.array().items(Joi.string().trim().max(200)).required(),
  excludedDomains: Joi.array().items(Joi.string().trim().max(200)).required(),
})

const updateAISettingsSchema = Joi.object({
  provider: Joi.string().valid("claude", "openai").required(),
  model: Joi.string().trim().max(100).required(),
  minMatchScore: Joi.number().min(0).max(100).required(),
  costBudgetDaily: Joi.number().min(0).required(),
})

const updateQueueSettingsSchema = Joi.object({
  maxRetries: Joi.number().integer().min(0).max(10).required(),
  retryDelaySeconds: Joi.number().integer().min(0).required(),
  processingTimeout: Joi.number().integer().min(0).required(),
})

/**
 * Cloud Function to manage job queue operations
 *
 * Routes:
 * - GET    /health                  - Health check (public)
 * - POST   /submit                  - Submit job to queue (any authenticated user)
 * - GET    /status/:id              - Get queue item status (any authenticated user, owner check)
 * - POST   /retry/:id               - Retry failed queue item (editor only)
 * - DELETE /queue/:id               - Delete queue item (editor only)
 * - GET    /config/stop-list        - Get stop list (editor only)
 * - PUT    /config/stop-list        - Update stop list (editor only)
 * - GET    /config/ai-settings      - Get AI settings (editor only)
 * - PUT    /config/ai-settings      - Update AI settings (editor only)
 * - GET    /config/queue-settings   - Get queue settings (editor only)
 * - PUT    /config/queue-settings   - Update queue settings (editor only)
 * - GET    /stats                   - Get queue statistics (any authenticated user)
 */
const handleJobQueueRequest = async (req: Request, res: Response): Promise<void> => {
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
              service: "manageJobQueue",
              status: "healthy",
              version: PACKAGE_VERSION,
              timestamp: new Date().toISOString(),
            })
            resolve()
            return
          }

          // Routes accessible to any authenticated user (viewers + editors)
          const viewerRoutes = ["/submit", "/stats"].some((route) => path === route) || path.startsWith("/status/")

          if (viewerRoutes) {
            // Verify any authenticated user
            await new Promise<void>((resolveAuth, rejectAuth) => {
              verifyAuthenticatedUser(logger)(req as AuthenticatedRequest, res, (err) => {
                if (err) rejectAuth(err)
                else resolveAuth()
              })
            })

            // Route: POST /submit - Submit job to queue
            if (req.method === "POST" && path === "/submit") {
              await handleSubmitJob(req as AuthenticatedRequest, res, requestId)
              resolve()
              return
            }

            // Route: GET /status/:id - Get queue item status
            if (req.method === "GET" && path.startsWith("/status/")) {
              const id = path.replace("/status/", "")
              await handleGetQueueStatus(req as AuthenticatedRequest, res, requestId, id)
              resolve()
              return
            }

            // Route: GET /stats - Get queue statistics
            if (req.method === "GET" && path === "/stats") {
              await handleGetStats(req as AuthenticatedRequest, res, requestId)
              resolve()
              return
            }
          }

          // All other routes require editor role
          await new Promise<void>((resolveAuth, rejectAuth) => {
            verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
              if (err) rejectAuth(err)
              else resolveAuth()
            })
          })

          // Route: GET /config/stop-list - Get stop list
          if (req.method === "GET" && path === "/config/stop-list") {
            await handleGetStopList(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: PUT /config/stop-list - Update stop list
          if (req.method === "PUT" && path === "/config/stop-list") {
            await handleUpdateStopList(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: POST /retry/:id - Retry failed queue item
          if (req.method === "POST" && path.startsWith("/retry/")) {
            const id = path.replace("/retry/", "")
            await handleRetryQueueItem(req as AuthenticatedRequest, res, requestId, id)
            resolve()
            return
          }

          // Route: DELETE /queue/:id - Delete queue item
          if (req.method === "DELETE" && path.startsWith("/queue/")) {
            const id = path.replace("/queue/", "")
            await handleDeleteQueueItem(req as AuthenticatedRequest, res, requestId, id)
            resolve()
            return
          }

          // Route: GET /config/ai-settings - Get AI settings
          if (req.method === "GET" && path === "/config/ai-settings") {
            await handleGetAISettings(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: PUT /config/ai-settings - Update AI settings
          if (req.method === "PUT" && path === "/config/ai-settings") {
            await handleUpdateAISettings(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: GET /config/queue-settings - Get queue settings
          if (req.method === "GET" && path === "/config/queue-settings") {
            await handleGetQueueSettings(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: PUT /config/queue-settings - Update queue settings
          if (req.method === "PUT" && path === "/config/queue-settings") {
            await handleUpdateQueueSettings(req as AuthenticatedRequest, res, requestId)
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
    logger.error("Unexpected error in job queue handler", {
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
 * POST /submit - Submit job to queue (auth required)
 */
async function handleSubmitJob(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = submitJobSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for job submission", {
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

    const { url, companyName = "", generationId } = value
    const userId = req.user!.uid

    logger.info("Processing job submission", {
      requestId,
      url,
      companyName,
      userId,
      hasGenerationId: !!generationId,
    })

    // Load stop list
    const stopList = await jobQueueService.loadStopList()

    // Check stop list
    const stopListCheck = jobQueueService.checkStopList(url, companyName, stopList)
    if (!stopListCheck.allowed) {
      logger.info("Job blocked by stop list", {
        requestId,
        url,
        reason: stopListCheck.reason,
      })

      res.status(200).json({
        success: true,
        data: {
          status: "skipped",
          message: stopListCheck.reason,
        },
        requestId,
      })
      return
    }

    // Check for duplicates in queue
    const queueDuplicate = await jobQueueService.checkQueueDuplicate(url)
    if (queueDuplicate) {
      logger.info("Job already in queue", { requestId, url })

      res.status(200).json({
        success: true,
        data: {
          status: "skipped",
          message: "Job already in processing queue",
        },
        requestId,
      })
      return
    }

    // Check if job already exists in job-matches
    const existingJob = await jobQueueService.checkExistingJob(url)
    if (existingJob) {
      logger.info("Job already analyzed", {
        requestId,
        url,
        jobId: existingJob.id,
      })

      res.status(200).json({
        success: true,
        data: {
          status: "skipped",
          message: "Job already analyzed",
          jobId: existingJob.id,
        },
        requestId,
      })
      return
    }

    // Add to queue (with optional generationId for pre-generated documents)
    const queueItem = await jobQueueService.submitJob(url, companyName, userId, generationId)

    res.status(201).json({
      success: true,
      data: {
        status: "success",
        message: generationId ? "Job submitted with pre-generated documents" : "Job submitted for processing",
        queueItemId: queueItem.id,
        queueItem,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to submit job", {
      error,
      requestId,
      userId: req.user?.uid,
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
 * GET /status/:id - Get queue item status (auth required, owner check)
 */
async function handleGetQueueStatus(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  id: string
): Promise<void> {
  try {
    logger.info("Getting queue status", {
      requestId,
      queueItemId: id,
      userId: req.user!.uid,
    })

    const queueItem = await jobQueueService.getQueueStatus(id)

    if (!queueItem) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Queue item not found",
        requestId,
      })
      return
    }

    // Verify user owns this submission
    if (queueItem.submitted_by !== req.user!.uid) {
      logger.warning("User attempted to access queue item they don't own", {
        requestId,
        queueItemId: id,
        ownerId: queueItem.submitted_by,
        requesterId: req.user!.uid,
      })

      const err = ERROR_CODES.FORBIDDEN
      res.status(err.status).json({
        success: false,
        error: "FORBIDDEN",
        errorCode: err.code,
        message: err.message,
        requestId,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        id: queueItem.id,
        status: queueItem.status,
        url: queueItem.url,
        company_name: queueItem.company_name,
        result_message: queueItem.result_message,
        error_details: queueItem.error_details,
        created_at: queueItem.created_at,
        updated_at: queueItem.updated_at,
        processed_at: queueItem.processed_at,
        completed_at: queueItem.completed_at,
        retry_count: queueItem.retry_count,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get queue status", {
      error,
      requestId,
      queueItemId: id,
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
 * GET /config/stop-list - Get stop list (auth required)
 */
async function handleGetStopList(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Getting stop list", {
      requestId,
      userEmail: req.user!.email,
    })

    const stopList = await jobQueueService.loadStopList()

    res.status(200).json({
      success: true,
      data: stopList,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get stop list", {
      error,
      requestId,
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
 * PUT /config/stop-list - Update stop list (auth required)
 */
async function handleUpdateStopList(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateStopListSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for stop list update", {
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

    logger.info("Updating stop list", {
      requestId,
      userEmail,
    })

    const stopList = await jobQueueService.updateStopList(value, userEmail)

    res.status(200).json({
      success: true,
      data: stopList,
      message: "Stop list updated successfully",
      requestId,
    })
  } catch (error) {
    logger.error("Failed to update stop list", {
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
 * GET /stats - Get queue statistics (auth required)
 */
async function handleGetStats(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Getting queue stats", {
      requestId,
      userEmail: req.user!.email,
    })

    const stats = await jobQueueService.getQueueStats()

    res.status(200).json({
      success: true,
      data: stats,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get queue stats", {
      error,
      requestId,
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
 * POST /retry/:id - Retry failed queue item (auth required)
 */
async function handleRetryQueueItem(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  id: string
): Promise<void> {
  try {
    logger.info("Retrying queue item", {
      requestId,
      queueItemId: id,
      userEmail: req.user!.email,
    })

    const success = await jobQueueService.retryQueueItem(id)

    if (!success) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND_OR_INVALID_STATUS",
        errorCode: err.code,
        message: "Queue item not found or status is not 'failed'",
        requestId,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Queue item reset to pending for retry",
        queueItemId: id,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to retry queue item", {
      error,
      requestId,
      queueItemId: id,
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
 * DELETE /queue/:id - Delete queue item (auth required)
 */
async function handleDeleteQueueItem(
  req: AuthenticatedRequest,
  res: Response,
  requestId: string,
  id: string
): Promise<void> {
  try {
    logger.info("Deleting queue item", {
      requestId,
      queueItemId: id,
      userEmail: req.user!.email,
    })

    const success = await jobQueueService.deleteQueueItem(id)

    if (!success) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Queue item not found",
        requestId,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Queue item deleted successfully",
        queueItemId: id,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to delete queue item", {
      error,
      requestId,
      queueItemId: id,
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
 * GET /config/ai-settings - Get AI settings (auth required)
 */
async function handleGetAISettings(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Getting AI settings", {
      requestId,
      userEmail: req.user!.email,
    })

    const settings = await jobQueueService.getAISettings()

    res.status(200).json({
      success: true,
      data: settings,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get AI settings", {
      error,
      requestId,
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
 * PUT /config/ai-settings - Update AI settings (auth required)
 */
async function handleUpdateAISettings(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateAISettingsSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for AI settings update", {
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

    logger.info("Updating AI settings", {
      requestId,
      userEmail,
    })

    const settings = await jobQueueService.updateAISettings(value, userEmail)

    res.status(200).json({
      success: true,
      data: settings,
      message: "AI settings updated successfully",
      requestId,
    })
  } catch (error) {
    logger.error("Failed to update AI settings", {
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
 * GET /config/queue-settings - Get queue settings (auth required)
 */
async function handleGetQueueSettings(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Getting queue settings", {
      requestId,
      userEmail: req.user!.email,
    })

    const settings = await jobQueueService.getPublicQueueSettings()

    res.status(200).json({
      success: true,
      data: settings,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get queue settings", {
      error,
      requestId,
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
 * PUT /config/queue-settings - Update queue settings (auth required)
 */
async function handleUpdateQueueSettings(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateQueueSettingsSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for queue settings update", {
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

    logger.info("Updating queue settings", {
      requestId,
      userEmail,
    })

    const settings = await jobQueueService.updateQueueSettings(value, userEmail)

    res.status(200).json({
      success: true,
      data: settings,
      message: "Queue settings updated successfully",
      requestId,
    })
  } catch (error) {
    logger.error("Failed to update queue settings", {
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
 * Export as Firebase HTTP Function (v2)
 *
 * Authorization: Uses Firebase Auth custom claims (role: 'editor')
 */
export const manageJobQueue = https.onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
    serviceAccount: "789847666726-compute@developer.gserviceaccount.com",
  },
  handleJobQueueRequest
)
