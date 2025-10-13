import { navigate } from "gatsby"
import { useEffect } from "react"

/**
 * Legacy redirect: /resume-settings → /resume-builder?tab=settings
 *
 * This page redirects to the Settings tab in the unified Resume Builder.
 */
const ResumeSettingsRedirect = () => {
  useEffect(() => {
    void navigate("/resume-builder?tab=settings", { replace: true })
  }, [])

  return null
}

export default ResumeSettingsRedirect
