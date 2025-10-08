/**
 * Database configuration constants
 * Centralized configuration for Firestore database settings
 */

/**
 * Firestore database ID
 * Change this to use a different database in multi-database projects
 */
export const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "portfolio"

/**
 * Experience entries collection name
 */
export const EXPERIENCE_COLLECTION = "experience-entries"
