/** @jsx jsx */
import { jsx } from "theme-ui"
import PageShell from "../../components/PageShell"
import ButtonLink from "../../components/elements/ButtonLink"
import Seo from "../../components/homepage/Seo"

type FeaturedRepo = {
  title: string
  repoUrl: string
  summary: string
  tech: string[]
}

const featuredRepos: FeaturedRepo[] = [
  {
    title: "Portfolio",
    repoUrl: "https://github.com/Jdubz/portfolio",
    summary: "This site: Gatsby + Theme UI with MDX sections, Firebase Hosting, GH Actions for lint/test/deploy.",
    tech: ["Gatsby", "React", "TypeScript", "Firebase Hosting"],
  },
  {
    title: "Blinky Time",
    repoUrl: "https://github.com/Jdubz/blinky_time",
    summary: "Arduino/Neopixel controller with audio-reactive modes, fixed-timestep pattern loop, ESP Wi‑Fi bridge.",
    tech: ["C++", "Arduino", "Neopixel", "Audio DSP"],
  },
  {
    title: "App Monitor",
    repoUrl: "https://github.com/Jdubz/app-monitor",
    summary: "Dev workflow monitor: service health polling, env toggles, and Slack/CLI surfaces for multi-repo flows.",
    tech: ["TypeScript", "Node.js", "Monitoring", "CLI"],
  },
]

const FullStackPage = () => (
  <PageShell
    kicker="Technical Showcase"
    title="Full-Stack Cloud Development"
    lead="Selected builds with their stacks, deployment targets, and instrumentation. Frontend, services, and platform are all represented with links to code and infra."
  >
    <div
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 4,
        gap: 3,
        flexWrap: "wrap",
      }}
    >
      <h2 sx={{ variant: "text.sectionTitle", m: 0 }}>Featured GitHub Work</h2>
      <p sx={{ variant: "text.micro", m: 0, color: "textMuted" }}>
        All repositories are public and actively maintained.
      </p>
    </div>
    <div sx={{ display: "grid", gap: [4, 4, 5], gridTemplateColumns: ["1fr", null, "repeat(3, 1fr)"] }}>
      {featuredRepos.map((repo) => (
        <article
          key={repo.title}
          sx={{ variant: "cards.surface", p: [3, 4], display: "grid", gap: 3, minHeight: "100%" }}
        >
          <div>
            <p
              sx={{
                color: "textMuted",
                fontSize: 1,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                mt: 0,
                mb: 2,
              }}
            >
              Open Source
            </p>
            <h3 sx={{ color: "heading", mt: 0, mb: 2, fontSize: [3, 4] }}>{repo.title}</h3>
            <p sx={{ color: "textMuted", lineHeight: "body", mt: 0, mb: 3 }}>{repo.summary}</p>
            <div sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {repo.tech.map((tag) => (
                <span
                  key={tag}
                  sx={{
                    color: "text",
                    px: 2,
                    py: 1,
                    borderRadius: "pill",
                    fontSize: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ButtonLink href={repo.repoUrl} variant="secondary" newTab styles={{ mt: "auto" }}>
            View Repo ↗
          </ButtonLink>
        </article>
      ))}
    </div>
  </PageShell>
)

export default FullStackPage

export const Head = () => <Seo title="Full-Stack Cloud Development" pathname="/projects/full-stack" />
