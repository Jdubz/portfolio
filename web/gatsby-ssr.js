import React from "react"

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <link
      key="preload-inter"
      rel="preload"
      href="/fonts/Inter-Variable.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />,
    <link
      key="preload-poppins"
      rel="preload"
      href="/fonts/Poppins-Variable.woff2"
      as="font"
      type="font/woff2"
      crossOrigin="anonymous"
    />,
  ])
}
