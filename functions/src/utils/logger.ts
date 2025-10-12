/**
 * Shared Logger Utility
 *
 * Simple logger for cloud functions that automatically suppresses logs in test environments.
 * Provides consistent logging across all functions.
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
 * Create a logger instance
 *
 * In production/development: Logs to console
 * In test environment: Suppresses logs to keep test output clean
 */
export const createLogger = (): Logger => ({
  info: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
  },
  warning: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
  },
  error: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
  },
})

/**
 * Default logger instance
 * Use this in most cases
 */
export const logger = createLogger()
