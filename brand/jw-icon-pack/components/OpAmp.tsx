import * as React from "react"
import type { SVGProps } from "react"
const SvgOpAmp = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M14 32h8M14 26h8M22 20l24 12-24 12zM46 32h8" />
    </g>
  </svg>
)
export default SvgOpAmp
