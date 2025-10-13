# AI Resume Generator - Architecture

> **System Design:** Multi-provider AI generation with GCS storage and Firestore tracking

## Overview

AI-powered resume and cover letter generator with:
- **Multi-provider AI** (OpenAI GPT-4o, Google Gemini 2.0 Flash)
- **PDF Export** (Puppeteer + Handlebars templates)
- **Cloud Storage** (GCS with signed URLs and lifecycle management)
- **Firebase Auth** (optional, with editor role support)
- **Firestore Tracking** (complete request/response history)
- **Rate Limiting** (10 viewer / 20 editor requests per 15min)
- **Progressive Generation UI** (real-time step-by-step progress)

## Tech Stack

### Backend (`functions/`)
- **Runtime:** Node.js 20 (Cloud Functions Gen 2)
- **Language:** TypeScript (strict mode)
- **Database:** Firestore (composite indexes for production queries)
- **Storage:** Google Cloud Storage (environment-aware buckets)
- **AI Providers:**
  - OpenAI GPT-4o (`gpt-4o-2024-08-06`) - $0.0275 per generation
  - Google Gemini 2.0 Flash - $0.0011 per generation (96% cheaper!)
- **PDF Generation:** Puppeteer with Handlebars templates
- **Authentication:** Firebase Auth with custom claims

### Frontend (`web/`)
- **Framework:** Gatsby 5 (React 18)
- **Language:** TypeScript
- **Styling:** Theme UI
- **Auth:** Firebase SDK v10
- **State Management:** React Context API
- **API Client:** Fetch with automatic auth token injection

## Directory Structure

```
functions/src/
├── generator.ts                      # Cloud Function (manageGenerator)
├── services/
│   ├── generator.service.ts          # Firestore CRUD (defaults, requests, responses)
│   ├── ai-provider.factory.ts        # Provider abstraction layer
│   ├── openai.service.ts             # OpenAI GPT-4o integration
│   ├── gemini.service.ts             # Google Gemini 2.0 integration
│   ├── pdf.service.ts                # Puppeteer PDF generation
│   ├── storage.service.ts            # GCS uploads and signed URLs
│   └── experience.service.ts         # Experience data fetching
├── templates/
│   └── resume-modern.hbs             # PDF template (Handlebars)
├── types/
│   └── generator.types.ts            # Shared types (backend)
├── utils/
│   └── generation-steps.ts           # Step lifecycle management
└── config/
    ├── database.ts                   # Firestore configuration
    └── openai-schema.ts              # Structured output schemas

web/src/
├── pages/
│   └── resume-builder.tsx            # Main UI at /resume-builder
├── components/
│   ├── GenerationProgress.tsx        # Real-time progress checklist
│   └── tabs/
│       ├── DocumentBuilderTab.tsx    # Generation form
│       ├── WorkExperienceTab.tsx     # Experience management
│       ├── AIPromptsTab.tsx          # Custom prompt editor
│       ├── PersonalInfoTab.tsx       # Settings (avatar, logo, etc.)
│       └── DocumentHistoryTab.tsx    # Past generations (editor only)
├── contexts/
│   └── ResumeFormContext.tsx         # Form state management
├── api/
│   ├── client.ts                     # Base API client
│   └── generator-client.ts           # Generator endpoints
├── hooks/
│   └── useAuth.ts                    # Firebase Auth hook
└── types/
    └── generator.ts                  # Shared types (frontend)
```

## Data Flow

### 1. Generation Request Flow

```
User Form Submission
    ↓
ResumeFormContext (validation)
    ↓
generatorClient.generate() (POST /generator/generate)
    ↓
Cloud Function: manageGenerator
    ↓
┌─────────────────────────────────────────────────┐
│ Step 1: Fetch defaults & experience data       │
│ Step 2: Generate AI content                    │
│ Step 3: Create resume PDF (if requested)       │
│ Step 4: Create cover letter PDF (if requested) │
│ Step 5: Upload PDFs to GCS                     │
│ Step 6: Generate signed URLs                   │
│ Step 7: Store results in Firestore             │
└─────────────────────────────────────────────────┘
    ↓
Real-time Firestore updates
    ↓
GenerationProgress component (checklist UI)
    ↓
User downloads PDFs
```

### 2. Provider Selection Flow

```typescript
// User selects provider in UI
const provider = formState.aiProvider // "openai" | "gemini"

// Request sent to backend
POST /generator/generate
{
  generateType: "both",
  provider: "gemini",
  job: { role: "...", company: "..." }
}

// Backend creates appropriate provider
const aiProvider = AIProviderFactory.createProvider(provider, logger)

// Generate content (same interface for both providers)
const resumeResult = await aiProvider.generateResume(options)
const coverLetterResult = await aiProvider.generateCoverLetter(options)

// Calculate cost based on provider pricing
const cost = aiProvider.calculateCost(resumeResult.tokenUsage)
```

### 3. Real-time Progress Updates

```typescript
// Backend: Update step status in Firestore
steps = startStep(steps, "generate_ai_content")
await generatorService.updateSteps(requestId, steps)

// ... perform generation ...

steps = completeStep(steps, "generate_ai_content", { resumeUrl })
await generatorService.updateSteps(requestId, steps)

// Frontend: Listen to Firestore updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, "generator", requestId),
    (snapshot) => {
      const request = snapshot.data() as GenerationRequest
      setSteps(request.steps || [])
    }
  )
  return () => unsubscribe()
}, [requestId])

// UI: Render progress checklist
<GenerationProgress steps={steps} onDownload={handleDownload} />
```

## Firestore Schema

### Collection: `generator`

Three document types in a single collection:

#### 1. Default Settings Document

**Document ID:** `default`

Stores default personal information that editors can customize.

```typescript
interface GeneratorDefaults {
  id: "default"
  type: "defaults"

  // Personal Information
  name: string                        // Required
  email: string                       // Required
  phone?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string

  // Visual Branding
  avatar?: string                     // GCS path or URL
  logo?: string                       // GCS path or URL
  accentColor: string                 // Hex color (e.g., "#3B82F6")

  // AI Prompts
  aiPrompts?: {
    resume?: {
      systemPrompt?: string
      userPromptTemplate?: string
    }
    coverLetter?: {
      systemPrompt?: string
      userPromptTemplate?: string
    }
  }

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy?: string                  // Email of last editor
}
```

**Example:**
```json
{
  "id": "default",
  "type": "defaults",
  "name": "Josh Wentworth",
  "email": "josh@joshwentworth.com",
  "location": "Portland, OR",
  "website": "https://joshwentworth.com",
  "github": "https://github.com/jdubz",
  "linkedin": "https://linkedin.com/in/joshwentworth",
  "accentColor": "#3B82F6",
  "createdAt": "2025-10-10T00:00:00Z",
  "updatedAt": "2025-10-10T00:00:00Z"
}
```

#### 2. Request Documents

**Document ID Pattern:** `resume-generator-request-{timestamp}_{randomId}`

Stores complete generation request with snapshots for reproducibility.

```typescript
interface GeneratorRequest {
  id: string
  type: "request"

  // Generation Options
  generateType: "resume" | "coverLetter" | "both"
  provider: "openai" | "gemini"       // AI provider selection

  // Snapshot of defaults at request time (for reproducibility)
  defaults: {
    name: string
    email: string
    phone?: string
    location?: string
    website?: string
    github?: string
    linkedin?: string
    avatar?: string
    logo?: string
    accentColor: string
  }

  // Job Application Details
  job: {
    role: string                      // Required
    company: string                   // Required
    companyWebsite?: string
    jobDescriptionUrl?: string        // URL to fetch
    jobDescriptionText?: string       // Or paste manually
  }

  // Generation Preferences
  preferences?: {
    emphasize?: string[]              // Keywords to emphasize
  }

  // Experience Data Snapshot
  experienceData: {
    entries: ExperienceEntry[]        // Snapshot of experience-entries
    blurbs: BlurbEntry[]              // Snapshot of experience-blurbs
  }

  // Request Status
  status: "pending" | "processing" | "completed" | "failed"

  // Step-by-step Progress Tracking
  steps?: GenerationStep[]

  // Access Control
  access: {
    viewerSessionId?: string          // For anonymous users
    isPublic: boolean                 // true for viewers, false for editors
  }

  // Timestamps
  createdAt: Timestamp
  createdBy: string | null            // Email if editor, null if viewer
}
```

**Generation Step:**
```typescript
interface GenerationStep {
  id: string                          // e.g., "fetch_data", "generate_ai_content"
  name: string                        // Display name: "Fetching Data"
  description: string                 // "Loading your experience and settings"
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped"
  startedAt?: Timestamp
  completedAt?: Timestamp
  duration?: number                   // milliseconds

  // Optional result data (e.g., PDF URL when ready)
  result?: {
    resumeUrl?: string
    coverLetterUrl?: string
    [key: string]: unknown
  }

  // Error info if failed
  error?: {
    message: string
    code?: string
  }
}
```

#### 3. Response Documents

**Document ID Pattern:** `resume-generator-response-{timestamp}_{randomId}` (matches request ID)

Stores generation results, GCS file links, and performance metrics.

```typescript
interface GeneratorResponse {
  id: string
  type: "response"
  requestId: string                   // Reference to request document

  // Generation Results
  result: {
    success: boolean

    // Generated Content (AI structured outputs)
    resume?: ResumeContent
    coverLetter?: CoverLetterContent

    // Error Information (if failed)
    error?: {
      message: string
      code?: string
      stage?: string                  // "fetch_data", "openai_generation", etc.
      details?: unknown
    }
  }

  // Generated Files in GCS
  files?: {
    resume?: {
      gcsPath: string                 // "resumes/2025-10-13/request-123/resume.pdf"
      signedUrl?: string              // Temporary signed URL
      signedUrlExpiry?: Timestamp     // When URL expires
      size?: number                   // File size in bytes
      storageClass?: "STANDARD" | "COLDLINE"
    }
    coverLetter?: {
      gcsPath: string
      signedUrl?: string
      signedUrlExpiry?: Timestamp
      size?: number
      storageClass?: "STANDARD" | "COLDLINE"
    }
  }

  // Performance Metrics
  metrics: {
    durationMs: number                // Total generation time

    tokenUsage?: {
      resumePrompt?: number
      resumeCompletion?: number
      coverLetterPrompt?: number
      coverLetterCompletion?: number
      total: number
    }

    costUsd?: number                  // Calculated from token usage
    model: string                     // "gpt-4o-2024-08-06" or "gemini-2.0-flash"
  }

  // Timestamps
  createdAt: Timestamp
  updatedAt?: Timestamp               // Updated when URLs regenerated
}
```

### Collection Structure

```
generator/
├── default                                      # Default settings
├── resume-generator-request-1697123456-abc123  # Request
├── resume-generator-response-1697123456-abc123 # Response (matching ID)
├── resume-generator-request-1697234567-def456  # Request
├── resume-generator-response-1697234567-def456 # Response
└── ...
```

### Relationships

```
┌─────────────────┐
│    default      │ ← Stores default settings
└─────────────────┘
        ↓ (snapshot copied to request)
┌─────────────────────────┐
│  resume-generator-      │ ← Generation request
│  request-{id}           │   + Settings snapshot
│                         │   + Experience snapshot
│  generateType: "both"   │   + Job details
│  provider: "gemini"     │   + Step tracking
└─────────────────────────┘
        ↓ (request processed)
┌─────────────────────────┐
│  resume-generator-      │ ← Generation response
│  response-{id}          │   + AI responses
│                         │   + GCS file links
│  requestId: {id}        │   + Metrics & cost
└─────────────────────────┘
```

### Firestore Indexes

Five composite indexes for efficient queries:

```json
// 1. List requests by creation date
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// 2. List requests by viewer session
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "access.viewerSessionId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// 3. Calculate success rate
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "result.success", "order": "ASCENDING" }
  ]
}

// 4. Filter by generation type
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "generateType", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}

// 5. Search by company
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "job.company", "order": "ASCENDING" }
  ]
}
```

### Query Patterns

**Get default settings:**
```typescript
const defaultsDoc = await db.collection("generator").doc("default").get()
const defaults = defaultsDoc.data() as GeneratorDefaults
```

**List all requests (most recent first):**
```typescript
const snapshot = await db
  .collection("generator")
  .where("type", "==", "request")
  .orderBy("createdAt", "desc")
  .limit(50)
  .get()
```

**Get request and response together:**
```typescript
const requestId = "resume-generator-request-1697123456-abc123"
const responseId = requestId.replace("request", "response")

const [requestDoc, responseDoc] = await Promise.all([
  db.collection("generator").doc(requestId).get(),
  db.collection("generator").doc(responseId).get(),
])
```

**Calculate success rate:**
```typescript
const responsesSnapshot = await db
  .collection("generator")
  .where("type", "==", "response")
  .get()

const successful = responsesSnapshot.docs.filter(
  (doc) => doc.data().result.success
).length

const successRate = (successful / responsesSnapshot.size) * 100
```

**Calculate total cost:**
```typescript
const responsesSnapshot = await db
  .collection("generator")
  .where("type", "==", "response")
  .where("result.success", "==", true)
  .get()

const totalCost = responsesSnapshot.docs.reduce(
  (sum, doc) => sum + (doc.data().metrics.costUsd || 0),
  0
)
```

## Google Cloud Storage Architecture

### Environment-Aware Buckets

| Environment | Bucket | Detection Method |
|------------|--------|------------------|
| **Local** | Storage Emulator | `FUNCTIONS_EMULATOR=true` |
| **Staging** | `joshwentworth-resumes-staging` | `ENVIRONMENT=staging` |
| **Production** | `joshwentworth-resumes` | Default |

### File Organization

```
gs://joshwentworth-resumes/
├── resumes/
│   └── 2025-10-13/
│       └── resume-generator-request-123/
│           ├── resume.pdf
│           └── cover-letter.pdf
└── images/
    ├── avatars/
    │   └── user-123.jpg
    └── logos/
        └── logo-456.png
```

### Signed URLs

**Purpose:** Temporary, secure access to private files without exposing GCS credentials

**Expiry by Role:**
- **Viewers:** 1 hour (temporary access)
- **Editors:** 7 days (extended access)

**Generation:**
```typescript
const signedUrl = await storageService.generateSignedUrl(gcsPath, {
  expiresInHours: isEditor ? 168 : 1
})
```

### Lifecycle Management

**Automatic cost optimization:**

1. **Day 0-89:** STANDARD storage class ($0.020/GB/month)
2. **Day 90+:** Automatically transitioned to COLDLINE ($0.004/GB/month)
3. **Result:** 80% storage cost reduction for older files

**Impact:**
- ✅ Signed URLs work the same
- ✅ Download functionality unchanged
- ✅ Slightly slower first-byte latency (~milliseconds)
- ✅ No code changes required

**Configuration:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90
        }
      }
    ]
  }
}
```

## AI Provider System

### Provider Abstraction

**Interface:**
```typescript
interface AIProvider {
  generateResume(options: GenerateResumeOptions): Promise<AIResumeGenerationResult>
  generateCoverLetter(options: GenerateCoverLetterOptions): Promise<AICoverLetterGenerationResult>
  calculateCost(tokenUsage: TokenUsage): number
  readonly model: string
  readonly providerType: "openai" | "gemini"
  readonly pricing: {
    inputCostPer1M: number
    outputCostPer1M: number
  }
}
```

### Provider Comparison

| Feature | OpenAI GPT-4o | Gemini 2.0 Flash |
|---------|---------------|------------------|
| **Model** | `gpt-4o-2024-08-06` | `gemini-2.0-flash-exp` |
| **Input Cost** | $2.50 per 1M tokens | $0.075 per 1M tokens |
| **Output Cost** | $10.00 per 1M tokens | $0.30 per 1M tokens |
| **Avg Cost/Gen** | $0.0275 | $0.0011 |
| **Speed** | ~4-6 seconds | ~3-5 seconds |
| **Quality** | Excellent | Excellent |
| **Structured Output** | Native (JSON Schema) | Via parsing |
| **Savings** | Baseline | **96% cheaper** |

### Mock Mode

Both providers support mock mode for local development:

```typescript
// In functions/.env
OPENAI_MOCK_MODE=true
GEMINI_MOCK_MODE=true
```

**Benefits:**
- ✅ No API keys required
- ✅ Instant responses (~100ms)
- ✅ No API costs
- ✅ Realistic mock data
- ✅ Faster development iteration

## Authentication & Authorization

### User Roles

| Role | Requests/15min | URL Expiry | History Access | Settings Edit |
|------|----------------|------------|----------------|---------------|
| **Viewer** | 10 | 1 hour | No | No |
| **Editor** | 20 | 7 days | Yes | Yes |

### Role Implementation

**Firebase Custom Claims:**
```typescript
// Set editor role
await admin.auth().setCustomUserClaims(uid, { role: "editor" })

// Check role in Cloud Function
const user = await admin.auth().verifyIdToken(token)
const isEditor = user.role === "editor"
```

**Makefile Commands:**
```bash
make editor-add EMAIL=user@example.com      # Grant editor role
make editor-remove EMAIL=user@example.com   # Revoke editor role
make editor-list                            # List all editors
make editor-check EMAIL=user@example.com    # Check user's role
```

### Rate Limiting

**Implementation:** Firestore atomic operations with TTL

```typescript
// Rate limit document structure
{
  id: "rate-limit-{sessionId}",
  requests: [
    { timestamp: Timestamp, path: "/generator/generate" },
    { timestamp: Timestamp, path: "/generator/generate" },
    // ... up to limit (10 viewer / 20 editor)
  ],
  ttl: Timestamp // Auto-delete after 15 minutes
}

// Check rate limit
const sessionId = req.body.sessionId || generateSessionId()
const limit = isEditor ? 20 : 10
const allowed = await checkRateLimit(sessionId, limit)
```

**Cleanup:** Firestore TTL policy automatically deletes old rate limit documents

## PDF Generation

### Template System

**Engine:** Puppeteer + Handlebars

**Template Location:** `functions/src/templates/resume-modern.hbs`

**Features:**
- Responsive layout (letter size 8.5" x 11")
- Custom accent colors
- Avatar and logo support
- Professional typography
- Print-optimized CSS

**Data Binding:**
```handlebars
{{personalInfo.name}}
{{personalInfo.title}}
{{#each experience}}
  <div class="experience-item">
    <h3>{{role}} at {{company}}</h3>
    <p>{{startDate}} - {{endDate}}</p>
    {{#each highlights}}
      <li>{{this}}</li>
    {{/each}}
  </div>
{{/each}}
```

**Customization:**
- Accent color: CSS variable `--accent-color`
- Avatar: Displayed in header
- Logo: Optional watermark in footer

### PDF Generation Flow

```typescript
// 1. Generate AI content
const resumeContent = await aiProvider.generateResume(options)

// 2. Render Handlebars template
const html = pdfService.renderTemplate("resume-modern", {
  ...resumeContent,
  accentColor: defaults.accentColor,
  avatar: defaults.avatar,
  logo: defaults.logo,
})

// 3. Generate PDF with Puppeteer
const pdfBuffer = await pdfService.generatePDF(html, {
  format: "letter",
  printBackground: true,
})

// 4. Upload to GCS
const { gcsPath, size } = await storageService.uploadPDF(
  pdfBuffer,
  "resume.pdf",
  "resume"
)

// 5. Generate signed URL
const signedUrl = await storageService.generateSignedUrl(gcsPath, {
  expiresInHours: isEditor ? 168 : 1,
})
```

## Progressive Generation UI

### Real-time Step Updates

**Backend:**
```typescript
// Initialize steps
let steps = createInitialSteps(generateType)
await generatorService.updateSteps(requestId, steps)

// Start step
steps = startStep(steps, "generate_ai_content")
await generatorService.updateSteps(requestId, steps)

// Complete step (with optional result)
steps = completeStep(steps, "generate_ai_content", {
  resumeUrl: signedUrl
})
await generatorService.updateSteps(requestId, steps)
```

**Frontend:**
```typescript
// Listen to Firestore updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, "generator", requestId),
    (snapshot) => {
      const request = snapshot.data() as GenerationRequest
      setSteps(request.steps || [])
    }
  )
  return () => unsubscribe()
}, [requestId])
```

### Step Definitions

```typescript
const STEPS = {
  fetch_data: {
    name: "Fetching Data",
    description: "Loading your experience and settings",
  },
  generate_ai_content: {
    name: "Generating AI Content",
    description: "AI is tailoring your content to the job",
  },
  create_resume_pdf: {
    name: "Creating Resume PDF",
    description: "Formatting your resume",
  },
  create_cover_letter_pdf: {
    name: "Creating Cover Letter PDF",
    description: "Formatting your cover letter",
  },
  upload_files: {
    name: "Uploading Files",
    description: "Storing your documents securely",
  },
  generate_urls: {
    name: "Generating URLs",
    description: "Creating secure download links",
  },
  save_results: {
    name: "Saving Results",
    description: "Recording generation details",
  },
}
```

### UI Component

```tsx
<GenerationProgress steps={steps} onDownload={handleDownload}>
  {steps.map((step) => (
    <StepItem key={step.id}>
      <Icon status={step.status} />  {/* ☐ → ⚙️ → ✓ */}
      <StepInfo>
        <StepName>{step.name}</StepName>
        <StepDescription>{step.description}</StepDescription>
      </StepInfo>
      {step.result?.resumeUrl && (
        <DownloadButton url={step.result.resumeUrl}>
          📄 Download Resume
        </DownloadButton>
      )}
    </StepItem>
  ))}
</GenerationProgress>
```

### Early Download Support

PDFs become available as soon as each step completes:

```typescript
// Resume PDF completes at step 3
steps = completeStep(steps, "create_resume_pdf", {
  resumeUrl: resumeSignedUrl  // Available immediately!
})

// Cover letter PDF completes at step 4
steps = completeStep(steps, "create_cover_letter_pdf", {
  coverLetterUrl: coverLetterSignedUrl  // Available immediately!
})
```

**User Experience:**
- Resume ready? Download it while cover letter generates!
- No waiting for entire batch to complete
- Improved perceived performance

## Security

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default settings
    match /generator/default {
      allow read: if true;  // Anyone can read
      allow write: if request.auth != null
        && request.auth.token.role == 'editor';
    }

    // Request/response documents
    match /generator/{docId} {
      allow read: if docId != 'default'
        && (
          // Editors can read all
          (request.auth != null && request.auth.token.role == 'editor')
          // Or viewers can read their own (via Cloud Function)
          || request.auth != null
        );

      allow write: if docId != 'default'
        && request.auth != null;  // Cloud Functions only
    }
  }
}
```

### Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // All files are private
    // Access only via signed URLs generated by Cloud Functions
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}
```

### IAM Roles

**Cloud Functions Service Account:**
- `roles/storage.objectAdmin` - Create/read/delete GCS objects
- `roles/iam.serviceAccountTokenCreator` - Generate signed URLs

**Commands:**
```bash
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

## Monitoring & Analytics

### Available Metrics

**From Firestore queries:**
- Total generations by date range
- Success rate (successful / total)
- Cost analysis (OpenAI vs Gemini usage)
- Popular companies/roles
- Generation type distribution (resume, cover letter, both)
- User engagement (viewers vs editors)
- Average generation duration

**Example Analytics Queries:**
```typescript
// Success rate over last 30 days
const thirtyDaysAgo = Timestamp.fromDate(
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
)

const responses = await db
  .collection("generator")
  .where("type", "==", "response")
  .where("createdAt", ">=", thirtyDaysAgo)
  .get()

const successful = responses.docs.filter(
  (doc) => doc.data().result.success
).length
const successRate = (successful / responses.size) * 100

// Cost by provider
const openaiCost = responses.docs
  .filter((doc) => doc.data().metrics.model.includes("gpt"))
  .reduce((sum, doc) => sum + (doc.data().metrics.costUsd || 0), 0)

const geminiCost = responses.docs
  .filter((doc) => doc.data().metrics.model.includes("gemini"))
  .reduce((sum, doc) => sum + (doc.data().metrics.costUsd || 0), 0)
```

## Testing Strategy

### Unit Tests (211+ tests)

**Coverage:**
- ✅ Generator service (Firestore CRUD)
- ✅ OpenAI service (structured outputs, error handling)
- ✅ Gemini service (JSON parsing, error handling)
- ✅ AI provider factory (provider selection, cost calculation)
- ✅ PDF service (template rendering)
- ✅ Storage service (environment detection, signed URLs)
- ✅ Step lifecycle utilities

**Run:**
```bash
cd functions && npm test
```

### Integration Tests

**Coverage:**
- ✅ Generator endpoint (both providers)
- ✅ Mock mode vs real API mode
- ✅ Rate limiting
- ✅ Auth middleware

**Run:**
```bash
cd functions && npm test -- generator.test.ts
```

### Frontend Tests (28+ tests)

**Coverage:**
- ✅ Generator client (API calls, error handling)
- ✅ Auth context
- ✅ Form validation

**Run:**
```bash
cd web && npm test
```

## Performance Optimization

### Caching Strategy

**Not implemented** - Each generation is unique, caching offers limited benefit

### Parallel Processing

**Resume + Cover Letter:**
- Generated in parallel when `generateType: "both"`
- Reduces total time by ~30-40%

```typescript
const [resumeResult, coverLetterResult] = await Promise.all([
  aiProvider.generateResume(resumeOptions),
  aiProvider.generateCoverLetter(coverLetterOptions),
])
```

### Image Optimization

**Avatar & Logo:**
- Max file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Validation on upload
- No automatic compression (stored as-is)

## Cost Analysis

### Per-Generation Costs

| Provider | Input Tokens | Output Tokens | Total Cost |
|----------|--------------|---------------|------------|
| **Gemini** | ~3,000 | ~1,500 | **$0.0011** |
| **OpenAI** | ~3,000 | ~1,500 | $0.0275 |

**Savings:** 96% cheaper with Gemini for equivalent quality

### Monthly Projections

**100 generations/month:**
- Gemini: $0.11
- OpenAI: $2.75
- Savings: $2.64/month (96%)

**1,000 generations/month:**
- Gemini: $1.10
- OpenAI: $27.50
- Savings: $26.40/month (96%)

### Storage Costs

**GCS Pricing:**
- STANDARD: $0.020/GB/month (first 90 days)
- COLDLINE: $0.004/GB/month (after 90 days)
- Download: $0.12/GB (egress to internet)

**Typical Resume:**
- Size: ~250KB
- Storage (STANDARD): $0.000005/month
- Storage (COLDLINE): $0.000001/month
- Download: $0.00003 per download

**Negligible storage costs** - Even 10,000 resumes costs ~$0.50/month

## Future Enhancements

See [PLAN.md](./PLAN.md) for detailed implementation plans.
