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
          "*": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
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
      })}
    />
    <MDXProvider components={MdxComponents}>
      <main className={className}>{children}</main>
    </MDXProvider>
  </React.Fragment>
)

export default Layout
