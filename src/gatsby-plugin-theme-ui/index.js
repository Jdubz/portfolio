import { merge } from "theme-ui"
import originalTheme from "@lekoarts/gatsby-theme-cara/src/gatsby-plugin-theme-ui"

const customTheme = merge(originalTheme, {
  // Override config to remove dark mode
  config: {
    useColorSchemeMediaQuery: false,
    initialColorModeName: undefined,
  },
  // Josh Wentworth Brand Typography
  fonts: {
    body: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    monospace: '"Fira Code", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
  },

  fontWeights: {
    body: 400,
    medium: 500,
    heading: 600,
    bold: 700,
  },

  // Josh Wentworth Brand Colors
  colors: {
    // Primary brand colors
    primary: "#0EA5E9",        // Accent blue from brand guide
    secondary: "#00C9A7",      // Gradient end color

    // Text colors
    text: "#0F172A",           // Ink (primary text)
    "text-secondary": "#384155", // Ink-2 (secondary text)
    heading: "#0F172A",        // Same as primary text for consistency
    muted: "#475569",          // Muted text for hero subcopy

    // Surface colors
    background: "#FFFFFF",     // Surface (base)
    "background-secondary": "#F7F8FB", // Surface-2 (alt panels)
    border: "rgba(15,23,42,.12)",  // Subtle borders

    // Gradient colors
    "gradient-start": "#1B1F2B",
    "gradient-end": "#00C9A7",
    accentStart: "#7C3AED",    // Violet for avatar gradient
    accentEnd: "#06B6D4",      // Cyan for avatar gradient

    // Icon colors - using brand-appropriate palette
    icon_red: "#EF4444",
    icon_blue: "#0EA5E9",      // Brand accent
    icon_orange: "#F97316",
    icon_yellow: "#EAB308",
    icon_green: "#00C9A7",     // Brand gradient end
    icon_purple: "#8B5CF6",
    icon_pink: "#EC4899",
    icon_indigo: "#6366F1",
    icon_teal: "#14B8A6",
    icon_cyan: "#06B6D4",

    // Neutral icon colors for light mode
    icon_brightest: "#F7F8FB",  // Light surface color
    icon_darker: "#94A3B8",     // Medium gray
    icon_darkest: "#64748B",    // Darker gray

    // Focus ring for accessibility
    ring: "rgba(14, 165, 233, 0.35)",

    // Remove dark mode - override modes from base theme
    modes: {},
  },

  // Enhanced typography scale
  fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64],

  // Consistent spacing scale
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 128],

  // Modern responsive breakpoints
  breakpoints: ["480px", "768px", "1024px", "1280px", "1440px"],

  // Enhanced shadows for premium feel
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    default: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    soft: "0 6px 30px rgba(2,6,23,.08)",  // Soft shadow for avatar frame
    softLg: "0 24px 60px rgba(2,6,23,.10)", // Professional portrait shadow
    ring: "0 0 0 4px rgba(14, 165, 233, 0.35)", // Focus ring
  },

  // Friendly radii as per brand guide
  radii: {
    sm: "4px",
    default: "8px",
    md: "12px",
    lg: "16px",     // Cards per brand guide
    xl: "24px",
    full: "9999px",
  },

  // Custom styles for specific components
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: 1.65,      // Per brand guide
      fontWeight: "body",
      color: "text",
      backgroundColor: "background",
    },
    h1: {
      fontFamily: "heading",
      fontWeight: "heading",
      fontSize: [6, 7, 8],    // Responsive: 32px, 40px, 48px
      lineHeight: 1.2,
      color: "heading",
      letterSpacing: "-0.025em",
    },
    h2: {
      fontFamily: "heading",
      fontWeight: "heading",
      fontSize: [5, 6, 7],    // Responsive: 24px, 32px, 40px
      lineHeight: 1.25,
      color: "heading",
      letterSpacing: "-0.025em",
    },
    h3: {
      fontFamily: "heading",
      fontWeight: "heading",
      fontSize: [4, 5, 6],    // Responsive: 20px, 24px, 32px
      lineHeight: 1.3,
      color: "heading",
      letterSpacing: "-0.025em",
    },
    p: {
      fontSize: 2,           // 16px
      lineHeight: 1.65,      // Per brand guide
      color: "text",
    },
    a: {
      color: "primary",
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  },

  // Hero-specific text variants
  text: {
    heroTitle: {
      fontFamily: "heading",
      fontWeight: 900,
      letterSpacing: "-0.02em",
      color: "heading",
      // Responsive sizing with precise line-height per breakpoint
      fontSize: ["clamp(32px, 6vw, 40px)", "clamp(40px, 5vw, 56px)", "clamp(48px, 4vw, 64px)"],
      lineHeight: [1.12, 1.08, 1.04], // Tighter on mobile, looser on desktop
    },
    heroKicker: {
      fontWeight: 700,
      color: "text",
      letterSpacing: ".01em",
      fontSize: [2, 3],          // 16px, 18px
      fontFamily: "heading",
    },
    heroSub: {
      color: "muted",
      fontSize: [2, 3, 3],       // 16px, 18px, 18px
      lineHeight: 1.55,
      maxWidth: 720,
    },
    heroProof: {
      color: "muted",
      fontSize: [1, 2, 2],       // 14px, 16px, 16px
      lineHeight: 1.55,
      maxWidth: 740,
    },
    micro: {
      color: "muted",
      fontSize: 1,               // 14px
    },
  },

  // Button variants
  buttons: {
    primary: {
      bg: "#0EA5E9",
      color: "white",
      borderRadius: "lg",
      px: 22,
      py: 14, // Increased for mobile hit area (≥44px)
      fontWeight: "medium",
      cursor: "pointer",
      transition: "opacity 0.2s ease",
      "&:hover": {
        opacity: 0.92,
      },
      "&:focus-visible": {
        boxShadow: "ring",
      },
    },
    secondary: {
      bg: "white",
      color: "text",
      border: "1px solid",
      borderColor: "text", // Increased contrast from border color
      borderRadius: "lg",
      px: 22,
      py: 14, // Increased for mobile hit area (≥44px)
      fontWeight: "medium",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#fafafa",
      },
    },
  },
})

export default customTheme