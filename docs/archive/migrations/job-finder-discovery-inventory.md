# Job Finder Discovery Inventory

**Last updated:** 2025-10-19

This inventory captures the current Job Finder footprint inside the `portfolio` monorepo to support extraction into the dedicated `job-finder-FE` project and related backend services. Keep the checklist synchronized as features are migrated or retired.

## Frontend Surface (Gatsby)

| Surface Area              | Location                                                                                                              | Key Dependencies                                                                                | Migration Notes                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Primary application shell | `web/src/pages/resume-builder.tsx`                                                                                    | `useAuth`, `TabsGrouped`, shadcn adapters via `JobFinderThemeProvider`, tab components          | Replace with React Router root route; maintain tab slug parity to drive redirect map                                         |
| Legacy redirects          | `web/src/pages/experience.tsx`, `web/src/pages/resume-settings.tsx`                                                   | Gatsby `navigate`                                                                               | Convert into HTTP 301 redirects in Firebase Hosting once React app is live                                                   |
| Tab components            | `web/src/components/tabs/*.tsx`                                                                                       | Theme UI, shared hooks (`useAuth`, `useJobQueueStatus`, etc.), `@jdubz/job-finder-shared-types` | Migrate into isolated feature folders within `job-finder-FE` (e.g., `src/features/job-applications`) using shadcn primitives |
| Modal & utilities         | `web/src/components/GenerationDetailsModal.tsx`, `web/src/components/job-finder/index.tsx`, `web/src/utils/logger.ts` | Theme UI, analytics/logging helpers                                                             | Rebuild modal with shadcn dialog; preserve logging shape consumed by Firebase Functions                                      |
| Auth plumbing             | `web/src/hooks/useAuth.ts`, `web/src/hooks/useAuthRequired.ts`                                                        | Firebase Auth SDK, Firestore profile reads                                                      | Port into React Query + context pattern; ensure editor role detection matches shared types                                   |
| Queue polling hooks       | `web/src/hooks/useJobQueueStatus.ts`, `web/src/hooks/useQueueManagement.ts`                                           | `@jdubz/job-finder-shared-types`, browser timers                                                | Introduce `setInterval` safe wrappers within React app and cover with Vitest to avoid lint failures                          |

## Firebase Functions Footprint

| Function           | File                                                      | Responsibilities                                                 | Shared Contract                                                    |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| Job queue API      | `functions/src/job-queue.ts`                              | CRUD for queue items, scrape submissions, settings management    | `QueueItem`, `QueueSettings` from `@jdubz/job-finder-shared-types` |
| Generator API      | `functions/src/generator.ts`                              | Resume/cover letter generation, PDF storage, AI provider routing | `GeneratorRequest`, `GenerationHistory`                            |
| Experience API     | `functions/src/experience.ts`                             | Manage work experience entries, syncs with resume builder        | `ExperienceItem`, `JobHistory`                                     |
| Content items API  | `functions/src/content-items.ts`                          | CRUD for blurb snippets and reusable content                     | `ContentItem`                                                      |
| Flow orchestration | `functions/src/flows/*`                                   | Resume workflow pipelines, queue triggers                        | Workflow schemas in `functions/deploy/flows/schemas.d.ts`          |
| Job queue triggers | `functions/src/triggers/job-queue.trigger.ts` (and peers) | Firestore-triggered automation around job queue lifecycle        | Queue trigger payload types                                        |
| Shared services    | `functions/src/services/*.ts`                             | AI provider adapters, PDF generation, Firestore repositories     | Various shared DTOs                                                |

Generated `.d.ts` files under `functions/deploy/` currently break ESLint (missing project references); plan to exclude them or ship dedicated `tsconfig.eslint.json` before enforcing lint in the new repo.

## Supporting Scripts & Tooling

| Script                                    | Role                                                         | Destination                                                              |
| ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `scripts/import-staging-to-local.ts`      | Copies Firestore data for local testing                      | Move alongside new React app dev tooling; document emulator expectations |
| `scripts/copy-job-matches-to-emulator.ts` | Seeds queue emulator with production snapshots               | Same as above                                                            |
| `scripts/seed-job-finder-config.ts`       | Seeds configuration documents (AI settings, stop list, etc.) | Convert to workspace-aware script in new repo                            |
| `scripts/clear-content-items.ts`          | Maintenance utilities for content items collection           | Evaluate need post-migration, potentially relocate to backend utilities  |
| `scripts/manage-editor-role.js`           | Adds/removes Firebase editor permissions                     | Ensure it lives where auth logic resides (likely backend infra repo)     |

## Environment & Secrets

| Scope              | Variable/Secret                                                                                 | Notes                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Firebase Functions | `GOOGLE_CLOUD_PROJECT`, `FIRESTORE_DB`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, mail provider creds | Keep secrets in Secret Manager; update Terraform outputs when new app is provisioned            |
| Frontend           | Firebase web config, `VITE_FIREBASE_API_KEY`, queue API base URLs, AI feature flags             | Manage via `.env.staging` / `.env.production`; configure GitHub Actions with encrypted copies   |
| Terraform          | Cloudflare tokens, Firebase Hosting deploy tokens                                               | Store in existing SOPS/Secret Manager pipeline and update once new hosting targets are declared |

## Immediate Migration Actions (Week 1)

- Capture remaining tab-level dependencies (analytics calls, feature flags) and append to this inventory.
- Draft redirect matrix mapping `/resume-builder?tab=<slug>` to new React routes; store under `docs/development/job-finder-redirects.csv`.
- Mirror shared hooks (`useAuth`, `useJobQueueStatus`) in `job-finder-FE` prototype with placeholder implementations to unblock UI scaffolding.
- Adjust Terraform plan skeleton to include new Cloudflare zones and Firebase Hosting targets (create working branch under `infrastructure/terraform`).

Update this document as assets are migrated or retired to keep the cross-functional team aligned.
