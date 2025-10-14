---
"josh-wentworth-portfolio": minor
---

Add automatic changeset generation workflow

New GitHub Actions workflow automatically creates changesets for PRs when important files are modified and no changeset exists yet. This eliminates manual changeset management while still allowing customization.

Features:
- Auto-detects which packages changed (web, functions, or both)
- Auto-determines version bump type (patch/minor)
- Uses PR title as changeset description
- Commits and pushes changeset automatically
- Comments on PR with generated changeset info
- Skips if changeset already exists or PR has 'skip-changeset' label

Benefits:
- Reduces friction in PR workflow
- No more "changeset required" failures
- Still allows manual changeset creation/editing when desired
