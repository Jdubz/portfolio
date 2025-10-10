# Changesets Versioning Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for managing versions and changelogs across the monorepo.

## Overview

Changesets provides a structured way to:

- Track changes across PRs
- Automatically generate CHANGELOGs
- Version packages together (linked versioning)
- Create release PRs with all pending changes

## Workflow for Contributors

### 1. Making Changes

When you make changes that should be released, create a changeset:

```bash
npm run changeset
```

This will prompt you with:

1. **Which packages changed?** (web, functions, or both)
2. **What type of change?** (major, minor, patch)
3. **Summary of changes** (what did you change?)

### 2. Changeset File

A file will be created in `.changeset/` like `.changeset/fuzzy-pandas-chew.md`:

```markdown
---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Fixed cookie banner to show acknowledgment-only notice
```

**Commit this file with your PR!**

### 3. PR Review

- Changesets bot will comment on your PR
- Reviewers can see what will be released
- No version bumps happen until merge to `main`

### 4. After Merge to Main

When your PR merges to `main`, GitHub Actions will:

1. **Create/Update "Version Packages" PR** with:
   - Updated package.json versions
   - Generated CHANGELOG.md entries
   - All pending changesets combined

2. **When maintainer merges that PR:**
   - Versions are bumped
   - CHANGELOGs are updated
   - Git tags are created
   - Ready to deploy!

## Choosing Version Bump Type

Follow [Semantic Versioning (semver)](https://semver.org/):

### Patch (0.0.X)

- Bug fixes
- Documentation updates
- Internal refactors
- Performance improvements

**Examples:**

```bash
# Bug fix
npm run changeset
# Select: patch
# Summary: "Fixed broken image links in Projects section"
```

### Minor (0.X.0)

- New features (backward compatible)
- New API endpoints
- New components

**Examples:**

```bash
# New feature
npm run changeset
# Select: minor
# Summary: "Added experience page with CRUD operations"
```

### Major (X.0.0)

- Breaking changes
- Removed APIs
- Changed behavior that could break existing usage

**Examples:**

```bash
# Breaking change
npm run changeset
# Select: major
# Summary: "Removed deprecated ContactForm API, use new endpoint"
```

## Linked Versioning

This monorepo uses **linked versioning** - web and functions packages are versioned together.

This means:

- If you bump `josh-wentworth-portfolio` to 1.14.0
- `contact-form-function` will also bump to 1.14.0
- Keeps everything in sync

## Common Scenarios

### Scenario 1: Frontend-only Change

```bash
npm run changeset
# Which packages? → josh-wentworth-portfolio (web only)
# Bump type? → patch
# Summary? → "Fixed mobile menu styling"
```

Result: Both packages bump together (linked)

### Scenario 2: Backend-only Change

```bash
npm run changeset
# Which packages? → contact-form-function (functions only)
# Bump type? → minor
# Summary? → "Added rate limiting to contact form endpoint"
```

Result: Both packages bump together (linked)

### Scenario 3: Full-stack Change

```bash
npm run changeset
# Which packages? → both (select both with spacebar)
# Bump type? → minor
# Summary? → "Added experience API with authentication"
```

Result: Both packages bump together

### Scenario 4: Multiple Changes in One PR

You can create multiple changesets:

```bash
npm run changeset  # First change
npm run changeset  # Second change
npm run changeset  # Third change
```

All will be included in the same version bump.

## Manual Commands

### Create a changeset

```bash
npm run changeset
```

### Apply version bumps locally (testing)

```bash
npm run version
```

### Publish (not used - we deploy to Firebase instead)

```bash
npm run release
```

## Pre-releases (Advanced)

For beta/alpha releases:

```bash
# Enter pre-release mode
npx changeset pre enter beta

# Create changeset as normal
npm run changeset

# Exit pre-release mode when done
npx changeset pre exit
```

This creates versions like `1.14.0-beta.1`, `1.14.0-beta.2`, etc.

## Enforcement & Automation

This project **requires changesets** for all PRs with important code changes and **automatically generates** them during commits:

### Automatic Generation (Pre-Commit Hook)

When you commit changes to important files, a pre-commit hook will:

- 🔍 Detect which files were modified
- 📝 Auto-prompt for changeset details (type and summary)
- 💾 Generate and stage the changeset file
- ✅ Include it in your commit automatically

**Example:**

```bash
git add web/src/components/NewFeature.tsx
git commit -m "feat: add new feature"

# Hook prompts:
Change type? (patch/minor/major) [minor]: <enter>
Summary of changes [add new feature]: <enter>

# Changeset automatically created and staged
```

### Required Check (GitHub Action)

When you open a PR to `main` or `staging`, a workflow will:

- 🔍 Check for changeset files
- ❌ **Fail if missing** (blocks merge)
- 💬 Comment with instructions
- 🏷️ Skip check if PR has `skip-changeset` label

**This is a required check!** PRs cannot merge without a changeset (unless labeled).

See [Changeset Enforcement](./changeset-enforcement.md) for detailed documentation.

## GitHub Actions

### changeset-version.yml

Runs on push to `main`:

- Checks for pending changesets
- Creates/updates "Version Packages" PR
- Includes all CHANGELOGs

### changeset-check.yml

Runs on pull requests:

- Analyzes changed files
- Checks for changeset files
- Posts helpful comments
- **Required check (blocks merge if missing)**
- Can be bypassed with `skip-changeset` label

## Troubleshooting

### "No changeset found in PR"

**Problem:** You forgot to create a changeset.

**Solution:**

```bash
npm run changeset
git add .changeset/
git commit -m "chore: add changeset"
git push
```

### "Version conflicts"

**Problem:** Someone else merged a version bump while you were working.

**Solution:**

```bash
git pull --rebase origin main
# Resolve conflicts in package.json if needed
git push
```

### "I made a mistake in my changeset"

**Problem:** Wrong version bump or bad summary.

**Solution:**

```bash
# Find your changeset file
ls .changeset/

# Edit or delete it
rm .changeset/your-file.md

# Create a new one
npm run changeset
```

## Migration from Old System

**Old workflow (deprecated):**

- Conventional commits → automated version bump
- GitHub Actions bumped version on push

**New workflow:**

- Explicit changesets → controlled versioning
- "Version Packages" PR for review before release

**Benefits:**

- ✅ Human-readable change descriptions
- ✅ Automatic CHANGELOG generation
- ✅ Linked package versioning
- ✅ Review changes before release
- ✅ No accidental version bumps

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/) (still good practice!)
