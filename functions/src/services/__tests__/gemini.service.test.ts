/**
 * Tests for Gemini Provider
 */

import { Timestamp } from "@google-cloud/firestore"
import { GeminiProvider } from "../gemini.service"
import type { GenerateResumeOptions, GenerateCoverLetterOptions } from "../../types/generator.types"

// Mock the Google Generative AI SDK
const mockGenerateContent = jest.fn()
const mockGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockGenerateContent,
})

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}))

describe("GeminiProvider", () => {
  let provider: GeminiProvider
  const mockApiKey = "test-gemini-api-key"

  beforeEach(() => {
    jest.clearAllMocks()
    provider = new GeminiProvider(mockApiKey)
  })

  describe("Provider Properties", () => {
    it("should have correct model name", () => {
      expect(provider.model).toBe("gemini-2.0-flash")
    })

    it("should have correct provider type", () => {
      expect(provider.providerType).toBe("gemini")
    })

    it("should have correct pricing", () => {
      expect(provider.pricing.inputCostPer1M).toBe(0.1)
      expect(provider.pricing.outputCostPer1M).toBe(0.4)
    })
  })

  describe("generateResume", () => {
    const mockResumeOptions: GenerateResumeOptions = {
      personalInfo: {
        name: "Test User",
        email: "test@example.com",
        phone: "555-1234",
        location: "Portland, OR",
        website: "https://example.com",
        github: "https://github.com/testuser",
        linkedin: "https://linkedin.com/in/testuser",
      },
      job: {
        role: "Senior Software Engineer",
        company: "Test Company",
        companyWebsite: "https://testcompany.com",
        jobDescription: "Build amazing software",
      },
      experienceEntries: [
        {
          id: "exp1",
          title: "Previous Company",
          role: "Software Engineer",
          location: "San Francisco, CA",
          startDate: "2020-01",
          endDate: "2023-12",
          body: "Developed features",
          notes: "",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: "test@example.com",
          updatedBy: "test@example.com",
        },
      ],
      experienceBlurbs: [
        {
          id: "blurb1",
          name: "exp1",
          title: "Previous Company Blurb",
          content: "Built scalable microservices\nImproved performance by 50%",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: "test@example.com",
          updatedBy: "test@example.com",
        },
      ],
      emphasize: ["TypeScript", "React"],
    }

    it("should generate resume successfully", async () => {
      const mockResumeContent = {
        personalInfo: {
          name: "Test User",
          title: "Senior Software Engineer",
          summary: "Experienced engineer",
          contact: {
            email: "test@example.com",
            location: "Portland, OR",
            website: "https://example.com",
            linkedin: "https://linkedin.com/in/testuser",
            github: "https://github.com/testuser",
          },
        },
        professionalSummary: "Highly skilled engineer with expertise in TypeScript and React.",
        experience: [
          {
            company: "Previous Company",
            role: "Software Engineer",
            location: "San Francisco, CA",
            startDate: "2020-01",
            endDate: "2023-12",
            highlights: ["Built scalable microservices", "Improved performance by 50%"],
            technologies: ["TypeScript", "Node.js", "React"],
          },
        ],
        skills: [
          { category: "Languages", items: ["TypeScript", "JavaScript"] },
          { category: "Frontend", items: ["React", "Vue.js"] },
        ],
        education: [],
      }

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockResumeContent),
        },
      })

      const result = await provider.generateResume(mockResumeOptions)

      expect(result.content).toEqual(mockResumeContent)
      expect(result.model).toBe("gemini-2.0-flash")
      expect(result.tokenUsage.totalTokens).toBeGreaterThan(0)
      expect(mockGenerateContent).toHaveBeenCalledWith({
        contents: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            parts: expect.any(Array),
          }),
        ]),
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      })
    })

    it("should use temperature 0 for factual accuracy", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              personalInfo: { name: "Test", title: "Engineer", summary: "Test", contact: {} },
              professionalSummary: "Test",
              experience: [],
              skills: [],
              education: [],
            }),
        },
      })

      await provider.generateResume(mockResumeOptions)

      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs.generationConfig.temperature).toBe(0)
    })

    it("should request JSON response format", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              personalInfo: { name: "Test", title: "Engineer", summary: "Test", contact: {} },
              professionalSummary: "Test",
              experience: [],
              skills: [],
              education: [],
            }),
        },
      })

      await provider.generateResume(mockResumeOptions)

      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs.generationConfig.responseMimeType).toBe("application/json")
    })

    it("should handle generation errors", async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error("API Error"))

      await expect(provider.generateResume(mockResumeOptions)).rejects.toThrow(
        "Gemini resume generation failed: API Error"
      )
    })
  })

  describe("generateCoverLetter", () => {
    const mockCoverLetterOptions: GenerateCoverLetterOptions = {
      personalInfo: {
        name: "Test User",
        email: "test@example.com",
      },
      job: {
        role: "Senior Software Engineer",
        company: "Test Company",
        companyWebsite: "https://testcompany.com",
        jobDescription: "Build amazing software",
      },
      experienceEntries: [
        {
          id: "exp1",
          title: "Previous Company",
          role: "Software Engineer",
          location: "San Francisco, CA",
          startDate: "2020-01",
          endDate: "2023-12",
          body: "Developed features",
          notes: "",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          createdBy: "test@example.com",
          updatedBy: "test@example.com",
        },
      ],
      experienceBlurbs: [],
    }

    it("should generate cover letter successfully", async () => {
      const mockCoverLetterContent = {
        greeting: "Dear Hiring Manager,",
        openingParagraph: "I am excited to apply for the Senior Software Engineer position at Test Company.",
        bodyParagraphs: [
          "I have extensive experience in software development.",
          "I am passionate about building scalable systems.",
        ],
        closingParagraph: "I look forward to discussing this opportunity with you.",
        signature: "Sincerely,\nTest User",
      }

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockCoverLetterContent),
        },
      })

      const result = await provider.generateCoverLetter(mockCoverLetterOptions)

      expect(result.content).toEqual(mockCoverLetterContent)
      expect(result.model).toBe("gemini-2.0-flash")
      expect(result.tokenUsage.totalTokens).toBeGreaterThan(0)
    })

    it("should use temperature 0 for cover letter", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              greeting: "Dear Hiring Manager,",
              openingParagraph: "Test",
              bodyParagraphs: ["Test"],
              closingParagraph: "Test",
              signature: "Test User",
            }),
        },
      })

      await provider.generateCoverLetter(mockCoverLetterOptions)

      const callArgs = mockGenerateContent.mock.calls[0][0]
      expect(callArgs.generationConfig.temperature).toBe(0)
    })

    it("should handle generation errors", async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error("API Error"))

      await expect(provider.generateCoverLetter(mockCoverLetterOptions)).rejects.toThrow(
        "Gemini cover letter generation failed: API Error"
      )
    })
  })

  describe("calculateCost", () => {
    it("should calculate cost correctly for typical usage", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const cost = provider.calculateCost(tokenUsage)

      // (2000 / 1M * $0.10) + (1000 / 1M * $0.40) = $0.0002 + $0.0004 = $0.0006
      expect(cost).toBeCloseTo(0.0006, 4)
    })

    it("should calculate cost for large generation", () => {
      const tokenUsage = {
        promptTokens: 10000,
        completionTokens: 5000,
        totalTokens: 15000,
      }

      const cost = provider.calculateCost(tokenUsage)

      // (10000 / 1M * $0.10) + (5000 / 1M * $0.40) = $0.001 + $0.002 = $0.003
      expect(cost).toBeCloseTo(0.003, 4)
    })

    it("should be 92% cheaper than OpenAI for same token usage", () => {
      const tokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      }

      const geminiCost = provider.calculateCost(tokenUsage)
      // OpenAI: (2000 / 1M * $2.50) + (1000 / 1M * $10.00) = $0.005 + $0.01 = $0.015
      const openaiCost = 0.015

      const savings = 1 - geminiCost / openaiCost
      expect(savings).toBeCloseTo(0.96, 2) // 96% cheaper
    })
  })

  describe("Mock Mode", () => {
    it("should generate mock resume when GEMINI_MOCK_MODE is enabled", async () => {
      process.env.GEMINI_MOCK_MODE = "true"
      const mockProvider = new GeminiProvider(mockApiKey)

      const mockResumeOptions: GenerateResumeOptions = {
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
      }

      const result = await mockProvider.generateResume(mockResumeOptions)

      expect(result.content.personalInfo.name).toBe("Test User")
      expect(result.model).toContain("MOCK")
      expect(mockGenerateContent).not.toHaveBeenCalled()

      delete process.env.GEMINI_MOCK_MODE
    })

    it("should generate mock cover letter when GEMINI_MOCK_MODE is enabled", async () => {
      process.env.GEMINI_MOCK_MODE = "true"
      const mockProvider = new GeminiProvider(mockApiKey)

      const mockCoverLetterOptions: GenerateCoverLetterOptions = {
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
      }

      const result = await mockProvider.generateCoverLetter(mockCoverLetterOptions)

      expect(result.content.signature).toContain("Test User")
      expect(result.model).toContain("MOCK")
      expect(mockGenerateContent).not.toHaveBeenCalled()

      delete process.env.GEMINI_MOCK_MODE
    })
  })
})
