/**
 * Companies Tab
 *
 * Display all companies from the job-finder database.
 * Shows company information scraped and cached by the job-finder Python application.
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Spinner, Grid, Input } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { logger } from "../../utils/logger"
import { StatusBadge } from "../ui/StatusBadge"

interface Company {
  id: string
  name: string
  website: string
  about?: string
  culture?: string
  mission?: string
  industry?: string
  founded?: string
  company_size_category?: "large" | "medium" | "small"
  headquarters_location?: string
  created_at: string
  updated_at: string
  last_scraped_at?: string
}

export const CompaniesTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!authLoading) {
      void loadCompanies()
    }
  }, [authLoading])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)

      // Import firebase utilities
      const { collection, getDocs } = await import("firebase/firestore")
      const { getFirestoreInstance } = await import("../../utils/firestore")

      const db = getFirestoreInstance()
      const companiesRef = collection(db, "companies")
      const snapshot = await getDocs(companiesRef)

      const companiesData: Company[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        companiesData.push({
          id: doc.id,
          name: data.name || "Unknown",
          website: data.website || "",
          about: data.about,
          culture: data.culture,
          mission: data.mission,
          industry: data.industry,
          founded: data.founded,
          company_size_category: data.company_size_category,
          headquarters_location: data.headquarters_location,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || "",
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at || "",
          last_scraped_at: data.last_scraped_at?.toDate?.()?.toISOString() || data.last_scraped_at,
        })
      })

      // Sort by name
      companiesData.sort((a, b) => a.name.localeCompare(b.name))

      setCompanies(companiesData)
      logger.info("Companies loaded", { count: companiesData.length })
    } catch (err) {
      logger.error("Failed to load companies", err as Error, { component: "CompaniesTab" })
      setError(err instanceof Error ? err.message : "Failed to load companies")
    } finally {
      setLoading(false)
    }
  }

  // Filter companies by search query
  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) {
      return true
    }
    const query = searchQuery.toLowerCase()
    return (
      company.name.toLowerCase().includes(query) ||
      company.website.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query) ||
      company.headquarters_location?.toLowerCase().includes(query)
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

  // Get size badge color
  const getSizeColor = (size?: string) => {
    switch (size) {
      case "large":
        return "blue"
      case "medium":
        return "orange"
      case "small":
        return "green"
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
          Companies
        </Heading>
        <Flex sx={{ alignItems: "center", gap: 2 }}>
          {loading && <Spinner size={16} />}
          <Button onClick={() => void loadCompanies()} variant="secondary.sm">
            Refresh
          </Button>
        </Flex>
      </Flex>

      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Company information scraped and cached by the job-finder application.
      </Text>

      {/* Search */}
      <Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
        <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Search</Text>
        <Input
          type="text"
          placeholder="Search by name, website, industry, or location..."
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
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Total Companies</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold" }}>{filteredCompanies.length}</Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Large</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "blue" }}>
            {filteredCompanies.filter((c) => c.company_size_category === "large").length}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Medium</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "orange" }}>
            {filteredCompanies.filter((c) => c.company_size_category === "medium").length}
          </Text>
        </Box>
        <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
          <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Small</Text>
          <Text sx={{ fontSize: 4, fontWeight: "bold", color: "green" }}>
            {filteredCompanies.filter((c) => c.company_size_category === "small").length}
          </Text>
        </Box>
      </Flex>

      {/* Companies List */}
      {loading && companies.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Spinner size={32} />
        </Box>
      ) : filteredCompanies.length === 0 ? (
        <Box sx={{ variant: "cards.primary", p: 4, textAlign: "center" }}>
          <Text sx={{ color: "textMuted" }}>
            {searchQuery ? "No companies match your search" : "No companies found"}
          </Text>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredCompanies.map((company) => (
            <Box key={company.id} sx={{ variant: "cards.primary", p: 4 }}>
              <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Flex sx={{ alignItems: "center", gap: 2, mb: 2 }}>
                    <Text sx={{ fontSize: 3, fontWeight: "bold" }}>{company.name}</Text>
                    {company.company_size_category && (
                      <StatusBadge status={getSizeColor(company.company_size_category)}>
                        {company.company_size_category}
                      </StatusBadge>
                    )}
                  </Flex>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "14px",
                        color: "var(--theme-ui-colors-primary)",
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "8px",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                      onFocus={(e) => (e.currentTarget.style.textDecoration = "underline")}
                      onBlur={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                      {company.website}
                    </a>
                  )}
                </Box>
              </Flex>

              <Grid columns={[1, 2, 4]} gap={3} sx={{ mb: 3 }}>
                {company.industry && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Industry</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{company.industry}</Text>
                  </Box>
                )}
                {company.headquarters_location && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Headquarters</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{company.headquarters_location}</Text>
                  </Box>
                )}
                {company.founded && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Founded</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{company.founded}</Text>
                  </Box>
                )}
                {company.last_scraped_at && (
                  <Box>
                    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Last Scraped</Text>
                    <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{formatDate(company.last_scraped_at)}</Text>
                  </Box>
                )}
              </Grid>

              {company.about && (
                <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mb: 2 }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>About</Text>
                  <Text sx={{ fontSize: 1 }}>{company.about}</Text>
                </Box>
              )}

              {company.culture && (
                <Box sx={{ p: 2, bg: "muted", borderRadius: "sm", mb: 2 }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>Culture</Text>
                  <Text sx={{ fontSize: 1 }}>{company.culture}</Text>
                </Box>
              )}

              {company.mission && (
                <Box sx={{ p: 2, bg: "muted", borderRadius: "sm" }}>
                  <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, fontWeight: "bold" }}>Mission</Text>
                  <Text sx={{ fontSize: 1 }}>{company.mission}</Text>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
