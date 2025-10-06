import * as React from "react"
import type { SVGProps } from "react"
const SvgCodeBrackets = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M24 18 14 32l10 14M40 18l10 14-10 14" />
    </g>
  </svg>
)
export default SvgCodeBrackets
