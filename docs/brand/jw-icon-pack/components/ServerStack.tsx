import * as React from "react"
import type { SVGProps } from "react"
const SvgServerStack = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={44} height={10} x={10} y={12} rx={4} />
      <rect width={44} height={10} x={10} y={27} rx={4} />
      <rect width={44} height={10} x={10} y={42} rx={4} />
    </g>
  </svg>
)
export default SvgServerStack
