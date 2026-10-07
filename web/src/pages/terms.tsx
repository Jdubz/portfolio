/** @jsx jsx */
/* eslint-disable react/no-unescaped-entities */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { LegalPage, LegalSection } from "../components/LegalPage"
import Seo from "../components/homepage/Seo"

// A literal, not `new Date()`: the date must not change on every build or differ between the
// server-rendered HTML and the browser.
const LAST_UPDATED = "October 6, 2026"

const TermsPage = () => (
  <LegalPage title="Terms of Service" lastUpdated={LAST_UPDATED}>
    <LegalSection heading="1. Acceptance of Terms">
      <p>
        By accessing and using joshwentworth.com (the "Website"), you accept and agree to be bound by these Terms of
        Service. If you do not agree to these terms, please do not use this Website.
      </p>
    </LegalSection>

    <LegalSection heading="2. Description of Service">
      <p>
        This Website is a personal portfolio showcasing Josh Wentworth's professional work, projects, and skills in
        software development, hardware engineering, and digital fabrication. Professional inquiries are welcome by
        email.
      </p>
    </LegalSection>

    <LegalSection heading="3. Use of Website">
      <p sx={{ mb: 2 }}>You agree to use this Website only for lawful purposes. You agree not to:</p>
      <ul>
        <li>Use the Website in any way that violates applicable laws or regulations</li>
        <li>Send spam, malicious code, or harmful content to the contact email address</li>
        <li>Attempt to gain unauthorized access to any part of the Website</li>
        <li>Interfere with or disrupt the Website or servers</li>
        <li>Use automated systems (bots, scrapers) without permission</li>
        <li>Reproduce, duplicate, or copy material without authorization</li>
      </ul>
    </LegalSection>

    <LegalSection heading="4. Contacting Us">
      <p sx={{ mb: 2 }}>
        The contact email address is provided for legitimate professional inquiries only. By emailing us, you agree
        that:
      </p>
      <ul>
        <li>You will provide accurate and truthful information</li>
        <li>You will not send spam, solicitations, or marketing materials</li>
        <li>You will not use offensive, abusive, or inappropriate language</li>
        <li>Your messages are for professional communication purposes</li>
      </ul>
      <p sx={{ mt: 3 }}>We reserve the right to refuse service and block users who violate these terms.</p>
    </LegalSection>

    <LegalSection heading="5. Intellectual Property">
      <p sx={{ mb: 2 }}>All content on this Website, including but not limited to:</p>
      <ul>
        <li>Text, graphics, logos, and images</li>
        <li>Code, software, and technical implementations</li>
        <li>Design, layout, and user interface</li>
        <li>Project descriptions and case studies</li>
      </ul>
      <p sx={{ mt: 3 }}>
        ...are the property of Josh Wentworth or used with permission, and are protected by copyright and intellectual
        property laws.
      </p>
    </LegalSection>

    <LegalSection heading="6. Open Source Code">
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
    </LegalSection>

    <LegalSection heading="7. Third-Party Links">
      <p>
        This Website may contain links to third-party websites (GitHub, LinkedIn, etc.). We are not responsible for the
        content, privacy policies, or practices of these external sites. Accessing third-party links is at your own
        risk.
      </p>
    </LegalSection>

    <LegalSection heading="8. Disclaimer of Warranties">
      <p>
        This Website is provided "as is" without warranties of any kind, either express or implied. We do not warrant
        that the Website will be uninterrupted, secure, or error-free. We make no guarantees about the accuracy or
        completeness of the content.
      </p>
    </LegalSection>

    <LegalSection heading="9. Limitation of Liability">
      <p>
        To the fullest extent permitted by law, Josh Wentworth shall not be liable for any indirect, incidental,
        special, consequential, or punitive damages resulting from your use or inability to use this Website.
      </p>
    </LegalSection>

    <LegalSection heading="10. Modifications to Service">
      <p>
        We reserve the right to modify, suspend, or discontinue any part of this Website at any time without notice. We
        may also update these Terms of Service at any time. Continued use of the Website after changes constitutes
        acceptance of the modified terms.
      </p>
    </LegalSection>

    <LegalSection heading="11. Privacy">
      <p>
        Your use of this Website is also governed by our{" "}
        <Link to="/privacy" sx={{ color: "primary", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
        . Please review it to understand how we collect and use your information.
      </p>
    </LegalSection>

    <LegalSection heading="12. Governing Law">
      <p>
        These Terms of Service shall be governed by and construed in accordance with the laws of the United States,
        without regard to conflict of law provisions.
      </p>
    </LegalSection>

    <LegalSection heading="13. Contact Information">
      <p>
        If you have any questions about these Terms of Service, please contact us at:{" "}
        <a href="mailto:hello@joshwentworth.com" sx={{ color: "primary", textDecoration: "underline" }}>
          hello@joshwentworth.com
        </a>
      </p>
    </LegalSection>
  </LegalPage>
)

export default TermsPage

// Rendered through the Head API, not in the page body: inside the body its <script> and <meta>
// tags break React hydration.
export const Head = () => (
  <Seo
    title="Terms of Service"
    description="Terms of service for Josh Wentworth's portfolio website"
    pathname="/terms"
  />
)
