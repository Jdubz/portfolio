/** @jsx jsx */
import { jsx } from "theme-ui"
import PageShell from "../components/PageShell"
import Seo from "../components/homepage/Seo"
import { Callout, proseStyles } from "../components/ledHelp/primitives"
import LedsSection from "../components/ledHelp/LedsSection"
import PowerSection from "../components/ledHelp/PowerSection"
import ControllersSection from "../components/ledHelp/ControllersSection"
import MaterialsSection from "../components/ledHelp/MaterialsSection"
import ProjectPlan from "../components/ledHelp/ProjectPlan"

const contents = [
  { id: "leds", label: "LEDs" },
  { id: "power", label: "Power" },
  { id: "controllers", label: "Controllers" },
  { id: "materials", label: "Materials" },
  { id: "project-plan", label: "Project plan" },
]

const TableOfContents = () => (
  <nav aria-label="On this page" sx={{ mt: 4 }}>
    <ol sx={{ listStyle: "none", p: 0, m: 0, display: "flex", flexWrap: "wrap", gap: 2 }}>
      {contents.map((item, index) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 2,
              borderRadius: "pill",
              border: "1px solid",
              borderColor: "divider",
              bg: "background",
              color: "text",
              fontSize: 1,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
              "&:hover": { borderColor: "primary", color: "link" },
              "&:focus-visible": { outline: "2px solid", outlineColor: "link", outlineOffset: "2px" },
            }}
          >
            <span sx={{ color: "link" }}>{index + 1}</span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
)

const LedHelpPage = () => (
  <PageShell
    kicker="LED Workshop"
    title="Designing an LED project"
    lead="A guide to the LEDs, power, controllers and materials for wearables, sculptural lighting and everything in between, ending with the project plan to bring to your first session."
    heroExtra={<TableOfContents />}
  >
    <div sx={{ maxWidth: 880, mx: "auto" }}>
      <div sx={{ ...proseStyles, mb: [5, 6] }}>
        <h2 sx={{ fontSize: [5, 6], color: "heading", mt: 0, mb: 3 }}>How the workshop works</h2>
        <p>
          You bring the idea; I help you make it real. Before we meet in person, read this guide, choose your parts, and
          answer every question in the <a href="#project-plan">project plan</a>. The plan is how we make sure
          you&rsquo;ve bought the right LEDs, enough power and the materials to hold it together, with time for
          everything to arrive. The in-person sessions are for building, wiring and solving problems, not shopping.
        </p>
        <Callout title="One rule: 5V systems only">
          <p>
            Every project in this workshop uses 5V addressable LEDs and 5V power. If a product listing says 12V or 24V,
            it&rsquo;s the wrong product for this workshop, even if it looks perfect.
          </p>
        </Callout>
      </div>

      <LedsSection />
      <PowerSection />
      <ControllersSection />
      <MaterialsSection />
      <ProjectPlan />
    </div>
  </PageShell>
)

export default LedHelpPage

export const Head = () => (
  <Seo
    title="LED Project Guide"
    description="LEDs, 5V power, controllers and materials for wearable and sculptural LED projects, with a project plan template for the LED workshop."
    pathname="/led-help"
  />
)
