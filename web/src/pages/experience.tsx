import { navigate } from "gatsby"
import { useEffect } from "react"

/**
 * Legacy redirect: /experience → /resume-builder?tab=work-experience
 *
 * This page redirects to the Work Experience tab in the unified Resume Builder.
 */
const ExperienceRedirect = () => {
  useEffect(() => {
    void navigate("/resume-builder?tab=work-experience", { replace: true })
  }, [])

  return null
}

export default ExperienceRedirect
