# josh-wentworth-portfolio

## 1.14.3

### Patch Changes

- [#63](https://github.com/Jdubz/portfolio/pull/63) [`f28c19e`](https://github.com/Jdubz/portfolio/commit/f28c19e1b4ac8b708f46ef1bcad976d0d98587d5) Thanks [@Jdubz](https://github.com/Jdubz)! - Production-ready release: generator improvements, database fixes, and documentation cleanup

  **Generator Improvements:**
  - Remove Firestore listener in favor of API-based progress updates
  - Fix download URLs and step progress returned directly from API
  - Resolve 400 Bad Request errors on staging by using correct database

  **Critical Database Fix:**
  - Fix firestore.service.ts to use environment-aware DATABASE_ID instead of hardcoded "portfolio"
  - Contact form now correctly routes to portfolio-staging in staging environment
  - Prevents staging submissions from going to production database

  **Documentation Cleanup:**
  - Delete 19 obsolete files (audit docs, archive folder, temp refactor docs)
  - Update generator/PLAN.md to mark Progressive Generation UI as complete
  - Add Frontend Terminology Migration task (defaults → personalInfo)
  - Reorganize docs/README.md with cleaner 3-type structure (Architecture, Setup, Plans)

  **Database Migration:**
  - Complete Firestore migration: generator/default → generator/personal-info
  - Applied to both staging and production databases
  - Backend fully supports new terminology with backward-compatible deprecated aliases

## 1.14.2

### Patch Changes

- [#58](https://github.com/Jdubz/portfolio/pull/58) [`748806e`](https://github.com/Jdubz/portfolio/commit/748806e72c29a665e025b33218014d60d0b0e29e) Thanks [@Jdubz](https://github.com/Jdubz)! - Fix document generator by removing Firestore listener and returning URLs from API
  - Removed broken Firestore listener that was causing 400 Bad Request errors by connecting to wrong database
  - Updated backend `handleExecuteStep` to return download URLs and step progress in API response
  - Updated frontend to extract URLs and progress directly from API instead of Firestore subscription
  - Fixed missing download buttons and checklist not updating on staging
  - API now provides complete real-time updates without needing Firestore subscriptions

## 1.14.1

### Patch Changes

- [#58](https://github.com/Jdubz/portfolio/pull/58) [`2fd0a97`](https://github.com/Jdubz/portfolio/commit/2fd0a97e5dbe62f607d8672db9eb7787abe01fad) Thanks [@Jdubz](https://github.com/Jdubz)! - Fix React hooks error and image upload signed URL expiration
  - Fixed React error #418 (hook order change) and #423 (update during render) in document builder by batching setState calls
  - Reduced image upload signed URL expiration from 1 year to 7 days to comply with GCS maximum
  - Improved Firestore listener performance by extracting values before state updates

## 1.14.0

### Minor Changes

- [#33](https://github.com/Jdubz/portfolio/pull/33) [`f20605d`](https://github.com/Jdubz/portfolio/commit/f20605d93c1fbeb9911fc753eaa2428bfa6fd74a) Thanks [@Jdubz](https://github.com/Jdubz)! - Implement Changesets for versioning and changelog management

  This change migrates from the old semantic-version GitHub Action to Changesets.

  Key improvements:
  - Automated CHANGELOG generation with GitHub integration
  - Linked workspace versioning (web + functions always in sync)
  - Human-readable change descriptions in PRs
  - "Version Packages" PR for review before releases
  - Changesets bot comments on PRs

  All workspace packages synchronized to version 1.13.3.

- [#40](https://github.com/Jdubz/portfolio/pull/40) [`e9c5597`](https://github.com/Jdubz/portfolio/commit/e9c55973a3e2052adc2e07f404d9fb3ed4bc014c) Thanks [@Jdubz](https://github.com/Jdubz)! - feat: add strict changeset enforcement and intelligent cache busting

  **Changeset Enforcement:**
  - Auto-generate changesets during commits with interactive prompts
  - Required PR check that blocks merge without changeset
  - Detects version type from commit message (feat/fix/perf)
  - Smart file pattern detection (ignores docs/tests/config)
  - Can bypass with `skip-changeset` label for non-code PRs

  **Cache Busting:**
  - Optional CACHE_BUST flag in changesets for hard refresh updates
  - Automatic cache invalidation when version changes
  - Clears service worker caches, localStorage (preserves preferences)
  - Generates unique cache versions with git hash (dev) or semantic version (prod)
  - Build-time cache version generation with prebuild hook

  **Files Added:**
  - `scripts/auto-changeset.js` - Interactive changeset generator
  - `scripts/cache-version.js` - Cache version generator
  - `web/src/utils/cache-version.ts` - Client-side cache utilities
  - `.github/workflows/changeset-check.yml` - Required PR check
  - `docs/development/changeset-enforcement.md` - Complete documentation
  - `docs/development/cache-busting.md` - Cache busting guide

  **Updated:**
  - `.husky/pre-commit` - Auto-changeset hook
  - `web/gatsby-browser.js` - Cache version initialization
  - `web/package.json` - Added prebuild script for cache versioning

### Patch Changes

- [#44](https://github.com/Jdubz/portfolio/pull/44) [`47769c7`](https://github.com/Jdubz/portfolio/commit/47769c7beab3af9ee4941df71df9598da13df91e) Thanks [@Jdubz](https://github.com/Jdubz)! - Consolidate and streamline documentation (64% reduction)

  Removed outdated documentation directories (audit, archive, deployment, setup, features) that were superseded by ARCHITECTURE.md and CODEBASE_AUDIT_2025-10-10.md. Updated ai-resume-generator-plan.md with Phase 1-3 architecture compatibility notes. Documentation reduced from 44 files (~16,000 lines) to 10 files (~5,700 lines), focusing on current architecture, recent audits, and future plans.

## 1.13.3

### Patch Changes

- Synced package version with monorepo root
