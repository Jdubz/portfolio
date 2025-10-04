/** @jsx jsx */
import { jsx } from "theme-ui"

export const GradientGlow = () => {
  return (
    <div
      sx={{
        position: "absolute",
        inset: "-2px",
        borderRadius: "lg",
        backgroundImage: "linear-gradient(120deg, #7C3AED, #06B6D4)",
        filter: "blur(8px)",
        opacity: 0.2,
        zIndex: -1,
      }}
      aria-hidden="true"
    />
  )
}
