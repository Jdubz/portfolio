import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Spinner, Grid, Input, Select } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { useQueueManagement } from "../../hooks/useQueueManagement"
import { StatusBadge } from "../ui/StatusBadge"
import { ScrapeResultModal } from "../ScrapeResultModal"
import type { QueueStatus, QueueItem } from "../../types/job-queue"
import { logger } from "../../utils/logger"

/**
 * Scrape History Tab
 *
 * Displays historical scrape requests with filtering and detailed results
 */
export const ScrapeHistoryTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { queueItems, loading, error: firestoreError } = useQueueManagement()
  const [filterStatus, setFilterStatus] = useState<QueueStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedScrape, setSelectedScrape] = useState<QueueItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter for scrape-type items only
  const scrapeItems = queueItems.filter((item) => item.type === "scrape")

  // Filter by status and search
  const filteredItems = scrapeItems.filter((item) => {
    // Filter by status
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false
    }

    // Search by ID
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

  // Format date
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

  const handleViewDetails = (item: QueueItem) => {
    setSelectedScrape(item)
    setIsModalOpen(true)
    logger.info("Viewing scrape details", { scrapeId: item.id })
  }

  if (authLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>
        <Spinner size={32} />
      </Box>
    )
  }

  if (!user) {
    return <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>Please sign in to view scrape history</Box>
  }

  return (
    <Box>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Heading as="h2" sx={{ fontSize: 4 }}>
          Scrape History
        </Heading>
        <Flex sx={{ alignItems: "center", gap: 2 }}>
          {loading && <Spinner size={16} />}
          <StatusBadge status="live">Live Updates</StatusBadge>
        </Flex>
      </Flex>

      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        View all your past scrape requests and their results. Updates automatically via Firestore.
      </Text>

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
        <Box sx={{ p: 3, bg: "danger", color: "background", borderRadius: "md", mb: 3 }}>
          <Text sx={{ fontWeight: "medium" }}>{firestoreError}</Text>
        </Box>
      )}

      {/* Stats */}
      <Grid columns={[2, 2, 4]} gap={3} sx={{ mb: 4 }}>
        <Box sx={{ variant: "cards.primary", p: 4 }}>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
              mb: 2,
              fontWeight: "medium",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total Scrapes
          </Text>
          <Text sx={{ fontSize: 5, fontWeight: "bold" }}>{scrapeItems.length}</Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 4 }}>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
              mb: 2,
              fontWeight: "medium",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Active
          </Text>
          <Text sx={{ fontSize: 5, fontWeight: "bold", color: "orange" }}>
            {scrapeItems.filter((i) => i.status === "pending" || i.status === "processing").length}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 4 }}>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
              mb: 2,
              fontWeight: "medium",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Completed
          </Text>
          <Text sx={{ fontSize: 5, fontWeight: "bold", color: "success" }}>
            {scrapeItems.filter((i) => i.status === "success").length}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 4 }}>
          <Text
            sx={{
              fontSize: 1,
              color: "textMuted",
              mb: 2,
              fontWeight: "medium",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Failed
          </Text>
          <Text sx={{ fontSize: 5, fontWeight: "bold", color: "danger" }}>
            {scrapeItems.filter((i) => i.status === "failed").length}
          </Text>
        </Box>
      </Grid>

      {/* Scrape Items List */}
      {loading && scrapeItems.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Spinner size={32} />
        </Box>
      ) : sortedItems.length === 0 ? (
        <Box sx={{ variant: "cards.primary", p: 4, textAlign: "center" }}>
          <Text sx={{ color: "textMuted" }}>
            {searchQuery || filterStatus !== "all"
              ? "No scrapes match your filters"
              : "No scrape history found. Start your first scrape from the Job Scraping tab!"}
          </Text>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {sortedItems.map((item) => {
            const duration =
              item.processed_at && item.completed_at ? formatDuration(item.processed_at, item.completed_at) : null

            return (
              <Box key={item.id} sx={{ variant: "cards.primary", p: 4 }}>
                <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Flex sx={{ alignItems: "center", gap: 2, mb: 2 }}>
                      <StatusBadge status={item.status} />
                      <Text sx={{ fontSize: 1, color: "textMuted" }}>{formatDate(item.created_at)}</Text>
                      {duration && <Text sx={{ fontSize: 1, color: "textMuted" }}>• {duration}</Text>}
                    </Flex>
                    <Text sx={{ fontSize: 0, color: "textMuted", fontFamily: "monospace", wordBreak: "break-all" }}>
                      {item.id}
                    </Text>
                  </Box>

                  <Button onClick={() => handleViewDetails(item)} variant="secondary">
                    View Details
                  </Button>
                </Flex>

                <Grid columns={[1, 2, 4]} gap={3}>
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Target Matches</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{item.scrape_config?.target_matches ?? "5"}</Text>
                  </Box>
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Max Sources</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{item.scrape_config?.max_sources ?? "20"}</Text>
                  </Box>
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Min Score</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                      {item.scrape_config?.min_match_score ?? "80"}
                    </Text>
                  </Box>
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Retries</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                      {item.retry_count} / {item.max_retries}
                    </Text>
                  </Box>
                </Grid>

                {item.result_message && (
                  <Box sx={{ mt: 3, p: 2, bg: "muted", borderRadius: "sm" }}>
                    <Text sx={{ fontSize: 1 }}>{item.result_message}</Text>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      {/* Detail Modal */}
      <ScrapeResultModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} scrapeItem={selectedScrape} />
    </Box>
  )
}
