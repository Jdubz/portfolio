# Changesets - Automatic Versioning

This project uses [Changesets](https://github.com/changesets/changesets) for automated versioning and CHANGELOG generation.

## 🚀 How It Works (Automatic!)

1. **Create a changeset** when making changes
2. **Commit the changeset** with your PR
3. **Merge to main** → versions automatically bump! 🎉

No manual version bumping needed - it happens automatically on merge.

## Creating a Changeset

When you make changes to the codebase, create a changeset to document them:

```bash
npm run changeset
```

This will:

1. Prompt you to select which packages changed (web, functions, or both)
2. Ask for the version bump type:
   - **patch** (1.0.x) - Bug fixes, minor changes
   - **minor** (1.x.0) - New features, backwards compatible
   - **major** (x.0.0) - Breaking changes
3. Request a summary of your changes (used in CHANGELOG)
4. Create a new markdown file in `.changeset/`

**Important: Commit the changeset file with your PR!**

## Automatic Version Bumping

When your PR merges to `main`:

1. ✅ GitHub Action automatically runs
2. ✅ Consumes all pending changesets
3. ✅ Bumps package.json versions
4. ✅ Updates CHANGELOG.md files
5. ✅ Commits changes back to main

**No manual intervention required!**

## When to Create a Changeset

✅ **Create a changeset for:**

- New features
- Bug fixes
- Performance improvements
- Breaking changes
- User-facing changes

❌ **Skip changeset for:**

- Documentation updates
- Test changes
- CI/CD config
- Internal refactoring

## Enforcement

This project **requires changesets** for all PRs with important code changes:

- **Local commits:** Auto-generates changesets when you commit
- **GitHub PRs:** Required check that blocks merge without changeset
- **Skip option:** Use `skip-changeset` label for docs/tests/config PRs

## Need Help?

- Full docs: [Changesets Official Docs](https://github.com/changesets/changesets)
- Common questions: [FAQ](https://github.com/changesets/changesets/blob/main/docs/common-questions.md)
