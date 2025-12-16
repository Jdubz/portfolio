/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Layout from "../../components/homepage/Layout"
import Seo from "../../components/homepage/Seo"
import { Link } from "gatsby"
import Svg from "../../components/homepage/Svg"
import { UpDown, UpDownWide } from "../../styles/animations"

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
    title: "Job Finder Worker",
    repoUrl: "https://github.com/Jdubz/job-finder-worker",
    summary:
      "Queue-driven scraper that normalizes new job posts; Playwright fetchers, backoff/retry, idempotent queue writes.",
    tech: ["TypeScript", "Node.js", "Playwright", "Queues"],
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
  {
    title: "Imagineer",
    repoUrl: "https://github.com/Jdubz/imagineer",
    summary: "AI image experiments: prompt pipelines, model runners, and asset bookkeeping scripts.",
    tech: ["Python", "AI", "Image Gen"],
  },
]

const capabilities = [
  {
    title: "Frontend",
    items: ["React/Next/Angular", "Design systems & theming", "Accessibility & performance"],
  },
  {
    title: "Backend & Data",
    items: ["Node.js, Python", "REST & GraphQL", "Postgres, Redis, Firestore"],
  },
  {
    title: "Platform",
    items: ["Kubernetes & Cloud Run", "Terraform & CI/CD", "Observability (Grafana/Loki/Elastic)"],
  },
]

const FullStackPage = () => {
  return (
    <Layout>
      <div
        sx={{
          bg: "background",
          minHeight: "100vh",
          color: "text",
        }}
      >
        {/* Hero */}
        <section
          sx={{
            position: "relative",
            overflow: "hidden",
            pb: [6, 7],
            pt: [6, 7],
            background:
              "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.14), transparent 32%), radial-gradient(circle at 80% 10%, rgba(0,201,167,0.14), transparent 30%), linear-gradient(135deg, rgba(14,165,233,0.08), rgba(0,201,167,0.12))",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <div
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: 0.48,
            }}
            aria-hidden="true"
          >
            <UpDown>
              <Svg icon="rocket" width={80} color="icon_blue" left="8%" top="12%" />
              <Svg icon="database" width={72} stroke color="icon_teal" left="65%" top="78%" />
              <Svg icon="bolt" width={96} color="icon_purple" left="18%" top="82%" />
              <Svg icon="shield" width={80} stroke color="icon_blue" left="88%" top="88%" />
            </UpDown>
            <UpDownWide>
              <Svg icon="cloud" width={88} color="icon_teal" left="78%" top="5%" />
              <Svg icon="git-branch" width={80} color="icon_green" left="3%" top="6%" />
              <Svg icon="server-stack" width={64} color="icon_brightest" left="92%" top="10%" />
              <Svg icon="graph" width={72} color="icon_purple" left="70%" top="90%" />
              <Svg icon="pcb-trace" width={72} color="icon_green" left="12%" top="68%" />
              <Svg icon="code-brackets" width={64} stroke color="icon_teal" left="52%" top="28%" />
            </UpDownWide>
            <Svg icon="magnifier" width={40} color="icon_indigo" left="48%" top="58%" />
          </div>

          <div
            sx={{
              variant: "layout.container",
              display: "grid",
              gap: [4, 5],
              gridTemplateColumns: ["1fr", null, "1.5fr 1fr"],
            }}
          >
            <div sx={{ position: "relative", zIndex: 1 }}>
              <p sx={{ variant: "text.heroKicker", mb: 3 }}>Technical Showcase</p>
              <h1 sx={{ variant: "text.h1", mb: 3, fontSize: ["42px", "48px", "56px"] }}>
                Full-Stack Cloud Development
              </h1>
              <p sx={{ variant: "text.lead", mb: 4 }}>
                Selected builds with their stacks, deployment targets, and instrumentation. Frontend, services, and
                platform are all represented with links to code and infra.
              </p>
              <div sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <a
                  href="https://github.com/Jdubz"
                  target="_blank"
                  rel="noreferrer noopener"
                  sx={{ variant: "buttons.primary" }}
                >
                  View GitHub
                </a>
                <Link to="/contact" sx={{ variant: "buttons.secondary" }}>
                  Contact
                </Link>
              </div>
            </div>
            <div
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "16px",
                p: [3, 4],
                bg: "muted",
                backdropFilter: "blur(10px)",
                boxShadow: "lg",
                position: "relative",
                zIndex: 1,
                "::before": {
                  content: '""',
                  position: "absolute",
                  inset: -2,
                  borderRadius: "inherit",
                  background: "linear-gradient(135deg, rgba(14,165,233,0.35), rgba(0,201,167,0.25))",
                  opacity: 0.4,
                  zIndex: -1,
                  filter: "blur(16px)",
                },
              }}
            >
              <h3 sx={{ color: "heading", mb: 3, fontSize: [3, 4] }}>What’s shown here</h3>
              <ul
                sx={{
                  listStyle: "none",
                  p: 0,
                  m: 0,
                  display: "grid",
                  gap: 3,
                  li: { display: "flex", gap: 3, alignItems: "flex-start" },
                }}
              >
                <li>
                  <span sx={{ color: "primary" }} aria-hidden="true">
                    ▸
                  </span>
                  <div>
                    <strong>Frontend builds.</strong> React/Next/Angular, design systems, SSR/SPA hybrids, perf budgets,
                    a11y checks.
                  </div>
                </li>
                <li>
                  <span sx={{ color: "primary" }} aria-hidden="true">
                    ▸
                  </span>
                  <div>
                    <strong>Service layer.</strong> Typed Node/Python services, REST/GraphQL, tracing, rate limiting,
                    contract tests.
                  </div>
                </li>
                <li>
                  <span sx={{ color: "primary" }} aria-hidden="true">
                    ▸
                  </span>
                  <div>
                    <strong>Platform.</strong> Kubernetes/Cloud Run, Terraform stacks, CI/CD pipelines, SLO dashboards,
                    alerting.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section sx={{ py: [6, 7] }}>
          <div
            sx={{
              variant: "layout.container",
              position: "relative",
            }}
          >
            <div
              sx={{
                position: "absolute",
                inset: "4% 6%",
                pointerEvents: "none",
                opacity: 0.35,
                mixBlendMode: "screen",
              }}
              aria-hidden="true"
            >
              <UpDownWide>
                <Svg icon="function-fx" width={64} color="icon_teal" left="12%" top="30%" />
                <Svg icon="json" width={56} color="icon_yellow" left="76%" top="24%" />
                <Svg icon="ruler" width={64} stroke color="icon_orange" left="82%" top="70%" />
                <Svg icon="screwdriver" width={56} color="icon_brightest" left="18%" top="78%" />
              </UpDownWide>
            </div>
            <div sx={{ display: "grid", gap: [4, 5], gridTemplateColumns: ["1fr", null, "repeat(3, 1fr)"] }}>
              {capabilities.map((block) => (
                <div
                  key={block.title}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "16px",
                    p: [3, 4],
                    bg: "muted",
                    boxShadow: "md",
                  }}
                >
                  <h3 sx={{ color: "heading", mb: 3, fontSize: [3, 4] }}>{block.title}</h3>
                  <ul sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 2 }}>
                    {block.items.map((item) => (
                      <li key={item} sx={{ color: "textMuted", display: "flex", gap: 2, alignItems: "center" }}>
                        <span sx={{ color: "primary" }} aria-hidden="true">
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured GitHub projects */}
        <section sx={{ pb: [6, 7] }}>
          <div sx={{ variant: "layout.container" }}>
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
              <h2 sx={{ variant: "text.sectionTitle", mb: 0 }}>Featured GitHub Work</h2>
              <p sx={{ variant: "text.micro", m: 0, color: "textMuted" }}>
                All repositories are public and actively maintained.
              </p>
            </div>
            <div sx={{ display: "grid", gap: [4, 4, 5], gridTemplateColumns: ["1fr", null, "repeat(3, 1fr)"] }}>
              {featuredRepos.map((repo) => (
                <article
                  key={repo.title}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "16px",
                    p: [3, 4],
                    bg: "muted",
                    boxShadow: "lg",
                    display: "grid",
                    gap: 3,
                    minHeight: "100%",
                  }}
                >
                  <div>
                    <p
                      sx={{
                        color: "textMuted",
                        fontSize: 1,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        mb: 2,
                      }}
                    >
                      Open Source
                    </p>
                    <h3 sx={{ color: "heading", mb: 2, fontSize: [3, 4] }}>{repo.title}</h3>
                    <p sx={{ color: "textMuted", lineHeight: "body", mb: 3 }}>{repo.summary}</p>
                    <div sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {repo.tech.map((tag) => (
                        <span
                          key={tag}
                          sx={{
                            bg: "muted",
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
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    sx={{
                      variant: "buttons.secondary",
                      textAlign: "center",
                      display: "inline-flex",
                      justifyContent: "center",
                      mt: "auto",
                    }}
                  >
                    View Repo ↗
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default FullStackPage

export const Head = () => <Seo title="Full-Stack Cloud Development" pathname="/projects/full-stack" />
