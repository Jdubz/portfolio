/**
 * Experience Entry Types
 * Shared between frontend and backend
 */

export interface ExperienceEntry {
  id: string
  title: string
  role?: string // Job title/role (optional)
  location?: string // Location (optional)
  body?: string
  startDate: string // YYYY-MM format
  endDate?: string | null // YYYY-MM format or null (= Present)
  notes?: string
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  createdBy: string // Email of creator
  updatedBy: string // Email of last editor
}

export interface CreateExperienceData {
  title: string
  role?: string
  location?: string
  body?: string
  startDate: string
  endDate?: string | null
  notes?: string
}

export interface UpdateExperienceData {
  title?: string
  role?: string
  location?: string
  body?: string
  startDate?: string
  endDate?: string | null
  notes?: string
}

export interface ExperienceApiResponse {
  success: boolean
  entry?: ExperienceEntry
  entries?: ExperienceEntry[]
  count?: number
  message?: string
  error?: string
  errorCode?: string
}

/**
 * Blurb Entry Types
 * Markdown content blocks for the experience page
 */

export interface BlurbEntry {
  id: string // Same as name for easy lookup
  name: string // Unique identifier: intro, selected-projects, skills, education-certificates, biography, closing-notes
  title: string // Display heading
  content: string // Markdown content
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  createdBy: string // Email of creator
  updatedBy: string // Email of last editor
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

export interface BlurbApiResponse {
  success: boolean
  blurb?: BlurbEntry
  blurbs?: BlurbEntry[]
  count?: number
  message?: string
  error?: string
  errorCode?: string
}
