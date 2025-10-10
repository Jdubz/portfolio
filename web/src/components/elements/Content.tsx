/** @jsx jsx */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
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

const Content = ({ speed, offset, children, className = ``, factor = 1 }: ContentProps) => {
  const childrenArray = React.Children.toArray(children)
  const footer = childrenArray.find((child: any) => child?.type?.name === "Footer")
  const otherChildren = childrenArray.filter((child: any) => child?.type?.name !== "Footer")

  return (
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
        {otherChildren}
      </div>
      {footer}
    </ParallaxLayer>
  )
}

export default Content
