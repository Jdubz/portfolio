/**
 * Generator Type Definitions
 *
 * Types for the AI Resume/Cover Letter Generator
 */

export type GenerationType = "resume" | "coverLetter" | "both"

export type AIProviderType = "openai" | "gemini"

export interface JobDetails {
  role: string
  company: string
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string
}

export interface GenerationPreferences {
  emphasize?: string[]
}

export interface GenerateRequest {
  generateType: GenerationType
  job: JobDetails
  preferences?: GenerationPreferences
  provider?: AIProviderType
  date?: string // Optional date string for cover letter (defaults to server date if not provided)
}

export interface GenerationMetadata {
  company: string
  role: string
  model: string
  tokenUsage?: {
    total: number
  }
  costUsd?: number
  durationMs: number
}

export interface GenerateResponse {
  success: boolean
  resumeUrl?: string // Signed URL for resume download (Phase 2.3)
  coverLetterUrl?: string // Signed URL for cover letter download (Phase 2.3)
  urlExpiresIn?: string // Human-readable expiry time ("1 hour" or "7 days")
  // Legacy fields (Phase 1) - kept for backwards compatibility
  resume?: string // @deprecated Use resumeUrl instead (base64 PDF)
  coverLetter?: string // @deprecated Use coverLetterUrl instead (base64 PDF)
  metadata?: GenerationMetadata
  requestId?: string
}

export type StorageClass = "STANDARD" | "COLDLINE"

export interface FileMetadata {
  gcsPath: string
  signedUrl?: string
  signedUrlExpiry?: string
  size?: number
  storageClass?: StorageClass
}

export interface AIPrompts {
  resume?: {
    systemPrompt?: string
    userPromptTemplate?: string
  }
  coverLetter?: {
    systemPrompt?: string
    userPromptTemplate?: string
  }
}

export interface PersonalInfo {
  id: string
  type: "personal-info"
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
  aiPrompts?: AIPrompts
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface UpdatePersonalInfoData {
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
  aiPrompts?: AIPrompts
}

// Deprecated type aliases for backward compatibility
/** @deprecated Use PersonalInfo instead */
export type GeneratorDefaults = PersonalInfo
/** @deprecated Use UpdatePersonalInfoData instead */
export type UpdateDefaultsData = UpdatePersonalInfoData

export type GenerationStepStatus = "pending" | "in_progress" | "completed" | "failed" | "skipped"

export interface GenerationStep {
  id: string
  name: string
  description: string
  status: GenerationStepStatus
  startedAt?: string
  completedAt?: string
  duration?: number

  // Optional result data (e.g., PDF URL when that step completes)
  result?: {
    resumeUrl?: string
    coverLetterUrl?: string
    [key: string]: unknown
  }

  // Error info if failed
  error?: {
    message: string
    code?: string
  }
}

// Firestore Timestamp type (when serialized over HTTP)
export type FirestoreTimestamp = {
  _seconds: number
  _nanoseconds: number
}

export interface GenerationRequest {
  id: string
  type: "request"
  generateType: GenerationType
  provider?: AIProviderType // AI provider used for generation (OpenAI or Gemini)
  job: JobDetails
  preferences?: GenerationPreferences
  status: "pending" | "processing" | "completed" | "failed"
  steps?: GenerationStep[]
  createdAt: string | FirestoreTimestamp // Can be ISO string or Firestore Timestamp object
  updatedAt?: string | FirestoreTimestamp
  completedAt?: string | FirestoreTimestamp
  error?: string
}
