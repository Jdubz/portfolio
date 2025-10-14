# josh-wentworth-portfolio

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
