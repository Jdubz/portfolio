/**
 * Blurb API Client Contract Tests
 *
 * These tests ensure the BlurbClient correctly parses API responses
 * and maintains the contract between frontend and backend.
 */

import { BlurbClient } from "../blurb-client"
import type { BlurbEntry, CreateBlurbData, UpdateBlurbData } from "../../types/experience"
import { getIdToken } from "../../utils/auth"

// Mock fetch globally
global.fetch = jest.fn()

// Mock getIdToken from auth utils
jest.mock("../../utils/auth", () => ({
  getIdToken: jest.fn(),
}))

describe("BlurbClient API Contract", () => {
  let client: BlurbClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  const mockGetIdToken = getIdToken as jest.MockedFunction<typeof getIdToken>

  beforeEach(() => {
    client = new BlurbClient()
    mockFetch.mockClear()
    mockGetIdToken.mockClear()
  })

  describe("getBlurbs() - API Response Contract", () => {
    it("should correctly parse API response with blurbs array", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          blurbs: [
            {
              id: "intro",
              name: "intro",
              title: "Introduction",
              content: "# Introduction\nHello world",
              createdAt: "2023-01-15T10:30:00.000Z",
              updatedAt: "2023-01-15T10:30:00.000Z",
            },
            {
              id: "skills",
              name: "skills",
              title: "Skills",
              content: "# Skills\n- TypeScript\n- React",
              createdAt: "2023-01-16T11:00:00.000Z",
              updatedAt: "2023-01-16T11:00:00.000Z",
            },
          ],
        },
        requestId: "req_test_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const blurbs = await client.getBlurbs()

      // Verify it extracted data.blurbs correctly
      expect(blurbs).toEqual(mockApiResponse.data.blurbs)
      expect(blurbs).toHaveLength(2)
      expect(blurbs[0].name).toBe("intro")
      expect(blurbs[1].name).toBe("skills")
    })

    it("should handle empty blurbs array", async () => {
      const mockApiResponse = {
        success: true,
        data: {
          blurbs: [],
        },
        requestId: "req_test_456",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      const blurbs = await client.getBlurbs()
      expect(blurbs).toEqual([])
    })

    it("should call correct endpoint without auth", async () => {
      const mockApiResponse = {
        success: true,
        data: { blurbs: [] },
        requestId: "req_test_789",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      await client.getBlurbs()

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/blurbs"),
        expect.objectContaining({
          method: "GET",
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      )
    })
  })

  describe("createBlurb() - API Request/Response Contract", () => {
    it("should send correct data format and parse response", async () => {
      const createData: CreateBlurbData = {
        name: "projects",
        title: "My Projects",
        content: "# My Projects\nProject list here",
      }

      const mockApiResponse = {
        success: true,
        data: {
          blurb: {
            id: "projects",
            name: "projects",
            title: "My Projects",
            content: "# My Projects\nProject list here",
            createdAt: "2023-01-17T12:00:00.000Z",
            updatedAt: "2023-01-17T12:00:00.000Z",
          },
        },
        requestId: "req_create_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      const blurb = await client.createBlurb(createData)

      // Verify response parsing
      expect(blurb).toEqual(mockApiResponse.data.blurb)
      expect(blurb.name).toBe("projects")

      // Verify request was made with auth
      expect(mockGetIdToken).toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/blurbs"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(createData),
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      )
    })

    it("should include all required fields in request", async () => {
      const createData: CreateBlurbData = {
        name: "footer",
        title: "Contact",
        content: "Contact information",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              blurb: {
                id: "footer",
                ...createData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await client.createBlurb(createData)

      const callArgs = mockFetch.mock.calls[0]
      const requestBody = JSON.parse(callArgs[1]?.body as string)

      expect(requestBody).toMatchObject({
        name: "footer",
        title: "Contact",
        content: "Contact information",
      })
    })
  })

  describe("updateBlurb() - API Request/Response Contract", () => {
    it("should send correct data format and parse response", async () => {
      const updateData: UpdateBlurbData = {
        title: "Updated Introduction",
        content: "# Updated Introduction\nNew content here",
      }

      const mockApiResponse = {
        success: true,
        data: {
          blurb: {
            id: "intro",
            name: "intro",
            title: "Updated Introduction",
            content: "# Updated Introduction\nNew content here",
            createdAt: "2023-01-15T10:30:00.000Z",
            updatedAt: "2023-01-18T14:00:00.000Z",
          },
        },
        requestId: "req_update_123",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      const blurb = await client.updateBlurb("intro", updateData)

      // Verify response parsing
      expect(blurb).toEqual(mockApiResponse.data.blurb)
      expect(blurb.name).toBe("intro")
      expect(blurb.content).toBe(updateData.content)

      // Verify correct endpoint and method
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/blurbs/intro"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      )
    })

    it("should URL encode blurb name in endpoint", async () => {
      const updateData: UpdateBlurbData = {
        content: "Updated content",
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              blurb: {
                id: "special-name",
                name: "special-name",
                title: "Special",
                content: updateData.content!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            },
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await client.updateBlurb("special-name", updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/blurbs/special-name"),
        expect.anything()
      )
    })
  })

  describe("deleteBlurb() - API Request Contract", () => {
    it("should send DELETE request to correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {},
            requestId: "req_delete_123",
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await client.deleteBlurb("intro")

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/experience/blurbs/intro"),
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      )
    })

    it("should require authentication", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {},
            requestId: "req_delete_456",
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await client.deleteBlurb("test-blurb")

      expect(mockGetIdToken).toHaveBeenCalled()
    })

    it("should not throw on successful deletion", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {},
            requestId: "req_delete_789",
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await expect(client.deleteBlurb("test-blurb")).resolves.not.toThrow()
    })
  })

  describe("Error Handling", () => {
    it("should throw on network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(client.getBlurbs()).rejects.toThrow()
    })

    it("should throw on 404 errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Blurb not found",
            },
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("mock-token")

      await expect(client.updateBlurb("nonexistent", { content: "test" })).rejects.toThrow()
    })

    it("should throw on 401 unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid token",
            },
          }),
      } as Response)

      mockGetIdToken.mockResolvedValueOnce("invalid-token")

      await expect(
        client.createBlurb({ name: "test", title: "Test", content: "test" })
      ).rejects.toThrow()
    })

    it("should throw on 500 server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Server error",
            },
          }),
      } as Response)

      await expect(client.getBlurbs()).rejects.toThrow()
    })
  })
})
