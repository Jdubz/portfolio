/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"
import { navigate } from "gatsby"

interface NavButtonProps {
  to: string
  sx?: any
  children: React.ReactNode
}

const NavButton: React.FC<NavButtonProps> = ({ to, sx, children }) => {
  return (
    <button
      type="button"
      sx={{
        variant: "buttons.primary",
        ...sx,
      }}
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  )
}

export default NavButton
