/**
 * Job Queue API Client
 *
 * Handles all job queue operations including submission, status polling,
 * and configuration management.
 */

import { ApiClient } from "./client"
import { getJobQueueApiUrl } from "../config/api"
import type { QueueItem, StopList, QueueStats, SubmitJobRequest, SubmitJobResponse } from "../types/job-queue"

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
