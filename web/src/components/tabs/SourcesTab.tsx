/**
 * Sources Tab
 *
 * Display all job sources from the job-finder database.
 * Shows job board/source information used for scraping.
 */

import React, { useState, useEffect } from "react"
import { Box, Text, Button, Flex, Grid, Input } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { logger } from "../../utils/logger"
import { TabHeader, LoadingState, EmptyState, StatsGrid, InfoBox, StatusBadge } from "../ui"
import { AddSourceModal } from "../AddSourceModal"
import { SourceDetailModal } from "../SourceDetailModal"
import { jobQueueClient } from "../../api/job-queue-client"

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

export const SourcesTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [sources, setSources] = useState<JobSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<JobSource | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
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
          company_name: data.company_name || data.name || "Unknown",
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

  const handleViewDetails = (source: JobSource) => {
    setSelectedSource(source)
    setIsDetailModalOpen(true)
    logger.info("Viewing source details", { sourceId: source.id })
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
          {filteredSources.map((source) => (
            <Box key={source.id} sx={{ variant: "cards.primary", p: 4 }}>
              <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Flex sx={{ alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    <Text sx={{ fontSize: 3, fontWeight: "bold" }}>{source.company_name}</Text>
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
                        fontSize: "14px",
                        color: "var(--theme-ui-colors-primary)",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "4px",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                      onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {source.careers_page_url}
                    </a>
                  )}
                  {source.company_website && (
                    <a
                      href={source.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12px",
                        color: "var(--theme-ui-colors-textMuted)",
                        textDecoration: "none",
                        display: "block",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                      onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {source.company_website}
                    </a>
                  )}
                </Box>

                <Button onClick={() => handleViewDetails(source)} variant="secondary">
                  View Details
                </Button>
              </Flex>

              <Grid columns={[1, 2, 4]} gap={3} sx={{ mb: source.notes ? 3 : 0 }}>
                {source.source_type && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Source Type</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.source_type}</Text>
                  </Box>
                )}
                {source.priority_score !== undefined && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Priority Score</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.priority_score}</Text>
                  </Box>
                )}
                {source.scrape_frequency_days !== undefined && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Scrape Frequency</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>Every {source.scrape_frequency_days} days</Text>
                  </Box>
                )}
                {source.total_jobs_found !== undefined && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Total Jobs Found</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{source.total_jobs_found}</Text>
                  </Box>
                )}
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

              {source.notes && (
                <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mt: 3 }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>Notes</Text>
                  <Text sx={{ fontSize: 1 }}>{source.notes}</Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Modals */}
      <AddSourceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSource} />

      <SourceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        source={selectedSource}
      />
    </Box>
  )
}
