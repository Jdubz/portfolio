/** @jsx jsx */
import { jsx } from "theme-ui"
import React, { useState, useEffect } from "react"

const CONSENT_KEY = "cookie-consent"

interface ConsentState {
  analytics: boolean
  timestamp: number
}

export const CookieConsent = (): React.JSX.Element | null => {
  const [showBanner, setShowBanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = localStorage.getItem(CONSENT_KEY)
    if (!savedConsent) {
      // Delay showing banner slightly for better UX
      // eslint-disable-next-line no-undef
      setTimeout(() => {
        setShowBanner(true)
        // Trigger animation after mount
        // eslint-disable-next-line no-undef
        setTimeout(() => setIsVisible(true), 100)
      }, 1000)
    }
  }, [])

  const handleAccept = () => {
    const consent: ConsentState = {
      analytics: true,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    setIsVisible(false)
    // eslint-disable-next-line no-undef
    setTimeout(() => setShowBanner(false), 300)

    // Reload to initialize analytics
    window.location.reload()
  }

  const handleDecline = () => {
    const consent: ConsentState = {
      analytics: false,
      timestamp: Date.now(),
    }
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    setIsVisible(false)
    // eslint-disable-next-line no-undef
    setTimeout(() => setShowBanner(false), 300)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bg: "rgba(10, 15, 26, 0.98)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid",
        borderColor: "divider",
        p: [4, 5],
        zIndex: 1000,
        transform: isVisible ? "translateY(0)" : "translateY(100%)",
        opacity: isVisible ? 1 : 0,
        transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
      }}
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          display: "grid",
          gridTemplateColumns: ["1fr", "1fr", "1fr auto"],
          gap: 4,
          alignItems: "center",
        }}
      >
        <div>
          <h3
            sx={{
              fontSize: [2, 3],
              fontWeight: "bold",
              mb: 2,
              color: "heading",
            }}
          >
            Cookie & Privacy Notice
          </h3>
          <p
            id="cookie-consent-description"
            sx={{
              fontSize: [1, 2],
              lineHeight: "relaxed",
              color: "text",
              m: 0,
            }}
          >
            We use cookies and Firebase Analytics to understand how you interact with our site and improve your
            experience. Your data is never sold or shared with third parties. You can change your preferences at any
            time in our{" "}
            <a
              href="/privacy"
              sx={{
                color: "primary",
                textDecoration: "underline",
                "&:hover": {
                  color: "secondary",
                },
              }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: ["column", "row"],
          }}
        >
          <button
            onClick={handleDecline}
            sx={{
              variant: "buttons.ghost",
              px: 4,
              py: 2,
              fontSize: 2,
              fontWeight: "medium",
              color: "textMuted",
              bg: "transparent",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "md",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bg: "rgba(255, 255, 255, 0.05)",
                borderColor: "text",
                color: "text",
              },
            }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            sx={{
              variant: "buttons.primary",
              px: 4,
              py: 2,
              fontSize: 2,
              fontWeight: "bold",
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Get the current consent state from localStorage
 */
export const getConsentState = (): ConsentState | null => {
  if (typeof window === "undefined") {
    return null
  }

  const savedConsent = localStorage.getItem(CONSENT_KEY)
  if (!savedConsent) {
    return null
  }

  try {
    return JSON.parse(savedConsent) as ConsentState
  } catch {
    return null
  }
}

/**
 * Check if analytics consent has been given
 */
export const hasAnalyticsConsent = (): boolean => {
  const consent = getConsentState()
  return consent?.analytics ?? false
}

/**
 * Clear consent (for testing or user preference reset)
 */
export const clearConsent = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CONSENT_KEY)
  }
}
