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
  private useMockMode: boolean

  constructor(apiKey: string, logger?: SimpleLogger) {
    this.client = new OpenAI({
      apiKey,
    })

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined
    this.useMockMode = process.env.OPENAI_MOCK_MODE === "true"

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

    if (this.useMockMode) {
      this.logger.warning("⚠️  OpenAI MOCK MODE ENABLED - Using mock responses instead of real API calls")
    }
  }

  /**
   * Generate a resume using OpenAI structured outputs
   */
  async generateResume(options: GenerateResumeOptions): Promise<ResumeGenerationResult> {
    try {
      // Return mock response if mock mode is enabled
      if (this.useMockMode) {
        return this.generateMockResume(options)
      }

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
      // Return mock response if mock mode is enabled
      if (this.useMockMode) {
        return this.generateMockCoverLetter(options)
      }

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
              required: ["email", "location", "website", "linkedin", "github"],
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
            required: ["company", "role", "location", "startDate", "endDate", "highlights", "technologies"],
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
            required: ["institution", "degree", "field", "startDate", "endDate"],
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
   * Generate a mock resume for local development
   * This avoids hitting OpenAI API quota limits during testing
   */
  private generateMockResume(options: GenerateResumeOptions): ResumeGenerationResult {
    this.logger.info("🎭 Generating MOCK resume (no API call)", {
      role: options.job.role,
      company: options.job.company,
    })

    const mockContent: ResumeContent = {
      personalInfo: {
        name: options.personalInfo.name,
        title: `${options.job.role}`,
        summary: `Experienced software engineer with a proven track record of building scalable systems and leading technical initiatives. Passionate about ${options.job.role.toLowerCase()} work and delivering high-impact solutions.`,
        contact: {
          email: options.personalInfo.email,
          location: options.personalInfo.location || "San Francisco, CA",
          website: options.personalInfo.website || "",
          linkedin: options.personalInfo.linkedin || "",
          github: options.personalInfo.github || "",
        },
      },
      professionalSummary: `Highly skilled ${options.job.role} with extensive experience in software development, system architecture, and technical leadership. Proven ability to deliver complex projects on time while maintaining high code quality standards. Strong background in full-stack development with expertise in modern web technologies.`,
      experience: options.experienceEntries.slice(0, 3).map((entry) => ({
        company: entry.title,
        role: entry.role || options.job.role,
        location: entry.location || "Remote",
        startDate: entry.startDate,
        endDate: entry.endDate || null,
        highlights: [
          "Led development of core features that increased user engagement by 35%",
          "Architected and implemented scalable microservices handling 1M+ daily requests",
          "Mentored junior engineers and established best practices for code review",
          "Reduced deployment time by 60% through CI/CD pipeline improvements",
        ],
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
      })),
      skills: [
        {
          category: "Languages",
          items: ["TypeScript", "JavaScript", "Python", "Go"],
        },
        {
          category: "Frontend",
          items: ["React", "Vue.js", "Next.js", "Tailwind CSS"],
        },
        {
          category: "Backend",
          items: ["Node.js", "Express", "PostgreSQL", "Redis"],
        },
        {
          category: "Cloud & DevOps",
          items: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        },
      ],
      education: [
        {
          institution: "University of California",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2015",
          endDate: "2019",
        },
      ],
    }

    const mockTokenUsage: TokenUsage = {
      promptTokens: 2500,
      completionTokens: 1200,
      totalTokens: 3700,
    }

    return {
      content: mockContent,
      tokenUsage: mockTokenUsage,
      model: "gpt-4o-2024-08-06 (MOCK)",
    }
  }

  /**
   * Generate a mock cover letter for local development
   * This avoids hitting OpenAI API quota limits during testing
   */
  private generateMockCoverLetter(options: GenerateCoverLetterOptions): CoverLetterGenerationResult {
    this.logger.info("🎭 Generating MOCK cover letter (no API call)", {
      role: options.job.role,
      company: options.job.company,
    })

    const mockContent: CoverLetterContent = {
      greeting: "Dear Hiring Manager,",
      openingParagraph: `I am writing to express my strong interest in the ${options.job.role} position at ${options.job.company}. With my extensive background in software engineering and passion for building innovative solutions, I am confident I would be a valuable addition to your team.`,
      bodyParagraphs: [
        `Throughout my career, I have consistently delivered high-impact technical solutions that drive business value. In my most recent role, I led the development of scalable microservices that handle millions of daily requests, while maintaining a focus on code quality and team collaboration. My experience with modern web technologies and cloud infrastructure aligns perfectly with the requirements for this position.`,
        `What excites me most about ${options.job.company} is your commitment to innovation and technical excellence. I am particularly drawn to the opportunity to work on challenging problems at scale and contribute to a team that values continuous learning and growth. My background in full-stack development and system architecture would allow me to make immediate contributions while continuing to expand my skills.`,
      ],
      closingParagraph: `I would welcome the opportunity to discuss how my experience and passion for technology could contribute to ${options.job.company}'s continued success. Thank you for your consideration, and I look forward to speaking with you soon.`,
      signature: `Sincerely,\n${options.personalInfo.name}`,
    }

    const mockTokenUsage: TokenUsage = {
      promptTokens: 1800,
      completionTokens: 800,
      totalTokens: 2600,
    }

    return {
      content: mockContent,
      tokenUsage: mockTokenUsage,
      model: "gpt-4o-2024-08-06 (MOCK)",
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
