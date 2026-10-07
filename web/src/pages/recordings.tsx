/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Layout from "../components/homepage/Layout"
import Seo from "../components/homepage/Seo"
import { fetchRecordings, type RecordingFolder } from "../utils/recordings"

type LoadState = { status: "loading" } | { status: "error" } | { status: "ready"; folders: RecordingFolder[] }

// Starting one track stops any other that is playing
const pauseOthers = (event: React.SyntheticEvent<HTMLAudioElement>) => {
  document.querySelectorAll("audio").forEach((audio) => {
    if (audio !== event.currentTarget) {
      audio.pause()
    }
  })
}

const Status = ({ children }: { children: React.ReactNode }) => (
  <p role="status" sx={{ variant: "text.body", py: [4, 5] }}>
    {children}
  </p>
)

const RecordingsPage = () => {
  const [state, setState] = React.useState<LoadState>({ status: "loading" })

  React.useEffect(() => {
    let cancelled = false

    fetchRecordings()
      .then((folders) => {
        if (!cancelled) {
          setState({ status: "ready", folders })
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
            <p sx={{ variant: "text.heroKicker", mb: 3 }}>Modular Synthesizer</p>
            <h1 sx={{ variant: "text.h1", mb: 3, fontSize: ["42px", "48px", "56px"] }}>Recordings</h1>
            <p sx={{ variant: "text.lead", mb: 0 }}>
              Custom modules, control-voltage experiments, and sound design sessions.
            </p>
          </div>
        </section>

        <section sx={{ py: [5, 6] }}>
          <div sx={{ variant: "layout.container", maxWidth: 1080 }}>
            {state.status === "loading" && <Status>Loading recordings…</Status>}
            {state.status === "error" && <Status>The recordings could not be loaded. Try refreshing the page.</Status>}
            {state.status === "ready" && state.folders.length === 0 && <Status>No recordings yet.</Status>}
            {state.status === "ready" &&
              state.folders.map((folder) => (
                <section key={folder.name} aria-label={folder.name || "Recordings"} sx={{ mb: [5, 6] }}>
                  {folder.name && <h2 sx={{ variant: "text.sectionTitle", mb: 4 }}>{folder.name}</h2>}
                  <ul sx={{ listStyle: "none", p: 0, m: 0, display: "grid", gap: 3 }}>
                    {folder.tracks.map((track) => (
                      <li
                        key={track.url}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: ["1fr", null, "minmax(0, 1fr) minmax(0, 1.4fr)"],
                          alignItems: "center",
                          gap: [2, null, 4],
                          p: [3, 4],
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "16px",
                          bg: "muted",
                        }}
                      >
                        <span sx={{ color: "heading", fontWeight: 600, overflowWrap: "anywhere" }}>{track.title}</span>
                        {/* Instrumental music: there is no speech to caption */}
                        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                        <audio
                          controls
                          preload="none"
                          src={track.url}
                          aria-label={track.title}
                          onPlay={pauseOthers}
                          sx={{ width: "100%" }}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default RecordingsPage

export const Head = () => (
  <Seo title="Recordings" description="Modular synthesizer recordings by Josh Wentworth." pathname="/recordings" />
)
