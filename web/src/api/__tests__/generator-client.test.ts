/**
 * Generator API Client Contract Tests
 *
 * These tests ensure the GeneratorClient correctly parses API responses
 * and maintains the contract between frontend and backend.
 */

import { GeneratorClient } from "../generator-client"
import type { GeneratorDefaults, GenerationRequest } from "../../types/generator"
import { getIdToken } from "../../hooks/useAuth"

// Mock fetch globally
global.fetch = jest.fn()

// Mock getIdToken from useAuth hook
jest.mock("../../hooks/useAuth", () => ({
  getIdToken: jest.fn(),
}))

describe("GeneratorClient API Contract", () => {
  let client: GeneratorClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  const mockGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>

  beforeEach(() => {
    client = new GeneratorClient()
    mockFetch.mockClear()
    mockGetIdToken.mockClear()
  })

  describe("generate() - API Response Contract", () => {
    it("should correctly parse generation response with data wrapper", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          resume: "base64_resume_pdf",
          coverLetter: "base64_cover_letter_pdf",
          metadata: {
            company: "Test Corp",
            role: "Senior Engineer",
            model: "gpt-4",
            tokenUsage: 1500,
            costUsd: 0.045,
            durationMs: 5000,
          },
        },
        requestId: "req_test_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.generate({
        generateType: "both",
        job: {
          role: "Senior Engineer",
          company: "Test Corp",
        },
      })

      expect(result).toEqual(mockApiResponse.data)
      expect(result.resume).toBe("base64_resume_pdf")
      expect(result.metadata?.company).toBe("Test Corp")
    })

    it("should handle resume-only generation", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          resume: "base64_resume_pdf",
          metadata: {
            company: "Test Corp",
            role: "Engineer",
            model: "gpt-4",
            durationMs: 3000,
          },
        },
        requestId: "req_test_456",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.generate({
        generateType: "resume",
        job: {
          role: "Engineer",
          company: "Test Corp",
        },
      })

      expect(result.resume).toBeDefined()
      expect(result.coverLetter).toBeUndefined()
    })

    it("should handle cover letter-only generation", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          coverLetter: "base64_cover_letter_pdf",
          metadata: {
            company: "Test Corp",
            role: "Engineer",
            model: "gpt-4",
            durationMs: 2500,
          },
        },
        requestId: "req_test_789",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.generate({
        generateType: "coverLetter",
        job: {
          role: "Engineer",
          company: "Test Corp",
        },
      })

      expect(result.coverLetter).toBeDefined()
      expect(result.resume).toBeUndefined()
    })
  })

  describe("getDefaults() - API Response Contract", () => {
    it("should correctly parse defaults response", async () => {
      const mockDefaults: GeneratorDefaults = {
        id: "default",
        type: "defaults",
        name: "John Doe",
        email: "john@example.com",
        phone: "555-1234",
        location: "San Francisco, CA",
        website: "https://johndoe.com",
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
        accentColor: "#3B82F6",
        defaultStyle: "modern",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }

      const mockApiResponse = {
        success: true,
        data: mockDefaults,
        requestId: "req_test_defaults",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.getDefaults()

      expect(result).toEqual(mockDefaults)
      expect(result.name).toBe("John Doe")
      expect(result.defaultStyle).toBe("modern")
    })
  })

  describe("updateDefaults() - API Response Contract", () => {
    it("should correctly parse update response with auth", async () => {
      const mockUpdated: GeneratorDefaults = {
        id: "default",
        type: "defaults",
        name: "Jane Doe",
        email: "jane@example.com",
        accentColor: "#EF4444",
        defaultStyle: "executive",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
        updatedBy: "user@example.com",
      }

      const mockApiResponse = {
        success: true,
        data: mockUpdated,
        requestId: "req_test_update",
      }

      mockGetIdToken.mockResolvedValueOnce("mock-auth-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.updateDefaults({
        name: "Jane Doe",
        accentColor: "#EF4444",
        defaultStyle: "executive",
      })

      expect(result).toEqual(mockUpdated)
      expect(result.name).toBe("Jane Doe")
      expect(result.updatedBy).toBe("user@example.com")
    })
  })

  describe("listRequests() - API Response Contract", () => {
    it("should correctly parse requests list with data wrapper", async () => {
      const mockRequests: GenerationRequest[] = [
        {
          id: "req_1",
          type: "request",
          generateType: "both",
          job: {
            role: "Engineer",
            company: "Corp A",
          },
          status: "completed",
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:01:00.000Z",
          completedAt: "2024-01-01T00:01:00.000Z",
        },
        {
          id: "req_2",
          type: "request",
          generateType: "resume",
          job: {
            role: "Manager",
            company: "Corp B",
          },
          status: "pending",
          createdAt: "2024-01-02T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ]

      const mockApiResponse = {
        success: true,
        data: {
          requests: mockRequests,
        },
        requestId: "req_test_list",
      }

      mockGetIdToken.mockResolvedValueOnce("mock-auth-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const result = await client.listRequests()

      expect(result).toEqual(mockRequests)
      expect(result).toHaveLength(2)
      expect(result[0].status).toBe("completed")
    })

    it("should handle limit parameter", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          requests: [],
        },
        requestId: "req_test_limit",
      }

      mockGetIdToken.mockResolvedValueOnce("mock-auth-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      await client.listRequests(10)

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("?limit=10"), expect.any(Object))
    })
  })

  describe("Error Handling Contract", () => {
    it("should handle API errors with proper structure", async () => {
      const mockErrorResponse = {
        success: false,
        error: "VALIDATION_FAILED",
        errorCode: "GEN_VAL_001",
        message: "Invalid job data",
        requestId: "req_test_error",
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        url: "https://api.example.com/generator/generate",
        json: () => Promise.resolve(mockErrorResponse),
      } as Response)

      await expect(
        client.generate({
          generateType: "both",
          job: {
            role: "",
            company: "",
          },
        })
      ).rejects.toThrow("Invalid job data")
    })

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(client.getDefaults()).rejects.toThrow("Network error")
    })
  })
})
