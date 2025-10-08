# Versioning with Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for managing versions and changelogs across the monorepo.

## Overview

Changesets provides:
- **Explicit version control** - No accidental version bumps
- **Automated CHANGELOG generation** - From human-readable descriptions
- **Linked package versioning** - Web + Functions always stay in sync
- **"Version Packages" PR** - Review changes before releasing

## Version Format

Versions follow [Semantic Versioning (semver)](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, improvements

## How to Version Your Changes

### Step 1: Make Your Changes

Work on your feature/fix as normal:

```bash
git checkout -b my-feature
# ... make changes ...
git add .
git commit -m "feat: add awesome feature"
```

### Step 2: Create a Changeset

Before creating your PR, add a changeset:

```bash
npm run changeset
# or
make changeset
```

This will prompt you with:

```
🦋  Which packages would you like to include?
◯ changed packages
  ◉ josh-wentworth-portfolio
  ◉ contact-form-function

🦋  Which packages should have a major bump?
  ⊠ all packages

🦋  Which packages should have a minor bump?
  ☑ josh-wentworth-portfolio
  ☑ contact-form-function

🦋  Please enter a summary for this change (this will be in the changelogs).
Summary ›
```

**Example responses:**

```
Summary › Added dark mode toggle with persistent user preference

Details (optional):
- Created DarkModeToggle component
- Added useLocalStorage hook for persistence
- Updated theme provider with dark mode support
```

### Step 3: Commit the Changeset

A markdown file is created in `.changeset/`:

```bash
git add .changeset/
git commit -m "chore: add changeset"
git push
```

### Step 4: Create PR

Your PR now includes the changeset file. The Changesets bot will comment showing what will be released.

### Step 5: Merge to Main

When your PR merges to `main`:

1. **GitHub Actions runs** - Detects the changeset
2. **Creates/Updates "Version Packages" PR** - Contains:
   - Updated package.json versions
   - Generated CHANGELOG entries
   - All pending changesets combined
3. **Maintainer reviews and merges** - Versions bump, ready to deploy!

## Choosing Version Bump Type

### Patch (0.0.X)

Bug fixes, documentation, internal refactors - no new features:

```bash
npm run changeset
# Select: patch
# Summary: "Fixed mobile menu not closing on navigation"
```

**Examples:**
- Bug fixes
- Documentation updates
- Dependency updates
- Code refactors
- Performance improvements

### Minor (0.X.0)

New features that are backward compatible:

```bash
npm run changeset
# Select: minor
# Summary: "Added experience page with CRUD operations"
```

**Examples:**
- New components
- New API endpoints
- New features
- Additional functionality

### Major (X.0.0)

Breaking changes that could affect existing users:

```bash
npm run changeset
# Select: major
# Summary: "Redesigned API - removed /v1 endpoints"
```

**Examples:**
- Removed features/APIs
- Changed behavior
- Renamed components
- Updated dependencies with breaking changes

## Linked Versioning

This monorepo uses **linked versioning** - packages always version together:

- If you bump `josh-wentworth-portfolio` to 1.14.0
- `contact-form-function` will also bump to 1.14.0
- Prevents version drift

## Current Version

### In Browser Console

Open DevTools and run:

```javascript
console.log(window.__APP_VERSION__)  // "1.13.3"
console.log(window.__APP_NAME__)     // "josh-wentworth-portfolio"
```

Or check the styled banner that logs on page load.

### In Terminal

```bash
# Check all package versions
npm version

# Check root version
node -p "require('./package.json').version"

# Check web version
node -p "require('./web/package.json').version"

# Check functions version
node -p "require('./functions/package.json').version"
```

## Common Scenarios

### Scenario 1: Frontend-Only Change

```bash
npm run changeset
# Which packages? → josh-wentworth-portfolio (space to select)
# Bump type? → patch
# Summary? → "Fixed cookie banner mobile layout"
```

**Result:** Both packages bump together (linked versioning)

### Scenario 2: Backend-Only Change

```bash
npm run changeset
# Which packages? → contact-form-function
# Bump type? → minor
# Summary? → "Added rate limiting to contact endpoint"
```

**Result:** Both packages bump together (linked versioning)

### Scenario 3: Full-Stack Feature

```bash
npm run changeset
# Which packages? → both (select with space)
# Bump type? → minor
# Summary? → "Added experience API with Firebase authentication"
```

**Result:** Both packages bump together

### Scenario 4: Multiple Changes in One PR

Create multiple changesets:

```bash
npm run changeset  # For feature A
npm run changeset  # For bug fix B
npm run changeset  # For refactor C
```

All changesets will be combined in the "Version Packages" PR.

## Manual Commands

```bash
# Create a changeset (interactive)
npm run changeset

# Apply all changesets and bump versions (automated by GitHub Actions)
npm run version

# Publish packages (not used - we deploy to Firebase instead)
npm run release
```

## Pre-releases (Advanced)

For beta/alpha/staging releases:

```bash
# Enter pre-release mode
npx changeset pre enter beta

# Create changesets as normal
npm run changeset

# Version and publish
npm run version

# Exit pre-release mode
npx changeset pre exit
```

This creates versions like:
- `1.14.0-beta.1`
- `1.14.0-beta.2`
- `1.14.0-rc.1`

## Workflow Diagram

```
Developer:
  1. Make changes
  2. Run `npm run changeset`
  3. Commit changeset file
  4. Create PR

GitHub Actions (on merge to main):
  5. Detect changesets
  6. Create "Version Packages" PR
  7. Generate CHANGELOG
  8. Update package.json versions

Maintainer:
  9. Review "Version Packages" PR
  10. Merge PR
  11. Deploy to Firebase

Result:
  - Versions bumped
  - Tags created
  - CHANGELOG updated
  - Ready to deploy!
```

## Best Practices

1. **One changeset per logical change** - Don't combine unrelated changes
2. **Write clear summaries** - They become CHANGELOG entries
3. **Include details** - Help future maintainers understand why
4. **Always create changesets** - PRs without changesets won't version
5. **Use conventional commit messages** - Still good practice for git history

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

### "I picked the wrong version bump"

**Problem:** Selected major instead of minor.

**Solution:**
```bash
# Find and delete the changeset file
ls .changeset/
rm .changeset/your-file-name.md

# Create a new one
npm run changeset
```

### "Version Packages PR has conflicts"

**Problem:** package.json versions diverged.

**Solution:**
```bash
# On main branch
git pull origin main

# Merge main into "Version Packages" branch
git checkout changeset-release/main
git merge main
# Resolve conflicts in package.json
git push
```

### "How do I see what will be released?"

Check the "Version Packages" PR - it shows:
- All pending changesets
- New versions for each package
- Generated CHANGELOG entries

## Migration from Old System

**Before (Deprecated):**
- Conventional commits → automatic version bump
- Version bumped on every push to main/staging
- Manual CHANGELOG updates

**After (Current):**
- Explicit changesets → controlled versioning
- Version bumps via "Version Packages" PR
- Automated CHANGELOG generation

**Benefits:**
- ✅ No accidental version bumps
- ✅ Human-readable change descriptions
- ✅ Review changes before release
- ✅ Linked package versioning
- ✅ Automated CHANGELOGs

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Changesets Workflow Guide](../development/changesets-workflow.md)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/) (still recommended for commit messages)
