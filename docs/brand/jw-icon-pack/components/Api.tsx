import * as React from "react"
import type { SVGProps } from "react"
const SvgApi = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={44} height={24} x={10} y={16} rx={4} />
      <path d="M18 28h6M30 22v12M36 22v12M42 22v12" />
    </g>
  </svg>
)
export default SvgApi
