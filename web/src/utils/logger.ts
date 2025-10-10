/**
 * Custom logger for frontend
 * - Uses console.log in development/staging
 * - Uses GCP Cloud Logging in production
 * - Provides consistent API across environments
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

/**
 * Send log to GCP Cloud Logging via Cloud Function
 */
async function sendToGCP(entry: LogEntry): Promise<void> {
  try {
    const endpoint = process.env.GATSBY_LOG_FUNCTION_URL
    if (!endpoint) {
      return
    }

    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
      // Don't block UI on logging failures
      keepalive: true,
    })
  } catch (error) {
    // Silent fail - logging errors shouldn't break the app
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to send log to GCP:", error)
    }
  }
}

/**
 * Format log entry for console output
 */
function formatForConsole(entry: LogEntry): string {
  const { level, message, context } = entry
  const emoji = {
    debug: "🔍",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  }[level]

  let output = `${emoji} ${message}`
  if (context && Object.keys(context).length > 0) {
    output += `\n${JSON.stringify(context, null, 2)}`
  }
  return output
}

/**
 * Main logging function
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  const isProduction = process.env.GATSBY_ENVIRONMENT === "production"

  // Always log to console in non-production
  if (!isProduction) {
    const consoleMethod = level === "debug" ? "log" : level
    // eslint-disable-next-line no-console
    console[consoleMethod](formatForConsole(entry))
  }

  // Send to GCP in production
  if (isProduction) {
    void sendToGCP(entry)
  }
}

/**
 * Logger instance with convenience methods
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (
    message: string,
    errorOrContext?: Error | Record<string, unknown>,
    maybeContext?: Record<string, unknown>
  ) => {
    // Handle both error(message, error, context) and error(message, context) signatures
    let context: Record<string, unknown> | undefined

    if (errorOrContext instanceof Error) {
      // error(message, error, context) signature
      context = {
        ...maybeContext,
        error: errorOrContext.message,
        stack: errorOrContext.stack,
      }
    } else {
      // error(message, context) signature
      context = errorOrContext
    }

    log("error", message, context)
  },
}
