/**
 * Database configuration constants
 * Centralized configuration for Firestore database settings
 */

/**
 * Firestore database ID
 *
 * Development/Emulator: Uses "(default)" for reliable export/import
 * Production: Uses "portfolio" - the named production database
 *
 * Note: Firebase emulators have issues persisting named databases.
 * Always use the default database in local development for data persistence.
 */
const isEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FUNCTIONS_EMULATOR === "true"
export const DATABASE_ID = isEmulator ? "(default)" : (process.env.FIRESTORE_DATABASE_ID || "portfolio")

/**
 * Experience entries collection name
 */
export const EXPERIENCE_COLLECTION = "experience-entries"

/**
 * Blurb entries collection name
 */
export const BLURBS_COLLECTION = "experience-blurbs"

/**
 * Generator collection name
 * Stores default settings, generation requests, and generation responses
 */
export const GENERATOR_COLLECTION = "generator"
