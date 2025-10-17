import React, { useState, useEffect } from "react"
import { Box, Button, Flex, Heading, Text, Label, Input, Checkbox } from "theme-ui"
import type { ScrapeConfig } from "../types/job-queue"
import { Modal, ModalBody, InfoBox } from "./ui"
import { logger } from "../utils/logger"

interface ScrapeConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (config: ScrapeConfig) => Promise<void>
  defaultConfig?: ScrapeConfig
  defaultMinScore?: number
}

const PRESET_CONFIGS = {
  SMART: {
    target_matches: 5,
    max_sources: 20,
    label: "Smart (5 matches, 20 sources)",
  },
  QUICK: {
    target_matches: 3,
    max_sources: 10,
    label: "Quick (3 matches, 10 sources)",
  },
  THOROUGH: {
    target_matches: 10,
    max_sources: 50,
    label: "Thorough (10 matches, 50 sources)",
  },
} as const

/**
 * Modal for configuring custom job scrape requests
 */
export const ScrapeConfigModal: React.FC<ScrapeConfigModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultConfig,
  defaultMinScore = 80,
}) => {
  // Search scope
  const [searchScope, setSearchScope] = useState<"all" | "specific">("all")
  const [selectedSources, setSelectedSources] = useState<string[]>([])

  // Search limits
  const [targetMatchesPreset, setTargetMatchesPreset] = useState<keyof typeof PRESET_CONFIGS | "custom" | "none">(
    "SMART"
  )
  const [customTargetMatches, setCustomTargetMatches] = useState<number>(5)
  const [noTargetLimit, setNoTargetLimit] = useState(false)

  const [customMaxSources, setCustomMaxSources] = useState<number>(20)
  const [noSourceLimit, setNoSourceLimit] = useState(false)

  // Match quality
  const [minMatchScore, setMinMatchScore] = useState<number>(defaultMinScore)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (defaultConfig) {
      if (defaultConfig.target_matches) {
        setCustomTargetMatches(defaultConfig.target_matches)
      }
      if (defaultConfig.max_sources) {
        setCustomMaxSources(defaultConfig.max_sources)
      }
      if (defaultConfig.source_ids) {
        setSearchScope("specific")
        setSelectedSources(defaultConfig.source_ids)
      }
      if (defaultConfig.min_match_score) {
        setMinMatchScore(defaultConfig.min_match_score)
      }
    }
  }, [defaultConfig])

  useEffect(() => {
    // Show warning if both limits are disabled
    setShowWarning(noTargetLimit && noSourceLimit)
  }, [noTargetLimit, noSourceLimit])

  const handlePresetSelect = (preset: keyof typeof PRESET_CONFIGS) => {
    const config = PRESET_CONFIGS[preset]
    setTargetMatchesPreset(preset)
    setCustomTargetMatches(config.target_matches)
    setCustomMaxSources(config.max_sources)
    setNoTargetLimit(false)
    setNoSourceLimit(false)
  }

  const handleTargetMatchesChange = (value: number) => {
    setCustomTargetMatches(value)
    setTargetMatchesPreset("custom")
  }

  const handleMaxSourcesChange = (value: number) => {
    setCustomMaxSources(value)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const config: ScrapeConfig = {}

      // Target matches
      if (!noTargetLimit) {
        config.target_matches = customTargetMatches
      } else {
        config.target_matches = null
      }

      // Max sources
      if (!noSourceLimit) {
        config.max_sources = customMaxSources
      } else {
        config.max_sources = null
      }

      // Source selection
      if (searchScope === "specific" && selectedSources.length > 0) {
        config.source_ids = selectedSources
      } else {
        config.source_ids = null
      }

      // Min match score (only include if different from default)
      if (minMatchScore !== defaultMinScore) {
        config.min_match_score = minMatchScore
      }

      logger.info("Submitting scrape config", { config })
      await onSubmit(config)
      onClose()
    } catch (error) {
      logger.error("Failed to submit scrape config", error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const estimatedCost = (() => {
    const sources = noSourceLimit ? 50 : customMaxSources
    const matches = noTargetLimit ? 10 : customTargetMatches
    const minCost = (sources * 0.01).toFixed(2)
    const maxCost = (matches * 0.06).toFixed(2)
    return `$${minCost} - $${maxCost}`
  })()

  const estimatedDuration = (() => {
    const sources = noSourceLimit ? 50 : customMaxSources
    const minMinutes = Math.ceil(sources * 0.25)
    const maxMinutes = Math.ceil(sources * 0.5)
    return `${minMinutes}-${maxMinutes} minutes`
  })()

  const estimatedJobs = (() => {
    const matches = noTargetLimit ? 10 : customTargetMatches
    return `${Math.max(1, Math.floor(matches * 0.4))}-${matches} matches`
  })()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBody>
        <Heading as="h2" sx={{ mb: 4 }}>
          Custom Job Search
        </Heading>

        {/* Quick Presets */}
        <Box sx={{ mb: 4 }}>
          <Label sx={{ mb: 2 }}>Quick Presets</Label>
          <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
            {Object.entries(PRESET_CONFIGS).map(([key, config]) => (
              <Button
                key={key}
                variant={targetMatchesPreset === key ? "primary" : "secondary"}
                onClick={() => handlePresetSelect(key as keyof typeof PRESET_CONFIGS)}
                sx={{ fontSize: 1 }}
              >
                {config.label}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Search Scope */}
        <Box sx={{ mb: 4, p: 3, bg: "muted", borderRadius: "sm" }}>
          <Heading as="h3" sx={{ fontSize: 2, mb: 3 }}>
            What to Search
          </Heading>
          <Label sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <input
              type="radio"
              value="all"
              checked={searchScope === "all"}
              onChange={() => setSearchScope("all")}
              style={{ marginRight: "8px" }}
            />
            All Sources (default)
          </Label>
          <Text sx={{ fontSize: 1, color: "textMuted", ml: 4, mb: 3 }}>Searches all job boards in rotation</Text>

          <Label sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <input
              type="radio"
              value="specific"
              checked={searchScope === "specific"}
              onChange={() => setSearchScope("specific")}
              style={{ marginRight: "8px" }}
            />
            Specific Companies
          </Label>
          {searchScope === "specific" && (
            <Box sx={{ ml: 4, mt: 2 }}>
              <Text sx={{ fontSize: 1, color: "textMuted", mb: 2 }}>
                Note: Source selection will be available in Phase 3. For now, all sources will be used.
              </Text>
            </Box>
          )}
        </Box>

        {/* Search Limits */}
        <Box sx={{ mb: 4, p: 3, bg: "muted", borderRadius: "sm" }}>
          <Heading as="h3" sx={{ fontSize: 2, mb: 3 }}>
            When to Stop
          </Heading>

          <Label sx={{ mb: 2 }}>Target Matches (jobs to analyze)</Label>
          <Flex sx={{ gap: 2, alignItems: "center", mb: 2 }}>
            <Input
              type="number"
              min="1"
              max="999"
              value={customTargetMatches}
              onChange={(e) => handleTargetMatchesChange(parseInt(e.target.value) || 1)}
              disabled={noTargetLimit}
              sx={{ width: "100px" }}
            />
            <Text>matches</Text>
          </Flex>
          <Label sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Checkbox
              checked={noTargetLimit}
              onChange={(e) => setNoTargetLimit((e.target as HTMLInputElement).checked)}
            />
            <Text sx={{ ml: 2 }}>No limit (exhaust all sources)</Text>
          </Label>

          <Label sx={{ mb: 2 }}>Max Sources to Check</Label>
          <Flex sx={{ gap: 2, alignItems: "center", mb: 2 }}>
            <Input
              type="number"
              min="1"
              max="999"
              value={customMaxSources}
              onChange={(e) => handleMaxSourcesChange(parseInt(e.target.value) || 1)}
              disabled={noSourceLimit}
              sx={{ width: "100px" }}
            />
            <Text>sources</Text>
          </Flex>
          <Label sx={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={noSourceLimit}
              onChange={(e) => setNoSourceLimit((e.target as HTMLInputElement).checked)}
            />
            <Text sx={{ ml: 2 }}>No limit (check all sources)</Text>
          </Label>

          {showWarning && (
            <Box sx={{ mt: 3 }}>
              <InfoBox variant="warning" icon="⚠️">
                Warning: Both limits are disabled. This could be expensive and time-consuming.
              </InfoBox>
            </Box>
          )}
        </Box>

        {/* Match Quality */}
        <Box sx={{ mb: 4, p: 3, bg: "muted", borderRadius: "sm" }}>
          <Heading as="h3" sx={{ fontSize: 2, mb: 3 }}>
            Match Threshold
          </Heading>

          <Label sx={{ mb: 2 }}>Minimum Match Score: {minMatchScore} / 100</Label>
          <Input
            type="range"
            min="0"
            max="100"
            step="5"
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
            sx={{ width: "100%", mb: 2 }}
          />
          <Text sx={{ fontSize: 1, color: "textMuted" }}>Current default: {defaultMinScore}</Text>
          <Text sx={{ fontSize: 1, color: "textMuted" }}>Lower = more jobs, potentially less fit</Text>
          <Text sx={{ fontSize: 1, color: "textMuted" }}>Higher = fewer jobs, better fit</Text>
        </Box>

        {/* Cost Estimate */}
        <Box sx={{ mb: 4 }}>
          <InfoBox variant="info">
            <Heading as="h3" sx={{ fontSize: 2, mb: 3 }}>
              Estimated Cost & Time
            </Heading>
            <Flex sx={{ flexDirection: "column", gap: 2 }}>
              <Text>🤖 AI Credits: ~{estimatedCost}</Text>
              <Text>⏱️ Duration: {estimatedDuration}</Text>
              <Text>📊 Expected Jobs: {estimatedJobs}</Text>
            </Flex>
          </InfoBox>
        </Box>

        {/* Actions */}
        <Flex sx={{ justifyContent: "flex-end", gap: 2 }}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Custom Search"}
          </Button>
        </Flex>
      </ModalBody>
    </Modal>
  )
}
