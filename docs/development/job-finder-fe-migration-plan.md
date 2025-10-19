# Job Finder Frontend Migration Plan

**Last updated:** 2025-10-19
**Status:** Phase 1-3 Complete (API Layer, Job Finder, Job Applications)

## Overview

This document captures the end-to-end plan for extracting the Job Finder experience from the `portfolio` repository and delivering a dedicated React + shadcn UI application in `../job-finder-FE`, while preserving the existing portfolio home page and contact form. It also covers infrastructure, security, deployment, documentation, and operational considerations.

## Objectives

- Maintain uninterrupted availability of the portfolio home page (`/`) and contact form (`/contact`).
- Deliver a React 18 + Vite application styled with shadcn (blue preset) for all Job Finder features.
- Leverage `@jdubz/job-finder-shared-types` as the canonical interface contract across frontends, Firebase Functions, and backend services.
- Preserve existing Firebase Functions, Firestore rules, and Google Cloud logging integrations.
- Provision Cloudflare DNS and Firebase Hosting targets via infrastructure-as-code (Terraform).
- Support staging (`staging.job-finder.joshwentworth.com`) and production (`job-finder.joshwentworth.com`) environments with automated CI/CD.

## Constraints & Assumptions

- Gatsby- and Theme UI-specific code will not be ported; the new UI targets a clean shadcn implementation with functional parity.
- Hosting remains on Firebase Hosting; Cloudflare provides DNS/front-door routing only.
- OAuth providers and Firebase Auth continue to use the same Google Cloud project.
- All Terraform/automation runs from the `portfolio` repo infrastructure directory unless otherwise specified.

## High-Level Phases

1. **Discovery & Freeze** – ✅ **COMPLETE** – Audit complete, portfolio already cleaned up
2. **Infrastructure Provisioning** – 🔄 **IN PROGRESS** – Terraform groundwork pending
3. **React Application Delivery** – 🔄 **IN PROGRESS** (45% Complete)
   - ✅ Phase 1: API Client Layer (COMPLETE)
   - ✅ Phase 2: Job Finder Page (COMPLETE)
   - ✅ Phase 3: Job Applications Page (COMPLETE)
   - 📋 Phase 4: Document Builder Page (Next)
   - 📋 Phase 5: Content Items Page
   - 📋 Phase 6: Admin Pages (Queue, Config, Prompts)
4. **CI/CD & Environment Hardening** – 📋 **PENDING** – Build pipelines ready, needs deployment setup
5. **Cutover & Validation** – 📋 **PENDING** – Awaiting feature completion
6. **Portfolio Cleanup** – ✅ **COMPLETE** – Job Finder already removed from portfolio

## Implementation Progress (2025-10-19)

### ✅ Completed: API Client Layer

**Status:** COMPLETE
**Date:** 2025-10-19

Created comprehensive API client infrastructure in `job-finder-FE/src/api/`:

1. **BaseApiClient** (`base-client.ts`)
   - Automatic Firebase Auth token injection
   - Exponential backoff retry logic (3 attempts)
   - Custom error handling with ApiError class
   - Support for GET, POST, PUT, DELETE, PATCH

2. **JobQueueClient** (`job-queue-client.ts`)
   - Submit jobs for AI analysis
   - Submit scrape/company requests
   - Queue management operations
   - Get queue statistics

3. **JobMatchesClient** (`job-matches-client.ts`)
   - Query job matches with filters
   - Real-time subscriptions via Firestore onSnapshot
   - Match statistics

4. **GeneratorClient** (`generator-client.ts`)
   - AI resume/cover letter generation
   - Document history management
   - User defaults CRUD

5. **ConfigClient** (`config-client.ts`)
   - Stop list management
   - Queue settings management
   - AI settings management

All clients use `@jdubz/job-finder-shared-types` for type safety.

### ✅ Completed: Job Finder Page

**Status:** COMPLETE
**Date:** 2025-10-19

Implemented in `job-finder-FE/src/pages/job-finder/`:

**Features:**
- Job URL submission form with validation
- Optional company name/website fields
- Real-time queue status table
- Editor-only access control
- Success/error feedback alerts
- Loading states

**Components:**
- `JobFinderPage.tsx` - Main page with form
- `components/QueueStatusTable.tsx` - Real-time queue display

**Integration:**
- Uses `jobQueueClient` for submissions
- Firestore listener for live queue updates
- Status badges (Pending, Processing, Success, Failed, Skipped, Filtered)
- Time-relative timestamps

### ✅ Completed: Job Applications Page

**Status:** COMPLETE
**Date:** 2025-10-19

Implemented in `job-finder-FE/src/pages/job-applications/`:

**Features:**
- Real-time job matches display
- Statistics dashboard (total, high priority, avg score)
- Advanced filtering (search, priority, sort)
- Comprehensive job details modal with 4 tabs
- Match score visualization
- Skills analysis (matched/missing)
- Customization recommendations

**Components:**
- `JobApplicationsPage.tsx` - Main page (272 lines)
- `components/JobMatchCard.tsx` - Match display card (133 lines)
- `components/JobDetailsDialog.tsx` - Details modal (297 lines)

**Modal Tabs:**
1. Overview - Match analysis, reasons, strengths, concerns
2. Skills - Matched/missing skills with color coding
3. Customization - AI recommendations, resume intake data
4. Description - Full job description and company info

**Integration:**
- Uses `jobMatchesClient` for real-time subscriptions
- Firestore onSnapshot for live updates
- Client-side filtering and sorting
- Ready for Document Builder integration

### shadcn/ui Components Added

All components properly installed in `src/components/ui/`:
- Button, Input, Label, Textarea
- Card, Table, Badge, Alert
- Dialog, Tabs, ScrollArea, Separator, Skeleton
- Form, Select

### Build Status

✅ **All builds successful**
- TypeScript compilation: PASSING
- Vite production build: PASSING
- Bundle size: Acceptable (main: 758kb, JobApplicationsPage: 122kb gzipped)

---

## Phase Details

### 1. Discovery & Freeze

**Status:** ✅ COMPLETE

| Task                                                                            | Owner  | Deliverable                         |
| ------------------------------------------------------------------------------- | ------ | ----------------------------------- |
| Identify all Job Finder-related routes, components, hooks, and assets in `web/` | FE     | Inventory checklist with file paths |
| Enumerate Firebase Functions tied to Job Finder (under `functions/src/`)        | BE     | Function ownership matrix           |
| Review shared utilities in `scripts/`, `shared-types/`, etc.                    | FE/BE  | Dependency graph                    |
| Capture env vars and secrets currently required                                 | DevOps | `.env` diff + ownership table       |
| Freeze non-critical Gatsby changes during migration window                      | PM     | Migration calendar                  |

### 2. Infrastructure Provisioning

**Status:** 📋 PENDING (Ready for implementation after feature completion)

Use Terraform modules (extend `infrastructure/terraform`) to:

- Create Cloudflare zone `job-finder.joshwentworth.com` and subdomain `staging.job-finder.joshwentworth.com`.
- Generate A/AAAA/CNAME records pointing to Firebase Hosting endpoints.
- Configure Cloudflare SSL/TLS for Firebase Hosting (typically DNS-only/"grey cloud").
- Define Firebase Hosting targets (`job-finder` and `job-finder-staging`).
- Produce service accounts with least privilege for CI deploys (Hosting Admin, Functions Admin as required).
- Update OAuth consent screen redirect URIs and Firebase Auth authorized domains for both staging and production.
- Document Terraform apply workflow (review process, state locking, drift detection).

### 3. React Application Delivery

**Status:** 🔄 IN PROGRESS (45% Complete)

#### ✅ Scaffolding (COMPLETE)

- ✅ Initialized `../job-finder-FE` with Vite + React 18 + TypeScript
- ✅ Installed Tailwind/shadcn with slate theme preset
- ✅ Configured ESLint (flat config), Prettier, `tsconfig`
- 📋 Set up Vitest/Jest for unit/integration tests (PENDING)

#### ✅ Routing & Navigation (COMPLETE)

- ✅ React Router v6 with nested routes
- ✅ Auth guards (`ProtectedRoute`, `PublicRoute`)
- ✅ Role-based access using `isEditor` from AuthContext
- ✅ Fallback/redirect flows for unauthorized access

#### ✅ Data Layer (COMPLETE)

- ✅ All types imported from `@jdubz/job-finder-shared-types`
- ✅ API clients with retry/backoff patterns implemented
- ✅ Firestore real-time listeners for job matches and queue
- 📋 Virtualization/pagination (will add if needed for performance)

#### ✅ Auth & Session Management (COMPLETE)

- ✅ Firebase Auth SDK with context provider (`AuthContext`)
- ✅ Automatic token refresh
- ✅ Role checking with custom claims (`isEditor`)
- 📋 Integration tests for auth flows (PENDING)

#### 🔄 UI Implementation (IN PROGRESS - 45%)

**Completed Pages:**
- ✅ Job Finder Page - Submit jobs, real-time queue status
- ✅ Job Applications Page - View matches, filters, detailed modal
- ✅ Auth Pages - Login, Unauthorized
- ✅ Home Page - Landing/welcome

**Pending Pages:**
- 📋 Document Builder - AI resume/cover letter generation (NEXT PRIORITY)
- 📋 Content Items - Experience/skills management
- 📋 AI Prompts - Prompt customization
- 📋 Document History - Generated documents
- 📋 Queue Management - Admin queue view
- 📋 Job Finder Config - Settings management
- 📋 Settings - User preferences

**UI Quality:**
- ✅ shadcn components provide consistent design
- ✅ Responsive design (mobile-first)
- ✅ Keyboard accessibility via shadcn/ui
- ✅ Loading states and skeletons
- ✅ Empty states with CTAs

#### 📋 Logging & Monitoring (PENDING)

- 📋 Client-side error logging to Cloud Logging
- 📋 Analytics integration (if required)
- 📋 Performance monitoring

### 4. CI/CD & Environment Hardening

**Status:** 📋 PENDING (Infrastructure ready, needs GitHub Actions setup)

**Ready:**
- ✅ `.env.example`, `.env.development`, `.env.staging`, `.env.production` created
- ✅ Firebase configuration in `.firebaserc`
- ✅ Build scripts in `package.json`
- ✅ Makefile with deploy commands

**Pending:**
- 📋 Create GitHub Actions pipeline for `job-finder-FE`: lint, test, build, deploy
- 📋 Firebase Hosting CLI deploy with service account
- 📋 Staging deploy (on `staging` branch merge)
- 📋 Production deploy (on `main` branch merge)
- 📋 Lighthouse CI for performance monitoring
- 📋 Automated secrets leakage checks

### 5. Cutover & Validation

**Status:** 📋 PENDING (Awaiting feature completion and infrastructure setup)

**Pre-Cutover Checklist:**
- 📋 All core features implemented (currently 45% complete)
- 📋 E2E tests written and passing
- 📋 Staging environment deployed and tested
- 📋 DNS/Cloudflare configuration ready

**Cutover Steps:**
- 📋 Deploy to `staging.job-finder.joshwentworth.com`
- 📋 QA checklist: auth, job submission, matches, document generation
- 📋 Confirm GCP logs capture expected entries
- 📋 Implement redirects from portfolio `/app` to new domain
- 📋 Update Cloudflare DNS to point production domain
- 📋 Smoke tests (automated + manual)
- 📋 24-48 hour monitoring period
- 📋 Rollback procedure documented and tested

### 6. Portfolio Cleanup

**Status:** ✅ COMPLETE (Already done before migration started)

- ✅ Job Finder routes/components removed from Gatsby
- ✅ Navigation updated - `/app` shows "Coming Soon" placeholder
- 📋 Add permanent (301) redirects after new app is deployed
- ✅ Scripts simplified
- ✅ Contact form Firebase Function preserved
- ✅ Home and contact pages working correctly

**Note:** Portfolio cleanup was completed ahead of schedule. The `/app` route currently shows a placeholder "Coming Soon" page pending the new application deployment.

## Repository Gotchas & Improvement Opportunities

### Front-End (Gatsby) Footprint

- `web/src/pages/resume-builder.tsx` owns tabbed routing via query params (`?tab=`). Redirect mapping must cover every legacy tab slug to the new router.
- Theme UI, custom hooks (`useAuth`, `TabsGrouped`, etc.), and the recently added `JobFinderThemeProvider` are tightly coupled; plan for adapters or shims while features move to shadcn.
- `web/public/` contains built Gatsby assets that can mask redirect issues during local testing; clear the folder when verifying migration logic.
- Patch scripts (`update:partytown`, `patch-package`) run on install/build—validate whether they are still needed after Job Finder removal to avoid dangling artifacts.

### Shared Types & Dependencies

- Current workspaces reference the shared types package inconsistently (`@jdubz/...` vs `@jsdubzw/...`). Standardize naming before splitting repos to prevent accidentally publishing multiple packages.
- Ensure `@jdubz/job-finder-shared-types` remains the single source for queue, logging, and settings contracts; any schema change should flow through that package before app/function updates.

### Firebase Functions Surface Area

- `functions/src/` hosts both contact-form and Job Finder logic. When extracting, decide whether contact form stays in this repo or moves to a dedicated workspace to reduce lint/test noise.
- Generated `.d.ts` files under `functions/deploy/` trigger ESLint parser errors (`parserOptions.project`). In the new layout, either exclude generated directories or supply a dedicated tsconfig.
- Scripts such as `functions/setup-secrets.sh` assume the `static-sites-257923` project; parameterize or document if the new app introduces additional environments.

### Scripts & Tooling

- Root scripts (`scripts/import-staging-to-local.ts`, `scripts/copy-job-matches-to-emulator.ts`, etc.) rely on Job Finder collections and should migrate alongside the new app.
- Firestore export snapshots under `firestore-exports/` and emulator data under `emulator-data/` reference the existing schema. Plan a cleanup/refresh step to avoid stale migrations after the split.
- `Makefile`, `lhci`, and screenshot workflows may reference removed routes; audit these tasks to avoid CI failures post-migration.

### CI/CD & Linting

- Current lint runs flag hundreds of errors due to shared TypeScript configs. Stabilize linting in each repo before activating required checks for the new pipelines.
- `npm run test --workspaces` executes both Gatsby and Functions suites; after extraction ensure CI still covers contact form tests from this repo and introduces equivalent coverage in `job-finder-FE`.
- Verify existing GitHub Actions (deploy, screenshots, PR checks) to see which ones assume the presence of `/resume-builder` content and update them in tandem with redirects.

## Shared Types & Contracts

- Treat `@jdubz/job-finder-shared-types` as the source of truth for queue items, job matches, settings, logger types, etc.
- Publish versioned releases (or workspace symlinks) whenever schemas change.
- Update documentation within the shared types repo to outline serialization rules, date handling, and validation expectations.

## Security & Compliance

- Ensure OAuth redirect URIs, Firebase authorized domains, and Cloudflare DNS changes are deployed atomically to avoid auth drift.
- Review Firestore rules to confirm new domain origins do not introduce unauthorized access.
- Maintain current Google Cloud Logging pipelines; verify log retention and alerting remain aligned with compliance requirements.
- Document incident response steps for the new app (including Cloudflare DNS rollback).

## Documentation & Knowledge Transfer

- Update `README.md` in both repositories with setup, scripts, and deployment instructions.
- Add migration FAQ summarizing differences between Gatsby and React apps, routing patterns, and auth changes.
- Refresh `docs/` content (architecture diagrams, onboarding guides) to reflect the split.
- Provide runbooks for Terraform apply, Firebase deploy, and DNS switches.
- Add `CLAUDE.md` context files in new or relocated directories (e.g., `job-finder-FE`, shared-types additions) summarizing intent, key files, and ownership to keep AI-assisted tooling effective after the split.
- Establish a Claude context management checklist:
  - Keep the root-level `CLAUDE.md` authoritative and trimmed to high-signal guidance, linking out to deeper docs instead of duplicating content.
  - Create scoped `CLAUDE.md` files in high-churn areas of `job-finder-FE` (e.g., `src/features/<feature>/CLAUDE.md`) capped to ~200–300 lines focused on architecture, domain contracts, and common gotchas.
  - Add a `docs/claude-context-index.md` (or equivalent) that enumerates every context file, last updated date, and owner so Claude Code can surface the right attachments quickly.
  - Fold repetitive prompt snippets (lint overrides, deploy commands, testing recipes) into short "How to ask" sections within the relevant context files to save tokens during interactive sessions.
  - Schedule context reviews alongside sprint retros so stale or noisy sections are pruned before they erode Claude Code relevance.
- Maintain `docs/development/job-finder-discovery-inventory.md` as the authoritative tracker for routes, functions, and scripts while features migrate.

## Timeline (Updated)

| Week | Focus                                                          | Status |
| ---- | -------------------------------------------------------------- | ------ |
| 1    | Discovery & freeze, Terraform groundwork                       | ✅ COMPLETE |
| 2    | Scaffold React app, establish CI/CD skeleton                   | ✅ COMPLETE |
| 3    | API client layer, Job Finder page, Job Applications page      | ✅ COMPLETE |
| 4    | Document Builder, Content Items, remaining pages               | 🔄 IN PROGRESS |
| 5    | CI/CD setup, staging deployment, QA                            | 📋 PENDING |
| 6    | Production cutover, monitoring                                 | 📋 PENDING |
| 7    | Final documentation, optimization                              | 📋 PENDING |

**Current Status (2025-10-19):** Ahead of schedule - Week 3 tasks complete, starting Week 4 early

## Risk Mitigation

- Maintain dual-running period (portfolio Gatsby + new React app) until confidence is high.
- Set alerting for API error spikes and auth failures post-cutover.
- Keep rollback plan documented (Cloudflare DNS revert + Firebase Hosting rollback).

## Next Steps Checklist (Updated 2025-10-19)

### Completed ✅
- [x] Complete discovery inventory and freeze
- [x] Scaffold `../job-finder-FE` and configure baseline tooling
- [x] Implement auth/session module and validate against shared types
- [x] Create API client layer with retry/error handling
- [x] Implement Job Finder page (job submission)
- [x] Implement Job Applications page (matches display)
- [x] Sunset Gatsby Job Finder code (already done)

### In Progress 🔄
- [x] **Document Builder page** (NEXT - AI resume generation)
- [ ] Content Items page (experience/skills management)
- [ ] Admin pages (Queue Management, Config, Prompts)

### Pending 📋
- [ ] Author Terraform changes and review with DevOps
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Stand up staging environment and run QA
- [ ] E2E test suite implementation
- [ ] Execute Terraform apply + DNS cutover with monitoring
- [ ] Final documentation updates

### Priority Order
1. **Immediate:** Document Builder page (integrate with portfolio functions)
2. **High:** Content Items page (data management)
3. **High:** Remaining feature pages (admin/config)
4. **Medium:** E2E tests
5. **Medium:** CI/CD setup
6. **Low:** Infrastructure/deployment (after features complete)

---

**Document owner:** Josh Wentworth
**Contributors:** Frontend, Backend, DevOps teams
