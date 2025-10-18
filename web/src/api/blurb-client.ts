/**
 * Blurb API Client
 *
 * Handles all blurb CRUD operations using the generic CRUD factory.
 * Dramatically reduces boilerplate while maintaining type safety.
 */

import { createCrudClient } from "./crud-factory"
import { getApiUrl } from "../config/api"
import type { BlurbEntry, CreateBlurbData, UpdateBlurbData } from "../types/experience"

/**
 * Blurb client with automatic retry logic and error handling
 */
const crudClient = createCrudClient<BlurbEntry, CreateBlurbData, UpdateBlurbData>({
  baseUrl: getApiUrl(),
  resourcePath: "/experience/blurbs",
  resourceName: "blurb",
  resourceNamePlural: "blurbs",
  requiresAuth: true,
})

/**
 * Blurb API client interface
 *
 * Provides backward-compatible method names while using the enhanced CRUD factory
 */
export class BlurbClient {
  /**
   * Fetches all blurbs
   */
  async getBlurbs(): Promise<BlurbEntry[]> {
    return crudClient.getAll()
  }

  /**
   * Creates a new blurb
   */
  async createBlurb(data: CreateBlurbData): Promise<BlurbEntry> {
    return crudClient.create(data)
  }

  /**
   * Updates an existing blurb
   * Note: Uses 'name' as identifier instead of 'id'
   */
  async updateBlurb(name: string, data: UpdateBlurbData): Promise<BlurbEntry> {
    return crudClient.update(name, data)
  }

  /**
   * Deletes a blurb
   * Note: Uses 'name' as identifier instead of 'id'
   */
  async deleteBlurb(name: string): Promise<void> {
    return crudClient.delete(name)
  }
}

// Export singleton instance
export const blurbClient = new BlurbClient()
