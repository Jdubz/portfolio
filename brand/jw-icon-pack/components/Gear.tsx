import * as React from "react"
import type { SVGProps } from "react"
const SvgGear = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={32} cy={32} r={6} />
      <path d="M32 18v-6m0 40v-6m14-14h6m-40 0h6M43 21l4-4M17 47l4-4m0-22-4-4m30 30-4-4" />
      <circle cx={32} cy={32} r={14} />
    </g>
  </svg>
)
export default SvgGear
