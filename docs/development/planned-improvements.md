# Planned Improvements

This document tracks future enhancements, optimizations, and technical debt that should be addressed.

## 🎯 High Priority

### Analytics Enhancements
- [ ] Add cookie consent banner for GDPR compliance
- [ ] Implement user consent management for analytics tracking
- [ ] Create custom Analytics events for:
  - Project card views (viewport intersection observer)
  - Resume downloads
  - Social media link clicks
  - Section navigation

### Performance Optimization
- [ ] Implement code splitting for better initial load
- [ ] Add service worker for offline support
- [ ] Optimize background icon SVG rendering
- [ ] Review and optimize bundle size (current Lighthouse recommendations)

### Contact Form
- [ ] Add form validation feedback animations
- [ ] Implement progressive form submission states
- [ ] Add email verification for double opt-in
- [ ] Create admin dashboard for viewing submissions (Firestore)

## 🔧 Medium Priority

### Testing
- [ ] Increase test coverage to 80%+
- [ ] Add E2E tests using Playwright
- [ ] Add visual regression testing for component screenshots
- [ ] Test Firebase Analytics event tracking

### Documentation
- [ ] Create architecture diagrams for system overview
- [ ] Add video walkthrough of local development setup
- [ ] Document theme customization guide
- [ ] Create troubleshooting FAQ

### Developer Experience
- [ ] Add pre-commit hooks for automated formatting
- [ ] Create Storybook for component development
- [ ] Improve error messages in Cloud Functions
- [ ] Add TypeScript strict mode gradually

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
- [ ] Add automated Lighthouse CI checks to PRs
- [ ] Create backup strategy for Firestore data

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

**Last Updated:** 2025-10-06
**Review Frequency:** Quarterly
