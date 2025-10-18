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

import React, { useState, useEffect, useMemo } from "react"
import { Box, Text, Button, Flex, Checkbox, Label, Spinner, Select, Input, Heading } from "theme-ui"
import { jobMatchClient, jobQueueClient } from "../../api"
import type { JobMatch } from "../../types/job-match"
import type { GenerationRequest } from "../../types/generator"
import { generatorClient } from "../../api/generator-client"
import { logger } from "../../utils/logger"
import { useAuth } from "../../hooks/useAuth"
import { useDocumentGeneration, buildGenerationOptionsFromJobMatch } from "../../hooks/useDocumentGeneration"
import { GenerationProgress } from "../GenerationProgress"
import { TabHeader, LoadingState, EmptyState } from "../ui"
import { SubmitJobModal } from "../SubmitJobModal"

interface JobApplicationsTabProps {
  onViewGeneratedDocs: (request: GenerationRequest) => void
}

type SortField = "age" | "match" | "company" | "role"
type SortDirection = "asc" | "desc"

interface Filters {
  showApplied: boolean
  showNotApplied: boolean
  showGenerated: boolean
  showNotGenerated: boolean
  minMatchScore: number
}

export const JobApplicationsTab: React.FC<JobApplicationsTabProps> = ({ onViewGeneratedDocs }) => {
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingApplied, setTogglingApplied] = useState<Set<string>>(new Set())
  const { user, loading: authLoading } = useAuth()

  // Sorting and filtering state
  const [sortField, setSortField] = useState<SortField>("age")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filters, setFilters] = useState<Filters>({
    showApplied: true,
    showNotApplied: true,
    showGenerated: true,
    showNotGenerated: true,
    minMatchScore: 0,
  })

  // Generation state
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null)
  const { generating, steps, result, startGeneration, reset } = useDocumentGeneration()

  // Submit Job Modal state
  const [isSubmitJobModalOpen, setIsSubmitJobModalOpen] = useState(false)

  // Filter bar collapse state (default collapsed on mobile)
  const [isFilterBarExpanded, setIsFilterBarExpanded] = useState(false)

  // Helper function to calculate job age
  const getJobAge = (postedDate?: string): string => {
    if (!postedDate) {
      return "—"
    }

    try {
      const posted = new Date(postedDate)
      const now = new Date()
      const diffMs = now.getTime() - posted.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return "Today"
      }
      if (diffDays === 1) {
        return "1 day"
      }
      if (diffDays < 7) {
        return `${diffDays} days`
      }
      if (diffDays < 14) {
        return "1 week"
      }
      if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks`
      }
      if (diffDays < 60) {
        return "1 month"
      }
      return `${Math.floor(diffDays / 30)} months`
    } catch {
      return "—"
    }
  }

  // Helper function to get age in days for sorting
  const getAgeInDays = (postedDate?: string): number => {
    if (!postedDate) {
      return Number.MAX_SAFE_INTEGER // Put jobs without dates at the end
    }
    try {
      const posted = new Date(postedDate)
      const now = new Date()
      const diffMs = now.getTime() - posted.getTime()
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    } catch {
      return Number.MAX_SAFE_INTEGER
    }
  }

  // Apply sorting and filtering
  const filteredAndSortedJobMatches = useMemo(() => {
    let filtered = jobMatches.filter((job) => {
      // Apply filters
      const appliedFilter = filters.showApplied === filters.showNotApplied || job.applied === filters.showApplied
      const generatedFilter =
        filters.showGenerated === filters.showNotGenerated || job.documentGenerated === filters.showGenerated

      const matchScoreFilter = !job.matchScore || job.matchScore >= filters.minMatchScore

      return appliedFilter && generatedFilter && matchScoreFilter
    })

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "age": {
          const ageA = getAgeInDays(a.postedDate)
          const ageB = getAgeInDays(b.postedDate)
          comparison = ageA - ageB
          break
        }
        case "match": {
          const matchA = a.matchScore ?? -1
          const matchB = b.matchScore ?? -1
          comparison = matchA - matchB
          break
        }
        case "company":
          comparison = a.company.localeCompare(b.company)
          break
        case "role": {
          const roleA = a.title ?? a.role
          const roleB = b.title ?? b.role
          comparison = roleA.localeCompare(roleB)
          break
        }
        default:
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [jobMatches, sortField, sortDirection, filters])

  useEffect(() => {
    // Only load job matches if user is authenticated and auth is not loading
    if (!authLoading && user) {
      void loadJobMatches()
    }
  }, [authLoading, user])

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

    // Default to OpenAI for job match generation (higher quality for important applications)
    const provider = "openai"

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

  const handleSubmitJob = async (data: { url: string; companyName: string; companyUrl: string }) => {
    await jobQueueClient.submitJob({
      url: data.url,
      companyName: data.companyName,
      companyUrl: data.companyUrl,
    })
    logger.info("Job submitted from Job Applications tab", data)
    // Refresh job matches after a short delay to allow processing
    window.setTimeout(() => {
      void loadJobMatches()
    }, 2000)
  }

  if (authLoading || loading) {
    return <LoadingState message="Loading job matches..." />
  }

  if (!user) {
    return <EmptyState icon="🔒" message="Please sign in to view job applications" />
  }

  if (error) {
    return <EmptyState icon="❌" message={`Error: ${error}`} />
  }

  if (jobMatches.length === 0) {
    return (
      <>
        <TabHeader
          title="Job Applications"
          actions={
            <Flex sx={{ gap: 2 }}>
              <Button onClick={() => setIsSubmitJobModalOpen(true)} variant="primary">
                New Job
              </Button>
              <Button onClick={() => void loadJobMatches()} variant="secondary">
                Refresh
              </Button>
            </Flex>
          }
        />
        <EmptyState
          icon="📭"
          message="No job matches yet. Submit a job to get started or wait for job-finder to discover matches."
        />
        <SubmitJobModal
          isOpen={isSubmitJobModalOpen}
          onClose={() => setIsSubmitJobModalOpen(false)}
          onSubmit={handleSubmitJob}
        />
      </>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <TabHeader
        title="Job Applications"
        actions={
          <Flex sx={{ gap: 2 }}>
            <Button onClick={() => setIsSubmitJobModalOpen(true)} variant="primary">
              New Job
            </Button>
            <Button onClick={() => void loadJobMatches()} variant="secondary">
              Refresh
            </Button>
          </Flex>
        }
      />

      {/* Sorting and Filtering Controls */}
      <Box
        sx={{
          mb: 4,
          borderRadius: "md",
          border: "1px solid",
          borderColor: "muted",
          overflow: "hidden",
        }}
      >
        {/* Filter Bar Header - Always visible */}
        <Flex
          sx={{
            p: 3,
            bg: "muted",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: ["pointer", "pointer", "default"],
          }}
          onClick={() => setIsFilterBarExpanded((prev) => !prev)}
        >
          <Flex sx={{ alignItems: "center", gap: 2, flex: 1 }}>
            <Text sx={{ fontSize: 1, fontWeight: "bold" }}>
              {isFilterBarExpanded ? "Filters & Sort" : "Sort & Filters"}
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              ({filteredAndSortedJobMatches.length} of {jobMatches.length} jobs)
            </Text>
          </Flex>
          <Button
            variant="secondary"
            sx={{
              px: 2,
              py: 1,
              fontSize: 0,
              display: ["flex", "flex", "none"],
              alignItems: "center",
              gap: 1,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setIsFilterBarExpanded((prev) => !prev)
            }}
          >
            {isFilterBarExpanded ? "Hide" : "Show"} {isFilterBarExpanded ? "▲" : "▼"}
          </Button>
        </Flex>

        {/* Collapsible Filter Content */}
        <Box
          sx={{
            display: [isFilterBarExpanded ? "block" : "none", isFilterBarExpanded ? "block" : "none", "block"],
            p: 3,
            bg: "background",
          }}
        >
          <Flex sx={{ gap: 4, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Sort Controls */}
            <Box sx={{ flex: "1 1 200px" }}>
              <Label htmlFor="sortField" sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>
                Sort By
              </Label>
              <Flex sx={{ gap: 2 }}>
                <Select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  sx={{ flex: 1 }}
                >
                  <option value="age">Age (Newest First)</option>
                  <option value="match">Match Score</option>
                  <option value="company">Company</option>
                  <option value="role">Role</option>
                </Select>
                <Button
                  onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                  variant="secondary"
                  sx={{ px: 2, flexShrink: 0 }}
                  title={sortDirection === "asc" ? "Ascending" : "Descending"}
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </Button>
              </Flex>
            </Box>

            {/* Filter Controls */}
            <Box sx={{ flex: "1 1 300px" }}>
              <Text sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>Filters</Text>
              <Flex sx={{ gap: 3, flexWrap: "wrap" }}>
                <Label sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
                  <Checkbox
                    checked={filters.showApplied}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showApplied: e.target.checked,
                      }))
                    }
                  />
                  <Text sx={{ fontSize: 1 }}>Applied</Text>
                </Label>
                <Label sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
                  <Checkbox
                    checked={filters.showNotApplied}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showNotApplied: e.target.checked,
                      }))
                    }
                  />
                  <Text sx={{ fontSize: 1 }}>Not Applied</Text>
                </Label>
                <Label sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
                  <Checkbox
                    checked={filters.showGenerated}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showGenerated: e.target.checked,
                      }))
                    }
                  />
                  <Text sx={{ fontSize: 1 }}>Generated</Text>
                </Label>
                <Label sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
                  <Checkbox
                    checked={filters.showNotGenerated}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showNotGenerated: e.target.checked,
                      }))
                    }
                  />
                  <Text sx={{ fontSize: 1 }}>Not Generated</Text>
                </Label>
              </Flex>
            </Box>

            {/* Match Score Filter */}
            <Box sx={{ flex: "1 1 200px" }}>
              <Label htmlFor="minMatchScore" sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>
                Min Match Score: {filters.minMatchScore}%
              </Label>
              <Input
                id="minMatchScore"
                type="range"
                min="0"
                max="100"
                step="10"
                value={filters.minMatchScore}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minMatchScore: Number(e.target.value),
                  }))
                }
                sx={{ width: "100%" }}
              />
            </Box>
          </Flex>

          {/* Active filters summary */}
          {(filters.minMatchScore > 0 ||
            !filters.showApplied ||
            !filters.showNotApplied ||
            !filters.showGenerated ||
            !filters.showNotGenerated) && (
            <Flex sx={{ mt: 3, gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                onClick={() =>
                  setFilters({
                    showApplied: true,
                    showNotApplied: true,
                    showGenerated: true,
                    showNotGenerated: true,
                    minMatchScore: 0,
                  })
                }
                sx={{ px: 2, py: 1, fontSize: 0 }}
              >
                Clear All Filters
              </Button>
            </Flex>
          )}
        </Box>
      </Box>

      {/* Generation Progress - Show if generating */}
      {generatingJobId && steps.length > 0 && (
        <Box sx={{ mb: 4, p: 4, bg: "muted", borderRadius: "md", border: "1px solid", borderColor: "primary" }}>
          <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Heading as="h3" sx={{ fontSize: 2, color: "primary" }}>
              {result?.status === "completed" ? "✓ Generation Complete" : "Generating Documents..."}
            </Heading>
            <Text
              sx={{
                fontSize: 2,
                fontWeight: "bold",
                color: "primary",
                fontFamily: "monospace",
              }}
            >
              {steps.filter((s) => s.status === "completed").length} / {steps.length}
            </Text>
          </Flex>
          <Text sx={{ fontSize: 1, mb: 3, color: "text" }}>
            {jobMatches.find((jm) => jm.id === generatingJobId)?.company} -{" "}
            {jobMatches.find((jm) => jm.id === generatingJobId)?.title ??
              jobMatches.find((jm) => jm.id === generatingJobId)?.role}
          </Text>
          <GenerationProgress steps={steps} />
          {result?.error && <Text sx={{ mt: 3, color: "red", fontSize: 1 }}>Error: {result.error}</Text>}
        </Box>
      )}

      {/* Mobile Card Layout (< 900px) */}
      <Box sx={{ display: ["block", "block", "none"], mt: 4 }}>
        {filteredAndSortedJobMatches.map((jobMatch) => {
          const isGenerating = generatingJobId === jobMatch.id

          return (
            <Box
              key={jobMatch.id}
              sx={{
                mb: 3,
                p: 3,
                border: "1px solid",
                borderColor: "muted",
                borderRadius: "md",
                bg: isGenerating ? "highlight" : "background",
                opacity: isGenerating ? 0.6 : 1,
                cursor: jobMatch.documentGenerated ? "pointer" : "default",
                transition: "all 0.2s",
                "&:hover": jobMatch.documentGenerated ? { borderColor: "primary", bg: "highlight" } : undefined,
              }}
              onClick={() => void handleJobMatchClick(jobMatch)}
            >
              {/* Company & Title */}
              <Box sx={{ mb: 3 }}>
                <Text sx={{ fontSize: 2, fontWeight: "bold", color: "text", mb: 1 }}>{jobMatch.company}</Text>
                <Text sx={{ fontSize: 2, fontWeight: "medium", color: "primary" }}>
                  {jobMatch.title ?? jobMatch.role}
                </Text>
                {jobMatch.title && jobMatch.title !== jobMatch.role && (
                  <Text sx={{ fontSize: 1, color: "textMuted", mt: 1 }}>{jobMatch.role}</Text>
                )}
              </Box>

              {/* Match Score & Age */}
              <Flex sx={{ gap: 4, mb: 3, flexWrap: "wrap" }}>
                <Box sx={{ flex: "1 1 auto" }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Match Score</Text>
                  {jobMatch.matchScore !== undefined ? (
                    <Flex sx={{ alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          flex: 1,
                          height: "8px",
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
                          }}
                        />
                      </Box>
                      <Text sx={{ fontSize: 1, fontWeight: "medium", minWidth: "40px" }}>{jobMatch.matchScore}%</Text>
                    </Flex>
                  ) : (
                    <Text sx={{ fontSize: 1 }}>—</Text>
                  )}
                </Box>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Posted</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{getJobAge(jobMatch.postedDate)}</Text>
                </Box>
              </Flex>

              {/* Status Badges */}
              <Flex sx={{ gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "99px",
                    fontSize: 0,
                    fontWeight: "medium",
                    color: "white",
                    bg: getStatusColor(jobMatch.documentGenerated),
                  }}
                >
                  {jobMatch.documentGenerated ? "✓ Generated" : "Not Generated"}
                </Box>
                <Label
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderRadius: "99px",
                    cursor: "pointer",
                    bg: jobMatch.applied ? "primary" : "muted",
                    color: jobMatch.applied ? "white" : "text",
                    opacity: togglingApplied.has(jobMatch.id) ? 0.5 : 1,
                  }}
                  onClick={(e) => void handleToggleApplied(jobMatch, e)}
                >
                  <Checkbox
                    checked={jobMatch.applied}
                    readOnly
                    disabled={togglingApplied.has(jobMatch.id)}
                    sx={{ display: "none" }}
                  />
                  <Text sx={{ fontSize: 0, fontWeight: "medium" }}>
                    {jobMatch.applied ? "✓ Applied" : "Mark Applied"}
                  </Text>
                </Label>
              </Flex>

              {/* Actions */}
              <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
                {(jobMatch.url ?? jobMatch.jobDescriptionUrl) && (
                  <Button
                    variant="secondary"
                    sx={{ flex: "1 1 auto", fontSize: 1 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      const url = jobMatch.url ?? jobMatch.jobDescriptionUrl
                      if (url) {
                        window.open(url, "_blank", "noopener,noreferrer")
                      }
                    }}
                  >
                    🔗 View Job
                  </Button>
                )}
                {!jobMatch.documentGenerated && !isGenerating && (
                  <Button
                    variant="primary"
                    sx={{ flex: "1 1 auto", fontSize: 1 }}
                    onClick={(e) => void handleGenerate(jobMatch, e)}
                    disabled={generating}
                  >
                    Generate Resume
                  </Button>
                )}
                {isGenerating && (
                  <Flex sx={{ flex: "1 1 auto", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <Spinner size={20} />
                    <Text sx={{ fontSize: 1, color: "textMuted" }}>
                      Generating {steps.filter((s) => s.status === "completed").length}/{steps.length}
                    </Text>
                  </Flex>
                )}
                {jobMatch.documentGenerated && (
                  <Text sx={{ flex: "1 1 100%", fontSize: 0, color: "textMuted", textAlign: "center" }}>
                    Tap card to view documents
                  </Text>
                )}
              </Flex>
            </Box>
          )
        })}
      </Box>

      {/* Desktop Table Layout (>= 900px) */}
      <Box sx={{ display: ["none", "none", "block"], overflowX: "auto", mt: 4 }}>
        <Box
          as="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th": {
              textAlign: "left",
              py: 3,
              px: 4,
              borderBottom: "2px solid",
              borderColor: "muted",
              fontWeight: "bold",
              fontSize: 2,
              color: "text",
              letterSpacing: "0.5px",
            },
            "& td": {
              py: 3,
              px: 4,
              borderBottom: "1px solid",
              borderColor: "muted",
              verticalAlign: "middle",
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
              <Box as="th">Age</Box>
              <Box as="th">Match</Box>
              <Box as="th">Documents</Box>
              <Box as="th">Applied</Box>
              <Box as="th">Actions</Box>
            </Box>
          </Box>
          <Box as="tbody">
            {filteredAndSortedJobMatches.map((jobMatch) => {
              const isGenerating = generatingJobId === jobMatch.id
              const className = isGenerating ? "generating" : jobMatch.documentGenerated ? "clickable" : "not-clickable"

              return (
                <Box as="tr" key={jobMatch.id} className={className} onClick={() => void handleJobMatchClick(jobMatch)}>
                  <Box as="td">
                    <Text sx={{ fontSize: 2, fontWeight: "medium", lineHeight: 1.4 }}>{jobMatch.company}</Text>
                  </Box>
                  <Box as="td">
                    <Text sx={{ fontSize: 2, fontWeight: jobMatch.title ? "medium" : "normal", lineHeight: 1.4 }}>
                      {jobMatch.title ?? jobMatch.role}
                    </Text>
                    {jobMatch.title && jobMatch.title !== jobMatch.role && (
                      <Text sx={{ fontSize: 1, color: "textMuted", mt: 1, lineHeight: 1.4 }}>{jobMatch.role}</Text>
                    )}
                  </Box>
                  <Box as="td">
                    <Text sx={{ fontSize: 2, color: "text", lineHeight: 1.4 }}>{getJobAge(jobMatch.postedDate)}</Text>
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
                    <Flex sx={{ gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                      {/* Job URL button - always show if URL exists */}
                      {(jobMatch.url ?? jobMatch.jobDescriptionUrl) && (
                        <Button
                          variant="secondary"
                          sx={{ px: 2, py: 1, fontSize: 0, flexShrink: 0 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = jobMatch.url ?? jobMatch.jobDescriptionUrl
                            if (url) {
                              window.open(url, "_blank", "noopener,noreferrer")
                            }
                          }}
                        >
                          🔗 View Job
                        </Button>
                      )}

                      {/* Generation actions */}
                      {jobMatch.documentGenerated ? (
                        <Text sx={{ fontSize: 0, color: "textMuted" }}>Click row to view docs</Text>
                      ) : isGenerating ? (
                        <Flex sx={{ alignItems: "center", gap: 2 }}>
                          <Spinner size={16} />
                          <Text sx={{ fontSize: 0, color: "textMuted" }}>
                            {steps.filter((s) => s.status === "completed").length} / {steps.length}
                          </Text>
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
                    </Flex>
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

      {/* Submit Job Modal */}
      <SubmitJobModal
        isOpen={isSubmitJobModalOpen}
        onClose={() => setIsSubmitJobModalOpen(false)}
        onSubmit={handleSubmitJob}
      />
    </Box>
  )
}
