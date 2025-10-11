import React, { useState } from "react"
import { Box, Heading, Text, Button, Input, Label, Textarea, Spinner, Alert, Flex, Select } from "theme-ui"
import { type HeadFC } from "gatsby"
import Seo from "../components/homepage/Seo"
import { logger } from "../utils/logger"

/**
 * Type definitions for Resume Generator API
 */
interface GenerationMetadata {
  company: string
  role: string
  model: string
  tokenUsage?: {
    total: number
  }
  costUsd?: number
  durationMs: number
}

interface GenerationResponse {
  success: boolean
  message?: string
  error?: string
  resume?: string
  coverLetter?: string
  metadata?: GenerationMetadata
}

type GenerateType = "resume" | "coverLetter" | "both"

/**
 * Resume Builder MVP Page
 *
 * Simple UI to test the AI Resume Generator
 * Uses default settings only (no editing in MVP)
 */
const ResumeBuilderPage: React.FC = () => {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [generateType, setGenerateType] = useState<GenerateType>("both")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState("")
  const [jobDescriptionText, setJobDescriptionText] = useState("")
  const [emphasize, setEmphasize] = useState("")

  // Generated files
  const [resumePDF, setResumePDF] = useState<string | null>(null)
  const [coverLetterPDF, setCoverLetterPDF] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    setSuccess(false)
    setResumePDF(null)
    setCoverLetterPDF(null)
    setMetadata(null)

    try {
      // Prepare request payload
      const payload = {
        generateType,
        job: {
          role: role.trim(),
          company: company.trim(),
          companyWebsite: companyWebsite.trim() || undefined,
          jobDescriptionUrl: jobDescriptionUrl.trim() || undefined,
          jobDescriptionText: jobDescriptionText.trim() || undefined,
        },
        preferences: {
          emphasize: emphasize
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        },
      }

      logger.info("Submitting generation request", payload)

      // Call the generator endpoint
      const apiUrl = process.env.GATSBY_API_URL ?? "http://localhost:5001/static-sites-257923/us-central1"
      const response = await fetch(`${apiUrl}/manageGenerator/generator/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as GenerationResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? data.error ?? "Generation failed")
      }

      logger.info("Generation successful", data as unknown as Record<string, unknown>)

      // Store the base64 PDFs (data is wrapped in data.data per API contract)
      const responseData = (data as { data?: { resume?: string; coverLetter?: string; metadata?: GenerationMetadata } })
        .data
      if (responseData?.resume) {
        setResumePDF(responseData.resume)
      }
      if (responseData?.coverLetter) {
        setCoverLetterPDF(responseData.coverLetter)
      }

      if (responseData?.metadata) {
        setMetadata(responseData.metadata)
      }
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate documents"
      setError(errorMessage)
      logger.error("Generation failed", err as Error)
    } finally {
      setGenerating(false)
    }
  }

  const downloadPDF = (base64: string, filename: string) => {
    try {
      // Convert base64 to blob
      // eslint-disable-next-line no-undef
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      logger.info("PDF downloaded", { filename })
    } catch (err) {
      logger.error("Failed to download PDF", err as Error)
      setError("Failed to download PDF")
    }
  }

  return (
    <Box
      sx={{
        maxWidth: "800px",
        mx: "auto",
        px: 3,
        py: 5,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Heading as="h1" sx={{ fontSize: [4, 5, 6], mb: 2 }}>
          AI Resume Generator (MVP)
        </Heading>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          Generate tailored resumes and cover letters using AI. This is a test interface for Phase 1.
        </Text>
      </Box>

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
            value={generateType}
            onChange={(e) => setGenerateType(e.target.value as GenerateType)}
            disabled={generating}
            required
          >
            <option value="both">Resume + Cover Letter</option>
            <option value="resume">Resume Only</option>
            <option value="coverLetter">Cover Letter Only</option>
          </Select>
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
            value={role}
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
            value={company}
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
            value={companyWebsite}
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
            value={jobDescriptionUrl}
            onChange={(e) => setJobDescriptionUrl(e.target.value)}
            disabled={generating}
          />
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>
            OpenAI will fetch and analyze the job description from this URL
          </Text>
        </Box>

        {/* Job Description Text (Optional) */}
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="jobDescriptionText">Or Paste Job Description (Optional)</Label>
          <Textarea
            id="jobDescriptionText"
            placeholder="Paste the job description here..."
            rows={6}
            value={jobDescriptionText}
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
            value={emphasize}
            onChange={(e) => setEmphasize(e.target.value)}
            disabled={generating}
          />
          <Text sx={{ fontSize: 0, color: "text", opacity: 0.6, mt: 1 }}>Comma-separated list of keywords</Text>
        </Box>

        {/* Submit Button */}
        <Button type="submit" disabled={generating} sx={{ width: "100%" }}>
          {generating ? (
            <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
              <Spinner size={20} sx={{ mr: 2 }} />
              Generating... (this may take 30-60 seconds)
            </Flex>
          ) : (
            "Generate Documents"
          )}
        </Button>
      </Box>

      {/* Results */}
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      {(resumePDF || coverLetterPDF) && (
        <Box
          sx={{
            bg: "background",
            p: 4,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "muted",
          }}
        >
          <Heading as="h2" sx={{ fontSize: 3, mb: 3 }}>
            Generated Documents
          </Heading>

          {/* Metadata */}
          {metadata && (
            <Box sx={{ mb: 3, p: 3, bg: "muted", borderRadius: "4px" }}>
              <Text sx={{ fontSize: 1, fontFamily: "monospace" }}>
                <strong>Company:</strong> {metadata.company}
                <br />
                <strong>Role:</strong> {metadata.role}
                <br />
                <strong>Model:</strong> {metadata.model}
                <br />
                <strong>Tokens:</strong> {metadata.tokenUsage?.total ?? "N/A"}
                <br />
                <strong>Cost:</strong> ${metadata.costUsd?.toFixed(4) ?? "N/A"}
                <br />
                <strong>Duration:</strong> {(metadata.durationMs / 1000).toFixed(2)}s
              </Text>
            </Box>
          )}

          {/* Download Buttons */}
          <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
            {resumePDF && (
              <Button
                onClick={() =>
                  downloadPDF(resumePDF, `${company.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}_Resume.pdf`)
                }
                variant="secondary"
              >
                📄 Download Resume
              </Button>
            )}
            {coverLetterPDF && (
              <Button
                onClick={() =>
                  downloadPDF(
                    coverLetterPDF,
                    `${company.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}_CoverLetter.pdf`
                  )
                }
                variant="secondary"
              >
                📝 Download Cover Letter
              </Button>
            )}
          </Flex>
        </Box>
      )}

      {/* Footer Note */}
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "4px" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> This is a Phase 1 MVP test interface. The generator uses your default personal settings
          from Firestore and pulls experience data from the experience page. Generated PDFs are returned directly (not
          stored in GCS yet).
        </Text>
      </Box>
    </Box>
  )
}

export default ResumeBuilderPage

export const Head: HeadFC = () => (
  <Seo title="Resume Builder (MVP)" description="AI-powered resume and cover letter generator - MVP test interface" />
)
