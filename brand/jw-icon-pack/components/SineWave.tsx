import * as React from "react"
import type { SVGProps } from "react"
const SvgSineWave = (props: SVGProps<SVGSVGElement>) => (
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
      d="M6 32c6 0 6-16 12-16s6 32 12 32 6-16 12-16 6 16 12 16"
    />
  </svg>
)
export default SvgSineWave
