# Changeset Enforcement

This project uses a **gentle nudge** approach to encourage changeset usage without blocking development.

## Overview

Changesets help us:

- 📋 Track changes across pull requests
- 🏷️ Manage semantic versioning automatically
- 📚 Generate CHANGELOG entries
- 🚀 Create release notes

## How It Works

### Local Development (Husky Hooks)

When you commit changes, the pre-commit hook will:

1. Run linting (soft warning, doesn't block)
2. Check if you've modified important files
3. If yes, remind you to create a changeset
4. **Allow the commit regardless** ✅

**Example output:**

```
📝 Changeset Reminder

You've modified 3 file(s) that may need a changeset:

  • web/src/components/ContactForm.tsx
  • web/src/pages/contact.tsx
  • functions/src/index.ts

To create a changeset, run:
  npm run changeset

This helps track changes for release notes and versioning.
(This is just a reminder - you can proceed without one)
```

### Pull Requests (GitHub Actions)

When you open a PR to `main` or `staging`:

1. GitHub Action checks for changeset files
2. Analyzes which files were changed
3. **Posts a helpful comment** (doesn't block merge) 💬

**If changeset is missing:**

```markdown
## 📝 Changeset Reminder

Hey there! 👋 This PR modifies **3 important file(s)** but doesn't include a changeset yet.

### To add a changeset:

npm run changeset

### Don't need a changeset?

Add the `skip-changeset` label to skip this check.
```

**If changeset exists:**

```markdown
## ✅ Changeset Detected

Great! This PR includes **1 changeset(s)**.

Your changes will be included in the next release. 🚀
```

## When to Create a Changeset

### Always Create a Changeset For:

- ✅ New features
- ✅ Bug fixes
- ✅ Performance improvements
- ✅ Breaking changes
- ✅ Dependency updates that affect users
- ✅ API changes

### Skip Changeset For:

- ❌ Documentation updates (README, docs/)
- ❌ Test changes
- ❌ CI/CD configuration
- ❌ Internal refactoring (no user-facing changes)
- ❌ Development tooling updates

## Creating a Changeset

```bash
npm run changeset
```

Follow the prompts:

1. **Which packages?** Select `josh-wentworth-portfolio` and/or `contact-form-function`
2. **Bump type?** Choose `patch`, `minor`, or `major`
3. **Summary?** Write a brief description

A file is created in `.changeset/fuzzy-pandas-chew.md`:

```markdown
---
"josh-wentworth-portfolio": minor
"contact-form-function": minor
---

Added experience page with CRUD operations
```

**Commit this file with your PR!**

## Skipping the Changeset Check

If your PR truly doesn't need a changeset, add the `skip-changeset` label:

1. Go to your PR on GitHub
2. Click "Labels" in the right sidebar
3. Select `skip-changeset`
4. The workflow will skip the check

## Files That Trigger Changeset Reminder

The following patterns trigger a changeset reminder:

- `web/src/**` - Frontend source code
- `functions/src/**` - Backend source code
- `web/gatsby-*` - Gatsby configuration
- `**/package.json` - Dependency changes

## Files That Don't Trigger Reminder

These patterns are ignored:

- `docs/**` - Documentation
- `*.md` - Markdown files
- `.github/**` - GitHub workflows
- `*.test.*` - Test files
- `*.spec.*` - Spec files
- Images (`.jpg`, `.png`, `.svg`, etc.)
- `package-lock.json` - Lock files
- Config files (`.eslintrc`, `.prettierrc`, etc.)

## Philosophy: Gentle Nudges, Not Blockers

We believe in:

1. **Education over enforcement** - Explain why changesets help
2. **Flexibility over rigidity** - Allow commits/merges without changesets
3. **Visibility over obstruction** - Show reminders, don't block progress
4. **Trust over control** - Trust developers to make the right choice

### Why Not Block?

- 🚫 Blocking creates friction and slows development
- 🧠 Developers know their changes best
- 🔧 Sometimes quick fixes need to go out immediately
- 📝 Documentation changes shouldn't require version bumps
- 🏃 Emergencies happen - don't block hotfixes

### Why Remind?

- 📋 Builds good habits over time
- 🎓 Teaches new contributors about changesets
- 📚 Ensures better release notes
- 🏷️ Helps maintain semantic versioning
- 🔍 Makes changes visible in PRs

## Customizing the Rules

### Adding Files to Ignore

Edit `scripts/check-changeset.js`:

```javascript
const IGNORED_PATTERNS = [/^\.changeset\//, /^docs\//, /your-pattern-here/]
```

### Adding Files to Watch

Edit `scripts/check-changeset.js`:

```javascript
const IMPORTANT_PATTERNS = [/^web\/src\//, /^functions\/src\//, /your-pattern-here/]
```

### Adjusting GitHub Workflow

Edit `.github/workflows/changeset-check.yml`:

- Change the file detection regex
- Modify the comment message
- Adjust which branches trigger the check

## Troubleshooting

### Hook not running?

Reinstall Husky hooks:

```bash
npm run prepare
```

### Script permission denied?

Make it executable:

```bash
chmod +x scripts/check-changeset.js
```

### Want to disable locally?

Set environment variable:

```bash
export SKIP_CHANGESET_CHECK=1
```

Then add to `scripts/check-changeset.js`:

```javascript
if (process.env.SKIP_CHANGESET_CHECK === "1") {
  return
}
```

### GitHub Action not commenting?

Check that the workflow has `pull-requests: write` permission in the YAML file.

## Examples

### Example 1: Feature Addition

```bash
# Make changes
git add web/src/components/ResumeGenerator.tsx

# Commit triggers reminder
git commit -m "feat: add resume generator component"

# Output:
📝 Changeset Reminder
You've modified 1 file(s) that may need a changeset:
  • web/src/components/ResumeGenerator.tsx
To create a changeset, run:
  npm run changeset

# Create changeset
npm run changeset
# Select: josh-wentworth-portfolio
# Type: minor
# Summary: "Added AI resume generator component"

# Commit the changeset
git add .changeset/
git commit -m "chore: add changeset"
```

### Example 2: Documentation Update

```bash
# Make changes
git add docs/README.md

# Commit - no reminder (docs are ignored)
git commit -m "docs: update installation instructions"

# No changeset needed! ✅
```

### Example 3: Multiple Changes

```bash
# Make multiple changes
git add web/src/components/A.tsx web/src/components/B.tsx functions/src/index.ts

# Create multiple changesets if they're separate features
npm run changeset  # Feature A
npm run changeset  # Feature B
npm run changeset  # Backend change

# Or single changeset if they're related
npm run changeset  # All changes together
```

## Integration with Other Tools

### Works With:

- ✅ Conventional Commits (commit-msg hook)
- ✅ Linting (pre-commit hook)
- ✅ Testing (pre-push hook)
- ✅ Size Limit (GitHub Action)
- ✅ Playwright tests (GitHub Action)

### Hook Execution Order:

1. **pre-commit:** Lint → Changeset reminder
2. **commit-msg:** Conventional commits validation
3. **pre-push:** Tests

All hooks allow commits/pushes to proceed even if they show warnings.

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Internal Changesets Workflow](./changesets-workflow.md)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions - Scripting with Actions](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)
