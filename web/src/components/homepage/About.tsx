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
      <UpDown>
        <Svg icon="box" hiddenMobile width={24} color="icon_blue" left="50%" top="75%" />
        <Svg icon="upDown" hiddenMobile width={32} color="icon_darkest" left="70%" top="20%" />
        <Svg icon="triangle" width={32} stroke color="icon_darkest" left="25%" top="5%" />
        <Svg icon="upDown" hiddenMobile width={48} color="icon_orange" left="80%" top="80%" />
      </UpDown>
      <UpDownWide>
        <Svg icon="arrowUp" hiddenMobile width={32} color="icon_purple" left="5%" top="80%" />
        <Svg icon="triangle" width={24} stroke color="icon_brightest" left="95%" top="50%" />
        <Svg icon="circle" hiddenMobile width={24} color="icon_brightest" left="85%" top="15%" />
        <Svg icon="upDown" hiddenMobile width={32} color="icon_darkest" left="45%" top="10%" />
      </UpDownWide>
      <Svg icon="circle" hiddenMobile width={24} color="icon_brightest" left="4%" top="20%" />
      <Svg icon="circle" width={24} color="icon_darkest" left="70%" top="60%" />
      <Svg icon="box" width={24} color="icon_orange" left="10%" top="10%" />
      <Svg icon="box" width={24} color="icon_darkest" left="20%" top="30%" />
      <Svg icon="hexa" width={32} stroke color="icon_darkest" left="80%" top="70%" />
    </Divider>
    <Content speed={0.4} offset={offset} factor={factor} className="content">
      <Inner>
        <AboutMDX />
      </Inner>
    </Content>
  </section>
)

export default About
