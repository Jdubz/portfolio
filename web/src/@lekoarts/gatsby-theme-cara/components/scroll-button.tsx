/** @jsxImportSource theme-ui */
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
      onClick={() => scrollToSection(offset)}
    >
      {children}
    </button>
  )
}

export default ScrollButton
