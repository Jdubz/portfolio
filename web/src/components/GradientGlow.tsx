/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

type GradientGlowProps = {
  sx?: any
}

export const GradientGlow: React.FC<GradientGlowProps> = ({ sx: sxProp }) => {
  return (
    <div
      sx={{
        position: "absolute",
        inset: "-2px",
        borderRadius: "xl",
        backgroundImage: "linear-gradient(120deg, #7C3AED, #06B6D4)",
        filter: "blur(12px)",
        opacity: 0.2,
        zIndex: -1,
        ...sxProp,
      }}
      aria-hidden="true"
    />
  )
}
