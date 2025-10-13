import "./src/styles/fonts.css"
import React from "react"
import { initCacheVersionCheck } from "./src/utils/cache-version"
import { ResumeFormProvider } from "./src/contexts/ResumeFormContext"
import { AuthProvider } from "./src/contexts/AuthContext"

// Wrap root element with providers
export const wrapRootElement = ({ element }) => {
  return (
    <AuthProvider>
      <ResumeFormProvider>{element}</ResumeFormProvider>
    </AuthProvider>
  )
}

// Log app version to console
export const onClientEntry = async () => {
  const { version, name } = require("./package.json")
  const cacheVersion = process.env.GATSBY_CACHE_VERSION || version

  // eslint-disable-next-line no-console
  console.log(
    `%c${name} v${version}`,
    "background: linear-gradient(120deg, #7C3AED, #06B6D4); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;"
  )

  // Make version available globally
  if (typeof window !== "undefined") {
    window.__APP_VERSION__ = version
    window.__APP_NAME__ = name
    window.__CACHE_VERSION__ = cacheVersion
  }

  // Initialize cache version check
  // This will invalidate caches if version changed or CACHE_BUST flag is set
  await initCacheVersionCheck()

  // Firebase is now lazy-loaded only when needed (e.g., ContactForm)
  // This saves ~200KB on initial page load
}
