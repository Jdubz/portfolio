import Mailgun from "mailgun.js"
import formData from "form-data"

export interface ContactNotification {
  name: string
  email: string
  message: string
}

// Mounted from Secret Manager at deploy time; set in functions/.env for local development
const REQUIRED_ENV = ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "FROM_EMAIL", "TO_EMAIL"] as const

type EmailConfig = Record<(typeof REQUIRED_ENV)[number], string>

function getEmailConfig(): EmailConfig {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(", ")}`)
  }
  return Object.fromEntries(REQUIRED_ENV.map((key) => [key, process.env[key]])) as EmailConfig
}

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] as string
  )

const emailText = ({ name, email, message }: ContactNotification): string =>
  `
New Contact Form Submission

From: ${name}
Email: ${email}

Message:
${message}

---
Reply directly to this email to respond to ${name}.
  `.trim()

const emailHtml = (data: ContactNotification): string => {
  const name = escapeHtml(data.name)
  const email = escapeHtml(data.email)
  const message = escapeHtml(data.message)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Contact Form Submission</h2>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 10px 0;"><strong>From:</strong> ${name}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a></p>
  </div>

  <div style="background-color: #fff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
  </div>

  <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
    <em>Reply directly to this email to respond to ${name}.</em>
  </p>
</body>
</html>
  `.trim()
}

/**
 * Email the contact form submission to the site owner.
 * @returns the Mailgun message id
 */
export async function sendContactNotification(data: ContactNotification): Promise<string | undefined> {
  const config = getEmailConfig()
  const client = new Mailgun(formData).client({ username: "api", key: config.MAILGUN_API_KEY })

  const result = await client.messages.create(config.MAILGUN_DOMAIN, {
    from: config.FROM_EMAIL,
    to: config.TO_EMAIL,
    "h:Reply-To": data.email,
    subject: `New Contact Form: ${data.name}`,
    text: emailText(data),
    html: emailHtml(data),
  })

  return result.id
}
