import * as React from "react"
import type { SVGProps } from "react"
const SvgBolt = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 64 64"
    {...props}
  >
    <path
      stroke="#0F172A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M28 6h8l6 12h-8l8 28h-8l-6-16h8z"
    />
  </svg>
)
export default SvgBolt
