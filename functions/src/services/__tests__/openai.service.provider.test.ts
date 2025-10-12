/**
 * Tests for OpenAI Service AIProvider Interface Compliance
 * Tests that the refactored OpenAIService correctly implements the AIProvider interface
 */

import { OpenAIService } from "../openai.service"
import type { AIProvider } from "../../types/generator.types"

// Mock OpenAI SDK
jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      beta: {
        chat: {
          completions: {
            parse: jest.fn(),
          },
        },
      },
    })),
  }
})

describe("OpenAIService AIProvider Interface", () => {
  let service: OpenAIService
  const mockApiKey = "test-openai-key"

  beforeEach(() => {
    jest.clearAllMocks()
    service = new OpenAIService(mockApiKey)
  })

  describe("AIProvider Interface Compliance", () => {
    it("should implement AIProvider interface", () => {
      // Type assertion to verify interface compliance
      const provider: AIProvider = service

      expect(provider).toBeDefined()
      expect(typeof provider.generateResume).toBe("function")
      expect(typeof provider.generateCoverLetter).toBe("function")
      expect(typeof provider.calculateCost).toBe("function")
    })

    it("should have readonly model property", () => {
      expect(service.model).toBe("gpt-4o-2024-08-06")

      // Note: TypeScript readonly only prevents compile-time modification
      // At runtime, JavaScript can still modify the property
      // The important thing is TypeScript catches modification attempts at compile time
    })

    it("should have readonly providerType property", () => {
      expect(service.providerType).toBe("openai")
    })

    it("should have readonly pricing property with correct structure", () => {
      expect(service.pricing).toEqual({
        inputCostPer1M: 2.5,
        outputCostPer1M: 10.0,
      })
    })
  })

  describe("Provider Properties", () => {
    it("should have correct model name", () => {
      expect(service.model).toBe("gpt-4o-2024-08-06")
    })

    it("should have correct provider type", () => {
      expect(service.providerType).toBe("openai")
    })

    it("should have correct pricing", () => {
      expect(service.pricing.inputCostPer1M).toBe(2.5)
      expect(service.pricing.outputCostPer1M).toBe(10.0)
    })
  })

  describe("calculateCost (Instance Method)", () => {
    it("should calculate cost using instance method", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const cost = service.calculateCost(tokenUsage)

      // (2000 / 1M * $2.50) + (1000 / 1M * $10.00) = $0.005 + $0.01 = $0.015
      expect(cost).toBeCloseTo(0.015, 4)
    })

    it("should calculate cost for large generation", () => {
      const tokenUsage = {
        promptTokens: 10000,
        completionTokens: 5000,
        totalTokens: 15000,
      }

      const cost = service.calculateCost(tokenUsage)

      // (10000 / 1M * $2.50) + (5000 / 1M * $10.00) = $0.025 + $0.05 = $0.075
      expect(cost).toBeCloseTo(0.075, 4)
    })

    it("should calculate cost for minimal usage", () => {
      const tokenUsage = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      }

      const cost = service.calculateCost(tokenUsage)

      // (100 / 1M * $2.50) + (50 / 1M * $10.00) = $0.00025 + $0.0005 = $0.00075
      expect(cost).toBeCloseTo(0.00075, 6)
    })
  })

  describe("calculateCost (Static Method - Backward Compatibility)", () => {
    it("should still support static calculateCost method", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const cost = OpenAIService.calculateCost(tokenUsage)

      expect(cost).toBeCloseTo(0.015, 4)
    })

    it("static and instance methods should return same result", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const instanceCost = service.calculateCost(tokenUsage)
      const staticCost = OpenAIService.calculateCost(tokenUsage)

      expect(instanceCost).toBe(staticCost)
    })
  })

  describe("Method Signatures", () => {
    it("generateResume should return AIResumeGenerationResult", async () => {
      // Enable mock mode to avoid actual API calls
      process.env.OPENAI_MOCK_MODE = "true"
      const mockService = new OpenAIService(mockApiKey)

      const result = await mockService.generateResume({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
        },
        job: {
          role: "Software Engineer",
          company: "Test Company",
        },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Check result structure matches AIResumeGenerationResult
      expect(result).toHaveProperty("content")
      expect(result).toHaveProperty("tokenUsage")
      expect(result).toHaveProperty("model")
      expect(result.tokenUsage).toHaveProperty("promptTokens")
      expect(result.tokenUsage).toHaveProperty("completionTokens")
      expect(result.tokenUsage).toHaveProperty("totalTokens")

      delete process.env.OPENAI_MOCK_MODE
    })

    it("generateCoverLetter should return AICoverLetterGenerationResult", async () => {
      // Enable mock mode to avoid actual API calls
      process.env.OPENAI_MOCK_MODE = "true"
      const mockService = new OpenAIService(mockApiKey)

      const result = await mockService.generateCoverLetter({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
        },
        job: {
          role: "Software Engineer",
          company: "Test Company",
        },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Check result structure matches AICoverLetterGenerationResult
      expect(result).toHaveProperty("content")
      expect(result).toHaveProperty("tokenUsage")
      expect(result).toHaveProperty("model")
      expect(result.tokenUsage).toHaveProperty("promptTokens")
      expect(result.tokenUsage).toHaveProperty("completionTokens")
      expect(result.tokenUsage).toHaveProperty("totalTokens")

      delete process.env.OPENAI_MOCK_MODE
    })
  })

  describe("Backward Compatibility", () => {
    it("should support legacy ResumeGenerationResult type", async () => {
      process.env.OPENAI_MOCK_MODE = "true"
      const mockService = new OpenAIService(mockApiKey)

      // This should compile without errors due to type alias
      const result = await mockService.generateResume({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
        },
        job: {
          role: "Software Engineer",
          company: "Test Company",
        },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result).toBeDefined()
      delete process.env.OPENAI_MOCK_MODE
    })

    it("should support legacy CoverLetterGenerationResult type", async () => {
      process.env.OPENAI_MOCK_MODE = "true"
      const mockService = new OpenAIService(mockApiKey)

      const result = await mockService.generateCoverLetter({
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
        },
        job: {
          role: "Software Engineer",
          company: "Test Company",
        },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result).toBeDefined()
      delete process.env.OPENAI_MOCK_MODE
    })
  })

  describe("Cost Comparison with Gemini", () => {
    it("should be approximately 25x more expensive than Gemini", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const openaiCost = service.calculateCost(tokenUsage)
      // Gemini cost for same usage: (2000 / 1M * $0.10) + (1000 / 1M * $0.40) = $0.0006
      const geminiCost = 0.0006

      const ratio = openaiCost / geminiCost
      expect(ratio).toBeCloseTo(25, 0) // OpenAI is ~25x more expensive
    })
  })
})
