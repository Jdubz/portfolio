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
          companyInfo: data.companyInfo as string | undefined,
          jobDescriptionUrl: data.jobDescriptionUrl as string | undefined,
          jobDescriptionText: data.jobDescriptionText as string | undefined,
          url: data.url as string | undefined,
          description: data.description as string | undefined,
          location: data.location as string | undefined,
          salary: data.salary as string | undefined,
          postedDate: data.postedDate as string | undefined,
          status: data.status as string | undefined,
          applicationPriority: data.applicationPriority as string | undefined,

          // AI-generated insights
          matchedSkills: data.matchedSkills as string[] | undefined,
          missingSkills: data.missingSkills as string[] | undefined,
          keyStrengths: data.keyStrengths as string[] | undefined,
          potentialConcerns: data.potentialConcerns as string[] | undefined,
          keywords: data.keywords as string[] | undefined,
          experienceMatch: data.experienceMatch as string | undefined,

          // Customization recommendations
          customizationRecommendations: data.customizationRecommendations as
            | {
                skills_to_emphasize?: string[]
                resume_focus?: string[]
                cover_letter_points?: string[]
              }
            | undefined,

          // Resume intake data
          resumeIntakeData: data.resumeIntakeData as
            | {
                job_id?: string
                job_title?: string
                company?: string
                target_summary?: string
                skills_priority?: string[]
                keywords_to_include?: string[]
                achievement_angles?: string[]
                experience_highlights?: Array<{
                  company: string
                  title: string
                  points_to_emphasize: string[]
                }>
                projects_to_include?: Array<{
                  name: string
                  why_relevant: string
                  points_to_highlight: string[]
                }>
              }
            | undefined,

          // Document tracking
          documentGenerated: (data.documentGenerated as boolean | undefined) ?? false,
          generationId: data.generationId as string | undefined,
          documentGeneratedAt: data.documentGeneratedAt as string | null | undefined,
          documentUrl: data.documentUrl as string | null | undefined,

          // Application tracking
          applied: (data.applied as boolean | undefined) ?? false,
          appliedAt: data.appliedAt as string | null | undefined,

          // Metadata
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
