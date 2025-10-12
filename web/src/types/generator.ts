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
  style?: "modern" | "traditional" | "technical" | "executive"
  emphasize?: string[]
}

export interface GenerateRequest {
  generateType: GenerationType
  job: JobDetails
  preferences?: GenerationPreferences
  provider?: AIProviderType
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
  resume?: string
  coverLetter?: string
  metadata?: GenerationMetadata
  requestId?: string
}

export interface GeneratorDefaults {
  id: string
  type: "defaults"
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
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
}

export interface UpdateDefaultsData {
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

export interface GenerationProgress {
  stage:
    | "initializing"
    | "fetching_data"
    | "generating_resume"
    | "generating_cover_letter"
    | "creating_pdf"
    | "finalizing"
  message: string
  percentage: number
  updatedAt: string
}

export interface GenerationRequest {
  id: string
  type: "request"
  generateType: GenerationType
  job: JobDetails
  preferences?: GenerationPreferences
  status: "pending" | "processing" | "completed" | "failed"
  progress?: GenerationProgress
  createdAt: string
  updatedAt: string
  completedAt?: string
  error?: string
}
