/**
 * Database configuration constants
 * Centralized configuration for Firestore database settings
 */

/**
 * Firestore database ID
 *
 * Development/Emulator: Uses "(default)" for reliable export/import
 * Production: Uses "portfolio" for the named database
 *
 * Note: Firebase emulators have issues persisting named databases.
 * Always use the default database in local development for data persistence.
 */
export const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "(default)"

/**
 * Experience entries collection name
 */
export const EXPERIENCE_COLLECTION = "experience-entries"

/**
 * Blurb entries collection name
 */
export const BLURBS_COLLECTION = "experience-blurbs"
