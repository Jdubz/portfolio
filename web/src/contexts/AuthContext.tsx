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
                } catch (error) {
                  logger.error("Failed to get ID token", error as Error, {
                    context: "AuthContext",
                    action: "onAuthStateChanged",
                  })
                  setAuthState({
                    user,
                    isEditor: false,
                    loading: false,
                    error: "Failed to verify user permissions",
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
            logger.error("Auth state change error", error, {
              context: "AuthContext",
              action: "onAuthStateChanged",
            })
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
