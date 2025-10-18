import React, { useState } from "react"
import { Box, Text, Label, Input, Select } from "theme-ui"
import { Modal, ModalHeader, ModalBody, ModalFooter, InfoBox } from "./ui"
import { FormError } from "./FormError"
import { logger } from "../utils/logger"
import type { SubmitCompanyRequest } from "../types/job-queue"

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: SubmitCompanyRequest) => Promise<void>
}

/**
 * Modal for adding companies to the processing queue
 *
 * Allows editors to submit companies for analysis by the job-finder pipeline.
 * The company will go through: fetch → extract → analyze → save
 */
export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [companyName, setCompanyName] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [source, setSource] = useState<"manual_submission" | "user_request" | "automated_scan">("manual_submission")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // Validation
    if (!companyName.trim() || companyName.trim().length < 2) {
      setError("Company name must be at least 2 characters")
      return
    }

    if (!websiteUrl.trim()) {
      setError("Website URL is required")
      return
    }

    // Basic URL validation
    try {
      const url = new URL(websiteUrl)
      if (!url.protocol.startsWith("http")) {
        setError("Please enter a valid URL starting with http:// or https://")
        return
      }
    } catch {
      setError("Please enter a valid URL starting with http:// or https://")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        companyName: companyName.trim(),
        websiteUrl: websiteUrl.trim(),
        source,
      })

      // Show success message
      setSuccessMessage("Company submitted successfully! Check the Queue Management tab to monitor progress.")

      // Reset form after delay
      window.setTimeout(() => {
        setCompanyName("")
        setWebsiteUrl("")
        setSource("manual_submission")
        setError(null)
        setSuccessMessage(null)
        onClose()
      }, 2000)

      logger.info("Company submitted for processing", { companyName, websiteUrl, source })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit company"
      setError(errorMessage)
      logger.error("Failed to submit company", err as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCompanyName("")
      setWebsiteUrl("")
      setSource("manual_submission")
      setError(null)
      setSuccessMessage(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <ModalHeader title="Add Company to Queue" onClose={handleClose} disableClose={isSubmitting} />

      <ModalBody>
        <Text sx={{ mb: 4, color: "textMuted", fontSize: 2 }}>
          Submit a company for analysis. The job-finder will scrape company information, analyze the tech stack, and
          determine priority. View progress in the Queue Management tab.
        </Text>

        {successMessage && (
          <Box sx={{ mb: 3 }}>
            <InfoBox variant="success">{successMessage}</InfoBox>
          </Box>
        )}

        <form id="add-company-form" onSubmit={(e) => void handleSubmit(e)}>
          {/* Company Name */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="companyName" sx={{ mb: 2, fontWeight: "medium" }}>
              Company Name *
            </Label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
              required
            />
          </Box>

          {/* Website URL */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="websiteUrl" sx={{ mb: 2, fontWeight: "medium" }}>
              Website URL *
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
              required
            />
          </Box>

          {/* Source */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="source" sx={{ mb: 2, fontWeight: "medium" }}>
              Source
            </Label>
            <Select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              disabled={isSubmitting}
              sx={{ variant: "forms.select" }}
            >
              <option value="manual_submission">Manual Submission</option>
              <option value="user_request">User Request</option>
              <option value="automated_scan">Automated Scan</option>
            </Select>
            <Text sx={{ fontSize: 1, color: "textMuted", mt: 2 }}>How this company was discovered or requested</Text>
          </Box>

          {error && <FormError message={error} />}
        </form>
      </ModalBody>

      <ModalFooter
        primaryAction={{
          label: "Submit Company",
          onClick: () => {
            const form = document.getElementById("add-company-form") as HTMLFormElement
            if (form) {
              form.requestSubmit()
            }
          },
          loading: isSubmitting,
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
