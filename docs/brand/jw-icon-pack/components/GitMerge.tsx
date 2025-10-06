import * as React from "react"
import type { SVGProps } from "react"
const SvgGitMerge = (props: SVGProps<SVGSVGElement>) => (
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
      <circle cx={46} cy={32} r={4} />
      <path d="M22 18h16v14M18 22v20" />
    </g>
  </svg>
)
export default SvgGitMerge
