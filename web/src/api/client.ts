/**
 * Base API Client
 *
 * Provides common HTTP methods and error handling for API requests.
 * All API clients should extend this base class.
 */

import { getApiUrl } from "../config/api"
import { getIdToken } from "../utils/auth"
import { logger } from "../utils/logger"

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  error?: string
  errorCode?: string
  requestId?: string
  data?: T
}

export class ApiClient {
  protected baseUrl: string

  constructor() {
    this.baseUrl = getApiUrl()
  }

  /**
   * Makes an authenticated GET request
   */
  protected async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Makes an authenticated POST request
   */
  protected async post<T>(endpoint: string, body: unknown, requiresAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Makes an authenticated PUT request
   */
  protected async put<T>(endpoint: string, body: unknown, requiresAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Makes an authenticated DELETE request
   */
  protected async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers,
    })

    return this.handleResponse<T>(response)
  }

  /**
   * Handles API response and error checking
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = (await response.json()) as ApiResponse<T>

    if (!response.ok || !data.success) {
      const errorMessage = data.message ?? data.error ?? "Request failed"

      const errorDetails = {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        errorCode: data.errorCode,
        errorMessage,
        requestId: data.requestId,
      }

      // Use structured logger instead of console
      logger.error("API request failed", new Error(errorMessage), errorDetails)

      throw new Error(errorMessage)
    }

    return data.data as T
  }
}
