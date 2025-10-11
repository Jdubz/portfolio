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

**Status**: Phase 1 Complete ✅ | Phase 2 Planned

Build AI-powered resume generator using existing experience data.

**Phase 1 Complete** (Oct 2025):
- ✅ Resume generation Cloud Function with OpenAI integration
- ✅ PDF export with Puppeteer (logo + avatar support)
- ✅ Firestore request/response tracking
- ✅ Mock mode for local development
- ✅ Basic web UI for testing
- ✅ Token usage and cost tracking

**Phase 2 Planned** (Code Quality & Features):

**Code Quality Improvements** (from PR review):
1. Extract Chrome detection logic to separate method in `pdf.service.ts`
   - Current: Complex try-catch blocks inline
   - Proposed: `findLocalChrome()` helper method
   - Benefit: Better readability and testability

2. Extract job description builder to helper function in `generator.ts`
   - Current: Duplicated at lines 272-274 and 319-322
   - Proposed: `buildJobDescription(job)` helper
   - Benefit: DRY principle, easier maintenance

3. Document service account configuration in `experience.ts`
   - Current: Changed from cloud-functions-builder to compute service account
   - Needed: Document why and when to use each account
   - Benefit: Clarity for future deployments

**Feature Enhancements**:
- Cover letter generation
- Multiple resume templates (modern, traditional, technical, executive)
- Resume history/versioning
- Download history tracking
- GCS storage for generated files (currently returns base64)

**Estimated Effort Phase 2**: 1-2 weeks

### 2. Content Upload Improvements

**Status**: Partial (resume upload exists)

Enhance content upload experience:
- ✅ Resume PDF upload (completed)
- ⬜ Show success message instead of page refresh
- ⬜ Upload progress indicators
- ⬜ File preview before upload
- ⬜ Drag-and-drop support

**Estimated Effort**: 1-2 days

### 3. Error Boundary Components

**Status**: Not started

Add React error boundaries for graceful error handling:
- Catch component rendering errors
- Display user-friendly error messages
- Log errors to monitoring service
- Provide recovery options

**Estimated Effort**: 3-4 days

---

## Medium Priority

### 4. Enhanced Analytics

**Status**: Basic analytics in place

Current: Firebase Analytics with custom events
Needed: Better tracking and insights

**Improvements**:
- Track form completion rates
- Monitor API error rates
- Track user journey through experience page
- Dashboard for admin insights

**Estimated Effort**: 1 week

### 5. Centralized Firebase Initialization

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

### 6. Improved Loading States

**Status**: Basic loading states exist

Add skeleton screens and better loading UX:
- Skeleton components for experience cards
- Progressive content loading
- Optimistic UI updates
- Loading state animations

**Estimated Effort**: 1 week

---

## Low Priority / Future Enhancements

### 7. Advanced Form Features

**Status**: Optional enhancements

- useFormState hook for complex form state
- useFormValidation hook for advanced validation
- Real-time field validation
- Auto-save drafts

**Estimated Effort**: 1-2 weeks

### 8. Performance Optimizations

**Status**: Ongoing

- Image optimization and lazy loading
- Code splitting for routes
- Service worker caching strategies
- Bundle size analysis and reduction

**Estimated Effort**: Ongoing

### 9. Accessibility Improvements

**Status**: Basic a11y in place

- ARIA labels for all interactive elements
- Keyboard navigation improvements
- Screen reader testing and fixes
- Color contrast improvements

**Estimated Effort**: 1 week

### 10. Testing Enhancements

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
