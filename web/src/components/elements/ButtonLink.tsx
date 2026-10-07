/** @jsx jsx */
import * as React from "react"
import { jsx, type ThemeUIStyleObject } from "theme-ui"
import { Link } from "gatsby"

type ButtonLinkProps = {
  /** Internal route; rendered as a Gatsby link */
  to?: string
  /** External or mailto address; rendered as a plain anchor */
  href?: string
  variant?: "primary" | "secondary"
  /** Open `href` in a new tab */
  newTab?: boolean
  /** Style overrides. A prop of its own because `sx` on a component is applied before the variant. */
  styles?: ThemeUIStyleObject
  className?: string
  children: React.ReactNode
}

/**
 * A link that looks like one of the theme's buttons. Use this rather than putting a button variant
 * on a bare `<a>`: in MDX an `<a>` picks up the theme's link colour, which is the primary button's
 * own background.
 */
const ButtonLink = ({
  to,
  href,
  variant = "primary",
  newTab = false,
  styles,
  className,
  children,
}: ButtonLinkProps) => {
  const style: ThemeUIStyleObject = {
    variant: `buttons.${variant}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    ...styles,
  }

  if (to) {
    return (
      <Link to={to} className={className} sx={style}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={className} sx={style} {...(newTab && { target: "_blank", rel: "noreferrer noopener" })}>
      {children}
    </a>
  )
}

export default ButtonLink
