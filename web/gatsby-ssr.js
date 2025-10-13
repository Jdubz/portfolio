// Fonts are loaded via Bunny CDN in src/styles/fonts.css
// No preload links needed since they're loaded via @import

import * as React from "react"
import { ResumeFormProvider } from "./src/contexts/ResumeFormContext"
import { AuthProvider } from "./src/contexts/AuthContext"
import { InitializeColorMode } from "theme-ui"

export const wrapRootElement = ({ element }) => {
  return (
    <AuthProvider>
      <ResumeFormProvider>{element}</ResumeFormProvider>
    </AuthProvider>
  )
}

export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([<InitializeColorMode key="theme-ui-color-mode" />])
}
