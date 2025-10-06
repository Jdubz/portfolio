import * as React from "react"
import type { SVGProps } from "react"
const SvgShield = (props: SVGProps<SVGSVGElement>) => (
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
      d="m32 8 18 6v14c0 12-10 20-18 24-8-4-18-12-18-24V14z"
    />
  </svg>
)
export default SvgShield
