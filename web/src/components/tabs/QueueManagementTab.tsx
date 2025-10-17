/**
 * Queue Management Tab
 *
 * Admin UI for managing the job queue - view all items, retry failed jobs, delete items
 */

import React, { useState } from "react"
import { Box, Text, Button, Flex, Spinner, Grid, Input, Select } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { useQueueManagement } from "../../hooks/useQueueManagement"
import { jobQueueClient } from "../../api"
import { logger } from "../../utils/logger"
import { TabHeader, LoadingState, EmptyState, StatsGrid, InfoBox, StatusBadge } from "../ui"
import type { QueueStatus } from "../../types/job-queue"

export const QueueManagementTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const { queueItems, loading, error: firestoreError } = useQueueManagement()
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<QueueStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Retry a failed job
  const handleRetry = async (queueItemId: string) => {
    setRetryingIds((prev) => new Set(prev).add(queueItemId))
    try {
      await jobQueueClient.retryQueueItem(queueItemId)
      // No need to update state - Firestore listener will handle it
      logger.info("Queue item retried", { queueItemId })
    } catch (err) {
      logger.error("Failed to retry queue item", err as Error)
      setError(err instanceof Error ? err.message : "Failed to retry item")
    } finally {
      setRetryingIds((prev) => {
        const next = new Set(prev)
        next.delete(queueItemId)
        return next
      })
    }
  }

  // Delete a queue item
  const handleDelete = async (queueItemId: string) => {
    if (!confirm("Are you sure you want to delete this queue item?")) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(queueItemId))
    try {
      await jobQueueClient.deleteQueueItem(queueItemId)
      // No need to update state - Firestore listener will handle it
      logger.info("Queue item deleted", { queueItemId })
    } catch (err) {
      logger.error("Failed to delete queue item", err as Error)
      setError(err instanceof Error ? err.message : "Failed to delete item")
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(queueItemId)
        return next
      })
    }
  }

  // Filter and search queue items
  const filteredItems = queueItems.filter((item) => {
    // Filter by status
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false
    }

    // Search by company name or URL
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        item.company_name.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (authLoading) {
    return <LoadingState />
  }

  if (!user) {
    return <EmptyState icon="🔒" message="Please sign in to access queue management" />
  }

  // Display combined error from Firestore or operations
  const displayError = error ?? firestoreError

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
      <TabHeader
        title="Queue Management"
        description="Real-time view of all job queue items. Updates automatically via Firestore listeners."
        actions={
          <>
            {loading && <Spinner size={16} />}
            <StatusBadge status="live">Live Updates</StatusBadge>
          </>
        }
      />

      {/* Filters */}
      <Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
        <Grid columns={[1, 2]} gap={3}>
          <Box>
            <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Search</Text>
            <Input
              type="text"
              placeholder="Search by company, URL, or ID..."
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
              <option value="skipped">Skipped</option>
              <option value="filtered">Filtered</option>
            </Select>
          </Box>
        </Grid>
      </Box>

      {/* Error Display */}
      {displayError && (
        <Box sx={{ mb: 3 }}>
          <InfoBox variant="danger">{displayError}</InfoBox>
        </Box>
      )}

      {/* Queue Stats */}
      <StatsGrid
        columns={[2, 2, 4]}
        stats={[
          { label: "Total Items", value: filteredItems.length },
          { label: "Pending", value: filteredItems.filter((i) => i.status === "pending").length, color: "blue" },
          {
            label: "Processing",
            value: filteredItems.filter((i) => i.status === "processing").length,
            color: "orange",
          },
          { label: "Failed", value: filteredItems.filter((i) => i.status === "failed").length, color: "red" },
        ]}
      />

      {/* Queue Items List */}
      {loading && queueItems.length === 0 ? (
        <LoadingState />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="📭"
          message={searchQuery || filterStatus !== "all" ? "No items match your filters" : "No queue items found"}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredItems.map((item) => (
            <Box key={item.id} sx={{ variant: "cards.primary", p: 4 }}>
              <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Flex sx={{ alignItems: "center", gap: 2, mb: 2 }}>
                    <Text sx={{ fontSize: 3, fontWeight: "bold" }}>{item.company_name}</Text>
                    <StatusBadge status={item.status} />
                  </Flex>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "14px",
                      color: "var(--theme-ui-colors-primary)",
                      textDecoration: "none",
                      display: "block",
                      marginBottom: "8px",
                      wordBreak: "break-all",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                    onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {item.url}
                  </a>
                  <Text sx={{ fontSize: 0, color: "textMuted", fontFamily: "monospace" }}>ID: {item.id}</Text>
                </Box>

                <Flex sx={{ gap: 2, flexShrink: 0 }}>
                  {item.status === "failed" && (
                    <Button
                      onClick={() => void handleRetry(item.id)}
                      disabled={retryingIds.has(item.id)}
                      variant="secondary"
                    >
                      {retryingIds.has(item.id) ? <Spinner size={16} /> : "Retry"}
                    </Button>
                  )}
                  <Button
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingIds.has(item.id)}
                    variant="danger"
                  >
                    {deletingIds.has(item.id) ? <Spinner size={16} /> : "Delete"}
                  </Button>
                </Flex>
              </Flex>

              <Grid columns={[1, 2, 3]} gap={3} sx={{ mb: 3 }}>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Type</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{item.type}</Text>
                </Box>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Source</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{item.source}</Text>
                </Box>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Retry Count</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                    {item.retry_count} / {item.max_retries}
                  </Text>
                </Box>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Created</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(item.created_at)}</Text>
                </Box>
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Updated</Text>
                  <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(item.updated_at)}</Text>
                </Box>
                {item.processed_at && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Processed</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(item.processed_at)}</Text>
                  </Box>
                )}
              </Grid>

              {item.result_message && (
                <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mb: 2 }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Result Message</Text>
                  <Text sx={{ fontSize: 1 }}>{item.result_message}</Text>
                </Box>
              )}

              {item.error_details && (
                <InfoBox variant="danger">
                  <Box>
                    <Text sx={{ fontSize: 0, mb: 1, fontWeight: "bold" }}>Error Details</Text>
                    <Text sx={{ fontSize: 1, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                      {item.error_details}
                    </Text>
                  </Box>
                </InfoBox>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
