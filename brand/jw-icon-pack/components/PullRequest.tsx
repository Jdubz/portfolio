import * as React from "react"
import type { SVGProps } from "react"
const SvgPullRequest = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={18} cy={18} r={4} />
      <circle cx={46} cy={46} r={4} />
      <path d="M22 18h12a8 8 0 0 1 8 8v12M18 22v28" />
    </g>
  </svg>
)
export default SvgPullRequest
