# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Firebase monorepo containing Josh Wentworth's professional portfolio. The project combines a Gatsby static site (`web/`) with Firebase Cloud Functions (`functions/`) for backend services including an AI-powered resume generator, contact form, and experience management system.

**Key Technologies:**
- **Frontend:** Gatsby 5 + React 18 + Theme UI + TypeScript
- **Backend:** Firebase Cloud Functions Gen 2 (Node.js 20)
- **Database:** Cloud Firestore (multiple named databases: `portfolio`, `portfolio-staging`)
- **AI Services:** OpenAI GPT-4o and Google Gemini 2.0 Flash for resume generation
- **Infrastructure:** Google Cloud Platform (GCP) with Secret Manager, Cloud Storage, Firebase Auth

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
│   │   ├── types/         # TypeScript type definitions (extends @jdubz/shared-types)
│   │   └── utils/         # Utilities (logger, validators, firebase)
│   └── static/            # Static assets
│
├── functions/             # Cloud Functions (Node.js 20)
│   └── src/
│       ├── config/        # Configuration (cors, secrets, database, error-codes)
│       ├── middleware/    # Auth and App Check verification
│       ├── services/      # Business logic (email, firestore, AI providers, PDF, storage)
│       ├── types/         # Type definitions (re-exports @jdubz/shared-types)
│       ├── utils/         # Utilities (logger, request-id)
│       ├── index.ts       # Contact form handler
│       ├── experience.ts  # Experience management API
│       ├── generator.ts   # AI resume generator API
│       ├── job-queue.ts   # Job queue management API
│       └── resume.ts      # Resume upload handler
│
├── scripts/               # Build and utility scripts
├── docs/                  # Documentation
├── emulator-data/         # Firebase emulator persistence
└── Makefile              # Development commands
```

### Shared Types Architecture

This project uses `@jdubz/job-finder-shared-types` (located at `../../../shared-types`) as a local package dependency:

```
../../../shared-types/     # Shared TypeScript types (separate repository)
├── src/
│   ├── index.ts          # Main exports
│   ├── queue.types.ts    # Queue and job matching types
│   ├── job.types.ts      # Job-related types
│   └── logger.types.ts   # Logging interfaces (NEW)
├── dist/                 # Compiled TypeScript
├── CONTEXT.md            # Architecture documentation
└── README.md             # Usage guide
```

**Integration:**
- **Portfolio** imports as: `import { QueueItem, JobMatch, LogContext } from '@jdubz/job-finder-shared-types'`
- **Job-finder** (Python) mirrors these types in Pydantic models
- Types are the **single source of truth** for cross-project data structures

**Key Shared Types:**
- `QueueItem` - Job queue structure in Firestore
- `JobMatch` - AI-analyzed job match results
- `QueueSettings`, `StopList`, `AISettings` - Configuration types
- API request/response types: `SubmitJobRequest`, `SubmitJobResponse`
- **Logger types** - `EnhancedLogger`, `SimpleLogger`, `LogContext`, `SENSITIVE_FIELDS`

See `../shared-types/CONTEXT.md` for detailed architecture documentation.

## Common Development Commands

### Daily Development

```bash
# Start web dev server (Gatsby on port 8000)
npm run dev
# or
make dev

# Start Firebase emulators (Firestore, Auth, Functions, Hosting)
npm run firebase:serve
# or
make firebase-emulators

# Run all tests
npm test

# Lint all code (web + functions)
npm run lint
# or
make lint

# Fix linting issues
npm run lint:fix
# or
make lint-fix
```

### Building

```bash
# Build web
npm run build:web

# Build functions
npm run build:functions

# Build everything
npm run build
```

### Testing

```bash
# Web tests (Jest)
npm run test:web
cd web && npm test

# Functions tests (Jest)
npm run test:functions
cd functions && npm test

# E2E tests (Playwright)
cd web && npm run test:e2e          # Headless
cd web && npm run test:e2e:ui       # UI mode
cd web && npm run test:e2e:debug    # Debug mode

# Specific test suites
make test-contact-form              # Test contact form API
make test-experience-api            # Test experience API with auth
make test-generator-api             # Test AI resume generator
```

### Linting

```bash
# Web linting
npm run lint:web                    # TypeScript + ESLint + Prettier
npm run lint:web:tsc                # TypeScript only
npm run lint:web:eslint             # ESLint only
npm run lint:web:prettier           # Prettier only

# Functions linting
npm run lint:functions

# Fix issues
npm run lint:fix                    # Auto-fix all
cd web && npm run lint:fix          # Fix web only
```

### Firebase Development

```bash
# Start emulators with UI dashboard
make firebase-emulators-ui

# Seed emulator with test data
make seed-emulators

# Test specific APIs
make test-contact-form-all          # Comprehensive contact form tests
make test-experience-api            # Experience API with auth
make test-generator-api             # AI resume generator

# Health checks
make health-check-local             # Check local emulator functions
make health-check-staging           # Check staging functions
make health-check-prod              # Check production functions
```

### Database Operations

```bash
# Seed AI generator defaults
make seed-generator-defaults        # Local emulator
make seed-generator-staging         # Staging database
make seed-generator-prod            # Production database

# Sync production data to staging
make sync-prod-to-staging
```

### Editor Role Management

```bash
# Grant editor role (required for content management)
make editor-add EMAIL=user@example.com

# Revoke editor role
make editor-remove EMAIL=user@example.com

# List all editors
make editor-list

# Check user's role
make editor-check EMAIL=user@example.com
```

### Deployment

**IMPORTANT:** Always follow the branch workflow: `feature → staging → main`

```bash
# Deploy to staging (auto-deploys on push to staging branch)
git push origin staging

# Deploy to production (create PR: staging → main)
gh pr create --base main --head staging

# Manual deployments (use CI/CD instead)
make deploy-staging
make deploy-prod

# Deploy single function
make deploy-function FUNC=manageGenerator
```

### Process Management

```bash
# Kill all dev servers and clean cache
make kill

# Clean Gatsby cache only
npm run clean
# or
cd web && npm run clean
```

## Architecture Patterns

### API Client Layer (`web/src/api/`)

All backend communication goes through centralized API clients:

- **`ApiClient`** (base class): HTTP methods, error handling, auth token injection
- **`ExperienceClient`**: Experience CRUD operations
- **`BlurbClient`**: Blurb CRUD operations
- **`GeneratorClient`**: AI resume generation

**Usage:**
```typescript
import { experienceClient, generatorClient } from '../api'

const entries = await experienceClient.getEntries()
const pdf = await generatorClient.generateResume(jobData, preferences)
```

### State Management (`web/src/hooks/`)

React hooks manage UI state and orchestrate API calls:

- **`useAuth`**: Firebase Auth state, token refresh, user role checks
- **`useExperienceData`**: Combined data fetching for experience page
- **`useAsyncSubmit`**: Form submission with loading/error states

**Pattern:** Hooks handle React state; API clients handle HTTP.

### Form Components (`web/src/components/`)

Reusable form components for consistent UX:

- **`FormField`**: Input/textarea with label and error display
- **`FormLabel`**: Standardized label styling
- **`FormActions`**: Action buttons (Cancel, Save, Delete)
- **`FormError`**: Error message display
- **`MarkdownEditor`**: Markdown textarea with preview

### Validation (`web/src/utils/validators.ts`)

Type-safe validation with reusable rules:

```typescript
const validator = createValidator<FormData>([
  { field: "email", validator: validators.required("Email") },
  { field: "email", validator: validators.email },
])

const errors = validator(formData)
```

### Logging

Both web and functions use structured logging:

```typescript
import { logger } from '../utils/logger'

logger.info("User action", { userId, action: "create" })
logger.error("API failed", error, { endpoint, status })
```

**Environments:**
- Development/Staging: Console output
- Production: Google Cloud Logging

## Environment Configuration

### Local Development (Emulators)

**Web** (`.env.development`):
```env
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=localhost
FIRESTORE_DATABASE_ID=(default)
```

**Test Accounts:**
- Editor: `contact@joshwentworth.com` / `testpassword123`
- Viewer: `test@example.com` / `testpassword123`

### Staging

**Web** (`.env.staging`):
- Domain: `staging.joshwentworth.com`
- Firestore: `portfolio-staging` database
- Functions: `manageGenerator-staging`, etc.

### Production

**Web** (`.env.production`):
- Domain: `joshwentworth.com`
- Firestore: `portfolio` database
- Functions: `manageGenerator`, etc.

## Firebase Services

### Cloud Functions

**Deployed Functions:**
1. **`handleContactForm`**: Contact form submission handler with email delivery
2. **`manageExperience`**: REST API for experience/blurb CRUD operations
3. **`manageGenerator`**: AI resume/cover letter generator with PDF export
4. **`uploadResume`**: Resume upload handler

**All functions support `/health` endpoints** for monitoring.

### Firestore Collections

**Production (`portfolio` database):**
- `experiences`: Work history entries
- `blurbs`: Markdown content sections (intro, skills, etc.)
- `generator_defaults`: Default personal info for AI generation
- `generator_blurbs`: Custom prompt templates
- `generator_history`: Generated document history (editor-only)

**Staging (`portfolio-staging` database):**
- Same structure as production

### Secret Manager

Secrets stored in Google Cloud Secret Manager:

- `mailgun-api-key`: Email service API key
- `mailgun-domain`: Email service domain
- `openai-api-key`: OpenAI API key for resume generation
- `google-api-key`: Google Gemini API key for cost-effective AI generation

### Authentication

- **Firebase Auth** with Google OAuth
- **Custom Claims:** `role: "editor"` for content management access
- **Auth Middleware:** `verifyIdToken()` checks JWT tokens on protected endpoints
- **Emulator Support:** Test users pre-seeded in emulator data

## Git Workflow

**Branch Strategy:**
```
feature_branch → staging → main
```

**Rules:**
1. Create feature branches from `staging`
2. Create PR: `feature → staging`
3. After staging testing, create PR: `staging → main`
4. **Never push directly to `main`** (use PRs from staging)

**Exception:** Hotfixes for broken staging can be committed directly to staging

**Deployment:**
- Push to `staging` → auto-deploys to `staging.joshwentworth.com`
- Merge to `main` → auto-deploys to `joshwentworth.com`

## Testing Checklist (Before Merging to Main)

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Feature tested on `staging.joshwentworth.com`
- [ ] Auth works (if auth-related changes)
- [ ] No console errors
- [ ] Mobile responsive (if UI changes)

## Versioning

This project uses **Changesets** for version management:

```bash
# Create changeset after changes
npm run changeset
# or
make changeset

# Version packages (done by CI/CD)
npm run version

# Publish (done by CI/CD on main merge)
npm run release
```

**Changeset bump types:**
- **patch**: Bug fixes, typos, small improvements
- **minor**: New features, non-breaking changes
- **major**: Breaking changes

**Automatic version bumping:** When a PR is merged to `main`, a GitHub Action automatically creates a new changeset if one wasn't included.

## AI Resume Generator

The AI resume generator is a production feature that supports:

- **Multi-Provider AI**: OpenAI GPT-4o or Google Gemini 2.0 Flash (96% cheaper)
- **Professional PDF Export**: Custom branded templates via Puppeteer
- **Cloud Storage**: Automatic GCS upload with signed URLs
- **Customization**: Editors can customize AI prompts and default personal info
- **History Tracking**: All generated documents tracked in Firestore (editor-only)

**Key Files:**
- `functions/src/generator.ts`: Main API endpoint
- `functions/src/services/generator.service.ts`: Generation orchestration
- `functions/src/services/ai-provider.factory.ts`: Multi-provider AI abstraction
- `functions/src/services/pdf.service.ts`: PDF generation with Puppeteer
- `web/src/api/generator-client.ts`: Frontend API client
- `web/src/pages/resume-builder.tsx`: User interface

## Important Notes

### Security

- **Firestore Rules**: Enforce authentication for write operations
- **Firebase App Check**: Defense-in-depth for API protection
- **Rate Limiting**: Contact form protected with express-rate-limit
- **CORS**: Configured per-function in `functions/src/config/cors.ts`
- **Secrets**: Never commit secrets; use Secret Manager

### Performance

- **Gatsby Build**: Requires Node.js 20, 6-8GB RAM allocation
- **Functions**: All Gen 2, 256MB memory, 60s timeout (configurable)
- **Firestore**: Uses named databases for environment isolation

### Common Issues

1. **Gatsby Build Fails**: Clean cache with `npm run clean` or `make kill`
2. **Emulators Won't Start**: Check ports 4000, 5000, 5001, 8080, 9099 are free
3. **Auth Fails in Emulator**: Re-run `node scripts/seed-emulator.js`
4. **Function Deployment Fails**: Ensure correct build service account is configured

### Documentation

For more details, see:
- [Architecture](./docs/development/ARCHITECTURE.md)
- [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)
- [Firebase Configuration](./docs/setup/FIREBASE_CONFIG_CHECKLIST.md)
- [Known Issues](./docs/development/KNOWN_ISSUES.md)
- [Brand Guidelines](./docs/brand/README.md)

## Cross-Project Integration: Job-Finder

This portfolio integrates with a separate **job-finder** Python application that automates job discovery and matching:

### Architecture Overview

```
┌─────────────────┐        Firestore         ┌─────────────────┐
│   Portfolio     │◄────────(shared)─────────►│  Job-Finder     │
│  (TypeScript)   │                           │    (Python)     │
└─────────────────┘                           └─────────────────┘
        │                                              │
        │                                              │
        ▼                                              ▼
  @jdubz/shared-types ◄────────────────── Python Pydantic Models
   (TypeScript types)        (mirrors)        (runtime validation)
```

### Shared Data Collections

**Firestore Collections (shared between projects):**

1. **`job-queue`** - Queue of jobs to process
   - Written by: Portfolio (user submissions) + Job-finder (automated scans)
   - Read by: Job-finder (processing) + Portfolio (status display)
   - Type: `QueueItem` from `@jdubz/shared-types`

2. **`job-matches`** - AI-analyzed job match results
   - Written by: Job-finder (after AI analysis)
   - Read by: Portfolio (job applications tab)
   - Type: `JobMatch` from `@jdubz/shared-types`

3. **`job-finder-config`** - Configuration documents
   - `stop-list`: Companies/keywords to exclude (Type: `StopList`)
   - `queue-settings`: Processing parameters (Type: `QueueSettings`)
   - `ai-settings`: AI provider configuration (Type: `AISettings`)
   - Written/read by: Both projects

### Type Synchronization

**TypeScript → Python Type Mapping:**

All types defined in `@jdubz/shared-types` have corresponding Python Pydantic models in `job-finder/src/job_finder/queue/models.py`:

```typescript
// TypeScript (@jdubz/shared-types)
export interface QueueItem {
  type: QueueItemType
  status: QueueStatus
  url: string
  company_name: string
  // ...
}
```

```python
# Python (job-finder)
class JobQueueItem(BaseModel):
    type: QueueItemType  # Enum
    status: QueueStatus  # Enum
    url: str
    company_name: str
    # ...
```

**Important:** When modifying shared types:
1. Update TypeScript types in `@jdubz/shared-types`
2. Update Python models in `job-finder`
3. Test both projects together
4. Deploy to staging and verify integration

### Job Queue Flow

1. **Submission** (Portfolio):
   - User submits job URL via JobFinderTab UI
   - API call to `job-queue.ts` Cloud Function
   - Creates `QueueItem` with status "pending"

2. **Processing** (Job-Finder):
   - Python worker polls `job-queue` collection
   - Updates status to "processing"
   - Scrapes job data, analyzes with AI
   - Creates `JobMatch` document if score ≥ threshold
   - Updates `QueueItem` status to "success"/"failed"

3. **Display** (Portfolio):
   - JobFinderTab shows queue status
   - JobApplicationsTab displays matched jobs
   - User can generate custom resume/cover letter

### API Endpoints

**Portfolio Functions:**
- `POST /submitJob` - Submit job URL to queue
- `GET /jobQueue` - Get queue status (admin only)
- `GET /jobMatches` - Get AI-analyzed matches

**Job-Finder Endpoints:**
- Internal processing only (no HTTP endpoints)
- Communicates via Firestore only

### Configuration Management

Both projects share configuration via Firestore:

```typescript
// Portfolio (read/write via UI)
const settings: QueueSettings = {
  maxRetries: 3,
  retryDelaySeconds: 300,
  processingTimeout: 600
}
```

```python
# Job-finder (read for processing)
settings = await config_service.get_queue_settings()
max_retries = settings.max_retries
```

### Development Workflow

When working on job-finder integration:

1. **Check shared types** in `../shared-types/CONTEXT.md`
2. **Test locally** with Firebase emulators
3. **Run both projects** simultaneously:
   ```bash
   # Terminal 1: Portfolio
   cd /home/jdubz/Development/portfolio
   make dev

   # Terminal 2: Job-finder
   cd /home/jdubz/Development/job-finder
   python -m job_finder.queue.worker
   ```
4. **Monitor Firestore** for data flow
5. **Test end-to-end** flow before deploying

### Related Files

**Portfolio:**
- `functions/src/job-queue.ts` - Queue management API
- `functions/src/types/job-queue.types.ts` - Type re-exports
- `web/src/components/tabs/JobFinderTab.tsx` - Queue submission UI
- `web/src/components/tabs/JobApplicationsTab.tsx` - Matches display UI
- `web/src/api/job-queue-client.ts` - API client

**Job-Finder:**
- `src/job_finder/queue/worker.py` - Queue processor
- `src/job_finder/queue/models.py` - Pydantic models
- `src/job_finder/services/ai_analyzer.py` - AI matching logic
- `src/job_finder/services/firestore_service.py` - Firestore operations

**Shared Types:**
- `../shared-types/src/queue.types.ts` - Single source of truth
- `../shared-types/CONTEXT.md` - Architecture documentation
- `../shared-types/README.md` - Usage examples

### Troubleshooting Integration Issues

1. **Type mismatches between projects:**
   - Check `@jdubz/shared-types` is up to date
   - Rebuild shared-types: `cd ../shared-types && npm run build`
   - Reinstall in portfolio: `npm install`

2. **Queue items not processing:**
   - Verify job-finder worker is running
   - Check Firestore rules allow writes
   - Check queue item status in Firestore UI
   - Review job-finder logs for errors

3. **Data not appearing in UI:**
   - Check Firestore collection names match
   - Verify user has proper Firebase Auth token
   - Check browser console for API errors
   - Verify emulator vs production environment

4. **AI matching not working:**
   - Check AI provider API keys in Secret Manager
   - Verify `ai-settings` configuration in Firestore
   - Check cost budget hasn't been exceeded
   - Review job-finder logs for AI errors
