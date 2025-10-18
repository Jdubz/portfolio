/**
 * useAsyncSubmit Hook
 *
 * Generic hook for handling async form submissions with loading and error states.
 * Provides consistent error handling and state management across forms.
 */

import { useState, useCallback } from "react"
import { logger } from "../utils/logger"

interface AsyncSubmitState {
  /**
   * Whether the submission is in progress
   */
  isSubmitting: boolean

  /**
   * Error message if submission failed
   */
  error: string | null

  /**
   * Submit handler to call with form data
   */
  handleSubmit: <T>(submitFn: () => Promise<T>) => Promise<T | null>

  /**
   * Clear the error message
   */
  clearError: () => void

  /**
   * Set an error message manually
   */
  setError: (error: string) => void
}

interface UseAsyncSubmitOptions {
  /**
   * Component name for logging context
   */
  component?: string

  /**
   * Action name for logging context
   */
  action?: string

  /**
   * Optional success callback
   */
  onSuccess?: () => void

  /**
   * Optional error callback
   */
  onError?: (error: Error) => void
}

/**
 * Hook for managing async form submission state
 *
 * @example Basic usage
 * ```tsx
 * const { isSubmitting, error, handleSubmit } = useAsyncSubmit({
 *   component: "ContactForm",
 *   action: "sendMessage",
 * })
 *
 * const onSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *   await handleSubmit(async () => {
 *     await sendMessage(formData)
 *   })
 * }
 * ```
 *
 * @example With validation
 * ```tsx
 * const { isSubmitting, error, handleSubmit, setError } = useAsyncSubmit()
 *
 * const onSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *
 *   if (!validateForm()) {
 *     setError("Please fill in all required fields")
 *     return
 *   }
 *
 *   await handleSubmit(async () => {
 *     await createEntry(formData)
 *   })
 * }
 * ```
 */
export const useAsyncSubmit = (options: UseAsyncSubmitOptions = {}): AsyncSubmitState => {
  const { component, action, onSuccess, onError } = options
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setErrorState] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async <T>(submitFn: () => Promise<T>): Promise<T | null> => {
      setIsSubmitting(true)
      setErrorState(null)

      try {
        const result = await submitFn()
        onSuccess?.()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        const errorMessage = error.message && error.message.trim() !== "" ? error.message : "An error occurred"

        setErrorState(errorMessage)

        // Log error with context
        logger.error(`Failed to ${action ?? "submit"}`, error, {
          component: component ?? "Form",
          action: action ?? "submit",
        })

        onError?.(error)
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [component, action, onSuccess, onError]
  )

  const clearError = useCallback(() => {
    setErrorState(null)
  }, [])

  const setError = useCallback((error: string) => {
    setErrorState(error)
  }, [])

  return {
    isSubmitting,
    error,
    handleSubmit,
    clearError,
    setError,
  }
}
