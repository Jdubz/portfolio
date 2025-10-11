/**
 * AI Provider Factory
 *
 * Creates AI provider instances (OpenAI, Gemini, etc.) based on configuration.
 * Handles API key retrieval from Secret Manager and provider instantiation.
 */

import { SecretManagerServiceClient } from "@google-cloud/secret-manager"
import type { AIProvider, AIProviderType } from "../types/generator.types"
import { OpenAIService } from "./openai.service"
import { GeminiProvider } from "./gemini.service"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

// Cache for API keys to avoid repeated Secret Manager calls
const apiKeyCache: Map<string, string> = new Map()

/**
 * Get API key from Secret Manager with caching
 */
async function getApiKey(secretName: string, logger?: SimpleLogger): Promise<string> {
  // Check cache first
  if (apiKeyCache.has(secretName)) {
    return apiKeyCache.get(secretName)!
  }

  // For testing, check environment variables first
  const envVarName = secretName.toUpperCase().replace(/-/g, "_")
  if (process.env[envVarName]) {
    const key = process.env[envVarName]!
    apiKeyCache.set(secretName, key)
    return key
  }

  // Retrieve from Secret Manager
  try {
    const client = new SecretManagerServiceClient()
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "static-sites-257923"
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`

    logger?.info(`Fetching API key from Secret Manager: ${secretName}`)

    const [version] = await client.accessSecretVersion({ name: secretPath })
    const payload = version.payload?.data

    if (!payload) {
      throw new Error(`Secret ${secretName} has no payload`)
    }

    const key = typeof payload === "string" ? payload : payload.toString()
    apiKeyCache.set(secretName, key)

    return key
  } catch (error) {
    logger?.error(`Failed to retrieve API key from Secret Manager: ${secretName}`, { error })
    throw new Error(`Failed to retrieve API key: ${secretName}`)
  }
}

/**
 * Create an AI provider instance
 */
export async function createAIProvider(
  providerType: AIProviderType,
  logger?: SimpleLogger
): Promise<AIProvider> {
  logger?.info(`Creating AI provider: ${providerType}`)

  switch (providerType) {
    case "openai": {
      const apiKey = await getApiKey("openai-api-key", logger)
      return new OpenAIService(apiKey, logger)
    }

    case "gemini": {
      // For Gemini, use GOOGLE_API_KEY environment variable (set by Firebase/Cloud Functions)
      // Get a free key from: https://makersuite.google.com/app/apikey
      // Or set in Secret Manager as "gemini-api-key" for production

      // Check environment variable first (Firebase AI Logic sets this automatically)
      if (process.env.GOOGLE_API_KEY) {
        logger?.info("Using GOOGLE_API_KEY environment variable for Gemini")
        return new GeminiProvider(process.env.GOOGLE_API_KEY, logger)
      }

      // Try Secret Manager (for production deployment)
      try {
        const apiKey = await getApiKey("gemini-api-key", logger)
        return new GeminiProvider(apiKey, logger)
      } catch (error) {
        logger?.error("No Gemini API key found in environment or Secret Manager", { error })
        throw new Error(
          "No API key available for Gemini. Set GOOGLE_API_KEY environment variable or add gemini-api-key to Secret Manager."
        )
      }
    }

    default:
      throw new Error(`Unknown AI provider type: ${providerType}`)
  }
}

/**
 * Clear the API key cache (useful for testing or key rotation)
 */
export function clearApiKeyCache(): void {
  apiKeyCache.clear()
}

/**
 * Get provider pricing information (without instantiating)
 */
export function getProviderPricing(providerType: AIProviderType): {
  inputCostPer1M: number
  outputCostPer1M: number
  estimatedCostPerGeneration: number
} {
  switch (providerType) {
    case "openai":
      return {
        inputCostPer1M: 2.5,
        outputCostPer1M: 10.0,
        estimatedCostPerGeneration: 0.015, // ~2k input + 1k output tokens
      }

    case "gemini":
      return {
        inputCostPer1M: 0.1,
        outputCostPer1M: 0.4,
        estimatedCostPerGeneration: 0.0006, // ~2k input + 1k output tokens
      }

    default:
      throw new Error(`Unknown AI provider type: ${providerType}`)
  }
}
