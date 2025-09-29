import * as React from "react"
import type { SVGProps } from "react"
const SvgBug = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={32} cy={28} r={8} />
      <path d="M24 36v10m16-10v10M18 28h-8m36 0h8M22 20l-6-6m26 6 6-6" />
    </g>
  </svg>
)
export default SvgBug
