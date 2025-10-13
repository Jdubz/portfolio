import React, { createContext, useState, useEffect, useContext } from "react"
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

const AuthContext = createContext<AuthState>(INITIAL_AUTH_STATE)

/**
 * AuthProvider - Provides Firebase Auth state to the entire app
 *
 * This centralizes auth state management so multiple components can
 * access auth state without creating duplicate Firebase subscriptions.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(INITIAL_AUTH_STATE)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initAuth = async () => {
      try {
        // Initialize App Check FIRST if not already initialized (required for Firebase Auth)
        // This must happen before any Firebase service initialization
        const { initializeFirebaseAppCheck } = await import("../utils/firebase-app-check")
        initializeFirebaseAppCheck()

        // Lazy load Firebase Auth
        const { getAuth, onAuthStateChanged } = await import("firebase/auth")
        const { getApps } = await import("firebase/app")

        // Get Firebase app (should be initialized by App Check)
        const apps = getApps()
        if (apps.length === 0) {
          logger.error("Firebase app not initialized by App Check", new Error("No Firebase apps"), {
            context: "AuthContext",
            action: "initAuth",
          })
          throw new Error("Firebase not initialized")
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

        // Subscribe to auth state changes
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            void (async () => {
              if (user) {
                try {
                  // Get fresh ID token to check custom claims
                  const idTokenResult = await user.getIdTokenResult()
                  const isEditor = idTokenResult.claims.role === "editor"

                  setAuthState({
                    user,
                    isEditor,
                    loading: false,
                    error: null,
                  })

                  logger.info("User authenticated", {
                    context: "AuthContext",
                    uid: user.uid,
                    email: user.email,
                    isEditor,
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
                    // Unexpected token error - log as error
                    logger.error("Failed to get ID token", tokenError as Error, {
                      context: "AuthContext",
                      action: "onAuthStateChanged",
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
                setAuthState({
                  user: null,
                  isEditor: false,
                  loading: false,
                  error: null,
                })
                logger.info("User signed out", {
                  context: "AuthContext",
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
                context: "AuthContext",
                error: errorMessage,
                reason: "Likely emulator restart or network issue",
              })
            } else {
              logger.error("Auth state change error", error, {
                context: "AuthContext",
                action: "onAuthStateChanged",
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
        logger.error("Failed to initialize auth", error as Error, {
          context: "AuthContext",
          action: "initAuth",
        })
        setAuthState({
          user: null,
          isEditor: false,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to initialize authentication",
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

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth state from context
 * Must be used within an AuthProvider
 */
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
