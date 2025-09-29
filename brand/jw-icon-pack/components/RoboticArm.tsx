import * as React from "react"
import type { SVGProps } from "react"
const SvgRoboticArm = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M12 52h40M20 52V34l14-8 10 6" />
      <circle cx={34} cy={26} r={3} />
      <path d="m44 32 6-2-2 6" />
    </g>
  </svg>
)
export default SvgRoboticArm
