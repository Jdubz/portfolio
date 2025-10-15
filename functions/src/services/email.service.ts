import Mailgun from "mailgun.js"
import formData from "form-data"
import { SecretManagerService } from "./secret-manager.service"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export interface ContactFormNotificationData {
  name: string
  email: string
  message: string
  metadata: {
    ip?: string
    userAgent?: string
    timestamp: string
    referrer?: string
  }
  requestId: string
}

export interface AutoReplyData {
  name: string
  email: string
  requestId: string
}

export interface EmailConfig {
  mailgunApiKey: string
  mailgunDomain: string
  mailgunRegion?: "us" | "eu" // Default: us
  fromEmail: string
  toEmail: string
  replyToEmail: string
}

export class EmailService {
  private logger: SimpleLogger
  private secretManager: SecretManagerService
  private mailgunClient: ReturnType<Mailgun["client"]> | null = null

  constructor(secretManager: SecretManagerService, logger?: SimpleLogger) {
    this.secretManager = secretManager

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

    this.logger = logger || {
      info: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
      },
      warning: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
      },
      error: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
      },
    }
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

      // Configure client with region support
      const clientConfig: { username: string; key: string; url?: string } = {
        username: "api",
        key: config.mailgunApiKey,
      }

      // Set EU endpoint if specified
      if (config.mailgunRegion === "eu") {
        clientConfig.url = "https://api.eu.mailgun.net"
      }

      this.mailgunClient = mailgun.client(clientConfig)

      this.logger.info("Mailgun client initialized successfully", {
        region: config.mailgunRegion || "us",
        domain: config.mailgunDomain,
      })
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
      // Validate required environment variables
      const apiKey = process.env.MAILGUN_API_KEY
      if (!apiKey) {
        throw new Error("MAILGUN_API_KEY environment variable is required for local development")
      }

      return {
        mailgunApiKey: apiKey,
        mailgunDomain: process.env.MAILGUN_DOMAIN ?? "joshwentworth.com",
        mailgunRegion: (process.env.MAILGUN_REGION as "us" | "eu") ?? "us",
        fromEmail: process.env.FROM_EMAIL ?? "noreply@joshwentworth.com",
        toEmail: process.env.TO_EMAIL ?? "contact-form@joshwentworth.com",
        replyToEmail: process.env.REPLY_TO_EMAIL ?? "hello@joshwentworth.com",
      }
    }

    try {
      const secrets = await this.secretManager.getSecrets([
        "mailgun-api-key",
        "mailgun-domain",
        "from-email",
        "to-email",
        "reply-to-email",
      ])

      return {
        mailgunApiKey: secrets["mailgun-api-key"],
        mailgunDomain: secrets["mailgun-domain"],
        mailgunRegion: "us", // US region by default
        fromEmail: secrets["from-email"],
        toEmail: secrets["to-email"],
        replyToEmail: secrets["reply-to-email"],
      }
    } catch (error) {
      this.logger.error("Failed to get email configuration", { error })
      throw new Error("Email configuration not available")
    }
  }

  /**
   * Send contact form notification email
   * Returns Mailgun response for storage in Firestore
   */
  async sendContactFormNotification(data: ContactFormNotificationData): Promise<{
    messageId: string
    status?: string
    accepted: boolean
  }> {
    try {
      const client = await this.initializeMailgun()
      const config = await this.getEmailConfig()

      const messageData = {
        from: config.fromEmail,
        to: config.toEmail,
        "h:Reply-To": data.email,
        subject: `New Contact Form Submission from ${data.name}`,
        html: this.generateNotificationHtml(data),
        text: this.generateNotificationText(data),
        "h:X-Request-ID": data.requestId,
      }

      const result = await client.messages.create(config.mailgunDomain, messageData)

      this.logger.info("Contact form notification accepted by Mailgun", {
        requestId: data.requestId,
        mailgunMessageId: result.id,
        mailgunStatus: result.status,
        from: data.email,
        to: config.toEmail,
        name: data.name,
        note: "Email accepted by Mailgun - check Mailgun logs for final delivery status",
      })

      return {
        messageId: result.id || "unknown",
        status: result.status ? String(result.status) : undefined,
        accepted: true,
      }
    } catch (error) {
      this.logger.error("Failed to send notification email", {
        error,
        requestId: data.requestId,
      })
      throw error
    }
  }

  /**
   * Send auto-reply email to the user
   * Returns Mailgun response for storage in Firestore
   */
  async sendAutoReply(data: AutoReplyData): Promise<{
    messageId: string
    status?: string
    accepted: boolean
  }> {
    try {
      const client = await this.initializeMailgun()
      const config = await this.getEmailConfig()

      const messageData = {
        from: config.fromEmail,
        to: data.email,
        "h:Reply-To": config.replyToEmail,
        subject: "Thank you for your message!",
        html: this.generateAutoReplyHtml(data),
        text: this.generateAutoReplyText(data),
        "h:X-Request-ID": data.requestId,
      }

      const result = await client.messages.create(config.mailgunDomain, messageData)

      this.logger.info("Auto-reply sent", {
        requestId: data.requestId,
        messageId: result.id,
        to: data.email,
      })

      return {
        messageId: result.id || "unknown",
        status: result.status ? String(result.status) : undefined,
        accepted: true,
      }
    } catch (error) {
      this.logger.warning("Failed to send auto-reply email", {
        error,
        requestId: data.requestId,
        email: data.email,
      })
      throw error
    }
  }

  /**
   * Generate HTML email template for notification
   */
  private generateNotificationHtml(data: ContactFormNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0EA5E9; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #555; }
          .value { background: white; padding: 10px; border-left: 3px solid #0EA5E9; }
          .metadata { background: #e9ecef; padding: 15px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${this.escapeHtml(data.name)}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${this.escapeHtml(data.email)}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${this.escapeHtml(data.message).replace(/\n/g, "<br>")}</div>
            </div>
            <div class="metadata">
              <strong>Request Details:</strong><br>
              Request ID: ${data.requestId}<br>
              Timestamp: ${data.metadata.timestamp}<br>
              ${data.metadata.ip ? `IP Address: ${data.metadata.ip}<br>` : ""}
              ${data.metadata.userAgent ? `User Agent: ${this.escapeHtml(data.metadata.userAgent)}<br>` : ""}
              ${data.metadata.referrer ? `Referrer: ${this.escapeHtml(data.metadata.referrer)}<br>` : ""}
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text email for notification
   */
  private generateNotificationText(data: ContactFormNotificationData): string {
    return `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}

Message:
${data.message}

---
Request ID: ${data.requestId}
Timestamp: ${data.metadata.timestamp}
${data.metadata.ip ? `IP Address: ${data.metadata.ip}` : ""}
${data.metadata.userAgent ? `User Agent: ${data.metadata.userAgent}` : ""}
${data.metadata.referrer ? `Referrer: ${data.metadata.referrer}` : ""}
    `.trim()
  }

  /**
   * Generate HTML auto-reply template
   */
  private generateAutoReplyHtml(data: AutoReplyData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for your message!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0EA5E9; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you, ${this.escapeHtml(data.name)}!</h1>
          </div>
          <div class="content">
            <p>I've received your message and will get back to you as soon as possible.</p>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Check out my <a href="https://www.joshwentworth.com">portfolio projects</a></li>
              <li>Connect with me on <a href="https://linkedin.com/in/joshwentworth">LinkedIn</a></li>
              <li>Follow my work on <a href="https://github.com/jdubz">GitHub</a></li>
            </ul>
            <p>Best regards,<br>Josh Wentworth</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate plain text auto-reply
   */
  private generateAutoReplyText(data: AutoReplyData): string {
    return `
Hi ${data.name},

Thank you for your message! I've received it and will get back to you as soon as possible.

In the meantime, feel free to check out my portfolio at https://www.joshwentworth.com or connect with me on LinkedIn.

Best regards,
Josh Wentworth
    `.trim()
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }
}
