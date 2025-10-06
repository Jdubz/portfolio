/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useEffect, useRef } from "react"

interface FormData {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

interface FormStatus {
  submitting: boolean
  submitted: boolean
  error: string | null
}

const ContactForm = (): React.JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>({
    submitting: false,
    submitted: false,
    error: null,
  })

  // Track Firebase initialization state
  const firebaseInitialized = useRef(false)

  // Lazy load Firebase only when component mounts
  useEffect(() => {
    if (firebaseInitialized.current) {
      return
    }

    const initFirebase = async () => {
      try {
        const { initializeFirebaseAppCheck } = await import("../utils/firebase-app-check")
        const { initializeFirebaseAnalytics } = await import("../utils/firebase-analytics")

        initializeFirebaseAppCheck()
        await initializeFirebaseAnalytics()
        firebaseInitialized.current = true
      } catch (error) {
        console.error("[ContactForm] Failed to initialize Firebase:", error)
      }
    }

    void initFirebase()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setStatus({ submitting: true, submitted: false, error: null })

    try {
      const functionUrl = process.env.GATSBY_CONTACT_FUNCTION_URL

      if (!functionUrl) {
        throw new Error("Contact form URL not configured")
      }

      // Get App Check token (lazy load module)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      try {
        const { getAppCheckInstance } = await import("../utils/firebase-app-check")
        const { getToken } = await import("firebase/app-check")

        const appCheckInstance = getAppCheckInstance()
        if (appCheckInstance) {
          const appCheckToken = await getToken(appCheckInstance, /* forceRefresh */ false)
          headers["X-Firebase-AppCheck"] = appCheckToken.token
        }
      } catch (appCheckError) {
        console.warn("[AppCheck] Failed to get token, continuing without it:", appCheckError)
        // Continue anyway - in development, App Check might not be fully configured
      }

      const startTime = Date.now()

      // Create an AbortController for timeout
      const controller = new AbortController()
      // eslint-disable-next-line no-undef
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let response: Response
      try {
        response = await fetch(functionUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(formData),
          signal: controller.signal,
        })
      } catch (fetchError) {
        // eslint-disable-next-line no-undef
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out after 30 seconds. Please check your internet connection and try again, or email me at support@joshwentworth.com"
          )
        }
        // Handle network errors
        if (fetchError instanceof TypeError) {
          throw new Error(
            "Network error: Unable to connect. Please check your internet connection and try again, or email me at support@joshwentworth.com"
          )
        }
        throw fetchError
      } finally {
        // eslint-disable-next-line no-undef
        clearTimeout(timeoutId)
      }

      const duration = Date.now() - startTime

      if (!response.ok) {
        const errorData = (await response.json()) as {
          message?: string
          errorCode?: string
          requestId?: string
          traceId?: string
          spanId?: string
        }

        // Log detailed error info to console for debugging (includes trace IDs for correlation)
        console.error("[ContactForm] Request failed:", {
          status: response.status,
          statusText: response.statusText,
          errorCode: errorData.errorCode,
          requestId: errorData.requestId,
          traceId: errorData.traceId,
          spanId: errorData.spanId,
          duration: `${duration}ms`,
          message: errorData.message,
          timestamp: new Date().toISOString(),
          url: functionUrl,
        })

        // User-friendly error messages
        const userMessage =
          errorData.message ??
          "We couldn't send your message right now. Please try again later or email me directly at support@joshwentworth.com"

        throw new Error(userMessage)
      }

      // eslint-disable-next-line no-console
      console.log("[ContactForm] Message sent successfully:", {
        duration: `${duration}ms`,
        status: response.status,
        timestamp: new Date().toISOString(),
      })

      setStatus({ submitting: false, submitted: true, error: null })
      setFormData({ name: "", email: "", message: "" })

      // Track successful form submission (lazy load module)
      try {
        const { analyticsEvents } = await import("../utils/firebase-analytics")
        analyticsEvents.contactFormSubmitted(true)
      } catch {
        // Analytics not critical, silently fail
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again later."

      setStatus({
        submitting: false,
        submitted: false,
        error: errorMessage,
      })

      // Track failed form submission (lazy load module)
      try {
        const { analyticsEvents } = await import("../utils/firebase-analytics")
        analyticsEvents.contactFormSubmitted(false)
      } catch {
        // Analytics not critical, silently fail
      }
    }
  }

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e)
      }}
      sx={{
        variant: "cards.primary",
        p: 5,
        mx: "auto",
      }}
      aria-label="Contact form"
    >
      <div
        sx={{
          display: "grid",
          gridTemplateColumns: ["1fr", "1fr 1fr"],
          gap: 3,
          mb: 4,
        }}
      >
        <div>
          <label
            htmlFor="name"
            sx={{
              variant: "forms.label",
            }}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              variant: "forms.input",
              borderColor: errors.name ? "danger" : "divider",
              width: "100%",
            }}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <div
              id="name-error"
              sx={{
                color: "danger",
                fontSize: 1,
                mt: 1,
                fontWeight: "medium",
              }}
            >
              {errors.name}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            sx={{
              variant: "forms.label",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{
              variant: "forms.input",
              borderColor: errors.email ? "danger" : "divider",
              width: "100%",
            }}
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <div
              id="email-error"
              sx={{
                color: "danger",
                fontSize: 1,
                mt: 1,
                fontWeight: "medium",
              }}
            >
              {errors.email}
            </div>
          )}
        </div>
      </div>

      <div sx={{ mb: 4 }}>
        <label
          htmlFor="message"
          sx={{
            variant: "forms.label",
          }}
        >
          Message *
        </label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          sx={{
            variant: "forms.textarea",
            borderColor: errors.message ? "danger" : "divider",
            width: "100%",
          }}
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <div
            id="message-error"
            sx={{
              color: "danger",
              fontSize: 1,
              mt: 1,
              fontWeight: "medium",
            }}
          >
            {errors.message}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status.submitting}
        sx={{
          variant: "buttons.primary",
          ...(status.submitting && {
            bg: "textMuted",
            cursor: "not-allowed",
            "&:hover": {
              bg: "textMuted",
              transform: "none",
              boxShadow: "none",
            },
            "&:active": {
              transform: "none",
            },
          }),
        }}
      >
        {status.submitting ? "Sending..." : "Send Message"}
      </button>

      {status.submitted && (
        <div
          sx={{
            mt: 4,
            p: 3,
            bg: "success",
            color: "background",
            borderRadius: "md",
            textAlign: "center",
            fontWeight: "medium",
          }}
        >
          Thank you! Your message has been sent successfully.
        </div>
      )}

      {status.error && (
        <div
          sx={{
            mt: 4,
            p: 3,
            bg: "danger",
            color: "background",
            borderRadius: "md",
            textAlign: "center",
            fontWeight: "medium",
          }}
        >
          {status.error}
        </div>
      )}

      <div
        sx={{
          mt: 4,
          fontSize: 1,
          color: "textMuted",
          textAlign: "center",
        }}
      >
        * Required fields
      </div>
    </form>
  )
}

export default ContactForm
