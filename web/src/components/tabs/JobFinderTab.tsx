/**
 * Job Finder Tab
 *
 * Tab wrapper for the job-finder page functionality
 */

import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Input, Spinner, Label } from "theme-ui"
import { useAuth } from "../../hooks/useAuth"
import { useAuthRequired } from "../../hooks/useAuthRequired"
import { SignInModal } from "../SignInModal"
import { jobQueueClient } from "../../api"
import { useJobQueueStatus } from "../../hooks/useJobQueueStatus"
import { logger } from "../../utils/logger"
import type { QueueItem } from "../../types/job-queue"

export const JobFinderTab: React.FC = () => {
  const { user, loading: authLoading } = useAuth()

  // Auth required hook for consistent sign-in UX
  const { isModalOpen, signingIn, authError, hideSignInModal, handleSignIn, withAuth } = useAuthRequired({
    message:
      "Sign in to submit jobs to the automated processing queue. The system will analyze and match jobs against your resume.",
    title: "Sign In to Submit Jobs",
  })

  const [url, setUrl] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionState, setSubmissionState] = useState<{
    queueItemId: string | null
    submitted: boolean
  }>({
    queueItemId: null,
    submitted: false,
  })

  const { queueItem, loading: statusLoading, isPolling } = useJobQueueStatus(submissionState.queueItemId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Use withAuth to ensure user is signed in before proceeding
    await withAuth(async () => {
      setError(null)

      if (!url.trim() || !companyName.trim()) {
        setError("Please provide both URL and company name")
        return
      }

      try {
        setSubmitting(true)
        const result = await jobQueueClient.submitJob({
          url: url.trim(),
          companyName: companyName.trim(),
        })

        const queueItemId = result.queueItem?.id || result.queueItemId
        setSubmissionState({
          queueItemId: queueItemId!,
          submitted: true,
        })

        logger.info("Job submitted to queue", { queueItemId })

        // Clear form
        setUrl("")
        setCompanyName("")
      } catch (err) {
        logger.error("Failed to submit job", err as Error)
        setError(err instanceof Error ? err.message : "Failed to submit job")
      } finally {
        setSubmitting(false)
      }
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "#10b981"
      case "failed":
        return "#ef4444"
      case "processing":
        return "#f59e0b"
      case "skipped":
        return "#6b7280"
      default:
        return "#3b82f6"
    }
  }

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto" }}>
      {/* Auth loading state */}
      {authLoading && <Box sx={{ textAlign: "center", py: 4, color: "textMuted" }}>Loading...</Box>}
      <Heading as="h2" sx={{ mb: 2, fontSize: 4 }}>
        Submit Job to Queue
      </Heading>
      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Submit job postings to the automated processing queue. The system will analyze, extract details, and match
        against your resume.
      </Text>

      {/* Submission Form */}
      <Box
        as="form"
        onSubmit={handleSubmit}
        sx={{
          variant: "cards.primary",
          p: 4,
          mb: 4,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Label htmlFor="job-url" sx={{ fontSize: 2, fontWeight: "medium", mb: 2, display: "block" }}>
            Job URL
          </Label>
          <Input
            id="job-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/jobs/12345"
            disabled={submitting}
            sx={{
              variant: "forms.input",
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Label htmlFor="company-name" sx={{ fontSize: 2, fontWeight: "medium", mb: 2, display: "block" }}>
            Company Name
          </Label>
          <Input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            disabled={submitting}
            sx={{
              variant: "forms.input",
            }}
          />
        </Box>

        {(error || authError) && (
          <Box
            sx={{
              p: 3,
              bg: "danger",
              color: "background",
              borderRadius: "md",
              mb: 3,
            }}
          >
            <Text sx={{ fontWeight: "medium" }}>{error || authError}</Text>
          </Box>
        )}

        <Button type="submit" disabled={submitting} sx={{ variant: "buttons.primary", width: "100%" }}>
          {submitting ? "Submitting..." : "Submit to Queue"}
        </Button>
      </Box>

      {/* Status Display */}
      {submissionState.submitted && queueItem && (
        <Box
          sx={{
            variant: "cards.primary",
            p: 4,
          }}
        >
          <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Heading as="h3" sx={{ fontSize: 3 }}>
              Queue Status
            </Heading>
            {isPolling && <Spinner size={20} />}
          </Flex>

          <Box sx={{ mb: 3 }}>
            <Flex sx={{ justifyContent: "space-between", mb: 2 }}>
              <Text sx={{ color: "textMuted" }}>Status:</Text>
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "99px",
                  fontSize: 1,
                  fontWeight: "medium",
                  color: "white",
                  bg: getStatusColor(queueItem.status),
                }}
              >
                {queueItem.status}
              </Box>
            </Flex>

            <Flex sx={{ justifyContent: "space-between", mb: 2 }}>
              <Text sx={{ color: "textMuted" }}>Company:</Text>
              <Text sx={{ fontWeight: "medium" }}>{queueItem.company_name}</Text>
            </Flex>

            <Flex sx={{ justifyContent: "space-between", mb: 2 }}>
              <Text sx={{ color: "textMuted" }}>Retry Count:</Text>
              <Text>
                {queueItem.retry_count} / {queueItem.max_retries}
              </Text>
            </Flex>

            {queueItem.error_message && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  bg: "danger",
                  color: "background",
                  borderRadius: "md",
                }}
              >
                <Text sx={{ fontSize: 1 }}>{queueItem.error_message}</Text>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isModalOpen}
        onClose={hideSignInModal}
        onSignIn={handleSignIn}
        title="Sign In to Submit Jobs"
        message="Sign in to submit jobs to the automated processing queue. The system will analyze and match jobs against your resume."
        signingIn={signingIn}
      />
    </Box>
  )
}
