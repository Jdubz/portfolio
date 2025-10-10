/**
 * Generator API Client
 *
 * Handles all resume/cover letter generator operations.
 */

import { ApiClient } from "./client"
import type {
  GenerateRequest,
  GenerateResponse,
  GeneratorDefaults,
  UpdateDefaultsData,
  GenerationRequest,
} from "../types/generator"

export class GeneratorClient extends ApiClient {
  /**
   * Generate resume and/or cover letter
   * Public endpoint - no auth required
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    return this.post<GenerateResponse>("/generator/generate", request, false)
  }

  /**
   * Get default generator settings
   * Public endpoint - no auth required
   */
  async getDefaults(): Promise<GeneratorDefaults> {
    return this.get<GeneratorDefaults>("/generator/defaults", false)
  }

  /**
   * Update default generator settings
   * Auth required - editor only
   */
  async updateDefaults(data: UpdateDefaultsData): Promise<GeneratorDefaults> {
    return this.put<GeneratorDefaults>("/generator/defaults", data, true)
  }

  /**
   * List generation requests
   * Auth required - editor only
   */
  async listRequests(limit?: number): Promise<GenerationRequest[]> {
    const query = limit ? `?limit=${limit}` : ""
    const response = await this.get<{ requests: GenerationRequest[] }>(`/generator/requests${query}`, true)
    return response.requests
  }
}

// Export singleton instance
export const generatorClient = new GeneratorClient()
