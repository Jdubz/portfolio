---
"josh-wentworth-portfolio": minor
---

feat: add strict changeset enforcement and intelligent cache busting

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
