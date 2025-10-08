/** @jsx jsx */
import { jsx } from "theme-ui"
import Divider from "@lekoarts/gatsby-theme-cara/src/elements/divider"
import Inner from "@lekoarts/gatsby-theme-cara/src/elements/inner"
import Content from "@lekoarts/gatsby-theme-cara/src/elements/content"
import Svg from "./svg"
import { UpDown, UpDownWide } from "@lekoarts/gatsby-theme-cara/src/styles/animations"
import Intro from "../sections/intro.mdx"

const Hero = ({ offset, factor = 1 }: { offset: number; factor?: number }) => (
  <section
    data-screenshot-section="hero"
    className="section has-icons"
    data-icon-preset="hero"
    aria-label="Introduction"
  >
    <Divider speed={0} offset={offset} factor={factor} />
    <Divider speed={0.2} offset={offset} factor={factor} className="iconCanvas">
      <UpDown>
        <Svg icon="rocket" hiddenMobile width={56} stroke color="icon_blue" left="10%" top="20%" />
        <Svg icon="database" width={48} stroke color="icon_teal" left="60%" top="70%" />
        <Svg icon="box" width={24} color="icon_darker" left="60%" top="15%" />
      </UpDown>
      <UpDownWide>
        <Svg icon="arrowUp" hiddenMobile width={32} color="icon_blue" left="80%" top="10%" />
        <Svg icon="triangle" width={24} stroke color="icon_brightest" left="90%" top="50%" />
        <Svg icon="circle" width={32} color="icon_darker" left="70%" top="90%" />
        <Svg icon="wifi" width={32} stroke color="icon_darkest" left="30%" top="65%" />
        <Svg icon="code-brackets" width={32} stroke color="icon_indigo" left="28%" top="15%" />
        <Svg icon="circle" width={24} color="icon_darkest" left="75%" top="10%" />
        <Svg icon="upDown" hiddenMobile width={32} color="icon_darkest" left="45%" top="10%" />
      </UpDownWide>
      <Svg icon="circle" hiddenMobile width={48} color="icon_darker" left="5%" top="70%" />
      <Svg icon="circle" width={24} color="icon_darkest" left="4%" top="20%" />
      <Svg icon="circle" width={24} color="icon_darkest" left="50%" top="60%" />
      <Svg icon="upDown" width={32} color="icon_darkest" left="95%" top="90%" />
      <Svg icon="resistor" hiddenMobile width={48} color="icon_darker" left="40%" top="80%" />
      <Svg icon="triangle" width={32} stroke color="icon_darker" left="25%" top="5%" />
      <Svg icon="circle" width={64} color="icon_green" left="95%" top="5%" />
      <Svg icon="box" hiddenMobile width={64} color="icon_purple" left="5%" top="90%" />
      <Svg icon="box" width={24} color="icon_darkest" left="10%" top="10%" />
      <Svg icon="box" width={24} color="icon_darkest" left="40%" top="30%" />
      <Svg icon="hexa" width={32} stroke color="icon_darker" left="10%" top="50%" />
      <Svg icon="database" width={32} stroke color="icon_darker" left="80%" top="70%" />
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
