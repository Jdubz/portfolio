import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { logger } from "../utils/logger"

interface AuthState {
  user: User | null
  isEditor: boolean
  loading: boolean
  error: string | null
}

const INITIAL_AUTH_STATE: AuthState = {
  user: null,
  isEditor: false,
  loading: true,
  error: null,
}

/**
 * Hook for Firebase Auth state management
 * Checks if user is authenticated and has 'editor' role
 */
export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>(INITIAL_AUTH_STATE)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initAuth = async () => {
      try {
        // Lazy load Firebase Auth
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const { initializeApp, getApps } = await import("firebase/app")

        // Initialize Firebase if not already initialized
        if (getApps().length === 0) {
          const firebaseConfig = {
            apiKey: process.env.GATSBY_FIREBASE_API_KEY,
            authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
            storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.GATSBY_FIREBASE_APP_ID,
          }
          initializeApp(firebaseConfig)
        }

        const auth = getAuth()

        // Connect to emulators in development
        if (process.env.GATSBY_USE_FIREBASE_EMULATORS === "true") {
          const { connectAuthEmulator, signOut } = await import("firebase/auth")
          const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? "localhost"
          try {
            connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true })
          } catch {
            // Emulator already connected, ignore
          }

          // Proactively clear any stale auth tokens when connecting to emulator
          // This prevents 400 errors from token validation after emulator restarts
          const currentUser = auth.currentUser
          if (currentUser) {
            try {
              // Try to validate the token first
              await currentUser.getIdToken(false)
            } catch {
              // Token is invalid (emulator restarted), sign out silently
              logger.info("Clearing stale auth token from previous emulator session", {
                email: currentUser.email,
              })
              try {
                await signOut(auth)
              } catch {
                // Ignore sign out errors
              }
            }
          }
        }

        // Listen for auth state changes
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            void (async () => {
              if (user) {
                try {
                  // Get ID token to check custom claims
                  const idTokenResult = await user.getIdTokenResult()
                  const isEditor = idTokenResult.claims.role === "editor"

                  // Log auth state
                  logger.info("User authenticated", {
                    email: user.email,
                    uid: user.uid,
                    isEditor,
                    role: idTokenResult.claims.role,
                  })

                  setAuthState({
                    user,
                    isEditor,
                    loading: false,
                    error: null,
                  })
                } catch (tokenError) {
                  // Handle token errors (e.g., emulator restart with stale tokens)
                  // This is common in development when emulators restart
                  const errorMessage = tokenError instanceof Error ? tokenError.message : "Token error"
                  const isStaleToken =
                    errorMessage.includes("TOKEN_EXPIRED") ||
                    errorMessage.includes("INVALID_ID_TOKEN") ||
                    errorMessage.includes("auth/invalid-user-token") ||
                    errorMessage.includes("400")

                  if (isStaleToken) {
                    // Stale token is expected after emulator restarts - just info level
                    logger.info("Stale auth token detected, clearing session", {
                      email: user.email,
                      reason: "Emulator restart or token expiration",
                    })
                  } else {
                    // Unexpected token error - log as warning
                    logger.warn("Unexpected token verification error", {
                      error: errorMessage,
                      email: user.email,
                    })
                  }

                  // Sign out to clear stale session
                  try {
                    const { signOut: firebaseSignOut } = await import("firebase/auth")
                    await firebaseSignOut(auth)
                  } catch {
                    // Ignore sign out errors - session is already invalid
                  }

                  setAuthState({
                    user: null,
                    isEditor: false,
                    loading: false,
                    error: null,
                  })
                }
              } else {
                // Log sign out
                logger.info("User signed out")

                setAuthState({
                  user: null,
                  isEditor: false,
                  loading: false,
                  error: null,
                })
              }
            })()
          },
          (error) => {
            // Auth state errors can happen during emulator restarts
            const errorMessage = error.message || String(error)
            const isEmulatorIssue =
              errorMessage.includes("network") ||
              errorMessage.includes("fetch") ||
              errorMessage.includes("400") ||
              process.env.GATSBY_USE_FIREBASE_EMULATORS === "true"

            if (isEmulatorIssue) {
              logger.info("Auth state change interrupted", {
                error: errorMessage,
                reason: "Likely emulator restart or network issue",
              })
            } else {
              logger.error("Auth state change error", {
                error: errorMessage,
              })
            }

            setAuthState({
              user: null,
              isEditor: false,
              loading: false,
              error: error.message,
            })
          }
        )
      } catch (error) {
        logger.error("Firebase Auth initialization error", {
          error: error instanceof Error ? error.message : "Auth initialization failed",
        })
        setAuthState({
          user: null,
          isEditor: false,
          loading: false,
          error: error instanceof Error ? error.message : "Auth initialization failed",
        })
      }
    }

    void initAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return authState
}

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
