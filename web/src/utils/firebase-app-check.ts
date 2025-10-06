import { initializeApp, getApps } from "firebase/app"
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"

/**
 * Firebase App Check initialization
 *
 * App Check helps protect your backend resources from abuse by preventing
 * unauthorized clients from accessing your backend resources.
 *
 * Uses reCAPTCHA v3 provider which works invisibly in the background.
 */

// Firebase configuration
// Note: These are public API keys and safe to commit
const firebaseConfig = {
  apiKey: "AIzaSyBpO5zlIHmvdwvNtOZgVT8R8rPWXOZr1YQ",
  authDomain: "static-sites-257923.firebaseapp.com",
  projectId: "static-sites-257923",
  storageBucket: "static-sites-257923.firebasestorage.app",
  messagingSenderId: "789847666726",
  appId: "1:789847666726:web:2128b2081a8c38ba5f76e7",
}

// reCAPTCHA v3 site key for App Check
const RECAPTCHA_V3_SITE_KEY = process.env.GATSBY_RECAPTCHA_V3_SITE_KEY ?? "6LexneArAAAAAGyuHn3uhITuLCqtRfwigr0v5j8j"

let appCheckInstance: ReturnType<typeof initializeAppCheck> | null = null

/**
 * Initialize Firebase and App Check
 *
 * Should be called once when the app starts (in gatsby-browser.js)
 */
export const initializeFirebaseAppCheck = (): void => {
  // Don't initialize in SSR or if already initialized
  if (typeof window === "undefined" || appCheckInstance) {
    return
  }

  try {
    // Initialize Firebase app if not already initialized
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

    // Initialize App Check with reCAPTCHA v3
    // In development, you can set isTokenAutoRefreshEnabled to false
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
      isTokenAutoRefreshEnabled: true, // Auto-refresh tokens
    })

    // eslint-disable-next-line no-console
    console.log("[AppCheck] Initialized successfully")
  } catch (error) {
    console.error("[AppCheck] Failed to initialize:", error)
    // Don't throw - app should still work without App Check in development
  }
}

/**
 * Get the current App Check instance
 */
export const getAppCheckInstance = () => appCheckInstance
