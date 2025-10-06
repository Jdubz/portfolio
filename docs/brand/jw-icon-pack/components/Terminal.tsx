import * as React from "react"
import type { SVGProps } from "react"
const SvgTerminal = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={48} height={40} x={8} y={12} rx={5} />
      <path d="m16 24 8 8-8 8M28 40h20" />
    </g>
  </svg>
)
export default SvgTerminal
