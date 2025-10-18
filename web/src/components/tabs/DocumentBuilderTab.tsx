import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Input, Label, Textarea, Spinner, Alert, Flex, Select } from "theme-ui"
import { logger } from "../../utils/logger"
import { generatorClient } from "../../api/generator-client"
import { jobQueueClient } from "../../api"
import { useResumeForm } from "../../contexts/ResumeFormContext"
import { GenerationProgress } from "../GenerationProgress"
import { useAuth } from "../../hooks/useAuth"
import { useAuthRequired } from "../../hooks/useAuthRequired"
import { SignInModal } from "../SignInModal"
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
  const { user } = useAuth()

  // Auth required hook for consistent sign-in UX
  const { isModalOpen, signingIn, authError, hideSignInModal, handleSignIn, withAuth } = useAuthRequired({
    message:
      "Sign in to generate AI-powered documents. Authenticated users get higher rate limits (20 vs 10 requests/15min), 7-day download links, and document history.",
    title: "Sign In to Generate Documents",
  })

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
  const [generationStatus, setGenerationStatus] = useState<GenerationRequest["status"] | null>(null)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])

  // Load AI provider preference from localStorage on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem("aiProvider") as AIProviderType | null
    if (savedProvider === "openai" || savedProvider === "gemini") {
      setAIProvider(savedProvider)
    } else {
      // Default to OpenAI if no preference saved
      setAIProvider("openai")
    }
  }, [setAIProvider])

  // Save AI provider preference to localStorage when it changes
  const handleProviderChange = (provider: AIProviderType) => {
    setAIProvider(provider)
    localStorage.setItem("aiProvider", provider)
    logger.info("AI provider changed", { provider })
  }

  // Generated files (Phase 2.2: now using URLs instead of base64)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [coverLetterUrl, setCoverLetterUrl] = useState<string | null>(null)
  const [urlExpiresIn, setUrlExpiresIn] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Use withAuth to ensure user is signed in before proceeding
    await withAuth(async () => {
      setGenerating(true)
      setError(null)
      setSuccess(false)
      setResumeUrl(null)
      setCoverLetterUrl(null)
      setUrlExpiresIn(null)
      setMetadata(null)
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

        logger.info("Generation request initialized", { requestId: startData.requestId })

        // Step 2: Execute steps one by one until complete or failed
        let nextStep = startData.nextStep
        while (nextStep) {
          logger.info("Executing step", { step: nextStep })

          // Optimistically set step to in_progress before calling API
          // This ensures the user sees the spinner immediately
          setGenerationSteps((prevSteps) =>
            prevSteps.map((s) => (s.id === nextStep ? { ...s, status: "in_progress" as const } : s))
          )

          const stepResult = await generatorClient.executeStep(startData.requestId)
          logger.info("Step completed", stepResult)

          // Extract download URLs from step result
          if (stepResult.resumeUrl) {
            setResumeUrl(stepResult.resumeUrl)
            setUrlExpiresIn("7 days")
            logger.info("Resume URL received from API", { url: stepResult.resumeUrl })
          }
          if (stepResult.coverLetterUrl) {
            setCoverLetterUrl(stepResult.coverLetterUrl)
            setUrlExpiresIn("7 days")
            logger.info("Cover letter URL received from API", { url: stepResult.coverLetterUrl })
          }

          // Update step progress in UI
          if (stepResult.steps) {
            setGenerationSteps(stepResult.steps)
          }

          // Check status
          if (stepResult.status === "completed") {
            logger.info("All steps completed")
            setGenerationStatus("completed")
            setSuccess(true)
            setGenerating(false)
            break
          } else if (stepResult.status === "failed") {
            logger.error("Generation failed", new Error("Step execution failed"))
            setGenerationStatus("failed")
            setError("Generation failed. Please try again.")
            setGenerating(false)
            break
          }

          // Move to next step
          nextStep = stepResult.nextStep
        }

        // If loop exits without setting status, generation is complete
        if (nextStep === undefined) {
          setGenerationStatus("completed")
          setSuccess(true)
          setGenerating(false)
        }

        // After successful generation, automatically submit to queue if job URL is provided
        if (user && formState.jobDescriptionUrl && formState.companyWebsite && startData.requestId) {
          try {
            const queueResult = await jobQueueClient.submitJob({
              url: formState.jobDescriptionUrl.trim(),
              companyName: formState.company.trim(),
              companyUrl: formState.companyWebsite.trim(),
              generationId: startData.requestId, // Link to the generation request
            })
            logger.info("Job automatically submitted to queue with generation ID", {
              queueItemId: queueResult.queueItemId,
              generationId: startData.requestId,
            })
          } catch (queueErr) {
            const err = queueErr instanceof Error ? queueErr : new Error(String(queueErr))
            logger.warn("Failed to auto-submit to queue after generation", { error: err.message })
            // Don't show error to user - queue submission is automatic but not critical
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate documents"
        setError(errorMessage)
        logger.error("Generation failed", err as Error)
        setGenerating(false)
        setGenerationStatus("failed")
      }
    })
  }

  const downloadFromUrl = (url: string, filename: string) => {
    try {
      // Create download link for public URL
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
        <Box sx={{ mb: 3, p: 3, bg: "muted", borderRadius: "sm" }}>
          <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
            <strong>Sign in for editor features:</strong> Higher rate limits (20 vs 10 requests/15min), 7-day download
            links, document history, and personal info defaults.
          </Text>
        </Box>
      )}

      {/* Error Alert */}
      {(error || authError) && (
        <Alert variant="error" sx={{ mb: 3 }}>
          {error || authError}
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
          borderRadius: "md",
          border: "1px solid",
          borderColor: "muted",
          mb: 4,
        }}
      >
        {/* Generation Type */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="generateType" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            What would you like to generate?
          </Label>
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
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="aiProvider" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            AI Provider
          </Label>
          <Select
            id="aiProvider"
            value={formState.aiProvider}
            onChange={(e) => handleProviderChange(e.target.value as AIProviderType)}
            disabled={generating}
            required
          >
            <option value="openai">OpenAI GPT-4o (Recommended)</option>
            <option value="gemini">Gemini 2.0 Flash</option>
          </Select>
          <Text sx={{ fontSize: 1, color: "textMuted", mt: 2, lineHeight: 1.5 }}>
            {formState.aiProvider === "openai"
              ? "🚀 Premium quality, reliable results (~$0.015/generation)"
              : "⚠️ Cost-effective but produces inferior results"}
          </Text>
        </Box>

        {/* Role */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="role" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
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
            sx={{ fontSize: 2 }}
          />
        </Box>

        {/* Company */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="company" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
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
            sx={{ fontSize: 2 }}
          />
        </Box>

        {/* Company Website (Required) */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="companyWebsite" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            Company Website <Text sx={{ color: "error" }}>*</Text>
          </Label>
          <Input
            id="companyWebsite"
            type="url"
            placeholder="https://example.com"
            value={formState.companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            disabled={generating}
            required
            sx={{ fontSize: 2 }}
          />
          <Text sx={{ fontSize: 1, color: "textMuted", mt: 2, lineHeight: 1.5 }}>
            Required for company intake pipeline and job tracking
          </Text>
        </Box>

        {/* Job Description URL (Optional) */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="jobDescriptionUrl" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            Job Description URL (Optional)
          </Label>
          <Input
            id="jobDescriptionUrl"
            type="url"
            placeholder="https://example.com/jobs/123"
            value={formState.jobDescriptionUrl}
            onChange={(e) => setJobDescriptionUrl(e.target.value)}
            disabled={generating}
            sx={{ fontSize: 2 }}
          />
          <Text sx={{ fontSize: 1, color: "textMuted", mt: 2, lineHeight: 1.5 }}>
            The AI will fetch and analyze the job description from this URL
          </Text>
        </Box>

        {/* Job Description Text (Optional) */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="jobDescriptionText" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            Or Paste Job Description (Optional)
          </Label>
          <Textarea
            id="jobDescriptionText"
            placeholder="Paste the job description here..."
            rows={6}
            value={formState.jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            disabled={generating}
            sx={{ fontSize: 2, lineHeight: 1.6 }}
          />
        </Box>

        {/* Keywords to Emphasize (Optional) */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="emphasize" sx={{ mb: 2, display: "block", fontWeight: "medium" }}>
            Keywords to Emphasize (Optional)
          </Label>
          <Input
            id="emphasize"
            type="text"
            sx={{ fontSize: 2 }}
            placeholder="TypeScript, React, Node.js, AWS"
            value={formState.emphasize}
            onChange={(e) => setEmphasize(e.target.value)}
            disabled={generating}
          />
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>Comma-separated list of keywords</Text>
        </Box>

        {/* Info about automatic queue submission */}
        {formState.jobDescriptionUrl && formState.companyWebsite && (
          <Box sx={{ mb: 3, p: 2, bg: "muted", borderRadius: "sm" }}>
            <Text sx={{ fontSize: 1, color: "textMuted" }}>
              ℹ️ This job will be automatically added to the Job Finder queue for tracking and analysis
            </Text>
          </Box>
        )}

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
          <Heading as="h2" sx={{ fontSize: 3, mb: 3, color: "primary" }}>
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
        <Box sx={{ mt: 3, p: 3, bg: "muted", borderRadius: "sm" }}>
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
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "sm" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> Generated documents are stored in Google Cloud Storage and automatically moved to
          Coldline storage after 90 days for cost optimization. Download links expire after{" "}
          {urlExpiresIn ?? "1 hour (viewers) or 7 days (authenticated editors)"}.
        </Text>
      </Box>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isModalOpen}
        onClose={hideSignInModal}
        onSignIn={handleSignIn}
        title="Sign In to Generate Documents"
        message="Sign in to generate AI-powered documents. Authenticated users get higher rate limits (20 vs 10 requests/15min), 7-day download links, and document history."
        signingIn={signingIn}
      />
    </Box>
  )
}
