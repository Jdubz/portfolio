/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Waveform from "./Waveform"
import { formatDate, formatDuration, type Track } from "../../utils/recordings"

export type TrackProps = {
  track: Track
  /** Whether this is the track loaded in the player */
  active: boolean
  playing: boolean
  /** Position in this track, 0 to 1; always 0 unless active */
  progress: number
  /** Whether the player could not play this track */
  failed?: boolean
  onToggle: (track: Track) => void
  onSeek: (track: Track, fraction: number) => void
}

const PlayIcon = ({ playing }: { playing: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
    {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
  </svg>
)

const PlaybackError = () => (
  <span role="alert" sx={{ display: "block", color: "danger", fontSize: 1, mt: 1 }}>
    This recording could not be played.
  </span>
)

const Detail = ({ children }: { children: React.ReactNode }) => (
  <span sx={{ "& + &::before": { content: '"·"', mx: 2 } }}>{children}</span>
)

/** One track as a full-width row: play button, title and details, seekable waveform, length */
const TrackRow = ({ track, active, playing, progress, failed, onToggle, onSeek }: TrackProps) => {
  const isPlaying = active && playing

  return (
    <li
      sx={{
        display: "grid",
        gridTemplateColumns: ["auto minmax(0, 1fr) auto", null, "auto minmax(0, 15rem) minmax(0, 1fr) auto"],
        gridTemplateAreas: ['"button text time" "wave wave wave"', null, '"button text wave time"'],
        alignItems: "center",
        columnGap: [3, null, 4],
        rowGap: 3,
        p: 3,
        border: "1px solid",
        borderColor: active ? "primary" : "divider",
        borderRadius: "16px",
        bg: "muted",
      }}
    >
      <button
        type="button"
        aria-label={`${isPlaying ? "Pause" : "Play"} ${track.title}`}
        onClick={() => onToggle(track)}
        sx={{
          gridArea: "button",
          display: "grid",
          placeItems: "center",
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          bg: "primary",
          color: "white",
          "&:focus-visible": { outline: "3px solid", outlineColor: "highlight", outlineOffset: "2px" },
        }}
      >
        <PlayIcon playing={isPlaying} />
      </button>

      <div sx={{ gridArea: "text", minWidth: 0 }}>
        <div sx={{ color: "heading", fontWeight: 600, overflowWrap: "anywhere" }}>
          {track.number !== undefined && <span sx={{ color: "textMuted", mr: 2 }}>{track.number}.</span>}
          {track.title}
        </div>
        {(track.date ?? track.bpm ?? track.key) !== undefined && (
          <div sx={{ color: "textMuted", fontSize: 1, mt: 1 }}>
            {track.date && <Detail>{formatDate(track.date)}</Detail>}
            {track.bpm && <Detail>{track.bpm} BPM</Detail>}
            {track.key && <Detail>{track.key}</Detail>}
          </div>
        )}
        {track.description && <div sx={{ color: "textMuted", fontSize: 1, mt: 1 }}>{track.description}</div>}
        {failed && <PlaybackError />}
      </div>

      <div sx={{ gridArea: "wave", minWidth: 0 }}>
        <Waveform
          peaks={track.peaks}
          progress={active ? progress : 0}
          label={`Seek ${track.title}`}
          onSeek={(fraction) => onSeek(track, fraction)}
        />
      </div>

      <span sx={{ gridArea: "time", color: "textMuted", fontSize: 1, fontVariantNumeric: "tabular-nums" }}>
        {formatDuration(active ? progress * track.duration : track.duration)}
      </span>
    </li>
  )
}

/** One short sound as a compact tile that plays from the start when pressed */
export const TrackTile = ({ track, active, playing, progress, failed, onSeek }: TrackProps) => (
  <li>
    <button
      type="button"
      aria-label={`Play ${track.title}`}
      onClick={() => onSeek(track, 0)}
      sx={{
        display: "block",
        width: "100%",
        p: 3,
        textAlign: "left",
        border: "1px solid",
        borderColor: active && playing ? "primary" : "divider",
        borderRadius: "12px",
        bg: "muted",
        color: "heading",
        font: "inherit",
        cursor: "pointer",
        "&:hover": { borderColor: "primary" },
        "&:focus-visible": { outline: "3px solid", outlineColor: "highlight", outlineOffset: "2px" },
      }}
    >
      <span sx={{ display: "block", fontWeight: 600, fontSize: 1, mb: 2, overflowWrap: "anywhere" }}>
        {track.title}
      </span>
      <Waveform peaks={track.peaks} progress={active ? progress : 0} bars={40} height={28} />
      {failed && <PlaybackError />}
    </button>
  </li>
)

export default TrackRow
