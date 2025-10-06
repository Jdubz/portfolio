import * as React from "react"
import type { SVGProps } from "react"
const SvgTestTube = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M24 12h16M28 12v24a8 8 0 1 0 16 0V12M28 30h16" />
    </g>
  </svg>
)
export default SvgTestTube
