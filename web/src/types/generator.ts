/**
 * Generator Type Definitions
 *
 * Types for the AI Resume/Cover Letter Generator
 */

export type GenerationType = "resume" | "coverLetter" | "both"

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
}

export interface GenerationMetadata {
  company: string
  role: string
  model: string
  tokenUsage?: number
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

export interface GenerationRequest {
  id: string
  type: "request"
  generateType: GenerationType
  job: JobDetails
  preferences?: GenerationPreferences
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
  updatedAt: string
  completedAt?: string
  error?: string
}
