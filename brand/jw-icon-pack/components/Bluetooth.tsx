import * as React from "react"
import type { SVGProps } from "react"
const SvgBluetooth = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M24 12v40l20-14-14-10 14-10zM24 32" />
    </g>
  </svg>
)
export default SvgBluetooth
