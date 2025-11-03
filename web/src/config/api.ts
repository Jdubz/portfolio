/**
 * API Configuration
 *
 * Configuration for the contact form Cloud Function endpoint.
 */

/**
 * Get the contact form API URL based on environment
 *
 * @returns URL for the contact form endpoint
 */
export const getContactFormUrl = (): string => {
  // Use environment variable if available (set at build time)
  return (
    process.env.GATSBY_CONTACT_FUNCTION_URL ?? "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form"
  )
}
