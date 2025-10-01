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

    // Surface colors
    background: "#FFFFFF",     // Surface (base)
    "background-secondary": "#F7F8FB", // Surface-2 (alt panels)

    // Gradient colors
    "gradient-start": "#1B1F2B",
    "gradient-end": "#00C9A7",

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
})

export default customTheme