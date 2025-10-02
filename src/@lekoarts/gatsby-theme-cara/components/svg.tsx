/** @jsx jsx */
import { jsx } from "theme-ui"
import { withPrefix } from "gatsby"
import { hidden } from "@lekoarts/gatsby-theme-cara/src/styles/utils"

type IconType = "triangle" | "circle" | "arrowUp" | "upDown" | "box" | "hexa" | "cross" | "rocket" | "code-brackets" | "resistor" | "wifi" | "database"

type SVGProps = {
  stroke?: boolean
  color?: string | number | any
  width: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | string
  icon: IconType
  left: string
  top: string
  hiddenMobile?: boolean
}

const viewBox = {
  triangle: `0 0 64 64`,
  circle: `0 0 64 64`,
  arrowUp: `0 0 64 64`,
  upDown: `0 0 64 64`,
  box: `0 0 64 64`,
  hexa: `0 0 64 64`,
  cross: `0 0 64 64`,
  rocket: `0 0 64 64`,
  "code-brackets": `0 0 64 64`,
  resistor: `0 0 64 64`,
  wifi: `0 0 64 64`,
  database: `0 0 64 64`,
}

const Svg = ({ stroke = false, color = ``, width, icon, left, top, hiddenMobile = false }: SVGProps) => (
  <svg
    sx={{
      position: `absolute`,
      stroke: stroke ? `currentColor` : `none`,
      fill: stroke ? `none` : `currentColor`,
      display: hiddenMobile ? hidden : `block`,
      color,
      width,
      left,
      top,
    }}
    viewBox={viewBox[icon]}
    aria-hidden="true"
    focusable="false"
  >
    <use href={withPrefix(`/icons.svg#${icon}`)} />
  </svg>
)

export default Svg