# contact-form-function

## 1.16.0

### Minor Changes

- [#63](https://github.com/Jdubz/portfolio/pull/63) [`0af7258`](https://github.com/Jdubz/portfolio/commit/0af7258f9924d70846076c9ffc6595c7eaf2fae5) Thanks [@Jdubz](https://github.com/Jdubz)! - Staging -> main

  Auto-generated changeset for PR #63

### Patch Changes

- [#63](https://github.com/Jdubz/portfolio/pull/63) [`0af7258`](https://github.com/Jdubz/portfolio/commit/0af7258f9924d70846076c9ffc6595c7eaf2fae5) Thanks [@Jdubz](https://github.com/Jdubz)! - Configure version bumps to only run on main branch

  Changed auto version bump workflow to follow industry standard:
  - Version bumps now only occur when merging to main
  - Staging keeps changesets for review
  - Prevents duplicate version bumps
  - Cleaner release workflow

  This is the standard changesets pattern used across the industry.

## 1.15.0

### Minor Changes

- [#63](https://github.com/Jdubz/portfolio/pull/63) [`4a4a782`](https://github.com/Jdubz/portfolio/commit/4a4a7820ede6636cdb9a7f1ac5341743e627eae2) Thanks [@Jdubz](https://github.com/Jdubz)! - Staging -> main

  Auto-generated changeset for PR #63

## 1.14.3

### Patch Changes

- [#63](https://github.com/Jdubz/portfolio/pull/63) [`f28c19e`](https://github.com/Jdubz/portfolio/commit/f28c19e1b4ac8b708f46ef1bcad976d0d98587d5) Thanks [@Jdubz](https://github.com/Jdubz)! - Production-ready release: generator improvements, database fixes, and documentation cleanup

  **Generator Improvements:**
  - Remove Firestore listener in favor of API-based progress updates
  - Fix download URLs and step progress returned directly from API
  - Resolve 400 Bad Request errors on staging by using correct database

  **Critical Database Fix:**
  - Fix firestore.service.ts to use environment-aware DATABASE_ID instead of hardcoded "portfolio"
  - Contact form now correctly routes to portfolio-staging in staging environment
  - Prevents staging submissions from going to production database

  **Documentation Cleanup:**
  - Delete 19 obsolete files (audit docs, archive folder, temp refactor docs)
  - Update generator/PLAN.md to mark Progressive Generation UI as complete
  - Add Frontend Terminology Migration task (defaults → personalInfo)
  - Reorganize docs/README.md with cleaner 3-type structure (Architecture, Setup, Plans)

  **Database Migration:**
  - Complete Firestore migration: generator/default → generator/personal-info
  - Applied to both staging and production databases
  - Backend fully supports new terminology with backward-compatible deprecated aliases

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
