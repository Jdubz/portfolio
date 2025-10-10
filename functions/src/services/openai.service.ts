/**
 * OpenAI Service
 *
 * Handles all OpenAI API interactions for resume and cover letter generation.
 * Uses structured outputs for consistent, type-safe responses.
 */

import OpenAI from "openai"
import type { ResumeContent, CoverLetterContent } from "../types/generator.types"
import type { ExperienceEntry } from "./experience.service"
import type { BlurbEntry } from "./blurb.service"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

interface GenerateResumeOptions {
  personalInfo: {
    name: string
    email: string
    phone?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
  }
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescription?: string
  }
  experienceEntries: ExperienceEntry[]
  experienceBlurbs: BlurbEntry[]
  style?: string
  emphasize?: string[]
}

interface GenerateCoverLetterOptions {
  personalInfo: {
    name: string
    email: string
  }
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescription?: string
  }
  experienceEntries: ExperienceEntry[]
  experienceBlurbs: BlurbEntry[]
}

interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ResumeGenerationResult {
  content: ResumeContent
  tokenUsage: TokenUsage
  model: string
}

export interface CoverLetterGenerationResult {
  content: CoverLetterContent
  tokenUsage: TokenUsage
  model: string
}

export class OpenAIService {
  private client: OpenAI
  private logger: SimpleLogger
  private model = "gpt-4o-2024-08-06" // Supports structured outputs

  constructor(apiKey: string, logger?: SimpleLogger) {
    this.client = new OpenAI({
      apiKey,
    })

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
   * Generate a resume using OpenAI structured outputs
   */
  async generateResume(options: GenerateResumeOptions): Promise<ResumeGenerationResult> {
    try {
      const systemPrompt = this.buildResumeSystemPrompt()
      const userPrompt = this.buildResumeUserPrompt(options)

      this.logger.info("Generating resume with OpenAI", {
        model: this.model,
        role: options.job.role,
        company: options.job.company,
        style: options.style || "modern",
      })

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower for consistency
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "resume_content",
            strict: true,
            schema: this.getResumeSchema(),
          },
        },
      })

      const content = JSON.parse(completion.choices[0].message.content!) as ResumeContent

      const tokenUsage = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }

      this.logger.info("Resume generated successfully", {
        model: completion.model,
        tokenUsage,
      })

      return {
        content,
        tokenUsage,
        model: completion.model,
      }
    } catch (error) {
      this.logger.error("Failed to generate resume", { error })
      throw new Error(`OpenAI resume generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate a cover letter using OpenAI structured outputs
   */
  async generateCoverLetter(options: GenerateCoverLetterOptions): Promise<CoverLetterGenerationResult> {
    try {
      const systemPrompt = this.buildCoverLetterSystemPrompt()
      const userPrompt = this.buildCoverLetterUserPrompt(options)

      this.logger.info("Generating cover letter with OpenAI", {
        model: this.model,
        role: options.job.role,
        company: options.job.company,
      })

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cover_letter_content",
            strict: true,
            schema: this.getCoverLetterSchema(),
          },
        },
      })

      const content = JSON.parse(completion.choices[0].message.content!) as CoverLetterContent

      const tokenUsage = {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }

      this.logger.info("Cover letter generated successfully", {
        model: completion.model,
        tokenUsage,
      })

      return {
        content,
        tokenUsage,
        model: completion.model,
      }
    } catch (error) {
      this.logger.error("Failed to generate cover letter", { error })
      throw new Error(
        `OpenAI cover letter generation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Build system prompt for resume generation
   */
  private buildResumeSystemPrompt(): string {
    return `You are an expert resume writer with 20+ years of experience helping software engineers land positions at top tech companies.

You specialize in ATS-friendly resumes that highlight technical accomplishments with quantifiable impact. You tailor each resume to the specific role and company, emphasizing relevant experience and skills.

Key principles:
- Use action verbs and quantify achievements where possible
- Focus on impact and results, not just responsibilities
- Tailor content to match the job description
- Keep it concise and scannable (target 1 page)
- Ensure ATS compatibility (avoid complex formatting in content)
- Highlight relevant technologies and skills for the role`
  }

  /**
   * Build user prompt for resume generation
   */
  private buildResumeUserPrompt(options: GenerateResumeOptions): string {
    const style = options.style || "modern"

    // Format experience data
    const experienceData = options.experienceEntries
      .map((entry) => {
        const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
        return `
Title: ${entry.title}
${entry.role ? `Role: ${entry.role}` : ""}
${entry.location ? `Location: ${entry.location}` : ""}
Start Date: ${entry.startDate}
End Date: ${entry.endDate || "Present"}
${entry.body ? `Description: ${entry.body}` : ""}
${blurb ? `Highlights:\n${blurb.content}` : ""}
${entry.notes ? `Notes: ${entry.notes}` : ""}
`.trim()
      })
      .join("\n\n---\n\n")

    return `Create a ${style} resume for the "${options.job.role}" position at ${options.job.company}.

PERSONAL INFORMATION:
- Name: ${options.personalInfo.name}
- Email: ${options.personalInfo.email}
${options.personalInfo.phone ? `- Phone: ${options.personalInfo.phone}` : ""}
${options.personalInfo.location ? `- Location: ${options.personalInfo.location}` : ""}
${options.personalInfo.website ? `- Website: ${options.personalInfo.website}` : ""}
${options.personalInfo.linkedin ? `- LinkedIn: ${options.personalInfo.linkedin}` : ""}
${options.personalInfo.github ? `- GitHub: ${options.personalInfo.github}` : ""}

JOB DETAILS:
- Company: ${options.job.company}
- Role: ${options.job.role}
${options.job.companyWebsite ? `- Company Website: ${options.job.companyWebsite}` : ""}
${options.job.jobDescription ? `- Job Description:\n${options.job.jobDescription}` : ""}

EXPERIENCE DATA:
${experienceData}

REQUIREMENTS:
- Create a compelling professional summary that positions the candidate for this specific role
- Select and order the most relevant experience entries for this job
- Rewrite experience highlights to emphasize skills/technologies mentioned in the job description
- Use strong action verbs and quantify achievements where possible
${options.emphasize ? `- Emphasize these keywords: ${options.emphasize.join(", ")}` : ""}
- Target length: Concise, scannable content (roughly 1 page when formatted)
- Focus on recent and relevant experience
- Extract or infer appropriate skills and categorize them
- Include education if relevant (can infer from experience if not explicitly provided)

Generate a complete, ATS-friendly resume optimized for this specific role.`
  }

  /**
   * Build system prompt for cover letter generation
   */
  private buildCoverLetterSystemPrompt(): string {
    return `You are an expert cover letter writer specializing in helping software engineers craft compelling, personalized cover letters.

Your letters are:
- Concise (3-4 paragraphs maximum)
- Professional but warm in tone
- Focused on relevant accomplishments and fit for the specific role
- Free of clichés and generic phrases
- Authentic and conversational

You highlight the candidate's most relevant accomplishments and explain why they're a great fit for the specific role and company.`
  }

  /**
   * Build user prompt for cover letter generation
   */
  private buildCoverLetterUserPrompt(options: GenerateCoverLetterOptions): string {
    // Format experience data (simplified for cover letter)
    const experienceData = options.experienceEntries
      .map((entry) => {
        const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
        return `${entry.title}${entry.role ? ` - ${entry.role}` : ""} (${entry.startDate} - ${entry.endDate || "Present"})
${blurb ? blurb.content : entry.body || ""}`
      })
      .join("\n\n")

    return `Create a professional cover letter for the "${options.job.role}" position at ${options.job.company}.

CANDIDATE INFORMATION:
- Name: ${options.personalInfo.name}
- Email: ${options.personalInfo.email}

JOB DETAILS:
- Company: ${options.job.company}
- Role: ${options.job.role}
${options.job.companyWebsite ? `- Company Website: ${options.job.companyWebsite}` : ""}
${options.job.jobDescription ? `- Job Description:\n${options.job.jobDescription}` : ""}

CANDIDATE EXPERIENCE:
${experienceData}

REQUIREMENTS:
- 3-4 paragraphs maximum
- Professional but warm tone
- Highlight 2-3 most relevant accomplishments from experience
- Show knowledge of the company (if website/description provided)
- Explain why the candidate is a great fit for this specific role
- Include a clear call to action
- Use the candidate's name in the signature
- Address to "Hiring Manager" unless a specific name is provided in the job description

Generate a compelling cover letter that showcases the candidate's qualifications for this specific role.`
  }

  /**
   * Get JSON schema for resume structured output
   */
  private getResumeSchema(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        personalInfo: {
          type: "object",
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            contact: {
              type: "object",
              properties: {
                email: { type: "string" },
                location: { type: "string" },
                website: { type: "string" },
                linkedin: { type: "string" },
                github: { type: "string" },
              },
              required: ["email"],
              additionalProperties: false,
            },
          },
          required: ["name", "title", "summary", "contact"],
          additionalProperties: false,
        },
        professionalSummary: { type: "string" },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              role: { type: "string" },
              location: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: ["string", "null"] },
              highlights: {
                type: "array",
                items: { type: "string" },
              },
              technologies: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["company", "role", "startDate", "endDate", "highlights"],
            additionalProperties: false,
          },
        },
        skills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              items: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["category", "items"],
            additionalProperties: false,
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              institution: { type: "string" },
              degree: { type: "string" },
              field: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
            },
            required: ["institution", "degree"],
            additionalProperties: false,
          },
        },
      },
      required: ["personalInfo", "professionalSummary", "experience"],
      additionalProperties: false,
    }
  }

  /**
   * Get JSON schema for cover letter structured output
   */
  private getCoverLetterSchema(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        greeting: { type: "string" },
        openingParagraph: { type: "string" },
        bodyParagraphs: {
          type: "array",
          items: { type: "string" },
        },
        closingParagraph: { type: "string" },
        signature: { type: "string" },
      },
      required: ["greeting", "openingParagraph", "bodyParagraphs", "closingParagraph", "signature"],
      additionalProperties: false,
    }
  }

  /**
   * Calculate cost in USD from token usage
   * Based on GPT-4o pricing: $2.50/1M input tokens, $10.00/1M output tokens
   */
  static calculateCost(tokenUsage: TokenUsage): number {
    const inputCostPer1M = 2.5
    const outputCostPer1M = 10.0

    const inputCost = (tokenUsage.promptTokens / 1_000_000) * inputCostPer1M
    const outputCost = (tokenUsage.completionTokens / 1_000_000) * outputCostPer1M

    return inputCost + outputCost
  }
}
