# Semantic Versioning Guide

This project uses [Semantic Versioning](https://semver.org/) with automated version bumps based on [Conventional Commits](https://www.conventionalcommits.org/).

## Version Format

Versions follow the format: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

## Automatic Versioning

When you push commits to `main` or `staging` branches, the version is automatically bumped based on your commit message format.

### Commit Message Format

Use these prefixes in your commit messages:

#### Patch Version (Bug Fixes)

```
fix: resolve navigation issue
fix(ui): correct button alignment
patch: update dependencies
```

#### Minor Version (New Features)

```
feat: add dark mode toggle
feat(api): implement user authentication
feature: create contact form
```

#### Major Version (Breaking Changes)

```
feat!: redesign entire UI
feat(api)!: change response format
BREAKING CHANGE: remove legacy API endpoints
```

### Examples

```bash
# This will bump patch version (1.0.0 → 1.0.1)
git commit -m "fix: resolve mobile menu overflow"

# This will bump minor version (1.0.0 → 1.1.0)
git commit -m "feat: add project filtering"

# This will bump major version (1.0.0 → 2.0.0)
git commit -m "feat!: redesign navigation structure"
```

## Manual Versioning

If you need to bump the version manually:

### Using NPM

```bash
npm run version:patch  # 1.0.0 → 1.0.1
npm run version:minor  # 1.0.0 → 1.1.0
npm run version:major  # 1.0.0 → 2.0.0
```

### Using Make

```bash
make version-patch  # 1.0.0 → 1.0.1
make version-minor  # 1.0.0 → 1.1.0
make version-major  # 1.0.0 → 2.0.0
```

Manual versioning will:

1. Update `package.json`
2. Create a git commit with message: `chore: bump version to X.Y.Z`
3. Create a git tag

## Commit Message Prefixes

All valid prefixes (case-insensitive):

- `fix:` `bugfix:` `patch:` → Patch bump
- `feat:` `feature:` → Minor bump
- `feat!:` `feature!:` → Major bump (with `!`)
- `BREAKING CHANGE:` in commit body → Major bump

### Other Prefixes (no version bump)

These don't trigger version changes but are good practice:

- `chore:` - Maintenance tasks
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code restructuring
- `test:` - Test additions/changes
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

## Skipping Auto-Version

To prevent automatic versioning on a specific commit:

```bash
git commit -m "chore: update README [skip ci]"
```

The `[skip ci]` flag prevents the workflow from running.

## Version Workflow

The automatic versioning workflow:

1. **Triggers** on push to `main` or `staging`
2. **Analyzes** the last commit message
3. **Determines** version bump type
4. **Checks** if version tag already exists (prevents duplicates)
5. **Updates** package.json and package-lock.json
6. **Creates** git commit and tag
7. **Pushes** changes back to the branch
8. **Generates** release notes (main branch only)

### Commit Message Validation

A **non-blocking** husky hook validates your commit messages:

- ✅ Shows a warning if format is incorrect
- ✅ Still allows the commit to proceed
- ✅ Helps maintain consistent commit history

You'll see a warning like this for non-standard commits:

```
⚠️  WARNING: Commit message doesn't follow Conventional Commits format
⚠️  Continuing anyway (non-blocking)...
```

## Current Version

### In the Browser Console

The version is automatically logged to the browser console when the site loads. You'll see a styled banner with the app name and version.

You can also access it programmatically:

```javascript
// In browser DevTools console
console.log(window.__APP_VERSION__) // e.g., "1.5.0"
console.log(window.__APP_NAME__) // e.g., "josh-wentworth-portfolio"
```

### In the Terminal

Check the current version:

```bash
# View in terminal
npm version

# Or check package.json
cat package.json | grep version
```

## Best Practices

1. **One feature per commit** - Makes version bumps accurate
2. **Use descriptive messages** - Helps generate release notes
3. **Follow the format** - Ensures automation works
4. **Test before pushing** - Avoid unnecessary version bumps
5. **Use scopes** - `feat(ui):` is clearer than `feat:`

## Examples in Practice

### Bug Fix Release (1.2.3 → 1.2.4)

```bash
git commit -m "fix: resolve footer link styling"
git push origin main
# Auto-bumps to 1.2.4
```

### Feature Release (1.2.4 → 1.3.0)

```bash
git commit -m "feat: add contact form with validation"
git push origin main
# Auto-bumps to 1.3.0
```

### Breaking Change Release (1.3.0 → 2.0.0)

```bash
git commit -m "feat!: redesign entire homepage layout

BREAKING CHANGE: Old layout components removed"
git push origin main
# Auto-bumps to 2.0.0
```

## Troubleshooting

**Version didn't bump?**

- Check commit message format
- Ensure you pushed to `main` or `staging`
- Look at GitHub Actions logs

**Wrong version bump?**

- Review commit message prefix
- Use `!` for breaking changes
- Add `BREAKING CHANGE:` in commit body

**Need to revert a version?**

```bash
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3
npm version 1.2.2 -m "chore: revert version to %s"
git push origin main --tags
```
