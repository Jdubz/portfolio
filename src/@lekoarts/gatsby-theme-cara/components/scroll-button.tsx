/** @jsx jsx */
import { jsx, SxProp } from "theme-ui"
import * as React from "react"
import { useParallaxScroll } from "../templates/cara"

interface ScrollButtonProps extends SxProp {
  offset: number
  href: string
  children: React.ReactNode
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ offset, href, sx, children }) => {
  const scrollToSection = useParallaxScroll()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(offset)
  }

  return (
    <a href={href} sx={sx} onClick={handleClick}>
      {children}
    </a>
  )
}

export default ScrollButton
