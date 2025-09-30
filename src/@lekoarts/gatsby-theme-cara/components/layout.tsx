import * as React from "react"
import { get } from "theme-ui"
import { MDXProvider } from "@mdx-js/react"
import { Global } from "@emotion/react"
import MdxComponents from "@lekoarts/gatsby-theme-cara/src/components/mdx-components"

type LayoutProps = { children: React.ReactNode; className?: string }

const Layout = ({ children, className = `` }: LayoutProps) => (
  <React.Fragment>
    <Global
      styles={(t) => ({
        ":root": {
          // Step 2: Icon behavior tokens
          "--icon-opacity": "0.12",
          "--icon-blur": "0px",
          "--icon-size-min": "16px",
          "--icon-size-max": "96px",
          "--icon-safe-x": "0px",
          "--icon-safe-y": "0px",
          "--icon-motion": "1",
        },
        "html, body": {
          overflowX: "hidden",
        },
        "*": {
          boxSizing: `inherit`,
          "&:before": {
            boxSizing: `inherit`,
          },
          "&:after": {
            boxSizing: `inherit`,
          },
        },
        "[hidden]": {
          display: `none`,
        },
        "::selection": {
          backgroundColor: get(t, `colors.primary`),
          color: get(t, `colors.background`),
        },
        // Focus ring styles for accessibility
        ":where(a, button, [role='button'], .card):focus-visible": {
          outline: "none",
          boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.45)",
          borderRadius: "10px",
        },
        // Reduce motion for users who prefer it
        "@media (prefers-reduced-motion: reduce)": {
          ":root": {
            "--icon-motion": "0",
          },
          "*": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
          // Step 6: Disable parallax transforms for reduced motion
          ".iconCanvas > *": {
            transform: "none !important",
          },
        },
        // Mobile responsive icon settings
        "@media (max-width: 768px)": {
          ":root": {
            "--icon-opacity": "0.10",
            "--icon-size-max": "80px",
          },
          // Step 5: Density control - show only first 8 icons on mobile
          ".iconCanvas > *:nth-of-type(n+9)": {
            display: "none",
          },
        },
        // Tablet density control - show up to 12 icons
        "@media (min-width: 769px) and (max-width: 1200px)": {
          ".iconCanvas > *:nth-of-type(n+13)": {
            display: "none",
          },
        },
        // Step 1: Layering primitives for icon backgrounds
        ".iconCanvas": {
          pointerEvents: "none",
          zIndex: 0,
        },
        ".content": {
          zIndex: 10,
        },
        // Step 4: Safe area - inset icon canvas to avoid content zones
        ".section.has-icons .iconCanvas": {
          inset: "var(--icon-safe-y) var(--icon-safe-x)",
        },
        // Step 3: Tame icon scale & opacity
        ".iconCanvas > *": {
          opacity: "var(--icon-opacity)",
          filter: "blur(var(--icon-blur))",
          // Step 6: Performance hints for smooth parallax
          willChange: "transform",
          contain: "paint",
        },
        ".iconCanvas svg, .iconCanvas img": {
          opacity: "var(--icon-opacity)",
          filter: "blur(var(--icon-blur))",
          maxWidth: "var(--icon-size-max)",
          maxHeight: "var(--icon-size-max)",
        },
      })}
    />
    <MDXProvider components={MdxComponents}>
      <main className={className}>{children}</main>
    </MDXProvider>
  </React.Fragment>
)

export default Layout
