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
  emulatorPort: 5001,
  defaultEmulatorHost: "localhost",
} as const

/**
 * Get the API base URL based on environment
 *
 * @returns Base URL for API requests
 *
 * Environments:
 * - Development: Uses Firebase emulator on localhost
 * - Production/Staging: Uses Cloud Functions URL
 */
export const getApiUrl = (): string => {
  // Use emulator in development
  if (process.env.NODE_ENV === "development") {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
    return `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/${API_CONFIG.functionName}`
  }

  // Production/staging URL from env
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
 * Get full URL for a specific endpoint
 *
 * @param endpoint - Optional endpoint name to append to base URL
 * @returns Complete URL for the endpoint
 */
export const getEndpointUrl = (endpoint?: string): string => {
  const baseUrl = getApiUrl()
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl
}
