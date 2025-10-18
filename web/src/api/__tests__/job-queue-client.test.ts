/**
 * Job Queue API Client Tests
 *
 * Tests the JobQueueClient to ensure it correctly formats requests
 * and handles responses from the job queue API.
 */

import { JobQueueClient } from "../job-queue-client"
import { getIdToken } from "../../utils/auth"
import type { QueueItem, StopList, QueueSettings, AISettings, SubmitJobResponse } from "../../types/job-queue"

// Mock fetch globally
global.fetch = jest.fn()

// Mock getIdToken from auth utils
jest.mock("../../utils/auth", () => ({
  getIdToken: jest.fn(),
}))

// Mock API config
jest.mock("../../config/api", () => ({
  getApiUrl: jest.fn(() => "https://test-api.example.com"),
  getJobQueueApiUrl: jest.fn(() => "https://test-api.example.com"),
}))

describe("JobQueueClient", () => {
  let client: JobQueueClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  const mockGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>

  beforeEach(() => {
    client = new JobQueueClient()
    mockFetch.mockClear()
    mockGetIdToken.mockClear()
    mockGetIdToken.mockResolvedValue("mock-token")
  })

  describe("submitJob", () => {
    it("should submit job with all fields", async () => {
      const mockResponse: SubmitJobResponse = {
        status: "success",
        message: "Job submitted successfully",
        queueItemId: "queue-123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockResponse }),
      } as Response)

      const result = await client.submitJob({
        url: "https://example.com/job",
        companyName: "Test Company",
        companyUrl: "https://example.com",
      })

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-api.example.com/submit",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer mock-token",
          }),
          body: JSON.stringify({
            url: "https://example.com/job",
            companyName: "Test Company",
            companyUrl: "https://example.com",
          }),
        })
      )
    })

    it("should submit job with minimal fields", async () => {
      const mockResponse: SubmitJobResponse = {
        status: "success",
        message: "Job submitted",
        queueItemId: "queue-456",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockResponse }),
      } as Response)

      const result = await client.submitJob({
        url: "https://example.com/job",
      })

      expect(result.queueItemId).toBe("queue-456")
    })
  })

  describe("submitCompanySource", () => {
    it("should submit company source with correct format", async () => {
      const mockResponse: SubmitJobResponse = {
        status: "success",
        message: "Source submitted",
        queueItemId: "queue-789",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockResponse }),
      } as Response)

      const result = await client.submitCompanySource("Acme Corp", "https://acme.com/careers")

      expect(result.queueItemId).toBe("queue-789")
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-api.example.com/submit",
        expect.objectContaining({
          body: JSON.stringify({
            url: "https://acme.com/careers",
            companyName: "Acme Corp",
          }),
        })
      )
    })
  })

  describe("getQueueStatus", () => {
    it("should fetch queue item status", async () => {
      const mockQueueItem: QueueItem = {
        id: "queue-123",
        type: "job",
        status: "pending",
        url: "https://example.com/job",
        company_name: "Test Company",
        company_id: "company-1",
        source: "user_submission",
        submitted_by: "test@example.com",
        retry_count: 0,
        max_retries: 3,
        created_at: new Date("2023-01-01").toISOString(),
        updated_at: new Date("2023-01-01").toISOString(),
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockQueueItem }),
      } as Response)

      const result = await client.getQueueStatus("queue-123")

      expect(result).toEqual(mockQueueItem)
      expect(mockFetch).toHaveBeenCalledWith(
        "https://test-api.example.com/status/queue-123",
        expect.objectContaining({
          method: "GET",
        })
      )
    })
  })

  describe("configuration management", () => {
    describe("getStopList", () => {
      it("should fetch stop list configuration", async () => {
        const mockStopList: StopList = {
          excludedCompanies: ["Blocked Company"],
          excludedKeywords: ["spam"],
          excludedDomains: ["blocked.com"],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockStopList }),
        } as Response)

        const result = await client.getStopList()

        expect(result).toEqual(mockStopList)
        expect(mockFetch).toHaveBeenCalledWith(
          "https://test-api.example.com/config/stop-list",
          expect.objectContaining({
            method: "GET",
          })
        )
      })
    })

    describe("updateStopList", () => {
      it("should update stop list configuration", async () => {
        const updatedStopList: StopList = {
          excludedCompanies: ["New Blocked Company"],
          excludedKeywords: ["new-spam"],
          excludedDomains: ["new-blocked.com"],
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: updatedStopList }),
        } as Response)

        const result = await client.updateStopList(updatedStopList)

        expect(result).toEqual(updatedStopList)
        expect(mockFetch).toHaveBeenCalledWith(
          "https://test-api.example.com/config/stop-list",
          expect.objectContaining({
            method: "PUT",
            body: JSON.stringify(updatedStopList),
          })
        )
      })
    })

    describe("getQueueSettings", () => {
      it("should fetch queue settings", async () => {
        const mockSettings: QueueSettings = {
          maxRetries: 3,
          retryDelaySeconds: 300,
          processingTimeout: 600,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockSettings }),
        } as Response)

        const result = await client.getQueueSettings()

        expect(result).toEqual(mockSettings)
      })
    })

    describe("updateQueueSettings", () => {
      it("should update queue settings", async () => {
        const updatedSettings: QueueSettings = {
          maxRetries: 5,
          retryDelaySeconds: 600,
          processingTimeout: 900,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: updatedSettings }),
        } as Response)

        const result = await client.updateQueueSettings(updatedSettings)

        expect(result.maxRetries).toBe(5)
      })
    })

    describe("getAISettings", () => {
      it("should fetch AI settings", async () => {
        const mockAISettings: AISettings = {
          provider: "openai",
          model: "gpt-4",
          minMatchScore: 70,
          costBudgetDaily: 100,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockAISettings }),
        } as Response)

        const result = await client.getAISettings()

        expect(result.provider).toBe("openai")
        expect(result.minMatchScore).toBe(70)
      })
    })

    describe("updateAISettings", () => {
      it("should update AI settings", async () => {
        const updatedAISettings: AISettings = {
          provider: "gemini",
          model: "gemini-2.0-flash-exp",
          minMatchScore: 75,
          costBudgetDaily: 50,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: updatedAISettings }),
        } as Response)

        const result = await client.updateAISettings(updatedAISettings)

        expect(result.provider).toBe("gemini")
      })
    })
  })

  describe("queue management", () => {
    describe("getStats", () => {
      it("should fetch queue statistics", async () => {
        const mockStats = {
          total: 100,
          pending: 10,
          processing: 5,
          completed: 80,
          failed: 5,
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockStats }),
        } as Response)

        const result = await client.getStats()

        expect(result.total).toBe(100)
        expect(result.pending).toBe(10)
      })
    })

    describe("getAllQueueItems", () => {
      it("should fetch all queue items", async () => {
        const mockItems: QueueItem[] = [
          {
            id: "queue-1",
            type: "job",
            status: "pending",
            url: "https://example.com/job1",
            company_name: "Company 1",
            company_id: "company-1",
            source: "user_submission",
            submitted_by: "test@example.com",
            retry_count: 0,
            max_retries: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "queue-2",
            type: "job",
            status: "success",
            url: "https://example.com/job2",
            company_name: "Company 2",
            company_id: "company-2",
            source: "automated_scan",
            submitted_by: null,
            retry_count: 0,
            max_retries: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockItems }),
        } as Response)

        const result = await client.getAllQueueItems()

        expect(result).toHaveLength(2)
        expect(result[0].id).toBe("queue-1")
      })
    })

    describe("retryQueueItem", () => {
      it("should retry a failed queue item", async () => {
        const mockUpdatedItem: QueueItem = {
          id: "queue-123",
          type: "job",
          status: "pending",
          url: "https://example.com/job",
          company_name: "Test Company",
          company_id: "company-1",
          source: "user_submission",
          submitted_by: "test@example.com",
          retry_count: 1,
          max_retries: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockUpdatedItem }),
        } as Response)

        const result = await client.retryQueueItem("queue-123")

        expect(result.status).toBe("pending")
        expect(result.retry_count).toBe(1)
        expect(mockFetch).toHaveBeenCalledWith(
          "https://test-api.example.com/retry/queue-123",
          expect.objectContaining({
            method: "POST",
          })
        )
      })
    })

    describe("deleteQueueItem", () => {
      it("should delete a queue item", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
          json: async () => ({ success: true, data: null }),
        } as Response)

        await client.deleteQueueItem("queue-123")

        expect(mockFetch).toHaveBeenCalledWith(
          "https://test-api.example.com/queue/queue-123",
          expect.objectContaining({
            method: "DELETE",
          })
        )
      })
    })
  })

  describe("scraping operations", () => {
    describe("submitScrape", () => {
      it("should submit scrape request with default empty object", async () => {
        const mockResponse = {
          status: "success" as const,
          message: "Scrape submitted",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockResponse }),
        } as Response)

        const result = await client.submitScrape()

        expect(result.status).toBe("success")
        expect(mockFetch).toHaveBeenCalledWith(
          "https://test-api.example.com/submit-scrape",
          expect.objectContaining({
            method: "POST",
            body: "{}",
          })
        )
      })

      it("should submit scrape request with options", async () => {
        const mockResponse = {
          status: "success" as const,
          message: "Scrape submitted",
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockResponse }),
        } as Response)

        const result = await client.submitScrape({ scrape_config: { target_matches: 10 } })

        expect(result.status).toBe("success")
      })
    })

    describe("hasPendingScrape", () => {
      it("should return true when pending scrape exists", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { hasPending: true } }),
        } as Response)

        const result = await client.hasPendingScrape()

        expect(result).toBe(true)
      })

      it("should return false when no pending scrape exists", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { hasPending: false } }),
        } as Response)

        const result = await client.hasPendingScrape()

        expect(result).toBe(false)
      })
    })
  })

  describe("error handling", () => {
    it("should handle fetch errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(
        client.submitJob({
          url: "https://example.com/job",
        })
      ).rejects.toThrow("Network error")
    })

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ error: "Invalid request" }),
      } as Response)

      await expect(
        client.submitJob({
          url: "invalid-url",
        })
      ).rejects.toThrow()
    })
  })

  describe("authentication", () => {
    it("should include auth token in all requests", async () => {
      mockGetIdToken.mockResolvedValue("test-auth-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { hasPending: false } }),
      } as Response)

      await client.hasPendingScrape()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-auth-token",
          }),
        })
      )
    })
  })
})
