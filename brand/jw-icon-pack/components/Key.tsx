import * as React from "react"
import type { SVGProps } from "react"
const SvgKey = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={24} cy={32} r={8} />
      <path d="M30 32h22l-4 4 4 4" />
    </g>
  </svg>
)
export default SvgKey
