/**
 * PDF Service
 *
 * Handles PDF generation using Puppeteer and Handlebars templates.
 */

import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import Handlebars from "handlebars"
import type { TemplateDelegate as HandlebarsTemplateDelegate } from "handlebars"
import * as fs from "fs/promises"
import * as path from "path"
import type { ResumeContent, CoverLetterContent } from "../types/generator.types"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export class PDFService {
  private logger: SimpleLogger
  private resumeTemplate?: HandlebarsTemplateDelegate
  private coverLetterTemplate?: HandlebarsTemplateDelegate

  constructor(logger?: SimpleLogger) {
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
   * Generate a resume PDF from ResumeContent
   */
  async generateResumePDF(
    content: ResumeContent,
    style: string = "modern",
    accentColor: string = "#3B82F6"
  ): Promise<Buffer> {
    try {
      this.logger.info("Generating resume PDF", { style, accentColor })

      // Load and compile template if not already loaded
      if (!this.resumeTemplate) {
        const templatePath = path.join(__dirname, "..", "templates", `resume-${style}.hbs`)
        const templateSource = await fs.readFile(templatePath, "utf-8")
        this.resumeTemplate = Handlebars.compile(templateSource)
      }

      // Render HTML from template
      const html = this.resumeTemplate({
        ...content,
        accentColor,
      })

      // Generate PDF using Puppeteer
      const pdf = await this.htmlToPDF(html)

      this.logger.info("Resume PDF generated successfully", {
        size: pdf.length,
      })

      return pdf
    } catch (error) {
      this.logger.error("Failed to generate resume PDF", { error })
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate a cover letter PDF from CoverLetterContent
   */
  async generateCoverLetterPDF(
    content: CoverLetterContent,
    name: string,
    email: string,
    accentColor: string = "#3B82F6"
  ): Promise<Buffer> {
    try {
      this.logger.info("Generating cover letter PDF")

      // Load and compile template if not already loaded
      if (!this.coverLetterTemplate) {
        const templatePath = path.join(__dirname, "..", "templates", "cover-letter.hbs")
        const templateSource = await fs.readFile(templatePath, "utf-8")
        this.coverLetterTemplate = Handlebars.compile(templateSource)
      }

      // Format current date
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      // Render HTML from template
      const html = this.coverLetterTemplate({
        ...content,
        name,
        email,
        date,
        accentColor,
      })

      // Generate PDF using Puppeteer
      const pdf = await this.htmlToPDF(html)

      this.logger.info("Cover letter PDF generated successfully", {
        size: pdf.length,
      })

      return pdf
    } catch (error) {
      this.logger.error("Failed to generate cover letter PDF", { error })
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Convert HTML to PDF using Puppeteer
   */
  private async htmlToPDF(html: string): Promise<Buffer> {
    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

    try {
      // Detect if running locally or in Cloud Functions
      const isLocal = process.env.FUNCTIONS_EMULATOR === "true" || process.env.NODE_ENV === "development"

      this.logger.info("Launching Puppeteer", { isLocal })

      if (isLocal) {
        // Local development - use system Chrome/Chromium
        browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
      } else {
        // Cloud Functions - use @sparticuz/chromium
        browser = await puppeteer.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        })
      }

      const page = await browser.newPage()

      // Set content and wait for fonts/styles to load
      await page.setContent(html, {
        waitUntil: "networkidle0",
      })

      // Generate PDF
      const pdf = await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
      })

      this.logger.info("PDF generated successfully via Puppeteer")

      return Buffer.from(pdf)
    } catch (error) {
      this.logger.error("Puppeteer PDF generation failed", { error })
      throw error
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }
}
