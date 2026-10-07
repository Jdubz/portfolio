/** @jsx jsx */
/* eslint-disable react/no-unescaped-entities */
import { jsx } from "theme-ui"
import { LegalPage, LegalSection } from "../components/LegalPage"
import Seo from "../components/homepage/Seo"

// A literal, not `new Date()`: the date must not change on every build or differ between the
// server-rendered HTML and the browser.
const LAST_UPDATED = "October 6, 2026"

const PrivacyPage = () => (
  <LegalPage title="Privacy Policy" lastUpdated={LAST_UPDATED}>
    <LegalSection heading="1. Introduction">
      <p>
        This Privacy Policy describes how joshwentworth.com ("we", "us", or "our") collects, uses, and protects your
        personal information when you visit our website or contact us by email.
      </p>
    </LegalSection>

    <LegalSection heading="2. Information We Collect">
      <p sx={{ mb: 2 }}>
        This website has no contact form or user accounts and sets no cookies. It records anonymous, aggregate usage
        statistics through Cloudflare Web Analytics (see section 6). If you email us, we receive:
      </p>
      <ul>
        <li>Your email address and the name your email client sends</li>
        <li>The message content you provide</li>
      </ul>
    </LegalSection>

    <LegalSection heading="3. How We Use Your Information">
      <p sx={{ mb: 2 }}>We use the information you provide to:</p>
      <ul>
        <li>Respond to your inquiries and messages</li>
        <li>Maintain records of our communications</li>
        <li>Improve our website and services</li>
      </ul>
    </LegalSection>

    <LegalSection heading="4. Data Storage and Security">
      <p sx={{ mb: 2 }}>
        Emails you send us are held by our email provider. The website does not keep a database of visitors or messages.
      </p>
      <p sx={{ mt: 3 }}>
        We retain the emails for as long as necessary to respond to your inquiry and maintain business records. You may
        request deletion of your data at any time.
      </p>
    </LegalSection>

    <LegalSection heading="5. Third-Party Services">
      <p sx={{ mb: 2 }}>We use the following third-party services:</p>
      <ul>
        <li>
          <strong>Firebase Hosting (Google):</strong> For website hosting
        </li>
        <li>
          <strong>Cloudflare:</strong> For content delivery, DNS and cookie-free web analytics
        </li>
        <li>
          <strong>Bunny Fonts:</strong> For web fonts
        </li>
        <li>
          <strong>Google Cloud Storage:</strong> For the audio files on the recordings page
        </li>
      </ul>
      <p sx={{ mt: 3 }}>These services have their own privacy policies and we encourage you to review them.</p>
    </LegalSection>

    <LegalSection heading="6. Cookies and Analytics">
      <p>
        This website does not use cookies. It uses Cloudflare Web Analytics to measure aggregate traffic and page
        performance. That service records page views, the referring page, page load timings, and general browser, device
        and country information. According to Cloudflare, it does not use cookies or local storage and does not
        fingerprint visitors, and we do not use it to identify individuals or track them across other sites.
      </p>
    </LegalSection>

    <LegalSection heading="7. Your Rights">
      <p sx={{ mb: 2 }}>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Object to processing of your information</li>
        <li>Withdraw consent at any time</li>
      </ul>
    </LegalSection>

    <LegalSection heading="8. Children's Privacy">
      <p>
        This website is not intended for children under 13 years of age. We do not knowingly collect personal
        information from children.
      </p>
    </LegalSection>

    <LegalSection heading="9. Changes to This Policy">
      <p>
        We may update this Privacy Policy from time to time. The updated version will be indicated by the "Last updated"
        date at the top of this page.
      </p>
    </LegalSection>

    <LegalSection heading="10. Contact Us">
      <p>
        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:{" "}
        <a href="mailto:hello@joshwentworth.com" sx={{ color: "primary", textDecoration: "underline" }}>
          hello@joshwentworth.com
        </a>
      </p>
    </LegalSection>
  </LegalPage>
)

export default PrivacyPage

// Rendered through the Head API, not in the page body: inside the body its <script> and <meta>
// tags break React hydration.
export const Head = () => (
  <Seo title="Privacy Policy" description="Privacy policy for Josh Wentworth's portfolio website" pathname="/privacy" />
)
