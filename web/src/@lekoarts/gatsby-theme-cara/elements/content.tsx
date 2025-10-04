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

const Content = ({ speed, offset, children, className = ``, factor = 1 }: ContentProps) => {
  const { footer, otherChildren } = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    const footerChild = childrenArray.find(
      (child): child is React.ReactElement =>
        React.isValidElement(child) && (child.type as { name?: string })?.name === "Footer"
    )
    const otherChildrenArray = childrenArray.filter(
      (child) => !(React.isValidElement(child) && (child.type as { name?: string })?.name === "Footer")
    )
    return { footer: footerChild, otherChildren: otherChildrenArray }
  }, [children])

  return (
    // @ts-expect-error - ParallaxLayer sx prop type issue with React 18
    <ParallaxLayer
      sx={{
        px: [4, `1.5rem`, `1.5rem`, `2.5rem`],
        py: 0,
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
        justifyContent: `center`,
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
          position: `relative`,
          "::before": {
            content: '""',
            position: `absolute`,
            inset: `-24px`,
            backdropFilter: `blur(10px)`,
            WebkitBackdropFilter: `blur(10px)`,
            borderRadius: `20px`,
            maskImage: `
              linear-gradient(to right, transparent 0, black 30px, black calc(100% - 30px), transparent 100%),
              linear-gradient(to bottom, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)
            `,
            WebkitMaskImage: `
              linear-gradient(to right, transparent 0, black 30px, black calc(100% - 30px), transparent 100%),
              linear-gradient(to bottom, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)
            `,
            maskComposite: `intersect`,
            WebkitMaskComposite: `source-in`,
            zIndex: -1,
          },
        }}
      >
        {otherChildren}
      </div>
      {footer}
    </ParallaxLayer>
  )
}

export default Content
