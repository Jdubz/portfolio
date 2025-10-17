/**
 * Job Finder Configuration Tab
 *
 * Tab wrapper for managing job queue stop lists
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { jobQueueClient } from "../../api"
import { logger } from "../../utils/logger"
import type { StopList } from "../../types/job-queue"

export const JobFinderConfigTab: React.FC = () => {
  const { user, loading: authLoading, isEditor } = useAuth()
  const [stopList, setStopList] = useState<StopList>({
    excludedCompanies: [],
    excludedKeywords: [],
    excludedDomains: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [newCompany, setNewCompany] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newDomain, setNewDomain] = useState("")

  useEffect(() => {
    if (user && isEditor) {
      void loadStopList()
    }
  }, [user, isEditor])

  const loadStopList = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await jobQueueClient.getStopList()
      setStopList(data)
      logger.info("Stop list loaded", { count: data.excludedCompanies.length })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load stop list"
      logger.error("Failed to load stop list", err instanceof Error ? err : new Error(errorMessage))
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const saveStopList = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await jobQueueClient.updateStopList(stopList)
      setSuccessMessage("Stop list updated successfully!")
      logger.info("Stop list updated")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save stop list"
      logger.error("Failed to save stop list", err instanceof Error ? err : new Error(errorMessage))
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const addCompany = () => {
    if (newCompany.trim() && !stopList.excludedCompanies.includes(newCompany.trim())) {
      setStopList({
        ...stopList,
        excludedCompanies: [...stopList.excludedCompanies, newCompany.trim()],
      })
      setNewCompany("")
    }
  }

  const removeCompany = (index: number) => {
    setStopList({
      ...stopList,
      excludedCompanies: stopList.excludedCompanies.filter((_, i) => i !== index),
    })
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !stopList.excludedKeywords.includes(newKeyword.trim())) {
      setStopList({
        ...stopList,
        excludedKeywords: [...stopList.excludedKeywords, newKeyword.trim()],
      })
      setNewKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    setStopList({
      ...stopList,
      excludedKeywords: stopList.excludedKeywords.filter((_, i) => i !== index),
    })
  }

  const addDomain = () => {
    if (newDomain.trim() && !stopList.excludedDomains.includes(newDomain.trim())) {
      setStopList({
        ...stopList,
        excludedDomains: [...stopList.excludedDomains, newDomain.trim()],
      })
      setNewDomain("")
    }
  }

  const removeDomain = (index: number) => {
    setStopList({
      ...stopList,
      excludedDomains: stopList.excludedDomains.filter((_, i) => i !== index),
    })
  }

  if (authLoading || loading) {
    return <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>Loading...</Box>
  }

  if (!user || !isEditor) {
    return <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>Editor role required to access this page</Box>
  }

  return (
    <Box sx={{ maxWidth: "900px", mx: "auto" }}>
      <Heading as="h2" sx={{ mb: 2, fontSize: 4 }}>
        Job Finder Configuration
      </Heading>
      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>Manage exclusion lists for the job finder system</Text>

      {error && (
        <Box sx={{ p: 4, bg: "danger", color: "background", borderRadius: "md", mb: 4 }}>
          <Text sx={{ fontWeight: "medium" }}>{error}</Text>
        </Box>
      )}

      {successMessage && (
        <Box sx={{ p: 4, bg: "success", color: "background", borderRadius: "md", mb: 4 }}>
          <Text sx={{ fontWeight: "medium" }}>{successMessage}</Text>
        </Box>
      )}

      {/* Excluded Companies */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ mb: 3, fontSize: 3 }}>
          Excluded Companies
        </Heading>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>
          Jobs from these companies will be automatically skipped
        </Text>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <input
            type="text"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCompany()}
            placeholder="Enter company name"
            style={{ flex: 1 }}
          />
          <Button onClick={addCompany} variant="secondary">
            Add
          </Button>
        </Box>

        <Box sx={{ display: "grid", gap: 2 }}>
          {stopList.excludedCompanies.length === 0 ? (
            <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>No companies excluded yet</Text>
          ) : (
            stopList.excludedCompanies.map((company, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  bg: "backgroundSecondary",
                  borderRadius: "sm",
                }}
              >
                <Text>{company}</Text>
                <Button variant="text" onClick={() => removeCompany(index)} sx={{ color: "danger", fontSize: 1 }}>
                  Remove
                </Button>
              </Box>
            ))
          )}
        </Box>
      </Box>

      {/* Save Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={saveStopList}
          disabled={saving}
          variant="primary"
          sx={{
            ...(saving && {
              bg: "textMuted",
              cursor: "not-allowed",
            }),
          }}
        >
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </Box>
    </Box>
  )
}
