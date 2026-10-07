/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { decodePeaks } from "../../utils/recordings"

type WaveformProps = {
  peaks: string
  /** Played portion, 0 to 1 */
  progress: number
  /** How many bars to draw; fewer for narrow waveforms */
  bars?: number
  height?: number
  /** Accessible name. With `onSeek` it makes the waveform a slider; without, it is decorative. */
  label?: string
  onSeek?: (fraction: number) => void
}

const BAR_WIDTH = 0.6
const KEY_STEP = 0.05

// The keys a slider is expected to answer to, each mapping the current position to a new one
const SEEK_KEYS: Partial<Record<string, (progress: number) => number>> = {
  ArrowRight: (progress) => progress + KEY_STEP,
  ArrowUp: (progress) => progress + KEY_STEP,
  ArrowLeft: (progress) => progress - KEY_STEP,
  ArrowDown: (progress) => progress - KEY_STEP,
  Home: () => 0,
  End: () => 1,
}

// One path for all bars, mirrored around the centre line, in a 0..bars by 0..100 box
const barsPath = (levels: number[]) =>
  levels
    .map((level, bar) => {
      const height = Math.max(2, level * 100)
      return `M${bar + (1 - BAR_WIDTH) / 2} ${50 - height / 2}h${BAR_WIDTH}v${height}h-${BAR_WIDTH}z`
    })
    .join("")

const Waveform = ({ peaks, progress, bars = 160, height = 48, label, onSeek }: WaveformProps) => {
  const levels = React.useMemo(() => decodePeaks(peaks, bars), [peaks, bars])
  const path = React.useMemo(() => barsPath(levels), [levels])

  const layer = (key: string, color: string, clip?: string) => (
    <svg
      key={key}
      viewBox={`0 0 ${Math.max(1, levels.length)} 100`}
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", color, clipPath: clip }}
    >
      <path d={path} fill="currentColor" />
    </svg>
  )

  // primaryHover, not primary: the lighter blue is under 3:1 contrast against a row in light mode
  const layers = [layer("rest", "textMuted"), layer("played", "primaryHover", `inset(0 ${(1 - progress) * 100}% 0 0)`)]

  if (!onSeek) {
    return (
      <div aria-hidden="true" sx={{ position: "relative", height, opacity: 0.9 }}>
        {layers}
      </div>
    )
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        onSeek((event.clientX - box.left) / box.width)
      }}
      onKeyDown={(event) => {
        const target = SEEK_KEYS[event.key]
        if (target) {
          event.preventDefault()
          onSeek(target(progress))
        }
      }}
      sx={{
        position: "relative",
        height,
        cursor: "pointer",
        borderRadius: "4px",
        "&:focus-visible": { outline: "2px solid", outlineColor: "primaryHover", outlineOffset: "4px" },
      }}
    >
      {layers}
    </div>
  )
}

export default Waveform
