# Portfolio Migration Plan - Two Parallel Workers

**Date:** October 19, 2025
**Current State:** Aggressive Job Finder cleanup complete
**Goal:** Complete portfolio-only site + prepare for React app integration

---

## Current State Summary

### ✅ Completed Deletions

- **Frontend Job Finder UI:** All pages (`resume-builder`, `experience`, `resume-settings`), components, tabs, modals
- **Auth/Context:** `AuthContext`, `ResumeFormContext`, all auth hooks
- **API Layers:** All client modules (generator, job-queue, experience, blurb, content-items)
- **Backend Functions:** Generator, queue, resume upload, experience/content-items, all services (PDF, AI, storage, queue)
- **Types:** All Job Finder-specific types and interfaces
- **Utilities:** `auth.ts`, `firestore.ts`, `dateFormat.ts`, test files
- **Components:** Theme UI wrappers, UI library (`StatusBadge`, modals, tabs, data grids, feedback components)

### ✅ Remaining Assets

**Frontend (Portfolio-only):**

- Homepage (`index.tsx`, sections, case studies)
- Contact page (`contact.tsx`, `ContactForm.tsx`)
- Legal pages (`privacy.tsx`, `terms.tsx`)
- Basic components (`GlowImage`, `MarkdownContent`, `FormField`, `ErrorBoundary`)
- Gatsby config and build system

**Backend (Contact Form):**

- `functions/contact-form/` directory with complete contact form handler
- Mailgun email service
- Rate limiting and validation
- Template rendering

**Configuration:**

- `firebase.json` with hosting/functions config
- `package.json` files with ALL dependencies (needs cleanup)

---

## Two-Worker Parallel Strategy

### **Worker A: Configuration & Dependency Cleanup**

**Focus:** Remove unused configs, clean dependencies, update documentation

### **Worker B: Contact Form Integration & Testing**

**Focus:** Ensure contact form works standalone, prepare React app placeholder

---

## Worker A Tasks - Configuration & Dependencies

### A1. Clean Frontend Dependencies (High Priority)

**File:** `web/package.json`

**Remove:**

```json
"@jsdubzw/job-finder-shared-types": "latest",
"firebase": "^12.3.0",
"jszip": "^3.10.1",
"react-json-view": "^1.21.3",
"@dnd-kit/core": "^6.3.1",
"@dnd-kit/sortable": "^10.0.0",
"@dnd-kit/utilities": "^3.2.2"
```

**Keep:**

```json
"gatsby": "^5.15.0",
"gatsby-plugin-manifest": "^5.15.0",
"gatsby-plugin-mdx": "^5.15.0",
"gatsby-plugin-theme-ui": "^0.17.2",
"gatsby-source-filesystem": "^5.15.0",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-markdown": "^10.1.0",
"theme-ui": "^0.17.2",
"@emotion/react": "^11.14.0",
"@mdx-js/react": "^3.1.1",
"@react-spring/parallax": "^10.0.3",
"@theme-ui/mdx": "^0.17.2",
"dotenv": "^17.2.3"
```

**Action:**

- Remove Job Finder packages
- Keep all Gatsby/MDX/Theme UI (homepage needs them)
- Test build: `npm run build`

---

### A2. Clean Backend Dependencies (High Priority)

**File:** `functions/package.json`

**Remove (Job Finder AI services):**

```json
"@genkit-ai/ai": "^1.21.0",
"@genkit-ai/core": "^1.21.0",
"@genkit-ai/google-genai": "^1.21.0",
"@genkit-ai/googleai": "^1.21.0",
"@google-cloud/vertexai": "^1.10.0",
"@google/generative-ai": "^0.24.1",
"genkit": "^1.21.0",
"genkitx-openai": "^0.25.0",
"openai": "^6.3.0",
"@sparticuz/chromium": "^141.0.0",
"puppeteer-core": "^24.24.0",
"jszip": (if present)"
```

**Remove (unused Firebase services):**

```json
"firebase-admin": "^13.5.0" (replace with minimal Firestore/Storage only if needed),
"firebase-functions": "^6.4.0" (not using Firebase Functions framework)
```

**Keep (Contact Form essentials):**

```json
"@google-cloud/functions-framework": "^3.4.6",
"@google-cloud/logging": "^11.0.0",
"@google-cloud/secret-manager": "^5.5.0",
"cors": "^2.8.5",
"express-rate-limit": "^8.1.0",
"form-data": "^4.0.4",
"handlebars": "^4.7.8",
"joi": "^17.13.3",
"mailgun.js": "^12.1.0",
"busboy": "^1.6.0",
"typescript": "^5.9.3",
"zod": "^4.1.12"
```

**Action:**

- Remove all AI/PDF/Job Finder packages
- Audit Firestore/Storage usage in contact form (might not even need firebase-admin)
- Test function build: `cd functions && npm run build`

---

### A3. Update Firebase Hosting Config (Medium Priority)

**File:** `firebase.json`

**Remove redirects/rewrites:**

```json
// Remove any /resume-builder, /experience, /resume-settings redirects
// Remove any Cloud Function rewrites for deleted functions
```

**Keep:**

```json
// Contact form rewrite (if using Cloud Functions for contact)
{
  "source": "/api/contact",
  "function": "handleContactForm"
}
```

**Action:**

- Remove all Job Finder routes
- Verify contact form route is correct
- Test: `firebase serve --only hosting`

---

### A4. Update Root Documentation (Low Priority)

**Files to Update:**

- `README.md` - Remove Job Finder references, focus on portfolio + contact
- `CONTEXT.md` - Summarize recent cleanup, note minimal surface
- `PORTFOLIO_INTEGRATION_GUIDE.md` - Archive or delete (no longer relevant)
- `REFACTORING_SUMMARY.md` - Add final cleanup notes

**Action:**

- Update README with new minimal architecture
- Archive obsolete guides in `docs/archive/`

---

### A5. Update Makefiles & Scripts (Low Priority)

**Files:**

- `Makefile` (root)
- `functions/Makefile`
- `scripts/` directory

**Remove:**

- Any Job Finder deployment scripts
- Generator/queue-related scripts
- Resume upload scripts

**Keep:**

- Contact form deployment scripts
- Cache version script
- Emulator setup scripts (if still needed)

**Action:**

- Clean up Makefiles for contact-only deployments
- Remove obsolete scripts from `scripts/`

---

## Worker B Tasks - Contact Form & React Prep

### B1. Verify Contact Form Works (High Priority)

**Files:**

- `web/src/pages/contact.tsx`
- `web/src/components/ContactForm.tsx`
- `functions/contact-form/`

**Tests:**

1. **Frontend build:** Verify contact page renders
2. **Form submission:** Test with emulator or staging
3. **Email delivery:** Confirm Mailgun integration works
4. **Error handling:** Test validation and error states

**Action:**

- Run local dev: `npm run develop`
- Test form submission locally
- Deploy to staging: `npm run deploy:staging`
- Send test email

---

### B2. Remove Dead Imports in Contact Components (High Priority)

**Check for:**

- Firebase Auth imports (no longer needed)
- Job Finder type imports
- Deleted utility imports

**Files to Audit:**

- `web/src/components/ContactForm.tsx`
- `web/src/pages/contact.tsx`
- Any remaining components in `web/src/components/`

**Action:**

- Search for Firebase Auth usage
- Remove `useAuth()` if present
- Ensure form works without auth

---

### B3. Create React App Placeholder (Medium Priority)

**Goal:** Prepare `/app` route for future React application

**Option 1: Simple Redirect (Quickest)**
Create `web/src/pages/app.tsx`:

```tsx
import { navigate } from "gatsby"
import { useEffect } from "react"

const AppRedirect = () => {
  useEffect(() => {
    // Redirect to coming soon page or contact
    void navigate("/contact?ref=app", { replace: true })
  }, [])

  return null
}

export default AppRedirect
```

**Option 2: Coming Soon Page**
Create `web/src/pages/app.tsx`:

```tsx
import { Box, Heading, Text, Button } from "theme-ui"
import { Link } from "gatsby"

const AppPage = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 4,
    }}
  >
    <Box>
      <Heading sx={{ fontSize: [5, 6, 7], mb: 3 }}>Coming Soon</Heading>
      <Text sx={{ fontSize: [2, 3], mb: 4, color: "textMuted" }}>New application in development</Text>
      <Link to="/">
        <Button>← Back to Home</Button>
      </Link>
    </Box>
  </Box>
)

export default AppPage
```

**Action:**

- Create placeholder page
- Test routing: `/app` works
- Plan future React app integration

---

### B4. Test Homepage & Navigation (Medium Priority)

**Verify:**

- Homepage renders correctly
- All links work (no 404s to deleted pages)
- About section link points to `/contact` (already updated)
- Case studies page works
- Legal pages (privacy, terms) render

**Action:**

- Test all navigation paths
- Run Lighthouse audit
- Check console for errors

---

### B5. Run End-to-End Tests (Low Priority)

**Files:** `web/playwright.config.ts`, test files

**Tests:**

- Homepage loads
- Contact form submits
- Navigation works
- No console errors

**Action:**

- Run: `npm run test:e2e`
- Fix any broken tests referencing deleted pages
- Update snapshots if needed

---

## Dependency Tracking

### High Risk Dependencies (Investigate)

These might be leftover from Job Finder but could break contact form:

**Frontend:**

- `firebase` (^12.3.0) - Used for App Check? Remove if not needed
- `@jsdubzw/job-finder-shared-types` - Definitely remove

**Backend:**

- `firebase-admin` (^13.5.0) - Check if contact form uses Firestore
- `firebase-functions` (^6.4.0) - Not needed (using GCP Functions Framework)
- All AI packages (Genkit, OpenAI, Vertex) - Remove
- Puppeteer/Chromium - Remove (PDF generation gone)

---

## Parallel Execution Strategy

### Phase 1: Immediate (Both Workers)

- **Worker A:** Start A1 (frontend deps), A2 (backend deps)
- **Worker B:** Start B1 (test contact form), B2 (audit imports)

### Phase 2: Configuration & Testing (Both Workers)

- **Worker A:** A3 (firebase.json), A4 (docs)
- **Worker B:** B3 (React placeholder), B4 (test navigation)

### Phase 3: Final Validation (Both Workers)

- **Worker A:** A5 (Makefiles/scripts)
- **Worker B:** B5 (E2E tests)

### Phase 4: Merge & Deploy (Coordinated)

- Merge both branches
- Run full build
- Deploy to staging
- Run smoke tests
- Deploy to production

---

## Success Criteria

### Worker A Complete When:

- [x] Frontend `package.json` has no Job Finder deps
- [x] Backend `package.json` has no AI/PDF deps
- [x] `firebase.json` has no deleted function references
- [x] Documentation updated to reflect minimal surface
- [x] All builds pass: `npm run build` (web + functions)

### Worker B Complete When:

- [x] Contact form sends email successfully
- [x] No dead imports in contact components
- [x] `/app` placeholder exists and works
- [x] All navigation tested (no 404s)
- [x] E2E tests pass

### Migration Complete When:

- [x] Both workers finished
- [x] Staging deployment successful
- [x] Smoke tests pass (homepage, contact, legal pages)
- [x] Production deployment successful
- [x] Monitoring shows no errors

---

## Rollback Plan

If either worker encounters blockers:

1. **Worker A:** Revert `package.json` changes, restore previous versions
2. **Worker B:** Keep contact form as-is, skip React placeholder
3. **Both:** Deploy current state to staging for validation

---

## Next Steps After Migration

1. **Monitor Production:** Watch logs for any Firebase/Firestore errors
2. **Analytics Check:** Verify tracking still works
3. **Performance Audit:** Run Lighthouse, check bundle sizes
4. **Plan React App:** Design new `/app` architecture
5. **Celebrate!** 🎉 Clean, minimal portfolio is live

---

## Notes

- **Conservative Approach:** Test each dependency removal carefully
- **Contact Form Critical:** Don't break email functionality
- **Homepage Stable:** Gatsby/MDX/Theme UI must stay intact
- **Future-Ready:** `/app` placeholder prepares for React migration
