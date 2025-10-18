/**
 * Experience API Client
 *
 * Handles all experience entry CRUD operations using the generic CRUD factory.
 * Dramatically reduces boilerplate while maintaining type safety.
 */

import { createCrudClient } from "./crud-factory"
import { getApiUrl } from "../config/api"
import type { ExperienceEntry, CreateExperienceData, UpdateExperienceData } from "../types/experience"

/**
 * Experience client with automatic retry logic and error handling
 */
const crudClient = createCrudClient<ExperienceEntry, CreateExperienceData, UpdateExperienceData>({
  baseUrl: getApiUrl(),
  resourcePath: "/experience/entries",
  resourceName: "entry",
  resourceNamePlural: "entries",
  requiresAuth: true,
})

/**
 * Experience API client interface
 *
 * Provides backward-compatible method names while using the enhanced CRUD factory
 */
export class ExperienceClient {
  /**
   * Fetches all experience entries
   */
  async getEntries(): Promise<ExperienceEntry[]> {
    return crudClient.getAll()
  }

  /**
   * Creates a new experience entry
   */
  async createEntry(data: CreateExperienceData): Promise<ExperienceEntry> {
    return crudClient.create(data)
  }

  /**
   * Updates an existing experience entry
   */
  async updateEntry(id: string, data: UpdateExperienceData): Promise<ExperienceEntry> {
    return crudClient.update(id, data)
  }

  /**
   * Deletes an experience entry
   */
  async deleteEntry(id: string): Promise<void> {
    return crudClient.delete(id)
  }
}

// Export singleton instance
export const experienceClient = new ExperienceClient()
