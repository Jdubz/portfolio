/**
 * Job Queue Status Hook
 *
 * Polls for queue item status updates until completion.
 * Automatically stops polling when status reaches a terminal state.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { jobQueueClient } from "../api"
import { logger } from "../utils/logger"
import type { QueueItem, QueueStatus } from "../types/job-queue"

interface UseJobQueueStatusOptions {
  /**
   * Polling interval in milliseconds
   * @default 3000 (3 seconds)
   */
  pollInterval?: number

  /**
   * Maximum polling duration in milliseconds
   * @default 300000 (5 minutes)
   */
  maxDuration?: number

  /**
   * Whether to start polling immediately
   * @default true
   */
  autoStart?: boolean
}

interface UseJobQueueStatusReturn {
  /** Queue item data */
  queueItem: QueueItem | null
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Whether currently polling */
  isPolling: boolean
  /** Manually start polling */
  startPolling: () => void
  /** Manually stop polling */
  stopPolling: () => void
  /** Manually refresh status once */
  refresh: () => Promise<void>
}

/**
 * Hook to poll job queue status
 *
 * @param queueItemId - Queue item ID to poll (null to disable)
 * @param options - Polling options
 * @returns Queue status data and controls
 *
 * @example
 * ```tsx
 * const { queueItem, loading, error, isPolling } = useJobQueueStatus(queueItemId)
 *
 * if (loading) return <div>Loading...</div>
 * if (error) return <div>Error: {error}</div>
 * if (queueItem?.status === 'success') return <div>Complete!</div>
 * ```
 */
export function useJobQueueStatus(
  queueItemId: string | null,
  options: UseJobQueueStatusOptions = {}
): UseJobQueueStatusReturn {
  const {
    pollInterval = 3000, // 3 seconds
    maxDuration = 5 * 60 * 1000, // 5 minutes
    autoStart = true,
  } = options

  const [queueItem, setQueueItem] = useState<QueueItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Check if status is terminal (no more polling needed)
   */
  const isTerminalStatus = (status: QueueStatus): boolean => {
    return status === "success" || status === "failed" || status === "skipped"
  }

  /**
   * Fetch queue status once
   */
  const fetchStatus = useCallback(async () => {
    if (!queueItemId) {
      return
    }

    try {
      setError(null)
      const data = await jobQueueClient.getQueueStatus(queueItemId)
      setQueueItem(data)

      // Stop polling if status is terminal
      if (isTerminalStatus(data.status)) {
        stopPolling()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch queue status"
      logger.error("Failed to fetch queue status", err instanceof Error ? err : new Error(errorMessage), {
        queueItemId,
      })
      setError(errorMessage)
    }
  }, [queueItemId])

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!queueItemId || isPolling) {
      return
    }

    setIsPolling(true)
    setLoading(true)

    // Initial fetch
    fetchStatus()

    // Set up polling interval
    pollIntervalRef.current = setInterval(() => {
      fetchStatus()
    }, pollInterval)

    // Set up max duration timeout
    maxDurationTimeoutRef.current = setTimeout(() => {
      logger.warn("Queue status polling timed out", { queueItemId, maxDuration })
      stopPolling()
      setError("Polling timed out. Please refresh to check status.")
    }, maxDuration)
  }, [queueItemId, isPolling, pollInterval, maxDuration, fetchStatus])

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    setIsPolling(false)
    setLoading(false)

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current)
      maxDurationTimeoutRef.current = null
    }
  }, [])

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchStatus()
    setLoading(false)
  }, [fetchStatus])

  /**
   * Auto-start polling when queueItemId changes
   */
  useEffect(() => {
    if (queueItemId && autoStart) {
      startPolling()
    }

    // Cleanup on unmount or queueItemId change
    return () => {
      stopPolling()
    }
  }, [queueItemId, autoStart, startPolling, stopPolling])

  return {
    queueItem,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refresh,
  }
}
