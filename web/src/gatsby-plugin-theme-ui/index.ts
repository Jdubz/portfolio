import { Theme } from "theme-ui"

// Extend Theme to include gradients, backgrounds, and masks
interface CustomTheme extends Theme {
  gradients?: {
    primary: string
    project: string
  }
  backgrounds?: {
    watermark: Record<string, string | number>
  }
  masks?: {
    soft: Record<string, string | number | Record<string, string | number>>
  }
}

const theme: CustomTheme = {
  config: {
    initialColorModeName: "dark",
    useCustomProperties: true,
  },
  // Font sizes: rem based scale
  fontSizes: [
    "0.75rem", // 0: 12px
    "0.875rem", // 1: 14px
    "1rem", // 2: 16px
    "1.125rem", // 3: 18px
    "1.25rem", // 4: 20px
    "1.5rem", // 5: 24px
    "2rem", // 6: 32px
    "2.5rem", // 7: 40px
    "3rem", // 8: 48px
    "4rem", // 9: 64px
    "5rem", // 10: 80px
    "6rem", // 11: 96px
  ],
  // Spacing scale
  space: [
    0, // 0
    "0.25rem", // 1: 4px
    "0.5rem", // 2: 8px
    "1rem", // 3: 16px
    "1.5rem", // 4: 24px
    "2rem", // 5: 32px
    "3rem", // 6: 48px
    "4rem", // 7: 64px
    "6rem", // 8: 96px
    "8rem", // 9: 128px
  ],
  // Breakpoints
  breakpoints: ["400px", "600px", "900px", "1200px", "1600px"],
  fonts: {
    body: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    heading:
      'Poppins, Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    monospace: "Menlo, monospace",
  },
  fontWeights: {
    body: 400,
    medium: 500,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.65,
    heading: 1.15,
  },
  letterSpacings: {
    body: "normal",
    wide: "0.04em",
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
      fontFeatureSettings: "'cv05','ss01','case','liga','calt'",
    },
    a: {
      color: "link",
      textDecoration: "none",
      transition: "all 0.3s ease-in-out",
      "&:hover": {
        color: "link",
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
      fontFamily: "body",
      fontSize: [1, 2],
      letterSpacing: "-0.003em",
      lineHeight: "body",
      color: "text",
    },
    h1: {
      fontFamily: "heading",
      fontSize: [6, 7, 8],
      fontWeight: "heading",
      lineHeight: "heading",
      letterSpacing: "-0.015em",
      mt: 2,
      mb: 3,
      textShadow: "rgba(255, 255, 255, 0.15) 0px 5px 35px",
      color: "heading",
    },
    h2: {
      fontFamily: "heading",
      fontSize: [4, 5, 6],
      fontWeight: "heading",
      lineHeight: "heading",
      letterSpacing: "-0.012em",
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
    // A lighter step of the brand blue, for hovering a primary button under its dark text
    primaryBright: "#38bdf8",
    // The brand blue as text. Same blue on the dark page; a darker one in light mode, where the
    // brand blue is under 3:1 against the page.
    link: "#0EA5E9",
    highlight: "#00C9A7",
    danger: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
    divider: "#1e293b",
    textMuted: "#94a3b8",
    muted: "rgba(148, 163, 184, 0.1)",
    dark: "#0f172a",
    wave: "#334155",
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
        primaryBright: "#38bdf8",
        link: "#0369a1",
        highlight: "#00C9A7",
        danger: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
        info: "#3b82f6",
        divider: "#e2e8f0",
        textMuted: "#526073",
        muted: "rgba(100, 116, 139, 0.1)",
        dark: "#0f172a",
        wave: "#334155",
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
      px: [0, 3],
      py: [3, 4],
    },
    twoColSection: {
      display: ["block", null, null, "grid"],
      gridTemplateColumns: ["1fr", null, null, "1.25fr .75fr"],
      gap: [5, null, null, 6],
      alignItems: "start",
    },
  },
  buttons: {
    primary: {
      bg: "primary",
      // Dark text: white on the brand blue is under 3:1
      color: "dark",
      fontSize: [2, 3],
      fontWeight: "bold",
      px: 4,
      py: 3,
      borderRadius: "9999px",
      border: "none",
      cursor: "pointer",
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        bg: "primaryBright",
        color: "dark",
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
        color: "link",
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
  },
  links: {
    primary: {
      color: "link",
      textDecoration: "none",
      fontWeight: 600,
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        color: "link",
        textDecoration: "underline",
      },
      "&:focus-visible": {
        outline: "3px solid",
        outlineColor: "primary",
        outlineOffset: "2px",
        borderRadius: "2px",
      },
    },
    white: {
      color: "white",
      textDecoration: "none",
      fontWeight: 600,
      transition: "all 200ms cubic-bezier(.22,.61,.36,1)",
      "&:hover": {
        color: "white",
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
    heading: {
      fontWeight: "heading",
      lineHeight: "heading",
      color: "heading",
    },
    h1: {
      variant: "text.heading",
      fontSize: [9, 10, 11],
      letterSpacing: "-0.015em",
      lineHeight: 1.12,
      mt: 3,
      mb: 2,
    },
    lead: {
      fontFamily: "body",
      fontSize: [3, 4, 5],
      color: "textMuted",
      lineHeight: 1.65,
      maxWidth: "60ch",
    },
    body: {
      fontFamily: "body",
      fontSize: [2, 3],
      lineHeight: 1.65,
      color: "textMuted",
      maxWidth: "60ch",
    },
    heroKicker: {
      fontSize: [2, 3],
      fontWeight: 600,
      color: "link",
      letterSpacing: "wide",
      textTransform: "uppercase",
    },
    micro: {
      fontSize: [1, 2],
      color: "textMuted",
      opacity: 0.7,
    },
    sectionTitle: {
      fontFamily: "heading",
      fontSize: "40px",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.012em",
      color: "heading",
      mb: "40px",
    },
    bodyParagraph: {
      fontFamily: "body",
      fontSize: [2, 3],
      lineHeight: 1.65,
      color: "textMuted",
      maxWidth: "64ch",
      mb: 4,
    },
    cardTitle: {
      fontFamily: "heading",
      fontSize: [5, 6],
      fontWeight: "heading",
      lineHeight: "heading",
      letterSpacing: "-0.01em",
      color: "white",
      textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
      mb: 0,
      mt: 2,
    },
  },
  cards: {
    // The panel used for repo cards, track rows and sound tiles
    surface: {
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "xl",
      bg: "muted",
      boxShadow: "lg",
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
    projectOverlay: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(0,0,0,.0) 35%, rgba(0,0,0,.72) 95%)",
    },
    projectText: {
      position: "absolute",
      left: 4,
      right: 4,
      bottom: 4,
      "@media screen and (min-width: 900px)": {
        left: 5,
        right: 5,
        bottom: 5,
      },
      color: "white",
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
  backgrounds: {
    watermark: {
      content: '""',
      position: "absolute",
      inset: 0,
      backgroundImage: "url(/jw-logo-mono.svg)",
      backgroundRepeat: "no-repeat",
      opacity: 0.06,
      pointerEvents: "none",
    },
  },
  masks: {
    soft: {
      position: "absolute",
      inset: "-16px",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      maskImage: `
        linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%),
        linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
      `,
      WebkitMaskImage: `
        linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%),
        linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)
      `,
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
      pointerEvents: "none",
      zIndex: -1,
    },
  },
}

export default theme
