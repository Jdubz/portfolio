/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import * as React from "react"
import { get } from "theme-ui"
import { MDXProvider } from "@mdx-js/react"
import { Global } from "@emotion/react"
import MdxComponents from "./mdx-components"
import { CookieConsent } from "../CookieConsent"

type LayoutProps = { children: React.ReactNode; className?: string }

const Layout = ({ children, className = `` }: LayoutProps) => (
  <React.Fragment>
    <Global
      styles={(t) => ({
        ":root": {
          // Step 2: Icon behavior tokens
          "--icon-opacity": "0.16",
          "--icon-blur": "0px",
          "--icon-size-min": "16px",
          "--icon-size-max": "112px",
          "--icon-safe-x": "0px",
          "--icon-safe-y": "0px",
          "--icon-motion": "1",
          "--icon-motion-amp": "1.15",
        },
        html: {
          scrollBehavior: "smooth",
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
          backgroundColor: get(t, `colors.primary`) as string,
          color: get(t, `colors.background`) as string,
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
            animationDuration: "0.01ms !important" as any,
            animationIterationCount: "1 !important" as any,
            transitionDuration: "0.01ms !important" as any,
            scrollBehavior: "auto" as any,
          },
          // Step 6: Disable parallax transforms for reduced motion
          ".iconCanvas > *": {
            transform: "none !important" as any,
          },
        },
        // Mobile responsive icon settings
        "@media (max-width: 768px)": {
          ":root": {
            "--icon-opacity": "0.12",
            "--icon-size-max": "92px",
          },
          // Step 5: Density control - show only first 10 icons on mobile
          ".iconCanvas > *:nth-of-type(n+11)": {
            display: "none",
          },
        },
        // Tablet density control - show up to 14 icons
        "@media (min-width: 769px) and (max-width: 1200px)": {
          ".iconCanvas > *:nth-of-type(n+15)": {
            display: "none",
          },
        },
        // Desktop density control - cap at 20 icons
        "@media (min-width: 1201px)": {
          ".iconCanvas > *:nth-of-type(n+21)": {
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
        // Accent icons - every 4th icon is slightly more prominent
        ".iconCanvas > *:nth-of-type(4n)": {
          opacity: "calc(var(--icon-opacity) + 0.06)",
          transform: "scale(1.06)",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))",
        },
        ".iconCanvas svg, .iconCanvas img": {
          opacity: "var(--icon-opacity)",
          filter: "blur(var(--icon-blur))",
          maxWidth: "var(--icon-size-max)",
          maxHeight: "var(--icon-size-max)",
        },
        // Step 8: Section-specific presets for fine-tuning
        '.section[data-icon-preset="hero"]': {
          "--icon-opacity": "0.24",
          "--icon-size-max": "84px",
          "--icon-safe-x": "72px",
        },
        '.section[data-icon-preset="projects"]': {
          "--icon-opacity": "0.26",
          "--icon-size-max": "112px",
          "--icon-safe-x": "96px",
          "--icon-safe-y": "64px",
        },
        '.section[data-icon-preset="about"]': {
          "--icon-opacity": "0.22",
          "--icon-size-max": "92px",
          "--icon-safe-x": "64px",
          "--icon-safe-y": "48px",
        },
        '.section[data-icon-preset="contact"]': {
          "--icon-opacity": "0.20",
          "--icon-size-max": "68px",
          "--icon-safe-x": "64px",
        },
      })}
    />
    <MDXProvider components={MdxComponents}>
      <main className={className} role="main" aria-label="Main content">
        {children}
      </main>
      <CookieConsent />
    </MDXProvider>
  </React.Fragment>
)

export default Layout
