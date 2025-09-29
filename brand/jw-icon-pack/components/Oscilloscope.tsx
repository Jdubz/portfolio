import * as React from "react"
import type { SVGProps } from "react"
const SvgOscilloscope = (props: SVGProps<SVGSVGElement>) => (
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
      <rect width={48} height={32} x={8} y={12} rx={4} />
      <path d="M12 40h12v6H12zM16 28c3 0 3-8 6-8s3 16 6 16 3-8 6-8 3 4 6 4" />
    </g>
  </svg>
)
export default SvgOscilloscope
