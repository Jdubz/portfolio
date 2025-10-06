# Portfolio Improvement Plan

**Created:** October 6, 2025
**Based on:** Comprehensive Project Audit (see [AUDIT_REPORT.md](../AUDIT_REPORT.md))
**Overall Project Health:** A- (90/100)

---

## Executive Summary

This improvement plan prioritizes actionable enhancements based on the comprehensive audit. The project is **production-ready** with professional engineering practices. Focus areas: dependencies, testing, and performance optimization.

---

## Priority Matrix

### 🔴 Critical (Week 1) - Production Impact

#### 1. ✅ **COMPLETED: Fix CSP Blocking Firebase Services**
- **Issue:** Content Security Policy blocking App Check and reCAPTCHA
- **Impact:** Contact form broken in production (401 errors)
- **Resolution:** Added missing endpoints to CSP
  - `https://content-firebaseappcheck.googleapis.com`
  - `https://www.google.com` (for reCAPTCHA)
- **Status:** Fixed and deployed

#### 2. **Update Security Dependencies**
- **Effort:** 2-3 hours
- **Impact:** High - 10 vulnerabilities (3 moderate, 7 low)
- **Action:**
  ```bash
  npm audit fix
  npm update --workspaces
  npm test  # Verify nothing breaks
  ```
- **Risk:** Low - mostly dev dependencies

#### 3. **Verify Production Deployment**
- **Effort:** 30 minutes
- **Impact:** High - ensure contact form works
- **Action:**
  - Test contact form on www.joshwentworth.com
  - Verify App Check token generation
  - Test email delivery
  - Check console for errors

---

### 🟠 Important (Weeks 2-3) - Quality & Reliability

#### 4. **Add E2E Tests for Contact Form**
- **Effort:** 4-6 hours
- **Impact:** High - critical user journey
- **Action:**
  ```typescript
  // web/e2e/contact-form.spec.ts
  import { test, expect } from '@playwright/test'

  test('contact form submission', async ({ page }) => {
    await page.goto('/contact')
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="message"]', 'Test message')
    await page.click('button[type="submit"]')
    await expect(page.locator('.success-message')).toBeVisible()
  })

  test('contact form validation', async ({ page }) => {
    await page.goto('/contact')
    await page.click('button[type="submit"]')
    await expect(page.locator('.error-message')).toBeVisible()
  })
  ```

#### 5. **Improve Test Coverage to 70%+**
- **Current:** ~50% web, ~65% functions
- **Target:** 70% overall
- **Effort:** 6-8 hours
- **Focus Areas:**
  - ContactForm edge cases (network errors, timeout)
  - Error boundaries
  - Firebase initialization
  - Analytics tracking

#### 6. **Add Lighthouse CI to PR Pipeline**
- **Effort:** 2 hours
- **Impact:** Medium - prevent performance regressions
- **Action:**
  ```yaml
  # .github/workflows/lighthouse-ci.yml
  - name: Run Lighthouse CI
    uses: treosh/lighthouse-ci-action@v9
    with:
      urls: |
        http://localhost:9000
        http://localhost:9000/contact
      configPath: './lighthouserc.json'
      uploadArtifacts: true
      temporaryPublicStorage: true
  ```

---

### 🟡 Enhancement (Weeks 3-4) - Performance & DX

#### 7. **Bundle Size Optimization**
- **Current:** ~600KB JS (uncompressed)
- **Target:** <500KB JS
- **Effort:** 4-6 hours
- **Actions:**
  1. **Lazy Load Firebase** (~200KB savings)
     ```typescript
     // Only load Firebase on contact page
     const Firebase = lazy(() => import('./firebase'))
     ```
  2. **Route-based Code Splitting**
     ```typescript
     const Contact = lazy(() => import('./pages/contact'))
     ```
  3. **Optimize Images**
     - Convert to WebP
     - Add responsive sizes

#### 8. **Add Environment Variable Validation**
- **Effort:** 2 hours
- **Impact:** Medium - fail fast on misconfiguration
- **Action:**
  ```typescript
  // web/src/config/env-validation.ts
  import Joi from 'joi'

  const schema = Joi.object({
    GATSBY_CONTACT_FUNCTION_URL: Joi.string().uri().required(),
    GATSBY_FIREBASE_API_KEY: Joi.string().required(),
    GATSBY_APP_CHECK_KEY: Joi.string().required(),
    // ... other vars
  })

  const { error } = schema.validate(process.env)
  if (error) throw new Error(`Config validation: ${error.message}`)
  ```

#### 9. **Create Architecture Documentation**
- **Effort:** 3-4 hours
- **Impact:** Medium - improve maintainability
- **Files to Create:**
  - `docs/architecture/system-overview.md`
  - `docs/architecture/data-flow.md`
  - `docs/architecture/decision-records/`
  - Mermaid diagrams for visualizations

#### 10. **Add Bundle Size Tracking**
- **Effort:** 2 hours
- **Impact:** Low-Medium - visibility into size changes
- **Action:**
  ```yaml
  # .github/workflows/bundle-size.yml
  - name: Analyze bundle
    uses: andresz1/size-limit-action@v1
    with:
      github_token: ${{ secrets.GITHUB_TOKEN }}
  ```

---

### 🔵 Nice-to-Have (Month 2+) - Polish & Monitoring

#### 11. **Replace console.log with Structured Logging**
- **Effort:** 3-4 hours
- **Libraries:** winston (functions), @firebase/logger (web)
- **Benefits:** Better filtering, correlation, cloud logging

#### 12. **Add Deployment Notifications**
- **Effort:** 1-2 hours
- **Integrations:** Slack, Discord, or email
- **Action:**
  ```yaml
  - name: Notify deployment
    uses: 8398a7/action-slack@v3
    with:
      status: ${{ job.status }}
      text: 'Deployed to production'
  ```

#### 13. **Implement Request/Response Caching**
- **Effort:** 2-3 hours
- **Targets:**
  - Firebase hosting headers
  - CDN caching for static assets
  - Firestore caching strategies

#### 14. **Add Performance Monitoring**
- **Effort:** 2-3 hours
- **Tools:** Firebase Performance Monitoring
- **Metrics:** FCP, LCP, CLS, custom traces

---

## Audit Findings - Fixed Issues

### ✅ Completed This Session

1. **CSP Blocking Firebase Services** - Added App Check and reCAPTCHA endpoints
2. **Font Loading Errors** - Switched to Bunny Fonts CDN
3. **Versioning System** - Updated to 1.8.1, enabled semantic commits
4. **Contact Form CORS** - Fixed Makefile and redeployed
5. **Contact Form Timeout** - Added 30s timeout with AbortController
6. **Contact Form Error Handling** - User-friendly messages, trace IDs
7. **GitHub Actions Permissions** - Added Cloud Run permissions
8. **Deployment Tests** - Fixed to respect App Check security

---

## Implementation Timeline

### Week 1: Critical Fixes ✅
- [x] Fix CSP blocking Firebase
- [ ] Update security dependencies
- [ ] Verify production deployment

### Week 2: Testing
- [ ] Add E2E tests for contact form
- [ ] Improve unit test coverage
- [ ] Add Lighthouse CI to PR pipeline

### Week 3: Performance
- [ ] Lazy load Firebase
- [ ] Route-based code splitting
- [ ] Add bundle size tracking

### Week 4: Documentation & DX
- [ ] Create architecture docs
- [ ] Add environment validation
- [ ] Structured logging

### Month 2: Polish
- [ ] Deployment notifications
- [ ] Performance monitoring
- [ ] CDN caching optimization

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Test Coverage | 50-65% | 70%+ | Week 2 |
| Bundle Size | ~600KB | <500KB | Week 3 |
| Lighthouse Score | 95+ | 98+ | Week 2 |
| Security Vulns | 10 | 0 | Week 1 |
| Build Time | ~2min | <90s | Week 3 |
| Deploy Time | ~4min | <3min | Week 4 |

---

## Resources

- **Audit Report:** [AUDIT_REPORT.md](../AUDIT_REPORT.md)
- **GitHub Issues:** Track progress via issues
- **CI/CD Workflows:** `.github/workflows/`
- **Documentation:** `docs/` directory

---

## Notes

- All timeline estimates are for a single developer
- Priorities may shift based on production issues
- Items can be parallelized with multiple contributors
- Regular reassessment recommended (monthly)

---

**Last Updated:** October 6, 2025
**Next Review:** November 6, 2025
