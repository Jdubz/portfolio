---
"josh-wentworth-portfolio": minor
"contact-form-function": minor
---

Implement Changesets for versioning and changelog management

This change migrates from the old semantic-version GitHub Action to Changesets.

Key improvements:
- Automated CHANGELOG generation with GitHub integration
- Linked workspace versioning (web + functions always in sync)
- Human-readable change descriptions in PRs
- "Version Packages" PR for review before releases
- Changesets bot comments on PRs

All workspace packages synchronized to version 1.13.3.
