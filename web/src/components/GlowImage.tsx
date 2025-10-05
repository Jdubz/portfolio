/** @jsx jsx */
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { jsx } from "theme-ui"
import * as React from "react"

type GlowImageProps = {
  src: string
  alt: string
  width?: number | number[]
  sx?: any
}

export const GlowImage: React.FC<GlowImageProps> = ({ src, alt, width = [260, 320], sx: sxProp }) => {
  return (
    <div
      sx={{
        p: 2,
        borderRadius: "md",
        background: (t: any) => `linear-gradient(90deg, ${t.colors.gradA}, ${t.colors.gradB})`,
        boxShadow: "md",
        ...sxProp,
      }}
    >
      <img
        src={src}
        alt={alt}
        sx={{
          width,
          borderRadius: "md",
          display: "block",
          boxShadow: "sm",
        }}
      />
    </div>
  )
}
