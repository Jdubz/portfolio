import * as React from "react"
import type { SVGProps } from "react"
const SvgGitBranch = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={18} cy={46} r={4} />
      <path d="M18 22v20a8 8 0 0 0 8 8h8M22 18h20" />
    </g>
  </svg>
)
export default SvgGitBranch
