import * as React from "react"
import type { SVGProps } from "react"
const SvgBattery = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={36} height={20} x={12} y={22} rx={4} />
      <rect width={4} height={8} x={48} y={28} rx={1} />
      <path d="M16 40h24" />
    </g>
  </svg>
)
export default SvgBattery
