import * as React from "react"
import type { SVGProps } from "react"
const SvgGraph = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M10 50h44M14 46l8-10 8 6 10-16 8 10M10 14v36" />
    </g>
  </svg>
)
export default SvgGraph
