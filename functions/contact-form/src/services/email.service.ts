import nodemailer from "nodemailer"
import { SecretManagerService } from "./secret-manager.service"

type SimpleLogger = {
  info: (message: string, data?: any) => void
  warning: (message: string, data?: any) => void
  error: (message: string, data?: any) => void
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
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  fromEmail?: string
  toEmail?: string
  replyToEmail?: string
}

export class EmailService {
  private logger: SimpleLogger
  private secretManager: SecretManagerService
  private transporter: nodemailer.Transporter | null = null

  constructor(secretManager: SecretManagerService, logger?: SimpleLogger) {
    this.secretManager = secretManager

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

    this.logger = logger || {
      info: (message: string, data?: any) => {
        if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
      },
      warning: (message: string, data?: any) => {
        if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
      },
      error: (message: string, data?: any) => {
        if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
      },
    }
  }

  /**
   * Initialize the email transporter with configuration
   */
  private async initializeTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter
    }

    try {
      const config = await this.getEmailConfig()

      // For local development, use Ethereal test account
      if (this.secretManager.isLocalDevelopment()) {
        const testAccount = await nodemailer.createTestAccount()

        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })

        this.logger.info("Using Ethereal test account for local development", {
          user: testAccount.user,
        })
      } else {
        // Production/staging configuration
        this.transporter = nodemailer.createTransport({
          host: config.smtpHost,
          port: config.smtpPort || 587,
          secure: config.smtpPort === 465,
          auth: {
            user: config.smtpUser,
            pass: config.smtpPassword,
          },
        })
      }

      // Verify connection
      if (this.transporter) {
        await this.transporter.verify()
        this.logger.info("Email transporter initialized successfully")
        return this.transporter
      }
      throw new Error("Failed to create transporter")
    } catch (error) {
      this.logger.error("Failed to initialize email transporter", { error })
      throw new Error("Email service configuration failed")
    }
  }

  /**
   * Get email configuration from secrets or environment
   */
  private async getEmailConfig(): Promise<EmailConfig> {
    if (this.secretManager.isLocalDevelopment()) {
      return {
        fromEmail: process.env.FROM_EMAIL || "noreply@localhost",
        toEmail: process.env.TO_EMAIL || "test@localhost",
        replyToEmail: process.env.REPLY_TO_EMAIL || "hello@localhost",
      }
    }

    try {
      const secrets = await this.secretManager.getSecrets([
        "smtp-host",
        "smtp-user",
        "smtp-password",
        "from-email",
        "to-email",
        "reply-to-email",
      ])

      return {
        smtpHost: secrets["smtp-host"],
        smtpUser: secrets["smtp-user"],
        smtpPassword: secrets["smtp-password"],
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
   */
  async sendContactFormNotification(data: ContactFormNotificationData): Promise<void> {
    try {
      const transporter = await this.initializeTransporter()
      const config = await this.getEmailConfig()

      const mailOptions = {
        from: config.fromEmail,
        to: config.toEmail,
        replyTo: data.email,
        subject: `New Contact Form Submission from ${data.name}`,
        html: this.generateNotificationHtml(data),
        text: this.generateNotificationText(data),
        headers: {
          "X-Request-ID": data.requestId,
        },
      }

      const info = await transporter.sendMail(mailOptions)

      this.logger.info("Contact form notification sent", {
        requestId: data.requestId,
        messageId: info.messageId,
        from: data.email,
        name: data.name,
      })

      // Log preview URL for development
      if (this.secretManager.isLocalDevelopment()) {
        this.logger.info("Preview URL", {
          url: nodemailer.getTestMessageUrl(info),
        })
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
   */
  async sendAutoReply(data: AutoReplyData): Promise<void> {
    try {
      const transporter = await this.initializeTransporter()
      const config = await this.getEmailConfig()

      const mailOptions = {
        from: config.fromEmail,
        to: data.email,
        replyTo: config.replyToEmail,
        subject: "Thank you for your message!",
        html: this.generateAutoReplyHtml(data),
        text: this.generateAutoReplyText(data),
        headers: {
          "X-Request-ID": data.requestId,
        },
      }

      const info = await transporter.sendMail(mailOptions)

      this.logger.info("Auto-reply sent", {
        requestId: data.requestId,
        messageId: info.messageId,
        to: data.email,
      })
    } catch (error) {
      this.logger.warning("Failed to send auto-reply email", {
        error,
        requestId: data.requestId,
        email: data.email,
      })
      // Don't throw for auto-reply failures - they're not critical
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
              <li>Check out my <a href="https://joshwentworth.com">portfolio projects</a></li>
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

In the meantime, feel free to check out my portfolio at https://joshwentworth.com or connect with me on LinkedIn.

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
