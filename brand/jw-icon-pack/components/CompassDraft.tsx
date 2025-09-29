import * as React from "react"
import type { SVGProps } from "react"
const SvgCompassDraft = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M32 12v12M20 52l12-28 12 28" />
      <circle cx={32} cy={24} r={4} />
    </g>
  </svg>
)
export default SvgCompassDraft
