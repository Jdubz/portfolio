import { merge } from "theme-ui"
import baseTheme from "@lekoarts/gatsby-theme-cara/src/gatsby-plugin-theme-ui"

const theme = merge(baseTheme, {
  buttons: {
    primary: {
      bg: "primary",
      color: "background",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: [4, 5],
      py: [3, 3],
      borderRadius: "pill",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        bg: "primaryHover",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(251, 146, 60, 0.4)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    secondary: {
      bg: "transparent",
      color: "text",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: [4, 5],
      py: [3, 3],
      borderRadius: "pill",
      border: "2px solid",
      borderColor: "divider",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: "primary",
        color: "primary",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(251, 146, 60, 0.2)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    ...(baseTheme.buttons || {}),
  },
  links: {
    primary: {
      color: "primary",
      textDecoration: "none",
      fontWeight: 600,
      transition: "all 0.2s ease",
      "&:hover": {
        color: "primaryHover",
        textDecoration: "underline",
      },
    },
  },
  text: {
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
    ...baseTheme.colors,
    primaryHover: "#f97316",
    danger: "#ef4444",
    success: "#10b981",
  } as any,
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
