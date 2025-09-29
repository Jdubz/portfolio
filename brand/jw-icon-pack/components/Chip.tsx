import * as React from "react"
import type { SVGProps } from "react"
const SvgChip = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={32} height={32} x={16} y={16} rx={4} />
      <rect width={16} height={16} x={24} y={24} rx={2} />
      <path d="M16 12v6m8-6v6m8-6v6m8-6v6m8-6v6M16 52v-6m8 6v-6m8 6v-6m8 6v-6m8 6v-6M12 16h6m-6 8h6m-6 8h6m-6 8h6m-6 8h6M52 16h-6m6 8h-6m6 8h-6m6 8h-6m6 8h-6" />
    </g>
  </svg>
)
export default SvgChip
