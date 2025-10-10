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
  cloud: `0 0 64 64`,
  bolt: `0 0 64 64`,
  "cube-3d": `0 0 64 64`,
  flask: `0 0 64 64`,
  "git-branch": `0 0 64 64`,
  "server-stack": `0 0 64 64`,
  shield: `0 0 64 64`,
  bug: `0 0 64 64`,
  cluster: `0 0 64 64`,
  "git-merge": `0 0 64 64`,
  key: `0 0 64 64`,
  lock: `0 0 64 64`,
  "sine-wave": `0 0 64 64`,
  capacitor: `0 0 64 64`,
  diode: `0 0 64 64`,
  "pull-request": `0 0 64 64`,
  compass: `0 0 64 64`,
  wrench: `0 0 64 64`,
  bluetooth: `0 0 64 64`,
  led: `0 0 64 64`,
  inductor: `0 0 64 64`,
  caliper: `0 0 64 64`,
  graph: `0 0 64 64`,
  nut: `0 0 64 64`,
  ruler: `0 0 64 64`,
  motor: `0 0 64 64`,
  screwdriver: `0 0 64 64`,
  magnifier: `0 0 64 64`,
  plug: `0 0 64 64`,
  "test-tube": `0 0 64 64`,
  stopwatch: `0 0 64 64`,
  battery: `0 0 64 64`,
  commit: `0 0 64 64`,
  "pcb-trace": `0 0 64 64`,
  "robotic-arm": `0 0 64 64`,
  "function-fx": `0 0 64 64`,
  json: `0 0 64 64`,
  "op-amp": `0 0 64 64`,
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
