import { Firestore } from "@google-cloud/firestore"
import { createFirestoreInstance } from "../config/firestore"
import { createDefaultLogger } from "../utils/logger"
import type { SimpleLogger } from "../types/logger.types"
import type {
  QueueItem,
  StopList,
  StopListCheckResult,
  QueueStats,
  QueueSettings,
  AISettings,
} from "../types/job-queue.types"

/**
 * Job Queue Service
 *
 * Manages job queue operations, stop list validation, and queue statistics.
 * Follows the same pattern as ExperienceService and BlurbService.
 */
export class JobQueueService {
  private db: Firestore
  private logger: SimpleLogger
  private queueCollection = "job-queue"
  private configCollection = "job-finder-config"
  private matchesCollection = "job-matches"

  constructor(logger?: SimpleLogger) {
    this.db = createFirestoreInstance()
    this.logger = logger || createDefaultLogger()
  }

  /**
   * Submit a job to the queue
   *
   * If generationId is provided, the job will be marked as having documents already generated
   * userId can be null for anonymous submissions
   */
  async submitJob(url: string, companyName: string, userId: string | null, generationId?: string): Promise<QueueItem> {
    try {
      // Get queue settings for max retries
      const settings = await this.getQueueSettings()

      const now = new Date()
      const queueItem: Omit<QueueItem, "id"> = {
        type: "job",
        status: generationId ? "success" : "pending", // If documents exist, mark as success
        url,
        company_name: companyName,
        company_id: null,
        source: "user_submission",
        submitted_by: userId,
        retry_count: 0,
        max_retries: settings.maxRetries,
        created_at: now,
        updated_at: now,
        ...(generationId && {
          result_message: "Documents already generated via Document Builder",
          completed_at: now,
          metadata: {
            generationId,
            documentsPreGenerated: true,
          },
        }),
      }

      const docRef = await this.db.collection(this.queueCollection).add(queueItem)

      this.logger.info("Job submitted to queue", {
        queueItemId: docRef.id,
        url,
        userId,
        hasPreGeneratedDocs: !!generationId,
      })

      return {
        id: docRef.id,
        ...queueItem,
      }
    } catch (error) {
      this.logger.error("Failed to submit job to queue", {
        error,
        url,
        userId,
      })
      throw error
    }
  }

  /**
   * Submit a scrape request to the queue
   *
   * Creates a queue item with type "scrape" and the provided configuration
   */
  async submitScrape(userId: string, scrapeConfig?: any): Promise<QueueItem> {
    try {
      // Get queue settings for max retries
      const settings = await this.getQueueSettings()

      const now = new Date()
      const queueItem: Omit<QueueItem, "id"> = {
        type: "scrape",
        status: "pending",
        url: "", // Empty for scrape type
        company_name: "", // Empty for scrape type
        company_id: null,
        source: "user_submission",
        submitted_by: userId,
        retry_count: 0,
        max_retries: settings.maxRetries,
        created_at: now,
        updated_at: now,
        scrape_config: scrapeConfig || {
          target_matches: 5,
          max_sources: 20,
        },
      }

      const docRef = await this.db.collection(this.queueCollection).add(queueItem)

      this.logger.info("Scrape request submitted to queue", {
        queueItemId: docRef.id,
        userId,
        config: scrapeConfig,
      })

      return {
        id: docRef.id,
        ...queueItem,
      }
    } catch (error) {
      this.logger.error("Failed to submit scrape request to queue", {
        error,
        userId,
        config: scrapeConfig,
      })
      throw error
    }
  }

  /**
   * Check if user has a pending scrape request
   *
   * Returns true if user has any queue item with type "scrape" and status "pending" or "processing"
   */
  async hasPendingScrape(userId: string): Promise<boolean> {
    try {
      const snapshot = await this.db
        .collection(this.queueCollection)
        .where("submitted_by", "==", userId)
        .where("type", "==", "scrape")
        .where("status", "in", ["pending", "processing"])
        .limit(1)
        .get()

      return !snapshot.empty
    } catch (error) {
      this.logger.error("Failed to check for pending scrape", { error, userId })
      // Return false on error to allow submission (fail open)
      return false
    }
  }

  /**
   * Get queue item status by ID
   */
  async getQueueStatus(queueItemId: string): Promise<QueueItem | null> {
    try {
      const docRef = this.db.collection(this.queueCollection).doc(queueItemId)
      const doc = await docRef.get()

      if (!doc.exists) {
        return null
      }

      return {
        id: doc.id,
        ...(doc.data() as Omit<QueueItem, "id">),
      }
    } catch (error) {
      this.logger.error("Failed to get queue status", {
        error,
        queueItemId,
      })
      throw error
    }
  }

  /**
   * Check if URL already exists in queue
   */
  async checkQueueDuplicate(url: string): Promise<boolean> {
    try {
      const snapshot = await this.db.collection(this.queueCollection).where("url", "==", url).limit(1).get()

      return !snapshot.empty
    } catch (error) {
      this.logger.error("Failed to check queue duplicates", { error, url })
      // Return false on error to allow submission (fail open)
      return false
    }
  }

  /**
   * Check if URL already exists in job-matches
   */
  async checkExistingJob(url: string): Promise<{ id: string } | null> {
    try {
      const snapshot = await this.db.collection(this.matchesCollection).where("url", "==", url).limit(1).get()

      if (snapshot.empty) {
        return null
      }

      return { id: snapshot.docs[0].id }
    } catch (error) {
      this.logger.error("Failed to check existing jobs", { error, url })
      // Return null on error to allow submission (fail open)
      return null
    }
  }

  /**
   * Load stop list from Firestore
   */
  async loadStopList(): Promise<StopList> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("stop-list")
      const doc = await docRef.get()

      if (!doc.exists) {
        // Return empty stop list if not configured
        return {
          excludedCompanies: [],
          excludedKeywords: [],
          excludedDomains: [],
        }
      }

      return doc.data() as StopList
    } catch (error) {
      this.logger.error("Failed to load stop list", { error })
      // Return empty stop list on error (fail open)
      return {
        excludedCompanies: [],
        excludedKeywords: [],
        excludedDomains: [],
      }
    }
  }

  /**
   * Check if job matches stop list criteria
   */
  checkStopList(url: string, companyName: string | undefined, stopList: StopList): StopListCheckResult {
    const urlLower = url.toLowerCase()
    const companyLower = companyName?.toLowerCase() || ""

    // Check excluded companies
    for (const excluded of stopList.excludedCompanies) {
      if (companyLower.includes(excluded.toLowerCase())) {
        return {
          allowed: false,
          reason: `Company "${companyName}" is on the exclusion list`,
        }
      }
    }

    // Check excluded domains
    for (const domain of stopList.excludedDomains) {
      if (urlLower.includes(domain.toLowerCase())) {
        return {
          allowed: false,
          reason: `Domain "${domain}" is on the exclusion list`,
        }
      }
    }

    // Check excluded keywords in URL
    for (const keyword of stopList.excludedKeywords) {
      if (urlLower.includes(keyword.toLowerCase())) {
        return {
          allowed: false,
          reason: `URL contains excluded keyword: "${keyword}"`,
        }
      }
    }

    return { allowed: true }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<QueueStats> {
    try {
      const snapshot = await this.db.collection(this.queueCollection).get()

      const stats: QueueStats = {
        pending: 0,
        processing: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        filtered: 0,
        total: snapshot.size,
      }

      snapshot.forEach((doc) => {
        const data = doc.data() as QueueItem
        const status = data.status

        if (status === "pending") stats.pending++
        else if (status === "processing") stats.processing++
        else if (status === "success") stats.success++
        else if (status === "failed") stats.failed++
        else if (status === "skipped") stats.skipped++
        else if (status === "filtered") stats.filtered++
      })

      return stats
    } catch (error) {
      this.logger.error("Failed to get queue stats", { error })
      throw error
    }
  }

  /**
   * Update stop list
   */
  async updateStopList(stopList: StopList, userEmail: string): Promise<StopList> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("stop-list")

      await docRef.set(
        {
          ...stopList,
          updatedAt: new Date(),
          updatedBy: userEmail,
        },
        { merge: true }
      )

      this.logger.info("Stop list updated", {
        userEmail,
        excludedCompaniesCount: stopList.excludedCompanies.length,
        excludedKeywordsCount: stopList.excludedKeywords.length,
        excludedDomainsCount: stopList.excludedDomains.length,
      })

      return stopList
    } catch (error) {
      this.logger.error("Failed to update stop list", {
        error,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Get queue settings
   */
  private async getQueueSettings(): Promise<QueueSettings> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("queue-settings")
      const doc = await docRef.get()

      if (!doc.exists) {
        // Return default settings if not configured
        return {
          maxRetries: 3,
          retryDelaySeconds: 60,
          processingTimeout: 300,
        }
      }

      return doc.data() as QueueSettings
    } catch (error) {
      this.logger.error("Failed to get queue settings", { error })
      // Return default settings on error
      return {
        maxRetries: 3,
        retryDelaySeconds: 60,
        processingTimeout: 300,
      }
    }
  }

  /**
   * Get AI settings (for future use)
   */
  async getAISettings(): Promise<AISettings> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("ai-settings")
      const doc = await docRef.get()

      if (!doc.exists) {
        // Return default settings if not configured
        return {
          provider: "claude",
          model: "claude-3-haiku-20240307",
          minMatchScore: 70,
          costBudgetDaily: 50.0,
        }
      }

      return doc.data() as AISettings
    } catch (error) {
      this.logger.error("Failed to get AI settings", { error })
      // Return default settings on error
      return {
        provider: "claude",
        model: "claude-3-haiku-20240307",
        minMatchScore: 70,
        costBudgetDaily: 50.0,
      }
    }
  }

  /**
   * Update AI settings
   */
  async updateAISettings(settings: AISettings, userEmail: string): Promise<AISettings> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("ai-settings")

      await docRef.set(
        {
          ...settings,
          updatedAt: new Date(),
          updatedBy: userEmail,
        },
        { merge: true }
      )

      this.logger.info("AI settings updated", {
        userEmail,
        provider: settings.provider,
        model: settings.model,
        minMatchScore: settings.minMatchScore,
      })

      return settings
    } catch (error) {
      this.logger.error("Failed to update AI settings", {
        error,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Update queue settings
   */
  async updateQueueSettings(settings: QueueSettings, userEmail: string): Promise<QueueSettings> {
    try {
      const docRef = this.db.collection(this.configCollection).doc("queue-settings")

      await docRef.set(
        {
          ...settings,
          updatedAt: new Date(),
          updatedBy: userEmail,
        },
        { merge: true }
      )

      this.logger.info("Queue settings updated", {
        userEmail,
        maxRetries: settings.maxRetries,
        retryDelaySeconds: settings.retryDelaySeconds,
        processingTimeout: settings.processingTimeout,
      })

      return settings
    } catch (error) {
      this.logger.error("Failed to update queue settings", {
        error,
        userEmail,
      })
      throw error
    }
  }

  /**
   * Retry a failed queue item by resetting it to pending status
   *
   * This matches the Python backend method: queue_manager.retry_item()
   */
  async retryQueueItem(queueItemId: string): Promise<boolean> {
    try {
      const docRef = this.db.collection(this.queueCollection).doc(queueItemId)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.warning("Cannot retry: Queue item not found", { queueItemId })
        return false
      }

      const queueItem = doc.data() as QueueItem

      // Only retry failed items
      if (queueItem.status !== "failed") {
        this.logger.warning("Cannot retry item: status is not failed", {
          queueItemId,
          currentStatus: queueItem.status,
        })
        return false
      }

      // Reset to pending and clear error fields
      await docRef.update({
        status: "pending",
        updated_at: new Date(),
        processed_at: null,
        completed_at: null,
        error_details: null,
      })

      this.logger.info("Reset queue item to pending for retry", { queueItemId })
      return true
    } catch (error) {
      this.logger.error("Failed to retry queue item", {
        error,
        queueItemId,
      })
      return false
    }
  }

  /**
   * Delete a queue item from Firestore
   *
   * This matches the Python backend method: queue_manager.delete_item()
   */
  async deleteQueueItem(queueItemId: string): Promise<boolean> {
    try {
      const docRef = this.db.collection(this.queueCollection).doc(queueItemId)
      const doc = await docRef.get()

      if (!doc.exists) {
        this.logger.warning("Cannot delete: Queue item not found", { queueItemId })
        return false
      }

      const queueItem = doc.data() as QueueItem

      // Delete the document
      await docRef.delete()

      this.logger.info("Deleted queue item", {
        queueItemId,
        previousStatus: queueItem.status,
      })
      return true
    } catch (error) {
      this.logger.error("Failed to delete queue item", {
        error,
        queueItemId,
      })
      return false
    }
  }

  /**
   * Make getQueueSettings public for API access
   */
  async getPublicQueueSettings(): Promise<QueueSettings> {
    return this.getQueueSettings()
  }
}
