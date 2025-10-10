# AI Resume & Cover Letter Generator - Project Plan

> **Status:** In Development - Phase 1 (MVP)
> **Last Updated:** October 10, 2025

## Architecture Compatibility (Phase 1-3 Integration)

This plan has been reviewed for compatibility with the recent Phase 1-3 refactoring. All prerequisites are in place:

### ✅ Leveraging Phase 1: Configuration & Logging

- **API Configuration**: Add OpenAI config to existing `web/src/config/api.ts`
- **Logging**: Use centralized `logger` utility for generation tracking and error handling
- **Environment Variables**: Add `OPENAI_API_KEY` to Secret Manager following existing patterns

### ✅ Leveraging Phase 2: Form Components Library

- **Viewer Form**: Use `FormField` for role/company/job description inputs
- **Prompt Editor**: Reuse `MarkdownEditor` component (identical to BlurbEntry editing)
- **Form Actions**: Use `FormActions` for download/delete buttons in document manager
- **Form Validation**: Use existing `validators.ts` and `createValidator` factory
- **Async Submission**: Use `useAsyncSubmit` hook for document generation and error handling

### ✅ Leveraging Phase 3: API Architecture

- **New Client**: Create `ResumeClient` extending `ApiClient` base class
- **Blurb Integration**: Use existing `BlurbClient` for prompt storage (no new CRUD needed)
- **Error Handling**: Inherit centralized error handling from ApiClient
- **Type Safety**: Follow established patterns for API requests/responses

### Implementation Example

```typescript
// web/src/api/resume-client.ts
export class ResumeClient extends ApiClient {
  async generateDocuments(data: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    return this.post<DocumentGenerationResponse>("/resume/generate", data, false)
  }

  async listDocuments(): Promise<GenerationLog[]> {
    return this.get<GenerationLog[]>("/resume/documents", true)
  }
}

export const resumeClient = new ResumeClient()
```

### UI Component Reuse

```typescript
// Viewer form (reusing Phase 2 components)
<FormField
  label="Target Role"
  name="role"
  value={formData.role}
  onChange={(value) => setFormData({ ...formData, role: value })}
  required
/>

// Prompt editor (identical to BlurbEntry)
<MarkdownEditor
  label="Resume System Prompt"
  name="resume-system-prompt"
  value={promptData.resumeSystemPrompt}
  onChange={(value) => updatePrompt("resume-system-prompt", value)}
  rows={12}
  showPreview
/>

// Document generation (reusing Phase 2 hook)
const { handleSubmit, isSubmitting, error } = useAsyncSubmit({
  onSuccess: () => logger.info("Documents generated successfully"),
})

await handleSubmit(() => resumeClient.generateDocuments(formData))
```

---

## Overview

Add an AI-powered resume and cover letter generator on a dedicated page that uses OpenAI's API to create tailored documents based on experience entries stored in Firestore. The feature supports two user roles: **viewers** (public users) can generate documents for specific jobs, while **editors** can manage prompts and view all generated documents. All documents are stored in Google Cloud Storage with role-based access controls.

## Key Features Summary

### For Viewers (Public Users)

- Access `/resume-builder` page without authentication
- Enter **required** fields: Role, Company
- Enter **optional** fields: Company website, Job description (URL or text)
- Generate both resume and cover letter (single button click)
- Download both documents immediately (links expire in 1 hour)
- Rate limited to 10 generations per IP per day

### For Editors (Authenticated)

- Same Firebase Auth flow as `/experience` page
- Access to two tabs:
  1. **Prompt Editor:** Edit AI generation prompts (stored as blurbs)
  2. **Document Manager:** View all generated documents in a table
- Can edit 4 prompt blurbs (resume system, resume user, cover letter system, cover letter user)
- Can filter/search all generations
- Can download any document
- See analytics (cost, success rate, usage stats)

### Technical Highlights

- **Separate page:** `/resume-builder` (linked from `/experience`)
- **Dual output:** Always generates both resume and cover letter
- **Editable prompts:** Stored as blurbs with variable substitution
- **Document storage:** GCS bucket with 90-day auto-expiration
- **Access control:** Session-based for viewers, auth-based for editors
- **Cost estimate:** ~$0.034 per generation (both documents)

## Goals

- Allow viewers to generate tailored resumes and cover letters for specific job applications
- Allow editors to manage AI generation prompts and view all generated documents
- Use OpenAI's structured output API for consistent formatting
- Support multiple resume styles/templates
- Generate downloadable PDF documents (resume + cover letter)
- Store all documents in GCS with proper access controls
- Track generation history and usage with document management interface

---

## Architecture

### High-Level Flow

```
Viewer → /resume-builder page → Form (role, company, job details) → Cloud Function → OpenAI API → PDF Generation → GCS Storage → Download Links
                                                                    ↓
                                                                Firestore
                                                            (log generation)

Editor → /resume-builder page → Auth (same as /experience) → Editable prompts (blurbs) + Document table → Manage all documents
```

### User Roles & Access

**Viewer (Public User):**

- Can access `/resume-builder` page without authentication
- Required fields: Role, Company
- Optional fields: Company website, Job description URL/text
- Can generate resume + cover letter for their job application
- Can only download the documents they just created
- Cannot see other users' documents

**Editor (Authenticated):**

- Same Firebase Auth flow as `/experience` page
- Can edit AI generation prompts (stored as blurbs in Firestore)
- Can view all generated documents in a management table
- Can download any document
- Can see generation metadata (date, user, job details, cost)

### Components

1. **Frontend (React/TypeScript)**
   - **New page:** `/resume-builder` (linked from `/experience` page)
   - Auth flow identical to experience page (Firebase Auth)
   - **Viewer UI:**
     - Job application form (role, company, optional website/job description)
     - Progress indicators during generation
     - Download buttons for generated resume + cover letter
   - **Editor UI:**
     - Editable prompt blurbs (same inline editing as experience page)
     - Document management table showing all generations
     - Filters and search
     - Download buttons for any document

2. **Cloud Functions (Node.js)**
   - `generateDocuments` endpoint (creates both resume and cover letter)
   - `listDocuments` endpoint (editor-only, returns all generations)
   - OpenAI API integration with configurable prompts
   - PDF generation (puppeteer or pdfkit)
   - GCS upload with access control
   - Firestore logging

3. **OpenAI Integration**
   - Use Structured Outputs API
   - Prompts stored as editable blurbs in Firestore
   - Token usage tracking
   - Error handling and retries

4. **Storage**
   - **GCS bucket:** `joshwentworth-resumes`
   - **Path structure:** `{sessionId}/{resume.pdf, cover-letter.pdf}`
   - **Access control:** Signed URLs with short expiration (1 hour for viewers, longer for editors)
   - **Firestore collections:**
     - `resume-prompts` (blurbs for AI prompts, editable by editors)
     - `resume-generations` (generation logs with metadata)

5. **Prompt Management (Blurbs)**
   - Prompts stored as blurbs in Firestore (same as experience page)
   - Blurb IDs: `resume-system-prompt`, `resume-user-prompt`, `cover-letter-system-prompt`, `cover-letter-user-prompt`
   - Inline editing UI identical to experience page
   - Markdown support for prompt templates

---

## Technical Specifications

### 1. Data Flow

#### Input: Document Generation Request

```typescript
interface DocumentGenerationRequest {
  // Required fields
  role: string // "Senior Full-Stack Engineer"
  company: string // "Google"

  // Optional fields
  companyWebsite?: string // "https://google.com"
  jobDescriptionUrl?: string // URL to fetch job description
  jobDescriptionText?: string // Or paste job description directly

  // Editor-only fields (hidden for viewers)
  style?: "modern" | "traditional" | "technical" | "executive" // Default: 'modern'
  emphasize?: string[] // Keywords/technologies to emphasize
}
```

#### Output: Generated Documents

```typescript
interface DocumentGenerationResponse {
  success: boolean
  sessionId: string // Unique ID for this generation

  // Download URLs (signed, short-lived)
  resumeUrl: string // GCS signed URL for resume.pdf
  coverLetterUrl: string // GCS signed URL for cover-letter.pdf

  metadata: {
    generatedAt: string
    role: string
    company: string
    style: string
    tokenUsage: {
      resumePrompt: number
      resumeCompletion: number
      coverLetterPrompt: number
      coverLetterCompletion: number
      total: number
    }
    costUsd: number
    model: string
  }
}
```

#### Firestore Schema: Generator Collection

**Collection:** `generator`

This collection uses a **three-document-type approach** for clear separation of concerns:

1. **One `default` document** - Default personal settings
2. **Request documents (`resume-generator-request-{id}`)** - Generation requests with input snapshots
3. **Response documents (`resume-generator-response-{id}`)** - Generated files, OpenAI outputs, metrics

**Key Features:**

- ✅ Request/response separation for better data organization
- ✅ Flexible generation options: resume only, cover letter only, or both (same for editors & viewers)
- ✅ Complete reproducibility via snapshots
- ✅ Easy debugging (trace response → request → inputs)

> **Note:** See [generator-firestore-schema.md](generator-firestore-schema.md) for complete schema documentation including:
>
> - Full TypeScript interfaces
> - Example documents
> - Query patterns
> - Firestore indexes
> - Security rules

**Collection Structure:**

```
generator/
├── default                                      # Default settings
├── resume-generator-request-1697123456-abc123  # Request document
├── resume-generator-response-1697123456-abc123 # Response document (matches request)
└── ...
```

**Generation Types:**

```typescript
type GenerationType = "resume" | "coverLetter" | "both"
```

Users (both editors and viewers) can choose to generate:

- Resume only
- Cover letter only
- Both documents

**Example Flow:**

1. User submits generation request
2. System creates `resume-generator-request-{id}` with:
   - Generation type (resume/coverLetter/both)
   - Job details (role, company, description)
   - Snapshot of defaults and experience data
3. System processes request and creates `resume-generator-response-{id}` with:
   - OpenAI generated content
   - GCS file paths and signed URLs
   - Metrics (duration, tokens, cost)
   - Download tracking

### 2. OpenAI Integration

#### Structured Output Schemas

**Resume Content:**

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
  professionalSummary: string
  experience: {
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    highlights: string[] // Bullet points optimized for job
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
}
```

**Cover Letter Content:**

```typescript
interface CoverLetterContent {
  greeting: string // "Dear Hiring Manager," or "Dear [Name],"
  openingParagraph: string // Hook + role you're applying for
  bodyParagraphs: string[] // 2-3 paragraphs highlighting relevant experience
  closingParagraph: string // Call to action + thank you
  signature: string // "Sincerely, [Name]"
}
```

#### Prompt Management (Editable Blurbs)

Prompts are stored as blurbs in Firestore and editable by editors through inline editing UI:

**Blurb IDs:**

- `resume-system-prompt` - System instructions for resume generation
- `resume-user-prompt-template` - User prompt template for resume (supports variables)
- `cover-letter-system-prompt` - System instructions for cover letter generation
- `cover-letter-user-prompt-template` - User prompt template for cover letter (supports variables)

**Variable Substitution:**

Templates support these variables:

- `{role}` - Target role
- `{company}` - Company name
- `{companyWebsite}` - Company website URL (if provided)
- `{jobDescription}` - Job description text (if provided)
- `{style}` - Resume style
- `{emphasize}` - Keywords to emphasize (comma-separated)

**Example Resume System Prompt (Default):**

```
You are an expert resume writer with 20+ years of experience helping software engineers
land positions at top tech companies. You specialize in ATS-friendly resumes that highlight
technical accomplishments with quantifiable impact. You tailor each resume to the specific
role and company, emphasizing relevant experience and skills.
```

**Example Resume User Prompt Template (Default):**

```
Create a {style} resume for the "{role}" position at {company}.

Experience Data:
{experienceData}

Job Details:
- Company: {company}
- Website: {companyWebsite}
- Role: {role}
- Job Description: {jobDescription}

Requirements:
- Use action verbs and quantify achievements where possible
- Tailor experience highlights to match the job description
- Emphasize: {emphasize}
- Target length: 1 page
- Focus on recent and relevant experience
- Ensure ATS compatibility
- Highlight skills and technologies mentioned in job description

Output Format: Structured JSON matching the ResumeContent schema
```

**Example Cover Letter System Prompt (Default):**

```
You are an expert cover letter writer specializing in helping software engineers
craft compelling, personalized cover letters. Your letters are concise (3-4 paragraphs),
professional, and highlight the candidate's most relevant accomplishments for the
specific role and company.
```

**Example Cover Letter User Prompt Template (Default):**

```
Create a professional cover letter for the "{role}" position at {company}.

Candidate Experience:
{experienceData}

Job Details:
- Company: {company}
- Website: {companyWebsite}
- Role: {role}
- Job Description: {jobDescription}

Requirements:
- 3-4 paragraphs maximum
- Professional but warm tone
- Highlight 2-3 most relevant accomplishments from experience
- Show knowledge of company (if website/description provided)
- Explain why candidate is a great fit for this specific role
- Include clear call to action

Output Format: Structured JSON matching the CoverLetterContent schema
```

#### API Configuration

```typescript
const openaiConfig = {
  model: "gpt-4o-2024-08-06", // Supports structured outputs
  temperature: 0.3, // Lower for consistency
  max_tokens: 4000,
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "resume_content",
      schema: resumeContentSchema,
      strict: true,
    },
  },
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
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"

async function generatePDF(resumeContent: ResumeContent, style: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  })

  const html = renderResumeHTML(resumeContent, style)
  const page = await browser.newPage()
  await page.setContent(html)

  const pdf = await page.pdf({
    format: "Letter",
    printBackground: true,
    margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
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
import PDFDocument from "pdfkit"

async function generatePDF(resumeContent: ResumeContent, style: string) {
  const doc = new PDFDocument({ size: "Letter", margin: 50 })

  // Header
  doc.fontSize(24).text(resumeContent.personalInfo.name)
  doc.fontSize(14).text(resumeContent.personalInfo.title)

  // Experience section
  resumeContent.experience.forEach((exp) => {
    doc.fontSize(16).text(exp.company)
    doc.fontSize(12).text(exp.role)
    exp.highlights.forEach((highlight) => {
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
${resumeContent.experience
  .map(
    (exp) => `
\\cventry{${exp.startDate}--${exp.endDate || "Present"}}{${exp.role}}{${exp.company}}{${exp.location || ""}}{}{
  \\begin{itemize}
    ${exp.highlights.map((h) => `\\item ${h}`).join("\n    ")}
  \\end{itemize}
}
`
  )
  .join("\n")}

\\end{document}
`
}
```

### 5. Cloud Function Implementation

```typescript
// functions/src/document-generator.ts

export const generateDocuments = https.onRequest(
  {
    region: "us-central1",
    secrets: ["openai-api-key"],
    memory: "1GiB", // For Puppeteer
    maxInstances: 10,
    timeoutSeconds: 300, // 5 minutes for generation
    cors: true, // Allow public access
  },
  async (req: Request, res: Response) => {
    // 1. Validate request (no auth required, but generate session ID)
    // 2. Fetch experience entries from Firestore
    // 3. Fetch prompt blurbs from Firestore
    // 4. If jobDescriptionUrl provided, fetch job description
    // 5. Build prompts with variable substitution
    // 6. Call OpenAI API for resume generation
    // 7. Call OpenAI API for cover letter generation
    // 8. Generate resume PDF
    // 9. Generate cover letter PDF
    // 10. Upload both PDFs to GCS with sessionId path
    // 11. Log generation to Firestore with sessionId for viewer access
    // 12. Return signed URLs (1 hour expiration)
  }
)

export const listDocuments = https.onCall(
  {
    region: "us-central1",
  },
  async (data, context) => {
    // 1. Authenticate (Firebase Auth - editor only)
    if (!context.auth) {
      throw new HttpsError("unauthenticated", "Must be authenticated")
    }

    // 2. Verify editor role
    const isEditor = await checkEditorRole(context.auth.uid)
    if (!isEditor) {
      throw new HttpsError("permission-denied", "Editor role required")
    }

    // 3. Query all generation logs from Firestore
    // 4. Apply filters/pagination from request
    // 5. Return list with metadata
  }
)

export const getDocument = https.onCall(
  {
    region: "us-central1",
  },
  async (data: { sessionId: string; documentType: "resume" | "cover-letter" }, context) => {
    // 1. Fetch generation log by sessionId
    // 2. If authenticated as editor, allow access
    // 3. If not authenticated, check if sessionId matches viewer's session (stored in browser)
    // 4. Generate signed URL with appropriate expiration
    // 5. Return download URL
  }
)
```

### 6. Frontend Implementation

#### Page: `/resume-builder`

```typescript
// web/src/pages/resume-builder.tsx

export default function ResumePage() {
  const { user, loading } = useAuth() // Same hook as experience page
  const isEditor = useEditorRole(user)

  if (loading) return <LoadingSpinner />

  return (
    <Layout>
      {isEditor ? (
        <EditorView />
      ) : (
        <ViewerView />
      )}
    </Layout>
  )
}
```

#### Viewer Component

```typescript
// web/src/components/resume-builder/ViewerView.tsx

export const ViewerView: React.FC = () => {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<DocumentGenerationResponse | null>(null)
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    companyWebsite: '',
    jobDescriptionUrl: '',
    jobDescriptionText: '',
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const response = await fetch(GENERATE_DOCUMENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setResult(data)
        // Store sessionId in sessionStorage for future retrieval
        sessionStorage.setItem('resumeSessionId', data.sessionId)
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Container>
      <Heading>Generate Your Resume & Cover Letter</Heading>
      <Text>
        Create tailored documents for your job application.
        Both a resume and cover letter will be generated.
      </Text>

      <Form>
        {/* Required fields */}
        <Input
          label="Target Role"
          placeholder="Senior Full-Stack Engineer"
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
        <Input
          label="Company Name"
          placeholder="Google"
          required
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />

        {/* Optional fields */}
        <Input
          label="Company Website (Optional)"
          placeholder="https://google.com"
          value={formData.companyWebsite}
          onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
        />
        <Input
          label="Job Description URL (Optional)"
          placeholder="https://careers.google.com/jobs/12345"
          value={formData.jobDescriptionUrl}
          onChange={(e) => setFormData({ ...formData, jobDescriptionUrl: e.target.value })}
        />
        <Textarea
          label="Or Paste Job Description (Optional)"
          placeholder="Paste the full job description here..."
          rows={6}
          value={formData.jobDescriptionText}
          onChange={(e) => setFormData({ ...formData, jobDescriptionText: e.target.value })}
        />

        <Button onClick={handleGenerate} disabled={generating || !formData.role || !formData.company}>
          {generating ? 'Generating Documents...' : 'Generate Resume & Cover Letter'}
        </Button>
      </Form>

      {/* Show results */}
      {result && (
        <ResultCard>
          <Heading>Your Documents are Ready!</Heading>
          <ButtonGroup>
            <Button as="a" href={result.resumeUrl} download>
              Download Resume
            </Button>
            <Button as="a" href={result.coverLetterUrl} download>
              Download Cover Letter
            </Button>
          </ButtonGroup>
          <Text variant="small">
            Links expire in 1 hour. Download them now.
          </Text>
        </ResultCard>
      )}
    </Container>
  )
}
```

#### Editor Component

```typescript
// web/src/components/resume-builder/EditorView.tsx

export const EditorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'documents'>('prompts')

  return (
    <Container>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="prompts">Edit Prompts</Tab>
        <Tab value="documents">View All Documents</Tab>
      </Tabs>

      {activeTab === 'prompts' ? (
        <PromptEditor />
      ) : (
        <DocumentManager />
      )}
    </Container>
  )
}
```

#### Prompt Editor (Inline Editing like Experience Page)

```typescript
// web/src/components/resume-builder/PromptEditor.tsx

export const PromptEditor: React.FC = () => {
  const blurbIds = [
    'resume-system-prompt',
    'resume-user-prompt-template',
    'cover-letter-system-prompt',
    'cover-letter-user-prompt-template',
  ]

  return (
    <Container>
      <Heading>AI Prompt Configuration</Heading>
      <Text>
        Edit the prompts used to generate resumes and cover letters.
        Use variables like {'{role}'}, {'{company}'}, {'{jobDescription}'}.
      </Text>

      {blurbIds.map(blurbId => (
        <BlurbEditor
          key={blurbId}
          blurbId={blurbId}
          // Same component as experience page
        />
      ))}

      <InfoBox>
        <strong>Available Variables:</strong>
        <ul>
          <li><code>{'{role}'}</code> - Target role</li>
          <li><code>{'{company}'}</code> - Company name</li>
          <li><code>{'{companyWebsite}'}</code> - Company website</li>
          <li><code>{'{jobDescription}'}</code> - Job description</li>
          <li><code>{'{style}'}</code> - Resume style</li>
          <li><code>{'{emphasize}'}</code> - Keywords to emphasize</li>
          <li><code>{'{experienceData}'}</code> - JSON experience data</li>
        </ul>
      </InfoBox>
    </Container>
  )
}
```

#### Document Management Table

```typescript
// web/src/components/resume-builder/DocumentManager.tsx

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<GenerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    startDate: null,
    endDate: null,
  })

  useEffect(() => {
    loadDocuments()
  }, [filters])

  const loadDocuments = async () => {
    setLoading(true)
    const listDocuments = httpsCallable(functions, 'listDocuments')
    const result = await listDocuments({ filters })
    setDocuments(result.data.documents)
    setLoading(false)
  }

  return (
    <Container>
      <Heading>All Generated Documents</Heading>

      <FilterBar>
        <Input
          placeholder="Search by role or company..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={(start, end) => setFilters({ ...filters, startDate: start, endDate: end })}
        />
      </FilterBar>

      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Role</th>
            <th>Company</th>
            <th>Style</th>
            <th>Status</th>
            <th>Cost</th>
            <th>Downloads</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id}>
              <td>{formatDate(doc.timestamp)}</td>
              <td>{doc.role}</td>
              <td>
                {doc.company}
                {doc.companyWebsite && (
                  <a href={doc.companyWebsite} target="_blank" rel="noopener">
                    <ExternalLinkIcon />
                  </a>
                )}
              </td>
              <td>{doc.style}</td>
              <td>
                {doc.success ? (
                  <Badge variant="success">Success</Badge>
                ) : (
                  <Badge variant="error">Failed</Badge>
                )}
              </td>
              <td>${doc.costUsd.toFixed(3)}</td>
              <td>{doc.downloads}</td>
              <td>
                <ButtonGroup>
                  <IconButton onClick={() => downloadDocument(doc.id, 'resume')}>
                    <DownloadIcon /> Resume
                  </IconButton>
                  <IconButton onClick={() => downloadDocument(doc.id, 'cover-letter')}>
                    <DownloadIcon /> Cover Letter
                  </IconButton>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination, stats, etc. */}
    </Container>
  )
}
```

---

## Implementation Plan

### **UPDATED MVP APPROACH (Two Phases)**

This replaces the original 10-phase plan with a streamlined two-phase approach.

---

### **Phase 1: MVP - Core Generation Proof of Concept**

**Goal:** Prove we can generate a PDF resume from OpenAI API call

**Scope:**

- Minimal viable function to test OpenAI integration and PDF generation
- No UI, no GCS storage, no rate limiting yet
- Direct PDF response (download immediately)
- Hardcoded or minimal inputs for testing

**Tasks:**

- [ ] Add OpenAI API key to Secret Manager
- [ ] Create `generator` collection in Firestore:
  - [ ] Create `default` document with `GeneratorDefaults` schema
  - [ ] Fields: `name`, `email`, `phone`, `location`, `website`, `github`, `linkedin`, `avatar`, `logo`, `accentColor`, `defaultStyle`
  - [ ] All fields required but handle empty/null gracefully
  - [ ] Set up Firestore indexes for generation log queries
- [ ] Install dependencies:
  - [ ] `openai` SDK
  - [ ] `puppeteer-core` + `@sparticuz/chromium`
  - [ ] `handlebars`
- [ ] Create Cloud Function: `generateResume` (basic version)
  - [ ] Fetch experience-entries from Firestore
  - [ ] Fetch experience-blurbs from Firestore
  - [ ] Fetch generator defaults from `generator/default` document
  - [ ] Build OpenAI prompt with structured output schema
  - [ ] Call OpenAI API to generate resume content
  - [ ] Create generation log document with `GenerationLog` schema
  - [ ] Log request data, experience snapshot, and OpenAI response
  - [ ] Generate HTML using Handlebars template
  - [ ] Convert HTML to PDF using Puppeteer
  - [ ] Return PDF as direct download (no GCS yet)
  - [ ] Update generation log with metrics (duration, tokens, cost)
- [ ] Create basic Handlebars resume template (modern style)
- [ ] Test end-to-end with hardcoded job inputs

**Deliverables:**

- Working Cloud Function that generates a PDF resume
- Proof of concept for OpenAI + Puppeteer integration
- Basic resume template

**Success Criteria:**

- Can generate a PDF resume from Cloud Function
- Resume contains real experience data from Firestore
- PDF is downloadable and properly formatted
- Total generation time < 30 seconds

---

### **Phase 2: Full Implementation - UI, Storage, Permissions**

**Goal:** Production-ready feature with complete UI and all features

**Scope:**

- Full viewer and editor UI
- GCS storage with signed URLs
- Rate limiting and security
- Cover letter generation
- Document management
- All advanced features

**Tasks:**

#### Backend

- [ ] Set up GCS bucket `joshwentworth-resumes` with lifecycle policy (90-day expiration)
- [ ] Expand Cloud Function to full implementation (generation logs already in `generator` collection):
  - [ ] Support both resume AND cover letter generation
  - [ ] Upload PDFs to GCS (path: `{sessionId}/{resume.pdf, cover-letter.pdf}`)
  - [ ] Log generation to Firestore with metadata
  - [ ] Generate signed URLs (1 hour for viewers, 7 days for editors)
  - [ ] Handle job description URL fetching (via OpenAI)
  - [ ] Implement rate limiting using `express-rate-limit` (10 per 15min for viewers)
  - [ ] Add App Check verification (already have middleware)
  - [ ] Support editor overrides for generator defaults
- [ ] Create Cloud Function: `listDocuments` (editor-only)
  - [ ] Auth middleware for editors
  - [ ] Query generation logs with filters
  - [ ] Return list with metadata
- [ ] Create Cloud Function: `getDocument` (editor or viewer session check)
  - [ ] Generate signed URLs for re-download
  - [ ] Track download counts
- [ ] Create 4 default prompt blurbs in Firestore:
  - [ ] `resume-system-prompt`
  - [ ] `resume-user-prompt-template`
  - [ ] `cover-letter-system-prompt`
  - [ ] `cover-letter-user-prompt-template`
- [ ] Implement variable substitution for prompts
- [ ] Create Handlebars template for cover letter

#### Frontend

- [ ] Create `/resume-builder` page
- [ ] Implement Experience Data Provider (reduce redundant API calls)
- [ ] Create `ViewerView` component:
  - [ ] Form with required fields: role, company
  - [ ] Optional fields: company website, job description URL/text
  - [ ] URL validation
  - [ ] Progress indicators during generation
  - [ ] Result display with download buttons
  - [ ] Store sessionId in sessionStorage
- [ ] Create `EditorView` component with two tabs:
  - [ ] **Tab 1: Prompt Editor**
    - [ ] Display 4 prompt blurbs with inline editing
    - [ ] Reuse `MarkdownEditor` from experience page
    - [ ] Show variable documentation
  - [ ] **Tab 2: Document Manager**
    - [ ] Table with all generation logs
    - [ ] Filters: search, date range
    - [ ] Download buttons for resume and cover letter
    - [ ] Pagination
    - [ ] Stats: total cost, total generations, success rate
- [ ] Create "Edit Defaults" modal for editors:
  - [ ] Form to edit generator-defaults
  - [ ] All fields editable before generation
  - [ ] Save to Firestore
- [ ] Add link from `/experience` page to `/resume-builder`
- [ ] Create `ResumeClient` extending `ApiClient`

#### Testing & Polish

- [ ] Unit tests for Cloud Functions
- [ ] Integration tests for OpenAI and GCS
- [ ] E2E tests for viewer and editor flows
- [ ] Error handling improvements
- [ ] Load testing
- [ ] Security review

#### Deployment

- [ ] Deploy to staging
- [ ] Seed default prompts and generator-defaults
- [ ] Test end-to-end
- [ ] Deploy to production
- [ ] Monitor initial usage

**Deliverables:**

- Complete, production-ready resume generator feature
- Full UI for viewers and editors
- Document storage and management
- Monitoring and analytics

**Success Criteria:**

- All user flows work end-to-end
- 95%+ generation success rate
- < 30s average generation time
- Rate limiting prevents abuse
- Editors can manage prompts and view all documents

---

### Original 10-Phase Plan (DEPRECATED - Replaced by MVP Approach Above)

The following phases are kept for reference but have been superseded by the two-phase MVP approach.

### Phase 1: Foundation & Infrastructure (Week 1)

- [ ] Set up OpenAI API credentials in Secret Manager
- [ ] Create Firestore collections:
  - [ ] `resume-generations` (generation logs)
  - [ ] `blurbs` (if not exists, for prompt storage)
- [ ] Create GCS bucket `joshwentworth-resumes` with proper IAM
- [ ] Add dependencies to functions:
  - [ ] `openai` SDK
  - [ ] `puppeteer-core` + `@sparticuz/chromium`
- [ ] Set up Cloud Function structure for `generateDocuments`

### Phase 2: Prompt Management (Week 1-2)

- [ ] Create default prompt blurbs in Firestore:
  - [ ] `resume-system-prompt`
  - [ ] `resume-user-prompt-template`
  - [ ] `cover-letter-system-prompt`
  - [ ] `cover-letter-user-prompt-template`
- [ ] Implement variable substitution system
- [ ] Test prompt templates with various inputs

### Phase 3: OpenAI Integration (Week 2)

- [ ] Design structured output schemas:
  - [ ] `ResumeContent` schema
  - [ ] `CoverLetterContent` schema
- [ ] Implement OpenAI API calls:
  - [ ] Resume generation with structured outputs
  - [ ] Cover letter generation with structured outputs
- [ ] Add error handling and retries
- [ ] Implement token usage tracking
- [ ] Add cost calculation
- [ ] Test with real experience data

### Phase 4: PDF Generation (Week 2-3)

- [ ] Set up Puppeteer/chromium for Cloud Functions
- [ ] Create HTML templates:
  - [ ] Resume template (modern style)
  - [ ] Cover letter template
  - [ ] Additional styles (traditional, technical, executive)
- [ ] Implement PDF generation logic
- [ ] Test PDF quality and formatting
- [ ] Optimize PDF file sizes

### Phase 5: Cloud Functions (Week 3)

- [ ] Implement `generateDocuments` endpoint:
  - [ ] Request validation
  - [ ] Fetch experience data from Firestore
  - [ ] Fetch prompt blurbs from Firestore
  - [ ] Job description fetching (if URL provided)
  - [ ] Call OpenAI APIs (resume + cover letter)
  - [ ] Generate PDFs
  - [ ] Upload to GCS with sessionId path
  - [ ] Log to Firestore
  - [ ] Return signed URLs
- [ ] Implement `listDocuments` endpoint (editor-only):
  - [ ] Auth middleware
  - [ ] Query Firestore with filters
  - [ ] Pagination
- [ ] Implement `getDocument` endpoint:
  - [ ] Access control (editor or viewer session check)
  - [ ] Generate signed URLs
- [ ] Add rate limiting (prevent abuse)

### Phase 6: Frontend - Viewer UI (Week 3-4)

- [ ] Create `/resume-builder` page
- [ ] Implement `ViewerView` component:
  - [ ] Job application form (role, company, optional fields)
  - [ ] Form validation
  - [ ] Progress indicators
  - [ ] Result display with download buttons
  - [ ] Session storage for sessionId
- [ ] Add link from `/experience` page to `/resume-builder`

### Phase 7: Frontend - Editor UI (Week 4)

- [ ] Implement auth flow (identical to experience page)
- [ ] Create `EditorView` component with tabs:
  - [ ] Prompt Editor tab
  - [ ] Document Manager tab
- [ ] Implement `PromptEditor` component:
  - [ ] Reuse `BlurbEditor` from experience page
  - [ ] Display 4 prompt blurbs
  - [ ] Show variable documentation
- [ ] Implement `DocumentManager` component:
  - [ ] Table with all generations
  - [ ] Filters (search, date range)
  - [ ] Download buttons
  - [ ] Pagination
  - [ ] Stats (total cost, total generations)

### Phase 8: Testing & Polish (Week 4-5)

- [ ] Unit tests:
  - [ ] Cloud Function logic
  - [ ] Variable substitution
  - [ ] PDF generation
- [ ] Integration tests:
  - [ ] OpenAI API integration
  - [ ] GCS upload/download
  - [ ] Firestore operations
- [ ] E2E tests:
  - [ ] Viewer flow (generate + download)
  - [ ] Editor flow (edit prompts + view documents)
- [ ] Load testing and optimization
- [ ] Error handling improvements
- [ ] Security review (rate limiting, access control)

### Phase 9: Deployment (Week 5)

- [ ] Deploy Cloud Functions to staging
- [ ] Deploy frontend to staging
- [ ] Seed default prompts in staging Firestore
- [ ] Test end-to-end in staging
- [ ] Monitor costs and performance
- [ ] Deploy to production
- [ ] Monitor initial usage
- [ ] Create user documentation

### Phase 10: Future Enhancements (Post-Launch)

- [ ] Add more resume styles (minimalist, creative, etc.)
- [ ] Support for LaTeX export
- [ ] ATS optimization scoring
- [ ] Version history for generated documents
- [ ] Analytics on successful job applications
- [ ] Multi-language support

---

## Cost Estimation

### OpenAI API Costs

- **Model:** GPT-4o (2024-08-06)
- **Input:** ~$2.50 / 1M tokens
- **Output:** ~$10.00 / 1M tokens

**Per Document Set Estimate (Resume + Cover Letter):**

**Resume:**

- Input: ~2,500 tokens (experience data + job description + prompt)
- Output: ~1,500 tokens (resume content)
- Cost: ~$0.021

**Cover Letter:**

- Input: ~2,000 tokens (experience data + job description + prompt)
- Output: ~800 tokens (cover letter content)
- Cost: ~$0.013

**Total per generation (both documents):** ~$0.034

**Monthly estimate (100 generations):** ~$3.40

### GCP Costs

- **Cloud Functions:** ~$0.15/generation (memory + execution time for 2 PDFs)
- **GCS Storage:** ~$0.02/month (40 files @ 20 generations × 2 docs @ 1MB each)
- **Egress:** ~$0.02/download (first TB free, minimal impact)
- **Firestore:** ~$0.01/month (reads/writes for logs + prompts)

**Total estimated monthly cost (100 generations):** ~$18.50

### Cost Controls

- Rate limit: 10 generations per IP per day (viewers)
- No rate limit for authenticated editors
- Documents auto-expire after 90 days (GCS lifecycle policy)
- Monitor daily spend with billing alerts ($50/month threshold)

---

## Security Considerations

1. **Authentication & Authorization**
   - **Viewers:** No auth required, but IP-based rate limiting
   - **Editors:** Firebase Auth required (same as experience page)
   - **Document Access:**
     - Viewers: Can only access their own session's documents via sessionId
     - Editors: Can access all documents
   - Signed URLs with short expiration (1 hour for viewers, 7 days for editors)

2. **API Key Management**
   - OpenAI key in Secret Manager
   - Rotation policy (quarterly)
   - Usage monitoring with alerts
   - Never expose API keys to frontend

3. **Data Privacy**
   - Generated documents auto-expire after 90 days (GCS lifecycle policy)
   - Signed URLs with appropriate expiration
   - No PII stored in generation logs (sessionId only, not names/emails from resume)
   - Job description URLs logged but not content
   - GDPR compliance: data deletion on request

4. **Rate Limiting**
   - **Viewers (unauthenticated):**
     - Max 10 generations per IP per day
     - Max 3 concurrent requests per IP
     - CAPTCHA after 5 generations per day (future enhancement)
   - **Editors (authenticated):**
     - No hard limit, but monitor for abuse
   - **Global limits:**
     - Max 500 generations per day
     - Circuit breaker if OpenAI costs exceed $100/day

5. **Input Validation**
   - Sanitize all user inputs (role, company, job description)
   - URL validation for job description and company website
   - Prevent injection attacks in prompts
   - Limit job description length (10,000 characters max)

6. **Access Control**
   - Session IDs are UUIDs (non-guessable)
   - sessionStorage (not localStorage) for viewer sessions
   - Firestore security rules prevent unauthorized access
   - GCS bucket not publicly accessible (signed URLs only)

---

## Monitoring & Analytics

### Metrics to Track

**Generation Metrics:**

- Success/failure rate (overall and by document type)
- Average generation time (total, resume only, cover letter only)
- Token usage per generation (resume vs. cover letter)
- Cost per generation
- Peak usage times

**User Metrics:**

- Total generations (viewers vs. editors)
- Unique IPs generating documents
- Repeat usage rate
- Most common roles/companies
- Job description usage rate (URL vs. text vs. none)

**Document Metrics:**

- Download rate (% of generated documents downloaded)
- Time to download (after generation)
- Popular resume styles (when we add more)
- Document expiration before download rate

**Cost Metrics:**

- Daily/weekly/monthly OpenAI costs
- Daily/weekly/monthly GCP costs
- Cost per generation trend over time
- Rate limit hits

### Dashboards

**Editor Dashboard (in Document Manager):**

- Total generations (all time, this month, this week)
- Total cost (all time, this month, this week)
- Success rate graph
- Recent generations table
- Top roles/companies

**Cloud Monitoring:**

- Cloud Function invocations
- Error rates
- Latency (p50, p95, p99)
- OpenAI API latency
- GCS upload/download metrics

### Alerts

- OpenAI daily cost exceeds $10
- Error rate exceeds 5%
- Rate limit frequently hit
- Cloud Function cold starts exceed 10s
- GCS storage exceeds 10GB

---

## Future Enhancements

1. **Additional Resume Styles**
   - Minimalist template
   - Creative/designer template
   - Academic CV template
   - Industry-specific templates (tech, finance, healthcare, creative)

2. **Advanced Customization (Editor-Only)**
   - Custom color schemes
   - Font selection
   - Section ordering
   - Logo/branding support

3. **ATS Optimization**
   - Keyword analysis against job description
   - ATS compatibility scoring
   - Recommendations for improvement
   - Match percentage

4. **Version History**
   - Save and compare document versions
   - Track which version was used for which application
   - "Copy from previous" feature

5. **Job Description Analysis**
   - Auto-extract key requirements from job posting
   - Highlight matching skills from experience
   - Suggest missing keywords to add

6. **Multi-language Support**
   - Generate resumes in multiple languages
   - Translation support
   - Localized formatting (EU vs. US resume styles)

7. **LaTeX Export**
   - Generate LaTeX source for advanced users
   - Overleaf integration
   - Custom LaTeX templates

8. **Analytics for Job Seekers**
   - Track applications (role, company, date)
   - Record outcomes (interview, offer, rejection)
   - Success rate analysis
   - "Most successful resume style" insights

9. **CAPTCHA for Rate Limiting**
   - Add CAPTCHA after 5 generations per day
   - Prevent bot abuse
   - Protect against cost overruns

10. **Email Delivery**
    - Email documents to user
    - Scheduled reminders to download before expiration
    - Application tracking emails

---

## Dependencies

### New NPM Packages (functions/)

```json
{
  "openai": "^4.67.0",
  "puppeteer-core": "^23.0.0",
  "@sparticuz/chromium": "^131.0.0",
  "handlebars": "^4.7.8"
}
```

**Note:** Using Handlebars for HTML templating with Puppeteer PDF generation.

### Frontend Dependencies

```json
{
  // Already have Firebase Auth, no new deps needed
}
```

---

## Risks & Mitigations

| Risk                            | Impact | Likelihood | Mitigation                                                        |
| ------------------------------- | ------ | ---------- | ----------------------------------------------------------------- |
| OpenAI API costs exceed budget  | High   | Medium     | Implement strict rate limiting, monitor usage, set billing alerts |
| Generated resumes have errors   | High   | Medium     | Extensive testing, human review requirement, feedback loop        |
| Cold start latency (Puppeteer)  | Medium | High       | Consider keeping 1 warm instance, optimize bundle size            |
| OpenAI API outage               | Medium | Low        | Implement graceful degradation, retry logic, user notifications   |
| Generated content inappropriate | High   | Low        | Content filtering, human review for first 100, terms of use       |
| Token limit exceeded            | Low    | Medium     | Implement chunking strategy, summarize older experience           |

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

## Open Questions & Decisions

### Resolved

1. ✅ **Should we allow public users to generate documents?**
   - **Decision:** Yes, viewers (public) can generate documents without auth
   - Role and company are required; job description is optional
   - Rate limiting prevents abuse

2. ✅ **What's the retention policy for generated documents in GCS?**
   - **Decision:** 90 days auto-expiration via GCS lifecycle policy
   - Balances storage costs with reasonable access period

3. ✅ **How do viewers access their documents?**
   - **Decision:** SessionId stored in sessionStorage
   - Viewers can only access documents from current session
   - Signed URLs expire in 1 hour

4. ✅ **How do editors manage prompts?**
   - **Decision:** Prompts stored as blurbs in Firestore
   - Same inline editing UI as experience page
   - Variable substitution for dynamic content

5. ✅ **Should we generate cover letters?**
   - **Decision:** Yes, always generate both resume and cover letter together
   - Two separate PDFs
   - Separate OpenAI calls with different prompts

6. ✅ **HTML Templating Library?**
   - **Decision:** Use Handlebars for PDF generation
   - Provides flexibility for advanced templating
   - Built-in partials, helpers, and HTML escaping
   - Clean separation of logic and templates

7. ✅ **Rate Limiting Implementation?**
   - **Decision:** Use existing `express-rate-limit` pattern (same as contact form)
   - Already have Firebase App Check middleware for bot protection
   - For resume generation: 10 requests per 15 minutes per IP (public users)
   - Editors: More generous limits or no rate limiting

8. ✅ **Personal Information Storage?**
   - **Decision:** Create new `generator-defaults` collection in Firestore
   - Single document contains: name, email, github, linkedin, avatar, logo, accentColor
   - All values required but handle falsiness elegantly
   - Editors can modify defaults via "Edit Defaults" modal before generation
   - Viewers use stored defaults (no editing allowed)

9. ✅ **Experience Data Provider?**
   - **Decision:** Implement provider/context to reduce redundant API calls
   - Reuse experience-entries and experience-blurbs data from existing experience page
   - Share data between pages when already loaded

10. ✅ **Job Description Handling?**
    - **Decision:** OpenAI can read job descriptions from URLs directly
    - Validate URL format on frontend
    - Pass URL to OpenAI for automatic fetching and parsing
    - Also support pasted text as alternative

11. ✅ **MVP Implementation Plan?**
    - **Decision:** Two-phase approach
    - **Phase 1 (MVP):** Proof of concept - Generate PDF from OpenAI API call (no GCS, no UI)
    - **Phase 2 (Full):** Complete UI, GCS storage, permissions, rate limiting, document management

### Open (Future Consideration)

1. **Should we collect email addresses from viewers?**
   - Pros: Can send documents via email, remind before expiration
   - Cons: Privacy concerns, requires consent, storage
   - **Current:** No email collection in v1

2. **Should we provide preview before download?**
   - Pros: Better UX, users can regenerate if needed
   - Cons: Complex frontend PDF rendering, slower
   - **Current:** No preview in v1, just download

3. **Should we support uploading existing resumes for improvement?**
   - Pros: Useful for users with existing resumes
   - Cons: Complex parsing, file upload handling
   - **Current:** Not in v1

4. **Should we add A/B testing for prompts?**
   - Pros: Optimize prompt quality over time
   - Cons: Complex setup, need metrics for "better"
   - **Current:** Not in v1

5. **Should we support multiple experience profiles?**
   - Pros: Useful for editors with different career focuses
   - Cons: Complex data model
   - **Current:** Single experience profile in v1

---

## References

- [OpenAI Structured Outputs Documentation](https://platform.openai.com/docs/guides/structured-outputs)
- [Puppeteer for Cloud Functions](https://github.com/Sparticuz/chromium)
- [Resume Best Practices (Harvard)](https://ocs.fas.harvard.edu/resumes)
- [ATS Resume Guidelines](https://www.jobscan.co/ats-resume)
