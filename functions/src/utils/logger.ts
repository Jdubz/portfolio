/**
 * Shared Logger Utility
 *
 * Simple logger for cloud functions that automatically suppresses logs in test environments.
 * Provides consistent logging across all functions with automatic PII redaction.
 */

export type Logger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

/**
 * Check if we're in a test environment
 */
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

/**
 * List of field names that contain sensitive data
 * These will be automatically redacted from logs
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "apikey",
  "api_key",
  "secret",
  "authorization",
  "auth",
  "bearer",
  "cookie",
  "session",
  // PII fields
  "email",
  "phone",
  "phonenumber",
  "phone_number",
  "ssn",
  "creditcard",
  "credit_card",
  "cvv",
  // Firebase-specific sensitive fields
  "idtoken",
  "id_token",
  "refreshtoken",
  "refresh_token",
]

/**
 * Redacts sensitive data from objects for safe logging
 *
 * @param data - Data to redact (can be object, array, primitive)
 * @returns Redacted copy of the data
 */
export const redactSensitiveData = (data: unknown): unknown => {
  // Handle primitives
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data !== "object") {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item))
  }

  // Handle objects
  const redacted: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase().replace(/[_-]/g, "")

    // Check if field name contains sensitive keywords
    const isSensitive = SENSITIVE_FIELDS.some((field) => keyLower.includes(field))

    if (isSensitive) {
      // Redact but show data type and length for debugging
      if (typeof value === "string") {
        redacted[key] = `[REDACTED_STRING:${value.length}]`
      } else if (typeof value === "number") {
        redacted[key] = "[REDACTED_NUMBER]"
      } else {
        redacted[key] = "[REDACTED]"
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively redact nested objects
      redacted[key] = redactSensitiveData(value)
    } else {
      redacted[key] = value
    }
  }

  return redacted
}

/**
 * Create a logger instance
 *
 * In production/development: Logs to console with automatic PII redaction
 * In test environment: Suppresses logs to keep test output clean
 */
export const createLogger = (): Logger => ({
  info: (message: string, data?: unknown) => {
    if (!isTestEnvironment) {
      const safeData = data ? redactSensitiveData(data) : ""
      console.log(`[INFO] ${message}`, safeData)
    }
  },
  warning: (message: string, data?: unknown) => {
    if (!isTestEnvironment) {
      const safeData = data ? redactSensitiveData(data) : ""
      console.warn(`[WARN] ${message}`, safeData)
    }
  },
  error: (message: string, data?: unknown) => {
    if (!isTestEnvironment) {
      const safeData = data ? redactSensitiveData(data) : ""
      console.error(`[ERROR] ${message}`, safeData)
    }
  },
})

/**
 * Default logger instance
 * Use this in most cases
 */
export const logger = createLogger()
