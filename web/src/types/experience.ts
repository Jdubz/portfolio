/**
 * Experience Entry Types
 * Shared between frontend and backend
 */

export interface ExperienceEntry {
  id: string
  title: string
  role?: string // Job title/role (optional)
  location?: string // Location (optional)
  body?: string // Deprecated - kept for backward compatibility
  startDate: string // YYYY-MM format
  endDate?: string | null // YYYY-MM format or null (= Present)
  notes?: string
  order?: number // For sorting (lower = earlier), optional for backward compatibility
  relatedBlurbIds?: string[] // References to associated blurbs, optional for backward compatibility

  // NEW: Structured fields
  renderType?: "structured-entry" | "simple-entry" | "text"
  summary?: string
  accomplishments?: string[]
  technologies?: string[]
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
    challenges?: string[]
  }>

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
  order?: number
  relatedBlurbIds?: string[]
}

export interface UpdateExperienceData {
  title?: string
  role?: string
  location?: string
  body?: string
  startDate?: string
  endDate?: string | null
  notes?: string
  order?: number
  relatedBlurbIds?: string[]
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
  content: string // Markdown content - deprecated, kept for backward compatibility
  order?: number // For sorting within page flow, optional for backward compatibility
  type?: "page" | "entry" // Distinguishes page-level vs entry-specific, optional for backward compatibility
  parentEntryId?: string // Links entry-specific blurbs to their parent entry, optional for backward compatibility

  // NEW: Structured rendering
  renderType?: "profile-header" | "project-showcase" | "categorized-list" | "timeline" | "text"
  structuredData?: {
    // For profile-header
    role?: string
    summary?: string
    primaryStack?: string[]
    links?: Array<{ label: string; url: string }>
    tagline?: string

    // For project-showcase
    projects?: Array<{
      name: string
      description: string
      technologies?: string[]
      links?: Array<{ label: string; url: string }>
    }>

    // For categorized-list
    categories?: Array<{
      category: string
      skills?: string[]
    }>

    // For timeline
    items?: Array<{
      title: string
      date?: string
      dateRange?: string
      description?: string
      details?: string
      honors?: string
      type?: string
    }>
  }

  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp
  createdBy: string // Email of creator
  updatedBy: string // Email of last editor
}

export interface CreateBlurbData {
  name: string
  title: string
  content: string
  order?: number
  type?: "page" | "entry"
  parentEntryId?: string
}

export interface UpdateBlurbData {
  title?: string
  content?: string
  order?: number
  type?: "page" | "entry"
  parentEntryId?: string
  renderType?: "profile-header" | "project-showcase" | "categorized-list" | "timeline" | "text"
  structuredData?: BlurbEntry["structuredData"]
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
