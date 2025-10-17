/**
 * Job Finder Configuration Tab
 *
 * Manage all job-finder-config documents:
 * - stop-list: Excluded companies, keywords, and domains
 * - queue-settings: Queue processing configuration
 * - ai-settings: AI provider and model configuration
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Input, Label, Select, Grid, Flex } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { jobQueueClient } from "../../api"
import { logger } from "../../utils/logger"
import type { StopList, QueueSettings, AISettings, AIProvider } from "../../types/job-queue"

export const JobFinderConfigTab: React.FC = () => {
  const { user, loading: authLoading, isEditor } = useAuth()

  // Stop List State
  const [stopList, setStopList] = useState<StopList>({
    excludedCompanies: [],
    excludedKeywords: [],
    excludedDomains: [],
  })
  const [newCompany, setNewCompany] = useState("")
  const [newKeyword, setNewKeyword] = useState("")
  const [newDomain, setNewDomain] = useState("")

  // Queue Settings State
  const [queueSettings, setQueueSettings] = useState<QueueSettings>({
    maxRetries: 3,
    retryDelaySeconds: 60,
    processingTimeout: 300,
  })

  // AI Settings State
  const [aiSettings, setAISettings] = useState<AISettings>({
    provider: "claude",
    model: "claude-3-haiku-20240307",
    minMatchScore: 70,
    costBudgetDaily: 50.0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user && isEditor) {
      void loadAllConfig()
    }
  }, [user, isEditor])

  const loadAllConfig = async () => {
    setLoading(true)
    setError(null)

    try {
      const [stopListData, queueSettingsData, aiSettingsData] = await Promise.all([
        jobQueueClient.getStopList(),
        jobQueueClient.getQueueSettings(),
        jobQueueClient.getAISettings(),
      ])

      setStopList(stopListData)
      setQueueSettings(queueSettingsData)
      setAISettings(aiSettingsData)

      logger.info("Job finder configuration loaded", {
        stopListCompanies: stopListData.excludedCompanies.length,
        queueMaxRetries: queueSettingsData.maxRetries,
        aiProvider: aiSettingsData.provider,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load configuration"
      logger.error("Failed to load job finder configuration", err instanceof Error ? err : new Error(errorMessage))
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const saveAllConfig = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await Promise.all([
        jobQueueClient.updateStopList(stopList),
        jobQueueClient.updateQueueSettings(queueSettings),
        jobQueueClient.updateAISettings(aiSettings),
      ])

      setSuccessMessage("Configuration updated successfully!")
      logger.info("Job finder configuration updated")

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save configuration"
      logger.error("Failed to save job finder configuration", err instanceof Error ? err : new Error(errorMessage))
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Stop List Handlers
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
    <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
      <Heading as="h2" sx={{ mb: 2, fontSize: 4 }}>
        Job Finder Configuration
      </Heading>
      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Manage queue processing, AI settings, and exclusion lists
      </Text>

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

      {/* Queue Settings */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 3 }}>
            Queue Settings
          </Heading>
          {queueSettings.updatedAt && (
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Last updated: {new Date(queueSettings.updatedAt).toLocaleString()}
              {queueSettings.updatedBy && ` by ${queueSettings.updatedBy}`}
            </Text>
          )}
        </Flex>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>Configuration for queue processing behavior</Text>

        <Grid columns={[1, 2, 3]} gap={3}>
          <Box>
            <Label htmlFor="maxRetries" sx={{ fontSize: 1, mb: 2 }}>
              Max Retries
            </Label>
            <Input
              id="maxRetries"
              type="number"
              min={0}
              max={10}
              value={queueSettings.maxRetries}
              onChange={(e) =>
                setQueueSettings({
                  ...queueSettings,
                  maxRetries: parseInt(e.target.value) || 0,
                })
              }
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Number of times to retry failed jobs</Text>
          </Box>

          <Box>
            <Label htmlFor="retryDelay" sx={{ fontSize: 1, mb: 2 }}>
              Retry Delay (seconds)
            </Label>
            <Input
              id="retryDelay"
              type="number"
              min={10}
              max={3600}
              value={queueSettings.retryDelaySeconds}
              onChange={(e) =>
                setQueueSettings({
                  ...queueSettings,
                  retryDelaySeconds: parseInt(e.target.value) || 60,
                })
              }
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Wait time before retrying failed jobs</Text>
          </Box>

          <Box>
            <Label htmlFor="timeout" sx={{ fontSize: 1, mb: 2 }}>
              Processing Timeout (seconds)
            </Label>
            <Input
              id="timeout"
              type="number"
              min={60}
              max={1800}
              value={queueSettings.processingTimeout}
              onChange={(e) =>
                setQueueSettings({
                  ...queueSettings,
                  processingTimeout: parseInt(e.target.value) || 300,
                })
              }
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Max time to process a single job</Text>
          </Box>
        </Grid>
      </Box>

      {/* AI Settings */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 3 }}>
            AI Settings
          </Heading>
          {aiSettings.updatedAt && (
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Last updated: {new Date(aiSettings.updatedAt).toLocaleString()}
              {aiSettings.updatedBy && ` by ${aiSettings.updatedBy}`}
            </Text>
          )}
        </Flex>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>Configure AI provider and job matching parameters</Text>

        <Grid columns={[1, 2]} gap={3}>
          <Box>
            <Label htmlFor="provider" sx={{ fontSize: 1, mb: 2 }}>
              AI Provider
            </Label>
            <Select
              id="provider"
              value={aiSettings.provider}
              onChange={(e) =>
                setAISettings({
                  ...aiSettings,
                  provider: e.target.value as AIProvider,
                })
              }
              sx={{ variant: "forms.input" }}
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini (Google)</option>
            </Select>
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>AI provider for job matching</Text>
          </Box>

          <Box>
            <Label htmlFor="model" sx={{ fontSize: 1, mb: 2 }}>
              Model Name
            </Label>
            <Input
              id="model"
              type="text"
              value={aiSettings.model}
              onChange={(e) =>
                setAISettings({
                  ...aiSettings,
                  model: e.target.value,
                })
              }
              sx={{ variant: "forms.input" }}
              placeholder="claude-3-haiku-20240307"
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Specific model version to use</Text>
          </Box>

          <Box>
            <Label htmlFor="minScore" sx={{ fontSize: 1, mb: 2 }}>
              Min Match Score
            </Label>
            <Input
              id="minScore"
              type="number"
              min={0}
              max={100}
              value={aiSettings.minMatchScore}
              onChange={(e) =>
                setAISettings({
                  ...aiSettings,
                  minMatchScore: parseInt(e.target.value) || 0,
                })
              }
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Minimum score (0-100) to save a match</Text>
          </Box>

          <Box>
            <Label htmlFor="budget" sx={{ fontSize: 1, mb: 2 }}>
              Daily Cost Budget ($)
            </Label>
            <Input
              id="budget"
              type="number"
              min={0}
              step={0.01}
              value={aiSettings.costBudgetDaily}
              onChange={(e) =>
                setAISettings({
                  ...aiSettings,
                  costBudgetDaily: parseFloat(e.target.value) || 0,
                })
              }
              sx={{ variant: "forms.input" }}
            />
            <Text sx={{ fontSize: 0, color: "textMuted", mt: 1 }}>Maximum daily AI API cost</Text>
          </Box>
        </Grid>
      </Box>

      {/* Stop List */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 3 }}>
            Stop List (Exclusions)
          </Heading>
          {stopList.updatedAt && (
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Last updated: {new Date(stopList.updatedAt).toLocaleString()}
              {stopList.updatedBy && ` by ${stopList.updatedBy}`}
            </Text>
          )}
        </Flex>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>
          Manage excluded companies, keywords, and domains. Jobs matching these criteria will be automatically skipped.
        </Text>

        {/* Excluded Companies */}
        <Box sx={{ mb: 4 }}>
          <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
            Excluded Companies
          </Heading>
          <Text sx={{ color: "textMuted", mb: 3, fontSize: 1 }}>
            Jobs from these companies will be automatically skipped
          </Text>

          <Flex sx={{ gap: 2, mb: 3 }}>
            <Input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCompany()}
              placeholder="Enter company name"
              sx={{ flex: 1, variant: "forms.input" }}
            />
            <Button onClick={addCompany} variant="secondary">
              Add
            </Button>
          </Flex>

          <Box sx={{ display: "grid", gap: 2 }}>
            {stopList.excludedCompanies.length === 0 ? (
              <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>No companies excluded yet</Text>
            ) : (
              stopList.excludedCompanies.map((company, index) => (
                <Flex
                  key={index}
                  sx={{
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
                </Flex>
              ))
            )}
          </Box>
        </Box>

        {/* Excluded Keywords */}
        <Box sx={{ mb: 4 }}>
          <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
            Excluded Keywords
          </Heading>
          <Text sx={{ color: "textMuted", mb: 3, fontSize: 1 }}>
            Jobs containing these keywords will be automatically skipped
          </Text>

          <Flex sx={{ gap: 2, mb: 3 }}>
            <Input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Enter keyword or phrase"
              sx={{ flex: 1, variant: "forms.input" }}
            />
            <Button onClick={addKeyword} variant="secondary">
              Add
            </Button>
          </Flex>

          <Box sx={{ display: "grid", gap: 2 }}>
            {stopList.excludedKeywords.length === 0 ? (
              <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>No keywords excluded yet</Text>
            ) : (
              stopList.excludedKeywords.map((keyword, index) => (
                <Flex
                  key={index}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bg: "backgroundSecondary",
                    borderRadius: "sm",
                  }}
                >
                  <Text>{keyword}</Text>
                  <Button variant="text" onClick={() => removeKeyword(index)} sx={{ color: "danger", fontSize: 1 }}>
                    Remove
                  </Button>
                </Flex>
              ))
            )}
          </Box>
        </Box>

        {/* Excluded Domains */}
        <Box>
          <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
            Excluded Domains
          </Heading>
          <Text sx={{ color: "textMuted", mb: 3, fontSize: 1 }}>
            Jobs from these domains will be automatically skipped
          </Text>

          <Flex sx={{ gap: 2, mb: 3 }}>
            <Input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDomain()}
              placeholder="Enter domain (e.g., spam-site.com)"
              sx={{ flex: 1, variant: "forms.input" }}
            />
            <Button onClick={addDomain} variant="secondary">
              Add
            </Button>
          </Flex>

          <Box sx={{ display: "grid", gap: 2 }}>
            {stopList.excludedDomains.length === 0 ? (
              <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>No domains excluded yet</Text>
            ) : (
              stopList.excludedDomains.map((domain, index) => (
                <Flex
                  key={index}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bg: "backgroundSecondary",
                    borderRadius: "sm",
                  }}
                >
                  <Text>{domain}</Text>
                  <Button variant="text" onClick={() => removeDomain(index)} sx={{ color: "danger", fontSize: 1 }}>
                    Remove
                  </Button>
                </Flex>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Save Button */}
      <Flex sx={{ justifyContent: "flex-end" }}>
        <Button
          onClick={() => void saveAllConfig()}
          disabled={saving}
          variant="primary"
          sx={{
            ...(saving && {
              bg: "textMuted",
              cursor: "not-allowed",
            }),
          }}
        >
          {saving ? "Saving..." : "Save All Configuration"}
        </Button>
      </Flex>
    </Box>
  )
}
