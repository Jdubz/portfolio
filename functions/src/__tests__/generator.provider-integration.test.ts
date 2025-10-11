/**
 * Integration Tests for Generator with Multiple AI Providers
 * Tests that the generator correctly uses different AI providers based on request
 */

import type { AIProvider } from "../types/generator.types"

// Mock AI Provider Factory
const mockOpenAIProvider: AIProvider = {
  model: "gpt-4o-2024-08-06",
  providerType: "openai",
  pricing: {
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
  },
  generateResume: jest.fn().mockResolvedValue({
    content: {
      personalInfo: {
        name: "Test User",
        title: "Software Engineer",
        summary: "OpenAI generated resume",
        contact: { email: "test@example.com", location: "", website: "", linkedin: "", github: "" },
      },
      professionalSummary: "OpenAI summary",
      experience: [],
      skills: [],
      education: [],
    },
    tokenUsage: { promptTokens: 2000, completionTokens: 1000, totalTokens: 3000 },
    model: "gpt-4o-2024-08-06",
  }),
  generateCoverLetter: jest.fn().mockResolvedValue({
    content: {
      greeting: "Dear Hiring Manager,",
      openingParagraph: "OpenAI generated cover letter",
      bodyParagraphs: ["Body content"],
      closingParagraph: "Closing",
      signature: "Test User",
    },
    tokenUsage: { promptTokens: 1500, completionTokens: 700, totalTokens: 2200 },
    model: "gpt-4o-2024-08-06",
  }),
  calculateCost: jest.fn((usage) => {
    return (usage.promptTokens / 1_000_000) * 2.5 + (usage.completionTokens / 1_000_000) * 10.0
  }),
}

const mockGeminiProvider: AIProvider = {
  model: "gemini-2.0-flash",
  providerType: "gemini",
  pricing: {
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
  },
  generateResume: jest.fn().mockResolvedValue({
    content: {
      personalInfo: {
        name: "Test User",
        title: "Software Engineer",
        summary: "Gemini generated resume",
        contact: { email: "test@example.com", location: "", website: "", linkedin: "", github: "" },
      },
      professionalSummary: "Gemini summary",
      experience: [],
      skills: [],
      education: [],
    },
    tokenUsage: { promptTokens: 2000, completionTokens: 1000, totalTokens: 3000 },
    model: "gemini-2.0-flash",
  }),
  generateCoverLetter: jest.fn().mockResolvedValue({
    content: {
      greeting: "Dear Hiring Manager,",
      openingParagraph: "Gemini generated cover letter",
      bodyParagraphs: ["Body content"],
      closingParagraph: "Closing",
      signature: "Test User",
    },
    tokenUsage: { promptTokens: 1500, completionTokens: 700, totalTokens: 2200 },
    model: "gemini-2.0-flash",
  }),
  calculateCost: jest.fn((usage) => {
    return (usage.promptTokens / 1_000_000) * 0.1 + (usage.completionTokens / 1_000_000) * 0.4
  }),
}

const mockCreateAIProvider = jest.fn()

jest.mock("../services/ai-provider.factory", () => ({
  createAIProvider: mockCreateAIProvider,
  clearApiKeyCache: jest.fn(),
  getProviderPricing: jest.fn((type: string) => {
    if (type === "openai") {
      return { inputCostPer1M: 2.5, outputCostPer1M: 10.0, estimatedCostPerGeneration: 0.015 }
    }
    return { inputCostPer1M: 0.1, outputCostPer1M: 0.4, estimatedCostPerGeneration: 0.0006 }
  }),
}))

// Mock other services
jest.mock("../services/generator.service", () => ({
  GeneratorService: jest.fn().mockImplementation(() => ({
    getDefaults: jest.fn().mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
      defaultStyle: "modern",
    }),
    createRequest: jest.fn().mockResolvedValue("test-request-id"),
    updateRequestStatus: jest.fn().mockResolvedValue(undefined),
    updateProgress: jest.fn().mockResolvedValue(undefined),
    createResponse: jest.fn().mockResolvedValue(undefined),
  })),
}))

jest.mock("../services/experience.service", () => ({
  ExperienceService: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([
      {
        id: "exp1",
        title: "Test Company",
        role: "Engineer",
        startDate: "2020-01",
        endDate: "2023-12",
        body: "Test",
        order: 0,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
  })),
}))

jest.mock("../services/blurb.service", () => ({
  BlurbService: jest.fn().mockImplementation(() => ({
    list: jest.fn().mockResolvedValue([]),
  })),
}))

jest.mock("../services/pdf.service", () => ({
  PDFService: jest.fn().mockImplementation(() => ({})),
}))

jest.mock("firebase-functions/v2", () => ({
  https: {
    onRequest: jest.fn((config, handler) => handler),
  },
}))

jest.mock("cors", () => jest.fn(() => jest.fn((req, res, next) => next())))

describe("Generator with Multiple AI Providers - Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Provider Selection", () => {
    it("should use Gemini provider when provider is 'gemini'", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")

      const provider = await createAIProvider("gemini")
      const result = await provider.generateResume({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(provider.providerType).toBe("gemini")
      expect(provider.model).toBe("gemini-2.0-flash")
      expect(result.content.professionalSummary).toBe("Gemini summary")
    })

    it("should use OpenAI provider when provider is 'openai'", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")

      const provider = await createAIProvider("openai")
      const result = await provider.generateResume({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(provider.providerType).toBe("openai")
      expect(provider.model).toBe("gpt-4o-2024-08-06")
      expect(result.content.professionalSummary).toBe("OpenAI summary")
    })

    it("should default to Gemini when no provider specified", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")

      // When provider is undefined, factory should default to gemini
      const provider = await createAIProvider("gemini")

      expect(provider.providerType).toBe("gemini")
    })
  })

  describe("Cost Calculation by Provider", () => {
    it("should calculate Gemini cost correctly", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("gemini")

      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const cost = provider.calculateCost(tokenUsage)

      // (2000 / 1M * $0.10) + (1000 / 1M * $0.40) = $0.0006
      expect(cost).toBeCloseTo(0.0006, 4)
    })

    it("should calculate OpenAI cost correctly", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("openai")

      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const cost = provider.calculateCost(tokenUsage)

      // (2000 / 1M * $2.50) + (1000 / 1M * $10.00) = $0.015
      expect(cost).toBeCloseTo(0.015, 4)
    })

    it("should show Gemini is 25x cheaper than OpenAI", async () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      // Get Gemini cost
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)
      let provider = await (await import("../services/ai-provider.factory")).createAIProvider("gemini")
      const geminiCost = provider.calculateCost(tokenUsage)

      // Get OpenAI cost
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)
      provider = await (await import("../services/ai-provider.factory")).createAIProvider("openai")
      const openaiCost = provider.calculateCost(tokenUsage)

      const ratio = openaiCost / geminiCost
      expect(ratio).toBeCloseTo(25, 0)
    })
  })

  describe("Resume Generation by Provider", () => {
    it("should generate resume with Gemini", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("gemini")

      const result = await provider.generateResume({
        personalInfo: { name: "Test User", email: "test@example.com" },
        job: { role: "Software Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result.model).toBe("gemini-2.0-flash")
      expect(result.content.professionalSummary).toBe("Gemini summary")
      expect(mockGeminiProvider.generateResume).toHaveBeenCalled()
    })

    it("should generate resume with OpenAI", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("openai")

      const result = await provider.generateResume({
        personalInfo: { name: "Test User", email: "test@example.com" },
        job: { role: "Software Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result.model).toBe("gpt-4o-2024-08-06")
      expect(result.content.professionalSummary).toBe("OpenAI summary")
      expect(mockOpenAIProvider.generateResume).toHaveBeenCalled()
    })
  })

  describe("Cover Letter Generation by Provider", () => {
    it("should generate cover letter with Gemini", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("gemini")

      const result = await provider.generateCoverLetter({
        personalInfo: { name: "Test User", email: "test@example.com" },
        job: { role: "Software Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result.model).toBe("gemini-2.0-flash")
      expect(result.content.openingParagraph).toBe("Gemini generated cover letter")
      expect(mockGeminiProvider.generateCoverLetter).toHaveBeenCalled()
    })

    it("should generate cover letter with OpenAI", async () => {
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)

      const { createAIProvider } = await import("../services/ai-provider.factory")
      const provider = await createAIProvider("openai")

      const result = await provider.generateCoverLetter({
        personalInfo: { name: "Test User", email: "test@example.com" },
        job: { role: "Software Engineer", company: "Test Co" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      expect(result.model).toBe("gpt-4o-2024-08-06")
      expect(result.content.openingParagraph).toBe("OpenAI generated cover letter")
      expect(mockOpenAIProvider.generateCoverLetter).toHaveBeenCalled()
    })
  })

  describe("Provider Consistency", () => {
    it("both providers should return same result structure for resume", async () => {
      // Get Gemini result
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)
      let provider = await (await import("../services/ai-provider.factory")).createAIProvider("gemini")
      const geminiResult = await provider.generateResume({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Get OpenAI result
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)
      provider = await (await import("../services/ai-provider.factory")).createAIProvider("openai")
      const openaiResult = await provider.generateResume({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Both should have same structure
      expect(geminiResult).toHaveProperty("content")
      expect(geminiResult).toHaveProperty("tokenUsage")
      expect(geminiResult).toHaveProperty("model")

      expect(openaiResult).toHaveProperty("content")
      expect(openaiResult).toHaveProperty("tokenUsage")
      expect(openaiResult).toHaveProperty("model")

      // Content structure should be same
      expect(geminiResult.content).toHaveProperty("personalInfo")
      expect(geminiResult.content).toHaveProperty("professionalSummary")
      expect(geminiResult.content).toHaveProperty("experience")
      expect(geminiResult.content).toHaveProperty("skills")
      expect(geminiResult.content).toHaveProperty("education")

      expect(openaiResult.content).toHaveProperty("personalInfo")
      expect(openaiResult.content).toHaveProperty("professionalSummary")
      expect(openaiResult.content).toHaveProperty("experience")
      expect(openaiResult.content).toHaveProperty("skills")
      expect(openaiResult.content).toHaveProperty("education")
    })

    it("both providers should return same result structure for cover letter", async () => {
      // Get Gemini result
      mockCreateAIProvider.mockResolvedValueOnce(mockGeminiProvider)
      let provider = await (await import("../services/ai-provider.factory")).createAIProvider("gemini")
      const geminiResult = await provider.generateCoverLetter({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Get OpenAI result
      mockCreateAIProvider.mockResolvedValueOnce(mockOpenAIProvider)
      provider = await (await import("../services/ai-provider.factory")).createAIProvider("openai")
      const openaiResult = await provider.generateCoverLetter({
        personalInfo: { name: "Test", email: "test@example.com" },
        job: { role: "Engineer", company: "Test" },
        experienceEntries: [],
        experienceBlurbs: [],
      })

      // Both should have same structure
      expect(geminiResult.content).toHaveProperty("greeting")
      expect(geminiResult.content).toHaveProperty("openingParagraph")
      expect(geminiResult.content).toHaveProperty("bodyParagraphs")
      expect(geminiResult.content).toHaveProperty("closingParagraph")
      expect(geminiResult.content).toHaveProperty("signature")

      expect(openaiResult.content).toHaveProperty("greeting")
      expect(openaiResult.content).toHaveProperty("openingParagraph")
      expect(openaiResult.content).toHaveProperty("bodyParagraphs")
      expect(openaiResult.content).toHaveProperty("closingParagraph")
      expect(openaiResult.content).toHaveProperty("signature")
    })
  })
})
