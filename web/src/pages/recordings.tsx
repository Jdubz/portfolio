/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Layout from "../components/homepage/Layout"
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
    <Layout>
      <div sx={{ bg: "background", minHeight: "100vh", color: "text" }}>
        <section
          sx={{
            position: "relative",
            pb: [5, 6],
            pt: [6, 7],
            background:
              "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.14), transparent 32%), radial-gradient(circle at 80% 10%, rgba(0,201,167,0.14), transparent 30%), linear-gradient(135deg, rgba(14,165,233,0.08), rgba(0,201,167,0.12))",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <a
            href="/"
            sx={{
              position: "absolute",
              top: [3, 4],
              left: [3, 4],
              px: 3,
              py: 2,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              color: "text",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { color: "primary", borderColor: "primary" },
            }}
          >
            ← Home
          </a>

          <div sx={{ variant: "layout.container", maxWidth: 1080 }}>
            <p sx={{ variant: "text.heroKicker", mb: 3 }}>Recordings</p>
            <h1 sx={{ variant: "text.h1", mb: 3, fontSize: ["42px", "48px", "56px"] }}>Analog Synthesis</h1>
            <p sx={{ variant: "text.lead", mb: 0 }}>
              Custom modules, control-voltage experiments, and sound design sessions.
            </p>
            {sections.length > 1 && (
              <nav aria-label="Sections" sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 4 }}>
                {sections.map((section, position) => (
                  <a
                    key={section.id}
                    href={`#${anchors[position]}`}
                    sx={{ variant: "buttons.secondary", py: 2, px: 3, fontSize: 1, textDecoration: "none" }}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </section>

        <div sx={{ variant: "layout.container", maxWidth: 1080, py: [5, 6] }}>
          {state.status === "loading" && <Status>Loading recordings…</Status>}
          {state.status === "error" && <Status>The recordings could not be loaded. Try refreshing the page.</Status>}
          {state.status === "ready" && state.sections.length === 0 && <Status>No recordings yet.</Status>}
          {/* Anchors never contain a double hyphen, so the heading ids cannot collide with a section's */}
          {sections.map((section, position) => (
            <section
              key={section.id}
              id={anchors[position]}
              aria-labelledby={`${anchors[position]}--title`}
              sx={{ mb: [5, 6] }}
            >
              <h2
                id={`${anchors[position]}--title`}
                sx={{ variant: "text.sectionTitle", mb: section.description ? 2 : 4 }}
              >
                {section.title}
              </h2>
              {section.description && <p sx={{ variant: "text.body", mb: 4 }}>{section.description}</p>}
              {section.groups.map((group) => (
                <Group key={group.path} group={group} layout={section.layout} player={player} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default RecordingsPage

export const Head = () => (
  <Seo title="Analog Synthesis" description="Analog synthesis recordings by Josh Wentworth." pathname="/recordings" />
)
