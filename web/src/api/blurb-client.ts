/**
 * Blurb API Client
 *
 * Handles all blurb CRUD operations.
 */

import { ApiClient } from "./client"
import type { BlurbEntry, CreateBlurbData, UpdateBlurbData } from "../types/experience"

export class BlurbClient extends ApiClient {
  /**
   * Fetches all blurbs
   */
  async getBlurbs(): Promise<BlurbEntry[]> {
    const response = await this.get<{ blurbs: BlurbEntry[] }>("/experience/blurbs", false)
    return response.blurbs
  }

  /**
   * Creates a new blurb
   */
  async createBlurb(data: CreateBlurbData): Promise<BlurbEntry> {
    const response = await this.post<{ blurb: BlurbEntry }>("/experience/blurbs", data, true)
    return response.blurb
  }

  /**
   * Updates an existing blurb
   */
  async updateBlurb(name: string, data: UpdateBlurbData): Promise<BlurbEntry> {
    const response = await this.put<{ blurb: BlurbEntry }>(`/experience/blurbs/${name}`, data, true)
    return response.blurb
  }

  /**
   * Deletes a blurb
   */
  async deleteBlurb(name: string): Promise<void> {
    await this.delete<void>(`/experience/blurbs/${name}`, true)
  }
}

// Export singleton instance
export const blurbClient = new BlurbClient()
