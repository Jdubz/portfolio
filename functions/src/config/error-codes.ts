/**
 * Error Codes Configuration
 *
 * Error code definitions for Cloud Functions.
 * - CF_* = Contact Form
 *
 * Error code structure: {PREFIX}_{CATEGORY}_{NUMBER}
 * Categories: VAL (validation), REQ (request), EMAIL (email), SYS (system), etc.
 */

export type ErrorCode = {
  code: string
  status: number
  message: string
}

/**
 * Contact Form Error Codes (CF_*)
 */
export const CONTACT_FORM_ERROR_CODES = {
  // Client errors (4xx)
  VALIDATION_FAILED: { code: "CF_VAL_001", status: 400, message: "Validation failed" },
  METHOD_NOT_ALLOWED: { code: "CF_REQ_001", status: 405, message: "Only POST requests are allowed" },

  // Server errors (5xx)
  EMAIL_DELIVERY_FAILED: {
    code: "CF_EMAIL_001",
    status: 503,
    message: "Unable to send your message at this time. Please try again later or contact me directly.",
  },
  EMAIL_SERVICE_ERROR: {
    code: "CF_EMAIL_002",
    status: 503,
    message: "Email service is temporarily unavailable. Please try again later.",
  },
  INTERNAL_ERROR: {
    code: "CF_SYS_001",
    status: 500,
    message: "An unexpected error occurred. Please try again later.",
  },
} as const
