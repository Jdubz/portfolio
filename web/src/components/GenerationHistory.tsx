/**
 * Generation History Component
 *
 * Displays a table of past document generation requests with ability to view details.
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text } from "theme-ui"
import type { GenerationRequest } from "../types/generator"
import { generatorClient } from "../api/generator-client"
import { logger } from "../utils/logger"

interface GenerationHistoryProps {
  onViewDetails?: (request: GenerationRequest) => void
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({ onViewDetails }) => {
  const [requests, setRequests] = useState<GenerationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const history = await generatorClient.listRequests(50)
      setRequests(history)
    } catch (err) {
      logger.error("Failed to load generation history", err as Error, { component: "GenerationHistory" })
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981" // green
      case "processing":
        return "#f59e0b" // amber
      case "failed":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        Loading history...
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          bg: "muted",
          borderRadius: "8px",
          color: "red",
        }}
      >
        Error: {error}
      </Box>
    )
  }

  if (requests.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        No generation history yet
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Heading as="h2" sx={{ fontSize: 3, fontWeight: "heading", mb: 3 }}>
        Generation History
      </Heading>

      <Box sx={{ overflowX: "auto" }}>
        <Box
          as="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th": {
              textAlign: "left",
              py: 2,
              px: 3,
              borderBottom: "2px solid",
              borderColor: "muted",
              fontWeight: "heading",
              fontSize: 1,
              color: "textMuted",
            },
            "& td": {
              py: 2,
              px: 3,
              borderBottom: "1px solid",
              borderColor: "muted",
            },
            "& tbody tr": {
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": {
                bg: "highlight",
              },
            },
          }}
        >
          <Box as="thead">
            <Box as="tr">
              <Box as="th">Date</Box>
              <Box as="th">Position</Box>
              <Box as="th">Company</Box>
              <Box as="th">Type</Box>
              <Box as="th">Status</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {requests.map((request) => (
              <Box as="tr" key={request.id} onClick={() => onViewDetails?.(request)}>
                <Box as="td">
                  <Text sx={{ fontSize: 1 }}>{formatDate(request.createdAt)}</Text>
                </Box>
                <Box as="td">
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{request.job.role}</Text>
                </Box>
                <Box as="td">
                  <Text sx={{ fontSize: 1 }}>{request.job.company}</Text>
                </Box>
                <Box as="td">
                  <Text sx={{ fontSize: 1, textTransform: "capitalize" }}>{request.generateType}</Text>
                </Box>
                <Box as="td">
                  <Box
                    sx={{
                      display: "inline-block",
                      px: 2,
                      py: 1,
                      borderRadius: "99px",
                      fontSize: 0,
                      fontWeight: "medium",
                      color: "white",
                      bg: getStatusColor(request.status),
                    }}
                  >
                    {request.status}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
