import { useState, useEffect } from "react"
import type { User } from "firebase/auth"

interface AuthState {
  user: User | null
  isEditor: boolean
  loading: boolean
  error: string | null
}

/**
 * Hook for Firebase Auth state management
 * Checks if user is authenticated and has 'editor' role
 */
export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isEditor: false,
    loading: true,
    error: null,
  })

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
          const { connectAuthEmulator } = await import("firebase/auth")
          try {
            connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
          } catch {
            // Emulator already connected, ignore
          }
        }

        // Listen for auth state changes
        unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            if (user) {
              // Get ID token to check custom claims
              void user.getIdTokenResult().then((idTokenResult) => {
                const isEditor = idTokenResult.claims.role === "editor"

                setAuthState({
                  user,
                  isEditor,
                  loading: false,
                  error: null,
                })
              })
            } else {
              setAuthState({
                user: null,
                isEditor: false,
                loading: false,
                error: null,
              })
            }
          },
          (error) => {
            console.error("Auth state change error:", error)
            setAuthState({
              user: null,
              isEditor: false,
              loading: false,
              error: error.message,
            })
          }
        )
      } catch (error) {
        console.error("Firebase Auth initialization error:", error)
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
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth")
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (error) {
    console.error("Google sign-in error:", error)
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
    console.error("Sign out error:", error)
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
    console.error("Get ID token error:", error)
    return null
  }
}
