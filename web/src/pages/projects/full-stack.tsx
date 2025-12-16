/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import Layout from "../../components/homepage/Layout"
import Seo from "../../components/homepage/Seo"
import { Link } from "gatsby"

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
    summary: "The site you’re browsing: Gatsby + Theme UI, Firebase hosting, CI/CD with lint/tests on every push.",
    tech: ["Gatsby", "React", "TypeScript", "Firebase Hosting"],
  },
  {
    title: "Job Finder Worker",
    repoUrl: "https://github.com/Jdubz/job-finder-worker",
    summary:
      "Queue-driven scraper that aggregates newly posted jobs for the Job Finder app; resilient fetch + rate limiting.",
    tech: ["TypeScript", "Node.js", "Playwright", "Queues"],
  },
  {
    title: "Blinky Time",
    repoUrl: "https://github.com/Jdubz/blinky_time",
    summary: "Arduino/Neopixel controller with audio-reactive modes, smooth timing, and Wi‑Fi control.",
    tech: ["C++", "Arduino", "Neopixel", "Audio DSP"],
  },
  {
    title: "App Monitor",
    repoUrl: "https://github.com/Jdubz/app-monitor",
    summary: "Developer ops dashboard for complex dev flows; monitors services and environments.",
    tech: ["TypeScript", "Node.js", "Monitoring", "CLI"],
  },
  {
    title: "Imagineer",
    repoUrl: "https://github.com/Jdubz/imagineer",
    summary: "Playground for AI image generation experiments and tooling.",
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
            background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(0,201,167,0.12))",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <div
            sx={{
              variant: "layout.container",
              display: "grid",
              gap: [4, 5],
              gridTemplateColumns: ["1fr", null, "1.5fr 1fr"],
            }}
          >
            <div>
              <p sx={{ variant: "text.heroKicker", mb: 3 }}>Case Study</p>
              <h1 sx={{ variant: "text.h1", mb: 3, fontSize: ["42px", "48px", "56px"] }}>
                Full-Stack Cloud Development
              </h1>
              <p sx={{ variant: "text.lead", mb: 4 }}>
                Production-ready web apps, APIs, and cloud infrastructure delivered end-to-end. Modern TypeScript and
                Python stacks, CI/CD you can trust, and observability baked in from day one.
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
                  Book a project chat
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
              }}
            >
              <h3 sx={{ color: "heading", mb: 3, fontSize: [3, 4] }}>What I deliver</h3>
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
                    <strong>Frontends people enjoy using.</strong> React/Angular, design systems, accessibility, and
                    fast loads.
                  </div>
                </li>
                <li>
                  <span sx={{ color: "primary" }} aria-hidden="true">
                    ▸
                  </span>
                  <div>
                    <strong>Resilient backends.</strong> Node.js or Python services with strong typing, tracing, and
                    rate limits.
                  </div>
                </li>
                <li>
                  <span sx={{ color: "primary" }} aria-hidden="true">
                    ▸
                  </span>
                  <div>
                    <strong>Cloud you can trust.</strong> Kubernetes on GCP/AWS, Terraform, CI/CD, and monitoring ready
                    for prod.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section sx={{ py: [6, 7] }}>
          <div sx={{ variant: "layout.container" }}>
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
