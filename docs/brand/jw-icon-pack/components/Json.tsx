import * as React from "react"
import type { SVGProps } from "react"
const SvgJson = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M22 16c-8 0-8 16 0 16s8 16 0 16M42 16c8 0 8 16 0 16s-8 16 0 16" />
    </g>
  </svg>
)
export default SvgJson
