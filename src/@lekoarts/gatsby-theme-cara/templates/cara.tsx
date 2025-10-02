import * as React from "react"
import type { HeadFC } from "gatsby"
import { Parallax } from "@react-spring/parallax"
import Layout from "../components/layout"
import Hero from "../components/hero"
import Projects from "../components/projects"
import About from "../components/about"
import Contact from "../components/contact"
import Seo from "@lekoarts/gatsby-theme-cara/src/components/seo"

// Create a context to share the parallax ref
export const ParallaxContext = React.createContext<React.RefObject<any> | null>(null)

const Cara = () => {
  const parallaxRef = React.useRef<any>(null)

  // Add scroll function to window for button access
  React.useEffect(() => {
    (window as any).scrollToSection = (offset: number) => {
      parallaxRef.current?.scrollTo(offset)
    }
  }, [])

  return (
    <Layout>
      <ParallaxContext.Provider value={parallaxRef}>
        <Parallax ref={parallaxRef} pages={5}>
          <Hero offset={0} factor={1} />
          <Projects offset={1} factor={2} />
          <About offset={3} factor={1} />
          <Contact offset={4} factor={1} />
        </Parallax>
      </ParallaxContext.Provider>
    </Layout>
  )
}

export default Cara

export const Head: HeadFC = () => <Seo />
