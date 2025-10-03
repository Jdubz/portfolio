import * as React from "react"
import { useParallaxScroll } from "../templates/cara"

interface ScrollButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  offset: number
  href: string
}

const ScrollButton = React.forwardRef<HTMLAnchorElement, ScrollButtonProps>(
  ({ offset, href, className, children, onClick, ...props }, ref) => {
    const scrollToSection = useParallaxScroll()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      scrollToSection(offset)
      onClick?.(e)
    }

    return (
      <a ref={ref} href={href} className={className} onClick={handleClick} {...props}>
        {children}
      </a>
    )
  }
)

ScrollButton.displayName = "ScrollButton"

export default ScrollButton
