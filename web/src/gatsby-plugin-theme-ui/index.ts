/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/prefer-nullish-coalescing */
import { merge } from "theme-ui"
import baseTheme from "@lekoarts/gatsby-theme-cara/src/gatsby-plugin-theme-ui"

const theme = merge(baseTheme, {
  layout: {
    container: {
      maxWidth: 1200,
      mx: "auto",
      px: [3, 4],
    },
  },
  buttons: {
    primary: {
      bg: "primary",
      color: "background",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: 4,
      height: 48,
      minHeight: 48,
      borderRadius: "pill",
      border: "none",
      cursor: "pointer",
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        bg: "primaryHover",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.4)",
      },
      "&:active": {
        transform: "translateY(0)",
        transition: "all 160ms cubic-bezier(.22,.61,.36,1)",
      },
      "&:focus-visible": {
        outline: "3px solid",
        outlineColor: "primary",
        outlineOffset: "2px",
      },
    },
    secondary: {
      bg: "transparent",
      color: "text",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: 4,
      height: 48,
      minHeight: 48,
      borderRadius: "pill",
      border: "2px solid",
      borderColor: "divider",
      cursor: "pointer",
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        borderColor: "primary",
        color: "primary",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
      },
      "&:active": {
        transform: "translateY(0)",
        transition: "all 160ms cubic-bezier(.22,.61,.36,1)",
      },
      "&:focus-visible": {
        outline: "3px solid",
        outlineColor: "primary",
        outlineOffset: "2px",
      },
    },
    ...(baseTheme.buttons || {}),
  },
  links: {
    primary: {
      color: "primary",
      textDecoration: "none",
      fontWeight: 600,
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        color: "primaryHover",
        textDecoration: "underline",
      },
      "&:focus-visible": {
        outline: "3px solid",
        outlineColor: "primary",
        outlineOffset: "2px",
        borderRadius: "2px",
      },
    },
  },
  text: {
    overline: {
      fontSize: [1, 1],
      fontWeight: 600,
      color: "text",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      opacity: 0.9,
    },
    heading: {
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
    },
    h1: {
      variant: "text.heading",
      fontSize: [9, 10, 11],
      letterSpacing: "-0.01em",
      lineHeight: 1.12,
      mt: 3,
      mb: 2,
    },
    h2: {
      variant: "text.heading",
      fontSize: [5, 6, 7],
      letterSpacing: "-0.01em",
      mb: 2,
    },
    lead: {
      fontSize: [3, 4, 5],
      color: "textMuted",
      lineHeight: 1.65,
      maxWidth: "68ch",
    },
    body: {
      fontSize: [2, 3],
      lineHeight: 1.65,
      color: "textMuted",
      maxWidth: "64ch",
    },
    heroKicker: {
      fontSize: [2, 3],
      fontWeight: 600,
      color: "primary",
      letterSpacing: "wide",
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: [7, 8, 9],
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
      textShadow: "rgba(255, 255, 255, 0.15) 0px 5px 35px",
      letterSpacing: "wide",
      mb: 3,
    },
    heroSub: {
      fontSize: [3, 4],
      lineHeight: 1.5,
      color: "textMuted",
      maxWidth: "50ch",
    },
    heroProof: {
      fontSize: [2, 3],
      fontStyle: "italic",
      color: "text",
      borderLeft: "3px solid",
      borderColor: "primary",
      pl: 3,
      py: 2,
    },
    micro: {
      fontSize: [1, 2],
      color: "textMuted",
      opacity: 0.7,
    },
    sectionTitle: {
      fontSize: [5, 6, 7],
      fontWeight: "heading",
      color: "heading",
      mb: [4, 5],
      letterSpacing: "wide",
    },
  },
  colors: {
    // Spread base colors first, then override
    ...(baseTheme.colors || {}),
    // Brand blue palette - Sky Blue 500/600
    // IMPORTANT: These must come AFTER the spread to override base theme orange
    primary: "#0EA5E9",
    primaryHover: "#0284c7",
    // Accent colors
    highlight: "#00C9A7",
    danger: "#ef4444",
    success: "#10b981",
    // Gradient colors for backgrounds and frames
    gradA: "#0ea5e9",
    gradB: "#00c9a7",
    // Surface colors
    panel: baseTheme.colors?.background,
    hairline: baseTheme.colors?.divider,
    // Icon colors - override base theme orange with blue variants
    icon_orange: "#0EA5E9", // Override orange with brand blue
    icon_brightest: "#00C9A7", // Keep teal highlight
    icon_darker: "#0284c7", // Darker blue
    icon_darkest: "#0369a1", // Darkest blue (Sky 700)
    icon_blue: "#0EA5E9", // Ensure blue icons use brand blue
    icon_teal: "#00C9A7", // Teal accent
    icon_indigo: "#667eea", // Indigo for variety
  } as any,
  cards: {
    elevated: {
      bg: "panel",
      borderRadius: "16px",
      border: "1px solid",
      borderColor: "hairline",
      boxShadow: "md",
    },
    form: {
      bg: "background",
      p: [4, 5],
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(16,23,42,0.12)",
      border: "1px solid",
      borderColor: "divider",
    },
  },
  forms: {
    input: {
      bg: "background",
      color: "text",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "4px",
      px: 3,
      py: 3,
      fontSize: 2,
      fontFamily: "body",
      height: [46, 48],
      transition: "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
      "&:focus": {
        outline: "none",
        borderColor: "primary",
        boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
      },
    },
    textarea: {
      bg: "background",
      color: "text",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "4px",
      px: 3,
      py: 3,
      fontSize: 2,
      fontFamily: "body",
      minHeight: 140,
      resize: "vertical",
      transition: "border-color 200ms cubic-bezier(.22,.61,.36,1), box-shadow 200ms cubic-bezier(.22,.61,.36,1)",
      "&:focus": {
        outline: "none",
        borderColor: "primary",
        boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.15)",
      },
    },
    label: {
      fontSize: 2,
      fontWeight: "bold",
      color: "heading",
      mb: 2,
      display: "block",
    },
  },
  shadows: {
    ...baseTheme.shadows,
    softLg: "0 10px 30px rgba(16, 23, 42, 0.15), 0 0 1px rgba(16, 23, 42, 0.1)",
    elevated: "0 20px 50px rgba(0, 0, 0, 0.3)",
  },
  radii: {
    ...baseTheme.radii,
    pill: "9999px",
    lg: "12px",
    md: "8px",
  },
})

export default theme
