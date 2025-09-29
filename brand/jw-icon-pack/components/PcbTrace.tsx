import * as React from "react"
import type { SVGProps } from "react"
const SvgPcbTrace = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={16} cy={16} r={4} />
      <path d="M16 20v12a8 8 0 0 0 8 8h8" />
      <circle cx={32} cy={40} r={3} />
      <path d="M32 37v-7a6 6 0 0 1 6-6h10" />
      <circle cx={50} cy={24} r={3} />
    </g>
  </svg>
)
export default SvgPcbTrace
