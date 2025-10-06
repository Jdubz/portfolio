import * as React from "react"
import type { SVGProps } from "react"
const SvgResistor = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M6 32h10M16 32l4-6 6 12 6-12 6 12 6-12 4 6M58 32H48" />
    </g>
  </svg>
)
export default SvgResistor
