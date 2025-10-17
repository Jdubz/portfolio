/**
 * Job Queue API Client
 *
 * Handles all job queue operations including submission, status polling,
 * and configuration management.
 */

import { ApiClient } from "./client"
import { getJobQueueApiUrl } from "../config/api"
import type {
  QueueItem,
  StopList,
  QueueSettings,
  AISettings,
  QueueStats,
  SubmitJobRequest,
  SubmitJobResponse,
  SubmitScrapeRequest,
  SubmitScrapeResponse,
} from "../types/job-queue"

export class JobQueueClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to use job queue function
    this.baseUrl = getJobQueueApiUrl()
  }

  /**
   * Submit a job to the queue
   */
  async submitJob(request: SubmitJobRequest): Promise<SubmitJobResponse> {
    const response = await this.post<SubmitJobResponse>("/submit", request, true)
    return response
  }

  /**
   * Submit a scrape request to the queue
   */
  async submitScrape(request: SubmitScrapeRequest = {}): Promise<SubmitScrapeResponse> {
    const response = await this.post<SubmitScrapeResponse>("/submit-scrape", request, true)
    return response
  }

  /**
   * Check if there's a pending scrape request
   */
  async hasPendingScrape(): Promise<boolean> {
    const response = await this.get<{ hasPending: boolean }>("/has-pending-scrape", true)
    return response.hasPending
  }

  /**
   * Submit a company source to the queue
   * Creates a queue item with type "company" for job-finder to process
   */
  async submitCompanySource(companyName: string, careersUrl: string): Promise<SubmitJobResponse> {
    const response = await this.post<SubmitJobResponse>(
      "/submit",
      {
        url: careersUrl,
        companyName: companyName,
      },
      true
    )
    return response
  }

  /**
   * Get queue item status
   */
  async getQueueStatus(queueItemId: string): Promise<QueueItem> {
    const response = await this.get<QueueItem>(`/status/${queueItemId}`, true)
    return response
  }

  /**
   * Get stop list configuration
   */
  async getStopList(): Promise<StopList> {
    const response = await this.get<StopList>("/config/stop-list", true)
    return response
  }

  /**
   * Update stop list configuration
   */
  async updateStopList(stopList: StopList): Promise<StopList> {
    const response = await this.put<StopList>("/config/stop-list", stopList, true)
    return response
  }

  /**
   * Get queue settings configuration
   */
  async getQueueSettings(): Promise<QueueSettings> {
    const response = await this.get<QueueSettings>("/config/queue-settings", true)
    return response
  }

  /**
   * Update queue settings configuration
   */
  async updateQueueSettings(settings: QueueSettings): Promise<QueueSettings> {
    const response = await this.put<QueueSettings>("/config/queue-settings", settings, true)
    return response
  }

  /**
   * Get AI settings configuration
   */
  async getAISettings(): Promise<AISettings> {
    const response = await this.get<AISettings>("/config/ai-settings", true)
    return response
  }

  /**
   * Update AI settings configuration
   */
  async updateAISettings(settings: AISettings): Promise<AISettings> {
    const response = await this.put<AISettings>("/config/ai-settings", settings, true)
    return response
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    const response = await this.get<QueueStats>("/stats", true)
    return response
  }

  /**
   * Get all queue items (admin only)
   */
  async getAllQueueItems(): Promise<QueueItem[]> {
    const response = await this.get<QueueItem[]>("/queue", true)
    return response
  }

  /**
   * Retry a failed queue item (admin only)
   */
  async retryQueueItem(queueItemId: string): Promise<QueueItem> {
    const response = await this.post<QueueItem>(`/retry/${queueItemId}`, {}, true)
    return response
  }

  /**
   * Delete a queue item (admin only)
   */
  async deleteQueueItem(queueItemId: string): Promise<void> {
    await this.delete(`/queue/${queueItemId}`, true)
  }
}

// Export singleton instance
export const jobQueueClient = new JobQueueClient()
