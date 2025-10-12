# Planned Improvements

**Last Updated**: October 2025
**Status**: Post Phase 1-3 Refactoring Complete

## Recently Completed ✅

### Phase 1-3 Refactoring (Oct 2025)

**Phase 1: Core Infrastructure**

- ✅ Centralized API configuration (`web/src/config/api.ts`)
- ✅ Standardized logging with structured context
- ✅ Shared markdown rendering components
- ✅ FormLabel component for consistent styling

**Phase 2: Form Component Library**

- ✅ FormField component (unified input/textarea)
- ✅ FormActions component (action buttons)
- ✅ FormError component (error display)
- ✅ MarkdownEditor component (with preview)
- ✅ useAsyncSubmit hook (async form handling)
- ✅ Validation utilities with type-safe factory

**Phase 3: API Client Architecture**

- ✅ ApiClient base class (HTTP methods + error handling)
- ✅ ExperienceClient (experience CRUD)
- ✅ BlurbClient (blurb CRUD)
- ✅ Deleted redundant hooks (useExperienceAPI, useBlurbAPI)

**Impact**: ~527 lines of duplication removed, +810 lines of reusable infrastructure

---

## High Priority

### 1. AI Resume Generator Feature

**Status**: Phase 1 Complete ✅ | Phase 2 Detailed Plan Ready

Build AI-powered resume generator using existing experience data.

**Phase 1 Complete** (Oct 2025):

- ✅ Resume generation Cloud Function with OpenAI integration
- ✅ PDF export with Puppeteer (logo + avatar support)
- ✅ Firestore request/response tracking with request/response separation
- ✅ Mock mode for local development (OPENAI_MOCK_MODE=true)
- ✅ Basic web UI with job details form and PDF download
- ✅ Token usage and cost tracking
- ✅ Rate limiting (10 requests per 15 min)
- ✅ Comprehensive API client with 28 passing tests
- ✅ Local Chrome detection for faster development
- ✅ Type-safe end-to-end (TypeScript + Joi validation)

**Phase 2: Feature Completion** (2-3 weeks):

**Phase 2.1: Cover Letter Integration** ✅ COMPLETE (1-2 days)

- ✅ Expose `generateType` parameter in API ("resume" | "coverLetter" | "both")
- ✅ Add UI checkbox for "Generate cover letter"
- ✅ Return both PDFs in single API response
- ✅ Display both download buttons
- ✅ Show separate metrics for each document
- ✅ Implement document length constraints (resume: 2 pages max, cover letter: 1 page max)
- ✅ Update AI prompts to enforce page limits (OpenAI + Gemini)
- ℹ️ Validation/truncation logic not needed - AI prompt constraints are sufficient
- **Note:** Cover letter service already implemented, UI was already integrated in Phase 1

**Phase 2.2: GCS Storage & Document History** (2-3 days)

- [x] Create GCS buckets with environment-aware selection (local/staging/prod)
- [x] Implement lifecycle policy (Coldline after 90 days, never deleted)
- [x] Upload PDFs to GCS with mock mode for local development
- [x] Generate signed URLs for downloads (1hr viewers, 7 days editors)
- [x] Update web UI to download from signed URLs
- [x] Update Firestore schema to store GCS paths and metadata
- [ ] Add `GET /generator/requests` endpoint for document history
- [ ] Create document history table UI (editors only)
- [ ] Implement download tracking in Firestore

**Phase 2.3: Authentication & Editor Features** (3-4 days)

- [ ] Add Firebase Auth (same pattern as experience page)
- [ ] Conditional UI based on auth state (viewer vs editor)
- [ ] Editor tabs: Generate | History | Settings
- [ ] `PUT /generator/defaults` route for editing personal info
- [ ] Higher rate limits for authenticated editors (20 vs 10)
- [ ] Show all generations in history table with filters

**Phase 2.4: Prompt Management** (2-3 days)

- [ ] Create default prompt blurbs in Firestore (4 blurbs)
- [ ] Implement variable substitution in prompts
- [ ] Add "Prompts" tab to editor view
- [ ] Reuse BlurbEditor component from experience page
- [ ] Display available variables documentation
- [ ] Fetch prompts dynamically instead of hardcoded strings

**Phase 2.5: Additional Templates** (2-3 days)

- [ ] Create `resume-traditional.hbs` template
- [ ] Create `resume-technical.hbs` template
- [ ] Create `resume-executive.hbs` template
- [ ] Add style selector dropdown in UI
- [ ] Update PDFService to load templates dynamically
- [ ] Add footer with "Generated using custom AI implementation" link to resume builder
- [ ] Optional: Template preview images

**Phase 2.6: Client Timestamp & Attribution** (1 day)

- [ ] Use client timestamp instead of server timestamp in resume generation
- [ ] Add metadata field to track client-provided generation time
- [ ] Update all PDF templates to include attribution footer
- [ ] Attribution text: "This document was generated using a [custom AI implementation](link to resume builder)"
- [ ] Ensure attribution is visible but unobtrusive in all template styles

**Phase 2.7: Code Quality** (1 day)

- [ ] Extract Chrome detection to `findLocalChrome()` helper (pdf.service.ts)
- [ ] Extract job description builder to `buildJobDescription()` helper (generator.ts)
- [ ] Document service account configuration (experience.ts)

**Phase 2.8: Form State Management** ✅ COMPLETE (1 day)

- ✅ Created React Context provider for resume form state
- ✅ Form state persists during page navigation (within session)
- ✅ Migrated all form fields to context (job info, preferences, generation options)
- ✅ Added "Clear Form" button to reset state
- ✅ NO localStorage persistence (only AI provider preference)
- ✅ Form state resets on browser refresh (acceptable)
- ✅ Type-safe context with TypeScript
- ✅ Clean separation: UI state vs form state

**Benefits Achieved**:

- State persists during navigation within the same session
- Centralized form state management with `useResumeForm()` hook
- Foundation for multi-step form flow
- Clean separation of concerns

**Total Estimated Effort Phase 2**: 14-19 days (~3 weeks)
**Completed**: 3 days (Phase 2.1 + Phase 2.8) ✅
**Remaining**: 11-16 days

**Priority Order**: ~~2.1 (cover letter)~~ ✅ → ~~2.8 (form context)~~ ✅ → **2.3 (auth) NEXT** → 2.2 (storage) → 2.4 (prompts) → 2.5 (templates) → 2.6 (timestamp/attribution) → 2.7 (quality)

**Documentation**: See [generator/](./generator/) for complete details:

- [README.md](./generator/README.md) - Current status, architecture, roadmap, and getting started
- [SCHEMA.md](./generator/SCHEMA.md) - Firestore database schema reference

### 2. Content Upload Improvements

**Status**: Partial (resume upload exists)

Enhance content upload experience:

- ✅ Resume PDF upload (completed)
- ⬜ Show success message instead of page refresh
- ⬜ Upload progress indicators
- ⬜ File preview before upload
- ⬜ Drag-and-drop support

**Estimated Effort**: 1-2 days

### 3. Navigation Menu Improvements

**Status**: Not started

**Problem**: Navigation menu (hamburger menu) is not consistently available across all pages and needs better styling.

**Current Issues**:

- Not all pages have the navigation menu
- Menu styling needs improvement for consistency
- Missing on key pages like resume builder, experience page, etc.

**Implementation**:

- Ensure hamburger menu is present on all pages
- Update menu styling for consistent look and feel
- Verify menu functionality across all routes
- Improve mobile responsiveness
- Add consistent spacing and animations

**Benefits**:

- Better navigation UX across the entire site
- Consistent brand experience
- Improved mobile usability
- Easier access to all sections

**Estimated Effort**: 1-2 days

### 4. Error Boundary Components

**Status**: Not started

Add React error boundaries for graceful error handling:

- Catch component rendering errors
- Display user-friendly error messages
- Log errors to monitoring service
- Provide recovery options

**Estimated Effort**: 3-4 days

---

## Medium Priority

### 5. API Response Caching Context

**Status**: Not started

**Problem**: API clients (ExperienceClient, BlurbClient) currently don't use global context for caching responses. When users navigate away from a page and return, data is refetched unnecessarily.

**Current Behavior**:

- `useExperienceData` hook has local state caching
- Cache is lost on component unmount (navigation)
- Repeated API calls on page revisits

**Proposed Solution**:

- Create global context provider for API response caching
- Cache experience data, blurb data, and other API responses
- Persist cache during session (in-memory, not localStorage)
- Reduce repeated API calls and improve performance

**Implementation**:

- Create `APIResponseCacheContext.tsx` with cache state management
- Implement cache invalidation strategy (TTL, manual invalidation)
- Update API clients to check cache before making requests
- Wrap app with `APIResponseCacheProvider` in `gatsby-browser.js`
- Update hooks (`useExperienceData`, etc.) to use cache context

**Benefits**:

- Reduced API calls (faster page loads, lower costs)
- Improved user experience (instant data display)
- Network efficiency (fewer Cloud Functions invocations)
- Consistent with existing context pattern (see `ResumeFormContext`)

**Estimated Effort**: 2-3 days

### 6. Enhanced Analytics

**Status**: Basic analytics in place

Current: Firebase Analytics with custom events
Needed: Better tracking and insights

**Improvements**:

- Track form completion rates
- Monitor API error rates
- Track user journey through experience page
- Dashboard for admin insights

**Estimated Effort**: 1 week

### 7. Centralized Firebase Initialization

**Status**: Deferred from Phase 3

Consolidate Firebase initialization across:

- useAuth hook
- ContactForm component
- firebase-analytics util
- firebase-app-check util

**Benefits**:

- Single source of truth
- Easier to maintain
- Better error handling

**Estimated Effort**: 3-4 hours

### 8. GCS to NAS Archival Integration

**Status**: Not started

**Problem**: Long-term storage of generated resumes and cover letters for permanent archival.

**Current Setup**:

- GCS bucket `joshwentworth-resumes` with Coldline storage after 90 days
- Files never deleted from GCS, but Coldline has retrieval costs
- Need offline backup to local NAS for true long-term archival

**Proposed Solution**:

- Automated sync from GCS to local NAS storage
- FTP, rsync, or rclone integration
- Scheduled Cloud Function or cron job to sync files
- Keep GCS as hot cache, NAS as cold archival

**Implementation Options**:

1. **Cloud Function + FTP**: Scheduled function to FTP files to NAS
2. **Local rsync**: Periodic local script using gsutil rsync
3. **rclone**: Bidirectional sync between GCS and NAS
4. **GCS Transfer Service**: Might not support local NAS endpoints

**Benefits**:

- True offline backup of all generated documents
- Reduced long-term GCS storage costs
- Local control of archival data
- Disaster recovery option

**Estimated Effort**: 1-2 days

### 9. Improved Loading States

**Status**: Basic loading states exist

Add skeleton screens and better loading UX:

- Skeleton components for experience cards
- Progressive content loading
- Optimistic UI updates
- Loading state animations

**Estimated Effort**: 1 week

---

## Low Priority / Future Enhancements

### 10. Advanced Form Features

**Status**: Optional enhancements

- useFormState hook for complex form state
- useFormValidation hook for advanced validation
- Real-time field validation
- Auto-save drafts

**Estimated Effort**: 1-2 weeks

### 11. Performance Optimizations

**Status**: Ongoing

- Image optimization and lazy loading
- Code splitting for routes
- Service worker caching strategies
- Bundle size analysis and reduction

**Estimated Effort**: Ongoing

### 12. Accessibility Improvements

**Status**: Basic a11y in place

- ARIA labels for all interactive elements
- Keyboard navigation improvements
- Screen reader testing and fixes
- Color contrast improvements

**Estimated Effort**: 1 week

### 13. Testing Enhancements

**Status**: Basic tests in place (91 tests)

- Add component tests for new form components
- API client integration tests
- E2E tests for critical flows
- Visual regression testing

**Estimated Effort**: 2 weeks

---

## Deprecated / Not Needed

### ❌ Additional Hooks Refactoring (Phase 4)

Originally planned as Phase 4, but deemed unnecessary:

- The current architecture is clean and maintainable
- Further abstraction would provide diminishing returns
- Better to focus on new features (AI Resume Generator)

### ❌ Unified API Response Types

Originally planned, but current approach is sufficient:

- Each client has type-safe responses
- Error handling is centralized in ApiClient
- Current pattern is clear and works well

---

## Notes

- **Next Major Feature**: AI Resume Generator (all prerequisites complete)
- **Infrastructure**: Solid foundation for rapid feature development
- **Tech Debt**: Minimal - recent refactoring eliminated most duplication
- **Performance**: Good - Gatsby build ~21s, all tests pass in ~6s

See [ARCHITECTURE.md](./ARCHITECTURE.md) for current system design.
