# Planned Improvements

This document tracks future enhancements, optimizations, and technical debt that should be addressed.

**Last Audit:** October 6, 2025 - Overall Health: A- (90/100)
**See:** [AUDIT_REPORT.md](../../AUDIT_REPORT.md) for comprehensive analysis

---

## ✅ Recently Completed (Oct 2025)

### Critical Production Fixes
- [x] Fix CSP blocking Firebase App Check endpoints
- [x] Fix CSP blocking reCAPTCHA API endpoints
- [x] Add 30-second timeout to contact form requests
- [x] Implement full-stack request tracing (trace/span IDs)
- [x] Switch fonts to Bunny CDN (privacy-friendly)
- [x] Fix semantic commit enforcement (Husky)
- [x] Add GitHub Actions Cloud Run permissions
- [x] Update Mailgun credentials and add region support
- [x] Configure Firestore named database ("portfolio")

---

## 🎯 High Priority

### 🔴 Critical (Week 1)

#### Security & Dependencies
- [x] **Update security dependencies** (COMPLETED - 10 vulnerabilities remain in dev deps)
  - Ran `npm audit fix && npm update --workspaces`
  - Updated 1552 packages successfully
  - Build tested and passing
  - Note: Remaining vulnerabilities are in dev dependencies (Gatsby/Lighthouse CI)
  - Force fixes would cause breaking changes (Gatsby downgrade)
  - Dev dependencies pose minimal production risk


### Analytics Enhancements
- [ ] Add cookie consent banner for GDPR compliance
- [ ] Implement user consent management for analytics tracking
- [ ] Create custom Analytics events for:
  - Project card views (viewport intersection observer)
  - Resume downloads
  - Social media link clicks
  - Section navigation

### Performance Optimization
- [x] **Lazy load Firebase** (COMPLETED - ~200KB savings on non-contact pages)
  - Firebase now only loads when ContactForm component mounts
  - Homepage loads ~200KB less JavaScript
  - Build time improved from 18s to 10.7s
  - Firebase split into separate 40KB chunk
- [ ] **Add bundle size tracking to PR pipeline** (visibility into changes)
  - Use size-limit-action or bundlesize
  - Track bundle sizes over time
  - Effort: 2 hours
- [ ] **Further bundle optimizations**
  - Route-based code splitting for remaining pages
  - Optimize images (convert to WebP, add responsive sizes)
  - Tree-shake unused Theme UI components
  - Effort: 4-6 hours
- [ ] Add service worker for offline support
- [ ] Optimize background icon SVG rendering

### Contact Form
- [ ] Add form validation feedback animations
- [ ] Implement progressive form submission states
- [ ] Add email verification for double opt-in
- [ ] Create admin dashboard for viewing submissions (Firestore)

## 🔧 Medium Priority

### Testing
- [ ] **Add E2E tests for contact form** (HIGH PRIORITY - Playwright installed but no tests)
  - Test form submission flow
  - Test validation errors
  - Test network failures
  - Effort: 4-6 hours
- [ ] **Increase test coverage to 70%+** (Currently ~50% web, ~65% functions)
  - ContactForm edge cases (network errors, timeout)
  - Error boundaries
  - Firebase initialization
  - Effort: 6-8 hours
- [ ] Add visual regression testing for component screenshots
- [ ] Test Firebase Analytics event tracking
- [ ] **Add Lighthouse CI to PR pipeline** (prevent performance regressions)
  - Effort: 2 hours

### Documentation
- [ ] Create architecture diagrams for system overview
- [ ] Add video walkthrough of local development setup
- [ ] Document theme customization guide
- [ ] Create troubleshooting FAQ

### Developer Experience
- [x] Add pre-commit hooks for automated formatting (COMPLETED - Husky configured)
- [ ] **Add environment variable validation** (fail fast on misconfiguration)
  - Use Joi/Zod at startup
  - Effort: 2 hours
- [ ] Create Storybook for component development
- [ ] Improve error messages in Cloud Functions
- [ ] **Replace console.log with structured logging** (winston/pino)
  - Effort: 3-4 hours

## 🚀 Low Priority / Future

### Features
- [ ] Add dark mode toggle (Theme UI supports it)
- [ ] Create blog section using MDX
- [ ] Add case study detail pages for major projects
- [ ] Implement search functionality
- [ ] Add RSS feed for updates

### Infrastructure
- [ ] Set up staging environment preview URLs for PRs
- [ ] Implement automated dependency updates (Renovate/Dependabot)
- [x] Add automated Lighthouse CI checks to PRs (PARTIAL - manual runs only, not in PR pipeline yet)
- [ ] Create backup strategy for Firestore data
- [ ] **Add deployment notifications** (Slack/Discord/email)
  - Effort: 1-2 hours
- [ ] **Add performance monitoring** (Firebase Performance Monitoring)
  - Track FCP, LCP, CLS, custom traces
  - Effort: 2-3 hours

### Accessibility
- [ ] Full WCAG 2.1 Level AA audit
- [ ] Add keyboard navigation improvements
- [ ] Implement skip links for sections
- [ ] Add proper ARIA labels throughout

### SEO
- [ ] Add structured data (JSON-LD) for projects
- [ ] Implement Open Graph images for social sharing
- [ ] Create XML sitemap for projects (if added as pages)
- [ ] Add meta descriptions for all pages

## 📚 Technical Debt

### Type Safety
- [ ] Remove all `@ts-expect-error` suppressions when library updates available:
  - `@react-spring/parallax` React 18 types
  - `theme-ui` v0.18 (currently in beta)
  - `gatsby-plugin-image` sx prop types

### Dependencies
- [ ] Upgrade to Theme UI v0.18 when stable (React 18 fixes)
- [ ] Review and update all dependencies quarterly
- [ ] Remove `legacy-peer-deps` flag once Theme UI is updated
- [ ] Evaluate replacing deprecated packages

### Code Quality
- [ ] Consolidate duplicate gradient patterns
- [ ] Extract magic numbers to theme constants
- [ ] Standardize error handling patterns
- [ ] Refactor large components (>200 lines)

### Build Process
- [ ] Investigate faster build times (currently ~2-3min)
- [ ] Optimize CI/CD pipeline (parallel jobs where possible)
- [ ] Reduce Docker image sizes for Cloud Functions
- [ ] Cache Gatsby build artifacts more effectively

## 🔍 Investigations

### To Research
- [ ] Evaluate migration to Gatsby v6 when released
- [ ] Research alternatives to Firebase Hosting (cost vs features)
- [ ] Investigate Cloudflare Workers for edge functions
- [ ] Explore static generation of project pages from data source

### Performance Monitoring
- [ ] Set up Firebase Performance Monitoring
- [ ] Add Core Web Vitals tracking to Analytics
- [ ] Monitor Cloud Functions cold start times
- [ ] Track bundle size over time

## 📝 Notes

### Decision Log
- **Firebase Analytics**: Enabled in production/staging, disabled in dev to avoid data pollution
- **Monorepo Structure**: Chose npm workspaces over Lerna for simplicity
- **Styling**: Using Theme UI for consistency and maintainability
- **Forms**: Cloud Functions over client-side email for security

### Won't Do (At This Time)
- **Server-Side Rendering**: Not needed for portfolio site (static is fine)
- **CMS Integration**: Overkill for personal portfolio
- **Multi-language Support**: English-only audience
- **Authentication**: No user accounts needed

---

## 📊 Audit Summary (Oct 2025)

### Overall Health: A- (90/100)

| Category | Score | Status |
|----------|-------|--------|
| Project Structure | 95/100 | ✅ Excellent |
| Code Quality | 93/100 | ✅ Excellent |
| Security | 95/100 | ✅ Excellent |
| CI/CD | 92/100 | ✅ Excellent |
| Documentation | 94/100 | ✅ Excellent |
| Dependencies | 85/100 | ⚠️ Good (10 vulns) |
| Performance | 87/100 | ⚠️ Good |
| Configuration | 88/100 | ⚠️ Good |
| Testing | 80/100 | ⚠️ Good (coverage gaps) |

**Top 3 Priorities:**
1. Update security dependencies (10 vulnerabilities)
2. Add E2E tests for contact form
3. Improve test coverage to 70%+

See [AUDIT_REPORT.md](../../AUDIT_REPORT.md) for full details.

---

**Last Updated:** 2025-10-06
**Last Audit:** 2025-10-06
**Review Frequency:** Quarterly
**Next Review:** 2026-01-06
