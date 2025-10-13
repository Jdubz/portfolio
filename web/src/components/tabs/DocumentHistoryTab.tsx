import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Flex, Alert, Spinner, Badge } from "theme-ui"
import type { GenerationRequest } from "../../types/generator"
import { logger } from "../../utils/logger"

interface DocumentHistoryTabProps {
  isEditor: boolean
}

export const DocumentHistoryTab: React.FC<DocumentHistoryTabProps> = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests] = useState<GenerationRequest[]>([])

  // Load generation history
  useEffect(() => {
    const loadHistory = () => {
      try {
        setLoading(true)
        setError(null)

        // For now, show a placeholder message
        // In the future, we'll implement the actual API call to fetch generation requests
        setLoading(false)
      } catch (err) {
        logger.error("Failed to load document history", err as Error, {
          component: "DocumentHistoryTab",
          action: "loadHistory",
        })
        setError(err instanceof Error ? err.message : "Failed to load document history")
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: GenerationRequest["status"]): string => {
    switch (status) {
      case "completed":
        return "success"
      case "failed":
        return "error"
      case "processing":
        return "warning"
      case "pending":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <Box>
        <Flex sx={{ justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spinner size={48} />
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          View your document generation history. This tab is only visible to editors.
        </Text>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* History List */}
      {requests.length === 0 ? (
        <Box
          sx={{
            bg: "background",
            p: 5,
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "muted",
            textAlign: "center",
          }}
        >
          <Text sx={{ fontSize: 2, color: "text", opacity: 0.7 }}>
            No document generation history found. Generate your first document in the Document Builder tab!
          </Text>
        </Box>
      ) : (
        <Box>
          {requests.map((request) => (
            <Box
              key={request.id}
              sx={{
                bg: "background",
                p: 4,
                mb: 3,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "muted",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Heading as="h3" sx={{ fontSize: 3, mb: 1, color: "primary" }}>
                    {request.job.role}
                  </Heading>
                  <Text sx={{ fontSize: 2, color: "text", opacity: 0.8 }}>{request.job.company}</Text>
                </Box>
                <Badge variant={getStatusColor(request.status)} sx={{ textTransform: "capitalize" }}>
                  {request.status}
                </Badge>
              </Flex>

              <Box sx={{ mb: 3 }}>
                <Text sx={{ fontSize: 1, color: "text", opacity: 0.7 }}>
                  Generated: {formatDate(request.createdAt)}
                </Text>
                {request.completedAt && (
                  <Text sx={{ fontSize: 1, color: "text", opacity: 0.7, ml: 3 }}>
                    Completed: {formatDate(request.completedAt)}
                  </Text>
                )}
              </Box>

              {/* Progress display removed - now using steps */}

              {request.error && (
                <Alert variant="error" sx={{ mb: 3, fontSize: 1 }}>
                  {request.error}
                </Alert>
              )}

              <Flex sx={{ gap: 2 }}>
                <Badge variant="secondary" sx={{ fontSize: 0 }}>
                  {request.generateType}
                </Badge>
                {request.job.jobDescriptionUrl && (
                  <Badge variant="secondary" sx={{ fontSize: 0 }}>
                    Job URL Provided
                  </Badge>
                )}
              </Flex>
            </Box>
          ))}
        </Box>
      )}

      {/* Info Box */}
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "4px" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> This feature is currently under development. Full document history with download links
          will be available soon.
        </Text>
      </Box>
    </Box>
  )
}
