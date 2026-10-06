/**
 * Structured logger for Cloud Logging (one JSON object per line).
 *
 * Never pass form contents (name, email, message) as data: logs are not
 * covered by the privacy policy's retention promises.
 */

type Severity = "INFO" | "WARNING" | "ERROR"

/**
 * Errors keep message and stack on non-enumerable properties, so they
 * serialize to {} unless copied out explicitly.
 */
export const serializeError = (error: unknown): unknown =>
  error instanceof Error ? { ...error, name: error.name, message: error.message, stack: error.stack } : error

const write = (severity: Severity, message: string, data: Record<string, unknown> = {}): void => {
  const entry = { severity, message, ...data, ...("error" in data && { error: serializeError(data.error) }) }
  const line = JSON.stringify(entry)

  if (severity === "ERROR") {
    console.error(line)
  } else if (severity === "WARNING") {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => write("INFO", message, data),
  warning: (message: string, data?: Record<string, unknown>) => write("WARNING", message, data),
  error: (message: string, data?: Record<string, unknown>) => write("ERROR", message, data),
}
