import * as React from "react"
import type { SVGProps } from "react"
const SvgBlueprint = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M14 14h30a6 6 0 0 1 6 6v24H14zM14 30h36" />
      <path d="M26 22h12v8H26z" />
    </g>
  </svg>
)
export default SvgBlueprint
