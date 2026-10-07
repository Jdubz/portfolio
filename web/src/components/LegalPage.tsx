/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "./homepage/Layout"

type LegalPageProps = {
  title: string
  /** A literal date. Not `new Date()`: that would change on every build and break hydration. */
  lastUpdated: string
  children: React.ReactNode
}

/** Shared shell for the privacy and terms pages: back link, title, date and section spacing. */
export const LegalPage = ({ title, lastUpdated, children }: LegalPageProps) => (
  <Layout>
    <div
      sx={{
        minHeight: "100vh",
        bg: "background",
        py: [6, 7, 8],
      }}
    >
      <div sx={{ variant: "layout.container", maxWidth: 800 }}>
        <Link
          to="/"
          sx={{
            variant: "links.primary",
            display: "inline-flex",
            alignItems: "center",
            mb: 5,
            fontSize: 2,
            "&:before": {
              content: '"← "',
              mr: 2,
            },
          }}
        >
          Back to Home
        </Link>

        <h1
          sx={{
            fontSize: [6, 7, 8],
            fontWeight: "heading",
            lineHeight: "heading",
            color: "heading",
            mb: 3,
          }}
        >
          {title}
        </h1>

        <p sx={{ fontSize: 1, color: "textMuted", mb: 5 }}>Last updated: {lastUpdated}</p>

        <div sx={{ "& > section": { mb: 5 }, "& p": { lineHeight: "relaxed" }, "& ul": { pl: 4, "& li": { mb: 2 } } }}>
          {children}
        </div>
      </div>
    </div>
  </Layout>
)

type LegalSectionProps = {
  heading: string
  children: React.ReactNode
}

export const LegalSection = ({ heading, children }: LegalSectionProps) => (
  <section>
    <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>{heading}</h2>
    {children}
  </section>
)
