import * as React from "react"
import type { SVGProps } from "react"
const SvgFlask = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M28 12h8M32 12v10l12 20a6 6 0 0 1-6 8H26a6 6 0 0 1-6-8l12-20z" />
    </g>
  </svg>
)
export default SvgFlask
