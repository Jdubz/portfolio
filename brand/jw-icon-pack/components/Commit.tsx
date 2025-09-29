import * as React from "react"
import type { SVGProps } from "react"
const SvgCommit = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M10 32h44" />
      <circle cx={32} cy={32} r={6} />
    </g>
  </svg>
)
export default SvgCommit
