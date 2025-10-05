/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "../@lekoarts/gatsby-theme-cara/components/layout"
import Seo from "@lekoarts/gatsby-theme-cara/src/components/seo"
import ContactForm from "../components/ContactForm"
import { GlowImage } from "../components/GlowImage"

const ContactPage = () => {
  return (
    <Layout>
      <div
        sx={{
          minHeight: "100vh",
          bg: "background",
          py: [6, 7, 8],
        }}
      >
        <div sx={{ variant: "layout.container" }}>
          <Link
            to="/"
            sx={{
              variant: "links.primary",
              display: "inline-flex",
              alignItems: "center",
              mb: 5,
              fontSize: 2,
              "&:before": {
                content: '"← "',
                mr: 2,
              },
            }}
          >
            Back to Home
          </Link>

          <h1
            sx={{
              fontSize: [7, 8, 9],
              fontWeight: "heading",
              lineHeight: "heading",
              color: "heading",
              mb: 4,
            }}
          >
            Get in touch
          </h1>

          <p
            sx={{
              fontSize: [3, 4],
              lineHeight: 1.65,
              maxWidth: "64ch",
              mb: 6,
              color: "textMuted",
            }}
          >
            Let&apos;s collaborate on your next engineering challenge. Whether you need software development,
            electronics design, or fabrication expertise, I&apos;m ready to help bring your ideas to life.
          </p>

          <div
            sx={{
              display: ["block", null, "grid"],
              gridTemplateColumns: ["1fr", null, "1.2fr .8fr"],
              gap: [5, null, 6],
              alignItems: "start",
            }}
          >
            <div>
              <div sx={{ variant: "cards.white" }}>
                <div sx={{ display: "grid", gap: 3 }}>
                  <div>
                    <span sx={{ color: "grayDark", mr: 2 }}>Email:</span>
                    <a href="mailto:hello@joshwentworth.com" sx={{ variant: "links.primary" }}>
                      hello@joshwentworth.com
                    </a>
                  </div>
                  <div>
                    <span sx={{ color: "grayDark", mr: 2 }}>LinkedIn:</span>
                    <a
                      href="https://linkedin.com/in/joshwentworth"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ variant: "links.primary" }}
                    >
                      linkedin.com/in/joshwentworth
                    </a>
                  </div>
                  <div>
                    <span sx={{ color: "grayDark", mr: 2 }}>GitHub:</span>
                    <a
                      href="https://github.com/joshwentworth"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ variant: "links.primary" }}
                    >
                      github.com/joshwentworth
                    </a>
                  </div>
                </div>
              </div>

              <div sx={{ maxWidth: 720, mt: 4 }}>
                <ContactForm />
              </div>
            </div>

            <div sx={{ justifySelf: ["center", null, "end"], alignSelf: "start", mt: [5, null, 0] }}>
              <GlowImage src="/avatar2.jpg" alt="Josh Wentworth" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContactPage

export const Head = () => <Seo title="Contact" />
