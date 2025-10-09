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
        <Svg icon="box" width={80} color="icon_brightest" left="85%" top="85%" />
        <Svg icon="upDown" width={88} color="icon_teal" left="70%" top="10%" />
        <Svg icon="triangle" width={96} stroke color="icon_indigo" left="25%" top="6%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="circle" width={72} color="icon_brightest" left="75%" top="8%" />
        <Svg icon="upDown" hiddenMobile width={80} color="icon_teal" left="45%" top="5%" />
        <Svg icon="circle" hiddenMobile width={64} color="icon_brightest" left="4%" top="12%" />
        <Svg icon="box" width={72} color="icon_blue" left="10%" top="6%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="arrowUp" hiddenMobile width={88} color="icon_teal" left="20%" top="92%" />
        <Svg icon="circle" width={96} color="icon_blue" left="70%" top="88%" />
        <Svg icon="triangle" hiddenMobile width={80} stroke color="icon_indigo" left="18%" top="84%" />
        <Svg icon="hexa" width={88} stroke color="icon_indigo" left="75%" top="90%" />
        <Svg icon="hexa" width={80} stroke color="icon_blue" left="80%" top="82%" />
        <Svg icon="box" width={72} color="icon_teal" left="29%" top="86%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="triangle" width={48} stroke color="icon_brightest" left="90%" top="45%" />
      <Svg icon="circle" width={56} color="icon_indigo" left="80%" top="55%" />
      <Svg icon="circle" hiddenMobile width={64} color="icon_brightest" left="17%" top="50%" />
    </Divider>
  </section>
)

export default Projects
