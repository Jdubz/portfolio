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
        <Svg icon="circle" width={96} stroke color="icon_indigo" left="25%" top="6%" />
        <Svg icon="code-brackets" width={80} color="icon_teal" left="70%" top="10%" />
        <Svg icon="git-branch" width={88} color="icon_green" left="85%" top="85%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="wrench" width={72} color="icon_brightest" left="75%" top="8%" />
        <Svg icon="bluetooth" hiddenMobile width={80} color="icon_blue" left="45%" top="5%" />
        <Svg icon="led" hiddenMobile width={64} color="icon_red" left="4%" top="12%" />
        <Svg icon="inductor" width={72} color="icon_yellow" left="10%" top="6%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="caliper" hiddenMobile width={88} color="icon_teal" left="20%" top="92%" />
        <Svg icon="graph" width={96} color="icon_purple" left="70%" top="88%" />
        <Svg icon="nut" hiddenMobile width={80} stroke color="icon_pink" left="18%" top="84%" />
        <Svg icon="ruler" width={88} stroke color="icon_orange" left="75%" top="90%" />
        <Svg icon="motor" width={80} stroke color="icon_blue" left="80%" top="82%" />
        <Svg icon="screwdriver" width={72} color="icon_brightest" left="29%" top="86%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="compass" width={48} stroke color="icon_green" left="90%" top="45%" />
      <Svg icon="magnifier" width={56} color="icon_indigo" left="80%" top="55%" />
    </Divider>
  </section>
)

export default Projects
