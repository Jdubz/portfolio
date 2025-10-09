import { BlurbService, type CreateBlurbData, type UpdateBlurbData } from "../services/blurb.service"

// Mock Firestore
const mockGet = jest.fn()
const mockSet = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockDoc = jest.fn()
const mockCollection = jest.fn()

jest.mock("@google-cloud/firestore", () => {
  return {
    Firestore: jest.fn().mockImplementation(() => ({
      collection: mockCollection,
    })),
    Timestamp: {
      now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
    },
  }
})

describe("BlurbService", () => {
  let service: BlurbService
  const mockTimestamp = { seconds: 1234567890, nanoseconds: 0 }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock chain
    mockCollection.mockReturnValue({
      get: mockGet,
      doc: mockDoc,
    })

    mockDoc.mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    })

    service = new BlurbService()
  })

  describe("listBlurbs", () => {
    it("should return all blurbs", async () => {
      const mockBlurbs = [
        {
          id: "intro",
          data: () => ({
            name: "intro",
            title: "Introduction",
            content: "Welcome to my portfolio",
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp,
            createdBy: "test@example.com",
            updatedBy: "test@example.com",
          }),
        },
        {
          id: "skills",
          data: () => ({
            name: "skills",
            title: "Skills",
            content: "My technical skills",
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp,
            createdBy: "test@example.com",
            updatedBy: "test@example.com",
          }),
        },
      ]

      mockGet.mockResolvedValue({
        docs: mockBlurbs,
      })

      const result = await service.listBlurbs()

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe("intro")
      expect(result[1].name).toBe("skills")
      expect(mockCollection).toHaveBeenCalledWith("experience-blurbs")
    })
  })

  describe("getBlurb", () => {
    it("should return a single blurb", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        id: "intro",
        data: () => ({
          name: "intro",
          title: "Introduction",
          content: "Welcome to my portfolio",
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
          createdBy: "test@example.com",
          updatedBy: "test@example.com",
        }),
      })

      const result = await service.getBlurb("intro")

      expect(result).not.toBeNull()
      expect(result?.name).toBe("intro")
      expect(result?.title).toBe("Introduction")
      expect(mockDoc).toHaveBeenCalledWith("intro")
    })

    it("should return null if blurb not found", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      const result = await service.getBlurb("nonexistent")

      expect(result).toBeNull()
    })
  })

  describe("createBlurb", () => {
    it("should create a new blurb", async () => {
      const createData: CreateBlurbData = {
        name: "intro",
        title: "Introduction",
        content: "Welcome to my portfolio",
      }

      const result = await service.createBlurb(createData, "test@example.com")

      expect(result.id).toBe("intro")
      expect(result.name).toBe("intro")
      expect(result.title).toBe("Introduction")
      expect(result.content).toBe("Welcome to my portfolio")
      expect(result.createdBy).toBe("test@example.com")
      expect(result.updatedBy).toBe("test@example.com")
      expect(mockDoc).toHaveBeenCalledWith("intro")
      expect(mockSet).toHaveBeenCalled()
    })
  })

  describe("updateBlurb", () => {
    it("should update an existing blurb", async () => {
      const updateData: UpdateBlurbData = {
        title: "Updated Introduction",
        content: "Updated content",
      }

      mockGet
        .mockResolvedValueOnce({
          exists: true,
          id: "intro",
          data: () => ({
            name: "intro",
            title: "Introduction",
            content: "Old content",
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp,
            createdBy: "test@example.com",
            updatedBy: "test@example.com",
          }),
        })
        .mockResolvedValueOnce({
          id: "intro",
          data: () => ({
            name: "intro",
            title: "Updated Introduction",
            content: "Updated content",
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp,
            createdBy: "test@example.com",
            updatedBy: "editor@example.com",
          }),
        })

      const result = await service.updateBlurb("intro", updateData, "editor@example.com")

      expect(result.title).toBe("Updated Introduction")
      expect(result.content).toBe("Updated content")
      expect(result.updatedBy).toBe("editor@example.com")
      expect(mockUpdate).toHaveBeenCalled()
    })

    it("should throw error if blurb not found", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      await expect(service.updateBlurb("nonexistent", { title: "Test" }, "test@example.com")).rejects.toThrow(
        "Blurb not found: nonexistent"
      )
    })
  })

  describe("deleteBlurb", () => {
    it("should delete a blurb", async () => {
      mockGet.mockResolvedValue({
        exists: true,
      })

      await service.deleteBlurb("intro")

      expect(mockDoc).toHaveBeenCalledWith("intro")
      expect(mockDelete).toHaveBeenCalled()
    })

    it("should throw error if blurb not found", async () => {
      mockGet.mockResolvedValue({
        exists: false,
      })

      await expect(service.deleteBlurb("nonexistent")).rejects.toThrow("Blurb not found: nonexistent")
    })
  })
})
