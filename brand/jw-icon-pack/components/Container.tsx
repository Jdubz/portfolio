import * as React from "react"
import type { SVGProps } from "react"
const SvgContainer = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={44} height={28} x={10} y={18} rx={4} />
      <path d="M16 18v28m6-28v28m6-28v28m6-28v28m6-28v28m6-28v28" />
    </g>
  </svg>
)
export default SvgContainer
