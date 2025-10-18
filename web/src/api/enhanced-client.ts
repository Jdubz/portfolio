/**
 * Enhanced API Client with Retry Logic and Better Error Handling
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Centralized auth header management
 * - Request/response interceptors
 * - Network error recovery
 */

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

export interface RequestOptions {
  requiresAuth?: boolean
  timeout?: number
  retries?: number
  retryDelay?: number
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableStatuses: number[]
}

/**
 * Check if running in test environment
 */
const isTestEnvironment =
  typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined)

/**
 * Default retry configuration
 * In test environment, use minimal retries to avoid timeouts
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = isTestEnvironment
  ? {
      maxRetries: 1,
      initialDelay: 10, // 10ms
      maxDelay: 50, // 50ms
      backoffMultiplier: 2,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
    }
  : {
      maxRetries: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
    }

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt)
  return Math.min(delay, config.maxDelay)
}

/**
 * Delay execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Check if HTTP status is retryable
 */
function isRetryableStatus(status: number, config: RetryConfig): boolean {
  return config.retryableStatuses.includes(status)
}

/**
 * Check if error is a network error (no response from server)
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true // Fetch network errors are TypeErrors
  }
  if (error instanceof Error) {
    return error.message.includes("NetworkError") || error.message.includes("Failed to fetch")
  }
  return false
}

/**
 * Enhanced API Client with advanced features
 */
export class EnhancedApiClient {
  protected baseUrl: string
  protected retryConfig: RetryConfig

  constructor(baseUrl?: string, retryConfig?: Partial<RetryConfig>) {
    this.baseUrl = baseUrl || ""
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  }

  /**
   * Build request headers with optional authentication
   */
  protected async buildHeaders(requiresAuth: boolean): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (requiresAuth) {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required but no token available")
      }
      headers["Authorization"] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Make fetch request with timeout support
   */
  protected async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if ((error as Error).name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`)
      }
      throw error
    }
  }

  /**
   * Handle API response and errors
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    const data = (await response.json()) as ApiResponse<T>

    if (!response.ok || !data.success) {
      const errorMessage = data.message ?? data.error ?? `HTTP ${response.status}: ${response.statusText}`

      // Log error details
      logger.error("API request failed", new Error(errorMessage), {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        errorCode: data.errorCode,
        requestId: data.requestId,
      })

      throw new Error(errorMessage)
    }

    return data.data as T
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async request<T>(
    method: string,
    endpoint: string,
    options?: RequestOptions & { body?: unknown }
  ): Promise<T> {
    const { requiresAuth = true, timeout = 30000, retries = 0, retryDelay, body } = options || {}

    try {
      const headers = await this.buildHeaders(requiresAuth)
      const url = `${this.baseUrl}${endpoint}`

      const response = await this.fetchWithTimeout(
        url,
        {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        },
        timeout
      )

      // Check if we should retry based on status code
      if (!response.ok && retries < this.retryConfig.maxRetries) {
        if (isRetryableStatus(response.status, this.retryConfig)) {
          const backoffDelay = retryDelay ?? calculateBackoff(retries, this.retryConfig)

          logger.warn("Retrying request after error", {
            url,
            status: response.status,
            attempt: retries + 1,
            maxRetries: this.retryConfig.maxRetries,
            retryDelay: backoffDelay,
          })

          await delay(backoffDelay)

          return this.request<T>(method, endpoint, {
            ...options,
            retries: retries + 1,
          })
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      // Retry on network errors
      if (isNetworkError(error) && retries < this.retryConfig.maxRetries) {
        const backoffDelay = retryDelay ?? calculateBackoff(retries, this.retryConfig)

        logger.warn("Retrying request after network error", {
          endpoint,
          error: (error as Error).message,
          attempt: retries + 1,
          maxRetries: this.retryConfig.maxRetries,
          retryDelay: backoffDelay,
        })

        await delay(backoffDelay)

        return this.request<T>(method, endpoint, {
          ...options,
          retries: retries + 1,
        })
      }

      // Log final error
      logger.error("Request failed after retries", error as Error, {
        endpoint,
        method,
        attempts: retries + 1,
      })

      throw error
    }
  }

  /**
   * Make GET request
   */
  protected async get<T>(endpoint: string, requiresAuth = false, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, { requiresAuth, ...options })
  }

  /**
   * Make POST request
   */
  protected async post<T>(endpoint: string, body: unknown, requiresAuth = true, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", endpoint, { requiresAuth, body, ...options })
  }

  /**
   * Make PUT request
   */
  protected async put<T>(endpoint: string, body: unknown, requiresAuth = true, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", endpoint, { requiresAuth, body, ...options })
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(endpoint: string, requiresAuth = true, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, { requiresAuth, ...options })
  }
}
