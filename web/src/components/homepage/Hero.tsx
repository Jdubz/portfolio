/** @jsx jsx */
import { jsx } from "theme-ui"
import Divider from "../elements/Divider"
import Inner from "../elements/Inner"
import Content from "../elements/Content"
import Svg from "./Svg"
import { UpDown, UpDownWide } from "../../styles/animations"
import Intro from "../../content/sections/intro.mdx"

const Hero = ({ offset, factor = 1 }: { offset: number; factor?: number }) => (
  <section
    data-screenshot-section="hero"
    className="section has-icons"
    data-icon-preset="hero"
    aria-label="Introduction"
  >
    <Divider speed={0} offset={offset} factor={factor} />
    <Divider speed={0.2} offset={offset} factor={factor} className="iconCanvas">
      {/* Bubbles rising from bottom - larger, more visible */}
      <UpDown>
        <Svg icon="rocket" hiddenMobile width={80} stroke color="icon_blue" left="10%" top="15%" />
        <Svg icon="database" width={72} stroke color="icon_teal" left="60%" top="75%" />
        <Svg icon="cube-3d" width={64} color="icon_darker" left="60%" top="10%" />
        <Svg icon="bolt" width={96} color="icon_purple" left="15%" top="80%" />
        <Svg icon="shield" width={80} stroke color="icon_indigo" left="85%" top="85%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="arrowUp" hiddenMobile width={64} color="icon_blue" left="80%" top="8%" />
        <Svg icon="triangle" width={56} stroke color="icon_brightest" left="90%" top="12%" />
        <Svg icon="code-brackets" width={72} stroke color="icon_indigo" left="28%" top="5%" />
        <Svg icon="cloud" width={88} color="icon_teal" left="75%" top="6%" />
        <Svg icon="flask" hiddenMobile width={64} color="icon_purple" left="45%" top="10%" />
        <Svg icon="git-branch" width={80} color="icon_green" left="5%" top="8%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="server-stack" width={96} color="icon_darker" left="70%" top="92%" />
        <Svg icon="circle" width={72} stroke color="icon_blue" left="30%" top="88%" />
        <Svg icon="compass" hiddenMobile width={80} color="icon_pink" left="40%" top="85%" />
        <Svg icon="cluster" hiddenMobile width={88} color="icon_purple" left="5%" top="90%" />
        <Svg icon="key" width={72} color="icon_teal" left="95%" top="90%" />
        <Svg icon="lock" width={64} stroke color="icon_indigo" left="80%" top="82%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="sine-wave" width={48} stroke color="icon_darker" left="25%" top="45%" />
      <Svg icon="wifi" width={56} color="icon_darkest" left="50%" top="55%" />
      <Svg icon="hexa" width={48} color="icon_darkest" left="10%" top="50%" />
    </Divider>
    <Content sx={{ variant: `texts.bigger` }} speed={0.4} offset={offset} factor={factor} className="content">
      <Inner>
        <Intro />
        {/* Logo at bottom of hero section, overlapping 50% with next section */}
        <div
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: [6, 7, 8],
            position: "relative",
            zIndex: 100,
          }}
        >
          <img
            src="/logo-gradient.png"
            alt="JW Logo"
            sx={{
              width: ["240px", "320px", "400px"],
              height: ["240px", "320px", "400px"],
              filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))",
            }}
          />
        </div>
      </Inner>
    </Content>
  </section>
)

export default Hero
