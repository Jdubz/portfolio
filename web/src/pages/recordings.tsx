/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import PageShell from "../components/PageShell"
import ButtonLink from "../components/elements/ButtonLink"
import Seo from "../components/homepage/Seo"
import TrackRow, { TrackTile } from "../components/recordings/TrackRow"
import useAudioPlayer, { type AudioPlayer } from "../hooks/useAudioPlayer"
import {
  fetchSections,
  formatDate,
  objectUrl,
  sectionAnchors,
  type Section,
  type Track,
  type TrackGroup,
} from "../utils/recordings"

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; sections: Section[] }

const Status = ({ children }: { children: React.ReactNode }) => (
  <p role="status" sx={{ variant: "text.body", py: [4, 5] }}>
    {children}
  </p>
)

const Group = ({ group, layout, player }: { group: TrackGroup; layout: Section["layout"]; player: AudioPlayer }) => {
  const { currentPath, playing, progress, failedPath, toggle, seek } = player
  // An album or a list plays through; short sounds in a grid play one at a time
  const queue = layout === "grid" ? undefined : group.tracks

  const onToggle = (track: Track) => toggle(track, queue)
  const onSeek = (track: Track, fraction: number) => seek(track, fraction, queue)

  return (
    <div sx={{ mb: [4, 5] }}>
      {group.title && (
        <div sx={{ display: "flex", alignItems: "center", gap: [3, 4], mb: 3 }}>
          {group.cover && layout === "album" && (
            <img
              src={objectUrl(group.cover)}
              alt=""
              loading="lazy"
              width={120}
              height={120}
              sx={{ width: [88, 120], height: [88, 120], objectFit: "cover", borderRadius: "12px", flexShrink: 0 }}
            />
          )}
          <div sx={{ minWidth: 0 }}>
            <h3 sx={{ color: "heading", fontSize: [3, 4], m: 0 }}>{group.title}</h3>
            {group.date && <p sx={{ color: "textMuted", fontSize: 1, mt: 1, mb: 0 }}>{formatDate(group.date)}</p>}
            {group.description && <p sx={{ color: "textMuted", mt: 2, mb: 0 }}>{group.description}</p>}
          </div>
        </div>
      )}
      <ul
        sx={{
          listStyle: "none",
          p: 0,
          m: 0,
          display: "grid",
          gap: 3,
          gridTemplateColumns: layout === "grid" ? "repeat(auto-fill, minmax(150px, 1fr))" : "1fr",
        }}
      >
        {group.tracks.map((track) => {
          const active = currentPath === track.path
          const props = {
            track,
            active,
            playing: active && playing,
            progress: active ? progress : 0,
            failed: failedPath === track.path,
            onToggle,
            onSeek,
          }
          return layout === "grid" ? (
            <TrackTile key={track.path} {...props} />
          ) : (
            <TrackRow key={track.path} {...props} />
          )
        })}
      </ul>
    </div>
  )
}

const RecordingsPage = () => {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })
  const player = useAudioPlayer()
  const sections = state.status === "ready" ? state.sections : []
  const anchors = sectionAnchors(sections)

  React.useEffect(() => {
    let cancelled = false

    fetchSections()
      .then((sections) => {
        if (!cancelled) {
          setState({ status: "ready", sections })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageShell
      kicker="Recordings"
      title="Analog Synthesis"
      lead="Custom modules, control-voltage experiments, and sound design sessions."
      heroExtra={
        sections.length > 1 && (
          <nav aria-label="Sections" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 4, position: "relative" }}>
            {sections.map((section, position) => (
              <ButtonLink
                key={section.id}
                href={`#${anchors[position]}`}
                variant="secondary"
                styles={{ py: 2, px: 3, fontSize: 1, bg: "background" }}
              >
                {section.title}
              </ButtonLink>
            ))}
          </nav>
        )
      }
    >
      {state.status === "loading" && <Status>Loading recordings…</Status>}
      {state.status === "error" && <Status>The recordings could not be loaded. Try refreshing the page.</Status>}
      {state.status === "ready" && state.sections.length === 0 && <Status>No recordings yet.</Status>}
      {/* Anchors never contain a double hyphen, so the heading ids cannot collide with a section's */}
      {sections.map((section, position) => (
        <section
          key={section.id}
          id={anchors[position]}
          aria-labelledby={`${anchors[position]}--title`}
          sx={{ mb: [5, 6], scrollMarginTop: "80px" }}
        >
          <h2
            id={`${anchors[position]}--title`}
            sx={{ variant: "text.sectionTitle", mt: 0, mb: section.description ? 2 : 4 }}
          >
            {section.title}
          </h2>
          {section.description && <p sx={{ variant: "text.body", mt: 0, mb: 4 }}>{section.description}</p>}
          {section.groups.map((group) => (
            <Group key={group.path} group={group} layout={section.layout} player={player} />
          ))}
        </section>
      ))}
    </PageShell>
  )
}

export default RecordingsPage

export const Head = () => (
  <Seo title="Analog Synthesis" description="Analog synthesis recordings by Josh Wentworth." pathname="/recordings" />
)
