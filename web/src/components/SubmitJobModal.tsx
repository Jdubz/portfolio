import React, { useState } from "react"
import { Box, Text, Label, Input } from "theme-ui"
import { Modal, ModalHeader, ModalBody, ModalFooter, InfoBox } from "./ui"
import { logger } from "../utils/logger"

interface SubmitJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { url: string; companyName: string; companyUrl: string }) => Promise<void>
}

/**
 * Modal for submitting jobs to the processing queue
 *
 * Allows users to submit job postings for automated analysis.
 * The job will go through: fetch → extract → analyze → match → save
 */
export const SubmitJobModal: React.FC<SubmitJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [jobUrl, setJobUrl] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyUrl, setCompanyUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validation
    if (!jobUrl.trim()) {
      setError("Job URL is required")
      return
    }

    if (!companyName.trim() || companyName.trim().length < 2) {
      setError("Company name must be at least 2 characters")
      return
    }

    if (!companyUrl.trim()) {
      setError("Company URL is required")
      return
    }

    // Basic URL validation for job URL
    try {
      const url = new URL(jobUrl)
      if (!url.protocol.startsWith("http")) {
        setError("Job URL must start with http:// or https://")
        return
      }
    } catch {
      setError("Please enter a valid job URL starting with http:// or https://")
      return
    }

    // Basic URL validation for company URL
    try {
      const url = new URL(companyUrl)
      if (!url.protocol.startsWith("http")) {
        setError("Company URL must start with http:// or https://")
        return
      }
    } catch {
      setError("Please enter a valid company URL starting with http:// or https://")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        url: jobUrl.trim(),
        companyName: companyName.trim(),
        companyUrl: companyUrl.trim(),
      })

      // Show success message
      setSuccessMessage("Job submitted successfully! Check the Job Applications tab to see the match results.")

      // Reset form after delay
      window.setTimeout(() => {
        setJobUrl("")
        setCompanyName("")
        setCompanyUrl("")
        setError(null)
        setSuccessMessage(null)
        onClose()
      }, 2000)

      logger.info("Job submitted for processing", { jobUrl, companyName, companyUrl })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit job"
      setError(errorMessage)
      logger.error("Failed to submit job", err as Error, { jobUrl, companyName, companyUrl })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setJobUrl("")
      setCompanyName("")
      setCompanyUrl("")
      setError(null)
      setSuccessMessage(null)
      onClose()
    }
  }

  const handlePrimaryAction = () => {
    const form = document.querySelector("form")
    if (form) {
      form.requestSubmit()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader title="Submit Job to Queue" onClose={handleClose} />

      <ModalBody>
        <Text sx={{ mb: 4, color: "textMuted" }}>
          Submit job postings to the automated processing queue. The system will analyze, extract details, and match
          against your resume.
        </Text>

        <Box as="form" onSubmit={handleSubmit}>
          {/* Job URL Field */}
          <Box sx={{ mb: 3 }}>
            <Label htmlFor="job-url" sx={{ fontSize: 2, fontWeight: "medium", mb: 2, display: "block" }}>
              Job URL{" "}
              <Text as="span" sx={{ color: "danger" }}>
                *
              </Text>
            </Label>
            <Input
              id="job-url"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://example.com/jobs/12345"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
              required
            />
          </Box>

          {/* Company Name Field */}
          <Box sx={{ mb: 3 }}>
            <Label htmlFor="company-name" sx={{ fontSize: 2, fontWeight: "medium", mb: 2, display: "block" }}>
              Company Name{" "}
              <Text as="span" sx={{ color: "danger" }}>
                *
              </Text>
            </Label>
            <Input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Corp"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
              required
            />
          </Box>

          {/* Company URL Field */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="company-url" sx={{ fontSize: 2, fontWeight: "medium", mb: 2, display: "block" }}>
              Company Website{" "}
              <Text as="span" sx={{ color: "danger" }}>
                *
              </Text>
            </Label>
            <Input
              id="company-url"
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
              required
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>The company&apos;s main website or careers page</Text>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Box sx={{ mb: 3 }}>
              <InfoBox variant="success">{successMessage}</InfoBox>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Box sx={{ mb: 3 }}>
              <InfoBox variant="danger">{error}</InfoBox>
            </Box>
          )}
        </Box>
      </ModalBody>

      <ModalFooter
        primaryAction={{
          label: isSubmitting ? "Submitting..." : "Submit to Queue",
          onClick: handlePrimaryAction,
          disabled: isSubmitting,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleClose,
          disabled: isSubmitting,
        }}
      />
    </Modal>
  )
}
