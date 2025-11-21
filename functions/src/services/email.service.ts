import Mailgun from "mailgun.js"
import formData from "form-data"
import { SecretManagerService } from "./secret-manager.service"
import { createDefaultLogger } from "../utils/logger"
import type { SimpleLogger } from "../types/logger.types"

export interface ContactNotificationData {
  name: string
  email: string
  message: string
}

export interface EmailConfig {
  mailgunApiKey: string
  mailgunDomain: string
  fromEmail: string
  toEmail: string
}

export class EmailService {
  private logger: SimpleLogger
  private secretManager: SecretManagerService
  private mailgunClient: ReturnType<Mailgun["client"]> | null = null

  constructor(secretManager: SecretManagerService, logger?: SimpleLogger) {
    this.secretManager = secretManager
    this.logger = logger || createDefaultLogger()
  }

  /**
   * Initialize the Mailgun client with configuration
   */
  private async initializeMailgun(): Promise<ReturnType<Mailgun["client"]>> {
    if (this.mailgunClient) {
      return this.mailgunClient
    }

    try {
      const config = await this.getEmailConfig()
      const mailgun = new Mailgun(formData)

      this.mailgunClient = mailgun.client({
        username: "api",
        key: config.mailgunApiKey,
      })

      this.logger.info("Mailgun client initialized successfully")
      return this.mailgunClient
    } catch (error) {
      this.logger.error("Failed to initialize Mailgun client", { error })
      throw new Error("Email service configuration failed")
    }
  }

  /**
   * Get email configuration from secrets or environment
   */
  private async getEmailConfig(): Promise<EmailConfig> {
    if (this.secretManager.isLocalDevelopment()) {
      const apiKey = process.env.MAILGUN_API_KEY
      if (!apiKey) {
        throw new Error("MAILGUN_API_KEY environment variable is required for local development")
      }

      return {
        mailgunApiKey: apiKey,
        mailgunDomain: process.env.MAILGUN_DOMAIN ?? "joshwentworth.com",
        fromEmail: process.env.FROM_EMAIL ?? "noreply@joshwentworth.com",
        toEmail: process.env.TO_EMAIL ?? "contact@joshwentworth.com",
      }
    }

    try {
      const secrets = await this.secretManager.getSecrets(["mailgun-api-key", "mailgun-domain", "from-email", "to-email"])

      return {
        mailgunApiKey: secrets["mailgun-api-key"],
        mailgunDomain: secrets["mailgun-domain"],
        fromEmail: secrets["from-email"],
        toEmail: secrets["to-email"],
      }
    } catch (error) {
      this.logger.error("Failed to get email configuration", { error })
      throw new Error("Email configuration not available")
    }
  }

  /**
   * Send contact form notification email
   */
  async sendContactNotification(data: ContactNotificationData): Promise<void> {
    try {
      const client = await this.initializeMailgun()
      const config = await this.getEmailConfig()

      const messageData = {
        from: config.fromEmail,
        to: config.toEmail,
        "h:Reply-To": data.email,
        subject: `New Contact Form: ${data.name}`,
        text: this.generateEmailText(data),
        html: this.generateEmailHtml(data),
      }

      const result = await client.messages.create(config.mailgunDomain, messageData)

      this.logger.info("Contact notification sent", {
        messageId: result.id,
        from: data.email,
        name: data.name,
      })
    } catch (error) {
      this.logger.error("Failed to send notification email", { error })
      throw error
    }
  }

  /**
   * Generate plain text email
   */
  private generateEmailText(data: ContactNotificationData): string {
    return `
New Contact Form Submission

From: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
Reply directly to this email to respond to ${data.name}.
    `.trim()
  }

  /**
   * Generate HTML email
   */
  private generateEmailHtml(data: ContactNotificationData): string {
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
    <p style="margin: 10px 0;"><strong>From:</strong> ${this.escapeHtml(data.name)}</p>
    <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${this.escapeHtml(data.email)}" style="color: #3498db; text-decoration: none;">${this.escapeHtml(data.email)}</a></p>
  </div>

  <div style="background-color: #fff; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
    <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
    <p style="margin: 0; white-space: pre-wrap;">${this.escapeHtml(data.message)}</p>
  </div>

  <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
    <em>Reply directly to this email to respond to ${this.escapeHtml(data.name)}.</em>
  </p>
</body>
</html>
    `.trim()
  }

  /**
   * Escape HTML to prevent XSS in email templates
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (char) => map[char])
  }
}
