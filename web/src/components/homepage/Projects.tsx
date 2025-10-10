/** @jsx jsx */
import { jsx } from "theme-ui"
import Divider from "../elements/Divider"
import Inner from "../elements/Inner"
import Content from "../elements/Content"
import Svg from "./Svg"
import { UpDown, UpDownWide } from "../../styles/animations"
import ProjectsMDX from "../../content/sections/projects.mdx"

const Projects = ({ offset, factor = 2 }: { offset: number; factor?: number }) => (
  <section
    data-screenshot-section="projects"
    className="section has-icons"
    data-icon-preset="projects"
    aria-label="Projects"
  >
    <Divider bg="gradients.project" speed={-0.2} offset={1.1} factor={factor} />
    <Content speed={0.4} offset={offset + 0.2} factor={factor} className="content">
      <Inner>
        <div
          sx={{
            maxWidth: 1120,
            mx: "auto",
          }}
        >
          <div
            sx={{
              display: `grid`,
              gridGap: [4, 4, 4, 5],
              gridTemplateColumns: [`1fr`, `1fr`, `repeat(2, 1fr)`],
              h2: { gridColumn: `-1/1` },
            }}
          >
            <ProjectsMDX />
          </div>
        </div>
      </Inner>
    </Content>
    <Divider speed={0.1} offset={offset} factor={factor} className="iconCanvas">
      {/* Bubbles rising from bottom - larger, more visible */}
      <UpDown>
        <Svg icon="hexa" width={88} stroke color="icon_indigo" left="22%" top="8%" />
        <Svg icon="code-brackets" width={72} stroke color="icon_teal" left="72%" top="12%" />
        <Svg icon="pcb-trace" width={80} color="icon_green" left="88%" top="88%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="test-tube" width={64} color="icon_brightest" left="78%" top="6%" />
        <Svg icon="bluetooth" hiddenMobile width={72} color="icon_blue" left="48%" top="4%" />
        <Svg icon="inductor" width={64} color="icon_yellow" left="8%" top="5%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="graph" width={88} color="icon_purple" left="68%" top="90%" />
        <Svg icon="ruler" width={80} stroke color="icon_orange" left="78%" top="92%" />
        <Svg icon="screwdriver" width={64} color="icon_brightest" left="25%" top="88%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="magnifier" width={40} color="icon_indigo" left="85%" top="52%" />
    </Divider>
  </section>
)

export default Projects
