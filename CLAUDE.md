# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a minimal Firebase monorepo for Josh Wentworth's professional portfolio. The project is a Gatsby static site with a single Cloud Function for the contact form.

**Key Technologies:**
- **Frontend:** Gatsby 5 + React 18 + Theme UI + TypeScript
- **Backend:** Firebase Cloud Functions Gen 2 (Node.js 20) - single function
- **Database:** Cloud Firestore (stores contact form submissions)
- **Security:** Firebase App Check + reCAPTCHA v3
- **Analytics:** Firebase Analytics
- **Infrastructure:** Google Cloud Platform (GCP) with Secret Manager

## Project Structure

```
portfolio/
├── web/                    # Gatsby frontend (port 8000)
│   ├── src/
│   │   ├── components/    # React components (ui, layout)
│   │   ├── pages/         # Gatsby page components (homepage, contact, legal)
│   │   ├── styles/        # Theme UI configuration
│   │   └── utils/         # Utilities (logger, firebase config)
│   └── static/            # Static assets
│
├── functions/             # Cloud Functions (Node.js 20)
│   └── src/
│       ├── config/        # Configuration (cors, secrets, error-codes)
│       ├── services/      # Email service (Mailgun)
│       ├── utils/         # Utilities (logger, request-id)
│       └── index.ts       # Contact form handler (ONLY function)
│
├── scripts/               # Build and deployment scripts
├── docs/                  # Documentation
└── Makefile              # Development commands
```

## Common Development Commands

### Daily Development

```bash
# Start web dev server (Gatsby on port 8000)
npm run dev
# or
make dev

# Start Firebase emulators (Functions, Hosting)
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

# Functions tests (Jest)
npm run test:functions

# E2E tests (Playwright)
cd web && npm run test:e2e          # Headless
cd web && npm run test:e2e:ui       # UI mode
cd web && npm run test:e2e:debug    # Debug mode

# Test contact form
make test-contact-form              # Test contact form API
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
```

### Firebase Development

```bash
# Start emulators with UI dashboard
make firebase-emulators-ui

# Health checks
make health-check-local             # Check local emulator function
make health-check-staging           # Check staging function
make health-check-prod              # Check production function
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
```

### Process Management

```bash
# Kill all dev servers and clean cache
make kill

# Clean Gatsby cache only
npm run clean
```

## Contact Form Architecture

The contact form is a simple, secure implementation:

### Frontend (`web/src/pages/contact.tsx`)

- Inline HTML form (no complex form components)
- reCAPTCHA v3 integration for spam protection
- Client-side validation before submission
- Direct HTTP POST to Cloud Function

### Backend (`functions/src/index.ts`)

Single Cloud Function: `handleContactForm`

**Flow:**
1. Verify reCAPTCHA token
2. Verify Firebase App Check token
3. Rate limiting (prevents spam)
4. Save submission to Firestore (`contact_submissions` collection)
5. Send email via Mailgun
6. Return success/error response

**Security Layers:**
- Firebase App Check (defense-in-depth)
- reCAPTCHA v3 (spam protection)
- Rate limiting (express-rate-limit)
- CORS configuration
- Request ID tracking

**Key Files:**
- `functions/src/index.ts` - Main handler
- `functions/src/services/email.service.ts` - Mailgun integration
- `functions/src/config/cors.ts` - CORS configuration
- `functions/src/config/secrets.ts` - Secret Manager access

## Environment Configuration

### Local Development (Emulators)

**Web** (`.env.development`):
```env
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=localhost
```

No authentication required for local development.

### Staging

**Web** (`.env.staging`):
- Domain: `staging.joshwentworth.com`
- Function: `handleContactForm-staging`

### Production

**Web** (`.env.production`):
- Domain: `joshwentworth.com`
- Function: `handleContactForm`

## Firebase Services

### Cloud Functions

**Deployed Function:**
- **`handleContactForm`**: Contact form submission handler with email delivery

**Health endpoint:** `GET /health` for monitoring.

### Firestore Collections

**Production:**
- `contact_submissions`: Contact form submissions (admin access only via Firebase Console)

**Staging:**
- Same structure as production

**Note:** Firestore is ONLY accessed server-side via Cloud Function (Admin SDK). No client-side Firestore access.

### Secret Manager

Secrets stored in Google Cloud Secret Manager:

- `mailgun-api-key`: Email service API key
- `mailgun-domain`: Email service domain

### Security Services

- **Firebase App Check**: Validates requests from legitimate clients
- **Firebase Analytics**: Tracks page views and events
- **reCAPTCHA v3**: Spam protection for contact form

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
- [ ] Contact form works (if contact-related changes)
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

## Important Notes

### Security

- **Firebase App Check**: Defense-in-depth for contact form
- **reCAPTCHA v3**: Spam protection
- **Rate Limiting**: Contact form protected with express-rate-limit
- **CORS**: Configured in `functions/src/config/cors.ts`
- **Secrets**: Never commit secrets; use Secret Manager
- **No client-side database access**: Firestore only accessed via Cloud Function

### Performance

- **Gatsby Build**: Requires Node.js 20, 6-8GB RAM allocation
- **Function**: Gen 2, 256MB memory, 60s timeout
- **Static Site**: Deployed to Firebase Hosting (CDN)

### Common Issues

1. **Gatsby Build Fails**: Clean cache with `npm run clean` or `make kill`
2. **Emulators Won't Start**: Check ports 5000, 5001, 8080 are free
3. **Contact form fails**: Check reCAPTCHA keys in environment variables
4. **Function Deployment Fails**: Ensure correct build service account is configured

### Logging

Both web and functions use structured logging:

```typescript
import { logger } from '../utils/logger'

logger.info("Contact form submitted", { email })
logger.error("Email send failed", error, { recipient })
```

**Environments:**
- Development/Staging: Console output
- Production: Google Cloud Logging

### Documentation

For more details, see:
- [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)
- [Firebase Configuration](./docs/setup/FIREBASE_CONFIG_CHECKLIST.md)
- [Brand Guidelines](./docs/brand/README.md)

## Pages

The site has minimal pages:

1. **Homepage** (`/`) - Static portfolio showcase
2. **Contact** (`/contact`) - Contact form
3. **Legal Pages** - Privacy policy, terms of service, etc.

All pages are static (no authentication, no dynamic content management).
