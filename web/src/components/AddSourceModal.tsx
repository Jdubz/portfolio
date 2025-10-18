import React, { useState } from "react"
import { Box, Text, Label, Input, Select } from "theme-ui"
import { Modal, ModalHeader, ModalBody, ModalFooter, InfoBox } from "./ui"
import { FormError } from "./FormError"
import { logger } from "../utils/logger"

interface AddSourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string, typeHint: string, companyName: string, autoEnable: boolean) => Promise<void>
}

type SourceTypeHint = "auto" | "greenhouse" | "workday" | "rss" | "generic"

/**
 * Modal for adding new job sources
 *
 * Sources can be:
 * - Company career pages (e.g., https://company.com/careers)
 * - Job boards (e.g., Indeed, LinkedIn jobs)
 * - ATS systems (Greenhouse, Workday)
 * - RSS feeds
 * - APIs
 *
 * Creates a queue item with type "source_discovery" that job-finder will process.
 */
export const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState("")
  const [typeHint, setTypeHint] = useState<SourceTypeHint>("auto")
  const [companyName, setCompanyName] = useState("")
  const [autoEnable, setAutoEnable] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!url.trim()) {
      setError("Source URL is required")
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(url.trim(), typeHint, companyName.trim(), autoEnable)

      // Reset form
      setUrl("")
      setTypeHint("auto")
      setCompanyName("")
      setAutoEnable(true)
      setError(null)
      onClose()

      logger.info("Source submitted for discovery", { url, typeHint, companyName, autoEnable })
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
      setUrl("")
      setTypeHint("auto")
      setCompanyName("")
      setAutoEnable(true)
      setError(null)
      onClose()
    }
  }

  const getTypeHintDescription = (type: SourceTypeHint) => {
    switch (type) {
      case "auto":
        return "Automatically detect the source type"
      case "greenhouse":
        return "Greenhouse ATS job board"
      case "workday":
        return "Workday ATS job board"
      case "rss":
        return "RSS feed of job postings"
      case "generic":
        return "Generic job board (will use AI to detect selectors)"
      default:
        return ""
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader title="Add New Job Source" onClose={handleClose} disableClose={isSubmitting} />

      <ModalBody>
        <Text sx={{ mb: 4, color: "textMuted", fontSize: 2 }}>
          Add a new job source for automated scraping. Sources can be company career pages, job boards, ATS systems, RSS
          feeds, or APIs.
        </Text>

        <form onSubmit={(e) => void handleSubmit(e)}>
          {/* Source URL */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="url" sx={{ mb: 2, fontWeight: "medium" }}>
              Source URL *
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/careers or https://boards.greenhouse.io/company"
              disabled={isSubmitting}
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 1, color: "textMuted", mt: 1 }}>
              URL to a careers page, job board, ATS system, RSS feed, or API endpoint
            </Text>
          </Box>

          {/* Source Type Hint */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="typeHint" sx={{ mb: 2, fontWeight: "medium" }}>
              Source Type
            </Label>
            <Select
              id="typeHint"
              value={typeHint}
              onChange={(e) => setTypeHint(e.target.value as SourceTypeHint)}
              disabled={isSubmitting}
              sx={{ variant: "forms.select" }}
            >
              <option value="auto">Auto-detect</option>
              <option value="greenhouse">Greenhouse ATS</option>
              <option value="workday">Workday ATS</option>
              <option value="rss">RSS Feed</option>
              <option value="generic">Generic (AI detection)</option>
            </Select>
            <Text sx={{ fontSize: 1, color: "textMuted", mt: 1 }}>{getTypeHintDescription(typeHint)}</Text>
          </Box>

          {/* Company Name (Optional) */}
          <Box sx={{ mb: 4 }}>
            <Label htmlFor="companyName" sx={{ mb: 2, fontWeight: "medium" }}>
              Company Name{" "}
              <Text as="span" sx={{ fontWeight: "normal", color: "textMuted" }}>
                (optional)
              </Text>
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
            <Text sx={{ fontSize: 1, color: "textMuted", mt: 1 }}>
              Only needed for company-specific sources. Leave blank for multi-company job boards.
            </Text>
          </Box>

          {/* Auto-Enable Checkbox */}
          <Box sx={{ mb: 4 }}>
            <Label sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoEnable}
                onChange={(e) => setAutoEnable(e.target.checked)}
                disabled={isSubmitting}
                style={{ marginRight: "8px" }}
              />
              <Text sx={{ fontSize: 2 }}>Auto-enable after successful discovery</Text>
            </Label>
            <Text sx={{ fontSize: 1, color: "textMuted", mt: 1, ml: "24px" }}>
              If unchecked, the source will be added but disabled until manually reviewed
            </Text>
          </Box>

          {/* Error Message */}
          {error && (
            <Box sx={{ mb: 4 }}>
              <FormError message={error} />
            </Box>
          )}

          {/* Info Box */}
          <Box sx={{ mb: 4 }}>
            <InfoBox variant="info">
              <Text sx={{ fontSize: 1, mb: 2 }}>
                <strong>How source discovery works:</strong>
              </Text>
              <Box as="ol" sx={{ pl: 4, m: 0, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  Job-finder fetches the URL and analyzes its structure
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  For known ATS types (Greenhouse, Workday), it validates the configuration
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  For generic sources, AI discovers the job listing selectors
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  A test scrape validates the configuration
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  If successful, the source is added to the job-sources collection
                </Box>
              </Box>
              <Text sx={{ fontSize: 1, mt: 2 }}>
                Track progress in the <strong>Queue Management</strong> tab.
              </Text>
            </InfoBox>
          </Box>
        </form>
      </ModalBody>

      <ModalFooter
        primaryAction={{
          label: isSubmitting ? "Submitting..." : "Discover Source",
          onClick: () => {
            const form = document.querySelector("form")
            if (form) {
              form.requestSubmit()
            }
          },
          loading: isSubmitting,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: handleClose,
        }}
      />
    </Modal>
  )
}
