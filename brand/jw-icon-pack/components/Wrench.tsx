import * as React from "react"
import type { SVGProps } from "react"
const SvgWrench = (props: SVGProps<SVGSVGElement>) => (
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
      d="M46 18a10 10 0 0 0-14 12L14 48l6 6 18-18a10 10 0 0 0 8-18"
    />
  </svg>
)
export default SvgWrench
