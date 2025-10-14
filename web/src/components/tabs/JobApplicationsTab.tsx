/**
 * Job Applications Tab
 *
 * Editor-only tab for managing job matches and tracking application status.
 * Features:
 * - List all job matches
 * - Click generated jobs to view documents (opens GenerationDetailsModal)
 * - Click non-generated jobs to fill resume builder form
 * - Toggle applied status
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Checkbox, Label } from "theme-ui"
import { jobMatchClient } from "../../api"
import type { JobMatch } from "../../types/job-match"
import type { GenerationRequest } from "../../types/generator"
import { generatorClient } from "../../api/generator-client"
import { logger } from "../../utils/logger"

interface JobApplicationsTabProps {
  onSelectJobMatch: (jobMatch: JobMatch) => void
  onViewGeneratedDocs: (request: GenerationRequest) => void
}

export const JobApplicationsTab: React.FC<JobApplicationsTabProps> = ({ onSelectJobMatch, onViewGeneratedDocs }) => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingApplied, setTogglingApplied] = useState<Set<string>>(new Set())

  useEffect(() => {
    void loadJobMatches()
  }, [])

  const loadJobMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const matches = await jobMatchClient.getJobMatches()
      setJobMatches(matches)
    } catch (err) {
      logger.error("Failed to load job matches", err as Error, { component: "JobApplicationsTab" })
      setError(err instanceof Error ? err.message : "Failed to load job matches")
    } finally {
      setLoading(false)
    }
  }

  const handleJobMatchClick = async (jobMatch: JobMatch) => {
    if (jobMatch.documentGenerated && jobMatch.generationId) {
      // Job has documents generated - fetch and show them
      try {
        const request = await generatorClient.getRequest(jobMatch.generationId)
        onViewGeneratedDocs(request)
      } catch (err) {
        logger.error("Failed to fetch generation request", err as Error, {
          jobMatchId: jobMatch.id,
          generationId: jobMatch.generationId,
        })
        window.alert(`Failed to load documents: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    } else {
      // Job doesn't have documents - fill in the resume builder form
      onSelectJobMatch(jobMatch)
    }
  }

  const handleToggleApplied = async (jobMatch: JobMatch, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click

    const newAppliedStatus = !jobMatch.applied

    // Optimistic UI update
    setJobMatches((prev) => prev.map((jm) => (jm.id === jobMatch.id ? { ...jm, applied: newAppliedStatus } : jm)))

    // Add to loading set
    setTogglingApplied((prev) => new Set(prev).add(jobMatch.id))

    try {
      await jobMatchClient.toggleApplied(jobMatch.id, newAppliedStatus)
    } catch (err) {
      // Revert on error
      setJobMatches((prev) => prev.map((jm) => (jm.id === jobMatch.id ? { ...jm, applied: jobMatch.applied } : jm)))
      logger.error("Failed to toggle applied status", err as Error, { jobMatchId: jobMatch.id })
      window.alert(`Failed to update status: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      // Remove from loading set
      setTogglingApplied((prev) => {
        const next = new Set(prev)
        next.delete(jobMatch.id)
        return next
      })
    }
  }

  const getStatusColor = (generated: boolean) => {
    return generated ? "#10b981" : "#6b7280" // green : gray
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
        Loading job matches...
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

  if (jobMatches.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        No job matches yet. Add job matches to your Firestore database to see them here.
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Heading as="h2" sx={{ fontSize: 3, fontWeight: "heading" }}>
          Job Applications
        </Heading>
        <Button
          onClick={() => void loadJobMatches()}
          variant="secondary"
          sx={{
            px: 3,
            py: 2,
            fontSize: 1,
          }}
        >
          Refresh
        </Button>
      </Flex>

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
              <Box as="th">Company</Box>
              <Box as="th">Title / Role</Box>
              <Box as="th">Match</Box>
              <Box as="th">Documents</Box>
              <Box as="th">Applied</Box>
              <Box as="th">Actions</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {jobMatches.map((jobMatch) => (
              <Box as="tr" key={jobMatch.id} onClick={() => void handleJobMatchClick(jobMatch)}>
                <Box as="td">
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{jobMatch.company}</Text>
                </Box>
                <Box as="td">
                  <Text sx={{ fontSize: 1, fontWeight: jobMatch.title ? "medium" : "normal" }}>
                    {jobMatch.title ?? jobMatch.role}
                  </Text>
                  {jobMatch.title && jobMatch.title !== jobMatch.role && (
                    <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>{jobMatch.role}</Text>
                  )}
                </Box>
                <Box as="td">
                  {jobMatch.matchScore !== undefined ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "60px",
                          height: "6px",
                          bg: "muted",
                          borderRadius: "99px",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${jobMatch.matchScore}%`,
                            height: "100%",
                            bg:
                              jobMatch.matchScore >= 80 ? "#10b981" : jobMatch.matchScore >= 60 ? "#f59e0b" : "#ef4444",
                            transition: "width 0.3s",
                          }}
                        />
                      </Box>
                      <Text sx={{ fontSize: 1, fontWeight: "medium", minWidth: "40px" }}>{jobMatch.matchScore}%</Text>
                    </Box>
                  ) : (
                    <Text sx={{ fontSize: 1, color: "textMuted" }}>—</Text>
                  )}
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
                      bg: getStatusColor(jobMatch.documentGenerated),
                    }}
                  >
                    {jobMatch.documentGenerated ? "Generated" : "Not Generated"}
                  </Box>
                </Box>
                <Box as="td">
                  <Label
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      opacity: togglingApplied.has(jobMatch.id) ? 0.5 : 1,
                    }}
                    onClick={(e) => void handleToggleApplied(jobMatch, e)}
                  >
                    <Checkbox
                      checked={jobMatch.applied}
                      readOnly
                      disabled={togglingApplied.has(jobMatch.id)}
                      sx={{ cursor: "pointer" }}
                    />
                    <Text sx={{ fontSize: 1 }}>{jobMatch.applied ? "Applied" : "Not Applied"}</Text>
                  </Label>
                </Box>
                <Box as="td">
                  <Text sx={{ fontSize: 0, color: "textMuted" }}>
                    {jobMatch.documentGenerated ? "Click to view docs" : "Click to generate"}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Text sx={{ fontSize: 1, color: "textMuted" }}>
          Total: {jobMatches.length} job{jobMatches.length !== 1 ? "s" : ""} | Generated:{" "}
          {jobMatches.filter((jm) => jm.documentGenerated).length} | Applied:{" "}
          {jobMatches.filter((jm) => jm.applied).length}
        </Text>
      </Box>
    </Box>
  )
}
