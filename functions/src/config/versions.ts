/**
 * Version Configuration
 *
 * Centralized version reading from package.json.
 * Used for health check endpoints and logging.
 */

/**
 * Get the package version
 *
 * Tries to load from ./package.json first (deployed environment),
 * then falls back to ../../package.json (development environment from config/).
 *
 * @returns The version string from package.json
 */
export function getPackageVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./package.json").version
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("../../package.json").version
  }
}

/**
 * Cached package version
 * Use this in most cases to avoid repeated file system reads
 */
export const PACKAGE_VERSION = getPackageVersion()
