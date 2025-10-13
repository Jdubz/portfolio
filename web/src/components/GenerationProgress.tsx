import React from "react"
import { Box, Flex, Text, Spinner } from "theme-ui"
import type { GenerationStep } from "../types/generator"

interface GenerationProgressProps {
  steps: GenerationStep[]
}

/**
 * Get meaningful completion message for each step
 */
const getCompletionMessage = (step: GenerationStep): string => {
  const duration = step.duration ? ` (${(step.duration / 1000).toFixed(1)}s)` : ""

  switch (step.id) {
    case "fetch_data":
      return `Successfully loaded your experience data${duration}`
    case "generate_resume":
      return `AI generated tailored resume content${duration}`
    case "generate_cover_letter":
      return `AI generated personalized cover letter${duration}`
    case "create_resume_pdf":
      return `Resume PDF created and ready${duration}`
    case "create_cover_letter_pdf":
      return `Cover letter PDF created and ready${duration}`
    case "upload_documents":
      return `Documents uploaded to cloud storage${duration}`
    default:
      return `Completed${duration}`
  }
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
export const GenerationProgress: React.FC<GenerationProgressProps> = ({ steps }) => {
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

              {/* Step Info - Show only one message at a time */}
              <Box sx={{ flex: 1 }}>
                <Text
                  sx={{
                    fontSize: 2,
                    fontWeight: step.status === "in_progress" ? "bold" : "normal",
                    color: getStepColor(step.status),
                    opacity: step.status === "skipped" ? 0.5 : 1,
                  }}
                >
                  {/* Before: step name | During: action description | After: completion message */}
                  {step.status === "pending" && step.name}
                  {step.status === "in_progress" && step.description}
                  {step.status === "completed" && getCompletionMessage(step)}
                  {step.status === "failed" && `Error: ${step.error?.message ?? "Failed"}`}
                  {step.status === "skipped" && `${step.name} (skipped)`}
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
