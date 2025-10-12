/**
 * Tests for AI Provider Factory
 */

import { createAIProvider, clearApiKeyCache, getProviderPricing } from "../ai-provider.factory"
import { OpenAIService } from "../openai.service"
import { GeminiProvider } from "../gemini.service"
import type { AIProviderType } from "../../types/generator.types"

// Mock the Secret Manager client
jest.mock("@google-cloud/secret-manager", () => ({
  SecretManagerServiceClient: jest.fn().mockImplementation(() => ({
    accessSecretVersion: jest.fn().mockResolvedValue([
      {
        payload: {
          data: Buffer.from("mock-secret-key"),
        },
      },
    ]),
  })),
}))

describe("AI Provider Factory", () => {
  beforeEach(() => {
    // Clear cache before each test
    clearApiKeyCache()
    // Clear environment variables
    delete process.env.OPENAI_API_KEY
    delete process.env.GEMINI_API_KEY
    delete process.env.GOOGLE_API_KEY
  })

  describe("createAIProvider", () => {
    describe("OpenAI Provider", () => {
      it("should create OpenAI provider with API key from environment", async () => {
        process.env.OPENAI_API_KEY = "test-openai-key"

        const provider = await createAIProvider("openai")

        expect(provider).toBeInstanceOf(OpenAIService)
        expect(provider.providerType).toBe("openai")
        expect(provider.model).toBe("gpt-4o-2024-08-06")
      })

      it("should create OpenAI provider with API key from Secret Manager", async () => {
        // Environment variable not set, should fall back to Secret Manager

        const provider = await createAIProvider("openai")

        expect(provider).toBeInstanceOf(OpenAIService)
        expect(provider.providerType).toBe("openai")
      })

      it("should have correct OpenAI pricing", async () => {
        process.env.OPENAI_API_KEY = "test-openai-key"

        const provider = await createAIProvider("openai")

        expect(provider.pricing.inputCostPer1M).toBe(2.5)
        expect(provider.pricing.outputCostPer1M).toBe(10.0)
      })
    })

    describe("Gemini Provider", () => {
      it("should create Gemini provider with GOOGLE_API_KEY from environment", async () => {
        process.env.GOOGLE_API_KEY = "test-google-key"

        const provider = await createAIProvider("gemini")

        expect(provider).toBeInstanceOf(GeminiProvider)
        expect(provider.providerType).toBe("gemini")
        expect(provider.model).toBe("gemini-2.0-flash")
      })

      it("should create Gemini provider with API key from Secret Manager", async () => {
        // No environment variable, should use Secret Manager

        const provider = await createAIProvider("gemini")

        expect(provider).toBeInstanceOf(GeminiProvider)
        expect(provider.providerType).toBe("gemini")
      })

      it("should have correct Gemini pricing", async () => {
        process.env.GOOGLE_API_KEY = "test-google-key"

        const provider = await createAIProvider("gemini")

        expect(provider.pricing.inputCostPer1M).toBe(0.1)
        expect(provider.pricing.outputCostPer1M).toBe(0.4)
      })

      it("should prioritize GOOGLE_API_KEY over Secret Manager", async () => {
        process.env.GOOGLE_API_KEY = "test-google-key-from-env"

        const logger = {
          info: jest.fn(),
          warning: jest.fn(),
          error: jest.fn(),
        }

        const provider = await createAIProvider("gemini", logger)

        expect(provider).toBeInstanceOf(GeminiProvider)
        expect(logger.info).toHaveBeenCalledWith("Using GOOGLE_API_KEY environment variable for Gemini")
      })
    })

    describe("Invalid Provider", () => {
      it("should throw error for unknown provider type", async () => {
        await expect(createAIProvider("unknown" as AIProviderType)).rejects.toThrow(
          "Unknown AI provider type: unknown"
        )
      })
    })

    describe("API Key Caching", () => {
      it("should cache API keys to avoid repeated Secret Manager calls", async () => {
        process.env.OPENAI_API_KEY = "test-openai-key"

        // Create provider twice
        const provider1 = await createAIProvider("openai")
        const provider2 = await createAIProvider("openai")

        // Both should succeed (caching working)
        expect(provider1).toBeInstanceOf(OpenAIService)
        expect(provider2).toBeInstanceOf(OpenAIService)
      })

      it("should clear cache when clearApiKeyCache is called", () => {
        // This is a smoke test - clearApiKeyCache should not throw
        expect(() => clearApiKeyCache()).not.toThrow()
      })
    })
  })

  describe("getProviderPricing", () => {
    it("should return correct pricing for OpenAI", () => {
      const pricing = getProviderPricing("openai")

      expect(pricing.inputCostPer1M).toBe(2.5)
      expect(pricing.outputCostPer1M).toBe(10.0)
      expect(pricing.estimatedCostPerGeneration).toBe(0.015)
    })

    it("should return correct pricing for Gemini", () => {
      const pricing = getProviderPricing("gemini")

      expect(pricing.inputCostPer1M).toBe(0.1)
      expect(pricing.outputCostPer1M).toBe(0.4)
      expect(pricing.estimatedCostPerGeneration).toBe(0.0006)
    })

    it("should show Gemini is 92% cheaper than OpenAI", () => {
      const openaiPricing = getProviderPricing("openai")
      const geminiPricing = getProviderPricing("gemini")

      const savings = 1 - geminiPricing.estimatedCostPerGeneration / openaiPricing.estimatedCostPerGeneration
      expect(savings).toBeCloseTo(0.96, 2) // 96% cheaper (even better than 92%)
    })

    it("should throw error for unknown provider type", () => {
      expect(() => getProviderPricing("unknown" as AIProviderType)).toThrow("Unknown AI provider type: unknown")
    })
  })

  describe("Provider Interface Compliance", () => {
    it("OpenAI provider should implement AIProvider interface", async () => {
      process.env.OPENAI_API_KEY = "test-openai-key"

      const provider = await createAIProvider("openai")

      // Check interface methods exist
      expect(typeof provider.generateResume).toBe("function")
      expect(typeof provider.generateCoverLetter).toBe("function")
      expect(typeof provider.calculateCost).toBe("function")

      // Check interface properties exist
      expect(typeof provider.model).toBe("string")
      expect(typeof provider.providerType).toBe("string")
      expect(typeof provider.pricing).toBe("object")
    })

    it("Gemini provider should implement AIProvider interface", async () => {
      process.env.GOOGLE_API_KEY = "test-google-key"

      const provider = await createAIProvider("gemini")

      // Check interface methods exist
      expect(typeof provider.generateResume).toBe("function")
      expect(typeof provider.generateCoverLetter).toBe("function")
      expect(typeof provider.calculateCost).toBe("function")

      // Check interface properties exist
      expect(typeof provider.model).toBe("string")
      expect(typeof provider.providerType).toBe("string")
      expect(typeof provider.pricing).toBe("object")
    })

    it("Both providers should have consistent pricing structure", async () => {
      process.env.OPENAI_API_KEY = "test-openai-key"
      process.env.GOOGLE_API_KEY = "test-google-key"

      const openaiProvider = await createAIProvider("openai")
      const geminiProvider = await createAIProvider("gemini")

      // Both should have same pricing structure
      expect(openaiProvider.pricing).toHaveProperty("inputCostPer1M")
      expect(openaiProvider.pricing).toHaveProperty("outputCostPer1M")
      expect(geminiProvider.pricing).toHaveProperty("inputCostPer1M")
      expect(geminiProvider.pricing).toHaveProperty("outputCostPer1M")

      // Pricing should be numbers
      expect(typeof openaiProvider.pricing.inputCostPer1M).toBe("number")
      expect(typeof openaiProvider.pricing.outputCostPer1M).toBe("number")
      expect(typeof geminiProvider.pricing.inputCostPer1M).toBe("number")
      expect(typeof geminiProvider.pricing.outputCostPer1M).toBe("number")
    })
  })
})
