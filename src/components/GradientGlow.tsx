import * as React from "react"

type GradientGlowProps = {
  className?: string
}

export const GradientGlow: React.FC<GradientGlowProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute -inset-0.5 rounded-2xl bg-[linear-gradient(120deg,#7C3AED,#06B6D4)] blur-md opacity-20 -z-10 ${className}`}
      aria-hidden="true"
    />
  )
}
