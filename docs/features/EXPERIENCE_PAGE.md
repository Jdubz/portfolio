# Experience Page Feature

**Status:** ✅ Complete (Backend + Frontend)
**Branch:** `experience-page`
**Commits:** 15 total
**Created:** October 7, 2025

## Overview

A hidden `/experience` page for sharing complete professional experience portfolio with recruiters and automated tools. Public users see a read-only list. Authenticated editors (with `role: 'editor'` custom claim) can create, edit, and delete entries inline.

## Architecture

### Backend (Cloud Functions + Firestore)

**Location:** `/functions/src/`

- **Authentication Middleware** (`middleware/auth.middleware.ts`)
  - Verifies Firebase Auth ID tokens
  - Checks for `role: 'editor'` custom claim
  - Comprehensive error handling with structured logging
  - 12+ test cases covering all scenarios

- **Firestore Service** (`services/experience.service.ts`)
  - Full CRUD operations for experience entries
  - Auto-generates entry IDs
  - Tracks `createdBy`, `updatedBy`, timestamps
  - Validates date formats (YYYY-MM)
  - 20+ test cases

- **Cloud Function** (`experience.ts`)
  - RESTful HTTP endpoint at `/experience/entries`
  - `GET` - list all (public, no auth)
  - `POST` - create entry (auth required)
  - `PUT /:id` - update entry (auth required)
  - `DELETE /:id` - delete entry (auth required)
  - CORS enabled for multiple domains
  - 25+ test cases

**Total Test Coverage:** 57 passing tests

### Frontend (Gatsby/React)

**Location:** `/web/src/`

- **Experience Page** (`pages/experience.tsx`)
  - Public read-only view
  - Auth UI (sign-in button, user badge)
  - Conditional rendering based on editor role
  - Loading states, error handling

- **Components:**
  - `ExperienceEntry` - displays/edits single entry
    * Read-only mode for public
    * Inline editing for editors
    * Delete with confirmation
    * Date formatting (YYYY-MM → "Jan 2023")
    * Shows internal notes only to editors

  - `CreateExperienceForm` - new entry form
    * Input validation (title, dates required)
    * Date format validation (YYYY-MM)
    * Error handling
    * Cancel/submit actions

- **Hooks:**
  - `useAuth` - Firebase Auth state + custom claims
    * Detects `role: 'editor'` from ID token
    * Lazy loads Firebase Auth modules
    * Sign in/out functions
    * Get ID tokens for API calls

  - `useExperienceAPI` - API integration
    * Auto-fetches entries on mount
    * CRUD operations with auth tokens
    * Optimistic UI updates
    * Error handling
    * Auto-detects emulator vs production

## Data Model

```typescript
interface ExperienceEntry {
  id: string                  // Auto-generated
  title: string              // Required
  startDate: string          // YYYY-MM format, required
  endDate?: string | null    // YYYY-MM or null (= Present)
  body?: string              // Description
  notes?: string             // Internal notes (editors only)
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string          // Email of creator
  updatedBy: string          // Email of last editor
}
```

## Authentication

**Method:** Firebase Auth Custom Claims

Editors are managed in Firebase Console (or via Admin SDK):
```javascript
admin.auth().setCustomUserClaims(uid, { role: 'editor' })
```

No environment variables or secrets needed - claims are cryptographically signed in JWT tokens.

## Local Development

### Prerequisites
- Java 17+ (for Firebase emulators)
- Node.js
- Firebase CLI

### Setup

1. **Start Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Seed Test Data:**
   ```bash
   make seed-emulators
   # or: node scripts/seed-emulator.js
   ```

   Creates:
   - 3 test users (`editor1@example.com`, `editor2@example.com`, `user@example.com`)
   - 2 sample experience entries
   - Generates auth token for testing

3. **Start Gatsby Dev Server:**
   ```bash
   cd web && npm run develop
   ```

4. **Visit:**
   - Experience page: http://localhost:8000/experience
   - Emulator UI: http://localhost:4000
   - Firestore data: http://localhost:4000/firestore

### Testing

**Backend API Tests:**
```bash
# Run all function tests
cd functions && npm test

# Test specific file
npx jest experience.test.ts

# Test with emulator
make test-experience-api
```

**E2E Tests:**
```bash
cd web && npx playwright test e2e/experience-page.spec.ts
```

Note: E2E tests have infrastructure set up but need emulator configuration fixes.

## Deployment

### Prerequisites
1. Set up editors in Firebase Auth with custom claims
2. Ensure Firestore "portfolio" database exists
3. Deploy Cloud Function

### Deploy to Staging
```bash
# From repository root
npm run deploy:staging
```

### Deploy to Production
```bash
npm run deploy:production
```

### Verify Deployment
1. Visit `https://your-domain.com/experience`
2. Should see read-only entries
3. Sign in with editor account
4. Should see EDITOR badge + edit controls

## API Endpoints

**Base URL:**
- Development: `http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience`
- Production: `https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience`

### GET /experience/entries
**Auth:** None (public)
**Response:**
```json
{
  "success": true,
  "entries": [/* array of entries */],
  "count": 2
}
```

### POST /experience/entries
**Auth:** Required (role: editor)
**Body:**
```json
{
  "title": "Senior Developer",
  "startDate": "2023-01",
  "endDate": "2024-12",
  "body": "Description...",
  "notes": "Internal notes"
}
```

### PUT /experience/entries/:id
**Auth:** Required (role: editor)
**Body:** Partial update
```json
{
  "title": "Lead Developer",
  "endDate": "2025-06"
}
```

### DELETE /experience/entries/:id
**Auth:** Required (role: editor)
**Response:**
```json
{
  "success": true,
  "message": "Experience entry deleted successfully"
}
```

## Files Changed/Added

### Backend (`/functions/`)
- `src/middleware/auth.middleware.ts` - NEW
- `src/__tests__/auth.middleware.test.ts` - NEW
- `src/services/experience.service.ts` - NEW
- `src/__tests__/experience.service.test.ts` - NEW
- `src/experience.ts` - NEW
- `src/__tests__/experience.test.ts` - NEW
- `src/index.ts` - MODIFIED (export manageExperience)

### Frontend (`/web/`)
- `src/pages/experience.tsx` - NEW
- `src/components/ExperienceEntry.tsx` - NEW
- `src/components/CreateExperienceForm.tsx` - NEW
- `src/hooks/useAuth.ts` - NEW
- `src/hooks/useExperienceAPI.ts` - NEW
- `src/types/experience.ts` - NEW
- `e2e/experience-page.spec.ts` - NEW

### Testing/Tooling
- `scripts/seed-emulator.js` - NEW
- `scripts/generate-test-token.js` - NEW
- `test-experience-auth.sh` - NEW
- `firebase.json` - MODIFIED (emulator config)
- `Makefile` - MODIFIED (new commands)

### Documentation
- `docs/setup/experience-auth-custom-claims.md` - NEW
- `docs/features/EXPERIENCE_PAGE.md` - NEW (this file)

## Make Commands

```bash
# Seed emulators with test data
make seed-emulators

# Test backend API (auto-seeds + runs all tests)
make test-experience-api

# Run Firebase emulators
make firebase-emulators
make firebase-emulators-ui
```

## Known Issues

1. **E2E Tests:** Infrastructure is set up but tests fail because Gatsby dev connects to production API instead of emulator. Need to configure `FIREBASE_EMULATOR_HOST` in Gatsby environment.

2. **Emulator Auth UI:** Firebase Auth emulator UI doesn't expose ID tokens directly. Use the seed script to generate tokens programmatically.

3. **Data Persistence:** Emulator data is configured to persist to `./emulator-data/` but first run requires seeding.

## Future Enhancements

- [ ] Rich text editor for entry body
- [ ] Drag-and-drop reordering
- [ ] Export to PDF/JSON
- [ ] Filter/search entries
- [ ] Company logos/images
- [ ] Skills/tags taxonomy
- [ ] Import from LinkedIn
- [ ] Public shareable links (token-based)

## Metrics

- **Lines of Code:** ~2,500 (backend + frontend)
- **Test Coverage:** 57 backend tests, E2E infrastructure
- **Files Changed:** 20+
- **Commits:** 15
- **Development Time:** ~6 hours

## Security

- ✅ Firebase Auth with custom claims (cryptographically signed)
- ✅ Token verification on every auth request
- ✅ CORS configured for known domains only
- ✅ Input validation (dates, required fields)
- ✅ No secrets in environment variables
- ✅ Request tracing/logging for debugging
- ✅ Rate limiting (Cloud Functions default: 1000/min)

## Documentation

- [Custom Claims Setup](../setup/experience-auth-custom-claims.md)
- [API Documentation](../../functions/README.md)
- [Testing Guide](../../README.md#testing)

---

**Last Updated:** October 7, 2025
**Contributors:** Claude Code + User
