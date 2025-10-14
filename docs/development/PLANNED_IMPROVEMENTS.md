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

**Status**: ✅ Production-Ready (October 2025)

AI-powered resume and cover letter generator using existing experience data, multi-provider AI, and professional PDF export.

**Core Features Complete** (Oct 2025):

- ✅ Multi-provider AI (OpenAI GPT-4o, Google Gemini 2.0 Flash)
- ✅ Resume and cover letter generation with customizable prompts
- ✅ PDF export with Puppeteer (logo + avatar support, modern template)
- ✅ GCS storage with signed URLs and lifecycle management (90-day COLDLINE transition)
- ✅ Multi-step generation API with real-time progress updates
- ✅ Progressive UI with step-by-step checklist
- ✅ Early PDF downloads (download as soon as ready, not at end)
- ✅ Firebase Authentication integration (viewer vs editor roles)
- ✅ Tabbed interface: Work Experience | Document Builder | AI Prompts | Personal Info | Document History
- ✅ Document history table with filters (editor-only)
- ✅ Personal info management with image uploads (avatar and logo)
- ✅ Custom AI prompts editor (editors can customize via Firestore blurbs)
- ✅ Rate limiting (10 requests/15min viewers, 20/15min editors)
- ✅ Cost tracking and provider comparison UI
- ✅ Mock modes for both AI providers (local development)
- ✅ Type-safe end-to-end (TypeScript + Joi validation)
- ✅ Comprehensive test coverage (211+ tests)

**Outstanding Optional Enhancements** (see [generator/PLAN.md](./generator/PLAN.md)):

- Frontend terminology migration ("defaults" → "personalInfo") - 2-3 hours
- URL refresh endpoint (regenerate signed URLs without re-generation) - 3-4 hours
- Analytics dashboard - 10-15 hours
- Resume template library (save/reuse job descriptions) - 6-8 hours
- Additional PDF templates (traditional, technical, executive) - 20-30 hours
- LinkedIn integration - 20-25 hours

**Documentation**: See [generator/](./generator/) for complete details:

- [PLAN.md](./generator/PLAN.md) - Future enhancement opportunities with priorities
- [README.md](./generator/README.md) - Architecture overview and getting started
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
