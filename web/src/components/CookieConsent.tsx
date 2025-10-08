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

  const handleDismiss = () => {
    const consent: ConsentState = {
      analytics: true,
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
      role="banner"
      aria-label="Cookie notice"
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
          <p
            id="cookie-consent-description"
            sx={{
              fontSize: [1, 2],
              lineHeight: "relaxed",
              color: "#e2e8f0",
              m: 0,
            }}
          >
            By using this site, you agree to our use of cookies and Firebase Analytics to improve your experience. Read
            our{" "}
            <a
              href="/privacy"
              sx={{
                color: "#60a5fa",
                textDecoration: "underline",
                "&:hover": {
                  color: "#93c5fd",
                },
              }}
            >
              Privacy Policy
            </a>{" "}
            for more information.
          </p>
        </div>
        <div>
          <button
            onClick={handleDismiss}
            sx={{
              variant: "buttons.primary",
              px: 4,
              py: 2,
              fontSize: 2,
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            Got it
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
