/**
 * Type definitions for the AI Resume Generator
 *
 * This file contains all TypeScript interfaces for:
 * - Generator defaults (personal settings)
 * - Generation requests
 * - Generation responses
 * - OpenAI structured outputs (resume and cover letter content)
 */

import { Timestamp } from "@google-cloud/firestore"
import type { ExperienceEntry } from "../services/experience.service"
import type { BlurbEntry } from "../services/blurb.service"

// =============================================================================
// Generation Type
// =============================================================================

export type GenerationType = "resume" | "coverLetter" | "both"

// =============================================================================
// Generator Defaults (Default Settings Document)
// =============================================================================

export interface GeneratorDefaults {
  // Document identification
  id: "default"
  type: "defaults"

  // Personal Information (all required, handle falsy gracefully)
  name: string
  email: string
  phone?: string
  location?: string

  // Online Presence
  website?: string
  github?: string
  linkedin?: string

  // Visual Branding
  avatar?: string // URL or GCS path to profile photo
  logo?: string // URL or GCS path to personal logo
  accentColor: string // Hex color for resume styling

  // Resume Style Preferences
  defaultStyle: "modern" | "traditional" | "technical" | "executive"

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy?: string // Email of last editor
}

export interface UpdateGeneratorDefaultsData {
  name?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  avatar?: string
  logo?: string
  accentColor?: string
  defaultStyle?: "modern" | "traditional" | "technical" | "executive"
}

// =============================================================================
// Generator Request (Generation Request Document)
// =============================================================================

export interface GeneratorRequest {
  // Document identification
  id: string // "resume-generator-request-{timestamp}-{randomId}"
  type: "request"

  // Generation Options (same for editors and viewers)
  generateType: GenerationType

  // Snapshot of defaults at request time
  defaults: {
    name: string
    email: string
    phone?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
    avatar?: string
    logo?: string
    accentColor: string
    defaultStyle: string
  }

  // Job Application Details
  job: {
    role: string // Required
    company: string // Required
    companyWebsite?: string
    jobDescriptionUrl?: string
    jobDescriptionText?: string
  }

  // Generation Preferences (optional overrides)
  preferences?: {
    style?: string // Override defaultStyle
    emphasize?: string[] // Keywords to emphasize
  }

  // Experience Data Snapshot
  experienceData: {
    entries: ExperienceEntry[]
    blurbs: BlurbEntry[]
  }

  // Request Status
  status: "pending" | "processing" | "completed" | "failed"

  // Access Control
  access: {
    viewerSessionId?: string // For public users to retrieve their own docs
    isPublic: boolean // true for viewers, false for editors
  }

  // Timestamps & Metadata
  createdAt: Timestamp
  createdBy?: string // Email if editor, undefined if viewer
}

export interface CreateGeneratorRequestData {
  generateType: GenerationType
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescriptionUrl?: string
    jobDescriptionText?: string
  }
  preferences?: {
    style?: string
    emphasize?: string[]
  }
}

// =============================================================================
// Generator Response (Generation Response Document)
// =============================================================================

export interface GeneratorResponse {
  // Document identification
  id: string // "resume-generator-response-{timestamp}-{randomId}" (matches request)
  type: "response"

  // Reference to request document
  requestId: string

  // Generation Results
  result: {
    success: boolean

    // Generated Content (OpenAI structured outputs)
    resume?: ResumeContent
    coverLetter?: CoverLetterContent

    // Error Information (if failed)
    error?: {
      message: string
      code?: string
      stage?: "fetch_defaults" | "fetch_experience" | "openai_resume" | "openai_cover_letter" | "pdf_generation" | "gcs_upload"
      details?: unknown
    }
  }

  // Generated Files in GCS (Phase 2)
  files?: {
    resume?: {
      gcsPath: string
      signedUrl?: string
      signedUrlExpiry?: Timestamp
      size?: number
    }
    coverLetter?: {
      gcsPath: string
      signedUrl?: string
      signedUrlExpiry?: Timestamp
      size?: number
    }
  }

  // Performance Metrics
  metrics: {
    durationMs: number

    // Token usage (if OpenAI was called)
    tokenUsage?: {
      resumePrompt?: number
      resumeCompletion?: number
      coverLetterPrompt?: number
      coverLetterCompletion?: number
      total: number
    }

    // Cost calculation
    costUsd?: number

    // Model information
    model: string
  }

  // Download Tracking
  tracking: {
    downloads: number
    lastDownloadedAt?: Timestamp
    downloadHistory?: Array<{
      timestamp: Timestamp
      documentType: "resume" | "coverLetter"
      downloadedBy?: string
    }>
  }

  // Timestamps
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// =============================================================================
// OpenAI Structured Output Types
// =============================================================================

/**
 * Resume Content (OpenAI structured output)
 */
export interface ResumeContent {
  personalInfo: {
    name: string
    title: string
    summary: string
    contact: {
      email: string
      location?: string
      website?: string
      linkedin?: string
      github?: string
    }
  }
  professionalSummary: string
  experience: Array<{
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    highlights: string[]
    technologies?: string[]
  }>
  skills?: Array<{
    category: string
    items: string[]
  }>
  education?: Array<{
    institution: string
    degree: string
    field?: string
    startDate?: string
    endDate?: string
  }>
}

/**
 * Cover Letter Content (OpenAI structured output)
 */
export interface CoverLetterContent {
  greeting: string
  openingParagraph: string
  bodyParagraphs: string[]
  closingParagraph: string
  signature: string
}

// =============================================================================
// Helper Types for API Requests/Responses
// =============================================================================

/**
 * Request payload for document generation (from frontend)
 */
export interface GenerateDocumentsRequest {
  generateType: GenerationType
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescriptionUrl?: string
    jobDescriptionText?: string
  }
  preferences?: {
    style?: string
    emphasize?: string[]
  }
}

/**
 * Response payload for document generation (to frontend)
 */
export interface GenerateDocumentsResponse {
  requestId: string
  responseId: string
  success: boolean

  // Download URLs (Phase 2 - for now return PDFs directly)
  resumeUrl?: string
  coverLetterUrl?: string

  // Metadata
  metadata: {
    generatedAt: string
    role: string
    company: string
    generateType: GenerationType
    tokenUsage?: {
      total: number
    }
    costUsd?: number
    model: string
    durationMs: number
  }

  // Error (if failed)
  error?: {
    message: string
    code?: string
    stage?: string
  }
}
