/**
 * Genkit Flow Schemas
 *
 * Defines input/output schemas for Genkit flows using Zod.
 */

import { z } from "zod"

// Personal information schema
export const PersonalInfoSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
})

// Job information schema
export const JobInfoSchema = z.object({
  role: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  companyWebsite: z.string().url().optional(),
  jobDescription: z.string().max(10000).optional(),
})

// Experience entry schema
export const ExperienceEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
})

// Experience blurb schema
export const ExperienceBlurbSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Resume generation input schema
export const ResumeInputSchema = z.object({
  personalInfo: PersonalInfoSchema,
  job: JobInfoSchema,
  experienceEntries: z.array(ExperienceEntrySchema),
  experienceBlurbs: z.array(ExperienceBlurbSchema),
  emphasize: z.array(z.string()).optional(),
})

// Cover letter generation input schema
export const CoverLetterInputSchema = z.object({
  personalInfo: PersonalInfoSchema.pick({ name: true, email: true }),
  job: JobInfoSchema,
  experienceEntries: z.array(ExperienceEntrySchema),
  experienceBlurbs: z.array(ExperienceBlurbSchema),
})

// Resume generation output schema
export const ResumeOutputSchema = z.object({
  content: z.string(),
  metadata: z.object({
    model: z.string(),
    tokenUsage: z.object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    }),
  }),
})

// Cover letter generation output schema
export const CoverLetterOutputSchema = z.object({
  content: z.string(),
  metadata: z.object({
    model: z.string(),
    tokenUsage: z.object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    }),
  }),
})

// Stream chunk schema (for streaming responses)
export const StreamChunkSchema = z.string()
