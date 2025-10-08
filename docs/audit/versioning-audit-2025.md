# Versioning System Audit - 2025

**Date:** 2025-10-08
**Project:** Josh Wentworth Portfolio Monorepo
**Stack:** npm workspaces, Gatsby, Firebase, TypeScript

---

## Executive Summary

This audit evaluates the current versioning system against modern best practices for npm workspaces monorepos in 2025. The project uses a **custom GitHub Actions-based semantic versioning** system that partially follows conventional commits.

### Current Grade: **C+ (Functional but outdated)**

**Strengths:**
- ✅ Automated version bumping via GitHub Actions
- ✅ Follows semantic versioning (semver)
- ✅ Uses conventional commit prefixes (`feat:`, `fix:`)
- ✅ Git tags created automatically
- ✅ Root package marked as `private: true`

**Critical Issues:**
- ❌ No automated CHANGELOG generation
- ❌ Workspace packages have **divergent versions** (root: 1.13.2, web: 1.13.1, functions: 1.0.0)
- ❌ Manual version bumping doesn't sync across workspaces
- ❌ No change documentation for developers
- ❌ Release notes only generated for main branch
- ❌ No pre-release/snapshot support
- ❌ Missing modern tooling (Changesets, Release Please)

---

## Current Implementation

### Version States (as of 2025-10-08)

```json
Root (package.json):           1.13.2
Web (web/package.json):        1.13.1  ⚠️ OUT OF SYNC
Functions (functions/package.json): 1.0.0  ⚠️ OUT OF SYNC
```

### Versioning Mechanism

**Location:** `.github/workflows/semantic-version.yml`

**Trigger:** Push to `main` or `staging` branches

**Process:**
1. Parses last commit message for conventional commit prefixes
2. Determines bump type:
   - `feat:` or `feature:` → minor (0.X.0)
   - `fix:`, `bugfix:`, `patch:` → patch (0.0.X)
   - `!` suffix or `BREAKING CHANGE:` → major (X.0.0)
3. Runs `npm version <type>` **only on root package.json**
4. Creates git tag `v<version>`
5. Pushes tag and commit

**Scripts (package.json):**
```json
"version:patch": "npm version patch && git push && git push --tags"
"version:minor": "npm version minor && git push && git push --tags"
"version:major": "npm version major && git push && git push --tags"
```

---

## Problems Identified

### 1. **Workspace Version Drift** 🔴 CRITICAL

**Issue:** Each workspace has independent versions that drift over time.

**Evidence:**
- Root: 1.13.2
- Web: 1.13.1 (1 patch behind)
- Functions: 1.0.0 (never bumped)

**Impact:**
- Confusing for developers
- `console.log` on web shows outdated version
- No single source of truth
- Breaking semantic versioning contracts

**Root Cause:** GitHub Actions only bumps root `package.json`, not workspace packages.

---

### 2. **No Automated Changelog** 🔴 CRITICAL

**Issue:** No CHANGELOG.md file exists.

**Impact:**
- Users/developers can't see what changed between releases
- No migration guides for breaking changes
- Hard to track feature additions
- Violates semver best practices

**Industry Standard (2025):**
- Changesets: Auto-generates CHANGELOG.md per package
- Release Please: Creates GitHub releases with changelogs
- Conventional Changelog: Generates from commit messages

---

### 3. **Incomplete Conventional Commits** 🟡 MODERATE

**Issue:** Workflow only checks commit message, not entire PR history.

**Current Coverage:**
- ✅ Detects `feat:`, `fix:`, breaking changes
- ❌ Ignores `refactor:`, `perf:`, `docs:`, `style:`, `test:`, `chore:`
- ❌ Doesn't parse scopes or bodies
- ❌ Single commit can trigger version bump even if other commits exist

**Best Practice (2025):**
- Tools like Changesets require **explicit changeset files** in PRs
- Validates all commits in PR, not just the last one

---

### 4. **No Pre-release Support** 🟡 MODERATE

**Issue:** Cannot create beta/alpha/rc versions.

**Use Cases:**
- Testing staging deploys: `1.14.0-staging.1`
- Beta features: `1.14.0-beta.1`
- Snapshots: `0.0.0-20251008130000`

**Industry Standard:**
- Changesets: `changeset pre enter beta`
- Release Please: `--prerelease` flag

---

### 5. **Manual Workspace Dependency Management** 🟡 MODERATE

**Issue:** No `workspace:*` protocol used for internal dependencies.

**Current State:**
- Web and Functions don't depend on each other (good for now)
- But if they did, versions would be hardcoded

**Best Practice:**
```json
{
  "dependencies": {
    "@portfolio/shared": "workspace:*"
  }
}
```

---

### 6. **No Change Documentation** 🟡 MODERATE

**Issue:** Developers don't document changes when making PRs.

**Current Workflow:**
1. Developer makes changes
2. Uses conventional commit messages
3. GitHub Actions reads last commit
4. Version bumped automatically

**Problem:** No human review of what should be released.

**Best Practice (Changesets):**
1. Developer runs `npx changeset` in PR
2. Describes change in markdown file
3. Specifies which packages are affected
4. Changeset bot validates PR
5. On merge, Changesets creates "Version Packages" PR
6. Maintainer reviews and merges to release

---

## Modern Best Practices (2025)

Based on research of npm workspaces monorepos in 2025:

### 1. **Changesets (Recommended)**

**Why:**
- Industry standard for npm workspaces monorepos
- Used by major projects (Chakra UI, Radix UI, etc.)
- Handles workspace dependencies automatically
- Generates changelogs per package
- GitHub Actions integration

**Setup:**
```bash
npm install -D @changesets/cli
npx changeset init
```

**Workflow:**
1. Developer: `npx changeset` → Creates `.changeset/random-name.md`
2. CI validates changeset exists
3. Merge PR
4. Changesets bot creates "Version Packages" PR
5. Merge version PR → Publishes/deploys

**Benefits:**
- ✅ Syncs all workspace versions
- ✅ Auto-generates CHANGELOG.md
- ✅ Supports pre-releases
- ✅ Validates PRs
- ✅ Human-readable change descriptions

---

### 2. **Release Please (Alternative)**

**Why:**
- Google-maintained
- Fully automated (no changeset files needed)
- Parses conventional commits
- Creates GitHub releases

**Setup:**
```bash
# GitHub Action only, no npm package
```

**Workflow:**
1. Developer uses conventional commits
2. On merge to main, Release Please creates "Release PR"
3. Merge release PR → Creates GitHub release + tags

**Benefits:**
- ✅ Zero developer friction
- ✅ Auto-generates CHANGELOG.md
- ✅ GitHub releases
- ❌ Less control over versioning
- ❌ Harder to version specific packages

---

### 3. **Keep Current System (Not Recommended)**

**If keeping current system:**

**Required Fixes:**
1. Sync all workspace package versions
2. Add changelog generation
3. Support pre-releases
4. Validate entire PR commit history

**Implementation:**
```yaml
# .github/workflows/semantic-version.yml
- name: Sync workspace versions
  run: |
    ROOT_VERSION=$(node -p "require('./package.json').version")
    node -e "
      const fs = require('fs');
      const webPkg = require('./web/package.json');
      const fnPkg = require('./functions/package.json');
      webPkg.version = process.env.ROOT_VERSION;
      fnPkg.version = process.env.ROOT_VERSION;
      fs.writeFileSync('./web/package.json', JSON.stringify(webPkg, null, 2));
      fs.writeFileSync('./functions/package.json', JSON.stringify(fnPkg, null, 2));
    "
  env:
    ROOT_VERSION: ${{ steps.version.outputs.new_version }}
```

---

## Recommendations

### Immediate Actions (Next Sprint)

#### Option A: Adopt Changesets (RECOMMENDED)

**Effort:** Medium (4-6 hours)
**Impact:** High
**Risk:** Low

**Steps:**
1. Install Changesets: `npm install -D @changesets/cli`
2. Initialize: `npx changeset init`
3. Configure `.changeset/config.json`:
   ```json
   {
     "changelog": "@changesets/changelog-github",
     "commit": false,
     "fixed": [],
     "linked": [["web", "functions"]],
     "access": "restricted",
     "baseBranch": "main",
     "updateInternalDependencies": "patch",
     "ignore": []
   }
   ```
4. Add GitHub Action: `.github/workflows/changeset-version.yml`
5. Remove old `semantic-version.yml` workflow
6. Sync all package versions to same number
7. Document new workflow in CONTRIBUTING.md

**Benefits:**
- Modern, industry-standard approach
- Automated changelog generation
- Better control over versioning
- Human-readable change descriptions
- Pre-release support

---

#### Option B: Fix Current System

**Effort:** Low (2-3 hours)
**Impact:** Medium
**Risk:** Medium

**Steps:**
1. Add workspace version syncing to GitHub Action
2. Generate CHANGELOG.md from git tags
3. Add pre-release support
4. Update documentation

**Benefits:**
- Keeps existing workflow
- No new dependencies
- Familiar to team

**Drawbacks:**
- Still manual changeset documentation
- Less feature-rich than Changesets
- Reinventing the wheel

---

### Long-term Strategy

**For a portfolio project:**

**If planning to open-source or collaborate:**
→ **Use Changesets** (industry standard, great DX)

**If solo maintainer with no publishing:**
→ **Simplified versioning** (keep current, add fixes)

**If deploying frequently:**
→ **Date-based versioning** (e.g., `2025.10.8`)

---

## Version Sync Fix (Immediate)

Regardless of choice, sync versions NOW:

```bash
# Root
npm version 1.13.2 --no-git-tag-version

# Web
cd web && npm version 1.13.2 --no-git-tag-version && cd ..

# Functions
cd functions && npm version 1.13.2 --no-git-tag-version && cd ..

# Commit
git add package.json package-lock.json web/package.json functions/package.json
git commit -m "chore: sync all workspace versions to 1.13.2"
```

---

## Conclusion

The current versioning system is **functional but outdated**. It lacks:

1. Workspace version synchronization
2. Automated changelog generation
3. Modern tooling integration

**Recommended Path Forward:**

1. **Immediate (today):** Sync all workspace versions
2. **This week:** Implement Changesets OR fix current system
3. **Next month:** Add CHANGELOG.md generation
4. **Future:** Consider pre-release workflow for staging

**Estimated ROI:**
- Time investment: 4-6 hours
- Ongoing maintenance: -50% (automation reduces manual work)
- Developer experience: +80% (clear change tracking)
- Release confidence: +90% (validated changes, changelogs)

---

## References

- [Changesets Documentation](https://github.com/changesets/changesets)
- [npm Workspaces Guide 2025](https://earthly.dev/blog/npm-workspaces-monorepo/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Release Please](https://github.com/googleapis/release-please)
