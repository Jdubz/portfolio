import { Firestore } from "@google-cloud/firestore"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export interface ContactSubmission {
  name: string
  email: string
  message: string
  metadata: {
    ip?: string
    userAgent?: string
    timestamp: string
    referrer?: string
  }
  requestId: string
  status: "new" | "read" | "replied" | "spam"
  createdAt: Date
  updatedAt: Date
}

export class FirestoreService {
  private db: Firestore
  private logger: SimpleLogger
  private collectionName = "contact-submissions"

  constructor(logger?: SimpleLogger) {
    // Initialize Firestore with the named database "portfolio"
    this.db = new Firestore({
      databaseId: "portfolio",
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
   * Save a contact form submission to Firestore
   */
  async saveContactSubmission(data: Omit<ContactSubmission, "status" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const now = new Date()

      // Remove undefined values from metadata (Firestore doesn't allow undefined)
      const metadata: Record<string, string> = {
        timestamp: data.metadata.timestamp,
      }
      if (data.metadata.ip) metadata.ip = data.metadata.ip
      if (data.metadata.userAgent) metadata.userAgent = data.metadata.userAgent
      if (data.metadata.referrer) metadata.referrer = data.metadata.referrer

      const submission: ContactSubmission = {
        ...data,
        metadata: metadata as ContactSubmission["metadata"],
        status: "new",
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await this.db.collection(this.collectionName).add(submission)

      this.logger.info("Contact submission saved to Firestore", {
        docId: docRef.id,
        requestId: data.requestId,
        email: data.email,
      })

      return docRef.id
    } catch (error) {
      this.logger.error("Failed to save contact submission to Firestore", {
        error,
        requestId: data.requestId,
      })
      throw error
    }
  }

  /**
   * Get a contact submission by ID
   */
  async getSubmission(docId: string): Promise<ContactSubmission | null> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(docId)
      const doc = await docRef.get()

      if (!doc.exists) {
        return null
      }

      return doc.data() as ContactSubmission
    } catch (error) {
      this.logger.error("Failed to get contact submission from Firestore", {
        error,
        docId,
      })
      throw error
    }
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(docId: string, status: ContactSubmission["status"]): Promise<void> {
    try {
      const docRef = this.db.collection(this.collectionName).doc(docId)
      await docRef.update({
        status,
        updatedAt: new Date(),
      })

      this.logger.info("Contact submission status updated", {
        docId,
        status,
      })
    } catch (error) {
      this.logger.error("Failed to update contact submission status", {
        error,
        docId,
        status,
      })
      throw error
    }
  }

  /**
   * Get recent submissions
   */
  async getRecentSubmissions(limit = 50): Promise<Array<ContactSubmission & { id: string }>> {
    try {
      const snapshot = await this.db
        .collection(this.collectionName)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get()

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as ContactSubmission),
      }))
    } catch (error) {
      this.logger.error("Failed to get recent contact submissions", { error })
      throw error
    }
  }
}
