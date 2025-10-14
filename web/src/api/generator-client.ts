/**
 * Generator API Client
 *
 * Handles all resume/cover letter generator operations.
 */

import { ApiClient } from "./client"
import { API_CONFIG, isLocalhost } from "../config/api"
import { getIdToken } from "../utils/auth"
import type {
  GenerateRequest,
  GenerateResponse,
  PersonalInfo,
  UpdatePersonalInfoData,
  GenerationRequest,
} from "../types/generator"

export class GeneratorClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to point to manageGenerator function
    // Use runtime hostname check (shared helper from config/api)
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
   * Generate resume and/or cover letter (monolithic - single request)
   * Public endpoint - no auth required
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    return this.post<GenerateResponse>("/generator/generate", request, false)
  }

  /**
   * Start a multi-step generation request
   * Returns a request ID and the first step to execute
   * Public endpoint - no auth required
   */
  async startGeneration(request: GenerateRequest): Promise<{
    requestId: string
    status: string
    nextStep?: string
  }> {
    return this.post<{
      requestId: string
      status: string
      nextStep?: string
    }>("/generator/start", request, false)
  }

  /**
   * Execute the next pending step for a generation request
   * Public endpoint - no auth required
   */
  async executeStep(requestId: string): Promise<{
    stepCompleted: string
    nextStep?: string
    status: string
  }> {
    return this.post<{
      stepCompleted: string
      nextStep?: string
      status: string
    }>(`/generator/step/${requestId}`, {}, false)
  }

  /**
   * Get personal info
   * Public endpoint - no auth required
   */
  async getPersonalInfo(): Promise<PersonalInfo> {
    return this.get<PersonalInfo>("/generator/personal-info", false)
  }

  /**
   * Update personal info
   * Auth required - editor only
   */
  async updatePersonalInfo(data: UpdatePersonalInfoData): Promise<PersonalInfo> {
    return this.put<PersonalInfo>("/generator/personal-info", data, true)
  }

  /** @deprecated Use getPersonalInfo() instead */
  async getDefaults(): Promise<PersonalInfo> {
    return this.getPersonalInfo()
  }

  /** @deprecated Use updatePersonalInfo() instead */
  async updateDefaults(data: UpdatePersonalInfoData): Promise<PersonalInfo> {
    return this.updatePersonalInfo(data)
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

  /**
   * Upload avatar or logo image
   * Auth required - editor only
   */
  async uploadImage(file: File, imageType: "avatar" | "logo"): Promise<{ url: string; gcsPath: string; size: number }> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("imageType", imageType)

    // Get auth token
    const token = await getIdToken()
    if (!token) {
      throw new Error("Authentication required for image upload")
    }

    const response = await fetch(`${this.baseUrl}/generator/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = (await response.json()) as { message?: string }
      throw new Error(error.message ?? "Failed to upload image")
    }

    const result = (await response.json()) as {
      data: { url: string; gcsPath: string; size: number }
    }
    return result.data
  }
}

// Export singleton instance
export const generatorClient = new GeneratorClient()
