/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { ParallaxLayer } from "@react-spring/parallax"

type ContentProps = {
  speed: number
  offset: number
  children: React.ReactNode
  className?: string
  factor?: number
}

const Content = ({ speed, offset, children, className = ``, factor = 1 }: ContentProps) => (
  // @ts-expect-error - ParallaxLayer sx prop type issue with React 18
  <ParallaxLayer
    sx={{
      px: [3, 4],
      py: [`80px`, `100px`, `120px`],
      display: `flex`,
      flexDirection: `column`,
      alignItems: `center`,
      justifyContent: `flex-start`,
      zIndex: 50,
    }}
    speed={speed}
    offset={offset}
    factor={factor}
    className={className}
  >
    <div
      sx={{
        width: `100%`,
        maxWidth: `1120px`,
        position: `relative`,
      }}
    >
      {children}
    </div>
  </ParallaxLayer>
)

export default Content
