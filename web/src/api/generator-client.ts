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

/**
 * Get the Generator API base URL
 * Uses manageGenerator function instead of manageExperience
 */
const getGeneratorApiUrl = (): string => {
  // Check if running on localhost (development) - use runtime check, not build-time
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

  // Use emulator in development
  if (isLocalhost) {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
    return `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/manageGenerator`
  }

  // Production/staging URL
  return (
    process.env.GATSBY_GENERATOR_API_URL ??
    `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/manageGenerator`
  )
}

export class GeneratorClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to point to manageGenerator function
    this.baseUrl = getGeneratorApiUrl()
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
