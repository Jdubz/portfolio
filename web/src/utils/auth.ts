import type { User } from "firebase/auth"
import { logger } from "./logger"

/**
 * Auth utility functions that don't depend on React
 * Safe to use in both client and server contexts (Gatsby Functions)
 */

/**
 * Sign in with Google popup
 *
 * In development (with emulators):
 * - Shows emulator auth UI with test accounts
 * - Use credentials from scripts/setup-emulator-auth.js
 *
 * In production:
 * - Shows real Google OAuth popup
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
    const auth = getAuth()
    const provider = new GoogleAuthProvider()

    // In development with emulators, this will show the emulator's auth UI
    // where you can select a test account that was created with editor role
    const result = await signInWithPopup(auth, provider)

    logger.info("Sign-in successful", {
      email: result.user.email,
      uid: result.user.uid,
    })

    return result.user
  } catch (error) {
    logger.error("Google sign-in error", error as Error, {
      action: "signInWithGoogle",
    })
    throw error
  }
}

/**
 * Sign in with email/password (for local development with emulator)
 *
 * Only use this in development with the emulator.
 * Production uses Google OAuth exclusively.
 *
 * @param email - Email address (e.g., contact@joshwentworth.com)
 * @param password - Password (e.g., testpassword123)
 */
export const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth")
    const auth = getAuth()
    const result = await signInWithEmailAndPassword(auth, email, password)

    logger.info("Email sign-in successful", {
      email: result.user.email,
      uid: result.user.uid,
    })

    return result.user
  } catch (error) {
    logger.error("Email sign-in error", error as Error, {
      action: "signInWithEmail",
      email,
    })
    throw error
  }
}

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    const { getAuth, signOut: firebaseSignOut } = await import("firebase/auth")
    const auth = getAuth()
    await firebaseSignOut(auth)
  } catch (error) {
    logger.error("Sign out error", {
      error: error instanceof Error ? error.message : "Sign-out failed",
    })
    throw error
  }
}

/**
 * Get current user's ID token for API requests
 * Safe to use in Gatsby Functions (server-side)
 */
export const getIdToken = async (): Promise<string | null> => {
  try {
    const { getAuth } = await import("firebase/auth")
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      return null
    }
    return await user.getIdToken()
  } catch (error) {
    logger.error("Get ID token error", {
      error: error instanceof Error ? error.message : "Failed to get token",
    })
    return null
  }
}
