import * as React from "react"
import type { SVGProps } from "react"
const SvgLock = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={32} height={22} x={16} y={28} rx={4} />
      <path d="M24 28v-6a8 8 0 0 1 16 0v6" />
      <circle cx={32} cy={38} r={2} />
    </g>
  </svg>
)
export default SvgLock
