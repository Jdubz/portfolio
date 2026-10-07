/** @jsx jsx */
import * as React from "react"
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "./homepage/Layout"
import HamburgerMenu from "./homepage/HamburgerMenu"
import Footer from "./homepage/Footer"
import Svg from "./homepage/Svg"
import { UpDown, UpDownWide } from "../styles/animations"

type PageShellProps = {
  /** Small label above the title */
  kicker?: string
  title: string
  /** One or two sentences under the title */
  lead?: React.ReactNode
  /** Extra hero content under the lead, such as section links */
  heroExtra?: React.ReactNode
  /** Narrower column for long-form text */
  narrow?: boolean
  children: React.ReactNode
}

const WIDE = 1120
const NARROW = 800

/**
 * The floating icons from the homepage, kept to the right and the edges of the hero so they frame
 * the title instead of sitting behind it.
 */
const HeroIcons = () => (
  <div
    aria-hidden="true"
    sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.6 }}
  >
    <UpDown>
      <Svg icon="cloud" hiddenMobile width={72} stroke color="icon_teal" left="78%" top="14%" />
      <Svg icon="sine-wave" hiddenMobile width={80} stroke color="icon_blue" left="62%" top="58%" />
      <Svg icon="bolt" hiddenMobile width={64} color="icon_purple" left="90%" top="62%" />
    </UpDown>
    <UpDownWide>
      <Svg icon="server-stack" hiddenMobile width={56} color="icon_brightest" left="91%" top="16%" />
      <Svg icon="code-brackets" hiddenMobile width={56} stroke color="icon_teal" left="68%" top="20%" />
      <Svg icon="pcb-trace" hiddenMobile width={64} color="icon_green" left="80%" top="70%" />
    </UpDownWide>
  </div>
)

/**
 * The frame every page other than the homepage shares: site menu, a hero with the back link, title
 * and floating icons, a content column, and the footer.
 */
const PageShell = ({ kicker, title, lead, heroExtra, narrow = false, children }: PageShellProps) => {
  const maxWidth = narrow ? NARROW : WIDE

  return (
    <Layout ownMain>
      <HamburgerMenu />
      <div sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bg: "background", color: "text" }}>
        <header
          sx={{
            position: "relative",
            // Clears the back link and the menu button, which sit over the top of the hero
            pt: 8,
            pb: [5, 6],
            background:
              "radial-gradient(circle at 20% 20%, rgba(14,165,233,0.14), transparent 32%), radial-gradient(circle at 80% 10%, rgba(0,201,167,0.14), transparent 30%), linear-gradient(135deg, rgba(14,165,233,0.08), rgba(0,201,167,0.12))",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <HeroIcons />

          <Link
            to="/"
            sx={{
              position: "absolute",
              top: 3,
              left: [3, 4],
              zIndex: 1,
              height: 48,
              display: "inline-flex",
              alignItems: "center",
              px: 3,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              bg: "background",
              boxShadow: "lg",
              color: "text",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.3s ease",
              "&:hover": { color: "link", borderColor: "primary" },
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary", outlineOffset: "2px" },
            }}
          >
            ← Home
          </Link>

          <div sx={{ variant: "layout.container", maxWidth, position: "relative" }}>
            <div sx={{ position: "relative", maxWidth: 720 }}>
              {/* Softens any icon that drifts behind the text, as the homepage sections do */}
              <div sx={{ variant: "masks.soft" }} aria-hidden="true" />
              {kicker && <p sx={{ variant: "text.heroKicker", mt: 0, mb: 3 }}>{kicker}</p>}
              <h1 sx={{ variant: "text.h1", mt: 0, mb: lead ? 3 : 0, fontSize: ["40px", "48px", "56px"] }}>{title}</h1>
              {lead && <p sx={{ variant: "text.lead", m: 0 }}>{lead}</p>}
            </div>
            {heroExtra}
          </div>
        </header>

        <main sx={{ flex: 1, py: [5, 6] }}>
          <div sx={{ variant: "layout.container", maxWidth }}>{children}</div>
        </main>

        <Footer onPage />
      </div>
    </Layout>
  )
}

export default PageShell
