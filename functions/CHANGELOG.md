# contact-form-function

## 1.14.0

### Minor Changes

- [#33](https://github.com/Jdubz/portfolio/pull/33) [`f20605d`](https://github.com/Jdubz/portfolio/commit/f20605d93c1fbeb9911fc753eaa2428bfa6fd74a) Thanks [@Jdubz](https://github.com/Jdubz)! - Implement Changesets for versioning and changelog management

  This change migrates from the old semantic-version GitHub Action to Changesets.

  Key improvements:
  - Automated CHANGELOG generation with GitHub integration
  - Linked workspace versioning (web + functions always in sync)
  - Human-readable change descriptions in PRs
  - "Version Packages" PR for review before releases
  - Changesets bot comments on PRs

  All workspace packages synchronized to version 1.13.3.

## 1.13.3

### Patch Changes

- Synced package version with monorepo root
