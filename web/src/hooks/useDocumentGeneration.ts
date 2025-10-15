/**
 * Custom hook for document generation
 *
 * Handles the complete document generation workflow:
 * - Initializes generation request
 * - Executes steps sequentially
 * - Tracks progress
 * - Returns download URLs
 *
 * Can be used from any component (DocumentBuilder, JobApplications, etc.)
 */

import { useState } from "react"
import { generatorClient } from "../api/generator-client"
import { logger } from "../utils/logger"
import type { GenerationType, AIProviderType, GenerationStep, GenerationRequest } from "../types/generator"
import type { JobMatch } from "../types/job-match"

export interface GenerationOptions {
  generateType: GenerationType
  provider: AIProviderType
  role: string
  company: string
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
  emphasize?: string[]
  jobMatchId?: string
}

export interface GenerationResult {
  status: GenerationRequest["status"]
  resumeUrl?: string
  coverLetterUrl?: string
  requestId?: string
  error?: string
}

export function useDocumentGeneration() {
  const [generating, setGenerating] = useState(false)
  const [steps, setSteps] = useState<GenerationStep[]>([])
  const [result, setResult] = useState<GenerationResult | null>(null)

  const startGeneration = async (options: GenerationOptions): Promise<GenerationResult> => {
    setGenerating(true)
    setResult(null)

    // Initialize steps based on generateType
    const initialSteps: GenerationStep[] = [
      {
        id: "fetch_data",
        name: "Fetch Experience Data",
        description: "Loading your experience entries and professional blurbs",
        status: "pending",
      },
    ]

    if (options.generateType === "resume" || options.generateType === "both") {
      initialSteps.push({
        id: "generate_resume",
        name: "Generate Resume Content",
        description: "Creating tailored resume content with AI",
        status: "pending",
      })
    }

    if (options.generateType === "coverLetter" || options.generateType === "both") {
      initialSteps.push({
        id: "generate_cover_letter",
        name: "Generate Cover Letter",
        description: "Writing personalized cover letter with AI",
        status: "pending",
      })
    }

    if (options.generateType === "resume" || options.generateType === "both") {
      initialSteps.push({
        id: "create_resume_pdf",
        name: "Create Resume PDF",
        description: "Rendering your resume as a professional PDF",
        status: "pending",
      })
    }

    if (options.generateType === "coverLetter" || options.generateType === "both") {
      initialSteps.push({
        id: "create_cover_letter_pdf",
        name: "Create Cover Letter PDF",
        description: "Rendering your cover letter as a PDF",
        status: "pending",
      })
    }

    initialSteps.push({
      id: "upload_documents",
      name: "Upload Documents",
      description: "Securely uploading PDFs to cloud storage",
      status: "pending",
    })

    setSteps(initialSteps)

    try {
      // Prepare request payload
      const payload = {
        generateType: options.generateType,
        provider: options.provider,
        job: {
          role: options.role.trim(),
          company: options.company.trim(),
          companyWebsite: options.companyWebsite?.trim() ?? undefined,
          jobDescriptionUrl: options.jobDescriptionUrl?.trim() ?? undefined,
          jobDescriptionText: options.jobDescriptionText?.trim() ?? undefined,
        },
        preferences: {
          emphasize: options.emphasize ?? [],
        },
        jobMatchId: options.jobMatchId,
      }

      logger.info("Starting document generation", payload)

      // Step 1: Initialize generation
      const startData = await generatorClient.startGeneration(payload)

      if (!startData?.requestId) {
        throw new Error("Failed to initialize generation: no request ID returned")
      }

      logger.info("Generation request initialized", { requestId: startData.requestId })

      let resumeUrl: string | undefined
      let coverLetterUrl: string | undefined

      // Step 2: Execute steps one by one
      let nextStep = startData.nextStep
      while (nextStep) {
        logger.info("Executing step", { step: nextStep })

        // Optimistically set step to in_progress
        setSteps((prevSteps) =>
          prevSteps.map((s) => (s.id === nextStep ? { ...s, status: "in_progress" as const } : s))
        )

        const stepResult = await generatorClient.executeStep(startData.requestId)
        logger.info("Step completed", stepResult)

        // Extract download URLs
        if (stepResult.resumeUrl) {
          resumeUrl = stepResult.resumeUrl
        }
        if (stepResult.coverLetterUrl) {
          coverLetterUrl = stepResult.coverLetterUrl
        }

        // Update step progress
        if (stepResult.steps) {
          setSteps(stepResult.steps)
        }

        // Check status
        if (stepResult.status === "completed") {
          logger.info("All steps completed")
          const successResult: GenerationResult = {
            status: "completed",
            resumeUrl,
            coverLetterUrl,
            requestId: startData.requestId,
          }
          setResult(successResult)
          setGenerating(false)
          return successResult
        } else if (stepResult.status === "failed") {
          logger.error("Generation failed", new Error("Step execution failed"))
          const failedResult: GenerationResult = {
            status: "failed",
            error: "Generation failed. Please try again.",
          }
          setResult(failedResult)
          setGenerating(false)
          return failedResult
        }

        // Move to next step
        nextStep = stepResult.nextStep
      }

      // If loop exits without status, generation is complete
      const completedResult: GenerationResult = {
        status: "completed",
        resumeUrl,
        coverLetterUrl,
        requestId: startData.requestId,
      }
      setResult(completedResult)
      setGenerating(false)
      return completedResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate documents"
      logger.error("Generation failed", err as Error)
      const errorResult: GenerationResult = {
        status: "failed",
        error: errorMessage,
      }
      setResult(errorResult)
      setGenerating(false)
      return errorResult
    }
  }

  const reset = () => {
    setGenerating(false)
    setSteps([])
    setResult(null)
  }

  return {
    generating,
    steps,
    result,
    startGeneration,
    reset,
  }
}

/**
 * Helper function to build generation options from a job match
 */
export function buildGenerationOptionsFromJobMatch(
  jobMatch: JobMatch,
  provider: AIProviderType = "gemini",
  generateType: GenerationType = "both"
): GenerationOptions {
  // Build keywords/emphasize field from multiple sources
  const keywordsArray: string[] = []

  if (jobMatch.matchedSkills && jobMatch.matchedSkills.length > 0) {
    keywordsArray.push(...jobMatch.matchedSkills)
  }

  if (jobMatch.keyStrengths && jobMatch.keyStrengths.length > 0) {
    keywordsArray.push(...jobMatch.keyStrengths)
  }

  if (jobMatch.keywords && jobMatch.keywords.length > 0) {
    keywordsArray.push(...jobMatch.keywords)
  }

  if (jobMatch.customizationRecommendations?.skills_to_emphasize) {
    keywordsArray.push(...jobMatch.customizationRecommendations.skills_to_emphasize)
  }

  // Deduplicate
  const emphasize = Array.from(new Set(keywordsArray))

  return {
    generateType,
    provider,
    role: jobMatch.role ?? jobMatch.title ?? "",
    company: jobMatch.company,
    companyWebsite: jobMatch.companyWebsite ?? undefined,
    jobDescriptionUrl: jobMatch.url ?? jobMatch.jobDescriptionUrl ?? undefined,
    jobDescriptionText: jobMatch.description ?? jobMatch.jobDescriptionText ?? undefined,
    emphasize,
    jobMatchId: jobMatch.id,
  }
}
