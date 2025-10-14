/**
 * Job Match Type Definitions
 *
 * Types for tracking job applications and matching them with generated documents
 */

export interface JobMatch {
  id: string
  company: string
  role: string
  title?: string // Job posting title
  matchScore?: number // AI-calculated match percentage (0-100)
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
  documentGenerated: boolean
  generationId?: string // Reference to the generation request ID
  applied: boolean
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
  applied?: boolean
  notes?: string
}
