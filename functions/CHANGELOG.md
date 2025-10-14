# contact-form-function

## 1.14.2

### Patch Changes

- [#58](https://github.com/Jdubz/portfolio/pull/58) [`748806e`](https://github.com/Jdubz/portfolio/commit/748806e72c29a665e025b33218014d60d0b0e29e) Thanks [@Jdubz](https://github.com/Jdubz)! - Fix document generator by removing Firestore listener and returning URLs from API
  - Removed broken Firestore listener that was causing 400 Bad Request errors by connecting to wrong database
  - Updated backend `handleExecuteStep` to return download URLs and step progress in API response
  - Updated frontend to extract URLs and progress directly from API instead of Firestore subscription
  - Fixed missing download buttons and checklist not updating on staging
  - API now provides complete real-time updates without needing Firestore subscriptions

## 1.14.1

### Patch Changes

- [#58](https://github.com/Jdubz/portfolio/pull/58) [`2fd0a97`](https://github.com/Jdubz/portfolio/commit/2fd0a97e5dbe62f607d8672db9eb7787abe01fad) Thanks [@Jdubz](https://github.com/Jdubz)! - Fix React hooks error and image upload signed URL expiration
  - Fixed React error #418 (hook order change) and #423 (update during render) in document builder by batching setState calls
  - Reduced image upload signed URL expiration from 1 year to 7 days to comply with GCS maximum
  - Improved Firestore listener performance by extracting values before state updates

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
