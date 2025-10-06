import * as React from "react"
import type { SVGProps } from "react"
const SvgScrewdriver = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 64 64"
    {...props}
  >
    <g
      stroke="#0F172A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
    >
      <path d="m44 12 8 8-6 6-8-8zM26 30l8 8-14 14-8-8z" />
    </g>
  </svg>
)
export default SvgScrewdriver
