import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import Joi from "joi"
import { GeneratorService } from "./services/generator.service"
import { ExperienceService } from "./services/experience.service"
import { BlurbService } from "./services/blurb.service"
import { createAIProvider } from "./services/ai-provider.factory"
import { PDFService } from "./services/pdf.service"
import { verifyAuthenticatedEditor, type AuthenticatedRequest } from "./middleware/auth.middleware"
import { generatorRateLimiter, generatorEditorRateLimiter } from "./middleware/rate-limit.middleware"
import type { GenerationType, GeneratorResponse } from "./types/generator.types"
import { logger } from "./utils/logger"
import { generateRequestId } from "./utils/request-id"
import { corsHandler } from "./config/cors"
import { GENERATOR_ERROR_CODES as ERROR_CODES } from "./config/error-codes"
import { PACKAGE_VERSION } from "./config/versions"

// Initialize services
const generatorService = new GeneratorService(logger)
const experienceService = new ExperienceService(logger)
const blurbService = new BlurbService(logger)
const pdfService = new PDFService(logger)

// Validation schemas
const generateRequestSchema = Joi.object({
  generateType: Joi.string().valid("resume", "coverLetter", "both").required(),
  provider: Joi.string().valid("openai", "gemini").optional().default("gemini"),
  job: Joi.object({
    role: Joi.string().trim().min(1).max(200).required(),
    company: Joi.string().trim().min(1).max(200).required(),
    companyWebsite: Joi.string().uri().optional().allow(""),
    jobDescriptionUrl: Joi.string().uri().optional().allow(""),
    jobDescriptionText: Joi.string().trim().max(10000).optional().allow(""),
  }).required(),
  preferences: Joi.object({
    style: Joi.string().valid("modern", "traditional", "technical", "executive").optional(),
    emphasize: Joi.array().items(Joi.string()).optional(),
  }).optional(),
})

const updateDefaultsSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().max(50).optional().allow(""),
  location: Joi.string().trim().max(100).optional().allow(""),
  website: Joi.string().uri().optional().allow(""),
  github: Joi.string().uri().optional().allow(""),
  linkedin: Joi.string().uri().optional().allow(""),
  avatar: Joi.string().uri().optional().allow(""),
  logo: Joi.string().uri().optional().allow(""),
  accentColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  defaultStyle: Joi.string().valid("modern", "traditional", "technical", "executive").optional(),
})

/**
 * Main handler for generator requests
 */
const handleGeneratorRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = generateRequestId()

  try {
    // Handle CORS
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
              service: "manageGenerator",
              status: "healthy",
              version: PACKAGE_VERSION,
              timestamp: new Date().toISOString(),
            })
            resolve()
            return
          }

          // Route: POST /generator/generate - Generate documents (public, rate limited)
          if (req.method === "POST" && path === "/generator/generate") {
            // Check if user is authenticated (optional auth check, doesn't reject)
            let isAuthenticated = false
            try {
              await new Promise<void>((resolveAuth) => {
                verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
                  if (err) resolveAuth() // Auth failed, treat as unauthenticated
                  else {
                    isAuthenticated = true
                    resolveAuth()
                  }
                })
              })
            } catch {
              // Auth check failed, user is not authenticated
              isAuthenticated = false
            }

            // Apply appropriate rate limiting
            const rateLimiter = isAuthenticated ? generatorEditorRateLimiter : generatorRateLimiter
            await new Promise<void>((resolveRateLimit, rejectRateLimit) => {
              rateLimiter(req, res, (err) => {
                if (err) rejectRateLimit(err)
                else resolveRateLimit()
              })
            })

            await handleGenerate(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /generator/defaults - Get default settings (public)
          if (req.method === "GET" && path === "/generator/defaults") {
            await handleGetDefaults(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /generator/requests/:id - Get request status (public for polling)
          if (req.method === "GET" && path.startsWith("/generator/requests/")) {
            await handleGetRequest(req, res, requestId)
            resolve()
            return
          }

          // All other routes require authentication
          await new Promise<void>((resolveAuth, rejectAuth) => {
            verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
              if (err) rejectAuth(err)
              else resolveAuth()
            })
          })

          // Route: PUT /generator/defaults - Update defaults (auth required)
          if (req.method === "PUT" && path === "/generator/defaults") {
            await handleUpdateDefaults(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: GET /generator/requests - List requests (auth required)
          if (req.method === "GET" && path === "/generator/requests") {
            await handleListRequests(req as AuthenticatedRequest, res, requestId)
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
    logger.error("Unexpected error in generator handler", { error, requestId })
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
 * POST /generator/generate - Generate documents
 */
async function handleGenerate(req: Request, res: Response, requestId: string): Promise<void> {
  const startTime = Date.now()

  try {
    // Validate request body
    const { error, value } = generateRequestSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for generate", {
        error: error.details,
        requestId,
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

    const generateType: GenerationType = value.generateType
    const job = value.job
    const preferences = value.preferences
    const provider = value.provider // AI provider selection (openai or gemini)

    logger.info("Processing generation request", {
      requestId,
      generateType,
      role: job.role,
      company: job.company,
    })

    // Step 1: Fetch defaults
    const defaults = await generatorService.getDefaults()
    if (!defaults) {
      throw new Error("Generator defaults not found. Please seed the defaults document.")
    }

    // Step 2: Fetch experience data
    const [entries, blurbs] = await Promise.all([experienceService.listEntries(), blurbService.listBlurbs()])

    logger.info("Fetched experience data", {
      entriesCount: entries.length,
      blurbsCount: blurbs.length,
    })

    // Step 3: Create request document
    const generationRequestId = await generatorService.createRequest(
      generateType,
      job,
      defaults,
      {
        entries,
        blurbs,
      },
      preferences,
      requestId, // Use HTTP request ID as viewer session ID for now
      undefined, // editorEmail (undefined for now)
      provider // AI provider selection (openai or gemini, defaults to gemini)
    )

    // Update status to processing
    await generatorService.updateRequestStatus(generationRequestId, "processing")

    // Progress: Initializing
    await generatorService.updateProgress(generationRequestId, "initializing", "Initializing AI service...", 10)

    // Step 4: Initialize AI provider (OpenAI or Gemini)
    const aiProvider = await createAIProvider(provider || "gemini", logger)

    logger.info("AI provider initialized", {
      provider: aiProvider.providerType,
      model: aiProvider.model,
      requestId,
    })

    // Progress: Data fetched
    await generatorService.updateProgress(generationRequestId, "fetching_data", "Experience data loaded", 20)

    // Step 5: Generate documents based on type
    let resumeResult: Awaited<ReturnType<typeof aiProvider.generateResume>> | undefined
    let coverLetterResult: Awaited<ReturnType<typeof aiProvider.generateCoverLetter>> | undefined
    let resumePDF: Buffer | undefined
    let coverLetterPDF: Buffer | undefined

    try {
      // Prepare job description
      const jobDescription =
        job.jobDescriptionText || job.jobDescriptionUrl
          ? `${job.jobDescriptionText || ""}\n${job.jobDescriptionUrl ? `Job URL: ${job.jobDescriptionUrl}` : ""}`.trim()
          : undefined

      // Generate resume if requested
      if (generateType === "resume" || generateType === "both") {
        // Progress: Generating resume
        await generatorService.updateProgress(
          generationRequestId,
          "generating_resume",
          "Generating tailored resume content...",
          generateType === "both" ? 30 : 40
        )

        logger.info("Generating resume", { requestId })

        resumeResult = await aiProvider.generateResume({
          personalInfo: {
            name: defaults.name,
            email: defaults.email,
            phone: defaults.phone,
            location: defaults.location,
            website: defaults.website,
            github: defaults.github,
            linkedin: defaults.linkedin,
          },
          job: {
            role: job.role,
            company: job.company,
            companyWebsite: job.companyWebsite,
            jobDescription,
          },
          experienceEntries: entries,
          experienceBlurbs: blurbs,
          style: preferences?.style || defaults.defaultStyle,
          emphasize: preferences?.emphasize,
        })

        // Progress: Creating PDF
        await generatorService.updateProgress(
          generationRequestId,
          "creating_pdf",
          "Creating PDF document...",
          generateType === "both" ? 50 : 70
        )

        // Generate PDF
        resumePDF = await pdfService.generateResumePDF(
          resumeResult.content,
          preferences?.style || defaults.defaultStyle,
          defaults.accentColor
        )

        logger.info("Resume generated", {
          tokenUsage: resumeResult.tokenUsage,
          pdfSize: resumePDF.length,
        })
      }

      // Generate cover letter if requested
      if (generateType === "coverLetter" || generateType === "both") {
        // Progress: Generating cover letter
        await generatorService.updateProgress(
          generationRequestId,
          "generating_cover_letter",
          "Writing cover letter...",
          generateType === "both" ? 60 : 40
        )

        logger.info("Generating cover letter", { requestId })

        const jobDescription =
          job.jobDescriptionText || job.jobDescriptionUrl
            ? `${job.jobDescriptionText || ""}\n${job.jobDescriptionUrl ? `Job URL: ${job.jobDescriptionUrl}` : ""}`.trim()
            : undefined

        coverLetterResult = await aiProvider.generateCoverLetter({
          personalInfo: {
            name: defaults.name,
            email: defaults.email,
          },
          job: {
            role: job.role,
            company: job.company,
            companyWebsite: job.companyWebsite,
            jobDescription,
          },
          experienceEntries: entries,
          experienceBlurbs: blurbs,
        })

        // Progress: Creating PDF
        await generatorService.updateProgress(
          generationRequestId,
          "creating_pdf",
          "Creating PDF document...",
          generateType === "both" ? 80 : 70
        )

        // Generate PDF
        coverLetterPDF = await pdfService.generateCoverLetterPDF(
          coverLetterResult.content,
          defaults.name,
          defaults.email,
          defaults.accentColor
        )

        logger.info("Cover letter generated", {
          tokenUsage: coverLetterResult.tokenUsage,
          pdfSize: coverLetterPDF.length,
        })
      }

      // Progress: Finalizing
      await generatorService.updateProgress(generationRequestId, "finalizing", "Finalizing documents...", 95)

      // Calculate total metrics
      const durationMs = Date.now() - startTime
      const totalTokens =
        (resumeResult?.tokenUsage.totalTokens || 0) + (coverLetterResult?.tokenUsage.totalTokens || 0)
      const costUsd =
        (resumeResult ? aiProvider.calculateCost(resumeResult.tokenUsage) : 0) +
        (coverLetterResult ? aiProvider.calculateCost(coverLetterResult.tokenUsage) : 0)

      // Step 6: Create response document
      // Build result object without undefined values (Firestore doesn't allow them)
      const result: GeneratorResponse["result"] = {
        success: true,
      }

      if (resumeResult) {
        result.resume = resumeResult.content
      }

      if (coverLetterResult) {
        result.coverLetter = coverLetterResult.content
      }

      // Build metrics object without undefined values (Firestore doesn't allow them)
      const tokenUsage: {
        resumePrompt?: number
        resumeCompletion?: number
        coverLetterPrompt?: number
        coverLetterCompletion?: number
        total: number
      } = {
        total: totalTokens,
      }

      if (resumeResult) {
        tokenUsage.resumePrompt = resumeResult.tokenUsage.promptTokens
        tokenUsage.resumeCompletion = resumeResult.tokenUsage.completionTokens
      }

      if (coverLetterResult) {
        tokenUsage.coverLetterPrompt = coverLetterResult.tokenUsage.promptTokens
        tokenUsage.coverLetterCompletion = coverLetterResult.tokenUsage.completionTokens
      }

      await generatorService.createResponse(
        generationRequestId,
        result,
        {
          durationMs,
          tokenUsage,
          costUsd,
          model: resumeResult?.model || coverLetterResult?.model || aiProvider.model,
        }
      )

      // Update request status to completed
      await generatorService.updateRequestStatus(generationRequestId, "completed")

      logger.info("Generation completed successfully", {
        requestId,
        generationRequestId,
        durationMs,
        totalTokens,
        costUsd,
      })

      // Progress: Complete
      await generatorService.updateProgress(generationRequestId, "finalizing", "Complete!", 100)

      // Step 7: Return PDFs directly (Phase 1 MVP - no GCS yet)
      // For now, return base64 encoded PDFs
      res.status(200).json({
        success: true,
        data: {
          generationId: generationRequestId,
          responseId: generationRequestId.replace("request", "response"),
          metadata: {
            generatedAt: new Date().toISOString(),
            role: job.role,
            company: job.company,
            generateType,
            tokenUsage: {
              total: totalTokens,
            },
            costUsd,
            model: resumeResult?.model || coverLetterResult?.model || aiProvider.model,
            durationMs,
          },
          // Return PDFs as base64 for Phase 1 MVP
          resume: resumePDF ? resumePDF.toString("base64") : undefined,
          coverLetter: coverLetterPDF ? coverLetterPDF.toString("base64") : undefined,
        },
        requestId, // HTTP request ID for tracking
      })
    } catch (generationError) {
      // Generation failed - update status and create error response
      await generatorService.updateRequestStatus(generationRequestId, "failed")

      await generatorService.createResponse(
        generationRequestId,
        {
          success: false,
          error: {
            message: generationError instanceof Error ? generationError.message : String(generationError),
            stage: (provider === "openai" ? "openai_generation" : "gemini_generation") as
              | "openai_generation"
              | "gemini_generation",
          },
        },
        {
          durationMs: Date.now() - startTime,
          model: aiProvider.model,
        }
      )

      throw generationError
    }
  } catch (error) {
    logger.error("Failed to generate documents", { error, requestId })

    const errorMessage = error instanceof Error ? error.message : String(error)
    const isAIError = errorMessage.includes("OpenAI") || errorMessage.includes("Gemini") || errorMessage.includes("AI")
    const err = isAIError ? ERROR_CODES.OPENAI_ERROR : ERROR_CODES.INTERNAL_ERROR

    res.status(err.status).json({
      success: false,
      error: isAIError ? "AI_ERROR" : "INTERNAL_ERROR",
      errorCode: err.code,
      message: errorMessage,
      requestId,
    })
  }
}

/**
 * GET /generator/defaults - Get default settings
 */
async function handleGetDefaults(req: Request, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Getting generator defaults", { requestId })

    const defaults = await generatorService.getDefaults()

    if (!defaults) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Generator defaults not found",
        requestId,
      })
      return
    }

    res.status(200).json({
      success: true,
      data: defaults,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get defaults", { error, requestId })

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
 * GET /generator/requests/:id - Get request status (public for polling)
 */
async function handleGetRequest(req: Request, res: Response, requestId: string): Promise<void> {
  try {
    const path = req.path || req.url
    const generationRequestId = path.split("/").pop()

    if (!generationRequestId) {
      const err = ERROR_CODES.VALIDATION_FAILED
      res.status(err.status).json({
        success: false,
        error: "VALIDATION_FAILED",
        errorCode: err.code,
        message: "Request ID is required",
        requestId,
      })
      return
    }

    logger.info("Getting generation request", { requestId, generationRequestId })

    const request = await generatorService.getRequest(generationRequestId)

    if (!request) {
      const err = ERROR_CODES.NOT_FOUND
      res.status(err.status).json({
        success: false,
        error: "NOT_FOUND",
        errorCode: err.code,
        message: "Generation request not found",
        requestId,
      })
      return
    }

    // Return only status and progress information (don't leak full request details)
    res.status(200).json({
      success: true,
      data: {
        id: request.id,
        status: request.status,
        progress: request.progress,
        createdAt: request.createdAt,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to get request", { error, requestId })

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
 * PUT /generator/defaults - Update defaults (auth required)
 */
async function handleUpdateDefaults(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Validate request body
    const { error, value } = updateDefaultsSchema.validate(req.body)

    if (error) {
      logger.warning("Validation failed for update defaults", {
        error: error.details,
        requestId,
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

    logger.info("Updating generator defaults", {
      requestId,
      userEmail,
      fieldsToUpdate: Object.keys(value),
    })

    const defaults = await generatorService.updateDefaults(value, userEmail)

    res.status(200).json({
      success: true,
      data: defaults,
      requestId,
    })
  } catch (error) {
    logger.error("Failed to update defaults", { error, requestId })

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
 * GET /generator/requests - List requests (auth required)
 */
async function handleListRequests(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    logger.info("Listing generation requests", { requestId })

    const requests = await generatorService.listRequests({
      limit: 50,
    })

    res.status(200).json({
      success: true,
      data: {
        requests,
        count: requests.length,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to list requests", { error, requestId })

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
 */
export const manageGenerator = https.onRequest(
  {
    region: "us-central1",
    memory: "1GiB", // Higher for Puppeteer
    maxInstances: 10,
    timeoutSeconds: 300, // 5 minutes for generation
    secrets: ["openai-api-key", "gemini-api-key"],
    serviceAccount: "cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com",
  },
  handleGeneratorRequest
)

