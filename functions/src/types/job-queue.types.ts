/**
 * Job Queue Domain Types
 *
 * Shared types for job queue, job matches, and configuration
 */

/**
 * Queue item status lifecycle:
 * pending → processing → success/failed/skipped
 */
export type QueueStatus = "pending" | "processing" | "success" | "failed" | "skipped"

/**
 * Queue item types
 */
export type QueueItemType = "job" | "company"

/**
 * Queue item in Firestore (job-queue collection)
 */
export interface QueueItem {
  id?: string
  type: QueueItemType
  status: QueueStatus
  url: string
  company_name: string
  company_id: string | null
  source: "user_submission" | "automated_scan"
  submitted_by: string // User UID
  retry_count: number
  max_retries: number
  result_message?: string
  error_details?: string
  created_at: Date
  updated_at: Date
  processed_at?: Date
  completed_at?: Date
}

/**
 * Stop list configuration (job-finder-config/stop-list)
 */
export interface StopList {
  excludedCompanies: string[]
  excludedKeywords: string[]
  excludedDomains: string[]
}

/**
 * Queue settings (job-finder-config/queue-settings)
 */
export interface QueueSettings {
  maxRetries: number
  retryDelaySeconds: number
  processingTimeout: number
}

/**
 * AI settings (job-finder-config/ai-settings)
 */
export interface AISettings {
  provider: "claude" | "openai"
  model: string
  minMatchScore: number
  costBudgetDaily: number
}

/**
 * Job match result (job-matches collection)
 */
export interface JobMatch {
  id?: string
  url: string
  company_name: string
  job_title: string
  match_score: number
  match_reasons: string[]
  job_description: string
  requirements: string[]
  location?: string
  salary_range?: string
  analyzed_at: Date
  created_at: Date
  submitted_by: string
  queue_item_id: string
}

/**
 * Stop list validation result
 */
export interface StopListCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Queue statistics
 */
export interface QueueStats {
  pending: number
  processing: number
  success: number
  failed: number
  skipped: number
  total: number
}

/**
 * Job submission request body
 */
export interface SubmitJobRequest {
  url: string
  companyName?: string
}

/**
 * Job submission response
 */
export interface SubmitJobResponse {
  status: "success" | "skipped"
  message: string
  queueItemId?: string
  jobId?: string
}
