/**
 * Centralized API Configuration
 *
 * Single source of truth for all API endpoints and configuration.
 * Used by hooks and API clients throughout the application.
 */

// API Configuration Constants
export const API_CONFIG = {
  projectId: "static-sites-257923",
  region: "us-central1",
  functionName: "manageExperience",
  contentItemsFunctionName: "manageContentItems",
  uploadResumeFunctionName: "uploadResume",
  emulatorPort: 5001,
  defaultEmulatorHost: "localhost",
} as const

/**
 * Determines if the app is running in local development
 * Uses runtime hostname check instead of NODE_ENV to avoid localhost URLs in deployed builds
 *
 * @returns true if running on localhost, false otherwise
 */
export const isLocalhost = (): boolean => {
  if (typeof window === "undefined") {
    return false
  }
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
}

/**
 * Get the API base URL based on environment
 *
 * @returns Base URL for API requests
 *
 * Environments:
 * - Local Development (localhost): Uses Firebase emulator on localhost
 * - Deployed (staging/production): Uses Cloud Functions URL from env vars
 */
export const getApiUrl = (): string => {
  // Use emulator in local development (runtime hostname check)
  if (isLocalhost()) {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
    return `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/${API_CONFIG.functionName}`
  }

  // Production/staging URL from env var (baked in at build time)
  return (
    process.env.GATSBY_EXPERIENCE_API_URL ??
    `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/${API_CONFIG.functionName}`
  )
}

/**
 * API Endpoint Names
 *
 * Type-safe endpoint identifiers for all Cloud Functions.
 * Add new endpoints here as they're created.
 */
export const API_ENDPOINTS = {
  // Experience Management
  getExperiences: "getExperiences",
  createExperience: "createExperience",
  updateExperience: "updateExperience",
  deleteExperience: "deleteExperience",

  // Blurb Management
  getBlurbs: "getBlurbs",
  saveBlurb: "saveBlurb",

  // Contact Form
  contactForm: "contact-form",

  // Future: Resume Generator (placeholder for AI resume feature)
  // generateDocuments: "generateDocuments",
  // listDocuments: "listDocuments",
  // getDocument: "getDocument",
} as const

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]

/**
 * Get the content-items API base URL based on environment
 *
 * @returns Base URL for content-items API requests
 */
export const getContentItemsApiUrl = (): string => {
  // Use emulator in local development (runtime hostname check)
  if (isLocalhost()) {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
    return `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/${API_CONFIG.contentItemsFunctionName}`
  }

  // Production/staging URL from env var (baked in at build time)
  return (
    process.env.GATSBY_CONTENT_ITEMS_API_URL ??
    `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/${API_CONFIG.contentItemsFunctionName}`
  )
}

/**
 * Get full URL for a specific endpoint
 *
 * @param endpoint - Optional endpoint name to append to base URL
 * @returns Complete URL for the endpoint
 */
export const getEndpointUrl = (endpoint?: string): string => {
  const baseUrl = getApiUrl()
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl
}

/**
 * Get the upload resume API URL based on environment
 *
 * @returns URL for resume upload endpoint
 */
export const getUploadResumeUrl = (): string => {
  // Production/staging URL from env var (baked in at build time)
  const envUrl =
    process.env.GATSBY_ENVIRONMENT === "production"
      ? process.env.GATSBY_UPLOAD_RESUME_URL_PROD
      : process.env.GATSBY_UPLOAD_RESUME_URL_DEV

  return (
    envUrl ??
    `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/${API_CONFIG.uploadResumeFunctionName}`
  )
}
