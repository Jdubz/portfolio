/** @jsx jsx */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents */
import { jsx } from "theme-ui"
import { withPrefix } from "gatsby"
import { hidden } from "../../styles/utils"

type IconType =
  | "triangle"
  | "circle"
  | "arrowUp"
  | "upDown"
  | "box"
  | "hexa"
  | "cross"
  | "rocket"
  | "code-brackets"
  | "resistor"
  | "wifi"
  | "database"
  | "cloud"
  | "bolt"
  | "cube-3d"
  | "flask"
  | "git-branch"
  | "server-stack"
  | "shield"
  | "bug"
  | "cluster"
  | "git-merge"
  | "key"
  | "lock"
  | "sine-wave"
  | "capacitor"
  | "diode"
  | "pull-request"
  | "compass"
  | "wrench"
  | "bluetooth"
  | "led"
  | "inductor"
  | "caliper"
  | "graph"
  | "nut"
  | "ruler"
  | "motor"
  | "screwdriver"
  | "magnifier"
  | "plug"
  | "test-tube"
  | "stopwatch"
  | "battery"
  | "commit"
  | "pcb-trace"
  | "robotic-arm"
  | "function-fx"
  | "json"
  | "op-amp"

type SVGProps = {
  stroke?: boolean
  color?: string | number | any
  width: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 72 | 80 | 88 | 96 | string
  icon: IconType
  left: string
  top: string
  hiddenMobile?: boolean
}

// Every icon in /icons.svg is drawn on the same 64x64 grid
const VIEW_BOX = `0 0 64 64`

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
    viewBox={VIEW_BOX}
    aria-hidden="true"
    focusable="false"
  >
    <use href={withPrefix(`/icons.svg#${icon}`)} />
  </svg>
)

export default Svg
