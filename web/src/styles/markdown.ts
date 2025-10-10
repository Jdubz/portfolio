/**
 * Markdown Styling Configuration
 *
 * Centralized styles for rendering markdown content across the application.
 * Used by ReactMarkdown components in BlurbEntry and ExperienceEntry.
 */

import type { ThemeUIStyleObject } from "theme-ui"

/**
 * Base markdown content styles
 *
 * Provides consistent typography and spacing for markdown elements.
 */
export const markdownStyles: ThemeUIStyleObject = {
  fontSize: 2,
  lineHeight: 1.6,

  // Headings
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    mt: 3,
    mb: 2,
    fontWeight: "bold",
  },
  "& h2": {
    fontSize: 3,
  },
  "& h3": {
    fontSize: 2,
  },

  // Lists
  "& ul, & ol": {
    pl: 4,
    mb: 2,
  },
  "& li": {
    mb: 1,
  },

  // Paragraphs
  "& p": {
    mb: 2,
  },

  // Code
  "& code": {
    bg: "muted",
    px: 1,
    borderRadius: "2px",
    fontFamily: "monospace",
  },

  // Links
  "& a": {
    color: "primary",
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}

/**
 * Markdown styles with additional bottom margin
 *
 * Used when markdown content needs extra spacing below.
 */
export const markdownStylesWithMargin: ThemeUIStyleObject = {
  ...markdownStyles,
  mb: 3,
}
