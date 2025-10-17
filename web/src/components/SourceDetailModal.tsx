import React, { useState, useEffect, useCallback } from "react"
import { Box, Button, Flex, Heading, Text, Grid, Spinner } from "theme-ui"
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs } from "firebase/firestore"
import { getFirestoreInstance } from "../utils/firestore"
import { StatusBadge } from "./ui/StatusBadge"
import type { QueueItem } from "../types/job-queue"
import { logger } from "../utils/logger"

interface JobSource {
  id: string
  company_name: string
  company_website?: string
  careers_page_url?: string
  source_type?: string
  priority_score?: number
  priority_tier?: string
  scraping_enabled?: boolean
  last_scraped_at?: string
  next_scrape_at?: string
  scrape_frequency_days?: number
  total_jobs_found?: number
  notes?: string
  created_at: string
  updated_at: string
}

interface SourceDetailModalProps {
  isOpen: boolean
  onClose: () => void
  source: JobSource | null
}

/**
 * Modal for displaying detailed source information and scrape history
 */
export const SourceDetailModal: React.FC<SourceDetailModalProps> = ({ isOpen, onClose, source }) => {
  const [scrapeHistory, setScrapeHistory] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadScrapeHistory = useCallback(async () => {
    if (!source?.careers_page_url) {
      return
    }

    setLoading(true)
    try {
      const db = getFirestoreInstance()
      const queueRef = collection(db, "job-queue")

      // Query for queue items that match this source's URL
      const historyQuery = query(
        queueRef,
        where("url", "==", source.careers_page_url),
        where("type", "in", ["company", "scrape"]),
        orderBy("created_at", "desc"),
        firestoreLimit(20)
      )

      const snapshot = await getDocs(historyQuery)
      const items: QueueItem[] = []

      snapshot.forEach((doc) => {
        const data = doc.data() as Record<string, unknown>
        items.push({
          id: doc.id,
          type: data.type as QueueItem["type"],
          status: data.status as QueueItem["status"],
          url: data.url as string,
          company_name: data.company_name as string,
          company_id: (data.company_id as string | undefined) ?? null,
          source: (data.source as QueueItem["source"] | undefined) ?? "automated_scan",
          submitted_by: (data.submitted_by as string | undefined) ?? null,
          retry_count: (data.retry_count as number | undefined) ?? 0,
          max_retries: (data.max_retries as number | undefined) ?? 3,
          result_message: data.result_message as string | undefined,
          error_details: data.error_details as string | undefined,
          created_at:
            (data.created_at as { toDate?: () => Date })?.toDate?.()?.toISOString() || (data.created_at as string),
          updated_at:
            (data.updated_at as { toDate?: () => Date })?.toDate?.()?.toISOString() || (data.updated_at as string),
          processed_at: (data.processed_at as { toDate?: () => Date } | undefined)?.toDate?.()?.toISOString(),
          completed_at: (data.completed_at as { toDate?: () => Date } | undefined)?.toDate?.()?.toISOString(),
          scrape_config: data.scrape_config as QueueItem["scrape_config"] | undefined,
        })
      })

      setScrapeHistory(items)
      logger.info("Scrape history loaded", { sourceId: source.id, count: items.length })
    } catch (err) {
      logger.error("Failed to load scrape history", err as Error, { sourceId: source?.id })
    } finally {
      setLoading(false)
    }
  }, [source])

  useEffect(() => {
    if (isOpen && source) {
      void loadScrapeHistory()
    }
  }, [isOpen, source, loadScrapeHistory])

  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) {
      return "—"
    }
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffDays === 0) {
        return "Today"
      } else if (diffDays === 1) {
        return "Yesterday"
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`
      }
      return date.toLocaleDateString()
    } catch {
      return "—"
    }
  }

  if (!isOpen || !source) {
    return null
  }

  // Calculate stats from scrape history
  const totalScrapes = scrapeHistory.length
  const successfulScrapes = scrapeHistory.filter((item) => item.status === "success").length
  const failedScrapes = scrapeHistory.filter((item) => item.status === "failed").length
  const successRate = totalScrapes > 0 ? Math.round((successfulScrapes / totalScrapes) * 100) : 0

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        p: 3,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bg: "background",
          borderRadius: "md",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            p: 4,
            borderBottom: "1px solid",
            borderColor: "muted",
          }}
        >
          <Heading as="h2" sx={{ fontSize: 4 }}>
            {source.company_name}
          </Heading>
          <Button variant="secondary" onClick={onClose} sx={{ fontSize: 2 }}>
            ✕
          </Button>
        </Flex>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          {/* Source Details */}
          <Box sx={{ mb: 4 }}>
            <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
              Source Details
            </Heading>
            <Grid columns={[1, 2]} gap={3} sx={{ variant: "cards.primary", p: 3 }}>
              <Box>
                <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Status</Text>
                <Flex sx={{ gap: 2, alignItems: "center" }}>
                  {source.scraping_enabled ? (
                    <StatusBadge status="success">Enabled</StatusBadge>
                  ) : (
                    <StatusBadge status="danger">Disabled</StatusBadge>
                  )}
                </Flex>
              </Box>
              {source.priority_tier && (
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Priority Tier</Text>
                  <Text sx={{ fontSize: 2, fontWeight: "medium" }}>Tier {source.priority_tier.toUpperCase()}</Text>
                </Box>
              )}
              {source.priority_score !== undefined && (
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Priority Score</Text>
                  <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{source.priority_score}</Text>
                </Box>
              )}
              {source.source_type && (
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Source Type</Text>
                  <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{source.source_type}</Text>
                </Box>
              )}
              {source.scrape_frequency_days !== undefined && (
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Scrape Frequency</Text>
                  <Text sx={{ fontSize: 2, fontWeight: "medium" }}>Every {source.scrape_frequency_days} days</Text>
                </Box>
              )}
              {source.last_scraped_at && (
                <Box>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Last Scraped</Text>
                  <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{formatRelativeDate(source.last_scraped_at)}</Text>
                </Box>
              )}
              {source.careers_page_url && (
                <Box sx={{ gridColumn: ["1", "1 / -1"] }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Careers Page URL</Text>
                  <a
                    href={source.careers_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit", wordBreak: "break-all" }}
                  >
                    {source.careers_page_url}
                  </a>
                </Box>
              )}
            </Grid>
          </Box>

          {/* Scraping Stats */}
          <Box sx={{ mb: 4 }}>
            <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
              Scraping Statistics
            </Heading>
            <Grid columns={[2, 4]} gap={3}>
              <Box sx={{ variant: "cards.primary", p: 3 }}>
                <Text
                  sx={{
                    fontSize: 0,
                    color: "textMuted",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Jobs Found
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: "bold", color: "primary" }}>{source.total_jobs_found || 0}</Text>
              </Box>
              <Box sx={{ variant: "cards.primary", p: 3 }}>
                <Text
                  sx={{
                    fontSize: 0,
                    color: "textMuted",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Scrapes
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: "bold" }}>{totalScrapes}</Text>
              </Box>
              <Box sx={{ variant: "cards.primary", p: 3 }}>
                <Text
                  sx={{
                    fontSize: 0,
                    color: "textMuted",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Success Rate
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: "bold", color: "success" }}>{successRate}%</Text>
              </Box>
              <Box sx={{ variant: "cards.primary", p: 3 }}>
                <Text
                  sx={{
                    fontSize: 0,
                    color: "textMuted",
                    mb: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Failed Scrapes
                </Text>
                <Text sx={{ fontSize: 4, fontWeight: "bold", color: "danger" }}>{failedScrapes}</Text>
              </Box>
            </Grid>
          </Box>

          {/* Scrape History */}
          <Box>
            <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
              Recent Scrape History
            </Heading>
            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Spinner size={32} />
              </Box>
            ) : scrapeHistory.length === 0 ? (
              <Box sx={{ variant: "cards.primary", p: 3, textAlign: "center" }}>
                <Text sx={{ color: "textMuted" }}>No scrape history found for this source</Text>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {scrapeHistory.map((item) => (
                  <Box key={item.id} sx={{ variant: "cards.primary", p: 3 }}>
                    <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Flex sx={{ alignItems: "center", gap: 2 }}>
                        <StatusBadge status={item.status} />
                        <Text sx={{ fontSize: 1, color: "textMuted" }}>{formatRelativeDate(item.created_at)}</Text>
                      </Flex>
                      <Text sx={{ fontSize: 1, fontFamily: "monospace", color: "textMuted" }}>{item.type}</Text>
                    </Flex>
                    {item.result_message && <Text sx={{ fontSize: 1, color: "textMuted" }}>{item.result_message}</Text>}
                    {item.error_details && (
                      <Text sx={{ fontSize: 1, color: "danger", fontFamily: "monospace", mt: 1 }}>
                        {item.error_details}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Flex
          sx={{
            justifyContent: "flex-end",
            p: 4,
            borderTop: "1px solid",
            borderColor: "muted",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
