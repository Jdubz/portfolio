# Changeset Enforcement

This project **requires changesets** for all pull requests that modify important code. The system automatically generates changesets during commits to build good habits.

## Overview

Changesets help us:

- 📋 Track changes across pull requests
- 🏷️ Manage semantic versioning automatically
- 📚 Generate CHANGELOG entries
- 🚀 Create release notes

## Enforcement Policy

✅ **Required:** PRs modifying `web/src`, `functions/src`, `gatsby-*`, or `package.json` **must** include a changeset

❌ **Blocked:** PRs without changesets cannot be merged (unless labeled `skip-changeset`)

🤖 **Automated:** Changesets are automatically generated when you commit

## How It Works

### Automatic Changeset Generation (Pre-Commit Hook)

When you stage important files and commit, the pre-commit hook will:

1. ✅ Run linting checks
2. 🔍 Detect which files were changed
3. 📝 **Automatically prompt for changeset if needed**
4. 💾 Generate and stage the changeset file

**Example flow:**

```bash
git add web/src/components/NewFeature.tsx
git commit -m "feat: add new feature"

# Output:
📝 Auto-Changeset

Detected 1 important file(s) changed:
  • web/src/components/NewFeature.tsx

Affected packages: josh-wentworth-portfolio

Detected change type: minor

Change type? (patch/minor/major) [minor]: <press enter>
Summary of changes [add new feature]: <press enter>

✓ Created changeset: .changeset/quick-fox-jumps.md
✓ Staged changeset file
```

The changeset is automatically:

- ✅ Created in `.changeset/`
- ✅ Staged with `git add`
- ✅ Included in your commit

### Pull Request Enforcement (GitHub Action)

When you open a PR to `main` or `staging`:

1. 🔍 GitHub Action checks for changeset files
2. 📊 Analyzes which files were changed
3. ❌ **Fails the check if changeset is missing**
4. 💬 Posts a comment explaining what's needed

## When Changesets Are Required

### Always Required For:

- ✅ Changes to `web/src/**` (frontend source code)
- ✅ Changes to `functions/src/**` (backend source code)
- ✅ Changes to `web/gatsby-*` (Gatsby configuration)
- ✅ Changes to `**/package.json` (dependency updates)

### Never Required For:

- ❌ Documentation (`docs/**`, `*.md`)
- ❌ Tests (`*.test.*`, `*.spec.*`)
- ❌ CI/CD (`.github/**`)
- ❌ Configuration (`.eslintrc`, `.prettierrc`)
- ❌ Images (`.jpg`, `.png`, `.svg`)
- ❌ Lock files (`package-lock.json`)

## Changeset Types (Semantic Versioning)

The auto-changeset script detects the type from your commit message:

### Patch (0.0.X) - Bug Fixes

Commit prefixes: `fix:`, `perf:`

**Examples:**

- `fix: resolve broken image links`
- `perf: optimize bundle size`

### Minor (0.X.0) - New Features

Commit prefix: `feat:`

**Examples:**

- `feat: add resume generator`
- `feat: implement dark mode toggle`

### Major (X.0.0) - Breaking Changes

Commit prefix: `feat!:`, `fix!:`, or message contains `BREAKING`

**Examples:**

- `feat!: remove deprecated API`
- `fix!: change authentication flow`

## Bypassing the Requirement

### When to Skip Changesets

If your PR **only** contains:

- Documentation updates
- Test additions/fixes
- CI/CD configuration
- Internal refactoring with no user-facing changes

### How to Skip

Add the `skip-changeset` label to your PR:

1. Open your PR on GitHub
2. Click "Labels" in the right sidebar
3. Select `skip-changeset`
4. The workflow will pass without requiring a changeset

## Manually Creating Changesets

If you need to create a changeset manually (or want more control):

```bash
npm run changeset
```

This opens the interactive changeset CLI:

1. Select packages (space to select, enter to confirm)
2. Choose version bump type
3. Write a detailed summary

A file is created in `.changeset/` that you commit with your changes.

## Troubleshooting

### Script doesn't prompt for changeset

**Check:**

- Are you staging important files?
- Does a changeset already exist in `.changeset/`?
- Are your changes only to ignored files (docs, tests)?

**Debug:**

```bash
# Manually run the script
node scripts/auto-changeset.js

# Check what files are staged
git diff --cached --name-only
```

### Want to skip auto-generation for one commit

**Option 1:** Use `--no-verify` flag

```bash
git commit --no-verify -m "your message"
```

**Option 2:** Set environment variable

```bash
SKIP_CHANGESET=1 git commit -m "your message"
```

### PR check failing but I have a changeset

**Check:**

- Is the changeset file committed and pushed?
- Is it in the `.changeset/` directory?
- Is it named with `.md` extension (not `README.md`)?

**Verify:**

```bash
ls .changeset/*.md | grep -v README
```

### Want to modify the changeset after creation

**Find your changeset:**

```bash
ls -lt .changeset/*.md | head -1
```

**Edit it:**

```bash
nano .changeset/your-changeset.md
```

**Amend your commit:**

```bash
git add .changeset/
git commit --amend --no-edit
```

## Examples

### Example 1: Feature Addition

```bash
# Stage your changes
git add web/src/components/ResumeGenerator.tsx

# Commit with conventional commit format
git commit -m "feat: add AI resume generator"

# Pre-commit hook runs and prompts:
📝 Auto-Changeset
Detected 1 important file(s) changed
Detected change type: minor

Change type? (patch/minor/major) [minor]: <enter>
Summary of changes [add AI resume generator]: <enter>

✓ Created changeset: .changeset/brave-lion-roars.md

# Commit completes with changeset included
```

### Example 2: Bug Fix

```bash
git add web/src/components/ContactForm.tsx
git commit -m "fix: resolve email validation bug"

# Pre-commit hook detects 'fix:' prefix → suggests 'patch'
Detected change type: patch
Change type? (patch/minor/major) [patch]: <enter>
```

### Example 3: Documentation Update (No Changeset)

```bash
git add docs/README.md
git commit -m "docs: update installation instructions"

# Pre-commit hook detects docs file → no prompt
# Commit proceeds without changeset
```

## Philosophy

### Why Automatic Generation?

- 🎯 **Builds habits:** You create changesets every time
- ⚡ **Saves time:** No need to remember manual commands
- 📝 **Consistent format:** Uses commit message for defaults
- 🚫 **Prevents forgetting:** Impossible to skip accidentally

### Why PR Requirement?

- 🔒 **Quality control:** Ensures proper versioning
- 📚 **Better changelogs:** Every release has documentation
- 🏷️ **Semantic versioning:** Maintains version integrity
- 👥 **Team alignment:** Everyone sees what changed

### Why Allow Skip Label?

- 🔧 **Flexibility:** Emergency fixes can proceed
- 📝 **Documentation:** Docs-only PRs don't need versions
- 🧪 **Testing:** Test-only changes don't affect releases
- ⚙️ **Configuration:** CI/CD changes don't need versions

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Internal Changeset Workflow](./changesets-workflow.md)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Cache Busting

The changeset system includes **intelligent cache busting** for updates that require hard refreshes.

### When Prompted

During changeset creation, you'll see:

```
⚠️  Does this change require users to hard refresh?
   (Service worker changes, critical CSS/JS updates, etc.)

Force cache invalidation? (y/N) [N]:
```

Answer **Yes (y)** for:

- ✅ Service worker updates
- ✅ Critical CSS/JS changes
- ✅ Breaking localStorage changes
- ✅ Asset CDN migrations

Answer **No (N)** for:

- ❌ Regular content updates
- ❌ Minor style tweaks
- ❌ Backend API changes

### Example

```bash
git commit -m "feat: update service worker"

Change type? minor
Summary: update service worker caching
Force cache invalidation? y

✓ Created changeset with CACHE_BUST flag
🔥 Users will get automatic cache invalidation
```

See [Cache Busting Guide](./cache-busting.md) for full documentation.
