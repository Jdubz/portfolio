# Job Finder Frontend Migration Plan

**Last updated:** 2025-10-18

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

1. **Discovery & Freeze** – Audit current functionality, isolate portfolio-only features, and freeze non-essential changes.
2. **Infrastructure Provisioning** – Use Terraform to create Cloudflare DNS, Firebase Hosting targets, OAuth origins, and deployment roles.
3. **React Application Delivery** – Scaffold the new app, migrate features, and ensure APIs/auth replicate existing behavior.
4. **CI/CD & Environment Hardening** – Build pipelines, configure staging/production deploys, and secure secrets.
5. **Cutover & Validation** – Launch staging, execute QA, switch DNS, and monitor logging/analytics.
6. **Portfolio Cleanup** – Remove Job Finder code from Gatsby app, streamline scripts, and update documentation.

## Phase Details

### 1. Discovery & Freeze

| Task                                                                            | Owner  | Deliverable                         |
| ------------------------------------------------------------------------------- | ------ | ----------------------------------- |
| Identify all Job Finder-related routes, components, hooks, and assets in `web/` | FE     | Inventory checklist with file paths |
| Enumerate Firebase Functions tied to Job Finder (under `functions/src/`)        | BE     | Function ownership matrix           |
| Review shared utilities in `scripts/`, `shared-types/`, etc.                    | FE/BE  | Dependency graph                    |
| Capture env vars and secrets currently required                                 | DevOps | `.env` diff + ownership table       |
| Freeze non-critical Gatsby changes during migration window                      | PM     | Migration calendar                  |

### 2. Infrastructure Provisioning

Use Terraform modules (extend `infrastructure/terraform`) to:

- Create Cloudflare zone `job-finder.joshwentworth.com` and subdomain `staging.job-finder.joshwentworth.com`.
- Generate A/AAAA/CNAME records pointing to Firebase Hosting endpoints.
- Configure Cloudflare SSL/TLS for Firebase Hosting (typically DNS-only/"grey cloud").
- Define Firebase Hosting targets (`job-finder` and `job-finder-staging`).
- Produce service accounts with least privilege for CI deploys (Hosting Admin, Functions Admin as required).
- Update OAuth consent screen redirect URIs and Firebase Auth authorized domains for both staging and production.
- Document Terraform apply workflow (review process, state locking, drift detection).

### 3. React Application Delivery

#### Scaffolding

- Initialize `../job-finder-FE` with Vite + React 18 + TypeScript.
- Install Tailwind/shadcn with blue theme preset.
- Configure ESLint (flat config), Prettier, `tsconfig` aligned with monorepo standards.
- Set up Vitest/Jest for unit/integration tests.

#### Routing & Navigation

- Adopt React Router v7 or TanStack Router with nested routes covering each Job Finder tab.
- Enforce auth guards for secure tabs using role definitions from shared types.
- Define fallback/redirect flows for unauthorized access.

#### Data Layer

- Import domain types exclusively from `@jdubz/job-finder-shared-types`.
- Recreate API clients using existing retry/backoff patterns (see `web/src/api/enhanced-client.ts`).
- Implement data hooks for Firestore/REST endpoints, ensuring compatibility with current functions.
- Plan for virtualization/pagination for data-heavy tables or lists.

#### Auth & Session Management

- Use Firebase Auth SDK with context provider/hook pattern.
- Persist sessions with local storage/session storage as appropriate.
- Implement token refresh and logout-on-stale token logic.
- Add integration tests for sign-in, role-based access, and secure tab gating.

#### UI Implementation

- Port functionality feature-by-feature, focusing on workflows over design parity.
- Replace Theme UI components with shadcn equivalents (cards, modals, tabs, data tables).
- Ensure keyboard accessibility and responsiveness are maintained.

#### Logging & Monitoring

- Maintain logging interfaces so that client-side errors surface via existing cloud logging (e.g., send to functions or use shared logging endpoints).
- Confirm analytics (if any) continue to track key events.

### 4. CI/CD & Environment Hardening

- Create GitHub Actions (or equivalent) pipeline for `job-finder-FE`: lint, test, build, deploy.
- Introduce Firebase Hosting CLI deploy using service account credentials stored in GitHub secrets.
- Define staging deploy (on `staging` branch merge) and production promotion (on tagged releases).
- Add Lighthouse CI or equivalent for performance monitoring.
- Document `.env` strategy — example `.env.template`, `.env.staging`, `.env.production` stored securely (Firebase config or secret manager).
- Set up automated check to prevent secrets leakage (pre-commit hook or lint rule).

### 5. Cutover & Validation

- Deploy to `staging.job-finder.joshwentworth.com`; run QA checklist covering authentication, dashboards, queue management, scraping flows, etc.
- Confirm GCP logs capture expected entries; adjust alerting thresholds if necessary.
- Implement temporary redirects in staging (e.g., `/resume-builder`, Job Finder tab URLs) to the new domain to validate routing behavior before production cutover.
- Update Cloudflare DNS to point production domain to Firebase Hosting once staging passes.
- Perform smoke tests (automated + manual) immediately after cutover.
- Monitor for 24–48 hours; prepare rollback procedure (switch DNS back, redeploy Gatsby pages if needed).

### 6. Portfolio Cleanup

- Remove Job Finder routes/components from Gatsby (`web/src/pages/**`, `components/tabs/**`, etc.) leaving only home/contact.
- Update navigation/links to point to new domain.
- Add permanent (301) redirects for legacy Job Finder URLs (e.g., `/resume-builder`, `/app/*`, tab deep links) to their equivalents on `job-finder.joshwentworth.com` to preserve bookmarks and SEO equity.
- Simplify scripts, lint configs, and build commands to reflect reduced surface area.
- Keep contact form Firebase Function and Firestore integrations unchanged.
- Add regression tests ensuring `/` and `/contact` render and submit correctly.

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

## Timeline (Suggested)

| Week | Focus                                                          |
| ---- | -------------------------------------------------------------- |
| 1    | Discovery & freeze, Terraform groundwork                       |
| 2    | Scaffold React app, establish CI/CD skeleton                   |
| 3–4  | Feature migration (prioritize critical tabs), auth integration |
| 5    | Staging deployment, QA, logging verification                   |
| 6    | Production cutover, monitoring                                 |
| 7    | Portfolio cleanup, documentation finalization                  |

## Risk Mitigation

- Maintain dual-running period (portfolio Gatsby + new React app) until confidence is high.
- Set alerting for API error spikes and auth failures post-cutover.
- Keep rollback plan documented (Cloudflare DNS revert + Firebase Hosting rollback).

## Next Steps Checklist

- [ ] Complete discovery inventory and freeze.
- [ ] Author Terraform changes and review with DevOps.
- [ ] Scaffold `../job-finder-FE` and configure baseline tooling.
- [ ] Implement auth/session module and validate against shared types.
- [ ] Migrate critical features (queue management, scraping, job configuration).
- [ ] Stand up staging environment and run QA.
- [ ] Execute Terraform apply + DNS cutover with monitoring.
- [ ] Sunset Gatsby Job Finder code and update docs.

---

**Document owner:** Josh Wentworth
**Contributors:** Frontend, Backend, DevOps teams
