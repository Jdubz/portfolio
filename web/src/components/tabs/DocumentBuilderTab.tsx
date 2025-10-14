import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Input, Label, Textarea, Spinner, Alert, Flex, Select } from "theme-ui"
import { doc, onSnapshot } from "firebase/firestore"
import { logger } from "../../utils/logger"
import { generatorClient } from "../../api/generator-client"
import { useResumeForm } from "../../contexts/ResumeFormContext"
import { getFirestoreInstance } from "../../utils/firestore"
import { GenerationProgress } from "../GenerationProgress"
import type {
  GenerationType,
  GenerationMetadata,
  AIProviderType,
  GenerationRequest,
  GenerationStep,
} from "../../types/generator"

interface DocumentBuilderTabProps {
  isEditor: boolean
}

export const DocumentBuilderTab: React.FC<DocumentBuilderTabProps> = ({ isEditor }) => {
  // Get form state from context
  const {
    formState,
    setGenerateType,
    setAIProvider,
    setRole,
    setCompany,
    setCompanyWebsite,
    setJobDescriptionUrl,
    setJobDescriptionText,
    setEmphasize,
    clearForm,
    isFormEmpty,
  } = useResumeForm()

  // UI state (not persisted in context)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Generation progress tracking
  const [generationRequestId, setGenerationRequestId] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<GenerationRequest["status"] | null>(null)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])

  // Load AI provider preference from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("aiProvider") as AIProviderType | null
    if (savedProvider === "openai" || savedProvider === "gemini") {
      setAIProvider(savedProvider)
    }
  }, [setAIProvider])

  // Save AI provider preference to localStorage when it changes
  const handleProviderChange = (provider: AIProviderType) => {
    setAIProvider(provider)
    localStorage.setItem("aiProvider", provider)
    logger.info("AI provider changed", { provider })
  }

  // Firestore listener for real-time progress updates
  useEffect(() => {
    if (!generationRequestId) {
      return
    }

    logger.info("Setting up Firestore listener for generation progress", { generationRequestId })

    try {
      const db = getFirestoreInstance()
      const requestRef = doc(db, "generator", generationRequestId)

      const unsubscribe = onSnapshot(
        requestRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const request = snapshot.data() as GenerationRequest
            setGenerationStatus(request.status)
            setGenerationSteps(request.steps ?? [])

            logger.info("Generation progress updated", {
              generationRequestId,
              status: request.status,
              stepsCount: request.steps?.length ?? 0,
            })

            // Extract download URLs from completed steps
            const steps = request.steps ?? []
            for (const step of steps) {
              if (step.status === "completed" && step.result) {
                if (step.result.resumeUrl) {
                  setResumeUrl((prev) => prev ?? step.result?.resumeUrl ?? null)
                  setUrlExpiresIn("7 days") // PDFs uploaded in steps use 7-day expiry
                  logger.info("Resume URL extracted from step", { stepId: step.id })
                }
                if (step.result.coverLetterUrl) {
                  setCoverLetterUrl((prev) => prev ?? step.result?.coverLetterUrl ?? null)
                  setUrlExpiresIn("7 days")
                  logger.info("Cover letter URL extracted from step", { stepId: step.id })
                }
              }
            }

            // Check if generation is complete
            if (request.status === "completed") {
              setGenerating(false)
              setSuccess(true)
              logger.info("Generation completed", { generationRequestId })
            } else if (request.status === "failed") {
              setGenerating(false)
              setError("Generation failed. Please try again.")
              logger.error("Generation failed", new Error("Generation status: failed"), { generationRequestId })
            }
          } else {
            logger.warn("Generation request document not found", { generationRequestId })
          }
        },
        (err) => {
          logger.error("Firestore listener error", err, { generationRequestId })
          // Don't stop generation on listener errors - they might be transient
        }
      )

      return () => {
        logger.info("Cleaning up Firestore listener", { generationRequestId })
        unsubscribe()
      }
    } catch (err) {
      logger.error("Failed to set up Firestore listener", err as Error, { generationRequestId })
    }
  }, [generationRequestId])

  // Generated files (Phase 2.2: now using URLs instead of base64)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null)
  const [urlExpiresIn, setUrlExpiresIn] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    setSuccess(false)
    setResumeUrl(null)
    setCoverLetterUrl(null)
    setUrlExpiresIn(null)
    setMetadata(null)
    setGenerationRequestId(null)
    setGenerationStatus("pending")

    // Initialize steps immediately based on generateType
    const initialSteps: GenerationStep[] = [
      {
        id: "fetch_data",
        name: "Fetch Experience Data",
        description: "Loading your experience entries and professional blurbs",
        status: "pending",
      },
    ]

    if (formState.generateType === "resume" || formState.generateType === "both") {
      initialSteps.push({
        id: "generate_resume",
        name: "Generate Resume Content",
        description: "Creating tailored resume content with AI",
        status: "pending",
      })
    }

    if (formState.generateType === "coverLetter" || formState.generateType === "both") {
      initialSteps.push({
        id: "generate_cover_letter",
        name: "Generate Cover Letter",
        description: "Writing personalized cover letter with AI",
        status: "pending",
      })
    }

    if (formState.generateType === "resume" || formState.generateType === "both") {
      initialSteps.push({
        id: "create_resume_pdf",
        name: "Create Resume PDF",
        description: "Rendering your resume as a professional PDF",
        status: "pending",
      })
    }

    if (formState.generateType === "coverLetter" || formState.generateType === "both") {
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

    setGenerationSteps(initialSteps)

    try {
      // Prepare request payload using formState
      const payload = {
        generateType: formState.generateType,
        provider: formState.aiProvider,
        job: {
          role: formState.role.trim(),
          company: formState.company.trim(),
          companyWebsite: formState.companyWebsite.trim() || undefined,
          jobDescriptionUrl: formState.jobDescriptionUrl.trim() || undefined,
          jobDescriptionText: formState.jobDescriptionText.trim() || undefined,
        },
        preferences: {
          emphasize: formState.emphasize
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        },
      }

      logger.info("Submitting multi-step generation request", payload)

      // Step 1: Initialize generation
      const startData = await generatorClient.startGeneration(payload)
      logger.info("Generation initialized", startData)

      if (!startData?.requestId) {
        throw new Error("Failed to initialize generation: no request ID returned")
      }

      // Set generation request ID for Firestore listener
      setGenerationRequestId(startData.requestId)
      logger.info("Set generation request ID for tracking", { generationId: startData.requestId })

      // Step 2: Execute steps one by one until complete or failed
      let nextStep = startData.nextStep
      while (nextStep) {
        logger.info("Executing step", { step: nextStep })

        const stepResult = await generatorClient.executeStep(startData.requestId)
        logger.info("Step completed", stepResult)

        // Check status
        if (stepResult.status === "completed") {
          logger.info("All steps completed")
          setSuccess(true)
          break
        }

        // Move to next step
        nextStep = stepResult.nextStep
      }

      // Note: Download URLs and metadata will be updated by the Firestore listener
      // when it receives the completed step updates with result.resumeUrl / result.coverLetterUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate documents"
      setError(errorMessage)
      logger.error("Generation failed", err as Error)
      setGenerating(false) // Stop generating on error
    }
    // Note: Don't set setGenerating(false) here - let the Firestore listener handle it when status becomes 'completed' or 'failed'
  }

  const downloadFromUrl = (url: string, filename: string) => {
    try {
      // Create download link for signed URL (Phase 2.2)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.target = "_blank" // Open in new tab as fallback
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      logger.info("PDF download initiated", { filename })
    } catch (err) {
      logger.error("Failed to download PDF", err as Error)
      setError("Failed to download PDF")
    }
  }

  return (
    <Box>
      {/* Editor Benefits */}
      {!isEditor && (
        <Box sx={{ mb: 3, p: 3, bg: "muted", borderRadius: "4px" }}>
          <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
            <strong>Sign in for editor features:</strong> Higher rate limits (20 vs 10 requests/15min), 7-day download
            links, document history, and personal info defaults.
          </Text>
        </Box>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && !error && (
        <Alert variant="success" sx={{ mb: 3 }}>
          ✓ Documents generated successfully! Download them below.
        </Alert>
      )}

      {/* Form */}
      <Box
        as="form"
        onSubmit={(e: React.FormEvent) => {
          void handleSubmit(e)
        }}
        sx={{
          bg: "background",
          p: 4,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "muted",
          mb: 4,
        }}
      >
        {/* Generation Type */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="generateType">What would you like to generate?</Label>
          <Select
            id="generateType"
            value={formState.generateType}
            onChange={(e) => setGenerateType(e.target.value as GenerationType)}
            disabled={generating}
            required
          >
            <option value="both">Resume + Cover Letter</option>
            <option value="resume">Resume Only</option>
            <option value="coverLetter">Cover Letter Only</option>
          </Select>
        </Box>

        {/* AI Provider Selection */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="aiProvider">AI Provider</Label>
          <Select
            id="aiProvider"
            value={formState.aiProvider}
            onChange={(e) => handleProviderChange(e.target.value as AIProviderType)}
            disabled={generating}
            required
          >
            <option value="gemini">Gemini (Recommended - 96% cheaper, $0.0006/generation)</option>
            <option value="openai">OpenAI GPT-4o ($0.015/generation)</option>
          </Select>
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>
            {formState.aiProvider === "gemini"
              ? "✨ Gemini 2.0 Flash: Fast, accurate, and cost-effective"
              : "🚀 GPT-4o: Premium quality, higher cost"}
          </Text>
        </Box>

        {/* Role */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="role">
            Job Title / Role <Text sx={{ color: "error" }}>*</Text>
          </Label>
          <Input
            id="role"
            type="text"
            placeholder="e.g., Senior Full-Stack Engineer"
            value={formState.role}
            onChange={(e) => setRole(e.target.value)}
            disabled={generating}
            required
          />
        </Box>

        {/* Company */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="company">
            Company <Text sx={{ color: "error" }}>*</Text>
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="e.g., Google"
            value={formState.company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={generating}
            required
          />
        </Box>

        {/* Company Website (Optional) */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="companyWebsite">Company Website (Optional)</Label>
          <Input
            id="companyWebsite"
            type="url"
            placeholder="https://example.com"
            value={formState.companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            disabled={generating}
          />
        </Box>

        {/* Job Description URL (Optional) */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="jobDescriptionUrl">Job Description URL (Optional)</Label>
          <Input
            id="jobDescriptionUrl"
            type="url"
            placeholder="https://example.com/jobs/123"
            value={formState.jobDescriptionUrl}
            onChange={(e) => setJobDescriptionUrl(e.target.value)}
            disabled={generating}
          />
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>
            The AI will fetch and analyze the job description from this URL
          </Text>
        </Box>

        {/* Job Description Text (Optional) */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="jobDescriptionText">Or Paste Job Description (Optional)</Label>
          <Textarea
            id="jobDescriptionText"
            placeholder="Paste the job description here..."
            rows={6}
            value={formState.jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            disabled={generating}
          />
        </Box>

        {/* Keywords to Emphasize (Optional) */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="emphasize">Keywords to Emphasize (Optional)</Label>
          <Input
            id="emphasize"
            type="text"
            placeholder="TypeScript, React, Node.js, AWS"
            value={formState.emphasize}
            onChange={(e) => setEmphasize(e.target.value)}
            disabled={generating}
          />
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>Comma-separated list of keywords</Text>
        </Box>

        {/* Action Buttons */}
        <Flex sx={{ gap: 2 }}>
          <Button type="submit" disabled={generating} sx={{ flex: 1 }}>
            {generating ? (
              <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
                <Spinner size={20} sx={{ mr: 2 }} />
                Generating... (this may take 30-60 seconds)
              </Flex>
            ) : (
              "Generate Documents"
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              clearForm()
              logger.info("Form cleared")
            }}
            disabled={generating || isFormEmpty()}
            variant="secondary"
            sx={{ flexShrink: 0 }}
          >
            Clear Form
          </Button>
        </Flex>
      </Box>

      {/* Generation Progress - Show checklist persistently during and after generation */}
      {generationSteps.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Heading as="h2" sx={{ fontSize: 3, mb: 3 }}>
            {generationStatus === "completed" ? "Generation Complete" : "Generation Progress"}
          </Heading>
          <GenerationProgress steps={generationSteps} />

          {/* Download buttons below checklist */}
          {(resumeUrl ?? coverLetterUrl) && (
            <Box sx={{ mt: 3 }}>
              <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
                {resumeUrl && (
                  <Button
                    onClick={() =>
                      downloadFromUrl(
                        resumeUrl,
                        `${formState.company.replace(/\s+/g, "_")}_${formState.role.replace(/\s+/g, "_")}_Resume.pdf`
                      )
                    }
                    variant="primary"
                  >
                    📄 Download Resume
                  </Button>
                )}
                {coverLetterUrl && (
                  <Button
                    onClick={() =>
                      downloadFromUrl(
                        coverLetterUrl,
                        `${formState.company.replace(/\s+/g, "_")}_${formState.role.replace(/\s+/g, "_")}_CoverLetter.pdf`
                      )
                    }
                    variant="primary"
                  >
                    📝 Download Cover Letter
                  </Button>
                )}
              </Flex>
            </Box>
          )}
        </Box>
      )}

      {/* Metadata section (optional, shown below checklist) */}
      {metadata && generationSteps.length > 0 && (
        <Box sx={{ mt: 3, p: 3, bg: "muted", borderRadius: "4px" }}>
          <Text sx={{ fontSize: 1, fontFamily: "monospace" }}>
            <strong>Model:</strong> {metadata.model} | <strong>Tokens:</strong> {metadata.tokenUsage?.total ?? "N/A"} |{" "}
            <strong>Cost:</strong> ${metadata.costUsd?.toFixed(4) ?? "N/A"} | <strong>Duration:</strong>{" "}
            {(metadata.durationMs / 1000).toFixed(2)}s
            {urlExpiresIn && (
              <>
                {" "}
                | <strong>Link expires:</strong> {urlExpiresIn}
              </>
            )}
          </Text>
        </Box>
      )}

      {/* Footer Note */}
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "4px" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> Generated documents are stored in Google Cloud Storage and automatically moved to
          Coldline storage after 90 days for cost optimization. Download links expire after{" "}
          {urlExpiresIn ?? "1 hour (viewers) or 7 days (authenticated editors)"}.
        </Text>
      </Box>
    </Box>
  )
}
