import { getAnalytics, logEvent, setAnalyticsCollectionEnabled, isSupported } from "firebase/analytics"
import { getApps } from "firebase/app"
import { logger } from "./logger"

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
    logger.info("Analytics disabled via environment variable", {
      util: "firebase-analytics",
      action: "initializeFirebaseAnalytics",
    })
    return
  }

  // Check for user consent directly from localStorage (avoid circular import issues)
  const savedConsent = localStorage.getItem("cookie-consent")
  let hasConsent = false
  if (savedConsent) {
    try {
      const consent = JSON.parse(savedConsent) as { analytics?: boolean }
      hasConsent = consent.analytics ?? false
    } catch {
      hasConsent = false
    }
  }

  if (!hasConsent) {
    logger.info("User has not consented to analytics tracking", {
      util: "firebase-analytics",
      action: "initializeFirebaseAnalytics",
    })
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
      logger.info("Analytics not supported in this environment", {
        util: "firebase-analytics",
        action: "initializeFirebaseAnalytics",
      })
      return
    }

    // Get the Firebase app (should already be initialized by App Check)
    const apps = getApps()
    if (apps.length === 0) {
      logger.error("Firebase app not initialized", new Error("No Firebase apps"), {
        util: "firebase-analytics",
        action: "initializeFirebaseAnalytics",
      })
      return
    }

    const app = apps[0]

    // Initialize Analytics
    analyticsInstance = getAnalytics(app)

    // Enable analytics collection (respects user consent)
    setAnalyticsCollectionEnabled(analyticsInstance, true)

    // Log initialization
    logger.info("Analytics initialized successfully", {
      util: "firebase-analytics",
      action: "initializeFirebaseAnalytics",
    })

    // Log a test event
    logEvent(analyticsInstance, "app_initialized", {
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error("Failed to initialize analytics", error as Error, {
      util: "firebase-analytics",
      action: "initializeFirebaseAnalytics",
    })
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
    logger.error(`Failed to log analytics event "${eventName}"`, error as Error, {
      util: "firebase-analytics",
      action: "logAnalyticsEvent",
      eventName,
    })
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
