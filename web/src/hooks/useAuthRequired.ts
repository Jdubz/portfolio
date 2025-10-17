import { useState, useCallback, useRef } from "react"
import { useAuth, signInWithGoogle } from "./useAuth"
import { logger } from "../utils/logger"

interface UseAuthRequiredOptions {
  /** Custom message to show in the sign-in modal */
  message?: string
  /** Custom title for the sign-in modal */
  title?: string
  /** Whether to require editor role (default: false, only requires authentication) */
  requireEditor?: boolean
}

interface UseAuthRequiredReturn {
  /** Whether the sign-in modal is currently open */
  isModalOpen: boolean
  /** Whether a sign-in attempt is in progress */
  signingIn: boolean
  /** Error message if sign-in failed */
  authError: string | null
  /** Open the sign-in modal */
  showSignInModal: () => void
  /** Close the sign-in modal */
  hideSignInModal: () => void
  /** Sign in with Google */
  handleSignIn: () => Promise<void>
  /** Execute an action that requires authentication */
  withAuth: <T>(action: () => Promise<T> | T) => Promise<T | null>
  /** Check if user has required permissions */
  hasPermission: boolean
}

/**
 * Hook for managing authentication-required actions
 *
 * Provides a consistent UX pattern:
 * 1. User attempts action (e.g., clicks "Generate Document")
 * 2. If not authenticated, show sign-in modal immediately
 * 3. After sign-in, execute the action
 * 4. If user cancels, abort the action
 *
 * Usage:
 * ```tsx
 * const { isModalOpen, signingIn, authError, showSignInModal, hideSignInModal, handleSignIn, withAuth } = useAuthRequired({
 *   message: "Sign in to generate documents with AI",
 *   requireEditor: false
 * })
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *   await withAuth(async () => {
 *     // This only runs if user is authenticated
 *     await generatorClient.generate(...)
 *   })
 * }
 *
 * // Render modal
 * <SignInModal
 *   isOpen={isModalOpen}
 *   onClose={hideSignInModal}
 *   onSignIn={handleSignIn}
 *   message={message}
 *   signingIn={signingIn}
 * />
 * ```
 */
export const useAuthRequired = (options: UseAuthRequiredOptions = {}): UseAuthRequiredReturn => {
  const { message, title, requireEditor = false } = options
  const { user, isEditor, loading: authLoading } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Track pending action to execute after sign-in
  const pendingActionRef = useRef<(() => Promise<unknown>) | null>(null)

  const hasPermission = requireEditor ? isEditor : !!user

  const showSignInModal = useCallback(() => {
    setIsModalOpen(true)
    setAuthError(null)
  }, [])

  const hideSignInModal = useCallback(() => {
    setIsModalOpen(false)
    setAuthError(null)
    pendingActionRef.current = null // Clear pending action on cancel
  }, [])

  const handleSignIn = useCallback(async () => {
    setSigningIn(true)
    setAuthError(null)

    try {
      await signInWithGoogle()

      // Wait a bit for auth state to update
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if we have permission now
      // Note: This is a heuristic - the auth state listener will update useAuth()
      // but we may need to wait for the next render cycle
      setIsModalOpen(false)

      // Execute pending action if it exists
      if (pendingActionRef.current) {
        try {
          await pendingActionRef.current()
        } catch (error) {
          logger.error("Failed to execute pending action after sign-in", error as Error, {
            hook: "useAuthRequired",
          })
          throw error
        } finally {
          pendingActionRef.current = null
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign-in failed"
      setAuthError(errorMessage)
      logger.error("Sign-in failed", error as Error, {
        hook: "useAuthRequired",
      })
      throw error
    } finally {
      setSigningIn(false)
    }
  }, [])

  /**
   * Execute an action that requires authentication
   * If not authenticated, shows sign-in modal and waits for user to sign in
   * If user cancels sign-in, the action is aborted
   */
  const withAuth = useCallback(
    async <T>(action: () => Promise<T> | T): Promise<T | null> => {
      // Still loading auth state
      if (authLoading) {
        logger.info("Waiting for auth to load", { hook: "useAuthRequired" })
        return null
      }

      // Check permission
      if (!hasPermission) {
        logger.info("User lacks required permission, showing sign-in modal", {
          hook: "useAuthRequired",
          requireEditor,
          isEditor,
          hasUser: !!user,
        })

        // Store the action to execute after sign-in
        pendingActionRef.current = action as () => Promise<unknown>

        // Show sign-in modal
        showSignInModal()

        // Return null - action will execute after sign-in via pendingActionRef
        return null
      }

      // User has permission, execute action immediately
      try {
        return await action()
      } catch (error) {
        logger.error("Action failed", error as Error, {
          hook: "useAuthRequired",
        })
        throw error
      }
    },
    [authLoading, hasPermission, requireEditor, isEditor, user, showSignInModal]
  )

  return {
    isModalOpen,
    signingIn,
    authError,
    showSignInModal,
    hideSignInModal,
    handleSignIn,
    withAuth,
    hasPermission,
  }
}
