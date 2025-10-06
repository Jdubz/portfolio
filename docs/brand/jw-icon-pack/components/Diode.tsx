import * as React from "react"
import type { SVGProps } from "react"
const SvgDiode = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M10 32h12M22 24v16l16-8zM38 24v16M38 32h16" />
    </g>
  </svg>
)
export default SvgDiode
