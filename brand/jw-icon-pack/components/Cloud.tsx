import * as React from "react"
import type { SVGProps } from "react"
const SvgCloud = (props: SVGProps<SVGSVGElement>) => (
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
      d="M18 40a8 8 0 0 1 2-16 12 12 0 0 1 23 3 7 7 0 0 1 3 13z"
    />
  </svg>
)
export default SvgCloud
