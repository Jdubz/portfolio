# Portfolio Architecture

**Last Updated**: January 2025

## Overview

This is a Firebase monorepo containing Josh Wentworth's professional portfolio. The project combines a Gatsby static site (`web/`) with Firebase Cloud Functions (`functions/`) for backend services including an AI-powered resume generator, contact form, and experience management system.

**Key Technologies:**
- **Frontend:** Gatsby 5 + React 18 + Theme UI + TypeScript
- **Backend:** Firebase Cloud Functions Gen 2 (Node.js 20)
- **Database:** Cloud Firestore (multiple named databases: `portfolio`, `portfolio-staging`)
- **AI Services:** OpenAI GPT-4o and Google Gemini 2.0 Flash for resume generation
- **Infrastructure:** Google Cloud Platform (GCP) with Secret Manager, Cloud Storage, Firebase Auth

---

## Project Structure

```
portfolio/
├── web/                    # Gatsby frontend (port 8000)
│   ├── src/
│   │   ├── api/           # API client layer (HTTP communication)
│   │   ├── components/    # React components (ui, layout, features)
│   │   ├── config/        # Centralized configuration (api.ts)
│   │   ├── hooks/         # Custom React hooks (useAuth, useExperienceData)
│   │   ├── pages/         # Gatsby page components
│   │   ├── styles/        # Shared styles and Theme UI config
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utilities (logger, validators, firebase)
│   └── static/            # Static assets
│
├── functions/             # Cloud Functions (Node.js 20)
│   └── src/
│       ├── config/        # Configuration (cors, secrets, database, error-codes)
│       ├── middleware/    # Auth and App Check verification
│       ├── services/      # Business logic (email, firestore, AI providers, PDF, storage)
│       ├── utils/         # Utilities (logger, request-id)
│       ├── templates/     # Handlebars templates for PDF generation
│       ├── index.ts       # Contact form handler
│       ├── experience.ts  # Experience management API
│       ├── generator.ts   # AI resume generator API
│       └── resume.ts      # Resume upload handler
│
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── emulator-data/         # Firebase emulator persistence
└── Makefile              # Development commands
```

---

## Frontend Architecture (`web/`)

### 1. API Client Layer (`web/src/api/`)

Centralized HTTP client for all backend communication. Pattern: API clients handle HTTP, hooks handle React state.

**Base Class:**
- **`ApiClient`**: Common HTTP methods (GET, POST, PUT, DELETE), error handling, auth token injection, request ID tracking

**Specialized Clients:**
- **`ExperienceClient`**: Experience entry CRUD operations
- **`BlurbClient`**: Blurb CRUD operations
- **`GeneratorClient`**: AI resume/cover letter generation with real-time progress polling

**Example Usage:**
```typescript
import { experienceClient, generatorClient } from '../api'

const entries = await experienceClient.getEntries()
const pdf = await generatorClient.generateResume(jobData, preferences)
```

### 2. State Management Hooks (`web/src/hooks/`)

React hooks manage UI state and orchestrate API calls.

- **`useAuth`**: Firebase Auth state, token refresh, user role checks (editor vs viewer)
- **`useExperienceData`**: Combined data fetching for experience page
- **`useAsyncSubmit`**: Form submission with loading/error states

**Pattern**: Hooks handle React state; API clients handle HTTP.

### 3. Form Components (`web/src/components/`)

Reusable form components for consistent UX:

- **`FormField`**: Input/textarea with label and error display
- **`FormLabel`**: Standardized label styling
- **`FormActions`**: Action buttons (Cancel, Save, Delete)
- **`FormError`**: Error message display
- **`MarkdownEditor`**: Markdown textarea with preview

### 4. Validation (`web/src/utils/validators.ts`)

Type-safe validation with reusable rules:

```typescript
const validator = createValidator<FormData>([
  { field: "email", validator: validators.required("Email") },
  { field: "email", validator: validators.email },
])

const errors = validator(formData)
```

### 5. Centralized Configuration

- **`web/src/config/api.ts`**: API endpoints and URL generation
- **Environment-specific config**: `.env.development`, `.env.staging`, `.env.production`

### 6. Logging (`web/src/utils/logger.ts`)

Structured logging with environment awareness:

```typescript
logger.info("User action", { userId, action: "create" })
logger.error("API failed", error, { endpoint, status })
```

- Development/Staging: Console output
- Production: Google Cloud Logging

---

## Backend Architecture (`functions/`)

### Cloud Functions (Gen 2, Node.js 20)

**Deployed Functions:**

1. **`handleContactForm`**: Contact form submission handler
   - Email delivery via Mailgun
   - Rate limiting
   - CORS configuration
   - Endpoint: `/handleContactForm`

2. **`manageExperience`**: REST API for experience/blurb CRUD
   - Endpoints: `/experience/entries/*`, `/experience/blurbs/*`
   - Auth required for write operations
   - Supports both authenticated editors and public reads

3. **`manageGenerator`**: AI resume/cover letter generator
   - Multi-provider AI (OpenAI, Gemini)
   - PDF export with custom templates
   - Cloud Storage with signed URLs
   - Real-time progress tracking
   - Endpoints: `/generator/generate`, `/generator/personal-info`, `/generator/history`

4. **`uploadResume`**: Resume upload handler
   - File validation and storage
   - GCS integration

**All functions support `/health` endpoints** for monitoring.

### Service Layer Pattern

Business logic is organized in service classes:

- **`ExperienceService`**: Firestore operations for experience entries
- **`BlurbService`**: Firestore operations for blurb content
- **`GeneratorService`**: AI generation request/response tracking
- **`OpenAIService`**: OpenAI GPT-4o integration
- **`GeminiService`**: Google Gemini 2.0 Flash integration
- **`PDFService`**: PDF generation with Puppeteer + Handlebars
- **`EmailService`**: Email delivery via Mailgun
- **`StorageService`**: GCS file operations with signed URLs

### Middleware

- **`verifyIdToken()`**: Firebase Auth JWT verification
- **`verifyAppCheck()`**: Firebase App Check validation (defense-in-depth)

---

## AI Resume Generator Architecture

### Tech Stack

**AI Providers:**
- **OpenAI GPT-4o** (`gpt-4o-2024-08-06`): $0.0275 per generation
- **Google Gemini 2.0 Flash**: $0.0011 per generation (96% cheaper!)

**PDF Generation:**
- Puppeteer with Handlebars templates
- Modern responsive template with accent color theming
- Attribution footer linking to portfolio

**Storage:**
- Google Cloud Storage with environment-aware buckets
- Signed URLs (1 hour for viewers, 7 days for editors)
- Lifecycle management (90-day COLDLINE transition)

### Data Model

**Firestore Collections:**

1. **`generator/personal-info`**: Default personal information
   - Name, email, phone, location, website, GitHub, LinkedIn
   - Avatar and logo URLs
   - Custom AI prompts (optional)
   - Accent color for PDF theming

2. **`generator/{requestId}`**: Generation requests (tracking)
   - Job details (role, company, description)
   - Experience data snapshot
   - Status tracking (pending/processing/completed/failed)
   - Real-time step updates
   - Access control (viewer session ID or editor email)

3. **`generator/{responseId}`**: Generation responses (results)
   - Generated resume/cover letter content
   - PDF file URLs (GCS signed URLs)
   - Performance metrics (duration, token usage, cost)
   - AI model information

### Generation Flow

1. **Request Creation**: POST `/generator/generate`
   - Validate inputs (job info, generation type, provider selection)
   - Create request document in Firestore
   - Return request ID

2. **AI Generation**:
   - Fetch personal info and experience data
   - Format prompts with Handlebars templates
   - Call AI provider (OpenAI or Gemini)
   - Update progress steps in real-time

3. **PDF Export**:
   - Render Handlebars template with generated content
   - Generate PDF with Puppeteer
   - Upload to GCS with signed URL
   - Update progress steps

4. **Response**:
   - Create response document with results
   - Return download URLs immediately
   - Frontend polls for progress updates

### AI Prompt Strategy

**Resume Prompts:**
- Strict length controls (600-750 words total)
- Maximum 3-4 experience entries (AI selects most relevant)
- Maximum 4 bullet points per entry
- Professional summary: 2-3 sentences (50-75 words)
- Prioritizes relevance over recency, quality over quantity

**Cover Letter Prompts:**
- Casual, conversational, creative tone (not stiff corporate)
- Weaves personal stories/values with professional experience
- Cross-references company culture/mission with candidate bio
- Strict 250-350 word limit
- 3 paragraphs maximum
- Avoids clichés and generic phrases

### Rate Limiting

- **Viewers**: 10 requests per 15 minutes (session ID-based)
- **Editors**: 20 requests per 15 minutes (Firebase Auth UID-based)

### Authentication & Authorization

- **Viewers**: Can generate documents without authentication
- **Editors**: Firebase Auth with custom claim `role: "editor"`
  - Access to document history
  - Can customize AI prompts and personal info
  - Extended signed URL expiry (7 days vs 1 hour)

---

## Firestore Architecture

### Named Databases

- **`portfolio`** (production): Main database
- **`portfolio-staging`** (staging): Testing environment
- **`(default)`** (emulator): Local development

### Collections

**Production (`portfolio` database):**

1. **`experiences`**: Work history entries
   - Fields: title, role, location, startDate, endDate, body, order
   - Security: Public read, editor write

2. **`blurbs`**: Markdown content sections
   - Fields: name (unique ID), title, content
   - Used for: intro, skills, personal bio
   - Security: Public read, editor write

3. **`generator/personal-info`**: Default personal info for AI generation
   - Single document with personal details and preferences
   - Includes optional custom AI prompts

4. **`generator/{requestId}`**: AI generation requests
   - Request tracking with step-by-step progress
   - Access control via viewerSessionId or editor email

5. **`generator/{responseId}`**: AI generation responses
   - Generated content and file URLs
   - Performance metrics and cost tracking

**Staging (`portfolio-staging` database):**
- Same structure as production
- Used for testing before production deployment

### Security Rules

- **Public Read**: `experiences`, `blurbs`, `generator/personal-info`
- **Editor Write**: All write operations require `role: "editor"` custom claim
- **Viewer Access**: Can read their own generation requests via session ID

---

## Google Cloud Platform Services

### Cloud Storage

**Buckets:**
- `{project-id}-resumes` (production)
- `{project-id}-resumes-staging` (staging)

**Lifecycle Policy:**
- Standard storage for 90 days
- Automatic transition to COLDLINE after 90 days
- Cost optimization for long-term storage

**Access:**
- Signed URLs with expiration
- No public access
- Service account authentication

### Secret Manager

Secrets stored securely:

- **`mailgun-api-key`**: Email service API key
- **`mailgun-domain`**: Email service domain
- **`openai-api-key`**: OpenAI API key for resume generation
- **`google-api-key`**: Google Gemini API key

### Firebase Authentication

- **Google OAuth**: Primary authentication method
- **Custom Claims**: `role: "editor"` for content management
- **Emulator Support**: Test users pre-seeded in emulator data

---

## Development Workflow

### Local Development

```bash
# Start Firebase emulators (Firestore, Auth, Functions, Hosting)
make firebase-emulators

# Start Gatsby dev server (separate terminal)
make dev

# Seed emulator with test data
make seed-emulators
```

**Test Accounts:**
- Editor: `contact@joshwentworth.com` / `testpassword123`
- Viewer: `test@example.com` / `testpassword123`

### Environment Configuration

**Local Development** (`.env.development`):
```env
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=localhost
FIRESTORE_DATABASE_ID=(default)
```

**Staging** (`.env.staging`):
- Domain: `staging.joshwentworth.com`
- Firestore: `portfolio-staging` database
- Functions: `manageGenerator-staging`, etc.

**Production** (`.env.production`):
- Domain: `joshwentworth.com`
- Firestore: `portfolio` database
- Functions: `manageGenerator`, etc.

### Git Workflow

```
feature_branch → staging → main
```

**Rules:**
1. Create feature branches from `staging`
2. Create PR: `feature → staging`
3. After staging testing, create PR: `staging → main`
4. **Never push directly to `main`** (use PRs from staging)

**Deployment:**
- Push to `staging` → auto-deploys to `staging.joshwentworth.com`
- Merge to `main` → auto-deploys to `joshwentworth.com`

---

## Testing

### Test Coverage

- **Web**: 42 tests (Jest)
- **Functions**: 169 tests (Jest)
- **Total**: 211 tests

### Test Commands

```bash
# Run all tests
npm test

# Web tests only
npm run test:web

# Functions tests only
npm run test:functions

# E2E tests (Playwright)
cd web && npm run test:e2e
```

### Linting

```bash
# Lint all code
npm run lint

# Auto-fix issues
npm run lint:fix

# Lint specific workspace
npm run lint:web
npm run lint:functions
```

---

## Versioning & Releases

**Changesets** workflow for version management:

```bash
# Create changeset after changes
npm run changeset

# Version packages (done by CI/CD)
npm run version

# Publish (done by CI/CD on main merge)
npm run release
```

**Automatic version bumping:** When a PR is merged to `main`, a GitHub Action automatically creates a changeset if one wasn't included.

---

## Key Design Decisions

### 1. Multi-Provider AI

**Why:** Cost optimization and vendor flexibility
- Gemini is 96% cheaper than OpenAI
- Allows A/B testing of quality
- Reduces vendor lock-in risk

### 2. Firestore for Tracking

**Why:** Real-time updates and query flexibility
- Better than Cloud Storage metadata for complex queries
- Enables real-time progress UI
- Composite indexes for efficient filtering

### 3. API Client Layer

**Why:** Separation of concerns
- Business logic in services (reusable, testable)
- HTTP communication in API clients
- React state in hooks
- Clean architecture with clear boundaries

### 4. Named Databases

**Why:** Environment isolation
- Staging and production data completely separate
- No risk of cross-environment contamination
- Easier to debug and test

### 5. Signed URLs over Public URLs

**Why:** Security and access control
- Time-limited access
- Different expiry for viewers vs editors
- No permanent public URLs

---

## Performance Considerations

### Frontend

- **Gatsby Build**: Requires Node.js 20, 6-8GB RAM
- **Static Site Generation**: Pre-rendered pages for fast load times
- **Code Splitting**: Automatic via Gatsby

### Backend

- **Cloud Functions**: Gen 2, 256MB memory, 60s timeout
- **Cold Starts**: Mitigated by Cloud Functions Gen 2 improvements
- **Rate Limiting**: Prevents abuse and controls costs

### Database

- **Composite Indexes**: For efficient querying in production
- **Named Databases**: Isolated environments for staging/production

---

## Security

### Defense in Depth

1. **Firebase Auth**: User authentication and custom claims
2. **Firestore Rules**: Server-side authorization
3. **App Check**: Bot protection (optional)
4. **Rate Limiting**: Prevents abuse
5. **CORS**: Configured per-function
6. **Secret Manager**: Secure credential storage

### Best Practices

- Never commit secrets to git
- Use environment variables for configuration
- Validate all user inputs
- Sanitize data before storage
- Use signed URLs for file access

---

## Common Patterns

### Error Handling

```typescript
try {
  const result = await apiClient.post('/endpoint', data)
  return result
} catch (error) {
  logger.error('Operation failed', error, { context })
  throw error // Let UI handle display
}
```

### Authentication

```typescript
const user = await firebase.auth().currentUser
const token = await user.getIdToken()
const result = await apiClient.post('/endpoint', data, true) // auth=true
```

### Firestore Queries

```typescript
const entries = await db
  .collection('experiences')
  .orderBy('order', 'asc')
  .get()
```

---

## Documentation

For more details, see:
- [SETUP.md](./SETUP.md) - Development setup and configuration
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Prioritized future work
- [CLAUDE.md](../../CLAUDE.md) - Claude Code integration guide

---

**Last Updated:** January 2025
