/**
 * Job Match API Client
 *
 * Handles communication with the job-matches Firebase collection
 */

import { collection, getDocs, doc, updateDoc, Timestamp, query, orderBy } from "firebase/firestore"
import { getFirestoreInstance } from "../utils/firestore"
import type { JobMatch, UpdateJobMatchData } from "../types/job-match"
import { logger } from "../utils/logger"

export class JobMatchClient {
  private collectionName = "job-matches"

  private get db() {
    return getFirestoreInstance()
  }

  /**
   * Get all job matches
   * Sorted by creation date (newest first)
   */
  async getJobMatches(): Promise<JobMatch[]> {
    try {
      const jobMatchesRef = collection(this.db, this.collectionName)
      const q = query(jobMatchesRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          company: (data.company as string | undefined) ?? "",
          role: (data.role as string | undefined) ?? "",
          title: data.title as string | undefined,
          matchScore: data.matchScore as number | undefined,
          companyWebsite: data.companyWebsite as string | undefined,
          jobDescriptionUrl: data.jobDescriptionUrl as string | undefined,
          jobDescriptionText: data.jobDescriptionText as string | undefined,
          documentGenerated: (data.documentGenerated as boolean | undefined) ?? false,
          generationId: data.generationId as string | undefined,
          applied: (data.applied as boolean | undefined) ?? false,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : ((data.createdAt as string | undefined) ?? ""),
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : ((data.updatedAt as string | undefined) ?? ""),
          notes: data.notes as string | undefined,
        } as JobMatch
      })
    } catch (error) {
      logger.error("Failed to fetch job matches", error as Error, {
        collection: this.collectionName,
      })
      throw error
    }
  }

  /**
   * Update a job match
   */
  async updateJobMatch(id: string, data: UpdateJobMatchData): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      })

      logger.info("Job match updated", { id, ...data })
    } catch (error) {
      logger.error("Failed to update job match", error as Error, {
        id,
        collection: this.collectionName,
      })
      throw error
    }
  }

  /**
   * Toggle applied status
   */
  async toggleApplied(id: string, applied: boolean): Promise<void> {
    return this.updateJobMatch(id, { applied })
  }

  /**
   * Mark job match as having documents generated
   */
  async markDocumentsGenerated(id: string, generationId: string): Promise<void> {
    return this.updateJobMatch(id, {
      documentGenerated: true,
      generationId,
    })
  }
}

// Export singleton instance
export const jobMatchClient = new JobMatchClient()
