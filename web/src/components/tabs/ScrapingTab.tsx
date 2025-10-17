import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex } from "theme-ui"
import { ScrapeConfigModal } from "../ScrapeConfigModal"
import { jobQueueClient } from "../../api/job-queue-client"
import { useAuth } from "../../hooks/useAuth"
import type { ScrapeConfig } from "../../types/job-queue"
import { logger } from "../../utils/logger"

/**
 * Scraping Tab
 *
 * Allows users to trigger custom job scraping with configuration options
 */
export const ScrapingTab: React.FC = () => {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleQuickScrape = async () => {
    if (!user) {
      setError("You must be signed in to trigger a scrape")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Submit with default config
      const response = await jobQueueClient.submitScrape({})

      setSuccess(`Scrape request submitted successfully! Queue ID: ${response.queueItemId || "N/A"}`)
      logger.info("Quick scrape submitted", {
        queueItemId: response.queueItemId,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit scrape request"
      setError(errorMessage)
      logger.error("Failed to submit quick scrape", err as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomScrape = async (config: ScrapeConfig) => {
    if (!user) {
      setError("You must be signed in to trigger a scrape")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await jobQueueClient.submitScrape({
        scrape_config: config,
      })

      setSuccess(`Custom scrape submitted successfully! Queue ID: ${response.queueItemId || "N/A"}`)
      logger.info("Custom scrape submitted", {
        queueItemId: response.queueItemId,
        config,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit scrape request"
      setError(errorMessage)
      logger.error("Failed to submit custom scrape", err as Error, { config })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box>
      <Heading as="h2" sx={{ fontSize: 4, mb: 3 }}>
        Job Scraping
      </Heading>

      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Trigger automated job scraping to discover new opportunities. The scraper will search configured job boards,
        analyze positions with AI, and save matches above your threshold.
      </Text>

      {/* Status Messages */}
      {error && (
        <Box sx={{ p: 3, bg: "danger", color: "background", borderRadius: "md", mb: 3 }}>
          <Text sx={{ fontWeight: "medium" }}>{error}</Text>
        </Box>
      )}

      {success && (
        <Box sx={{ variant: "cards.primary", p: 3, mb: 4, borderLeft: "4px solid", borderColor: "success" }}>
          <Text sx={{ fontWeight: "medium", mb: 2 }}>{success}</Text>
          <Text sx={{ fontSize: 1, color: "textMuted" }}>
            View scrape progress in the{" "}
            <a href="/resume-builder?tab=scrape-history" style={{ textDecoration: "underline", color: "inherit" }}>
              Scrape History
            </a>{" "}
            tab.
          </Text>
        </Box>
      )}

      {!user && (
        <Box sx={{ variant: "cards.primary", p: 3, mb: 4, borderLeft: "4px solid", borderColor: "highlight" }}>
          <Text>Please sign in to trigger job scraping</Text>
        </Box>
      )}

      {/* Quick Scrape */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 2 }}>
          Quick Scrape
        </Heading>
        <Text sx={{ mb: 3, color: "textMuted", fontSize: 2 }}>
          Run a standard scrape with default settings (5 matches, 20 sources)
        </Text>
        <Button onClick={handleQuickScrape} disabled={isSubmitting || !user}>
          {isSubmitting ? "Submitting..." : "Find New Jobs"}
        </Button>
      </Box>

      {/* Custom Scrape */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 2 }}>
          Custom Scrape
        </Heading>
        <Text sx={{ mb: 3, color: "textMuted", fontSize: 2 }}>
          Configure custom scraping parameters including target matches, max sources, and match score threshold
        </Text>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)} disabled={isSubmitting || !user}>
          Configure Custom Scrape
        </Button>
      </Box>

      {/* How It Works */}
      <Box sx={{ variant: "cards.primary", p: 4 }}>
        <Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
          How It Works
        </Heading>
        <Flex sx={{ flexDirection: "column", gap: 2 }}>
          <Text sx={{ fontSize: 2 }}>
            <strong>1. Submit:</strong> Configure and submit a scrape request
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>2. Queue:</strong> Request is added to the job queue
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>3. Scrape:</strong> Python worker scrapes configured job boards
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>4. Analyze:</strong> AI analyzes each job against your profile
          </Text>
          <Text sx={{ fontSize: 2 }}>
            <strong>5. Save:</strong> Jobs above match threshold are saved to Job Applications
          </Text>
          <Text sx={{ mt: 2, fontSize: 1, color: "textMuted" }}>Typical scrape duration: 5-15 minutes</Text>
        </Flex>
      </Box>

      {/* Modal */}
      <ScrapeConfigModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCustomScrape} />
    </Box>
  )
}
