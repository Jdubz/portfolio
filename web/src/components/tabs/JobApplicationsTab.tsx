/**
 * Job Applications Tab
 *
 * Editor-only tab for managing job matches and tracking application status.
 * Features:
 * - List all job matches
 * - One-click document generation for jobs without documents
 * - Click generated jobs to view documents (opens GenerationDetailsModal)
 * - Toggle applied status
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Checkbox, Label, Spinner } from "theme-ui"
import { jobMatchClient } from "../../api"
import type { JobMatch } from "../../types/job-match"
import type { GenerationRequest } from "../../types/generator"
import { generatorClient } from "../../api/generator-client"
import { logger } from "../../utils/logger"
import { useDocumentGeneration, buildGenerationOptionsFromJobMatch } from "../../hooks/useDocumentGeneration"
import { GenerationProgress } from "../GenerationProgress"

interface JobApplicationsTabProps {
  onViewGeneratedDocs: (request: GenerationRequest) => void
}

export const JobApplicationsTab: React.FC<JobApplicationsTabProps> = ({ onViewGeneratedDocs }) => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingApplied, setTogglingApplied] = useState<Set<string>>(new Set())

  // Generation state
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null)
  const { generating, steps, result, startGeneration, reset } = useDocumentGeneration()

  useEffect(() => {
    void loadJobMatches()
  }, [])

  // Update job match after successful generation
  useEffect(() => {
    if (result?.status === "completed" && result.requestId && generatingJobId) {
      // Update the job match in the list
      setJobMatches((prev) =>
        prev.map((jm) =>
          jm.id === generatingJobId
            ? {
                ...jm,
                documentGenerated: true,
                generationId: result.requestId,
                documentGeneratedAt: new Date().toISOString(),
              }
            : jm
        )
      )

      // Update in Firestore
      void jobMatchClient
        .updateJobMatch(generatingJobId, {
          documentGenerated: true,
          generationId: result.requestId,
          documentGeneratedAt: new Date().toISOString(),
        })
        .then(() => {
          logger.info("Job match updated after successful generation", {
            jobMatchId: generatingJobId,
            generationId: result.requestId,
          })
        })
        .catch((err) => {
          logger.error("Failed to update job match after generation", err as Error, {
            jobMatchId: generatingJobId,
          })
        })

      // Clear generating state after a delay to show completion
      window.setTimeout(() => {
        setGeneratingJobId(null)
        reset()
      }, 2000)
    }
  }, [result, generatingJobId, reset])

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
    // Only handle clicks for jobs with generated documents
    if (!jobMatch.documentGenerated || !jobMatch.generationId) {
      return
    }

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
  }

  const handleGenerate = async (jobMatch: JobMatch, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click

    // Get AI provider preference from localStorage (default to gemini)
    const savedProvider = localStorage.getItem("aiProvider")
    const provider = savedProvider === "openai" || savedProvider === "gemini" ? savedProvider : "gemini"

    setGeneratingJobId(jobMatch.id)

    try {
      const options = buildGenerationOptionsFromJobMatch(jobMatch, provider, "both")
      const generationResult = await startGeneration(options)

      if (generationResult.status === "failed") {
        window.alert(`Generation failed: ${generationResult.error ?? "Unknown error"}`)
        setGeneratingJobId(null)
        reset()
      }
      // Success case handled by useEffect above
    } catch (err) {
      logger.error("Failed to generate documents", err as Error, { jobMatchId: jobMatch.id })
      window.alert(`Failed to generate documents: ${err instanceof Error ? err.message : "Unknown error"}`)
      setGeneratingJobId(null)
      reset()
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
        <Heading as="h2" sx={{ fontSize: 3, color: "primary" }}>
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

      {/* Generation Progress - Show if generating */}
      {generatingJobId && steps.length > 0 && (
        <Box sx={{ mb: 4, p: 4, bg: "muted", borderRadius: "md", border: "1px solid", borderColor: "primary" }}>
          <Heading as="h3" sx={{ fontSize: 2, mb: 3, color: "primary" }}>
            {result?.status === "completed" ? "✓ Generation Complete" : "Generating Documents..."}
          </Heading>
          <Text sx={{ fontSize: 1, mb: 3, color: "text" }}>
            {jobMatches.find((jm) => jm.id === generatingJobId)?.company} -{" "}
            {jobMatches.find((jm) => jm.id === generatingJobId)?.title ??
              jobMatches.find((jm) => jm.id === generatingJobId)?.role}
          </Text>
          <GenerationProgress steps={steps} />
          {result?.error && <Text sx={{ mt: 3, color: "red", fontSize: 1 }}>Error: {result.error}</Text>}
        </Box>
      )}

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
              transition: "background-color 0.2s",
            },
            "& tbody tr.clickable": {
              cursor: "pointer",
              "&:hover": {
                bg: "highlight",
              },
            },
            "& tbody tr.not-clickable": {
              cursor: "default",
            },
            "& tbody tr.generating": {
              bg: "highlight",
              opacity: 0.6,
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
            {jobMatches.map((jobMatch) => {
              const isGenerating = generatingJobId === jobMatch.id
              const className = isGenerating ? "generating" : jobMatch.documentGenerated ? "clickable" : "not-clickable"

              return (
                <Box as="tr" key={jobMatch.id} className={className} onClick={() => void handleJobMatchClick(jobMatch)}>
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
                                jobMatch.matchScore >= 80
                                  ? "#10b981"
                                  : jobMatch.matchScore >= 60
                                    ? "#f59e0b"
                                    : "#ef4444",
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
                    {jobMatch.documentGenerated ? (
                      <Text sx={{ fontSize: 0, color: "textMuted" }}>Click to view docs</Text>
                    ) : isGenerating ? (
                      <Flex sx={{ alignItems: "center", gap: 2 }}>
                        <Spinner size={16} />
                        <Text sx={{ fontSize: 0, color: "textMuted" }}>Generating...</Text>
                      </Flex>
                    ) : (
                      <Button
                        variant="primary"
                        sx={{ px: 2, py: 1, fontSize: 0 }}
                        onClick={(e) => void handleGenerate(jobMatch, e)}
                        disabled={generating}
                      >
                        Generate
                      </Button>
                    )}
                  </Box>
                </Box>
              )
            })}
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
