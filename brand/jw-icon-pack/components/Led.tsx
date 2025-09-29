import * as React from "react"
import type { SVGProps } from "react"
const SvgLed = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={20} height={18} x={22} y={18} rx={10} />
      <path d="M22 36v10m20-10v10M18 50h28" />
    </g>
  </svg>
)
export default SvgLed
