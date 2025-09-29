import * as React from "react"
import type { SVGProps } from "react"
const SvgCluster = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={20} cy={20} r={6} />
      <circle cx={44} cy={20} r={6} />
      <circle cx={20} cy={44} r={6} />
      <circle cx={44} cy={44} r={6} />
      <path d="M26 20h12m-18 6v12m24-12v12m-18 6h12" />
    </g>
  </svg>
)
export default SvgCluster
