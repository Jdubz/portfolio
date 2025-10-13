/**
 * Experience API Client Contract Tests
 *
 * These tests ensure the ExperienceClient correctly parses API responses
 * and maintains the contract between frontend and backend.
 */

import { ExperienceClient } from "../experience-client"
import type { ExperienceEntry } from "../../types/experience"
import { getIdToken } from "../../utils/auth"

// Mock fetch globally
global.fetch = jest.fn()

// Mock getIdToken from auth utils
jest.mock("../../utils/auth", () => ({
  getIdToken: jest.fn(),
}))

describe("ExperienceClient API Contract", () => {
  let client: ExperienceClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  const mockGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>

  beforeEach(() => {
    client = new ExperienceClient()
    mockFetch.mockClear()
    mockGetIdToken.mockClear()
  })

  describe("getEntries() - API Response Contract", () => {
    it("should correctly parse API response with data wrapper", async () => {
      // This is the REQUIRED API response format
      const mockApiResponse = {
        success: true,
        data: {
          entries: [
            {
              id: "test-1",
              title: "Test Company",
              role: "Engineer",
              startDate: "2023-01",
              endDate: null,
              body: "Test description",
              createdAt: "2023-01-15T10:30:00.000Z",
              updatedAt: "2023-01-15T10:30:00.000Z",
              createdBy: "test@example.com",
              updatedBy: "test@example.com",
            },
          ],
          count: 1,
        },
        requestId: "req_test_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const entries = await client.getEntries()

      // Verify it extracted data.entries correctly
      expect(entries).toEqual(mockApiResponse.data.entries)
      expect(entries).toHaveLength(1)
      expect(entries[0].id).toBe("test-1")
    })

    it("should fail if API returns entries without data wrapper (regression test)", async () => {
      // This is the WRONG format that caused the bug
      const wrongApiResponse = {
        success: true,
        entries: [
          {
            id: "test-1",
            title: "Test Company",
          },
        ],
        count: 1,
        requestId: "req_test_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(wrongApiResponse),
      } as Response)

      // This should throw because response.data is undefined
      await expect(client.getEntries()).rejects.toThrow()
    })

    it("should handle empty entries array", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          entries: [],
          count: 0,
        },
        requestId: "req_test_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const entries = await client.getEntries()

      expect(entries).toEqual([])
      expect(entries).toHaveLength(0)
    })
  })

  describe("createEntry() - API Response Contract", () => {
    it("should correctly parse single entry response", async () => {
      const mockEntry: ExperienceEntry = {
        id: "new-entry",
        title: "New Company",
        role: "Developer",
        startDate: "2024-01",
        endDate: null,
        body: "New role",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        createdBy: "test@example.com",
        updatedBy: "test@example.com",
      }

      const mockApiResponse = {
        success: true,
        data: { entry: mockEntry },
        requestId: "req_test_456",
      }

      // Mock authentication token
      mockGetIdToken.mockResolvedValueOnce("mock-auth-token")

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const entry = await client.createEntry({
        title: "New Company",
        role: "Developer",
        startDate: "2024-01",
        body: "New role",
      })

      expect(entry).toEqual(mockEntry)
      expect(entry.id).toBe("new-entry")
    })
  })

  describe("Error Handling Contract", () => {
    it("should handle API errors with proper structure", async () => {
      const mockErrorResponse = {
        success: false,
        error: "FIRESTORE_ERROR",
        errorCode: "EXP_DB_001",
        message: "Database error",
        requestId: "req_test_789",
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        url: "https://api.example.com/experience/entries",
        json: () => Promise.resolve(mockErrorResponse),
      } as Response)

      await expect(client.getEntries()).rejects.toThrow("Database error")
    })

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(client.getEntries()).rejects.toThrow("Network error")
    })
  })

  describe("Request Format Contract", () => {
    it("should call correct endpoint for getEntries", async () => {
      const mockApiResponse = {
        success: true,
        data: { entries: [], count: 0 },
        requestId: "req_test",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      await client.getEntries()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/entries"),
        expect.objectContaining({
          method: "GET",
        })
      )
    })
  })
})
