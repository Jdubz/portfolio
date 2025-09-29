import * as React from "react"
import type { SVGProps } from "react"
const SvgWifi = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M12 26c12-10 28-10 40 0M18 32c8-6 20-6 28 0M24 38c4-3 12-3 16 0" />
      <circle cx={32} cy={44} r={2} />
    </g>
  </svg>
)
export default SvgWifi
