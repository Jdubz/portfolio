import * as React from "react"
import type { SVGProps } from "react"
const SvgCube3D = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="m32 8 20 12v24L32 56 12 44V20z" />
      <path d="M32 8v24l20 12M32 32 12 44" />
    </g>
  </svg>
)
export default SvgCube3D
