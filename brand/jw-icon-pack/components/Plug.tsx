import * as React from "react"
import type { SVGProps } from "react"
const SvgPlug = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M20 24h16v10a8 8 0 0 1-8 8h0a8 8 0 0 1-8-8zM26 24v-8m4 8v-8M24 42v6m8-6v6" />
    </g>
  </svg>
)
export default SvgPlug
