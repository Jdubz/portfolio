import * as React from "react"
import type { SVGProps } from "react"
const SvgMagnifier = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={28} cy={28} r={12} />
      <path d="m36 36 12 12" />
    </g>
  </svg>
)
export default SvgMagnifier
