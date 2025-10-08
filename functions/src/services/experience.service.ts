import { Firestore, Timestamp } from "@google-cloud/firestore"
import { DATABASE_ID, EXPERIENCE_COLLECTION } from "../config/database"

// Use collection name from config
const COLLECTION_NAME = EXPERIENCE_COLLECTION

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export interface ExperienceEntry {
  id: string
  title: string
  body?: string
  startDate: string // YYYY-MM format
  endDate?: string | null // YYYY-MM format or null (= Present)
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // Email of creator
  updatedBy: string // Email of last editor
}

export interface CreateExperienceData {
  title: string
  body?: string
  startDate: string
  endDate?: string | null
  notes?: string
}

export interface UpdateExperienceData {
  title?: string
  body?: string
  startDate?: string
  endDate?: string | null
  notes?: string
}

export class ExperienceService {
  private db: Firestore
  private logger: SimpleLogger
  private collectionName = COLLECTION_NAME

  constructor(logger?: SimpleLogger) {
    // Initialize Firestore with the named database "portfolio"
    this.db = new Firestore({
      databaseId: DATABASE_ID,
    })

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

    this.logger = logger || {
      info: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
      },
      warning: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
      },
      error: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
      },
    }
  }

  /**
   * List all experience entries, sorted by startDate (newest first)
   */
  async listEntries(): Promise<ExperienceEntry[]> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .orderBy("startDate", "desc")
        .get()

      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ExperienceEntry, "id">),
      }))

      this.logger.info("Retrieved experience entries", {
        count: entries.length,
      })

      return entries
    } catch (error) {
      this.logger.error("Failed to list experience entries", { error })
      throw error
    }
  }

  /**
   * Get a single experience entry by ID
   */
  async getEntry(id: string): Promise<ExperienceEntry | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.info("Experience entry not found", { id })
        return null
      }

      const entry = {
        id: doc.id,
        ...(doc.data() as Omit<ExperienceEntry, "id">),
      }

      this.logger.info("Retrieved experience entry", { id })
      return entry
    } catch (error) {
      this.logger.error("Failed to get experience entry", { error, id })
      throw error
    }
  }

  /**
   * Create a new experience entry
   */
  async createEntry(data: CreateExperienceData, userEmail: string): Promise<ExperienceEntry> {
    try {
      const now = Timestamp.now()

      const entry = {
        title: data.title,
        body: data.body || "",
        startDate: data.startDate,
        endDate: data.endDate || null,
        notes: data.notes || "",
        createdAt: now,
        updatedAt: now,
        createdBy: userEmail,
        updatedBy: userEmail,
      }

      const docRef = await this.db.collection(this.collectionName).add(entry)

      const createdEntry: ExperienceEntry = {
        id: docRef.id,
        ...entry,
      }

      this.logger.info("Created experience entry", {
        id: docRef.id,
        title: data.title,
        createdBy: userEmail,
      })

      return createdEntry
    } catch (error) {
      this.logger.error("Failed to create experience entry", {
        error,
        data,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Update an existing experience entry
   */
  async updateEntry(id: string, data: UpdateExperienceData, userEmail: string): Promise<ExperienceEntry> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id)
      const doc = await docRef.get()

      if (!doc.exists) {
        throw new Error(`Experience entry not found: ${id}`)
      }

      const updates: Partial<ExperienceEntry> = {
        updatedAt: Timestamp.now(),
        updatedBy: userEmail,
      }

      // Only update provided fields
      if (data.title !== undefined) updates.title = data.title
      if (data.body !== undefined) updates.body = data.body
      if (data.startDate !== undefined) updates.startDate = data.startDate
      if (data.endDate !== undefined) updates.endDate = data.endDate
      if (data.notes !== undefined) updates.notes = data.notes

      await docRef.update(updates)

      // Fetch updated document
      const updatedDoc = await docRef.get()
      const updatedEntry: ExperienceEntry = {
        id: updatedDoc.id,
        ...(updatedDoc.data() as Omit<ExperienceEntry, "id">),
      }

      this.logger.info("Updated experience entry", {
        id,
        updatedBy: userEmail,
        fieldsUpdated: Object.keys(updates).filter((k) => k !== "updatedAt" && k !== "updatedBy"),
      })

      return updatedEntry
    } catch (error) {
      this.logger.error("Failed to update experience entry", {
        error,
        id,
        data,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Delete an experience entry
   */
  async deleteEntry(id: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(id)
      const doc = await docRef.get()

      if (!doc.exists) {
        throw new Error(`Experience entry not found: ${id}`)
      }

      await docRef.delete()

      this.logger.info("Deleted experience entry", { id })
    } catch (error) {
      this.logger.error("Failed to delete experience entry", {
        error,
        id,
      })
      throw error
    }
  }
}
