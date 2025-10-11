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
// AI Provider Types
// =============================================================================

/**
 * AI Provider Type (for selecting between OpenAI, Gemini, etc.)
 */
export type AIProviderType = "openai" | "gemini"

/**
 * Token usage for AI generation
 */
export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

/**
 * Result from AI resume generation
 */
export interface AIResumeGenerationResult {
  content: ResumeContent
  tokenUsage: TokenUsage
  model: string
}

/**
 * Result from AI cover letter generation
 */
export interface AICoverLetterGenerationResult {
  content: CoverLetterContent
  tokenUsage: TokenUsage
  model: string
}

/**
 * Options for generating a resume with AI
 */
export interface GenerateResumeOptions {
  personalInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
  }
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescription?: string
  }
  experienceEntries: ExperienceEntry[]
  experienceBlurbs: BlurbEntry[]
  style?: string
  emphasize?: string[]
}

/**
 * Options for generating a cover letter with AI
 */
export interface GenerateCoverLetterOptions {
  personalInfo: {
    name: string
    email: string
  }
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescription?: string
  }
  experienceEntries: ExperienceEntry[]
  experienceBlurbs: BlurbEntry[]
}

/**
 * AI Provider Interface
 *
 * Abstracts the AI provider (OpenAI, Gemini, etc.) to enable:
 * - Cost optimization (switch to cheaper provider)
 * - Vendor flexibility (not locked to single provider)
 * - Quality comparison (A/B test providers)
 * - Fallback options (if one provider has issues)
 */
export interface AIProvider {
  /**
   * Generate resume content using AI
   */
  generateResume(options: GenerateResumeOptions): Promise<AIResumeGenerationResult>

  /**
   * Generate cover letter content using AI
   */
  generateCoverLetter(options: GenerateCoverLetterOptions): Promise<AICoverLetterGenerationResult>

  /**
   * Calculate cost in USD from token usage
   */
  calculateCost(tokenUsage: TokenUsage): number

  /**
   * Get the model name/identifier
   */
  readonly model: string

  /**
   * Get the provider type
   */
  readonly providerType: AIProviderType

  /**
   * Get pricing information (per 1M tokens)
   */
  readonly pricing: {
    inputCostPer1M: number
    outputCostPer1M: number
  }
}

// =============================================================================
// Generator Defaults (Default Settings Document)
// =============================================================================

export interface GeneratorDefaults {
  // Document identification
  id: "default"
  type: "defaults"

  // Personal Information (name and email required, others optional)
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

  // AI Provider Selection
  provider: AIProviderType // Which AI service to use (openai or gemini)

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

  // Progress Information
  progress?: {
    stage: "initializing" | "fetching_data" | "generating_resume" | "generating_cover_letter" | "creating_pdf" | "finalizing"
    message: string
    percentage: number // 0-100
    updatedAt: Timestamp
  }

  // Access Control
  access: {
    viewerSessionId?: string // For public users to retrieve their own docs
    isPublic: boolean // true for viewers, false for editors
  }

  // Timestamps & Metadata
  createdAt: Timestamp
  createdBy: string | null // Email if editor, null if anonymous viewer
}

export interface CreateGeneratorRequestData {
  generateType: GenerationType
  provider?: AIProviderType // Optional, defaults to 'gemini' if not provided
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
  provider?: AIProviderType // Optional, defaults to 'gemini' if not provided
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
