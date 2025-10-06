import * as React from "react"
import type { SVGProps } from "react"
const SvgMotor = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={36} height={20} x={12} y={22} rx={6} />
      <path d="M48 28h6v8h-6M12 32H6" />
    </g>
  </svg>
)
export default SvgMotor
