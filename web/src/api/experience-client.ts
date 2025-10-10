/**
 * Experience API Client
 *
 * Handles all experience entry CRUD operations.
 */

import { ApiClient } from "./client"
import type { ExperienceEntry, CreateExperienceData, UpdateExperienceData } from "../types/experience"

export class ExperienceClient extends ApiClient {
  /**
   * Fetches all experience entries
   */
  async getEntries(): Promise<ExperienceEntry[]> {
    const response = await this.get<{ entries: ExperienceEntry[] }>("/experience/entries", false)
    return response.entries
  }

  /**
   * Creates a new experience entry
   */
  async createEntry(data: CreateExperienceData): Promise<ExperienceEntry> {
    const response = await this.post<{ entry: ExperienceEntry }>("/experience/entries", data, true)
    return response.entry
  }

  /**
   * Updates an existing experience entry
   */
  async updateEntry(id: string, data: UpdateExperienceData): Promise<ExperienceEntry> {
    const response = await this.put<{ entry: ExperienceEntry }>(`/experience/entries/${id}`, data, true)
    return response.entry
  }

  /**
   * Deletes an experience entry
   */
  async deleteEntry(id: string): Promise<void> {
    await this.delete<void>(`/experience/entries/${id}`, true)
  }
}

// Export singleton instance
export const experienceClient = new ExperienceClient()
