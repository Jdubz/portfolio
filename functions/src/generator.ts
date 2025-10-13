/**
 * Resume & Cover Letter Generator Cloud Function
 *
 * Supports both OpenAI and Gemini AI providers with optional authentication
 * for tiered rate limiting.
 *
 * Features:
 * - Multi-provider AI (OpenAI GPT-4o, Google Gemini 2.0 Flash)
 * - PDF generation with custom branding
 * - GCS storage with signed URLs
 * - Firestore tracking and document history
 * - Rate limiting (10 viewer / 20 editor requests per 15min)
 * - Custom AI prompt management
 * - Avatar/logo upload with image validation
 *
 * Documentation:
 * - Overview: docs/development/generator/README.md
 * - Schema: docs/development/generator/SCHEMA.md
 * - Common Mistakes: docs/development/COMMON_MISTAKES.md
 */

import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import Joi from "joi"
import busboy from "busboy"
import type { Readable } from "stream"
import { GeneratorService } from "./services/generator.service"
import { ExperienceService } from "./services/experience.service"
import { BlurbService } from "./services/blurb.service"
import { createAIProvider } from "./services/ai-provider.factory"
import { PDFService } from "./services/pdf.service"
import { StorageService } from "./services/storage.service"
import {
  createInitialSteps,
  startStep,
  completeStep,
} from "./utils/generation-steps"
import { verifyAuthenticatedEditor, checkOptionalAuth, type AuthenticatedRequest } from "./middleware/auth.middleware"
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
const storageService = new StorageService(undefined, logger) // Use environment-aware bucket selection

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
            // Check if user is authenticated (optional, doesn't reject if not)
            const isAuthenticated = await checkOptionalAuth(req as AuthenticatedRequest, logger)

            // Apply appropriate rate limiting based on auth status
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

          // Route: POST /generator/upload-image - Upload avatar/logo (auth required)
          if (req.method === "POST" && path === "/generator/upload-image") {
            await handleUploadImage(req as AuthenticatedRequest, res, requestId)
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

    // Step 3: Create request document with initial steps
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

    // Initialize step tracking
    let steps = createInitialSteps(generateType)
    await generatorService.updateSteps(generationRequestId, steps)
    await generatorService.updateStatus(generationRequestId, "processing")

    // Step 1: Start fetch_data
    steps = startStep(steps, "fetch_data")

    // Step 4: Initialize AI provider (OpenAI or Gemini)
    const aiProvider = await createAIProvider(provider || "gemini", logger)

    logger.info("AI provider initialized", {
      provider: aiProvider.providerType,
      model: aiProvider.model,
      requestId,
    })

    // Complete fetch_data step
    steps = completeStep(steps, "fetch_data")
    await generatorService.updateSteps(generationRequestId, steps)

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
        // Start generate_resume step
        steps = startStep(steps, "generate_resume")
        await generatorService.updateSteps(generationRequestId, steps)

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
          emphasize: preferences?.emphasize,
          customPrompts: defaults.aiPrompts?.resume,
        })

        // Complete generate_resume step
        steps = completeStep(steps, "generate_resume")
        await generatorService.updateSteps(generationRequestId, steps)

        // Start create_resume_pdf step
        steps = startStep(steps, "create_resume_pdf")
        await generatorService.updateSteps(generationRequestId, steps)

        // Generate PDF (always use "modern" style)
        resumePDF = await pdfService.generateResumePDF(resumeResult.content, "modern", defaults.accentColor)

        logger.info("Resume generated", {
          tokenUsage: resumeResult.tokenUsage,
          pdfSize: resumePDF.length,
        })
      }

      // Generate cover letter if requested
      if (generateType === "coverLetter" || generateType === "both") {
        // Start generate_cover_letter step
        steps = startStep(steps, "generate_cover_letter")
        await generatorService.updateSteps(generationRequestId, steps)

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
          customPrompts: defaults.aiPrompts?.coverLetter,
        })

        // Complete generate_cover_letter step
        steps = completeStep(steps, "generate_cover_letter")
        await generatorService.updateSteps(generationRequestId, steps)

        // Start create_cover_letter_pdf step
        steps = startStep(steps, "create_cover_letter_pdf")
        await generatorService.updateSteps(generationRequestId, steps)

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

      // Step 5: Upload PDFs to GCS
      type UploadResult = Awaited<ReturnType<typeof storageService.uploadPDF>>
      let resumeUploadResult: UploadResult | undefined
      let coverLetterUploadResult: UploadResult | undefined
      let resumeSignedUrl: string | undefined
      let coverLetterSignedUrl: string | undefined

      // Check if user is an editor (for signed URL expiry)
      const isEditor = await checkOptionalAuth(req as AuthenticatedRequest, logger)
      const expiresInHours = isEditor ? 168 : 1 // 7 days (168 hours) for editors, 1 hour for viewers

      // Generate filename-safe strings
      const companySafe = job.company.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      const roleSafe = job.role.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

      // Start upload_documents step
      steps = startStep(steps, "upload_documents")
      await generatorService.updateSteps(generationRequestId, steps)

      if (resumePDF) {
        const filename = `${companySafe}_${roleSafe}_resume_${timestamp}.pdf`
        resumeUploadResult = await storageService.uploadPDF(resumePDF, filename, "resume")

        // Generate signed URL
        resumeSignedUrl = await storageService.generateSignedUrl(resumeUploadResult.gcsPath, { expiresInHours })

        logger.info("Resume uploaded to GCS", { gcsPath: resumeUploadResult.gcsPath, expiresInHours })

        // Complete create_resume_pdf step with download URL (enables early download!)
        steps = completeStep(steps, "create_resume_pdf", { resumeUrl: resumeSignedUrl })
        await generatorService.updateSteps(generationRequestId, steps)
      }

      if (coverLetterPDF) {
        const filename = `${companySafe}_${roleSafe}_cover_letter_${timestamp}.pdf`
        coverLetterUploadResult = await storageService.uploadPDF(coverLetterPDF, filename, "cover-letter")

        // Generate signed URL
        coverLetterSignedUrl = await storageService.generateSignedUrl(coverLetterUploadResult.gcsPath, { expiresInHours })

        logger.info("Cover letter uploaded to GCS", { gcsPath: coverLetterUploadResult.gcsPath, expiresInHours })

        // Complete create_cover_letter_pdf step with download URL (enables early download!)
        steps = completeStep(steps, "create_cover_letter_pdf", { coverLetterUrl: coverLetterSignedUrl })
        await generatorService.updateSteps(generationRequestId, steps)
      }

      // Complete upload_documents step
      steps = completeStep(steps, "upload_documents")
      await generatorService.updateSteps(generationRequestId, steps)

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

      // Build files object for GCS storage information
      const files: GeneratorResponse["files"] = {}

      if (resumeUploadResult && resumeSignedUrl) {
        files.resume = {
          gcsPath: resumeUploadResult.gcsPath,
          signedUrl: resumeSignedUrl,
          signedUrlExpiry: new Date(Date.now() + expiresInHours * 60 * 60 * 1000) as any, // Will be converted to Firestore Timestamp
          size: resumeUploadResult.size,
          storageClass: resumeUploadResult.storageClass,
        }
      }

      if (coverLetterUploadResult && coverLetterSignedUrl) {
        files.coverLetter = {
          gcsPath: coverLetterUploadResult.gcsPath,
          signedUrl: coverLetterSignedUrl,
          signedUrlExpiry: new Date(Date.now() + expiresInHours * 60 * 60 * 1000) as any, // Will be converted to Firestore Timestamp
          size: coverLetterUploadResult.size,
          storageClass: coverLetterUploadResult.storageClass,
        }
      }

      await generatorService.createResponse(
        generationRequestId,
        result,
        {
          durationMs,
          tokenUsage,
          costUsd,
          model: resumeResult?.model || coverLetterResult?.model || aiProvider.model,
        },
        files
      )

      // Update request status to completed
      await generatorService.updateStatus(generationRequestId, "completed")

      logger.info("Generation completed successfully", {
        requestId,
        generationRequestId,
        durationMs,
        totalTokens,
        costUsd,
      })

      // Step 6: Return signed URLs for GCS downloads
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
          // Return signed URLs for downloads (Phase 2.2)
          resumeUrl: resumeSignedUrl,
          coverLetterUrl: coverLetterSignedUrl,
          // Include expiry information
          urlExpiresIn: isEditor ? "7 days" : "1 hour",
        },
        requestId, // HTTP request ID for tracking
      })
    } catch (generationError) {
      // Generation failed - update status and create error response
      await generatorService.updateStatus(generationRequestId, "failed")

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
        steps: request.steps,
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
 * POST /generator/upload-image - Upload avatar or logo image (auth required)
 */
async function handleUploadImage(req: AuthenticatedRequest, res: Response, requestId: string): Promise<void> {
  try {
    // Parse multipart/form-data
    const bb = busboy({ headers: req.headers })

    let imageType: "avatar" | "logo" | null = null
    let fileBuffer: Buffer | null = null
    let filename: string | null = null
    let contentType: string | null = null

    await new Promise<void>((resolve, reject) => {
      let finished = false
      const filePromises: Promise<void>[] = []

      const cleanup = () => {
        req.removeListener("error", onReqError)
        req.removeListener("close", onReqClose)
        bb.removeListener("close", onClose)
        bb.removeListener("error", onBbError)
      }

      bb.on("field", (fieldname: string, val: string) => {
        if (fieldname === "imageType" && (val === "avatar" || val === "logo")) {
          imageType = val
        }
      })

      bb.on("file", (fieldname: string, file: Readable, info: { filename: string; mimeType: string }) => {
        const chunks: Buffer[] = []

        // Create promise for this file that resolves when file stream ends
        const filePromise = new Promise<void>((resolveFile, rejectFile) => {
          file.on("data", (chunk: Buffer) => {
            chunks.push(chunk)
          })

          file.on("end", () => {
            fileBuffer = Buffer.concat(chunks)
            filename = info.filename
            contentType = info.mimeType
            resolveFile()
          })

          file.on("error", (err: Error) => {
            rejectFile(err)
          })
        })

        filePromises.push(filePromise)
      })

      // Use 'close' instead of 'finish' - it fires after all streams are done
      const onClose = () => {
        if (!finished) {
          finished = true
          cleanup()

          // Wait for all file streams to complete before resolving
          Promise.all(filePromises)
            .then(() => resolve())
            .catch((err) => reject(err))
        }
      }

      const onBbError = (err: Error) => {
        if (!finished) {
          finished = true
          cleanup()
          reject(err)
        }
      }

      const onReqError = (err: Error) => {
        if (!finished) {
          finished = true
          cleanup()
          reject(new Error(`Request error: ${err.message}`))
        }
      }

      const onReqClose = () => {
        if (!finished) {
          finished = true
          cleanup()
          reject(new Error("Request stream closed prematurely"))
        }
      }

      bb.on("close", onClose)
      bb.on("error", onBbError)
      req.on("error", onReqError)
      req.on("close", onReqClose)

      req.pipe(bb)
    })

    // Validate inputs
    if (!imageType || !fileBuffer || !filename || !contentType) {
      const err = ERROR_CODES.VALIDATION_FAILED
      res.status(err.status).json({
        success: false,
        error: "VALIDATION_FAILED",
        errorCode: err.code,
        message: "Missing required fields: imageType, file",
        requestId,
      })
      return
    }

    const userEmail = req.user!.email

    // TypeScript needs help understanding these are not null after validation
    const validFileBuffer = fileBuffer as Buffer
    const validFilename = filename as string
    const validContentType = contentType as string
    const validImageType = imageType as "avatar" | "logo"

    logger.info("Uploading image", {
      requestId,
      userEmail,
      imageType: validImageType,
      filename: validFilename,
      contentType: validContentType,
      size: validFileBuffer.length,
    })

    // Generate unique filename
    const timestamp = Date.now()
    const ext = validFilename.split(".").pop() || "jpg"
    const uniqueFilename = `${validImageType}-${timestamp}.${ext}`

    // Upload to GCS
    const uploadResult = await storageService.uploadImage(validFileBuffer, uniqueFilename, validImageType, validContentType)

    // Generate signed URL for immediate use
    const signedUrl = await storageService.generateSignedUrl(uploadResult.gcsPath, { expiresInHours: 24 * 365 }) // 1 year

    // Update defaults with new image URL
    const updateData = validImageType === "avatar" ? { avatar: signedUrl } : { logo: signedUrl }
    await generatorService.updateDefaults(updateData, userEmail)

    res.status(200).json({
      success: true,
      data: {
        imageType: validImageType,
        url: signedUrl,
        gcsPath: uploadResult.gcsPath,
        size: uploadResult.size,
      },
      requestId,
    })
  } catch (error) {
    logger.error("Failed to upload image", { error, requestId })

    const err = ERROR_CODES.INTERNAL_ERROR
    res.status(err.status).json({
      success: false,
      error: "IMAGE_UPLOAD_FAILED",
      errorCode: err.code,
      message: error instanceof Error ? error.message : "Failed to upload image",
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

