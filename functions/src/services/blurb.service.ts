import { Firestore, Timestamp } from "@google-cloud/firestore"
import { DATABASE_ID, BLURBS_COLLECTION } from "../config/database"
import { createFirestoreInstance } from "../config/firestore"
import { createDefaultLogger } from "../utils/logger"
import type { SimpleLogger } from "../types/logger.types"

const COLLECTION_NAME = BLURBS_COLLECTION

export interface BlurbEntry {
  id: string
  name: string // Unique identifier
  title: string
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}

export interface CreateBlurbData {
  name: string
  title: string
  content: string
}

export interface UpdateBlurbData {
  title?: string
  content?: string
}

export class BlurbService {
  private db: Firestore
  private logger: SimpleLogger
  private collectionName = COLLECTION_NAME

  constructor(logger?: SimpleLogger) {
    // Use shared Firestore factory for consistent configuration
    this.db = createFirestoreInstance()

    // Use shared logger factory
    this.logger = logger || createDefaultLogger()
  }

  /**
   * List all blurbs
   */
  async listBlurbs(): Promise<BlurbEntry[]> {
    try {
      const snapshot = await this.db.collection(this.collectionName).get()

      const blurbs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<BlurbEntry, "id">),
      }))

      this.logger.info("Retrieved blurbs", {
        count: blurbs.length,
      })

      return blurbs
    } catch (error) {
      this.logger.error("Failed to list blurbs", { error })
      throw error
    }
  }

  /**
   * Get a single blurb by name
   */
  async getBlurb(name: string): Promise<BlurbEntry | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(name)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.info("Blurb not found", { name })
        return null
      }

      const blurb = {
        id: doc.id,
        ...(doc.data() as Omit<BlurbEntry, "id">),
      }

      this.logger.info("Retrieved blurb", { name })
      return blurb
    } catch (error) {
      this.logger.error("Failed to get blurb", { error, name })
      throw error
    }
  }

  /**
   * Create a new blurb
   * Uses the name as the document ID for easy lookup
   */
  async createBlurb(data: CreateBlurbData, userEmail: string): Promise<BlurbEntry> {
    try {
      const now = Timestamp.now()

      const blurb = {
        name: data.name,
        title: data.title,
        content: data.content,
        createdAt: now,
        updatedAt: now,
        createdBy: userEmail,
        updatedBy: userEmail,
      }

      // Use name as document ID for easy lookup
      const docRef = this.db.collection(this.collectionName).doc(data.name)
      await docRef.set(blurb)

      const createdBlurb: BlurbEntry = {
        id: data.name,
        ...blurb,
      }

      this.logger.info("Created blurb", {
        name: data.name,
        title: data.title,
        createdBy: userEmail,
      })

      return createdBlurb
    } catch (error) {
      this.logger.error("Failed to create blurb", {
        error,
        data,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Update an existing blurb
   */
  async updateBlurb(name: string, data: UpdateBlurbData, userEmail: string): Promise<BlurbEntry> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(name)
      const doc = await docRef.get()

      if (!doc.exists) {
        throw new Error(`Blurb not found: ${name}`)
      }

      const updates: Partial<BlurbEntry> = {
        updatedAt: Timestamp.now(),
        updatedBy: userEmail,
      }

      if (data.title !== undefined) updates.title = data.title
      if (data.content !== undefined) updates.content = data.content

      await docRef.update(updates)

      // Fetch updated document
      const updatedDoc = await docRef.get()
      const updatedBlurb: BlurbEntry = {
        id: updatedDoc.id,
        ...(updatedDoc.data() as Omit<BlurbEntry, "id">),
      }

      this.logger.info("Updated blurb", {
        name,
        updatedBy: userEmail,
        fieldsUpdated: Object.keys(updates).filter((k) => k !== "updatedAt" && k !== "updatedBy"),
      })

      return updatedBlurb
    } catch (error) {
      this.logger.error("Failed to update blurb", {
        error,
        name,
        data,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Delete a blurb
   */
  async deleteBlurb(name: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(name)
      const doc = await docRef.get()

      if (!doc.exists) {
        throw new Error(`Blurb not found: ${name}`)
      }

      await docRef.delete()

      this.logger.info("Deleted blurb", { name })
    } catch (error) {
      this.logger.error("Failed to delete blurb", {
        error,
        name,
      })
      throw error
    }
  }
}
