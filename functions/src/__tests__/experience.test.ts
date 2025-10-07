import { Response } from "express"

// Mock firebase-admin BEFORE importing modules
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}))

// Mock firebase-functions/v2
jest.mock("firebase-functions/v2", () => ({
  https: {
    onRequest: jest.fn((config, handler) => handler),
  },
}))

// Mock cors
const mockCorsMiddleware = jest.fn((req, res, next) => next())
jest.mock("cors", () => jest.fn(() => mockCorsMiddleware))

// Mock ExperienceService
const mockListEntries = jest.fn()
const mockCreateEntry = jest.fn()
const mockUpdateEntry = jest.fn()
const mockDeleteEntry = jest.fn()

jest.mock("../services/experience.service", () => ({
  ExperienceService: jest.fn().mockImplementation(() => ({
    listEntries: mockListEntries,
    createEntry: mockCreateEntry,
    updateEntry: mockUpdateEntry,
    deleteEntry: mockDeleteEntry,
  })),
}))

// Mock auth middleware
const mockVerifyAuthenticatedEditor = jest.fn()
jest.mock("../middleware/auth.middleware", () => ({
  verifyAuthenticatedEditor: jest.fn(() => mockVerifyAuthenticatedEditor),
}))

// Now import the function handler
import { manageExperience } from "../experience"

describe("Experience Cloud Function", () => {
  let mockRequest: any
  let mockResponse: Partial<Response>
  let jsonMock: jest.Mock
  let sendMock: jest.Mock
  let statusMock: jest.Mock

  const mockEntry = {
    id: "entry-123",
    title: "Senior Developer",
    body: "Worked on cool projects",
    startDate: "2023-01",
    endDate: "2024-12",
    notes: "Remote position",
    createdAt: { toDate: () => new Date("2024-01-01") },
    updatedAt: { toDate: () => new Date("2024-01-01") },
    createdBy: "editor1@example.com",
    updatedBy: "editor1@example.com",
  }

  beforeEach(() => {
    jest.clearAllMocks()

    sendMock = jest.fn()
    jsonMock = jest.fn()
    statusMock = jest.fn(() => ({ json: jsonMock, send: sendMock }))

    mockRequest = {
      method: "GET",
      path: "/experience/entries",
      url: "/experience/entries",
      headers: {},
      body: {},
      rawBody: Buffer.from(""),
    }

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    }

    // Default: CORS succeeds and calls next()
    mockCorsMiddleware.mockImplementation((req, res, next) => next())
  })

  describe("OPTIONS - CORS Preflight", () => {
    it("should handle OPTIONS preflight request", async () => {
      mockRequest.method = "OPTIONS"

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(204)
      expect(mockResponse.send).toHaveBeenCalledWith("")
    })
  })

  describe("GET /experience/entries - List All (Public)", () => {
    it("should list all entries without authentication", async () => {
      const entries = [mockEntry]
      mockListEntries.mockResolvedValue(entries)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockListEntries).toHaveBeenCalled()
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        entries,
        count: 1,
        requestId: expect.any(String),
      })
    })

    it("should return empty array when no entries exist", async () => {
      mockListEntries.mockResolvedValue([])

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        entries: [],
        count: 0,
        requestId: expect.any(String),
      })
    })

    it("should handle Firestore errors gracefully", async () => {
      mockListEntries.mockRejectedValue(new Error("Firestore connection failed"))

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(503)
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: "FIRESTORE_ERROR",
        errorCode: "EXP_DB_001",
        message: "Database error",
        requestId: expect.any(String),
      })
    })
  })

  describe("POST /experience/entries - Create Entry (Auth Required)", () => {
    beforeEach(() => {
      mockRequest.method = "POST"
      mockRequest.body = {
        title: "Senior Developer",
        body: "Worked on cool projects",
        startDate: "2023-01",
        endDate: "2024-12",
        notes: "Remote position",
      }

      // Mock successful authentication
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        ;(req as any).user = { email: "editor1@example.com" }
        next() // Call synchronously without error
      })
    })

    it("should create entry with valid authenticated request", async () => {
      mockCreateEntry.mockResolvedValue(mockEntry)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockVerifyAuthenticatedEditor).toHaveBeenCalled()
      expect(mockCreateEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Senior Developer",
          startDate: "2023-01",
        }),
        "editor1@example.com"
      )
      expect(statusMock).toHaveBeenCalledWith(201)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        entry: mockEntry,
        requestId: expect.any(String),
      })
    })

    it("should reject request without authentication", async () => {
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
          errorCode: "AUTH_001",
          message: "Authentication required",
        })
        // Call next with error to reject the Promise wrapper
        next(new Error("Authentication required"))
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(mockCreateEntry).not.toHaveBeenCalled()
    })

    it("should validate required fields", async () => {
      mockRequest.body = { body: "Missing title and startDate" }

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "VALIDATION_FAILED",
          errorCode: "EXP_VAL_001",
        })
      )
      expect(mockCreateEntry).not.toHaveBeenCalled()
    })

    it("should validate date format (YYYY-MM)", async () => {
      mockRequest.body = {
        title: "Senior Developer",
        startDate: "2023-13", // Invalid month
      }

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "VALIDATION_FAILED",
        })
      )
    })

    it("should allow optional fields to be empty", async () => {
      mockRequest.body = {
        title: "Senior Developer",
        startDate: "2023-01",
        body: "",
        endDate: null,
        notes: "",
      }
      mockCreateEntry.mockResolvedValue(mockEntry)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(201)
      expect(mockCreateEntry).toHaveBeenCalled()
    })

    it("should handle Firestore errors during creation", async () => {
      mockCreateEntry.mockRejectedValue(new Error("Firestore write failed"))

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(503)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "FIRESTORE_ERROR",
          errorCode: "EXP_DB_001",
        })
      )
    })
  })

  describe("PUT /experience/entries/:id - Update Entry (Auth Required)", () => {
    beforeEach(() => {
      mockRequest.method = "PUT"
      mockRequest.path = "/experience/entries/entry-123"
      mockRequest.url = "/experience/entries/entry-123"
      mockRequest.body = {
        title: "Lead Developer",
        endDate: "2025-01",
      }

      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        ;(req as any).user = { email: "editor1@example.com" }
        next() // Call synchronously without error
      })
    })

    it("should update entry with valid authenticated request", async () => {
      const updatedEntry = { ...mockEntry, title: "Lead Developer" }
      mockUpdateEntry.mockResolvedValue(updatedEntry)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockUpdateEntry).toHaveBeenCalledWith(
        "entry-123",
        expect.objectContaining({
          title: "Lead Developer",
          endDate: "2025-01",
        }),
        "editor1@example.com"
      )
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        entry: updatedEntry,
        requestId: expect.any(String),
      })
    })

    it("should reject request without authentication", async () => {
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
        })
        // Call next with error to reject the Promise wrapper
        next(new Error("Auth error"))
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(mockUpdateEntry).not.toHaveBeenCalled()
    })

    it("should return 404 when entry not found", async () => {
      mockUpdateEntry.mockRejectedValue(new Error("Entry not found"))

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "NOT_FOUND",
          errorCode: "EXP_REQ_001",
        })
      )
    })

    it("should allow partial updates", async () => {
      mockRequest.body = { notes: "Updated notes only" }
      mockUpdateEntry.mockResolvedValue(mockEntry)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockUpdateEntry).toHaveBeenCalledWith(
        "entry-123",
        expect.objectContaining({
          notes: "Updated notes only",
        }),
        "editor1@example.com"
      )
      expect(statusMock).toHaveBeenCalledWith(200)
    })

    it("should validate date format in updates", async () => {
      mockRequest.body = { startDate: "2023/01/01" } // Invalid format

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(400)
      expect(mockUpdateEntry).not.toHaveBeenCalled()
    })
  })

  describe("DELETE /experience/entries/:id - Delete Entry (Auth Required)", () => {
    beforeEach(() => {
      mockRequest.method = "DELETE"
      mockRequest.path = "/experience/entries/entry-123"
      mockRequest.url = "/experience/entries/entry-123"

      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        ;(req as any).user = { email: "editor1@example.com" }
        next() // Call synchronously without error
      })
    })

    it("should delete entry with valid authenticated request", async () => {
      mockDeleteEntry.mockResolvedValue(undefined)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockDeleteEntry).toHaveBeenCalledWith("entry-123")
      expect(statusMock).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Entry deleted successfully",
        requestId: expect.any(String),
      })
    })

    it("should reject request without authentication", async () => {
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
        })
        // Call next with error to reject the Promise wrapper
        next(new Error("Auth error"))
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(mockDeleteEntry).not.toHaveBeenCalled()
    })

    it("should return 404 when entry not found", async () => {
      mockDeleteEntry.mockRejectedValue(new Error("Entry not found"))

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(404)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "NOT_FOUND",
          errorCode: "EXP_REQ_001",
        })
      )
    })
  })

  describe("Error Handling", () => {
    it("should return 405 for unsupported methods", async () => {
      mockRequest.method = "PATCH"
      mockRequest.path = "/experience/entries"

      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        ;(req as any).user = { email: "editor1@example.com" }
        next()
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(405)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "METHOD_NOT_ALLOWED",
          errorCode: "EXP_REQ_002",
        })
      )
    })

    it("should handle unexpected errors gracefully", async () => {
      mockCorsMiddleware.mockImplementation(() => {
        throw new Error("Unexpected CORS error")
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: "INTERNAL_ERROR",
          errorCode: "EXP_SYS_001",
        })
      )
    })

    it("should include requestId in all error responses", async () => {
      mockListEntries.mockRejectedValue(new Error("Test error"))

      await manageExperience(mockRequest, mockResponse as Response)

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: expect.stringMatching(/^req_\d+_[a-z0-9]+$/),
        })
      )
    })
  })

  describe("Integration with Auth Middleware", () => {
    beforeEach(() => {
      mockRequest.method = "POST"
      mockRequest.path = "/experience/entries"
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      }
      mockRequest.body = {
        title: "Test Entry",
        startDate: "2024-01",
      }
    })

    it("should pass user info from middleware to service", async () => {
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        ;(req as any).user = { email: "editor2@example.com" }
        next()
      })
      mockCreateEntry.mockResolvedValue(mockEntry)

      await manageExperience(mockRequest, mockResponse as Response)

      expect(mockCreateEntry).toHaveBeenCalledWith(expect.any(Object), "editor2@example.com")
    })

    it("should handle auth middleware errors", async () => {
      mockVerifyAuthenticatedEditor.mockImplementation((req, res, next) => {
        res.status(403).json({
          success: false,
          error: "FORBIDDEN",
          errorCode: "AUTH_003",
          message: "Email not authorized",
        })
        // Call next with error to reject the Promise wrapper
        next(new Error("Auth error"))
      })

      await manageExperience(mockRequest, mockResponse as Response)

      expect(statusMock).toHaveBeenCalledWith(403)
      expect(mockCreateEntry).not.toHaveBeenCalled()
    })
  })
})
