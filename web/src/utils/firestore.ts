/**
 * Firestore utility functions
 *
 * Provides a centralized way to access Firestore instance
 * with automatic emulator connection.
 */

import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getApps } from "firebase/app"
import { logger } from "./logger"

let firestoreInstance: ReturnType<typeof getFirestore> | null = null
let emulatorConnected = false

/**
 * Get or create Firestore instance
 * Automatically connects to emulator in development
 */
export function getFirestoreInstance(): ReturnType<typeof getFirestore> {
  // Return cached instance if available
  if (firestoreInstance) {
    return firestoreInstance
  }

  // Get Firebase app (should be initialized by App Check in AuthContext)
  const apps = getApps()
  if (apps.length === 0) {
    throw new Error("Firebase app not initialized. Make sure AuthProvider is mounted.")
  }

  const app = apps[0]
  firestoreInstance = getFirestore(app)

  // Connect to emulator in development (once)
  if (process.env.GATSBY_USE_FIREBASE_EMULATORS === "true" && !emulatorConnected) {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? "localhost"
    try {
      connectFirestoreEmulator(firestoreInstance, emulatorHost, 8080)
      emulatorConnected = true
      logger.info("Connected to Firestore emulator", { host: emulatorHost })
    } catch (_error) {
      // Emulator already connected, ignore
      emulatorConnected = true
    }
  }

  return firestoreInstance
}
