# AI Resume Generator - Project Plan

## Overview
Add an AI-powered resume generator to the experience page that uses OpenAI's API to create tailored resumes based on the experience entries stored in Firestore. The feature will use structured requests to generate professional, customizable resumes in multiple formats.

## Goals
- Allow editors to generate custom resumes from experience data
- Use OpenAI's structured output API for consistent formatting
- Support multiple resume styles/templates
- Generate downloadable PDF resumes
- Optionally generate LaTeX source for advanced customization
- Track generation history and usage

---

## Architecture

### High-Level Flow
```
User (Editor) → Frontend UI → Cloud Function → OpenAI API → Response Processing → PDF Generation → GCS Storage → Download
                                    ↓
                                Firestore
                            (log generation)
```

### Components

1. **Frontend (React/TypeScript)**
   - UI component on experience page
   - Resume generation form/dialog
   - Progress indicators
   - Preview and download options

2. **Cloud Function (Node.js)**
   - `generateResume` endpoint
   - OpenAI API integration
   - PDF generation (puppeteer or pdfkit)
   - GCS upload
   - Firestore logging

3. **OpenAI Integration**
   - Use Structured Outputs API
   - Custom prompt engineering
   - Token usage tracking
   - Error handling and retries

4. **Storage**
   - GCS bucket for generated resumes
   - Firestore collection for generation logs
   - Temporary storage for preview

---

## Technical Specifications

### 1. Data Flow

#### Input: Experience Entries
```typescript
interface ResumeGenerationRequest {
  style: 'modern' | 'traditional' | 'technical' | 'executive'
  sections: string[] // ['experience', 'skills', 'education', 'summary']
  targetRole?: string // Optional: "Senior Full-Stack Engineer at FAANG"
  emphasize?: string[] // Optional: keywords/technologies to emphasize
  maxLength?: number // Optional: page count (1-3)
  format: 'pdf' | 'latex' | 'both'
}
```

#### Output: Generated Resume
```typescript
interface ResumeGenerationResponse {
  success: boolean
  resumeUrl?: string // GCS signed URL
  latexSource?: string // If format includes latex
  preview?: string // Markdown preview
  metadata: {
    generatedAt: string
    style: string
    tokenUsage: {
      prompt: number
      completion: number
      total: number
    }
    model: string
  }
  requestId: string
}
```

### 2. OpenAI Integration

#### Structured Output Schema
```typescript
interface ResumeContent {
  personalInfo: {
    name: string
    title: string
    summary: string
    contact: {
      email: string
      location?: string
      website?: string
      linkedin?: string
      github?: string
    }
  }
  professionalSummary?: string
  experience: {
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    highlights: string[] // Bullet points
    technologies?: string[]
  }[]
  skills?: {
    category: string
    items: string[]
  }[]
  education?: {
    institution: string
    degree: string
    field?: string
    startDate?: string
    endDate?: string
  }[]
  certifications?: string[]
}
```

#### Prompt Strategy
```
System Prompt:
You are an expert resume writer with 20+ years of experience helping software engineers
land positions at top tech companies. You specialize in ATS-friendly resumes that highlight
technical accomplishments with quantifiable impact.

User Prompt Template:
Create a {style} resume for a {targetRole || "software engineer"} position.

Experience Data:
{JSON.stringify(experienceEntries)}

Requirements:
- Use action verbs and quantify achievements where possible
- Emphasize: {emphasize.join(', ')}
- Target length: {maxLength} page(s)
- Focus on recent and relevant experience
- Ensure ATS compatibility

Output Format: Structured JSON matching the ResumeContent schema
```

#### API Configuration
```typescript
const openaiConfig = {
  model: 'gpt-4o-2024-08-06', // Supports structured outputs
  temperature: 0.3, // Lower for consistency
  max_tokens: 4000,
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'resume_content',
      schema: resumeContentSchema,
      strict: true
    }
  }
}
```

### 3. PDF Generation Options

#### Option A: Puppeteer (HTML → PDF)
**Pros:**
- Full control over styling
- Can preview in browser
- Supports custom CSS
- Good for complex layouts

**Cons:**
- Heavier runtime (~200MB)
- Slower cold starts
- More memory intensive

**Implementation:**
```typescript
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

async function generatePDF(resumeContent: ResumeContent, style: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  })

  const html = renderResumeHTML(resumeContent, style)
  const page = await browser.newPage()
  await page.setContent(html)

  const pdf = await page.pdf({
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' }
  })

  await browser.close()
  return pdf
}
```

#### Option B: PDFKit (Direct PDF Generation)
**Pros:**
- Lightweight
- Fast cold starts
- Lower memory usage
- Programmatic control

**Cons:**
- More code for layouts
- Less flexible styling
- No preview capability

**Implementation:**
```typescript
import PDFDocument from 'pdfkit'

async function generatePDF(resumeContent: ResumeContent, style: string) {
  const doc = new PDFDocument({ size: 'Letter', margin: 50 })

  // Header
  doc.fontSize(24).text(resumeContent.personalInfo.name)
  doc.fontSize(14).text(resumeContent.personalInfo.title)

  // Experience section
  resumeContent.experience.forEach(exp => {
    doc.fontSize(16).text(exp.company)
    doc.fontSize(12).text(exp.role)
    exp.highlights.forEach(highlight => {
      doc.text(`• ${highlight}`)
    })
  })

  return doc
}
```

**Recommendation:** Start with **Puppeteer** for better flexibility and styling, optimize later if needed.

### 4. LaTeX Generation (Optional)

For users who want maximum customization:

```typescript
function generateLatex(resumeContent: ResumeContent, style: string): string {
  return `
\\documentclass[11pt,a4paper]{moderncv}
\\moderncvstyle{${style}}
\\name{${resumeContent.personalInfo.name}}{${resumeContent.personalInfo.title}}

\\begin{document}
\\makecvtitle

\\section{Experience}
${resumeContent.experience.map(exp => `
\\cventry{${exp.startDate}--${exp.endDate || 'Present'}}{${exp.role}}{${exp.company}}{${exp.location || ''}}{}{
  \\begin{itemize}
    ${exp.highlights.map(h => `\\item ${h}`).join('\n    ')}
  \\end{itemize}
}
`).join('\n')}

\\end{document}
`
}
```

### 5. Cloud Function Implementation

```typescript
// functions/src/resume-generator.ts

export const generateResume = https.onRequest(
  {
    region: 'us-central1',
    secrets: ['openai-api-key'],
    memory: '1GiB', // For Puppeteer
    maxInstances: 5,
    timeoutSeconds: 300, // 5 minutes for generation
  },
  async (req: Request, res: Response) => {
    // 1. Authenticate (Firebase Auth - editor only)
    // 2. Validate request
    // 3. Fetch experience entries from Firestore
    // 4. Call OpenAI API with structured output
    // 5. Generate PDF (and/or LaTeX)
    // 6. Upload to GCS
    // 7. Log generation to Firestore
    // 8. Return signed URL
  }
)
```

### 6. Frontend Component

```typescript
// web/src/components/ResumeGenerator.tsx

interface ResumeGeneratorProps {
  entries: ExperienceEntry[]
}

export const ResumeGenerator: React.FC<ResumeGeneratorProps> = ({ entries }) => {
  const [generating, setGenerating] = useState(false)
  const [config, setConfig] = useState<ResumeGenerationRequest>({
    style: 'modern',
    sections: ['experience', 'skills'],
    format: 'pdf'
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const token = await user?.getIdToken()
      const response = await fetch(GENERATE_RESUME_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      if (data.success) {
        window.open(data.resumeUrl, '_blank')
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog>
      {/* Form for resume config */}
      <Button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Resume'}
      </Button>
    </Dialog>
  )
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Set up OpenAI API credentials in Secret Manager
- [ ] Create `resume-generation-logs` Firestore collection
- [ ] Create GCS bucket `joshwentworth-resumes`
- [ ] Add OpenAI SDK to functions dependencies
- [ ] Create basic Cloud Function structure
- [ ] Implement authentication middleware

### Phase 2: OpenAI Integration (Week 2)
- [ ] Design and test resume content schema
- [ ] Implement prompt engineering and testing
- [ ] Create structured output API integration
- [ ] Add error handling and retries
- [ ] Implement token usage tracking
- [ ] Test with real experience data

### Phase 3: PDF Generation (Week 2-3)
- [ ] Set up Puppeteer/chromium dependencies
- [ ] Create HTML templates for each resume style
  - [ ] Modern template
  - [ ] Traditional template
  - [ ] Technical template
  - [ ] Executive template
- [ ] Implement PDF generation logic
- [ ] Test PDF quality and formatting
- [ ] Add GCS upload functionality

### Phase 4: Frontend Integration (Week 3)
- [ ] Create `ResumeGenerator` component
- [ ] Build configuration form UI
- [ ] Add style preview/selection
- [ ] Implement progress indicators
- [ ] Add download handling
- [ ] Create generation history view (optional)

### Phase 5: LaTeX Support (Week 4 - Optional)
- [ ] Create LaTeX templates
- [ ] Implement LaTeX generation
- [ ] Add template selection UI
- [ ] Test with Overleaf integration

### Phase 6: Testing & Polish (Week 4)
- [ ] Unit tests for Cloud Function
- [ ] Integration tests for OpenAI API
- [ ] E2E tests for generation flow
- [ ] Load testing and optimization
- [ ] Error handling improvements
- [ ] Documentation

### Phase 7: Deployment (Week 5)
- [ ] Deploy to staging environment
- [ ] Test with real data
- [ ] Monitor costs and performance
- [ ] Deploy to production
- [ ] Create user documentation

---

## Cost Estimation

### OpenAI API Costs
- **Model:** GPT-4o (2024-08-06)
- **Input:** ~$2.50 / 1M tokens
- **Output:** ~$10.00 / 1M tokens

**Per Resume Estimate:**
- Input: ~2,000 tokens (experience data + prompt)
- Output: ~1,500 tokens (resume content)
- **Cost per resume:** ~$0.02

**Monthly estimate (100 generations):** ~$2.00

### GCP Costs
- **Cloud Functions:** ~$0.10/generation (memory + execution time)
- **GCS Storage:** ~$0.02/month (20 resumes @ 1MB each)
- **Egress:** ~$0.01/download (first TB free)

**Total estimated monthly cost (100 resumes):** ~$12.00

---

## Security Considerations

1. **Authentication**
   - Editor role required
   - Firebase Auth token verification
   - Rate limiting per user

2. **API Key Management**
   - OpenAI key in Secret Manager
   - Rotation policy
   - Usage monitoring

3. **Data Privacy**
   - Generated resumes auto-expire after 30 days
   - Signed URLs with short expiration (1 hour)
   - No PII in logs
   - User consent for AI generation

4. **Rate Limiting**
   - Max 10 generations per user per day
   - Global max 100 generations per day
   - Cooldown period between requests

---

## Monitoring & Analytics

### Metrics to Track
- Generation success/failure rate
- Average generation time
- Token usage per generation
- Cost per generation
- Popular resume styles
- Download rate
- User satisfaction (optional feedback)

### Logging
```typescript
interface GenerationLog {
  id: string
  userId: string
  userEmail: string
  timestamp: string
  config: ResumeGenerationRequest
  success: boolean
  error?: string
  metrics: {
    durationMs: number
    tokenUsage: TokenUsage
    costUsd: number
  }
  resumeUrl?: string
  downloads: number
}
```

---

## Future Enhancements

1. **Template Marketplace**
   - Community-contributed templates
   - Industry-specific templates (tech, finance, healthcare)

2. **Cover Letter Generation**
   - Generate matching cover letters
   - Job description analysis

3. **Version History**
   - Save and compare resume versions
   - Track which version got interviews

4. **ATS Optimization**
   - Keyword analysis
   - ATS compatibility scoring
   - Recommendations

5. **Multi-language Support**
   - Generate resumes in multiple languages
   - Localization support

6. **Integration with Job Boards**
   - One-click apply with generated resume
   - LinkedIn profile sync

---

## Dependencies

### New NPM Packages (functions/)
```json
{
  "openai": "^4.67.0",
  "puppeteer-core": "^23.0.0",
  "@sparticuz/chromium": "^131.0.0",
  "pdfkit": "^0.15.0" // Alternative to Puppeteer
}
```

### Frontend Dependencies
```json
{
  // Already have Firebase Auth, no new deps needed
}
```

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenAI API costs exceed budget | High | Medium | Implement strict rate limiting, monitor usage, set billing alerts |
| Generated resumes have errors | High | Medium | Extensive testing, human review requirement, feedback loop |
| Cold start latency (Puppeteer) | Medium | High | Consider keeping 1 warm instance, optimize bundle size |
| OpenAI API outage | Medium | Low | Implement graceful degradation, retry logic, user notifications |
| Generated content inappropriate | High | Low | Content filtering, human review for first 100, terms of use |
| Token limit exceeded | Low | Medium | Implement chunking strategy, summarize older experience |

---

## Success Metrics

- **Technical:**
  - 95%+ generation success rate
  - < 30s average generation time
  - < $0.05 cost per resume
  - Zero security incidents

- **User:**
  - 80%+ of editors use the feature monthly
  - 90%+ satisfaction rating
  - 50%+ resumes downloaded

---

## Open Questions

1. Should we allow public users to generate resumes from their own data? (Not in v1)
2. What's the retention policy for generated resumes in GCS?
3. Do we need version control for generated resumes?
4. Should we support custom branding/themes?
5. Do we want to track which resumes lead to interviews/offers?

---

## References

- [OpenAI Structured Outputs Documentation](https://platform.openai.com/docs/guides/structured-outputs)
- [Puppeteer for Cloud Functions](https://github.com/Sparticuz/chromium)
- [Resume Best Practices (Harvard)](https://ocs.fas.harvard.edu/resumes)
- [ATS Resume Guidelines](https://www.jobscan.co/ats-resume)
