import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Label, Textarea, Button, Flex, Alert, Spinner, Select } from "theme-ui"
import { generatorClient } from "../../api/generator-client"
import type { AIPrompts } from "../../types/generator"
import { logger } from "../../utils/logger"

interface AIPromptsTabProps {
  isEditor: boolean
}

const DEFAULT_RESUME_SYSTEM_PROMPT = `You are a professional resume formatter with strict adherence to factual accuracy.

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
- Exceed 2 pages of content`

const DEFAULT_RESUME_USER_PROMPT_TEMPLATE = `Create a modern resume for the "{{job.role}}" position at {{job.company}}.

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
1. Create a professional summary using ONLY skills and experience present in the data above
2. Select and order the most relevant experience entries for the {{job.role}} role
3. Reformat (NOT rewrite) experience accomplishments for clarity while preserving all facts
4. If an accomplishment mentions technology relevant to the job description, emphasize it through placement
5. Extract skills ONLY from technologies explicitly mentioned in the experience entries above
6. If these keywords appear in the experience data, ensure they are prominent: {{emphasize}}
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

const DEFAULT_COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer specializing in helping software engineers craft compelling, personalized cover letters.

Your letters are:
- Concise (3-4 paragraphs maximum)
- MAXIMUM LENGTH: Must fit on 1 page when rendered to PDF (approximately 250-350 words total)
- Professional but warm in tone
- Focused on relevant accomplishments and fit for the specific role
- Free of clichés and generic phrases
- Authentic and conversational

You highlight the candidate's most relevant accomplishments and explain why they're a great fit for the specific role and company.`

const DEFAULT_COVER_LETTER_USER_PROMPT_TEMPLATE = `Create a professional cover letter for the "{{job.role}}" position at {{job.company}}.

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

export const AIPromptsTab: React.FC<AIPromptsTabProps> = ({ isEditor }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<"resume" | "coverLetter">("resume")

  const [prompts, setPrompts] = useState<AIPrompts>({
    resume: {
      systemPrompt: DEFAULT_RESUME_SYSTEM_PROMPT,
      userPromptTemplate: DEFAULT_RESUME_USER_PROMPT_TEMPLATE,
    },
    coverLetter: {
      systemPrompt: DEFAULT_COVER_LETTER_SYSTEM_PROMPT,
      userPromptTemplate: DEFAULT_COVER_LETTER_USER_PROMPT_TEMPLATE,
    },
  })

  // Load current prompts
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        setLoading(true)
        setError(null)

        const defaults = await generatorClient.getDefaults()

        if (defaults.aiPrompts) {
          setPrompts({
            resume: {
              systemPrompt: defaults.aiPrompts.resume?.systemPrompt ?? DEFAULT_RESUME_SYSTEM_PROMPT,
              userPromptTemplate: defaults.aiPrompts.resume?.userPromptTemplate ?? DEFAULT_RESUME_USER_PROMPT_TEMPLATE,
            },
            coverLetter: {
              systemPrompt: defaults.aiPrompts.coverLetter?.systemPrompt ?? DEFAULT_COVER_LETTER_SYSTEM_PROMPT,
              userPromptTemplate:
                defaults.aiPrompts.coverLetter?.userPromptTemplate ?? DEFAULT_COVER_LETTER_USER_PROMPT_TEMPLATE,
            },
          })
        }

        setLoading(false)
      } catch (err) {
        logger.error("Failed to load AI prompts", err as Error, {
          component: "AIPromptsTab",
          action: "loadPrompts",
        })
        setError(err instanceof Error ? err.message : "Failed to load AI prompts")
        setLoading(false)
      }
    }

    void loadPrompts()
  }, [])

  const handlePromptChange = (
    type: "resume" | "coverLetter",
    field: "systemPrompt" | "userPromptTemplate",
    value: string
  ) => {
    setPrompts((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
    setHasChanges(true)
    setSuccess(false)
  }

  const handleReset = () => {
    setPrompts({
      resume: {
        systemPrompt: DEFAULT_RESUME_SYSTEM_PROMPT,
        userPromptTemplate: DEFAULT_RESUME_USER_PROMPT_TEMPLATE,
      },
      coverLetter: {
        systemPrompt: DEFAULT_COVER_LETTER_SYSTEM_PROMPT,
        userPromptTemplate: DEFAULT_COVER_LETTER_USER_PROMPT_TEMPLATE,
      },
    })
    setHasChanges(true)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges) {
      setSuccess(true)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await generatorClient.updateDefaults({ aiPrompts: prompts })

      setSaving(false)
      setSuccess(true)
      setHasChanges(false)

      logger.info("AI prompts saved successfully", {
        component: "AIPromptsTab",
        action: "savePrompts",
      })
    } catch (err) {
      logger.error("Failed to save AI prompts", err as Error, {
        component: "AIPromptsTab",
        action: "savePrompts",
      })
      setError(err instanceof Error ? err.message : "Failed to save AI prompts")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box>
        <Flex sx={{ justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spinner size={48} />
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          {isEditor
            ? "Customize the AI prompts used for generating resumes and cover letters. These prompts control how the AI formats and structures your documents."
            : "View the AI prompts used for document generation. Sign in as an editor to modify these prompts."}
        </Text>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && !error && (
        <Alert variant="success" sx={{ mb: 3 }}>
          ✓ AI prompts saved successfully!
        </Alert>
      )}

      {/* Prompt Type Selector - Always enabled for selection */}
      <Box sx={{ mb: 4 }}>
        <Label htmlFor="prompt-type">Document Type</Label>
        <Select
          id="prompt-type"
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value as "resume" | "coverLetter")}
          disabled={saving}
        >
          <option value="resume">Resume</option>
          <option value="coverLetter">Cover Letter</option>
        </Select>
      </Box>

      {/* Prompts Form */}
      <Box
        as="form"
        onSubmit={(e: React.FormEvent) => {
          void handleSubmit(e)
        }}
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
            value={prompts[selectedPrompt]?.systemPrompt ?? ""}
            onChange={(e) => handlePromptChange(selectedPrompt, "systemPrompt", e.target.value)}
            disabled={!isEditor || saving}
            rows={15}
            sx={{
              fontFamily: "monospace",
              fontSize: 1,
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
            value={prompts[selectedPrompt]?.userPromptTemplate ?? ""}
            onChange={(e) => handlePromptChange(selectedPrompt, "userPromptTemplate", e.target.value)}
            disabled={!isEditor || saving}
            rows={25}
            sx={{
              fontFamily: "monospace",
              fontSize: 1,
            }}
          />
          <Text sx={{ fontSize: 0, mt: 2, opacity: 0.7 }}>
            Available variables: {"{{personalInfo.name}}"}, {"{{personalInfo.email}}"}, {"{{personalInfo.phone}}"},
            {"{{personalInfo.location}}"}, {"{{personalInfo.website}}"}, {"{{personalInfo.github}}"},
            {"{{personalInfo.linkedin}}"}, {"{{job.role}}"}, {"{{job.company}}"}, {"{{job.companyWebsite}}"},
            {"{{job.jobDescription}}"}, {"{{experienceData}}"} (JSON array of all experience entries and blurbs)
          </Text>
        </Box>

        {/* Actions - Editor Only */}
        {isEditor && (
          <Flex sx={{ gap: 3, justifyContent: "space-between", mt: 4 }}>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={saving} sx={{ px: 4, py: 2 }}>
              Reset to Defaults
            </Button>
            <Button type="submit" variant="primary" disabled={saving || !hasChanges} sx={{ px: 4, py: 2 }}>
              {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </Flex>
        )}
      </Box>

      {/* Info Box */}
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "sm" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> These prompts control how the AI generates documents. Changes will apply to all future
          generations. Be careful when modifying - incorrect prompts may result in poor quality outputs.
        </Text>
      </Box>
    </Box>
  )
}
