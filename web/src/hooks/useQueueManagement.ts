/**
 * useQueueManagement Hook
 *
 * Real-time Firestore listener for job queue items
 * Provides queue items with live updates via onSnapshot
 */

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore"
import { getFirestoreInstance } from "../utils/firestore"
import { logger } from "../utils/logger"
import type { QueueItem, QueueStatus } from "../types/job-queue"

interface UseQueueManagementResult {
  queueItems: QueueItem[]
  loading: boolean
  error: string | null
}

/**
 * Convert Firestore document to QueueItem
 */
function convertFirestoreDoc(doc: any): QueueItem {
  const data = doc.data()

  return {
    id: doc.id,
    type: data.type,
    status: data.status,
    url: data.url,
    company_name: data.company_name,
    company_id: data.company_id ?? null,
    source: data.source,
    submitted_by: data.submitted_by ?? null,
    retry_count: data.retry_count ?? 0,
    max_retries: data.max_retries ?? 3,
    result_message: data.result_message,
    error_message: data.error_message,
    error_details: data.error_details,
    created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : data.created_at,
    updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : data.updated_at,
    processed_at: data.processed_at
      ? data.processed_at instanceof Timestamp
        ? data.processed_at.toDate().toISOString()
        : data.processed_at
      : undefined,
    completed_at: data.completed_at
      ? data.completed_at instanceof Timestamp
        ? data.completed_at.toDate().toISOString()
        : data.completed_at
      : undefined,
  }
}

/**
 * Hook to manage queue items with real-time Firestore updates
 */
export function useQueueManagement(): UseQueueManagementResult {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    try {
      const db = getFirestoreInstance()
      const queueRef = collection(db, "job-queue")

      // Query queue items ordered by creation date (newest first)
      const queueQuery = query(queueRef, orderBy("created_at", "desc"))

      // Set up real-time listener
      unsubscribe = onSnapshot(
        queueQuery,
        (snapshot) => {
          const items: QueueItem[] = []

          snapshot.forEach((doc) => {
            try {
              const item = convertFirestoreDoc(doc)
              items.push(item)
            } catch (err) {
              logger.error("Error converting queue item", err as Error, { docId: doc.id })
            }
          })

          setQueueItems(items)
          setLoading(false)
          setError(null)

          logger.info("Queue items updated via real-time listener", { count: items.length })
        },
        (err) => {
          logger.error("Firestore listener error", err as Error)
          setError(err.message)
          setLoading(false)
        }
      )
    } catch (err) {
      logger.error("Failed to set up Firestore listener", err as Error)
      setError(err instanceof Error ? err.message : "Failed to connect to Firestore")
      setLoading(false)
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
        logger.info("Queue management listener unsubscribed")
      }
    }
  }, [])

  return {
    queueItems,
    loading,
    error,
  }
}
