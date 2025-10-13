import React from "react"
import { Box, Flex, Text, Button, Spinner } from "theme-ui"
import type { GenerationStep } from "../types/generator"

interface GenerationProgressProps {
  steps: GenerationStep[]
  onDownload?: (url: string, filename: string) => void
}

/**
 * GenerationProgress - Checklist UI for document generation progress
 *
 * Shows each step as:
 * - [ ] Empty checkbox (pending)
 * - ⏳ Spinner (in_progress)
 * - ✓ Green checkmark (completed)
 * - ✗ Red X (failed)
 *
 * Enables early download: PDFs can be downloaded as soon as their step completes,
 * even if other steps are still in progress.
 */
export const GenerationProgress: React.FC<GenerationProgressProps> = ({ steps, onDownload }) => {
  const getStepIcon = (status: GenerationStep["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Box
            sx={{
              width: "20px",
              height: "20px",
              border: "2px solid",
              borderColor: "muted",
              borderRadius: "4px",
            }}
          />
        )
      case "in_progress":
        return <Spinner size={20} sx={{ color: "primary" }} />
      case "completed":
        return (
          <Flex
            sx={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              bg: "success",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ✓
          </Flex>
        )
      case "failed":
        return (
          <Flex
            sx={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              bg: "error",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ✗
          </Flex>
        )
      case "skipped":
        return (
          <Box
            sx={{
              width: "20px",
              height: "20px",
              border: "2px solid",
              borderColor: "muted",
              borderRadius: "4px",
              opacity: 0.5,
            }}
          />
        )
      default:
        return null
    }
  }

  const getStepColor = (status: GenerationStep["status"]) => {
    switch (status) {
      case "completed":
        return "success"
      case "failed":
        return "error"
      case "in_progress":
        return "primary"
      case "pending":
      case "skipped":
      default:
        return "text"
    }
  }

  const handleDownload = (url: string, stepId: string) => {
    const filename = stepId.includes("resume") ? "resume.pdf" : "cover_letter.pdf"

    if (onDownload) {
      onDownload(url, filename)
    } else {
      // Default behavior: open in new tab
      window.open(url, "_blank")
    }
  }

  return (
    <Box
      sx={{
        bg: "background",
        p: 4,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "muted",
      }}
    >
      <Flex sx={{ flexDirection: "column", gap: 3 }}>
        {steps.map((step) => (
          <Box key={step.id}>
            <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
              {/* Icon */}
              <Box sx={{ pt: "2px" }}>{getStepIcon(step.status)}</Box>

              {/* Step Info */}
              <Box sx={{ flex: 1 }}>
                <Text
                  sx={{
                    fontSize: 2,
                    fontWeight: step.status === "in_progress" ? "bold" : "normal",
                    color: getStepColor(step.status),
                    opacity: step.status === "skipped" ? 0.5 : 1,
                  }}
                >
                  {step.name}
                </Text>
                <Text
                  sx={{
                    fontSize: 1,
                    color: "textMuted",
                    opacity: step.status === "skipped" ? 0.5 : 0.8,
                    mt: 1,
                  }}
                >
                  {step.description}
                </Text>

                {/* Show duration if completed */}
                {step.status === "completed" && step.duration && (
                  <Text sx={{ fontSize: 0, color: "success", mt: 1, opacity: 0.7 }}>
                    ✓ Completed in {(step.duration / 1000).toFixed(1)}s
                  </Text>
                )}

                {/* Show error if failed */}
                {step.status === "failed" && step.error && (
                  <Text sx={{ fontSize: 1, color: "error", mt: 1 }}>
                    Error: {step.error.message}
                  </Text>
                )}

                {/* Early download buttons - show as soon as URL is available */}
                {step.result?.resumeUrl && (
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(step.result!.resumeUrl!, step.id)}
                    sx={{ mt: 2, fontSize: 1, py: 1, px: 3 }}
                  >
                    📄 Download Resume
                  </Button>
                )}

                {step.result?.coverLetterUrl && (
                  <Button
                    variant="secondary"
                    onClick={() => handleDownload(step.result!.coverLetterUrl!, step.id)}
                    sx={{ mt: 2, ml: step.result?.resumeUrl ? 2 : 0, fontSize: 1, py: 1, px: 3 }}
                  >
                    📄 Download Cover Letter
                  </Button>
                )}
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
