/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import Layout from "../@lekoarts/gatsby-theme-cara/components/layout"
import Seo from "@lekoarts/gatsby-theme-cara/src/components/seo"

const TermsPage = () => {
  return (
    <Layout>
      <Seo title="Terms of Service" description="Terms of service for Josh Wentworth's portfolio website" />
      <div
        sx={{
          minHeight: "100vh",
          bg: "background",
          py: [6, 7, 8],
        }}
      >
        <div sx={{ variant: "layout.container", maxWidth: 800 }}>
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
              fontSize: [6, 7, 8],
              fontWeight: "heading",
              lineHeight: "heading",
              color: "heading",
              mb: 3,
            }}
          >
            Terms of Service
          </h1>

          <p sx={{ fontSize: 1, color: "textMuted", mb: 5 }}>
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div sx={{ "& > section": { mb: 5 }, "& p": { lineHeight: "relaxed" }, "& ul": { pl: 4, "& li": { mb: 2 } } }}>
            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>1. Acceptance of Terms</h2>
              <p>
                By accessing and using joshwentworth.com (the "Website"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this Website.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>2. Description of Service</h2>
              <p>
                This Website is a personal portfolio showcasing Josh Wentworth's professional work, projects, and skills in software development, hardware engineering, and digital fabrication. The Website includes a contact form for professional inquiries.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>3. Use of Website</h2>
              <p sx={{ mb: 2 }}>You agree to use this Website only for lawful purposes. You agree not to:</p>
              <ul>
                <li>Use the Website in any way that violates applicable laws or regulations</li>
                <li>Send spam, malicious code, or harmful content through the contact form</li>
                <li>Attempt to gain unauthorized access to any part of the Website</li>
                <li>Interfere with or disrupt the Website or servers</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Reproduce, duplicate, or copy material without authorization</li>
              </ul>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>4. Contact Form Usage</h2>
              <p sx={{ mb: 2 }}>The contact form is provided for legitimate professional inquiries only. By using the contact form, you agree that:</p>
              <ul>
                <li>You will provide accurate and truthful information</li>
                <li>You will not send spam, solicitations, or marketing materials</li>
                <li>You will not use offensive, abusive, or inappropriate language</li>
                <li>Your messages are for professional communication purposes</li>
              </ul>
              <p sx={{ mt: 3 }}>We reserve the right to refuse service and block users who violate these terms.</p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>5. Intellectual Property</h2>
              <p sx={{ mb: 2 }}>All content on this Website, including but not limited to:</p>
              <ul>
                <li>Text, graphics, logos, and images</li>
                <li>Code, software, and technical implementations</li>
                <li>Design, layout, and user interface</li>
                <li>Project descriptions and case studies</li>
              </ul>
              <p sx={{ mt: 3 }}>
                ...are the property of Josh Wentworth or used with permission, and are protected by copyright and intellectual property laws.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>6. Open Source Code</h2>
              <p>
                The source code for this Website is available on{" "}
                <a
                  href="https://github.com/Jdubz/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "primary", textDecoration: "underline" }}
                >
                  GitHub
                </a>{" "}
                and is licensed under the 0BSD License. See the repository for specific licensing terms.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>7. Third-Party Links</h2>
              <p>
                This Website may contain links to third-party websites (GitHub, LinkedIn, etc.). We are not responsible for the content, privacy policies, or practices of these external sites. Accessing third-party links is at your own risk.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>8. Disclaimer of Warranties</h2>
              <p>
                This Website is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Website will be uninterrupted, secure, or error-free. We make no guarantees about the accuracy or completeness of the content.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Josh Wentworth shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use this Website.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>10. Modifications to Service</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of this Website at any time without notice. We may also update these Terms of Service at any time. Continued use of the Website after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>11. Privacy</h2>
              <p>
                Your use of this Website is also governed by our{" "}
                <Link to="/privacy" sx={{ color: "primary", textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
                . Please review it to understand how we collect and use your information.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>12. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 sx={{ fontSize: 4, mb: 3, color: "heading" }}>13. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:{" "}
                <a href="mailto:hello@joshwentworth.com" sx={{ color: "primary", textDecoration: "underline" }}>
                  hello@joshwentworth.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default TermsPage
