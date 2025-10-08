/**
 * Experience Entry Types
 * Shared between frontend and backend
 */

export interface ExperienceEntry {
  id: string
  title: string
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

export interface ExperienceApiResponse {
  success: boolean
  entry?: ExperienceEntry
  entries?: ExperienceEntry[]
  count?: number
  message?: string
  error?: string
  errorCode?: string
}
