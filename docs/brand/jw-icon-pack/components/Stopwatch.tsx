import * as React from "react"
import type { SVGProps } from "react"
const SvgStopwatch = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={32} cy={36} r={16} />
      <path d="m32 36 6-8M28 12h8m-4 0v6" />
    </g>
  </svg>
)
export default SvgStopwatch
