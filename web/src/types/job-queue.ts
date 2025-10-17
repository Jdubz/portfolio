/**
 * Job Queue Types (Frontend)
 *
 * Client-side types for job queue functionality
 */

export type QueueStatus = "pending" | "processing" | "success" | "failed" | "skipped"

export interface QueueItem {
  id: string
  status: QueueStatus
  url: string
  company_name: string
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

export interface StopList {
  excludedCompanies: string[]
  excludedKeywords: string[]
  excludedDomains: string[]
}

export interface QueueStats {
  pending: number
  processing: number
  success: number
  failed: number
  skipped: number
  total: number
}

export interface SubmitJobRequest {
  url: string
  companyName?: string
  generationId?: string // Optional ID for pre-generated documents
}

export interface SubmitJobResponse {
  status: "success" | "skipped"
  message: string
  queueItemId?: string
  queueItem?: QueueItem
  jobId?: string
}
