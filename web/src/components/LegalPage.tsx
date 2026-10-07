/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import PageShell from "./PageShell"

type LegalPageProps = {
  title: string
  /** A literal date. Not `new Date()`: that would change on every build and break hydration. */
  lastUpdated: string
  children: React.ReactNode
}

/** Shared shell for the privacy and terms pages: the site page frame with long-form section spacing. */
export const LegalPage = ({ title, lastUpdated, children }: LegalPageProps) => (
  <PageShell kicker="Legal" title={title} lead={`Last updated: ${lastUpdated}`} narrow>
    <div
      sx={{
        "& > section": { mb: 5 },
        "& p": { lineHeight: "relaxed" },
        "& ul": { pl: 4, "& li": { mb: 2 } },
        "& a": { variant: "links.primary" },
      }}
    >
      {children}
    </div>
  </PageShell>
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
