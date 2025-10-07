import { getAnalytics, logEvent, setAnalyticsCollectionEnabled, isSupported } from "firebase/analytics"
import { getApps } from "firebase/app"

/**
 * Firebase Analytics initialization and utilities
 *
 * Analytics provides insights into user behavior and engagement
 * with automatic screen view tracking and custom event logging.
 */

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null
let analyticsSupported = false

/**
 * Initialize Firebase Analytics
 *
 * Should be called after Firebase app is initialized (in gatsby-browser.js)
 */
export const initializeFirebaseAnalytics = async (): Promise<void> => {
  // Don't initialize in SSR
  if (typeof window === "undefined") {
    return
  }

  // Check if analytics is enabled via environment variable
  const analyticsEnabled = process.env.GATSBY_ENABLE_ANALYTICS === "true"
  if (!analyticsEnabled) {
    // eslint-disable-next-line no-console
    console.log("[Analytics] Disabled via GATSBY_ENABLE_ANALYTICS environment variable")
    return
  }

  // Check for user consent
  const { hasAnalyticsConsent } = await import("../components/CookieConsent")
  if (!hasAnalyticsConsent()) {
    // eslint-disable-next-line no-console
    console.log("[Analytics] User has not consented to analytics tracking")
    return
  }

  // Check if already initialized
  if (analyticsInstance) {
    return
  }

  try {
    // Check if analytics is supported (some browsers block it)
    analyticsSupported = await isSupported()

    if (!analyticsSupported) {
      // eslint-disable-next-line no-console
      console.log("[Analytics] Not supported in this environment (may be blocked by ad blocker)")
      return
    }

    // Get the Firebase app (should already be initialized by App Check)
    const apps = getApps()
    if (apps.length === 0) {
      console.error("[Analytics] Firebase app not initialized")
      return
    }

    const app = apps[0]

    // Initialize Analytics
    analyticsInstance = getAnalytics(app)

    // Enable analytics collection (respects user consent)
    setAnalyticsCollectionEnabled(analyticsInstance, true)

    // Log initialization
    // eslint-disable-next-line no-console
    console.log("[Analytics] Initialized successfully")

    // Log a test event
    logEvent(analyticsInstance, "app_initialized", {
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Analytics] Failed to initialize:", error)
    // Don't throw - app should still work without Analytics
  }
}

/**
 * Get the current Analytics instance
 */
export const getAnalyticsInstance = () => analyticsInstance

/**
 * Check if Analytics is supported and initialized
 */
export const isAnalyticsAvailable = (): boolean => {
  return analyticsSupported && analyticsInstance !== null
}

/**
 * Log a custom event to Analytics
 *
 * @param eventName - Name of the event
 * @param eventParams - Optional parameters for the event
 */
export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, unknown>): void => {
  if (!isAnalyticsAvailable() || !analyticsInstance) {
    return
  }

  try {
    logEvent(analyticsInstance, eventName, eventParams)
  } catch (error) {
    console.error(`[Analytics] Failed to log event "${eventName}":`, error)
  }
}

/**
 * Common analytics events for the portfolio site
 */
export const analyticsEvents = {
  // Page views (handled automatically by Firebase)

  // User interactions
  contactFormSubmitted: (success: boolean) => {
    logAnalyticsEvent("contact_form_submitted", { success })
  },

  projectViewed: (projectName: string) => {
    logAnalyticsEvent("project_viewed", { project_name: projectName })
  },

  projectLinkClicked: (projectName: string, linkType: string) => {
    logAnalyticsEvent("project_link_clicked", {
      project_name: projectName,
      link_type: linkType,
    })
  },

  socialLinkClicked: (platform: string) => {
    logAnalyticsEvent("social_link_clicked", { platform })
  },

  resumeDownloaded: () => {
    logAnalyticsEvent("resume_downloaded")
  },

  sectionViewed: (sectionName: string) => {
    logAnalyticsEvent("section_viewed", { section_name: sectionName })
  },
}
