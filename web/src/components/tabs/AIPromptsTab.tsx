import React, { useState } from "react"
import { Box, Heading, Text, Label, Textarea, Select, Flex } from "theme-ui"

/**
 * AI Prompts Tab - Display Only
 *
 * Shows the current AI prompts used for document generation.
 * These prompts are hard-coded to match the production implementations
 * in openai.service.ts and gemini.service.ts.
 */

// Resume System Prompt (from openai.service.ts:186-228 and gemini.service.ts:206-248)
const RESUME_SYSTEM_PROMPT = `You are a professional resume formatter with strict adherence to factual accuracy and conciseness.

CRITICAL RULES - THESE ARE ABSOLUTE AND NON-NEGOTIABLE:
1. ONLY use information explicitly provided in the experience data
2. NEVER add metrics, numbers, percentages, or statistics not in the original data
3. NEVER invent job responsibilities, accomplishments, or technologies
4. NEVER create companies, roles, dates, or locations not provided
5. If information is missing or unclear, omit it entirely - DO NOT guess or infer
6. You may REFORMAT wording for clarity, but NEVER change factual content
7. You may REORGANIZE content for better presentation, but NEVER add new information

LENGTH REQUIREMENTS (STRICT):
- MAXIMUM: 1-2 pages when rendered to PDF (600-750 words total)
- Include ONLY 3-4 most relevant experience entries (prioritize relevance over completeness)
- MAXIMUM 4 bullet points per experience entry
- Professional summary: 2-3 sentences maximum (50-75 words)
- Prioritize QUALITY over QUANTITY - better to have fewer, stronger highlights

Your role is to:
- SELECT the 3-4 most relevant experiences for the target role
- Format and structure ONLY the most relevant experience professionally
- Emphasize relevance through SELECTION and ORDERING, not fabrication
- Write CONCISE, impactful bullet points (1-2 lines each maximum)
- Improve phrasing and grammar while preserving all factual details
- Ensure ATS-friendliness through proper formatting
- Use action verbs from the source material
- Focus on impact and results that are stated in the data

SELECTION PRIORITY:
- Relevance to target role is MORE important than recency
- Quality of accomplishments is MORE important than quantity
- If an experience has weak or generic content, SKIP IT entirely
- Better to have 3 strong entries than 5 mediocre ones

What you CANNOT do:
- Include more than 4 experience entries
- Include more than 4 bullet points per entry
- Add accomplishments not stated in the source data
- Insert metrics or quantification not explicitly provided
- Infer skills, technologies, or methodologies not mentioned
- Create education entries if none are provided
- Write verbose or lengthy descriptions`

// Resume User Prompt Template (from openai.service.ts:234-349)
const RESUME_USER_PROMPT_TEMPLATE = `Create a modern resume for the "{{job.role}}" position at {{job.company}}.

PERSONAL INFORMATION:
- Name: {{personalInfo.name}}
- Email: {{personalInfo.email}}
- Phone: {{personalInfo.phone}}
- Location: {{personalInfo.location}}
- Website: {{personalInfo.website}}
- LinkedIn: {{personalInfo.linkedin}}
- GitHub: {{personalInfo.github}}

TARGET JOB INFORMATION:
- Company: {{job.company}}
- Role: {{job.role}}
- Company Website: {{job.companyWebsite}}
- Job Description (for relevance ranking ONLY, DO NOT fabricate experience to match):
{{job.jobDescription}}

EXPERIENCE DATA (YOUR ONLY SOURCE OF TRUTH):
{{experienceData}}

END OF ALL PROVIDED DATA - NO OTHER INFORMATION EXISTS

TASK REQUIREMENTS:
1. SELECT ONLY 3-4 most relevant experience entries for the {{job.role}} role
   - If more than 4 entries provided, choose the most relevant based on job description
   - Relevance matters MORE than recency
   - Skip entries with weak or generic content

2. For each selected entry, write MAXIMUM 4 concise bullet points
   - Each bullet should be 1-2 lines maximum
   - Focus on strongest accomplishments only
   - Prioritize quality over quantity

3. Create a concise professional summary (2-3 sentences, 50-75 words)
   - Use ONLY skills and experience present in the selected entries
   - Make it specific to the {{job.role}} role

4. Extract skills ONLY from technologies explicitly mentioned in selected entries
   - Keep skills section concise and focused
   - If these keywords appear in the experience data, ensure they are prominent: {{emphasize}}

5. For education: Include ONLY if education information appears in the experience data or notes. Otherwise omit entirely.

SELECTION STRATEGY:
- Analyze job description for key requirements
- Rank experience entries by relevance to those requirements
- Choose top 3-4 entries that best demonstrate fit
- If an entry doesn't strongly relate to the role, SKIP IT

FORBIDDEN ACTIONS (will result in rejection):
❌ Including more than 4 experience entries
❌ Including more than 4 bullet points per entry
❌ Adding metrics/numbers not in source data
❌ Inventing job responsibilities or projects
❌ Creating skills or technologies not mentioned in the data
❌ Writing verbose or lengthy descriptions
❌ Including irrelevant experiences just to fill space

TARGET LENGTH: 600-750 words total. Generate a complete, concise, ATS-friendly resume using ONLY the most relevant factual information.`

// Cover Letter System Prompt (from openai.service.ts:355-381)
const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer specializing in helping software engineers craft compelling, personalized cover letters.

STRICT LENGTH REQUIREMENTS:
- MAXIMUM: 1 page when rendered to PDF (250-350 words total)
- 3 paragraphs MAXIMUM (opening, body, closing)
- Each paragraph: 2-3 sentences maximum
- Opening: 50-75 words
- Body: 100-150 words (split into 1-2 paragraphs if needed)
- Closing: 50-75 words
- Prioritize QUALITY over QUANTITY

Your letters are:
- Concise and impactful (every sentence adds value)
- Professional but warm in tone
- Focused on 2-3 most relevant accomplishments ONLY
- Free of clichés and generic phrases ("I am excited to apply...")
- Authentic and conversational
- Specific to the role and company

SELECTION PRIORITY:
- Choose ONLY the 2-3 most relevant accomplishments from experience
- Quality matters MORE than quantity
- Better to have 2 strong points than 4 mediocre ones
- Skip generic statements that could apply to any role

You highlight the candidate's most relevant accomplishments and explain why they're a great fit for the specific role and company.`

// Cover Letter User Prompt Template (from openai.service.ts:387-447)
const COVER_LETTER_USER_PROMPT_TEMPLATE = `Create a professional cover letter for the "{{job.role}}" position at {{job.company}}.

CANDIDATE INFORMATION:
- Name: {{personalInfo.name}}
- Email: {{personalInfo.email}}

JOB DETAILS:
- Company: {{job.company}}
- Role: {{job.role}}
- Company Website: {{job.companyWebsite}}
- Job Description:
{{job.jobDescription}}

CANDIDATE EXPERIENCE:
{{experienceData}}

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

export const AIPromptsTab: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<"resume" | "coverLetter">("resume")

  const prompts = {
    resume: {
      systemPrompt: RESUME_SYSTEM_PROMPT,
      userPromptTemplate: RESUME_USER_PROMPT_TEMPLATE,
    },
    coverLetter: {
      systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
      userPromptTemplate: COVER_LETTER_USER_PROMPT_TEMPLATE,
    },
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8, mb: 3 }}>
          These are the current AI prompts used for document generation. They are hard-coded to ensure consistent,
          high-quality outputs across all generated documents.
        </Text>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          Both OpenAI and Gemini use identical prompts to maintain consistency between providers.
        </Text>
      </Box>

      {/* Prompt Type Selector */}
      <Box sx={{ mb: 4 }}>
        <Label htmlFor="prompt-type">Document Type</Label>
        <Select
          id="prompt-type"
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value as "resume" | "coverLetter")}
        >
          <option value="resume">Resume</option>
          <option value="coverLetter">Cover Letter</option>
        </Select>
      </Box>

      {/* Prompts Display */}
      <Box
        sx={{
          bg: "background",
          p: 4,
          borderRadius: "md",
          border: "1px solid",
          borderColor: "muted",
        }}
      >
        <Heading as="h2" sx={{ fontSize: 3, mb: 3, color: "primary" }}>
          {selectedPrompt === "resume" ? "Resume" : "Cover Letter"} Prompts
        </Heading>

        {/* System Prompt */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="system-prompt">
            System Prompt
            <Text as="span" sx={{ ml: 2, fontSize: 1, opacity: 0.7 }}>
              (Defines the AI&apos;s role and behavior)
            </Text>
          </Label>
          <Textarea
            id="system-prompt"
            value={prompts[selectedPrompt].systemPrompt}
            readOnly
            rows={20}
            sx={{
              fontFamily: "monospace",
              fontSize: 1,
              bg: "muted",
              cursor: "default",
              opacity: 0.95,
            }}
          />
        </Box>

        {/* User Prompt Template */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="user-prompt">
            User Prompt Template
            <Text as="span" sx={{ ml: 2, fontSize: 1, opacity: 0.7 }}>
              (Template for user instructions - supports variables)
            </Text>
          </Label>
          <Textarea
            id="user-prompt"
            value={prompts[selectedPrompt].userPromptTemplate}
            readOnly
            rows={30}
            sx={{
              fontFamily: "monospace",
              fontSize: 1,
              bg: "muted",
              cursor: "default",
              opacity: 0.95,
            }}
          />
          <Text sx={{ fontSize: 0, mt: 2, opacity: 0.7 }}>
            <strong>Available variables:</strong> {"{{personalInfo.name}}"}, {"{{personalInfo.email}}"},{" "}
            {"{{personalInfo.phone}}"}, {"{{personalInfo.location}}"}, {"{{personalInfo.website}}"},{" "}
            {"{{personalInfo.github}}"}, {"{{personalInfo.linkedin}}"}, {"{{job.role}}"}, {"{{job.company}}"},{" "}
            {"{{job.companyWebsite}}"}, {"{{job.jobDescription}}"}, {"{{experienceData}}"}, {"{{emphasize}}"}
          </Text>
        </Box>
      </Box>

      {/* Info Boxes */}
      <Flex sx={{ flexDirection: "column", gap: 3, mt: 4 }}>
        <Box sx={{ p: 3, bg: "muted", borderRadius: "sm" }}>
          <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
            <strong>Job Match Integration:</strong> When generating documents from the Job Applications tab, the AI
            receives additional context including match score, matched skills, key strengths, and customization
            recommendations from the job-finder tool. This ensures hyper-targeted documents.
          </Text>
        </Box>

        <Box sx={{ p: 3, bg: "muted", borderRadius: "sm" }}>
          <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
            <strong>Note:</strong> These prompts are maintained in the backend services (
            <Text as="code" sx={{ fontSize: 0, fontFamily: "monospace" }}>
              functions/src/services/openai.service.ts
            </Text>{" "}
            and{" "}
            <Text as="code" sx={{ fontSize: 0, fontFamily: "monospace" }}>
              functions/src/services/gemini.service.ts
            </Text>
            ). Any modifications must be made directly in those files and deployed via CI/CD.
          </Text>
        </Box>

        <Box sx={{ p: 3, bg: "muted", borderRadius: "sm" }}>
          <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
            <strong>Quality Focus:</strong> The prompts prioritize selection and conciseness over exhaustiveness. They
            enforce strict factual accuracy rules to prevent AI hallucination, ensuring all content comes from your
            actual experience data.
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
