/**
 * Sources Tab
 *
 * Display all job sources from the job-finder database.
 * Shows job board/source information used for scraping.
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Spinner, Grid, Input } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { logger } from "../../utils/logger"
import { StatusBadge } from "../ui/StatusBadge"

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
  const { loading: authLoading } = useAuth()
  const [sources, setSources] = useState<JobSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

  if (authLoading) {
    return <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>Loading...</Box>
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Heading as="h2" sx={{ fontSize: 4 }}>
          Job Sources
        </Heading>
        <Flex sx={{ alignItems: "center", gap: 2 }}>
          {loading && <Spinner size={16} />}
          <Button onClick={() => void loadSources()} variant="secondary.sm">
            Refresh
          </Button>
        </Flex>
      </Flex>

      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Job board and company career page sources tracked by the job-finder application.
      </Text>

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

      {/* Error Display */}
      {error && (
        <Box
          sx={{
            p: 3,
            bg: "danger",
            color: "background",
            borderRadius: "md",
            mb: 3,
          }}
        >
          <Text sx={{ fontWeight: "medium" }}>{error}</Text>
        </Box>
      )}

      {/* Stats */}
      <Flex sx={{ gap: 3, mb: 4, flexWrap: "wrap" }}>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Total Sources</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold" }}>{filteredSources.length}</Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Enabled</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "green" }}>
            {filteredSources.filter((s) => s.scraping_enabled).length}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Total Jobs Found</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "blue" }}>
            {filteredSources.reduce((sum, s) => sum + (s.total_jobs_found || 0), 0)}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Avg Priority Score</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "orange" }}>
            {filteredSources.length > 0
              ? Math.round(
                  filteredSources.reduce((sum, s) => sum + (s.priority_score || 0), 0) / filteredSources.length
                )
              : 0}
          </Text>
        </Box>
      </Flex>

      {/* Sources List */}
      {loading && sources.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Spinner size={32} />
        </Box>
      ) : filteredSources.length === 0 ? (
        <Box sx={{ variant: "cards.primary", p: 4, textAlign: "center" }}>
          <Text sx={{ color: "textMuted" }}>
            {searchQuery ? "No sources match your search" : "No job sources found"}
          </Text>
        </Box>
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
    </Box>
  )
}
