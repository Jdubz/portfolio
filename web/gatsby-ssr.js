import React from "react"

// Fix icons.svg preload - remove it entirely to avoid warning
// The browser will fetch it when the SVG <use> elements reference it
export const onRenderBody = ({ setHeadComponents }) => {
  // Don't preload icons.svg - it's not immediately needed on page load
}
