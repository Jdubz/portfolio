import * as React from "react"
import { useParallaxScroll } from "../templates/cara"

interface ScrollButtonProps {
  offset: number
  href: string
  className?: string
  children: React.ReactNode
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ offset, href, className, children }) => {
  const scrollToSection = useParallaxScroll()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(offset)
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  )
}

export default ScrollButton
