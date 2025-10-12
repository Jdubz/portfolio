import { Firestore, Timestamp, FieldValue } from "@google-cloud/firestore"
import { DATABASE_ID, GENERATOR_COLLECTION } from "../config/database"
import type {
  GeneratorDefaults,
  UpdateGeneratorDefaultsData,
  GeneratorRequest,
  GeneratorResponse,
  GenerationType,
  AIProviderType,
} from "../types/generator.types"
import type { ExperienceEntry } from "./experience.service"
import type { BlurbEntry } from "./blurb.service"

const COLLECTION_NAME = GENERATOR_COLLECTION

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export class GeneratorService {
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
   * Get the default settings document
   */
  async getDefaults(): Promise<GeneratorDefaults | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc("default")
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.info("Generator defaults not found")
        return null
      }

      const defaults = {
        id: doc.id,
        ...(doc.data() as Omit<GeneratorDefaults, "id">),
      } as GeneratorDefaults

      this.logger.info("Retrieved generator defaults")
      return defaults
    } catch (error) {
      this.logger.error("Failed to get generator defaults", { error })
      throw error
    }
  }

  /**
   * Update the default settings document (editor only)
   */
  async updateDefaults(data: UpdateGeneratorDefaultsData, userEmail: string): Promise<GeneratorDefaults> {
    try {
      const docRef = this.db.collection(this.collectionName).doc("default")
      const doc = await docRef.get()

      if (!doc.exists) {
        throw new Error("Generator defaults not found")
      }

      // Build updates object
      const updates: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
        updatedBy: userEmail,
      }

      // Add provided fields
      if (data.name !== undefined) updates.name = data.name
      if (data.email !== undefined) updates.email = data.email
      if (data.phone !== undefined) updates.phone = data.phone || null
      if (data.location !== undefined) updates.location = data.location || null
      if (data.website !== undefined) updates.website = data.website || null
      if (data.github !== undefined) updates.github = data.github || null
      if (data.linkedin !== undefined) updates.linkedin = data.linkedin || null
      if (data.avatar !== undefined) updates.avatar = data.avatar || null
      if (data.logo !== undefined) updates.logo = data.logo || null
      if (data.accentColor !== undefined) updates.accentColor = data.accentColor
      if (data.defaultStyle !== undefined) updates.defaultStyle = data.defaultStyle

      await docRef.update(updates)

      // Fetch updated document
      const updatedDoc = await docRef.get()
      const updatedDefaults: GeneratorDefaults = {
        id: updatedDoc.id,
        ...(updatedDoc.data() as Omit<GeneratorDefaults, "id">),
      } as GeneratorDefaults

      this.logger.info("Updated generator defaults", {
        updatedBy: userEmail,
        fieldsUpdated: Object.keys(updates).filter((k) => k !== "updatedAt" && k !== "updatedBy"),
      })

      return updatedDefaults
    } catch (error) {
      this.logger.error("Failed to update generator defaults", { error, userEmail })
      throw error
    }
  }

  /**
   * Create a new generation request document
   */
  async createRequest(
    generateType: GenerationType,
    job: {
      role: string
      company: string
      companyWebsite?: string
      jobDescriptionUrl?: string
      jobDescriptionText?: string
    },
    defaults: GeneratorDefaults,
    experienceData: {
      entries: ExperienceEntry[]
      blurbs: BlurbEntry[]
    },
    preferences?: {
      style?: string
      emphasize?: string[]
    },
    viewerSessionId?: string,
    editorEmail?: string,
    provider?: AIProviderType
  ): Promise<string> {
    try {
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).slice(2, 11)
      const requestId = `resume-generator-request-${timestamp}-${randomId}`

      const request: Omit<GeneratorRequest, "createdAt"> = {
        id: requestId,
        type: "request",
        generateType,
        provider: provider || "gemini", // Default to Gemini (92% cheaper)
        defaults: {
          name: defaults.name,
          email: defaults.email,
          phone: defaults.phone,
          location: defaults.location,
          website: defaults.website,
          github: defaults.github,
          linkedin: defaults.linkedin,
          avatar: defaults.avatar,
          logo: defaults.logo,
          accentColor: defaults.accentColor,
          defaultStyle: defaults.defaultStyle,
        },
        job,
        preferences,
        experienceData,
        status: "pending",
        access: {
          viewerSessionId,
          isPublic: !editorEmail,
        },
        createdBy: editorEmail || null,
      }

      await this.db
        .collection(this.collectionName)
        .doc(requestId)
        .set({
          ...request,
          createdAt: FieldValue.serverTimestamp(),
        })

      this.logger.info("Created generation request", {
        requestId,
        generateType,
        role: job.role,
        company: job.company,
        isPublic: !editorEmail,
      })

      return requestId
    } catch (error) {
      this.logger.error("Failed to create generation request", { error })
      throw error
    }
  }

  /**
   * Get a generation request by ID
   */
  async getRequest(requestId: string): Promise<GeneratorRequest | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(requestId)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.info("Generation request not found", { requestId })
        return null
      }

      const request = {
        id: doc.id,
        ...(doc.data() as Omit<GeneratorRequest, "id">),
      } as GeneratorRequest

      this.logger.info("Retrieved generation request", { requestId })
      return request
    } catch (error) {
      this.logger.error("Failed to get generation request", { error, requestId })
      throw error
    }
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId: string, status: GeneratorRequest["status"]): Promise<void> {
    try {
      await this.db.collection(this.collectionName).doc(requestId).update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      })

      this.logger.info("Updated request status", { requestId, status })
    } catch (error) {
      this.logger.error("Failed to update request status", { error, requestId, status })
      throw error
    }
  }

  /**
   * Update request progress
   */
  async updateProgress(
    requestId: string,
    stage: NonNullable<GeneratorRequest["progress"]>["stage"],
    message: string,
    percentage: number
  ): Promise<void> {
    try {
      await this.db.collection(this.collectionName).doc(requestId).update({
        progress: {
          stage,
          message,
          percentage,
          updatedAt: FieldValue.serverTimestamp(),
        },
      })

      this.logger.info("Updated progress", { requestId, stage, message, percentage })
    } catch (error) {
      this.logger.error("Failed to update progress", { error, requestId })
      // Don't throw - progress updates are non-critical
    }
  }

  /**
   * Create a generation response document
   */
  async createResponse(
    requestId: string,
    result: GeneratorResponse["result"],
    metrics: GeneratorResponse["metrics"],
    files?: GeneratorResponse["files"]
  ): Promise<string> {
    try {
      const responseId = requestId.replace("request", "response")

      const response: Omit<GeneratorResponse, "createdAt"> = {
        id: responseId,
        type: "response",
        requestId,
        result,
        files: files || {},
        metrics,
        tracking: {
          downloads: 0,
        },
      }

      await this.db
        .collection(this.collectionName)
        .doc(responseId)
        .set({
          ...response,
          createdAt: FieldValue.serverTimestamp(),
        })

      this.logger.info("Created generation response", {
        responseId,
        requestId,
        success: result.success,
        durationMs: metrics.durationMs,
      })

      return responseId
    } catch (error) {
      this.logger.error("Failed to create generation response", { error, requestId })
      throw error
    }
  }

  /**
   * Get a generation response by ID
   */
  async getResponse(responseId: string): Promise<GeneratorResponse | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(responseId)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.info("Generation response not found", { responseId })
        return null
      }

      const response = {
        id: doc.id,
        ...(doc.data() as Omit<GeneratorResponse, "id">),
      } as GeneratorResponse

      this.logger.info("Retrieved generation response", { responseId })
      return response
    } catch (error) {
      this.logger.error("Failed to get generation response", { error, responseId })
      throw error
    }
  }

  /**
   * Get request and response together
   */
  async getRequestWithResponse(requestId: string): Promise<{
    request: GeneratorRequest
    response: GeneratorResponse
  } | null> {
    try {
      const responseId = requestId.replace("request", "response")

      const [requestDoc, responseDoc] = await Promise.all([
        this.db.collection(this.collectionName).doc(requestId).get(),
        this.db.collection(this.collectionName).doc(responseId).get(),
      ])

      if (!requestDoc.exists || !responseDoc.exists) {
        this.logger.info("Request or response not found", { requestId, responseId })
        return null
      }

      const request = {
        id: requestDoc.id,
        ...(requestDoc.data() as Omit<GeneratorRequest, "id">),
      } as GeneratorRequest

      const response = {
        id: responseDoc.id,
        ...(responseDoc.data() as Omit<GeneratorResponse, "id">),
      } as GeneratorResponse

      this.logger.info("Retrieved request with response", { requestId, responseId })
      return { request, response }
    } catch (error) {
      this.logger.error("Failed to get request with response", { error, requestId })
      throw error
    }
  }

  /**
   * List generation requests with optional filters
   */
  async listRequests(options?: {
    limit?: number
    startAfter?: string
    viewerSessionId?: string
  }): Promise<GeneratorRequest[]> {
    try {
      let query = this.db
        .collection(this.collectionName)
        .where("type", "==", "request")
        .orderBy("createdAt", "desc")

      // Filter by viewer session if provided
      if (options?.viewerSessionId) {
        query = query.where("access.viewerSessionId", "==", options.viewerSessionId)
      }

      // Pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const snapshot = await query.get()

      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<GeneratorRequest, "id">),
      })) as GeneratorRequest[]

      this.logger.info("Retrieved generation requests", {
        count: requests.length,
        viewerSessionId: options?.viewerSessionId,
      })

      return requests
    } catch (error) {
      this.logger.error("Failed to list generation requests", { error })
      throw error
    }
  }
}
