import React from "react"
import { Box, Flex, Heading, Text, Grid } from "theme-ui"
import type { QueueItem } from "../types/job-queue"
import { StatusBadge, Modal, ModalHeader, ModalBody, ModalFooter, InfoBox } from "./ui"

interface ScrapeResultModalProps {
  isOpen: boolean
  onClose: () => void
  scrapeItem: QueueItem | null
}

/**
 * Modal for displaying detailed scrape results
 */
export const ScrapeResultModal: React.FC<ScrapeResultModalProps> = ({ isOpen, onClose, scrapeItem }) => {
  if (!scrapeItem) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) {
      return "N/A"
    }
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    const seconds = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`
  }

  const config = scrapeItem.scrape_config

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title="Scrape Details" onClose={onClose} />

      <ModalBody>
        {/* Status */}
        <Flex sx={{ alignItems: "center", gap: 2, mb: 4 }}>
          <Text sx={{ fontSize: 1, color: "textMuted" }}>Status:</Text>
          <StatusBadge status={scrapeItem.status} />
        </Flex>

        {/* Configuration */}
        <Box sx={{ mb: 4 }}>
          <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
            Configuration
          </Heading>
          <Grid columns={[1, 2]} gap={3} sx={{ variant: "cards.primary", p: 3 }}>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Target Matches</Text>
              <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{config?.target_matches ?? "Default (5)"}</Text>
            </Box>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Max Sources</Text>
              <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{config?.max_sources ?? "Default (20)"}</Text>
            </Box>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Min Match Score</Text>
              <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{config?.min_match_score ?? "Default (80)"} / 100</Text>
            </Box>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Source Filter</Text>
              <Text sx={{ fontSize: 2, fontWeight: "medium" }}>
                {config?.source_ids && config.source_ids.length > 0
                  ? `${config.source_ids.length} specific sources`
                  : "All sources (rotation)"}
              </Text>
            </Box>
          </Grid>
        </Box>

        {/* Timing */}
        <Box sx={{ mb: 4 }}>
          <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
            Timing
          </Heading>
          <Grid columns={[1, 2]} gap={3} sx={{ variant: "cards.primary", p: 3 }}>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Created</Text>
              <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(scrapeItem.created_at)}</Text>
            </Box>
            {scrapeItem.processed_at && (
              <Box>
                <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Started</Text>
                <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(scrapeItem.processed_at)}</Text>
              </Box>
            )}
            {scrapeItem.completed_at && (
              <Box>
                <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Completed</Text>
                <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(scrapeItem.completed_at)}</Text>
              </Box>
            )}
            {scrapeItem.processed_at && scrapeItem.completed_at && (
              <Box>
                <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Duration</Text>
                <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                  {formatDuration(scrapeItem.processed_at, scrapeItem.completed_at)}
                </Text>
              </Box>
            )}
          </Grid>
        </Box>

        {/* Results (if available) */}
        {scrapeItem.result_message && (
          <Box sx={{ mb: 4 }}>
            <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
              Results
            </Heading>
            <Box sx={{ variant: "cards.primary", p: 3 }}>
              <Text>{scrapeItem.result_message}</Text>
            </Box>
          </Box>
        )}

        {/* Error Details (if failed) */}
        {scrapeItem.error_details && (
          <Box sx={{ mb: 4 }}>
            <Heading as="h3" sx={{ fontSize: 3, mb: 3, color: "danger" }}>
              Error Details
            </Heading>
            <InfoBox variant="danger">
              <Text sx={{ fontFamily: "monospace", fontSize: 1, whiteSpace: "pre-wrap" }}>
                {scrapeItem.error_details}
              </Text>
            </InfoBox>
          </Box>
        )}

        {/* Queue Info */}
        <Box>
          <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
            Queue Information
          </Heading>
          <Grid columns={[1, 2]} gap={3} sx={{ variant: "cards.primary", p: 3 }}>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Queue ID</Text>
              <Text sx={{ fontSize: 1, fontFamily: "monospace", wordBreak: "break-all" }}>{scrapeItem.id}</Text>
            </Box>
            <Box>
              <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Retry Count</Text>
              <Text sx={{ fontSize: 1, fontWeight: "medium" }}>
                {scrapeItem.retry_count} / {scrapeItem.max_retries}
              </Text>
            </Box>
          </Grid>
        </Box>
      </ModalBody>

      <ModalFooter
        primaryAction={{
          label: "Close",
          onClick: onClose,
          variant: "secondary",
        }}
      />
    </Modal>
  )
}
