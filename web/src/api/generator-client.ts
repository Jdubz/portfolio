/**
 * Generator API Client
 *
 * Handles all resume/cover letter generator operations.
 */

import { ApiClient } from "./client"
import { API_CONFIG } from "../config/api"
import type {
  GenerateRequest,
  GenerateResponse,
  GeneratorDefaults,
  UpdateDefaultsData,
  GenerationRequest,
} from "../types/generator"

export class GeneratorClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to point to manageGenerator function
    // Use the same pattern as getApiUrl() in api.ts
    if (process.env.NODE_ENV === "development") {
      const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
      this.baseUrl = `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/manageGenerator`
    } else {
      // Production/staging URL from env var
      this.baseUrl =
        process.env.GATSBY_GENERATOR_API_URL ??
        `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/manageGenerator`
    }
  }
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
   * Get a generation request by ID (for polling progress)
   * Public endpoint - no auth required
   */
  async getRequest(generationId: string): Promise<GenerationRequest> {
    return this.get<GenerationRequest>(`/generator/requests/${generationId}`, false)
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
