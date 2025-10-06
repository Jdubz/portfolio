import * as React from "react"
import type { SVGProps } from "react"
const SvgRocket = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="m24 40-6 10 10-6h8l10 6-6-10M24 40c0-14 8-24 8-24s8 10 8 24" />
      <circle cx={32} cy={28} r={4} />
    </g>
  </svg>
)
export default SvgRocket
