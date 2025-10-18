/**
 * Sources Tab
 *
 * Display all job sources from the job-finder database.
 * Shows job board/source information used for scraping.
 */

import React, { useState, useEffect, useCallback } from "react"
import { Box, Text, Button, Flex, Grid, Input, Heading } from "theme-ui"
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs } from "firebase/firestore"
import { useAuth } from "../../hooks/useAuth"
import { logger } from "../../utils/logger"
import { TabHeader, LoadingState, EmptyState, StatsGrid, InfoBox, StatusBadge } from "../ui"
import { AddSourceModal } from "../AddSourceModal"
import { jobQueueClient } from "../../api/job-queue-client"
import { getFirestoreInstance } from "../../utils/firestore"
import type { QueueItem } from "../../types/job-queue"

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

interface SourceWithHistory extends JobSource {
  scrapeHistory?: QueueItem[]
  historyLoading?: boolean
  historyExpanded?: boolean
}

export const SourcesTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [sources, setSources] = useState<SourceWithHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth to initialize (Firebase app initialization happens in AuthContext)
    // Even though we don't need auth for public data, we need Firebase to be initialized
    if (!authLoading) {
      void loadSources()
    }
  }, [authLoading])

  const loadSources = async () => {
    try {
      setLoading(true)
      setError(null)

      // Import firebase utilities
      const { collection, getDocs } = await import("firebase/firestore")
      const { getFirestoreInstance } = await import("../../utils/firestore")

      const db = getFirestoreInstance()
      const sourcesRef = collection(db, "job-sources")
      const snapshot = await getDocs(sourcesRef)

      const sourcesData: JobSource[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        sourcesData.push({
          id: doc.id,
          company_name: (data.company_name ?? data.name) || "Unknown",
          company_website: data.company_website || data.website,
          careers_page_url: data.careers_page_url || data.url,
          source_type: data.source_type,
          priority_score: data.priority_score,
          priority_tier: data.priority_tier,
          scraping_enabled: data.scraping_enabled !== false, // Default to true
          last_scraped_at: data.last_scraped_at?.toDate?.()?.toISOString() || data.last_scraped_at,
          next_scrape_at: data.next_scrape_at?.toDate?.()?.toISOString() || data.next_scrape_at,
          scrape_frequency_days: data.scrape_frequency_days,
          total_jobs_found: data.total_jobs_found || 0,
          notes: data.notes,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || "",
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at || "",
        })
      })

      // Sort by priority score (highest first), then by name
      sourcesData.sort((a, b) => {
        if (a.priority_score !== b.priority_score) {
          return (b.priority_score || 0) - (a.priority_score || 0)
        }
        return a.company_name.localeCompare(b.company_name)
      })

      setSources(sourcesData)
      logger.info("Job sources loaded", { count: sourcesData.length })
    } catch (err) {
      logger.error("Failed to load job sources", err as Error, { component: "SourcesTab" })
      setError(err instanceof Error ? err.message : "Failed to load job sources")
    } finally {
      setLoading(false)
    }
  }

  // Filter sources by search query
  const filteredSources = sources.filter((source) => {
    if (!searchQuery) {
      return true
    }
    const query = searchQuery.toLowerCase()
    return (
      source.company_name.toLowerCase().includes(query) ||
      source.company_website?.toLowerCase().includes(query) ||
      source.careers_page_url?.toLowerCase().includes(query) ||
      source.source_type?.toLowerCase().includes(query) ||
      source.priority_tier?.toLowerCase().includes(query)
    )
  })

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "—"
    }
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return "—"
    }
  }

  // Get tier badge color
  const getTierColor = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case "S":
        return "purple"
      case "A":
        return "blue"
      case "B":
        return "green"
      case "C":
        return "orange"
      case "D":
        return "red"
      default:
        return "gray"
    }
  }

  const handleAddSource = async (companyName: string, careersUrl: string) => {
    if (!user) {
      setError("You must be signed in to add a source")
      return
    }

    try {
      setError(null)
      setSubmitSuccess(null)

      const response = await jobQueueClient.submitCompanySource(companyName, careersUrl)
      setSubmitSuccess(`Source submission successful! Queue ID: ${response.queueItemId || "N/A"}`)
      logger.info("Source added to queue", {
        queueItemId: response.queueItemId,
        companyName,
        careersUrl,
      })

      setIsAddModalOpen(false)

      // Refresh sources after a delay to allow processing
      setTimeout(() => {
        void loadSources()
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit source"
      setError(errorMessage)
      logger.error("Failed to add source", err as Error, { companyName, careersUrl })
    }
  }

  const loadScrapeHistory = useCallback(async (source: SourceWithHistory) => {
    if (!source.careers_page_url || source.scrapeHistory) {
      return
    }

    // Update source to show loading
    setSources((prev) =>
      prev.map((s) => (s.id === source.id ? { ...s, historyLoading: true, historyExpanded: true } : s))
    )

    try {
      const db = getFirestoreInstance()
      const queueRef = collection(db, "job-queue")

      // Query for queue items that match this source's URL
      const historyQuery = query(
        queueRef,
        where("url", "==", source.careers_page_url),
        where("type", "in", ["company", "scrape"]),
        orderBy("created_at", "desc"),
        firestoreLimit(10)
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

      // Update source with history
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, scrapeHistory: items, historyLoading: false } : s))
      )

      logger.info("Scrape history loaded", { sourceId: source.id, count: items.length })
    } catch (err) {
      logger.error("Failed to load scrape history", err as Error, { sourceId: source.id })
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, historyLoading: false } : s)))
    }
  }, [])

  const toggleHistory = (source: SourceWithHistory) => {
    if (!source.historyExpanded) {
      void loadScrapeHistory(source)
    } else {
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, historyExpanded: false } : s)))
    }
  }

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

  if (authLoading) {
    return <LoadingState message="Loading authentication..." />
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
      <TabHeader
        title="Job Sources"
        description="Job board and company career page sources tracked by the job-finder application."
        actions={
          <>
            <Button onClick={() => setIsAddModalOpen(true)} disabled={!user}>
              Add Source
            </Button>
            <Button onClick={() => void loadSources()} variant="secondary.sm">
              Refresh
            </Button>
          </>
        }
      />

      {/* Search */}
      <Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
        <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Search</Text>
        <Input
          type="text"
          placeholder="Search by company, URL, type, or tier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ variant: "forms.input" }}
        />
      </Box>

      {/* Status Messages */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <InfoBox variant="danger">{error}</InfoBox>
        </Box>
      )}

      {submitSuccess && (
        <Box sx={{ mb: 4 }}>
          <InfoBox variant="success">
            <Text sx={{ fontWeight: "medium", mb: 2 }}>{submitSuccess}</Text>
            <Text sx={{ fontSize: 1 }}>
              The job-finder application will process this source and add it to the database.
            </Text>
          </InfoBox>
        </Box>
      )}

      {!user && (
        <Box sx={{ mb: 4 }}>
          <InfoBox variant="info">Please sign in to add new sources</InfoBox>
        </Box>
      )}

      {/* Stats */}
      <StatsGrid
        columns={[2, 4]}
        stats={[
          {
            label: "Total Sources",
            value: filteredSources.length,
          },
          {
            label: "Enabled",
            value: filteredSources.filter((s) => s.scraping_enabled).length,
            color: "green",
          },
          {
            label: "Total Jobs Found",
            value: filteredSources.reduce((sum, s) => sum + (s.total_jobs_found || 0), 0),
            color: "blue",
          },
          {
            label: "Avg Priority Score",
            value:
              filteredSources.length > 0
                ? Math.round(
                    filteredSources.reduce((sum, s) => sum + (s.priority_score || 0), 0) / filteredSources.length
                  )
                : 0,
            color: "orange",
          },
        ]}
      />

      {/* Sources List */}
      {loading && sources.length === 0 ? (
        <LoadingState message="Loading job sources..." />
      ) : filteredSources.length === 0 ? (
        <EmptyState icon="📭" message={searchQuery ? "No sources match your search" : "No job sources found"} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredSources.map((source) => {
            const totalScrapes = source.scrapeHistory?.length || 0
            const successfulScrapes = source.scrapeHistory?.filter((item) => item.status === "success").length || 0
            const failedScrapes = source.scrapeHistory?.filter((item) => item.status === "failed").length || 0
            const successRate = totalScrapes > 0 ? Math.round((successfulScrapes / totalScrapes) * 100) : 0

            return (
              <Box key={source.id} sx={{ variant: "cards.primary", p: 3 }}>
                {/* Header */}
                <Flex sx={{ alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
                  <Box sx={{ flex: 1, minWidth: "200px" }}>
                    <Flex sx={{ alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
                      <Text sx={{ fontSize: 2, fontWeight: "bold" }}>{source.company_name}</Text>
                      {source.priority_tier && (
                        <StatusBadge status={getTierColor(source.priority_tier)}>
                          Tier {source.priority_tier.toUpperCase()}
                        </StatusBadge>
                      )}
                      {source.scraping_enabled ? (
                        <StatusBadge status="green">Enabled</StatusBadge>
                      ) : (
                        <StatusBadge status="red">Disabled</StatusBadge>
                      )}
                    </Flex>
                    {source.careers_page_url && (
                      <a
                        href={source.careers_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "13px",
                          color: "var(--theme-ui-colors-primary)",
                          textDecoration: "none",
                          display: "block",
                          wordBreak: "break-all",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                        onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {source.careers_page_url}
                      </a>
                    )}
                  </Box>
                </Flex>

                {/* Stats Grid */}
                <Grid columns={[2, 3, 6]} gap={2} sx={{ mb: 3 }}>
                  {source.source_type && (
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Type</Text>
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.source_type}</Text>
                    </Box>
                  )}
                  {source.priority_score !== undefined && (
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Score</Text>
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.priority_score}</Text>
                    </Box>
                  )}
                  {source.scrape_frequency_days !== undefined && (
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Frequency</Text>
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.scrape_frequency_days}d</Text>
                    </Box>
                  )}
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Jobs Found</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium", color: "primary" }}>
                      {source.total_jobs_found || 0}
                    </Text>
                  </Box>
                  {source.last_scraped_at && (
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Last Scraped</Text>
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(source.last_scraped_at)}</Text>
                    </Box>
                  )}
                  {source.next_scrape_at && (
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Next Scrape</Text>
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(source.next_scrape_at)}</Text>
                    </Box>
                  )}
                </Grid>

                {/* Scraping Statistics */}
                <Box sx={{ mb: 3, p: 2, bg: "muted", borderRadius: "sm" }}>
                  <Flex sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Text sx={{ fontSize: 1, fontWeight: "bold" }}>Scraping Statistics</Text>
                    <Button
                      onClick={() => toggleHistory(source)}
                      variant="link"
                      sx={{ fontSize: 0, p: 1, color: "primary" }}
                    >
                      {source.historyExpanded ? "Hide History ▲" : "Show History ▼"}
                    </Button>
                  </Flex>
                  <Grid columns={[2, 4]} gap={2}>
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted" }}>Total Scrapes</Text>
                      <Text sx={{ fontSize: 2, fontWeight: "bold" }}>{totalScrapes}</Text>
                    </Box>
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted" }}>Success Rate</Text>
                      <Text sx={{ fontSize: 2, fontWeight: "bold", color: "success" }}>{successRate}%</Text>
                    </Box>
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted" }}>Successful</Text>
                      <Text sx={{ fontSize: 2, fontWeight: "bold", color: "success" }}>{successfulScrapes}</Text>
                    </Box>
                    <Box>
                      <Text sx={{ fontSize: 0, color: "textMuted" }}>Failed</Text>
                      <Text sx={{ fontSize: 2, fontWeight: "bold", color: "danger" }}>{failedScrapes}</Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Scrape History (Expandable) */}
                {source.historyExpanded && (
                  <Box sx={{ mt: 3 }}>
                    <Heading as="h4" sx={{ fontSize: 1, mb: 2, fontWeight: "bold" }}>
                      Recent Scrape History
                    </Heading>
                    {source.historyLoading ? (
                      <LoadingState message="Loading history..." />
                    ) : source.scrapeHistory && source.scrapeHistory.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {source.scrapeHistory.map((item) => (
                          <Box key={item.id} sx={{ p: 2, bg: "background", borderRadius: "sm", border: "1px solid", borderColor: "muted" }}>
                            <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 2 }}>
                              <Flex sx={{ alignItems: "center", gap: 2 }}>
                                <StatusBadge status={item.status} />
                                <Text sx={{ fontSize: 0, color: "textMuted" }}>{formatRelativeDate(item.created_at)}</Text>
                              </Flex>
                              <Text sx={{ fontSize: 0, fontFamily: "monospace", color: "textMuted" }}>{item.type}</Text>
                            </Flex>
                            {item.result_message && (
                              <Text sx={{ fontSize: 0, color: "textMuted" }}>{item.result_message}</Text>
                            )}
                            {item.error_details && (
                              <Text sx={{ fontSize: 0, color: "danger", fontFamily: "monospace", mt: 1 }}>
                                {item.error_details}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <InfoBox variant="info">No scrape history found</InfoBox>
                    )}
                  </Box>
                )}

                {/* Notes */}
                {source.notes && (
                  <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mt: 3 }}>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>Notes</Text>
                    <Text sx={{ fontSize: 1 }}>{source.notes}</Text>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      {/* Modals */}
      <AddSourceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSource} />
    </Box>
  )
}
