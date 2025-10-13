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
