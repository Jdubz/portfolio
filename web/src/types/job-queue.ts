/**
 * Job Queue Types (Frontend)
 *
 * Re-exports from @jdubz/shared-types with frontend-specific extensions
 */

export type {
  QueueStatus,
  QueueItemType,
  QueueSource,
  StopList,
  QueueSettings,
  AISettings,
  AIProvider,
  QueueStats,
  SubmitJobRequest,
  SubmitJobResponse,
} from "@jdubz/shared-types"

export { isQueueStatus, isQueueItemType } from "@jdubz/shared-types"

// Frontend-specific QueueItem with string dates (serialized from Firestore)
export interface QueueItem {
  id: string
  type: "job" | "company"
  status: "pending" | "processing" | "success" | "failed" | "skipped"
  url: string
  company_name: string
  company_id: string | null
  source: "user_submission" | "automated_scan" | "scraper" | "webhook" | "email"
  submitted_by: string | null
  result_message?: string
  error_message?: string
  error_details?: string
  created_at: string
  updated_at: string
  processed_at?: string
  completed_at?: string
  retry_count: number
  max_retries: number
}
