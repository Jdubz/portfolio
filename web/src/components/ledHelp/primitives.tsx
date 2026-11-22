/** @jsx jsx */
import * as React from "react"
import { jsx, type ThemeUIStyleObject } from "theme-ui"

/** Long-form text styles shared by every section of the LED guide */
export const proseStyles: ThemeUIStyleObject = {
  "& p": { lineHeight: "body", mt: 0, mb: 3 },
  "& ul, & ol": { pl: 4, mt: 0, mb: 3, "& li": { mb: 2, lineHeight: "body" } },
  // Underlined: inside running text, colour alone does not mark a link. :where() keeps this at the
  // specificity of one class, so a ButtonLink's own styles win.
  "& :where(a)": { color: "link", textDecoration: "underline" },
  "& code": {
    fontFamily: "monospace",
    fontSize: "0.9em",
    px: 1,
    borderRadius: "sm",
    bg: "muted",
  },
  // Direct children only, so the headings inside cards keep their own spacing
  "& > h3": { fontSize: [4, 5], color: "heading", mt: 5, mb: 3 },
  "& > h4": { fontSize: [2, 3], color: "heading", mt: 4, mb: 2 },
}

type GuideSectionProps = {
  id: string
  /** Shown above the title, e.g. "Part 1" */
  label: string
  title: string
  intro?: React.ReactNode
  children: React.ReactNode
}

export const GuideSection = ({ id, label, title, intro, children }: GuideSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    sx={{
      // Keeps the heading clear of the floating menu button when jumped to
      scrollMarginTop: "96px",
      pt: [5, 6],
      mt: [5, 6],
      borderTop: "1px solid",
      borderColor: "divider",
      ...proseStyles,
    }}
  >
    <div sx={{ variant: "text.heroKicker", fontSize: [1, 2], mb: 2 }}>{label}</div>
    <h2 id={`${id}-title`} sx={{ fontSize: [6, 7], color: "heading", mt: 0, mb: 3 }}>
      {title}
    </h2>
    {intro && <div sx={{ variant: "text.lead", fontSize: [3, 4], mb: 4, maxWidth: "70ch" }}>{intro}</div>}
    {children}
  </section>
)

type DataTableProps = {
  /** Read out by screen readers and shown above the table */
  caption: string
  columns: string[]
  rows: React.ReactNode[][]
}

/** A table that scrolls sideways inside its own box on narrow screens, never the page */
export const DataTable = ({ caption, columns, rows }: DataTableProps) => (
  <div
    role="region"
    aria-label={caption}
    sx={{
      variant: "cards.surface",
      overflowX: "auto",
      mb: 4,
    }}
  >
    {/* About 140px a column: narrower makes rows of wrapped text taller than they are worth */}
    <table
      sx={{ width: "100%", minWidth: Math.max(480, columns.length * 140), borderCollapse: "collapse", fontSize: 1 }}
    >
      <caption
        sx={{
          textAlign: "left",
          px: 3,
          pt: 3,
          pb: 2,
          color: "textMuted",
          fontSize: 1,
          fontWeight: 600,
          letterSpacing: "wide",
          textTransform: "uppercase",
        }}
      >
        {caption}
      </caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              scope="col"
              sx={{
                textAlign: "left",
                px: 3,
                py: 2,
                color: "heading",
                fontWeight: 700,
                borderBottom: "1px solid",
                borderColor: "divider",
                whiteSpace: "nowrap",
              }}
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            sx={{
              "&:not(:last-of-type) td, &:not(:last-of-type) th": { borderBottom: "1px solid", borderColor: "divider" },
            }}
          >
            {row.map((cell, cellIndex) =>
              cellIndex === 0 ? (
                <th
                  key={cellIndex}
                  scope="row"
                  sx={{
                    textAlign: "left",
                    verticalAlign: "top",
                    px: 3,
                    py: 3,
                    color: "heading",
                    fontWeight: 600,
                    minWidth: 140,
                  }}
                >
                  {cell}
                </th>
              ) : (
                <td key={cellIndex} sx={{ verticalAlign: "top", px: 3, py: 3, color: "text", lineHeight: 1.5 }}>
                  {cell}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

type CalloutProps = {
  tone?: "info" | "warning"
  title: string
  children: React.ReactNode
}

export const Callout = ({ tone = "info", title, children }: CalloutProps) => (
  <aside
    sx={{
      variant: "cards.surface",
      borderLeft: "4px solid",
      borderLeftColor: tone === "warning" ? "warning" : "primary",
      px: [3, 4],
      py: 3,
      mb: 4,
      "& > :last-child": { mb: 0 },
    }}
  >
    <div sx={{ fontWeight: 700, color: "heading", mb: 2 }}>{title}</div>
    {children}
  </aside>
)

type CardGridProps = { children: React.ReactNode; columns?: number }

export const CardGrid = ({ children, columns = 2 }: CardGridProps) => (
  <div sx={{ display: "grid", gap: [3, 4], gridTemplateColumns: ["1fr", null, `repeat(${columns}, 1fr)`], mb: 4 }}>
    {children}
  </div>
)

type InfoCardProps = { title: string; children: React.ReactNode }

export const InfoCard = ({ title, children }: InfoCardProps) => (
  <article sx={{ variant: "cards.surface", p: [3, 4], "& > :last-child": { mb: 0 } }}>
    <h3 sx={{ fontSize: [3, 4], color: "heading", mt: 0, mb: 2 }}>{title}</h3>
    {children}
  </article>
)
