/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Waveform from "./Waveform"
import { formatDate, formatDuration, linkLabel, type Track } from "../../utils/recordings"

export type TrackProps = {
  track: Track
  /** Whether this is the track loaded in the player */
  active: boolean
  playing: boolean
  /** Position in this track, 0 to 1; always 0 unless active */
  progress: number
  /** Whether the player could not play this track */
  failed?: boolean
  /** Whether the page was opened on this track's link */
  highlighted?: boolean
  onToggle: (track: Track) => void
  onSeek: (track: Track, fraction: number) => void
}

type DetailLinkProps = { href: string; newTab?: boolean; label?: string; children: React.ReactNode }

const DetailLink = ({ href, newTab, label, children }: DetailLinkProps) => (
  <a
    href={href}
    aria-label={label}
    {...(newTab && { target: "_blank", rel: "noreferrer noopener" })}
    sx={{ variant: "links.primary" }}
  >
    {children}
  </a>
)

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span
    sx={{
      display: "inline-block",
      ml: 2,
      px: 2,
      border: "1px solid",
      borderColor: "textMuted",
      borderRadius: "999px",
      color: "textMuted",
      fontSize: 0,
      fontWeight: 600,
      verticalAlign: "middle",
    }}
  >
    {children}
  </span>
)

/** The ring around the track or group the page was opened on */
export const highlight = { outline: "2px solid", outlineColor: "link", outlineOffset: "2px" }

const PlayIcon = ({ playing, size = 18 }: { playing: boolean; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
    {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
  </svg>
)

const PlaybackError = () => (
  // The text token, not danger: red at this size is under 4.5:1 contrast on rows and tiles
  <span role="alert" sx={{ display: "block", color: "text", fontWeight: 600, fontSize: 1, mt: 1 }}>
    This recording could not be played.
  </span>
)

const Detail = ({ children }: { children: React.ReactNode }) => (
  <span sx={{ "& + &::before": { content: '"·"', mx: 2 } }}>{children}</span>
)

/** One track as a full-width row: play button, title and details, seekable waveform, length */
const TrackRow = ({ track, active, playing, progress, failed, highlighted, onToggle, onSeek }: TrackProps) => {
  const isPlaying = active && playing
  const hasDetails = [track.date, track.bpm, track.key, track.link, track.stems, track.id].some(Boolean)

  return (
    <li
      id={track.id}
      sx={{
        scrollMarginTop: "80px",
        display: "grid",
        gridTemplateColumns: ["auto minmax(0, 1fr) auto", null, "auto minmax(0, 15rem) minmax(0, 1fr) auto"],
        gridTemplateAreas: ['"button text time" "wave wave wave"', null, '"button text wave time"'],
        alignItems: "center",
        columnGap: [3, null, 4],
        rowGap: 3,
        p: 3,
        variant: "cards.surface",
        ...(active && { borderColor: "primary" }),
        ...(highlighted && highlight),
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
          // White on the primary blue is under the 3:1 contrast an icon needs
          color: "dark",
          "&:focus-visible": { outline: "3px solid", outlineColor: "primaryHover", outlineOffset: "2px" },
        }}
      >
        <PlayIcon playing={isPlaying} />
      </button>

      <div sx={{ gridArea: "text", minWidth: 0 }}>
        <div sx={{ color: "heading", fontWeight: 600, overflowWrap: "anywhere" }}>
          {track.number !== undefined && <span sx={{ color: "textMuted", mr: 2 }}>{track.number}.</span>}
          {track.title}
          {track.status === "draft" && <Badge>Draft</Badge>}
        </div>
        {hasDetails && (
          <div sx={{ color: "textMuted", fontSize: 1, mt: 1 }}>
            {track.date && <Detail>{formatDate(track.date)}</Detail>}
            {track.bpm && <Detail>{track.bpm} BPM</Detail>}
            {track.key && <Detail>{track.key}</Detail>}
            {track.stems && (
              <Detail>
                <DetailLink href={`#${track.stems}`}>Stems</DetailLink>
              </Detail>
            )}
            {track.link && (
              <Detail>
                <DetailLink href={track.link} newTab>
                  {linkLabel(track.link)}
                </DetailLink>
              </Detail>
            )}
            {track.id && (
              <Detail>
                <DetailLink href={`#${track.id}`} label={`Link to ${track.title}`}>
                  Link
                </DetailLink>
              </Detail>
            )}
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
export const TrackTile = ({ track, active, playing, progress, failed, highlighted, onToggle, onSeek }: TrackProps) => (
  <li id={track.id} sx={{ position: "relative", scrollMarginTop: "80px" }}>
    {/* Pressing the tile restarts the sound, so a sound that is part-way through gets its own pause */}
    {active && (playing || progress > 0) && (
      <button
        type="button"
        aria-label={`${playing ? "Pause" : "Resume"} ${track.title}`}
        onClick={() => onToggle(track)}
        sx={{
          position: "absolute",
          top: 2,
          right: 2,
          zIndex: 1,
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          bg: "primary",
          color: "dark",
          "&:focus-visible": { outline: "3px solid", outlineColor: "primaryHover", outlineOffset: "2px" },
        }}
      >
        <PlayIcon playing={playing} size={14} />
      </button>
    )}
    <button
      type="button"
      aria-label={`Play ${track.title}`}
      onClick={() => onSeek(track, 0)}
      sx={{
        display: "block",
        width: "100%",
        p: 3,
        textAlign: "left",
        variant: "cards.surface",
        ...(active && playing && { borderColor: "primary" }),
        ...(highlighted && highlight),
        color: "heading",
        font: "inherit",
        cursor: "pointer",
        "&:hover": { borderColor: "primary" },
        "&:focus-visible": { outline: "3px solid", outlineColor: "primaryHover", outlineOffset: "2px" },
      }}
    >
      {/* The right padding keeps a long title clear of the pause button, whether or not it is showing */}
      <span sx={{ display: "block", fontWeight: 600, fontSize: 1, mb: 2, pr: "28px", overflowWrap: "anywhere" }}>
        {track.title}
      </span>
      <Waveform peaks={track.peaks} progress={active ? progress : 0} bars={40} height={28} />
    </button>
    {/* Outside the button: content inside one is not announced as an alert */}
    {failed && <PlaybackError />}
  </li>
)

export default TrackRow
