import * as React from "react"
import type { SVGProps } from "react"
const SvgInductor = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M8 32h8M16 32c0-8 8-8 8 0s8 8 8 0 8-8 8 0 8 8 8 0M56 32" />
    </g>
  </svg>
)
export default SvgInductor
