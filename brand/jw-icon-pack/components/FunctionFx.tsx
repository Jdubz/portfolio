import * as React from "react"
import type { SVGProps } from "react"
const SvgFunctionFx = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M20 20h18M28 20l-8 24M34 28l10 12m0-12L34 40" />
    </g>
  </svg>
)
export default SvgFunctionFx
