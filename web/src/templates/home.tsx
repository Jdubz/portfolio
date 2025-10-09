import * as React from "react"
import type { HeadFC } from "gatsby"
import { Parallax, IParallax } from "@react-spring/parallax"
import Layout from "../components/homepage/Layout"
import Hero from "../components/homepage/Hero"
import Projects from "../components/homepage/Projects"
import About from "../components/homepage/About"
import Contact from "../components/homepage/Contact"
import Seo from "../components/homepage/Seo"

// Extend Window interface to include scrollToSection
declare global {
  interface Window {
    scrollToSection?: (offset: number) => void
  }
}

// Custom hook to access the parallax scroll function
export const useParallaxScroll = () => {
  const scrollToSection = React.useCallback((offset: number) => {
    if (window.scrollToSection) {
      window.scrollToSection(offset)
    }
  }, [])

  return scrollToSection
}

const Cara = () => {
  const parallaxRef = React.useRef<IParallax>(null)

  // Add scroll function to window for button access
  React.useEffect(() => {
    window.scrollToSection = (offset: number) => {
      parallaxRef.current?.scrollTo(offset)
    }
  }, [])

  React.useEffect(() => {
    // Hide the FCP fallback and show the main content when React has hydrated
    const fallback = document.querySelector(".fcp-hero-fallback")
    const gatsby = document.querySelector("#___gatsby")

    if (fallback) {
      fallback.classList.add("loaded")
    }
    if (gatsby) {
      gatsby.classList.add("loaded")
    }
  }, [])

  return (
    <>
      {/* Critical FCP content - renders immediately */}
      <div className="fcp-hero-fallback">
        <div className="fcp-hero-content">
          <h1 className="fcp-hero-title">Josh Wentworth</h1>
          <p className="fcp-hero-description">
            Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication.
          </p>
        </div>
      </div>

      {/* Main Parallax content */}
      <Layout>
        <Parallax ref={parallaxRef} pages={5}>
          <Hero offset={0} factor={1} />
          <Projects offset={1} factor={2} />
          <About offset={3} factor={1} />
          <Contact offset={4} factor={1} />
        </Parallax>
      </Layout>
    </>
  )
}

export default Cara

export const Head: HeadFC = () => (
  <>
    <Seo />
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Critical CSS for First Contentful Paint optimization */
          .fcp-hero-fallback {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            background: var(--theme-ui-colors-background, #ffffff);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            opacity: 1;
            transition: opacity 0.3s ease-out;
            pointer-events: none;
          }
          .fcp-hero-fallback.loaded {
            opacity: 0;
            pointer-events: none;
          }
          .fcp-hero-content {
            text-align: center;
            max-width: 600px;
          }
          .fcp-hero-title {
            font-size: clamp(30px, 6vw, 48px);
            font-weight: bold;
            margin-bottom: 1rem;
            color: var(--theme-ui-colors-heading, #0f172a);
            line-height: 1.2;
            margin: 0 0 1rem 0;
          }
          .fcp-hero-description {
            font-size: 1.125rem;
            line-height: 1.6;
            color: var(--theme-ui-colors-muted, #475569);
            margin: 0;
          }
          #___gatsby {
            opacity: 0;
            transition: opacity 0.3s ease-in;
          }
          #___gatsby.loaded {
            opacity: 1;
          }
        `,
      }}
    />
  </>
)
