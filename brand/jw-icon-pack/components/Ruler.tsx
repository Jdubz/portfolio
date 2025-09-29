import * as React from "react"
import type { SVGProps } from "react"
const SvgRuler = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={44} height={12} x={10} y={20} rx={2} />
      <path d="M14 20v-6m6 6v-4m6 4v-6m6 6v-4m6 4v-6m6 6v-4m6 4v-6" />
    </g>
  </svg>
)
export default SvgRuler
