/**
 * Job Match Type Definitions
 *
 * Types for tracking job applications and matching them with generated documents
 *
 * Note: The core JobMatch type from @jdubz/shared-types represents the structure
 * written by job-finder (AI-analyzed results). This file extends it with portfolio-specific
 * fields for application tracking and document generation.
 */

// Re-export the shared JobMatch type for queue integration
export type { JobMatch as JobQueueMatch } from "@jdubz/shared-types"

/**
 * Extended JobMatch for portfolio application tracking
 * Combines AI-analyzed results with portfolio-specific metadata
 */
export interface JobMatch {
  id: string
  company: string
  role: string
  title?: string // Job posting title
  matchScore?: number // AI-calculated match percentage (0-100)
  companyWebsite?: string
  companyInfo?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
  url?: string // Job posting URL
  description?: string // Full job description
  location?: string
  salary?: string
  postedDate?: string
  status?: string // new, applied, rejected, etc.
  applicationPriority?: string // High, Medium, Low

  // AI-generated insights
  matchedSkills?: string[]
  missingSkills?: string[]
  keyStrengths?: string[]
  potentialConcerns?: string[]
  keywords?: string[]
  experienceMatch?: string

  // Customization recommendations
  customizationRecommendations?: {
    skills_to_emphasize?: string[]
    resume_focus?: string[]
    cover_letter_points?: string[]
  }

  // Resume intake data (for AI generation)
  resumeIntakeData?: {
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

  // Document tracking
  documentGenerated: boolean
  generationId?: string // Reference to the generation request ID
  documentGeneratedAt?: string | null
  documentUrl?: string | null

  // Application tracking
  applied: boolean
  appliedAt?: string | null

  // Metadata
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface CreateJobMatchData {
  company: string
  role: string
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
  notes?: string
}

export interface UpdateJobMatchData {
  company?: string
  role?: string
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
  documentGenerated?: boolean
  generationId?: string
  documentGeneratedAt?: string
  applied?: boolean
  notes?: string
}
