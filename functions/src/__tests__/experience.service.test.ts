import {
  ExperienceService,
  type CreateExperienceData,
  type UpdateExperienceData,
} from "../services/experience.service"

// Mock Firestore
const mockGet = jest.fn()
const mockAdd = jest.fn()
const mockUpdate = jest.fn()
const mockDelete = jest.fn()
const mockDoc = jest.fn()
const mockOrderBy = jest.fn()
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

describe("ExperienceService", () => {
  let service: ExperienceService
  const mockTimestamp = { seconds: 1234567890, nanoseconds: 0 }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock chain
    mockCollection.mockReturnValue({
      orderBy: mockOrderBy,
      doc: mockDoc,
      add: mockAdd,
    })

    mockOrderBy.mockReturnValue({
      get: mockGet,
    })

    mockDoc.mockReturnValue({
      get: mockGet,
      update: mockUpdate,
      delete: mockDelete,
    })

    service = new ExperienceService()
  })

  describe("listEntries", () => {
    it("should return all entries sorted by startDate desc", async () => {
      const mockEntries = [
        {
          id: "entry1",
          title: "Senior Engineer",
          body: "Description",
          startDate: "2023-01",
          endDate: null,
          notes: "Remote",
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
          createdBy: "user@example.com",
          updatedBy: "user@example.com",
        },
        {
          id: "entry2",
          title: "Junior Engineer",
          body: "Description 2",
          startDate: "2020-01",
          endDate: "2022-12",
          notes: "",
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
          createdBy: "user@example.com",
          updatedBy: "user@example.com",
        },
      ]

      mockGet.mockResolvedValue({
        docs: mockEntries.map((entry) => ({
          id: entry.id,
          data: () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = entry
            return rest
          },
        })),
      })

      const result = await service.listEntries()

      expect(mockCollection).toHaveBeenCalledWith("experience-entries")
      expect(mockOrderBy).toHaveBeenCalledWith("order", "asc")
      expect(result).toEqual(mockEntries)
    })

    it("should return empty array when no entries exist", async () => {
      mockGet.mockResolvedValue({ docs: [] })

      const result = await service.listEntries()

      expect(result).toEqual([])
    })

    it("should throw error on database failure", async () => {
      mockGet.mockRejectedValue(new Error("Database error"))

      await expect(service.listEntries()).rejects.toThrow("Database error")
    })
  })

  describe("getEntry", () => {
    it("should return entry by ID", async () => {
      const mockEntry = {
        id: "entry1",
        title: "Senior Engineer",
        body: "Description",
        startDate: "2023-01",
        endDate: null,
        notes: "Remote",
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        createdBy: "user@example.com",
        updatedBy: "user@example.com",
      }

      mockGet.mockResolvedValue({
        exists: true,
        id: mockEntry.id,
        data: () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = mockEntry
          return rest
        },
      })

      const result = await service.getEntry("entry1")

      expect(mockDoc).toHaveBeenCalledWith("entry1")
      expect(result).toEqual(mockEntry)
    })

    it("should return null if entry does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false })

      const result = await service.getEntry("nonexistent")

      expect(result).toBeNull()
    })

    it("should throw error on database failure", async () => {
      mockGet.mockRejectedValue(new Error("Database error"))

      await expect(service.getEntry("entry1")).rejects.toThrow("Database error")
    })
  })

  describe("createEntry", () => {
    it("should create a new entry with all fields", async () => {
      const createData: CreateExperienceData = {
        title: "Senior Engineer",
        body: "Description of role",
        startDate: "2023-01",
        endDate: "2024-12",
        notes: "Remote position",
      }

      const userEmail = "creator@example.com"
      const mockDocId = "new-entry-id"

      mockAdd.mockResolvedValue({ id: mockDocId })

      const result = await service.createEntry(createData, userEmail)

      expect(mockCollection).toHaveBeenCalledWith("experience-entries")
      expect(mockAdd).toHaveBeenCalledWith({
        title: createData.title,
        body: createData.body,
        startDate: createData.startDate,
        endDate: createData.endDate,
        notes: createData.notes,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        createdBy: userEmail,
        updatedBy: userEmail,
      })

      expect(result).toEqual({
        id: mockDocId,
        title: createData.title,
        body: createData.body,
        startDate: createData.startDate,
        endDate: createData.endDate,
        notes: createData.notes,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        createdBy: userEmail,
        updatedBy: userEmail,
      })
    })

    it("should create entry with only required fields", async () => {
      const createData: CreateExperienceData = {
        title: "Engineer",
        startDate: "2023-01",
      }

      const userEmail = "creator@example.com"
      mockAdd.mockResolvedValue({ id: "new-id" })

      const result = await service.createEntry(createData, userEmail)

      expect(mockAdd).toHaveBeenCalledWith({
        title: createData.title,
        role: undefined,
        location: undefined,
        body: undefined,
        startDate: createData.startDate,
        endDate: null,
        notes: undefined,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        createdBy: userEmail,
        updatedBy: userEmail,
      })

      expect(result.title).toBe(createData.title)
      expect(result.body).toBeUndefined()
      expect(result.endDate).toBeNull()
    })

    it("should throw error on database failure", async () => {
      mockAdd.mockRejectedValue(new Error("Database error"))

      const createData: CreateExperienceData = {
        title: "Engineer",
        startDate: "2023-01",
      }

      await expect(service.createEntry(createData, "user@example.com")).rejects.toThrow("Database error")
    })
  })

  describe("updateEntry", () => {
    const existingEntry = {
      id: "entry1",
      title: "Original Title",
      body: "Original Body",
      startDate: "2023-01",
      endDate: null,
      notes: "Original Notes",
      createdAt: mockTimestamp,
      updatedAt: mockTimestamp,
      createdBy: "creator@example.com",
      updatedBy: "creator@example.com",
    }

    beforeEach(() => {
      mockGet.mockResolvedValue({
        exists: true,
        id: existingEntry.id,
        data: () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = existingEntry
          return rest
        },
      })
    })

    it("should update specified fields only", async () => {
      const updateData: UpdateExperienceData = {
        title: "Updated Title",
        endDate: "2024-12",
      }

      const userEmail = "editor@example.com"

      await service.updateEntry("entry1", updateData, userEmail)

      expect(mockDoc).toHaveBeenCalledWith("entry1")
      expect(mockUpdate).toHaveBeenCalledWith({
        title: "Updated Title",
        endDate: "2024-12",
        updatedAt: mockTimestamp,
        updatedBy: userEmail,
      })
    })

    it("should update all fields when provided", async () => {
      const updateData: UpdateExperienceData = {
        title: "New Title",
        body: "New Body",
        startDate: "2024-01",
        endDate: "2025-12",
        notes: "New Notes",
      }

      const userEmail = "editor@example.com"

      await service.updateEntry("entry1", updateData, userEmail)

      expect(mockUpdate).toHaveBeenCalledWith({
        title: updateData.title,
        body: updateData.body,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        notes: updateData.notes,
        updatedAt: mockTimestamp,
        updatedBy: userEmail,
      })
    })

    it("should throw error if entry does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false })

      const updateData: UpdateExperienceData = { title: "New Title" }

      await expect(service.updateEntry("nonexistent", updateData, "user@example.com")).rejects.toThrow(
        "Experience entry not found: nonexistent"
      )

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it("should throw error on database failure", async () => {
      mockUpdate.mockRejectedValue(new Error("Database error"))

      const updateData: UpdateExperienceData = { title: "New Title" }

      await expect(service.updateEntry("entry1", updateData, "user@example.com")).rejects.toThrow("Database error")
    })
  })

  describe("deleteEntry", () => {
    it("should delete existing entry", async () => {
      mockGet.mockResolvedValue({ exists: true })

      await service.deleteEntry("entry1")

      expect(mockDoc).toHaveBeenCalledWith("entry1")
      expect(mockDelete).toHaveBeenCalled()
    })

    it("should throw error if entry does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false })

      await expect(service.deleteEntry("nonexistent")).rejects.toThrow("Experience entry not found: nonexistent")

      expect(mockDelete).not.toHaveBeenCalled()
    })

    it("should throw error on database failure", async () => {
      mockGet.mockResolvedValue({ exists: true })
      mockDelete.mockRejectedValue(new Error("Database error"))

      await expect(service.deleteEntry("entry1")).rejects.toThrow("Database error")
    })
  })
})
