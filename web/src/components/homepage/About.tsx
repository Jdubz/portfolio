/** @jsx jsx */
import { jsx } from "theme-ui"
import Divider from "../elements/Divider"
import Inner from "../elements/Inner"
import Content from "../elements/Content"
import Svg from "./Svg"
import { UpDown, UpDownWide } from "../../styles/animations"
import AboutMDX from "../../content/sections/about.mdx"

const About = ({ offset, factor = 1 }: { offset: number; factor?: number }) => (
  <section data-screenshot-section="about" className="section has-icons" data-icon-preset="about" aria-label="About">
    <Divider
      bg="divider"
      clipPath="polygon(0 16%, 100% 4%, 100% 82%, 0 94%)"
      speed={0.2}
      offset={offset}
      factor={factor}
    />
    <Divider speed={0.1} offset={offset} factor={factor} className="iconCanvas">
      {/* Bubbles rising from bottom - larger, more visible */}
      <UpDown>
        <Svg icon="pull-request" hiddenMobile width={80} color="icon_purple" left="70%" top="10%" />
        <Svg icon="circle" width={88} stroke color="icon_brightest" left="25%" top="8%" />
        <Svg icon="capacitor" hiddenMobile width={96} color="icon_orange" left="80%" top="88%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="git-merge" width={64} color="icon_green" left="10%" top="12%" />
        <Svg icon="resistor" hiddenMobile width={72} color="icon_yellow" left="45%" top="5%" />
        <Svg icon="upDown" width={72} color="icon_brightest" left="85%" top="6%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="triangle" hiddenMobile width={88} color="icon_purple" left="5%" top="90%" />
        <Svg icon="diode" width={96} stroke color="icon_pink" left="80%" top="82%" />
        <Svg icon="box" width={80} color="icon_blue" left="20%" top="86%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="wifi" width={48} stroke color="icon_teal" left="95%" top="50%" />
      <Svg icon="cross" width={56} color="icon_indigo" left="70%" top="55%" />
    </Divider>
    <Content speed={0.4} offset={offset} factor={factor} className="content">
      <Inner>
        <AboutMDX />
      </Inner>
    </Content>
  </section>
)

export default About
