/** @jsx jsx */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import { jsx } from "theme-ui"
import * as React from "react"
import { useParallaxScroll } from "../templates/cara"

interface ScrollButtonProps {
  offset: number
  sx?: any
  children: React.ReactNode
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ offset, sx, children }) => {
  const scrollToSection = useParallaxScroll()

  return (
    <button
      type="button"
      sx={{
        variant: "buttons.primary",
        ...sx,
      }}
      onClick={() => {
        console.log("ScrollButton clicked - offset:", offset)
        console.log("scrollToSection function:", scrollToSection)
        console.log("Type of scrollToSection:", typeof scrollToSection)
        scrollToSection(offset)
      }}
    >
      {children}
    </button>
  )
}

export default ScrollButton
