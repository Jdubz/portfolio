import React, { useState } from "react"
import { Box, Button, Flex, Heading, Text, Label, Input } from "theme-ui"
import { logger } from "../utils/logger"

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (companyName: string, careersUrl: string) => Promise<void>
}

/**
 * Modal for adding new job sources
 *
 * Creates a queue item with type "company" that the job-finder will process
 * to create a new job source.
 */
export const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [companyName, setCompanyName] = useState("")
  const [careersUrl, setCareersUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!companyName.trim()) {
      setError("Company name is required")
      return
    }

    if (!careersUrl.trim()) {
      setError("Careers page URL is required")
      return
    }

    // Basic URL validation
    try {
      new URL(careersUrl)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(companyName.trim(), careersUrl.trim())

      // Reset form
      setCompanyName("")
      setCareersUrl("")
      setError(null)
      onClose()

      logger.info("Source submitted for processing", { companyName, careersUrl })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit source"
      setError(errorMessage)
      logger.error("Failed to submit source", err as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCompanyName("")
      setCareersUrl("")
      setError(null)
      onClose()
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        p: 3,
      }}
      onClick={handleClose}
    >
      <Box
        sx={{
          bg: "background",
          borderRadius: "md",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            p: 4,
            borderBottom: "1px solid",
            borderColor: "muted",
          }}
        >
          <Heading as="h2" sx={{ fontSize: 4 }}>
            Add New Job Source
          </Heading>
          <Button variant="secondary" onClick={handleClose} sx={{ fontSize: 2 }} disabled={isSubmitting}>
            ✕
          </Button>
        </Flex>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Text sx={{ mb: 4, color: "textMuted", fontSize: 2 }}>
            Add a new company career page to scrape for job opportunities. The job-finder will process this and add it
            to the sources list.
          </Text>

          <form onSubmit={(e) => void handleSubmit(e)}>
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
              />
            </Box>

            {/* Careers URL */}
            <Box sx={{ mb: 4 }}>
              <Label htmlFor="careersUrl" sx={{ mb: 2, fontWeight: "medium" }}>
                Careers Page URL *
              </Label>
              <Input
                id="careersUrl"
                type="url"
                value={careersUrl}
                onChange={(e) => setCareersUrl(e.target.value)}
                placeholder="https://example.com/careers"
                disabled={isSubmitting}
                sx={{ variant: "forms.input" }}
              />
              <Text sx={{ fontSize: 1, color: "textMuted", mt: 1 }}>
                The URL to the company&apos;s career/jobs page
              </Text>
            </Box>

            {/* Error Message */}
            {error && (
              <Box sx={{ mb: 4, p: 3, bg: "danger", color: "background", borderRadius: "sm" }}>
                <Text sx={{ fontWeight: "medium" }}>{error}</Text>
              </Box>
            )}

            {/* Info Box */}
            <Box sx={{ mb: 4, p: 3, bg: "highlight", borderRadius: "sm" }}>
              <Text sx={{ fontSize: 1 }}>
                <strong>Note:</strong> The job-finder will analyze this page, determine if it&apos;s scrapable, and add
                it to the sources list if valid. You can track progress in the Queue Management tab.
              </Text>
            </Box>

            {/* Actions */}
            <Flex sx={{ justifyContent: "flex-end", gap: 2 }}>
              <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Add Source"}
              </Button>
            </Flex>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
