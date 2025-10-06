# Known Issues

This document tracks known technical issues in the codebase that are being monitored but don't block functionality.

## TypeScript Suppressions

The following `@ts-expect-error` comments are present in the codebase due to library compatibility issues with React 18 and Theme UI v0.17.2:

### 1. ParallaxLayer sx Prop Type Issues

**Files:**
- `web/src/@lekoarts/gatsby-theme-cara/elements/content.tsx:21`
- `web/src/@lekoarts/gatsby-theme-cara/elements/divider.tsx:27`

**Issue:** `@react-spring/parallax` ParallaxLayer component doesn't properly type the `sx` prop from Theme UI in React 18 environments.

**Status:** Waiting for `@react-spring/parallax` to update React 18 type definitions.

**Workaround:** Type suppression allows the code to compile and function correctly at runtime.

### 2. Theme UI Box Component React 18 Compatibility

**File:** `web/src/@lekoarts/gatsby-theme-cara/components/footer.tsx:6`

**Issue:** Theme UI Box component has type incompatibilities with React 18's stricter type checking.

**Status:** Waiting for Theme UI v0.18 which includes React 18 type fixes (currently in beta).

**Workaround:** Type suppression; component renders correctly.

### 3. Gatsby Image Component sx Prop

**Files:**
- `web/src/@lekoarts/gatsby-theme-cara/components/AvatarFrame.tsx:8`
- `web/src/@lekoarts/gatsby-theme-cara/components/AvatarFrame.tsx:35`

**Issue:** `gatsby-plugin-image` Image component doesn't recognize Theme UI's `sx` prop type.

**Status:** Known issue with Gatsby plugins and Theme UI integration.

**Workaround:** Type suppression; styling works correctly via Theme UI's babel plugin.

## Dependencies

### Flagged as "Unused" by depcheck

The following dependencies are flagged by `depcheck` as unused but are actually required:

**Gatsby Plugins (Required by gatsby-config.ts):**
- `gatsby-plugin-image` - Used for optimized image loading
- `gatsby-plugin-sharp` - Image processing for Gatsby
- `gatsby-transformer-sharp` - GraphQL image transformations
- `gatsby-plugin-sitemap` - Automatic sitemap generation
- `gatsby-plugin-manifest` - PWA manifest
- `gatsby-plugin-webpack-statoscope` - Bundle analysis (optional, conditional)
- `sharp` - Native image processing library
- `@parcel/watcher` - File watching for Gatsby

**Dev Dependencies:**
- `@eslint/js` - ESLint v9 flat config support
- `@playwright/test` - E2E testing (planned)
- `playwright` - Browser automation
- `ajv` - JSON schema validation (ESLint dependency)
- `jest-environment-jsdom` - DOM testing environment

**Recommendation:** Keep all dependencies. Depcheck doesn't analyze Gatsby config files or conditional imports.

## Test Warnings

### Jest Async Cleanup

**Location:** Functions workspace tests

**Warning:** `Jest did not exit one second after the test run has completed`

**Cause:** Async operations (likely Firebase SDK timers) not fully cleaned up after tests.

**Impact:** Tests pass successfully; only affects test runner exit time.

**Priority:** Low - doesn't affect functionality or CI/CD.

## Build & Deploy

No known build or deployment issues. All checks passing:
- ✅ TypeScript compilation
- ✅ ESLint (0 errors, 0 warnings)
- ✅ Prettier formatting
- ✅ Test suites (30 passing tests)
- ✅ Production builds successful

---

**Last Updated:** 2025-10-05
**Maintained By:** Josh Wentworth
