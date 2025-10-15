/**
 * Job Match API Client
 *
 * Handles communication with the job-matches API
 */

import { ApiClient } from "./client"
import type { JobMatch, UpdateJobMatchData } from "../types/job-match"
import { API_CONFIG, isLocalhost } from "../config/api"

export class JobMatchClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to point to manageGenerator function
    if (isLocalhost()) {
      // Use emulator in local development
      const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
      this.baseUrl = `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/manageGenerator`
    } else {
      // Production/staging URL from env var (baked in at build time)
      this.baseUrl =
        process.env.GATSBY_GENERATOR_API_URL ??
        `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/manageGenerator`
    }
  }

  /**
   * Get all job matches
   * Sorted by creation date (newest first)
   * Auth required - editor only
   */
  async getJobMatches(): Promise<JobMatch[]> {
    const response = await this.get<{ jobMatches: JobMatch[] }>("/generator/job-matches", true)
    return response.jobMatches
  }

  /**
   * Update a job match
   * Auth required - editor only
   */
  async updateJobMatch(id: string, data: UpdateJobMatchData): Promise<JobMatch> {
    return this.put<JobMatch>(`/generator/job-matches/${id}`, data, true)
  }

  /**
   * Toggle applied status
   */
  async toggleApplied(id: string, applied: boolean): Promise<JobMatch> {
    return this.updateJobMatch(id, { applied })
  }

  /**
   * Mark job match as having documents generated
   */
  async markDocumentsGenerated(id: string, generationId: string): Promise<JobMatch> {
    return this.updateJobMatch(id, {
      documentGenerated: true,
      generationId,
    })
  }
}

// Export singleton instance
export const jobMatchClient = new JobMatchClient()
