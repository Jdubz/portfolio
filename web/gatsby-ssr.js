// Fonts are loaded via Bunny CDN in src/styles/fonts.css
// No preload links needed since they're loaded via @import

import React from "react"
import { InitializeColorMode } from "theme-ui"

export const wrapRootElement = ({ element }) => {
  return element
}

export const onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([React.createElement(InitializeColorMode, { key: "theme-ui-color-mode" })])
}
