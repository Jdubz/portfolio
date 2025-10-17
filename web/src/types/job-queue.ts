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
  ScrapeConfig,
  SubmitScrapeRequest,
  SubmitScrapeResponse,
} from "@jdubz/shared-types"

export { isQueueStatus, isQueueItemType } from "@jdubz/shared-types"

// Frontend-specific QueueItem with string dates (serialized from Firestore)
export interface QueueItem {
  id: string
  type: "job" | "company" | "scrape"
  status: "pending" | "processing" | "success" | "failed" | "skipped" | "filtered"
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
  scrape_config?: {
    target_matches?: number | null
    max_sources?: number | null
    source_ids?: string[] | null
    min_match_score?: number | null
  } | null
}
