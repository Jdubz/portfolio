# Portfolio Project - Architectural Context

**Last Updated**: 2025-10-17

This document serves as the single source of truth for architectural decisions, design patterns, and important context that should be preserved across the portfolio project.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Design Decisions](#key-design-decisions)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Integration Architecture](#integration-architecture)
6. [Security & Performance](#security--performance)
7. [Development Patterns](#development-patterns)

---

## System Architecture

### Monorepo Structure

This is a Firebase monorepo combining:
- **Web**: Gatsby 5 static site (React 18 + Theme UI + TypeScript)
- **Functions**: Cloud Functions Gen 2 (Node.js 20)
- **Database**: Cloud Firestore (named databases for environment isolation)
- **Storage**: Google Cloud Storage with lifecycle policies
- **AI Services**: OpenAI GPT-4o and Google Gemini 2.0 Flash

### Named Databases for Environment Isolation

**Critical Decision**: Use separate Firestore databases instead of collection prefixes

- **Production**: `portfolio` database
- **Staging**: `portfolio-staging` database
- **Development**: `(default)` database (emulator)

**Benefits**:
- Complete data isolation (no cross-contamination risk)
- Independent security rules per environment
- Easier to debug and test
- Better compliance and auditing
- Production has delete protection enabled

**Configuration**: Environment determined by:
1. `FIRESTORE_DATABASE_ID` (explicit override)
2. Emulator detection (uses `(default)`)
3. `ENVIRONMENT` variable (`staging` or `production`)
4. Defaults to `portfolio` (production)

---

## Key Design Decisions

### 1. Multi-Provider AI (Gemini + OpenAI)

**Why**: Cost optimization and vendor flexibility

- **OpenAI GPT-4o**: $0.0275 per generation (high quality)
- **Google Gemini 2.0 Flash**: $0.0011 per generation (96% cheaper!)
- **Mock Mode**: Free for local development

**Architecture**:
- Factory pattern (`ai-provider.factory.ts`) for provider abstraction
- Identical prompts across providers for quality parity
- User can select provider per-generation
- Graceful fallback if provider fails

### 2. API Client Layer Pattern

**Why**: Separation of concerns, clean architecture

**Structure**:
```
Business Logic (Services) → API Clients → HTTP
         ↓                       ↓
React State (Hooks) ←────────────┘
```

**Responsibilities**:
- **Services**: Pure business logic, testable, reusable
- **API Clients**: HTTP communication, error handling, auth injection
- **Hooks**: React state management, UI orchestration

**Example**:
```typescript
// Service layer (backend)
class GeneratorService {
  async generateResume(data: JobData) { /* business logic */ }
}

// API client (frontend)
class GeneratorClient extends ApiClient {
  async generateResume(data: JobData) {
    return this.post('/generator/generate', data, true)
  }
}

// Hook (frontend)
function useDocumentGeneration() {
  const [loading, setLoading] = useState(false)
  const generate = async (data) => {
    setLoading(true)
    const result = await generatorClient.generateResume(data)
    setLoading(false)
    return result
  }
  return { generate, loading }
}
```

### 3. Signed URLs → Public URLs Migration

**Decision**: GCS buckets are publicly readable, URLs never expire

**Why Changed**:
- Previous code calculated fake expiry times (misleading)
- No functional difference between "signed" and "public" for readable buckets
- Simplified code, removed unnecessary complexity
- URLs are permanent and don't need refresh logic

**Implementation**:
- Renamed `generateSignedUrl()` → `generatePublicUrl()`
- Removed `SignedUrlOptions` interface
- Removed `expiresInHours` calculations
- Removed `signedUrlExpiry` from Firestore schema
- Updated all frontend types and components

### 4. Firestore for Generation Tracking

**Why**: Real-time updates and query flexibility over Cloud Storage metadata

**Benefits**:
- Real-time progress UI with Firestore listeners
- Complex queries (filter by status, date, user)
- Step-by-step progress tracking
- Better than relying on GCS metadata

**Collections**:
- `generator/{requestId}` - Request tracking with live updates
- `generator/{responseId}` - Response results with metrics
- `generator/personal-info` - Default personal information

### 5. Job Match Integration Architecture

**Why**: Single source of truth for job analysis, reusable across tools

**Shared Collections** (Portfolio ↔ Job-Finder):
- `job-queue` - Processing queue (both read/write)
- `job-matches` - AI-analyzed matches (job-finder writes, portfolio reads)
- `job-finder-config` - Shared configuration
- `experience-entries` - Portfolio writes, job-finder reads
- `experience-blurbs` - Portfolio writes, job-finder reads

**Type Synchronization**:
- TypeScript: `@jdubz/shared-types` package
- Python: Mirrored Pydantic models in job-finder
- Both must stay in sync manually (planned: monorepo unification)

**Data Flow**:
```
Portfolio (submit job) → Firestore (job-queue)
                              ↓
                    Job-Finder (process)
                              ↓
                    Firestore (job-matches)
                              ↓
                    Portfolio (display + generate)
```

### 6. Progressive Generation UI

**Why**: Better UX than blocking wait

**Implementation**:
- Multi-step API with polling
- Real-time step updates via Firestore listener
- Early PDF downloads (as soon as ready)
- Graceful error handling at each step

**Steps**:
1. AI generation (OpenAI/Gemini)
2. PDF export (Puppeteer)
3. GCS upload (signed URL)
4. Firestore update (completion)

### 7. Editor Role via Custom Claims

**Why**: Fine-grained access control without complex middleware

**Implementation**:
- Firebase Auth custom claim: `role: "editor"`
- Verified in Cloud Functions via `verifyIdToken()`
- Firestore rules check custom claims
- Users must sign out/in after role change

**Permissions**:
- **Editors**: 20 req/15min, 7-day URLs, can customize AI prompts, access history
- **Viewers**: 10 req/15min, 1-hour URLs, cannot customize, no history

---

## Technology Stack

### Frontend

**Core**:
- Gatsby 5 (static site generator)
- React 18 (UI framework)
- TypeScript (type safety)
- Theme UI (styling system)

**Libraries**:
- React Spring (parallax animations)
- Firebase SDK (auth, Firestore)
- axios (HTTP client)
- Joi (validation)

**Build Requirements**:
- Node.js 20+
- 6-8GB RAM for Gatsby build
- npm workspaces for monorepo

### Backend

**Cloud Functions Gen 2**:
- Node.js 20 runtime
- TypeScript
- 256MB memory (configurable)
- 60s timeout (configurable)

**Functions**:
1. `handleContactForm` - Email via Mailgun, rate limiting
2. `manageExperience` - Experience/blurb CRUD API
3. `manageGenerator` - AI resume/cover letter generator
4. `uploadResume` - Resume upload handler
5. `manageJobQueue` - Job queue management API (job-finder integration)

**Services**:
- Firestore (database)
- Secret Manager (credentials)
- Cloud Storage (PDF files)
- Identity Platform (auth)
- Cloud Logging (monitoring)

### AI Providers

**OpenAI**:
- Model: GPT-4o (`gpt-4o-2024-08-06`)
- Cost: ~$0.0275 per resume/cover letter pair
- Strengths: Excellent quality, consistent formatting

**Google Gemini**:
- Model: Gemini 2.0 Flash
- Cost: ~$0.0011 per resume/cover letter pair (96% cheaper!)
- Strengths: Fast, cost-effective, quality on par with OpenAI

**Mock Mode**:
- For local development
- Instant responses, no API costs
- Realistic mock data

---

## Project Structure

```
portfolio/
├── web/                           # Gatsby frontend
│   ├── src/
│   │   ├── api/                   # HTTP clients (ApiClient base class)
│   │   │   ├── api-client.ts      # Base HTTP client
│   │   │   ├── experience-client.ts
│   │   │   ├── blurb-client.ts
│   │   │   ├── generator-client.ts
│   │   │   └── job-queue-client.ts
│   │   ├── components/            # React components
│   │   │   ├── ui/                # Reusable UI components
│   │   │   ├── layout/            # Layout components
│   │   │   ├── tabs/              # Tab components (resume builder)
│   │   │   └── forms/             # Form components
│   │   ├── config/                # Configuration
│   │   │   └── api.ts             # API endpoints centralized
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts         # Auth state + role checks
│   │   │   ├── useExperienceData.ts
│   │   │   ├── useAsyncSubmit.ts
│   │   │   └── useDocumentGeneration.ts
│   │   ├── pages/                 # Gatsby pages
│   │   ├── styles/                # Theme UI config
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utilities (logger, validators, firebase)
│   └── static/                    # Static assets
│
├── functions/                     # Cloud Functions
│   └── src/
│       ├── config/                # Configuration modules
│       │   ├── cors.ts            # CORS per-function
│       │   ├── database.ts        # Firestore instance factory
│       │   ├── error-codes.ts     # Error code constants
│       │   └── secrets.ts         # Secret Manager integration
│       ├── middleware/            # Auth & App Check
│       ├── services/              # Business logic
│       │   ├── ai-provider.factory.ts
│       │   ├── openai.service.ts
│       │   ├── gemini.service.ts
│       │   ├── pdf.service.ts
│       │   ├── storage.service.ts
│       │   ├── email.service.ts
│       │   ├── experience.service.ts
│       │   ├── blurb.service.ts
│       │   └── generator.service.ts
│       ├── types/                 # Type definitions
│       │   ├── logger.types.ts    # Shared logger type
│       │   └── generator.types.ts
│       ├── utils/                 # Utilities
│       │   ├── logger.ts          # Centralized logging
│       │   └── request-id.ts      # Request ID generation
│       ├── index.ts               # Contact form handler
│       ├── experience.ts          # Experience API
│       ├── generator.ts           # AI generator API
│       ├── job-queue.ts           # Job queue API
│       └── resume.ts              # Resume upload handler
│
├── docs/                          # Documentation
│   ├── development/               # Development guides
│   ├── setup/                     # Setup instructions
│   ├── infrastructure/            # Infrastructure docs
│   ├── features/                  # Feature documentation
│   └── brand/                     # Brand assets
│
├── scripts/                       # Build and utility scripts
├── infrastructure/                # Terraform IaC
└── emulator-data/                 # Firebase emulator persistence
```

---

## Integration Architecture

### Cross-Project Integration: Job-Finder

**Architecture**:
```
┌─────────────────┐        Firestore         ┌─────────────────┐
│   Portfolio     │◄────────(shared)─────────►│  Job-Finder     │
│  (TypeScript)   │                           │    (Python)     │
└─────────────────┘                           └─────────────────┘
        │                                              │
        ▼                                              ▼
  @jdubz/shared-types ◄────────────────── Python Pydantic Models
   (TypeScript types)        (mirrors)        (runtime validation)
```

**Shared Data**:
1. `job-queue` - Jobs to process (both read/write)
2. `job-matches` - AI-analyzed results (job-finder writes, portfolio reads)
3. `job-finder-config` - Settings (portfolio writes, job-finder reads)
4. `experience-entries` - Profile data (portfolio writes, job-finder reads)
5. `experience-blurbs` - Skills/highlights (portfolio writes, job-finder reads)

**Type Synchronization**:
- TypeScript types in `@jdubz/shared-types` (located at `../shared-types`)
- Python models in `job-finder/src/job_finder/queue/models.py`
- **Critical**: Both must stay in sync manually
- Process: Update TS types → Update Python models → Test both projects

**Job Queue Flow**:
1. User submits job URL via portfolio UI
2. Portfolio validates and writes `QueueItem` to Firestore
3. Job-finder worker polls `job-queue` every 60s
4. Worker scrapes job, analyzes with AI, creates `JobMatch`
5. Portfolio displays matches in JobApplicationsTab
6. User generates custom resume/cover letter with one click

**One-Click Generation** (Implemented January 2025):
- "Generate" button in Job Applications table
- Auto-populates job description from match data
- Uses `jobMatchId` to link generation to match
- Real-time progress display inline
- Auto-updates match record on completion

### Shared Types Package

**Location**: `../shared-types` (separate repository)

**Key Types**:
```typescript
export interface QueueItem {
  type: QueueItemType            // 'job' | 'scrape' | 'company'
  status: QueueStatus            // 'pending' | 'processing' | 'success' | 'failed' | 'skipped'
  url: string
  company_name: string
  source: string
  submitted_by: string
  retry_count: number
  max_retries: number
  created_at: Timestamp
  updated_at: Timestamp
  processed_at?: Timestamp
  completed_at?: Timestamp
  result_message?: string
}

export interface JobMatch {
  url: string
  title: string
  company: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  keyStrengths: string[]
  potentialConcerns: string[]
  keywords: string[]
  customizationRecommendations: {
    skills_to_emphasize: string[]
    resume_focus: string[]
    cover_letter_points: string[]
  }
  resumeIntakeData: {
    target_summary: string
    skills_priority: string[]
    keywords_to_include: string[]
    achievement_angles: string[]
  }
  // ... more fields
}
```

**Integration**:
- Portfolio imports: `import { QueueItem, JobMatch } from '@jdubz/shared-types'`
- Job-finder mirrors in Python Pydantic models
- See `../shared-types/CONTEXT.md` for full documentation

---

## Security & Performance

### Security

**Defense in Depth**:
1. **Firebase Auth**: User authentication + custom claims (`role: "editor"`)
2. **Firestore Rules**: Server-side authorization per collection
3. **App Check**: Bot protection (defense-in-depth)
4. **Rate Limiting**: Per-user limits (10-20 req/15min)
5. **CORS**: Configured per-function for allowed origins
6. **Secret Manager**: All credentials stored securely

**Best Practices**:
- Never commit secrets to git
- Validate all user inputs (Joi schemas)
- Sanitize data before storage
- Use public URLs (no exposure of internal paths)
- Audit logs via Cloud Logging
- Least-privilege IAM roles

### Performance

**Frontend**:
- Static site generation (pre-rendered pages)
- Code splitting (automatic via Gatsby)
- Image optimization (gatsby-plugin-image)
- Theme UI for consistent styling
- Lazy loading components

**Backend**:
- Cloud Functions Gen 2 (improved cold starts)
- 256MB memory allocation (adjustable per function)
- 60s timeout (appropriate for AI generation)
- Connection pooling for Firestore
- Caching where appropriate

**Database**:
- Composite indexes for efficient queries
- Named databases for environment isolation
- Connection reuse across function invocations
- Minimal read/write operations

**AI Generation**:
- Gemini 2.0 Flash for 96% cost savings
- Async/await patterns for parallelization
- Streaming not yet implemented (future enhancement)
- Token usage tracking for cost monitoring

---

## Development Patterns

### Validation Pattern

**Type-Safe Validation with Reusable Rules**:

```typescript
import { createValidator, validators } from '../utils/validators'

interface FormData {
  name: string
  email: string
  message: string
}

const validator = createValidator<FormData>([
  { field: 'name', validator: validators.required('Name') },
  { field: 'email', validator: validators.required('Email') },
  { field: 'email', validator: validators.email },
  { field: 'message', validator: validators.required('Message') },
  { field: 'message', validator: validators.minLength(10, 'Message') },
])

const errors = validator(formData)
```

**Built-in Validators**:
- `required(fieldName)` - Non-empty string
- `email` - Valid email format
- `minLength(min, fieldName)` - Minimum character count
- `maxLength(max, fieldName)` - Maximum character count
- `url` - Valid URL format

### Logging Pattern

**Structured Logging with Context**:

```typescript
import { logger } from '../utils/logger'

// Info logging
logger.info('User action', { userId, action: 'create', resource: 'experience' })

// Error logging with error object
try {
  await riskyOperation()
} catch (error) {
  logger.error('Operation failed', error, { userId, operation: 'riskyOperation' })
  throw error
}

// Warning logging
logger.warn('Unusual condition', { condition: 'high_rate', value: 120 })
```

**Environment Behavior**:
- **Development/Staging**: Console output with colors
- **Production**: Google Cloud Logging (structured JSON)
- **Test**: Silent (unless `DEBUG` env var set)

### Error Handling Pattern

**Consistent Error Responses**:

```typescript
// Backend
try {
  const result = await service.doSomething(data)
  return { success: true, data: result }
} catch (error) {
  logger.error('Service error', error, { context })
  return { error: 'Operation failed', message: error.message, requestId }
}

// Frontend
try {
  const result = await apiClient.post('/endpoint', data)
  return result
} catch (error) {
  logger.error('API call failed', error, { endpoint })
  throw error // Let UI handle display
}
```

### Form Component Pattern

**Reusable Form Components** (see `web/src/components/FORMS_GUIDE.md`):

```typescript
import { FormField, FormLabel, FormActions, FormError, MarkdownEditor } from '../components'

<form onSubmit={handleSubmit}>
  <FormField
    label="Job Title"
    name="title"
    value={formData.title}
    onChange={handleChange}
    error={errors.title}
    required
  />

  <MarkdownEditor
    label="Job Description"
    value={formData.description}
    onChange={(value) => setFormData({ ...formData, description: value })}
    placeholder="Paste job description here..."
  />

  <FormActions
    onCancel={handleCancel}
    onSave={handleSubmit}
    onDelete={canDelete ? handleDelete : undefined}
    saving={loading}
    disabled={hasErrors}
  />

  {errorMessage && <FormError message={errorMessage} />}
</form>
```

### Testing Pattern

**Test Organization**:
- Unit tests: `*.test.ts` next to source files
- Integration tests: `__tests__/integration/`
- E2E tests: `web/e2e/`

**Example**:
```typescript
describe('GeneratorService', () => {
  let service: GeneratorService

  beforeEach(() => {
    service = new GeneratorService()
  })

  it('should generate resume with job match data', async () => {
    const jobData = createMockJobData()
    const result = await service.generateResume(jobData)

    expect(result).toHaveProperty('resume')
    expect(result).toHaveProperty('coverLetter')
    expect(result.resume).toContain(jobData.company)
  })
})
```

**Test Coverage**:
- Web: 42 tests
- Functions: 169 tests
- Total: 211 tests
- Goal: Maintain >80% coverage for critical paths

---

## Important Historical Context

### Why Named Databases?

**Problem**: Using collection prefixes (`staging_experiences`, `prod_experiences`) caused:
- Risk of cross-environment contamination
- Complex security rules with string matching
- Difficult to audit and monitor
- Production data accidentally written to staging

**Solution**: Separate Firestore databases per environment
- Complete isolation (impossible to cross-write)
- Simple security rules (no prefix logic)
- Easy to monitor and audit
- Production database has delete protection

**Migration**: January 2025 - Migrated from collection prefixes to named databases

### Why Migrate from "Defaults" to "Personal Info"?

**Problem**: Terminology mismatch between frontend and backend
- Backend: `generator/personal-info` collection
- Frontend: `GeneratorDefaults` type
- Confusing for developers, inconsistent codebase

**Solution**: October 2025 - Renamed everything to `personalInfo`
- Consistent terminology across stack
- Removed deprecated aliases
- Updated all components and API methods

### Why Public URLs Instead of Signed URLs?

**Problem**: GCS buckets are publicly readable, so signed URLs were misleading
- Code calculated fake expiry times (7 days editor, 1 hour viewer)
- URLs never actually expired
- Unnecessary complexity
- Confusing for developers

**Solution**: October 2025 - Renamed to public URLs, removed expiry logic
- Honest terminology: "public" not "signed"
- Removed fake expiry calculations
- Simplified codebase
- URLs are permanent (buckets are readable)

### Why SimpleLogger Type Extraction?

**Problem**: Duplicate `SimpleLogger` interface across 13+ files
- 137 lines of duplicate code
- Inconsistent implementations
- Hard to maintain
- Risk of drift

**Solution**: January 2025 - Created shared types and factories
- `types/logger.types.ts` - Shared `SimpleLogger` type
- `utils/logger.ts` - `createDefaultLogger()` factory
- `config/firestore.ts` - `createFirestoreInstance()` factory
- 73% reduction in duplicate code
- Single source of truth

---

## Future Architectural Considerations

### Potential Improvements

1. **Monorepo Unification**: Merge `@jdubz/shared-types` into portfolio repo
   - Eliminates manual sync between TypeScript and Python
   - Single source of truth for all types
   - Easier to maintain

2. **Streaming AI Responses**: Server-sent events for real-time generation
   - Better UX (see content as it's generated)
   - Reduced perceived latency
   - More engaging experience

3. **Background Jobs**: Cloud Tasks for long-running operations
   - Decouple from Cloud Functions timeout
   - Better retry logic
   - Queue-based processing

4. **Caching Layer**: Redis or Memorystore for frequently accessed data
   - Reduce Firestore reads
   - Faster response times
   - Cost optimization

5. **GraphQL API**: Unified API layer for frontend
   - Reduce over-fetching
   - Better type safety
   - Simpler client code

### Non-Goals

**Things intentionally NOT done**:

1. **LinkedIn Integration**: High maintenance, requires API approval
2. **Batch Generation**: Complex implementation for rare use case
3. **Multiple Resume Templates**: Simplicity over options (current template covers 90% of use cases)
4. **Real-time Collaboration**: Overkill for single-user portfolio

---

## Related Documentation

- **Architecture Deep Dive**: `/docs/development/ARCHITECTURE.md`
- **Setup Guide**: `/docs/development/SETUP.md`
- **Next Steps**: `/docs/development/NEXT_STEPS.md`
- **Development Workflow**: `/docs/DEVELOPMENT_WORKFLOW.md`
- **Firebase Configuration**: `/docs/setup/FIREBASE_CONFIG_CHECKLIST.md`
- **Database Management**: `/docs/infrastructure/database-management.md`
- **Forms Guide**: `/web/src/components/FORMS_GUIDE.md`
- **Shared Types**: `../shared-types/CONTEXT.md`
- **Job-Finder Integration**: `../job-finder/docs/integrations/portfolio.md`

---

**Maintained By**: Josh Wentworth
**Review Cadence**: Quarterly or after major architectural changes
**Last Major Update**: January 2025 (SimpleLogger refactor)
