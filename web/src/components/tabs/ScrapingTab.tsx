import React, { useState } from "react"
import { Box, Text, Button, Flex, Heading, Spinner, Grid, Input, Select } from "theme-ui"
import { ScrapeConfigModal } from "../ScrapeConfigModal"
import { jobQueueClient } from "../../api/job-queue-client"
import { useAuth } from "../../hooks/useAuth"
import { useQueueManagement } from "../../hooks/useQueueManagement"
import type { ScrapeConfig, QueueStatus } from "../../types/job-queue"
import { logger } from "../../utils/logger"
import { TabHeader, InfoBox, LoadingState, EmptyState, StatsGrid, StatusBadge } from "../ui"

/**
 * Scraping Tab
 *
 * Allows users to trigger custom job scraping with configuration options
 */
export const ScrapingTab: React.FC = () => {
  const { user } = useAuth()
  const { queueItems, loading: queueLoading, error: firestoreError } = useQueueManagement()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<QueueStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const handleQuickScrape = async () => {
    if (!user) {
      setError("You must be signed in to trigger a scrape")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Submit with default config
      const response = await jobQueueClient.submitScrape({})

      setSuccess(`Scrape request submitted successfully! Queue ID: ${response.queueItemId || "N/A"}`)
      logger.info("Quick scrape submitted", {
        queueItemId: response.queueItemId,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit scrape request"
      setError(errorMessage)
      logger.error("Failed to submit quick scrape", err as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomScrape = async (config: ScrapeConfig) => {
    if (!user) {
      setError("You must be signed in to trigger a scrape")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await jobQueueClient.submitScrape({
        scrape_config: config,
      })

      setSuccess(`Custom scrape submitted successfully! Queue ID: ${response.queueItemId || "N/A"}`)
      logger.info("Custom scrape submitted", {
        queueItemId: response.queueItemId,
        config,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit scrape request"
      setError(errorMessage)
      logger.error("Failed to submit custom scrape", err as Error, { config })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter for scrape-type items only
  const scrapeItems = queueItems.filter((item) => item.type === "scrape")

  // Filter by status and search
  const filteredItems = scrapeItems.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return item.id.toLowerCase().includes(query)
    }
    return true
  })

  // Sort by created date (newest first)
  const sortedItems = [...filteredItems].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    }
    return date.toLocaleDateString()
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) {
      return null
    }
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const seconds = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
  }

  return (
    <Box>
      <TabHeader
        title="Job Scraping"
        description="Trigger automated job scraping to discover new opportunities. The scraper will search configured job boards, analyze positions with AI, and save matches above your threshold."
      />

      {/* Status Messages */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <InfoBox variant="danger">{error}</InfoBox>
        </Box>
      )}

      {success && (
        <Box sx={{ mb: 4 }}>
          <InfoBox variant="success">
            <Box>
              <Text sx={{ fontWeight: "medium", mb: 2 }}>{success}</Text>
              <Text sx={{ fontSize: 1 }}>Scroll down to view scrape progress in the history section below.</Text>
            </Box>
          </InfoBox>
        </Box>
      )}

      {!user && (
        <Box sx={{ mb: 4 }}>
          <InfoBox variant="info">Please sign in to trigger job scraping</InfoBox>
        </Box>
      )}

      {/* Quick Scrape */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 2 }}>
          Quick Scrape
        </Heading>
        <Text sx={{ mb: 3, color: "textMuted", fontSize: 2 }}>
          Run a standard scrape with default settings (5 matches, 20 sources)
        </Text>
        <Button onClick={handleQuickScrape} disabled={isSubmitting || !user}>
          {isSubmitting ? "Submitting..." : "Find New Jobs"}
        </Button>
      </Box>

      {/* Custom Scrape */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 2 }}>
          Custom Scrape
        </Heading>
        <Text sx={{ mb: 3, color: "textMuted", fontSize: 2 }}>
          Configure custom scraping parameters including target matches, max sources, and match score threshold
        </Text>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)} disabled={isSubmitting || !user}>
          Configure Custom Scrape
        </Button>
      </Box>

      {/* How It Works */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
          How It Works
        </Heading>
        <Flex sx={{ flexDirection: "column", gap: 2 }}>
          <Text sx={{ fontSize: 2 }}>
            <strong>1. Submit:</strong> Configure and submit a scrape request
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>2. Queue:</strong> Request is added to the job queue
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>3. Scrape:</strong> Python worker scrapes configured job boards
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>4. Analyze:</strong> AI analyzes each job against your profile
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>5. Save:</strong> Jobs above match threshold are saved to Job Applications
          </Text>
          <Text sx={{ mt: 2, fontSize: 1, color: "textMuted" }}>Typical scrape duration: 5-15 minutes</Text>
        </Flex>
      </Box>

      {/* Scrape History Section */}
      {user && (
        <>
          <Box sx={{ borderTop: "2px solid", borderColor: "muted", pt: 4, mt: 4, mb: 3 }}>
            <Flex sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Heading as="h2" sx={{ fontSize: 4 }}>
                Scrape History
              </Heading>
              <Flex sx={{ alignItems: "center", gap: 2 }}>
                {queueLoading && <Spinner size={16} />}
                <StatusBadge status="live">Live Updates</StatusBadge>
              </Flex>
            </Flex>
            <Text sx={{ color: "textMuted", mb: 4 }}>
              View all your past scrape requests and their results. Updates automatically via Firestore.
            </Text>
          </Box>

          {/* Filters */}
          <Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
            <Grid columns={[1, 2]} gap={3}>
              <Box>
                <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Search</Text>
                <Input
                  type="text"
                  placeholder="Search by queue ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ variant: "forms.input" }}
                />
              </Box>
              <Box>
                <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Filter by Status</Text>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as QueueStatus | "all")}
                  sx={{ variant: "forms.select" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="filtered">Filtered</option>
                </Select>
              </Box>
            </Grid>
          </Box>

          {/* Error Display */}
          {firestoreError && (
            <Box sx={{ mb: 3 }}>
              <InfoBox variant="danger">{firestoreError}</InfoBox>
            </Box>
          )}

          {/* Stats */}
          <StatsGrid
            columns={[2, 2, 4]}
            stats={[
              { label: "Total Scrapes", value: scrapeItems.length },
              {
                label: "Active",
                value: scrapeItems.filter((i) => i.status === "pending" || i.status === "processing").length,
                color: "orange",
              },
              { label: "Completed", value: scrapeItems.filter((i) => i.status === "success").length, color: "success" },
              { label: "Failed", value: scrapeItems.filter((i) => i.status === "failed").length, color: "danger" },
            ]}
          />

          {/* Scrape Items List */}
          {queueLoading && scrapeItems.length === 0 ? (
            <LoadingState message="Loading scrape history..." />
          ) : sortedItems.length === 0 ? (
            <EmptyState
              icon="📭"
              message={
                searchQuery || filterStatus !== "all"
                  ? "No scrapes match your filters"
                  : "No scrape history found. Start your first scrape above!"
              }
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {sortedItems.map((item) => {
                const duration =
                  item.processed_at && item.completed_at ? formatDuration(item.processed_at, item.completed_at) : null
                const config = item.scrape_config

                return (
                  <Box key={item.id} sx={{ variant: "cards.primary", p: 3 }}>
                    {/* Header */}
                    <Flex sx={{ alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                      <StatusBadge status={item.status} />
                      <Text sx={{ fontSize: 1, color: "textMuted" }}>{formatDate(item.created_at)}</Text>
                      {duration && <Text sx={{ fontSize: 1, color: "textMuted" }}>• {duration}</Text>}
                    </Flex>

                    {/* Queue ID */}
                    <Box sx={{ mb: 3 }}>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Queue ID</Text>
                      <Text sx={{ fontSize: 1, fontFamily: "monospace", wordBreak: "break-all" }}>{item.id}</Text>
                    </Box>

                    {/* Configuration */}
                    <Grid columns={[2, 4]} gap={2} sx={{ mb: 3 }}>
                      <Box>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Target Matches</Text>
                        <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{config?.target_matches ?? "5"}</Text>
                      </Box>
                      <Box>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Max Sources</Text>
                        <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{config?.max_sources ?? "20"}</Text>
                      </Box>
                      <Box>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Min Score</Text>
                        <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{config?.min_match_score ?? "80"}/100</Text>
                      </Box>
                      <Box>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Retries</Text>
                        <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                          {item.retry_count} / {item.max_retries}
                        </Text>
                      </Box>
                    </Grid>

                    {/* Timing Details */}
                    {(item.processed_at || item.completed_at) && (
                      <Grid columns={[2, 3]} gap={2} sx={{ mb: 3 }}>
                        <Box>
                          <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Created</Text>
                          <Text sx={{ fontSize: 1 }}>{formatFullDate(item.created_at)}</Text>
                        </Box>
                        {item.processed_at && (
                          <Box>
                            <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Started</Text>
                            <Text sx={{ fontSize: 1 }}>{formatFullDate(item.processed_at)}</Text>
                          </Box>
                        )}
                        {item.completed_at && (
                          <Box>
                            <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Completed</Text>
                            <Text sx={{ fontSize: 1 }}>{formatFullDate(item.completed_at)}</Text>
                          </Box>
                        )}
                      </Grid>
                    )}

                    {/* Source Filter */}
                    {config?.source_ids && config.source_ids.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Source Filter</Text>
                        <Text sx={{ fontSize: 1 }}>{config.source_ids.length} specific sources</Text>
                      </Box>
                    )}

                    {/* Result Message */}
                    {item.result_message && (
                      <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mb: 2 }}>
                        <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>Result</Text>
                        <Text sx={{ fontSize: 1 }}>{item.result_message}</Text>
                      </Box>
                    )}

                    {/* Error Details */}
                    {item.error_details && (
                      <Box sx={{ p: 2, bg: "muted", borderRadius: "sm" }}>
                        <Text sx={{ fontSize: 0, color: "danger", mb: 1, fontWeight: "bold" }}>Error Details</Text>
                        <Text sx={{ fontSize: 1, fontFamily: "monospace", whiteSpace: "pre-wrap", color: "danger" }}>
                          {item.error_details}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </>
      )}

      {/* Modal */}
      <ScrapeConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCustomScrape} />
    </Box>
  )
}
