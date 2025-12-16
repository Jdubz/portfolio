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
        <Svg icon="rocket" hiddenMobile width={80} stroke color="icon_blue" left="8%" top="12%" />
        <Svg icon="database" width={72} stroke color="icon_teal" left="65%" top="78%" />
        <Svg icon="bolt" width={96} color="icon_purple" left="18%" top="82%" />
        <Svg icon="shield" width={80} stroke color="icon_blue" left="88%" top="88%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="cloud" width={88} color="icon_teal" left="78%" top="5%" />
        <Svg icon="git-branch" width={80} color="icon_green" left="3%" top="6%" />
        <Svg icon="server-stack" width={64} color="icon_brightest" left="92%" top="10%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="compass" hiddenMobile width={72} color="icon_pink" left="42%" top="86%" />
        <Svg icon="key" width={64} color="icon_yellow" left="93%" top="92%" />
        <Svg icon="bug" width={80} color="icon_red" left="28%" top="90%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="arrowUp" width={32} color="icon_teal" left="12%" top="48%" />
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
            mt: [2, 3, 4],
            position: "relative",
            zIndex: 100,
          }}
        >
          <img
            src="/logo-gradient.svg"
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
