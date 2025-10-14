/**
 * Tests for GeneratorService
 */

import { GeneratorService } from "../generator.service"
import type { PersonalInfo, GenerationType } from "../../types/generator.types"
import type { ExperienceEntry } from "../experience.service"
import type { BlurbEntry } from "../blurb.service"

// Mock Firestore
jest.mock("@google-cloud/firestore")

describe("GeneratorService", () => {
  let service: GeneratorService
  let mockDb: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create mock Firestore instance
    mockDb = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }

    // Mock Firestore constructor
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Firestore } = require("@google-cloud/firestore") as { Firestore: jest.Mock }
    Firestore.mockImplementation(() => mockDb)

    service = new GeneratorService()
  })

  describe("getDefaults", () => {
    it("should return defaults when document exists", async () => {
      mockDb.get.mockResolvedValue({
        exists: true,
        id: "personal-info",
        data: () => ({
          type: "personal-info",
          name: "John Doe",
          email: "john@example.com",
          accentColor: "#3B82F6",
            createdAt: { seconds: 1234567890 },
          updatedAt: { seconds: 1234567890 },
        }),
      })

      const result = await service.getDefaults()

      expect(result).toBeDefined()
      expect(result?.name).toBe("John Doe")
      expect(result?.email).toBe("john@example.com")
    })

    it("should return null when document does not exist", async () => {
      mockDb.get.mockResolvedValue({
        exists: false,
      })

      const result = await service.getDefaults()

      expect(result).toBeNull()
    })

    it("should throw error on Firestore failure", async () => {
      mockDb.get.mockRejectedValue(new Error("Firestore error"))

      await expect(service.getDefaults()).rejects.toThrow("Firestore error")
    })
  })

  describe("createRequest", () => {
    it("should create a request document with correct structure", async () => {
      const generateType: GenerationType = "resume"
      const job = {
        role: "Senior Engineer",
        company: "Google",
      }
      const personalInfo: PersonalInfo = {
        id: "personal-info",
        type: "personal-info",
        name: "John Doe",
        email: "john@example.com",
        accentColor: "#3B82F6",
        createdAt: { seconds: 1234567890 } as any,
        updatedAt: { seconds: 1234567890 } as any,
      }
      const experienceData = {
        entries: [] as ExperienceEntry[],
        blurbs: [] as BlurbEntry[],
      }

      mockDb.set.mockResolvedValue({})

      const requestId = await service.createRequest(generateType, job, personalInfo, experienceData)

      expect(requestId).toMatch(/^resume-generator-request-\d+-[a-z0-9]+$/)
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "request",
          generateType,
          job,
          status: "pending",
        })
      )
    })

    it("should set isPublic correctly for viewers", async () => {
      const generateType: GenerationType = "resume"
      const job = { role: "Engineer", company: "Google" }
      const personalInfo: PersonalInfo = {
        id: "personal-info",
        type: "personal-info",
        name: "John Doe",
        email: "john@example.com",
        accentColor: "#3B82F6",
        createdAt: { seconds: 1234567890 } as any,
        updatedAt: { seconds: 1234567890 } as any,
      }
      const experienceData = {
        entries: [],
        blurbs: [],
      }

      mockDb.set.mockResolvedValue({})

      // Viewer (no editor email)
      await service.createRequest(generateType, job, personalInfo, experienceData, undefined, "session123")

      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          access: expect.objectContaining({
            isPublic: true,
            viewerSessionId: "session123",
          }),
        })
      )
    })

    it("should set isPublic correctly for editors", async () => {
      const generateType: GenerationType = "resume"
      const job = { role: "Engineer", company: "Google" }
      const personalInfo: PersonalInfo = {
        id: "personal-info",
        type: "personal-info",
        name: "John Doe",
        email: "john@example.com",
        accentColor: "#3B82F6",
        createdAt: { seconds: 1234567890 } as any,
        updatedAt: { seconds: 1234567890 } as any,
      }
      const experienceData = {
        entries: [],
        blurbs: [],
      }

      mockDb.set.mockResolvedValue({})

      // Editor
      await service.createRequest(
        generateType,
        job,
        personalInfo,
        experienceData,
        undefined,
        undefined,
        "editor@example.com"
      )

      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          access: expect.objectContaining({
            isPublic: false,
          }),
          createdBy: "editor@example.com",
        })
      )
    })
  })

  describe("createResponse", () => {
    it("should create response document with matching ID", async () => {
      const requestId = "resume-generator-request-123-abc"
      const result = {
        success: true,
        resume: {} as any,
      }
      const metrics = {
        durationMs: 5000,
        model: "gpt-4o-2024-08-06",
      }

      mockDb.set.mockResolvedValue({})

      const responseId = await service.createResponse(requestId, result, metrics)

      expect(responseId).toBe("resume-generator-response-123-abc")
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "response",
          requestId,
          result,
          metrics,
        })
      )
    })

    it("should include error information in failed response", async () => {
      const requestId = "resume-generator-request-123-abc"
      const result = {
        success: false,
        error: {
          message: "OpenAI API error",
          code: "RATE_LIMIT",
          stage: "openai_resume" as const,
        },
      }
      const metrics = {
        durationMs: 1000,
        model: "gpt-4o-2024-08-06",
      }

      mockDb.set.mockResolvedValue({})

      await service.createResponse(requestId, result, metrics)

      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          result: expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              message: "OpenAI API error",
              stage: "openai_resume",
            }),
          }),
        })
      )
    })
  })

  describe("updateRequestStatus", () => {
    it("should update status field", async () => {
      const requestId = "resume-generator-request-123-abc"
      mockDb.update.mockResolvedValue({})

      await service.updateStatus(requestId, "processing")

      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "processing",
        })
      )
    })
  })

  describe("listRequests", () => {
    it("should return list of requests", async () => {
      const mockRequests = [
        {
          id: "resume-generator-request-1-abc",
          type: "request",
          generateType: "resume",
        },
        {
          id: "resume-generator-request-2-def",
          type: "request",
          generateType: "both",
        },
      ]

      mockDb.get.mockResolvedValue({
        docs: mockRequests.map((req) => ({
          id: req.id,
          data: () => ({ ...req }),
        })),
      })

      const result = await service.listRequests()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe("resume-generator-request-1-abc")
    })

    it("should filter by viewer session ID", async () => {
      const sessionId = "session123"
      mockDb.get.mockResolvedValue({ docs: [] })

      await service.listRequests({ viewerSessionId: sessionId })

      expect(mockDb.where).toHaveBeenCalledWith("access.viewerSessionId", "==", sessionId)
    })

    it("should apply limit", async () => {
      mockDb.get.mockResolvedValue({ docs: [] })

      await service.listRequests({ limit: 10 })

      expect(mockDb.limit).toHaveBeenCalledWith(10)
    })
  })
})
