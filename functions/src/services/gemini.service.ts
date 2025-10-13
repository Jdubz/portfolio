/**
 * Gemini AI Service
 *
 * Handles all Gemini API interactions for resume and cover letter generation.
 * Uses Google's Generative AI SDK (Firebase AI Logic).
 *
 * Cost: $0.10 input / $0.40 output per 1M tokens (92% cheaper than OpenAI)
 * Model: gemini-2.0-flash
 */

import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"
import type {
  AIProvider,
  AIProviderType,
  AIResumeGenerationResult,
  AICoverLetterGenerationResult,
  GenerateResumeOptions,
  GenerateCoverLetterOptions,
  TokenUsage,
  ResumeContent,
  CoverLetterContent,
} from "../types/generator.types"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI
  private generativeModel: GenerativeModel
  private logger: SimpleLogger
  private useMockMode: boolean

  readonly model: string = "gemini-2.0-flash"
  readonly providerType: AIProviderType = "gemini"
  readonly pricing = {
    inputCostPer1M: 0.1, // $0.10 per 1M input tokens
    outputCostPer1M: 0.4, // $0.40 per 1M output tokens
  }

  constructor(apiKey: string, logger?: SimpleLogger) {
    this.client = new GoogleGenerativeAI(apiKey)
    this.generativeModel = this.client.getGenerativeModel({ model: "gemini-2.0-flash" })

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined
    this.useMockMode = process.env.GEMINI_MOCK_MODE === "true"

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
      this.logger.warning("⚠️  GEMINI MOCK MODE ENABLED - Using mock responses instead of real API calls")
    }
  }

  /**
   * Generate a resume using Gemini
   */
  async generateResume(options: GenerateResumeOptions): Promise<AIResumeGenerationResult> {
    try {
      // Return mock response if mock mode is enabled
      if (this.useMockMode) {
        return this.generateMockResume(options)
      }

      const systemPrompt = options.customPrompts?.systemPrompt || this.buildResumeSystemPrompt()
      const userPrompt = options.customPrompts?.userPromptTemplate
        ? this.interpolateUserPrompt(options.customPrompts.userPromptTemplate, options)
        : this.buildResumeUserPrompt(options)

      this.logger.info("Generating resume with Gemini", {
        model: this.model,
        role: options.job.role,
        company: options.job.company,
      })

      // Combine system and user prompts (Gemini doesn't have separate system role)
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON matching the resume schema. No markdown, no explanation, just pure JSON.`

      const result = await this.generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0, // Zero for maximum factual accuracy
          responseMimeType: "application/json",
        },
      })

      const response = result.response
      const text = response.text()

      // Parse the JSON response
      const content = JSON.parse(text) as ResumeContent

      // Estimate token usage (Gemini doesn't always provide exact counts)
      const promptTokens = this.estimateTokens(fullPrompt)
      const completionTokens = this.estimateTokens(text)

      const tokenUsage: TokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      }

      this.logger.info("Resume generated successfully with Gemini", {
        model: this.model,
        tokenUsage,
      })

      return {
        content,
        tokenUsage,
        model: this.model,
      }
    } catch (error) {
      this.logger.error("Failed to generate resume with Gemini", { error })
      throw new Error(`Gemini resume generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Generate a cover letter using Gemini
   */
  async generateCoverLetter(options: GenerateCoverLetterOptions): Promise<AICoverLetterGenerationResult> {
    try {
      // Return mock response if mock mode is enabled
      if (this.useMockMode) {
        return this.generateMockCoverLetter(options)
      }

      const systemPrompt = options.customPrompts?.systemPrompt || this.buildCoverLetterSystemPrompt()
      const userPrompt = options.customPrompts?.userPromptTemplate
        ? this.interpolateCoverLetterPrompt(options.customPrompts.userPromptTemplate, options)
        : this.buildCoverLetterUserPrompt(options)

      this.logger.info("Generating cover letter with Gemini", {
        model: this.model,
        role: options.job.role,
        company: options.job.company,
      })

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON matching the cover letter schema. No markdown, no explanation, just pure JSON.`

      const result = await this.generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      })

      const response = result.response
      const text = response.text()

      const content = JSON.parse(text) as CoverLetterContent

      const promptTokens = this.estimateTokens(fullPrompt)
      const completionTokens = this.estimateTokens(text)

      const tokenUsage: TokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      }

      this.logger.info("Cover letter generated successfully with Gemini", {
        model: this.model,
        tokenUsage,
      })

      return {
        content,
        tokenUsage,
        model: this.model,
      }
    } catch (error) {
      this.logger.error("Failed to generate cover letter with Gemini", { error })
      throw new Error(
        `Gemini cover letter generation failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Calculate cost in USD from token usage
   * Based on Gemini 2.0 Flash pricing: $0.10/1M input, $0.40/1M output
   */
  calculateCost(tokenUsage: TokenUsage): number {
    const inputCost = (tokenUsage.promptTokens / 1_000_000) * this.pricing.inputCostPer1M
    const outputCost = (tokenUsage.completionTokens / 1_000_000) * this.pricing.outputCostPer1M

    return inputCost + outputCost
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   * Gemini API doesn't always provide exact token counts, so we estimate
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  /**
   * Build system prompt for resume generation
   * EXACT same prompt as OpenAI for consistency
   */
  private buildResumeSystemPrompt(): string {
    return `You are a professional resume formatter with strict adherence to factual accuracy.

CRITICAL RULES - THESE ARE ABSOLUTE AND NON-NEGOTIABLE:
1. ONLY use information explicitly provided in the experience data
2. NEVER add metrics, numbers, percentages, or statistics not in the original data
3. NEVER invent job responsibilities, accomplishments, or technologies
4. NEVER create companies, roles, dates, or locations not provided
5. If information is missing or unclear, omit it entirely - DO NOT guess or infer
6. You may REFORMAT wording for clarity, but NEVER change factual content
7. You may REORGANIZE content for better presentation, but NEVER add new information
8. MAXIMUM LENGTH: The resume MUST fit within 2 pages when rendered to PDF (approximately 700-800 words total)

Your role is to:
- Format and structure the provided experience data professionally
- Emphasize relevant experience for the target role BY ORDERING, not by fabrication
- Improve phrasing and grammar while preserving all factual details
- Ensure ATS-friendliness through proper formatting
- Use action verbs from the source material
- Focus on impact and results that are stated in the data
- Keep content concise to fit within 2-page limit

What you CANNOT do:
- Add accomplishments not stated in the source data
- Insert metrics or quantification not explicitly provided
- Infer skills, technologies, or methodologies not mentioned
- Create education entries if none are provided
- Exceed 2 pages of content

You must respond with valid JSON matching this schema:
{
  "personalInfo": {
    "name": string,
    "title": string,
    "summary": string,
    "contact": {
      "email": string,
      "location": string,
      "website": string,
      "linkedin": string,
      "github": string
    }
  },
  "professionalSummary": string,
  "experience": [{
    "company": string,
    "role": string,
    "location": string,
    "startDate": string,
    "endDate": string | null,
    "highlights": string[],
    "technologies": string[]
  }],
  "skills": [{
    "category": string,
    "items": string[]
  }],
  "education": [{
    "institution": string,
    "degree": string,
    "field": string,
    "startDate": string,
    "endDate": string
  }]
}`
  }

  /**
   * Build user prompt for resume generation
   * EXACT same prompt as OpenAI for consistency
   */
  private buildResumeUserPrompt(options: GenerateResumeOptions): string {
    // Format experience data with explicit boundaries
    const experienceData = options.experienceEntries
      .map((entry, index) => {
        const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
        return `
EXPERIENCE ENTRY #${index + 1} (USE ONLY THIS DATA - DO NOT ADD ANYTHING):
Company/Title: ${entry.title}
${entry.role ? `Role: ${entry.role}` : "NO ROLE PROVIDED"}
${entry.location ? `Location: ${entry.location}` : "NO LOCATION PROVIDED"}
Start Date: ${entry.startDate}
End Date: ${entry.endDate || "Present"}
${entry.body ? `Description: ${entry.body}` : "NO DESCRIPTION PROVIDED"}
${blurb ? `Accomplishments:\n${blurb.content}` : "NO ACCOMPLISHMENTS PROVIDED"}
${entry.notes ? `Additional Context: ${entry.notes}` : "NO ADDITIONAL CONTEXT PROVIDED"}

END OF ENTRY #${index + 1} - USE NOTHING BEYOND THIS POINT FOR THIS ENTRY
`.trim()
      })
      .join("\n\n" + "=".repeat(80) + "\n\n")

    return `Create a modern resume for the "${options.job.role}" position at ${options.job.company}.

PERSONAL INFORMATION:
- Name: ${options.personalInfo.name}
- Email: ${options.personalInfo.email}
${options.personalInfo.phone ? `- Phone: ${options.personalInfo.phone}` : ""}
${options.personalInfo.location ? `- Location: ${options.personalInfo.location}` : ""}
${options.personalInfo.website ? `- Website: ${options.personalInfo.website}` : ""}
${options.personalInfo.linkedin ? `- LinkedIn: ${options.personalInfo.linkedin}` : ""}
${options.personalInfo.github ? `- GitHub: ${options.personalInfo.github}` : ""}

TARGET JOB INFORMATION:
- Company: ${options.job.company}
- Role: ${options.job.role}
${options.job.companyWebsite ? `- Company Website: ${options.job.companyWebsite}` : ""}
${options.job.jobDescription ? `\n- Job Description (for relevance ranking ONLY, DO NOT fabricate experience to match):\n${options.job.jobDescription}` : ""}

EXPERIENCE DATA (YOUR ONLY SOURCE OF TRUTH):
${experienceData}

END OF ALL PROVIDED DATA - NO OTHER INFORMATION EXISTS

TASK REQUIREMENTS:
1. Create a professional summary using ONLY skills and experience present in the data above
2. Select and order the most relevant experience entries for the ${options.job.role} role
3. Reformat (NOT rewrite) experience accomplishments for clarity while preserving all facts
4. If an accomplishment mentions technology relevant to the job description, emphasize it through placement
5. Extract skills ONLY from technologies explicitly mentioned in the experience entries above
${options.emphasize && options.emphasize.length > 0 ? `6. If these keywords appear in the experience data, ensure they are prominent: ${options.emphasize.join(", ")}` : ""}
7. Use action verbs that appear in the source material or are direct synonyms
8. For education: Include ONLY if education information appears in the experience data or notes. Otherwise omit entirely.

FORBIDDEN ACTIONS (will result in rejection):
❌ Adding metrics/numbers not in source data (e.g., "increased by 50%", "serving 10K users")
❌ Inventing job responsibilities or projects
❌ Creating skills or technologies not mentioned in the data
❌ Fabricating education credentials
❌ Adding companies or roles not in the experience entries
❌ Inferring information from context or job description

Generate a complete, ATS-friendly resume using ONLY the factual information explicitly provided above.`
  }

  /**
   * Build system prompt for cover letter generation
   */
  private buildCoverLetterSystemPrompt(): string {
    return `You are an expert cover letter writer specializing in helping software engineers craft compelling, personalized cover letters.

Your letters are:
- Concise (3-4 paragraphs maximum)
- MAXIMUM LENGTH: Must fit on 1 page when rendered to PDF (approximately 250-350 words total)
- Professional but warm in tone
- Focused on relevant accomplishments and fit for the specific role
- Free of clichés and generic phrases
- Authentic and conversational

You highlight the candidate's most relevant accomplishments and explain why they're a great fit for the specific role and company.

You must respond with valid JSON matching this schema:
{
  "greeting": string,
  "openingParagraph": string,
  "bodyParagraphs": string[],
  "closingParagraph": string,
  "signature": string
}`
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
   * Generate a mock resume for testing
   */
  private generateMockResume(options: GenerateResumeOptions): AIResumeGenerationResult {
    this.logger.info("🎭 Generating MOCK resume with Gemini (no API call)", {
      role: options.job.role,
      company: options.job.company,
    })

    const mockContent: ResumeContent = {
      personalInfo: {
        name: options.personalInfo.name,
        title: `${options.job.role}`,
        summary: `Experienced software engineer with a proven track record of building scalable systems. Passionate about ${options.job.role.toLowerCase()} work.`,
        contact: {
          email: options.personalInfo.email,
          location: options.personalInfo.location || "Portland, OR",
          website: options.personalInfo.website || "",
          linkedin: options.personalInfo.linkedin || "",
          github: options.personalInfo.github || "",
        },
      },
      professionalSummary: `Highly skilled ${options.job.role} with extensive experience in software development and technical leadership.`,
      experience: options.experienceEntries.slice(0, 3).map((entry) => ({
        company: entry.title,
        role: entry.role || options.job.role,
        location: entry.location || "Remote",
        startDate: entry.startDate,
        endDate: entry.endDate || null,
        highlights: [
          "Led development of core features",
          "Architected scalable microservices",
          "Mentored junior engineers",
        ],
        technologies: ["TypeScript", "React", "Node.js"],
      })),
      skills: [
        { category: "Languages", items: ["TypeScript", "JavaScript", "Python"] },
        { category: "Frontend", items: ["React", "Vue.js", "Next.js"] },
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
      promptTokens: 2000,
      completionTokens: 1000,
      totalTokens: 3000,
    }

    return {
      content: mockContent,
      tokenUsage: mockTokenUsage,
      model: `${this.model} (MOCK)`,
    }
  }

  /**
   * Generate a mock cover letter for testing
   */
  private generateMockCoverLetter(options: GenerateCoverLetterOptions): AICoverLetterGenerationResult {
    this.logger.info("🎭 Generating MOCK cover letter with Gemini (no API call)", {
      role: options.job.role,
      company: options.job.company,
    })

    const mockContent: CoverLetterContent = {
      greeting: "Dear Hiring Manager,",
      openingParagraph: `I am writing to express my strong interest in the ${options.job.role} position at ${options.job.company}.`,
      bodyParagraphs: [
        "Throughout my career, I have consistently delivered high-impact technical solutions.",
        `What excites me most about ${options.job.company} is your commitment to innovation and technical excellence.`,
      ],
      closingParagraph: `I would welcome the opportunity to discuss how my experience could contribute to ${options.job.company}'s continued success.`,
      signature: `Sincerely,\n${options.personalInfo.name}`,
    }

    const mockTokenUsage: TokenUsage = {
      promptTokens: 1500,
      completionTokens: 700,
      totalTokens: 2200,
    }

    return {
      content: mockContent,
      tokenUsage: mockTokenUsage,
      model: `${this.model} (MOCK)`,
    }
  }

  /**
   * Interpolate user prompt template with actual values
   * Used when custom prompts are provided from Firestore
   */
  private interpolateUserPrompt(template: string, options: GenerateResumeOptions): string {
    // If template doesn't use variables, just return as-is
    if (!template.includes("{{")) {
      return this.buildResumeUserPrompt(options)
    }

    // Format experience data
    const experienceData = options.experienceEntries
      .map((entry, index) => {
        const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
        return `
EXPERIENCE ENTRY #${index + 1} (USE ONLY THIS DATA - DO NOT ADD ANYTHING):
Company/Title: ${entry.title}
${entry.role ? `Role: ${entry.role}` : "NO ROLE PROVIDED"}
${entry.location ? `Location: ${entry.location}` : "NO LOCATION PROVIDED"}
Start Date: ${entry.startDate}
End Date: ${entry.endDate || "Present"}
${entry.body ? `Description: ${entry.body}` : "NO DESCRIPTION PROVIDED"}
${blurb ? `Accomplishments:\n${blurb.content}` : "NO ACCOMPLISHMENTS PROVIDED"}
${entry.notes ? `Additional Context: ${entry.notes}` : "NO ADDITIONAL CONTEXT PROVIDED"}

END OF ENTRY #${index + 1} - USE NOTHING BEYOND THIS POINT FOR THIS ENTRY
`.trim()
      })
      .join("\n\n" + "=".repeat(80) + "\n\n")

    // Replace template variables
    return template
      .replace(/\{\{personalInfo\.name\}\}/g, options.personalInfo.name)
      .replace(/\{\{personalInfo\.email\}\}/g, options.personalInfo.email)
      .replace(/\{\{personalInfo\.phone\}\}/g, options.personalInfo.phone || "")
      .replace(/\{\{personalInfo\.location\}\}/g, options.personalInfo.location || "")
      .replace(/\{\{personalInfo\.website\}\}/g, options.personalInfo.website || "")
      .replace(/\{\{personalInfo\.linkedin\}\}/g, options.personalInfo.linkedin || "")
      .replace(/\{\{personalInfo\.github\}\}/g, options.personalInfo.github || "")
      .replace(/\{\{job\.role\}\}/g, options.job.role)
      .replace(/\{\{job\.company\}\}/g, options.job.company)
      .replace(/\{\{job\.companyWebsite\}\}/g, options.job.companyWebsite || "")
      .replace(/\{\{job\.jobDescription\}\}/g, options.job.jobDescription || "")
      .replace(/\{\{experienceData\}\}/g, experienceData)
      .replace(/\{\{emphasize\}\}/g, options.emphasize?.join(", ") || "")
  }

  /**
   * Interpolate cover letter prompt template with actual values
   */
  private interpolateCoverLetterPrompt(template: string, options: GenerateCoverLetterOptions): string {
    // If template doesn't use variables, just return as-is
    if (!template.includes("{{")) {
      return this.buildCoverLetterUserPrompt(options)
    }

    // Format experience data (simplified for cover letter)
    const experienceData = options.experienceEntries
      .map((entry) => {
        const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
        return `${entry.title}${entry.role ? ` - ${entry.role}` : ""} (${entry.startDate} - ${entry.endDate || "Present"})
${blurb ? blurb.content : entry.body || ""}`
      })
      .join("\n\n")

    // Replace template variables
    return template
      .replace(/\{\{personalInfo\.name\}\}/g, options.personalInfo.name)
      .replace(/\{\{personalInfo\.email\}\}/g, options.personalInfo.email)
      .replace(/\{\{job\.role\}\}/g, options.job.role)
      .replace(/\{\{job\.company\}\}/g, options.job.company)
      .replace(/\{\{job\.companyWebsite\}\}/g, options.job.companyWebsite || "")
      .replace(/\{\{job\.jobDescription\}\}/g, options.job.jobDescription || "")
      .replace(/\{\{experienceData\}\}/g, experienceData)
  }
}
