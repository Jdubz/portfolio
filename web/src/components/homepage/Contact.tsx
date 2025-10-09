/** @jsx jsx */
import { jsx } from "theme-ui"
import Divider from "../elements/Divider"
import Inner from "../elements/Inner"
import Content from "../elements/Content"
import Svg from "./Svg"
import Footer from "./Footer"
import { UpDown, UpDownWide, waveAnimation } from "../../styles/animations"
import ContactMDX from "../../content/sections/contact.mdx"

const Contact = ({ offset, factor = 1 }: { offset: number; factor?: number }) => (
  <section
    id="contact"
    data-screenshot-section="contact"
    className="section has-icons"
    data-icon-preset="contact"
    aria-label="Contact"
  >
    <Divider fill="wave" speed={0.2} offset={offset} factor={factor}>
      <div
        sx={{ position: `absolute`, bottom: 0, width: `full`, height: `70%`, transform: `matrix(1, 0, 0, -1, 0, 0)` }}
      >
        <div
          sx={{
            position: `relative`,
            height: `100%`,
            svg: { width: `100%`, height: `100%` },
            "::before": {
              variant: "backgrounds.watermark",
              backgroundPosition: "center 100%",
              backgroundSize: "min(440px, 54vw)",
              opacity: 0.08,
              transform: "scaleY(-1)",
            },
            path: { animation: waveAnimation(`20s`) },
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" id="contact-wave" viewBox="0 0 800 338.05" preserveAspectRatio="none">
            <path>
              <animate
                attributeName="d"
                values="M 0 100 Q 250 50 400 200 Q 550 350 800 300 L 800 0 L 0 0 L 0 100 Z;M 0 100 Q 200 150 400 200 Q 600 250 800 300 L 800 0 L 0 0 L 0 100 Z;M 0 100 Q 150 350 400 200 Q 650 50 800 300 L 800 0 L 0 0 L 0 100 Z"
                repeatCount="indefinite"
                dur="30s"
              />
            </path>
          </svg>
        </div>
      </div>
    </Divider>
    <Content speed={0.4} offset={offset} factor={factor} className="content">
      <div
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "calc(100vh - 120px)",
          width: "100%",
        }}
      >
        <Inner>
          <ContactMDX />
        </Inner>
        <Footer />
      </div>
    </Content>
    <Divider speed={0.1} offset={offset} factor={factor} className="iconCanvas">
      {/* Bubbles rising from bottom - larger, more visible */}
      <UpDown>
        <Svg icon="upDown" hiddenMobile width={80} color="icon_darkest" left="70%" top="10%" />
        <Svg icon="triangle" width={88} stroke color="icon_darkest" left="25%" top="8%" />
        <Svg icon="hexa" width={96} stroke color="icon_darkest" left="80%" top="88%" />
      </UpDown>
      <UpDownWide>
        {/* Top cluster - floating to surface */}
        <Svg icon="circle" width={72} color="icon_brightest" left="85%" top="6%" />
        <Svg icon="upDown" hiddenMobile width={80} color="icon_darkest" left="45%" top="5%" />
        <Svg icon="circle" width={64} color="icon_brightest" left="4%" top="12%" />

        {/* Bottom cluster - rising bubbles */}
        <Svg icon="box" width={80} color="icon_darkest" left="20%" top="86%" />
      </UpDownWide>
      {/* Mid-section - sparser, smaller bubbles for depth */}
      <Svg icon="triangle" width={48} stroke color="icon_brightest" left="95%" top="50%" />
      <Svg icon="circle" width={56} color="icon_darkest" left="70%" top="55%" />
    </Divider>
  </section>
)

export default Contact
