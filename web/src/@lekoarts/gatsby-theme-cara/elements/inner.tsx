/** @jsx jsx */
import { jsx } from "theme-ui"
import * as React from "react"

type InnerProps = {
  className?: string
  children: React.ReactNode
}

const Inner = ({ className = ``, children }: InnerProps) => (
  <div sx={{ width: `100%`, textAlign: `left` }} className={className}>
    {children}
  </div>
)

export default Inner
