import * as React from "react"
import type { SVGProps } from "react"
const SvgDatabase = (props: SVGProps<SVGSVGElement>) => (
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
      <ellipse cx={32} cy={14} rx={18} ry={6} />
      <path d="M14 14v24c0 3 8 6 18 6s18-3 18-6V14" />
      <path d="M14 26c0 3 8 6 18 6s18-3 18-6M14 38c0 3 8 6 18 6s18-3 18-6" />
    </g>
  </svg>
)
export default SvgDatabase
