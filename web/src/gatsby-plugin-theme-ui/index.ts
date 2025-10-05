/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/prefer-nullish-coalescing */
import { Theme } from "theme-ui"

const theme: Theme = {
  config: {
    initialColorModeName: "dark",
    useCustomProperties: true,
  },
  // Font sizes: rem based scale
  fontSizes: [
    "0.75rem",   // 0: 12px
    "0.875rem",  // 1: 14px
    "1rem",      // 2: 16px
    "1.125rem",  // 3: 18px
    "1.25rem",   // 4: 20px
    "1.5rem",    // 5: 24px
    "2rem",      // 6: 32px
    "2.5rem",    // 7: 40px
    "3rem",      // 8: 48px
    "4rem",      // 9: 64px
    "5rem",      // 10: 80px
    "6rem",      // 11: 96px
  ],
  // Spacing scale
  space: [
    0,           // 0
    "0.25rem",   // 1: 4px
    "0.5rem",    // 2: 8px
    "1rem",      // 3: 16px
    "1.5rem",    // 4: 24px
    "2rem",      // 5: 32px
    "3rem",      // 6: 48px
    "4rem",      // 7: 64px
    "6rem",      // 8: 96px
    "8rem",      // 9: 128px
  ],
  // Breakpoints
  breakpoints: ["400px", "600px", "900px", "1200px", "1600px"],
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
    medium: 500,
  },
  lineHeights: {
    body: 1.65,
    heading: 1.2,
  },
  letterSpacings: {
    body: "normal",
    wide: "0.05em",
  },
  styles: {
    root: {
      margin: 0,
      padding: 0,
      boxSizing: "border-box",
      textRendering: "optimizeLegibility",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
      color: "text",
      backgroundColor: "background",
      WebkitTextSizeAdjust: "100%",
    },
    a: {
      color: "primary",
      textDecoration: "none",
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        color: "primary",
        textDecoration: "none",
      },
    },
    img: {
      borderStyle: "none",
    },
    pre: {
      fontFamily: "monospace",
      fontSize: "1em",
    },
    p: {
      fontSize: [1, 2],
      letterSpacing: "-0.003em",
      lineHeight: "body",
      color: "text",
    },
    h1: {
      fontSize: [6, 7, 8],
      fontWeight: "heading",
      lineHeight: "heading",
      mt: 2,
      mb: 3,
      textShadow: "rgba(255, 255, 255, 0.15) 0px 5px 35px",
      letterSpacing: "wide",
      color: "heading",
    },
    h2: {
      fontSize: [4, 5, 6],
      fontWeight: "heading",
      lineHeight: "heading",
      mt: 2,
      mb: 2,
      color: "heading",
    },
    h3: {
      fontSize: [3, 4, 5],
      fontWeight: "heading",
      lineHeight: "heading",
      mt: 3,
      color: "heading",
    },
    h4: {
      fontSize: [2, 3, 4],
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
    },
    h5: {
      fontSize: [1, 2, 3],
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
    },
    h6: {
      fontSize: 1,
      fontWeight: "heading",
      lineHeight: "heading",
      mb: 2,
      color: "heading",
    },
  },
  colors: {
    // Dark mode (default)
    text: "#e2e8f0",
    heading: "#ffffff",
    background: "#141821",
    primary: "#0EA5E9",
    primaryHover: "#0284c7",
    highlight: "#00C9A7",
    danger: "#ef4444",
    success: "#10b981",
    divider: "#1e293b",
    textMuted: "#94a3b8",
    dark: "#0f172a",
    wave: "#0a0f1a",
    white: "#ffffff",
    grayDark: "#64748b",
    // Gradient colors
    gradA: "#0ea5e9",
    gradB: "#00c9a7",
    // Icon colors
    icon_brightest: "#00C9A7",
    icon_darker: "#0284c7",
    icon_darkest: "#0369a1",
    icon_blue: "#0EA5E9",
    icon_teal: "#00C9A7",
    icon_indigo: "#667eea",
    icon_red: "#ef4444",
    icon_orange: "#0EA5E9",
    icon_yellow: "#fbbf24",
    icon_pink: "#ec4899",
    icon_purple: "#a855f7",
    icon_green: "#10b981",
    // Light mode
    modes: {
      light: {
        text: "#1e293b",
        heading: "#0f172a",
        background: "#f8fafc",
        primary: "#0EA5E9",
        primaryHover: "#0284c7",
        highlight: "#00C9A7",
        danger: "#ef4444",
        success: "#10b981",
        divider: "#e2e8f0",
        textMuted: "#64748b",
        dark: "#0f172a",
        wave: "#0a0f1a",
        white: "#ffffff",
        grayDark: "#64748b",
        gradA: "#0ea5e9",
        gradB: "#00c9a7",
        icon_brightest: "#00C9A7",
        icon_darker: "#0284c7",
        icon_darkest: "#0369a1",
        icon_blue: "#0EA5E9",
        icon_teal: "#00C9A7",
        icon_indigo: "#667eea",
        icon_red: "#ef4444",
        icon_orange: "#0EA5E9",
        icon_yellow: "#fbbf24",
        icon_pink: "#ec4899",
        icon_purple: "#a855f7",
        icon_green: "#10b981",
      },
    },
  },
  layout: {
    container: {
      maxWidth: 1200,
      mx: "auto",
      px: [3, 4],
    },
    footer: {
      textAlign: "center",
      display: "block",
      position: "absolute",
      bottom: 0,
      color: "textMuted",
      px: [2, 3],
      py: [3, 4],
    },
  },
  buttons: {
    primary: {
      bg: "primary",
      color: "white",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: 4,
      py: 3,
      borderRadius: "9999px",
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
      py: 3,
      borderRadius: "9999px",
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
    toggle: {
      color: "background",
      border: "none",
      backgroundColor: "text",
      cursor: "pointer",
      alignSelf: "center",
      px: 3,
      py: 2,
      ml: 3,
    },
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
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1.2,
      color: "heading",
      letterSpacing: '-0.01em',
      mb: '40px',
    },
  },
  cards: {
    primary: {
      bg: "background",
      borderRadius: "xl",
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "lg",
    },
    white: {
      bg: "white",
      color: "dark",
      p: 4,
      borderRadius: "xl",
      boxShadow: "lg",
      mb: 4,
    },
    project: {
      display: "block",
      width: "100%",
      minHeight: ["340px", "380px"],
      boxShadow: "lg",
      position: "relative",
      borderRadius: "xl",
      overflow: "hidden",
      textDecoration: "none",
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
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
    sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 20px rgba(0, 0, 0, 0.15)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    pill: "9999px",
  },
  sizes: {
    container: 1200,
    full: "100%",
  },
  gradients: {
    primary: "linear-gradient(135deg, #667eea 0%, #0ea5e9 100%)",
    project: "linear-gradient(135deg, #667eea 0%, #0ea5e9 100%)",
  },
}

export default theme
