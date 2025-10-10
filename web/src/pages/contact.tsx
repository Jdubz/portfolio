/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "../components/homepage/Layout"
import Seo from "../components/homepage/Seo"
import ContactForm from "../components/ContactForm"

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

          <div
            sx={{
              maxWidth: 720,
              mx: "auto",
            }}
          >
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

            <div sx={{ display: "grid", gap: 3, mb: 5 }}>
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

            <ContactForm />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ContactPage

export const Head = () => <Seo title="Contact" />
