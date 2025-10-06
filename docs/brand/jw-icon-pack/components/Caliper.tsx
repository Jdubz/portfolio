import * as React from "react"
import type { SVGProps } from "react"
const SvgCaliper = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M12 16h32v8H28v24h-8V24h-8zM28 28h14" />
    </g>
  </svg>
)
export default SvgCaliper
