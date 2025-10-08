# Experience Page - Feature Implementation

**Status:** 🚧 In Progress
**Started:** 2025-10-07
**Estimated Completion:** 13-17 hours

---

## Overview

A private work experience management page with inline editing capabilities, Firebase authentication, and Cloud Function backend. The page is public for viewing but only editable by authorized users.

---

## Requirements

### Functional Requirements
- **Public Access:** Anyone can view experience entries (read-only)
- **Authenticated Editing:** Only authorized emails can create/edit/delete entries
- **Inline Editing:** Edit mode activated per-card with save/cancel/delete options
- **Chronological Sorting:** Entries sorted by start date (newest first)
- **No Indexing:** Page excluded from search engines and sitemaps

### Authorized Editors
- `contact@joshwentworth.com`
- `jwentwor@gmail.com`

### Field Requirements
- **Title:** Optional for viewing, **mandatory for saving**
- **Start Date:** Optional for viewing, **mandatory for saving**
- **End Date:** Optional (null = "Present")
- **Body:** Optional (Markdown format)
- **Notes:** Optional

---

## Architecture

### 1. Data Schema

**Firestore Collection:** `experience-entries`

```typescript
interface ExperienceEntry {
  id: string                    // Firestore auto-generated
  title: string                 // Required (empty string allowed for drafts, validated on save)
  body?: string                 // Optional, Markdown format
  startDate: string             // Required, "YYYY-MM" format
  endDate?: string | null       // Optional, "YYYY-MM" format or null (= Present)
  notes?: string                // Optional, additional context
  createdAt: Timestamp          // Auto-managed server timestamp
  updatedAt: Timestamp          // Auto-managed server timestamp
  createdBy: string             // Email of creator
  updatedBy: string             // Email of last editor
}
```

**Validation Rules:**
```typescript
// Create/Update validation
const experienceSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  body: Joi.string().trim().max(10000).optional().allow(''),
  startDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).required(),
  endDate: Joi.string().pattern(/^\d{4}-(0[1-9]|1[0-2])$/).optional().allow('').allow(null),
  notes: Joi.string().trim().max(2000).optional().allow(''),
})
```

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /experience-entries/{entryId} {
      // Public read access
      allow read: if true;

      // Write access only for verified authorized editors
      allow create, update, delete: if request.auth != null
        && request.auth.token.email_verified == true
        && (request.auth.token.email == 'contact@joshwentworth.com'
            || request.auth.token.email == 'jwentwor@gmail.com');
    }
  }
}
```

### 2. Cloud Functions

**Middleware:** `functions/src/middleware/auth.middleware.ts`

```typescript
// Authorized editors list
const AUTHORIZED_EDITORS = [
  'contact@joshwentworth.com',
  'jwentwor@gmail.com',
]

export const verifyAuthenticatedEditor = async (req, res, next) => {
  // 1. Extract Firebase ID token from Authorization header
  // 2. Verify token with Firebase Admin SDK
  // 3. Verify email is in AUTHORIZED_EDITORS
  // 4. Verify email is verified
  // 5. Attach user info to req.user
  // 6. Comprehensive error handling with error codes
}
```

**Function:** `functions/src/experience.ts`

```typescript
// HTTP endpoints for experience management
export const manageExperience = https.onRequest({
  region: "us-central1",
  memory: "256MiB",
  maxInstances: 10,
  timeoutSeconds: 60,
}, handler)

// Routes:
// GET    /experience/entries      - List all entries (public)
// POST   /experience/entries      - Create entry (auth required)
// PUT    /experience/entries/:id  - Update entry (auth required)
// DELETE /experience/entries/:id  - Delete entry (auth required)
```

**Error Codes:**
```typescript
const ERROR_CODES = {
  // Auth errors (401)
  UNAUTHORIZED: {
    code: "EXP_AUTH_001",
    status: 401,
    message: "Authentication required"
  },
  INVALID_TOKEN: {
    code: "EXP_AUTH_002",
    status: 401,
    message: "Invalid authentication token"
  },
  TOKEN_EXPIRED: {
    code: "EXP_AUTH_003",
    status: 401,
    message: "Authentication token expired"
  },

  // Permission errors (403)
  FORBIDDEN: {
    code: "EXP_AUTH_004",
    status: 403,
    message: "Access denied - unauthorized email"
  },
  EMAIL_NOT_VERIFIED: {
    code: "EXP_AUTH_005",
    status: 403,
    message: "Email address not verified"
  },

  // Client errors (400, 404)
  VALIDATION_FAILED: {
    code: "EXP_VAL_001",
    status: 400,
    message: "Validation failed"
  },
  INVALID_DATE: {
    code: "EXP_VAL_002",
    status: 400,
    message: "Invalid date format (expected YYYY-MM)"
  },
  MISSING_TITLE: {
    code: "EXP_VAL_003",
    status: 400,
    message: "Title is required"
  },
  MISSING_START_DATE: {
    code: "EXP_VAL_004",
    status: 400,
    message: "Start date is required"
  },
  NOT_FOUND: {
    code: "EXP_REQ_001",
    status: 404,
    message: "Experience entry not found"
  },
  METHOD_NOT_ALLOWED: {
    code: "EXP_REQ_002",
    status: 405,
    message: "Method not allowed"
  },

  // Server errors (5xx)
  FIRESTORE_ERROR: {
    code: "EXP_DB_001",
    status: 503,
    message: "Database error"
  },
  INTERNAL_ERROR: {
    code: "EXP_SYS_001",
    status: 500,
    message: "Internal server error"
  },
}
```

### 3. Frontend Architecture

**Page Route:** `/experience/`

**Component Structure:**
```
web/src/pages/experience.tsx                    // Main page component

web/src/components/experience/
├── ExperienceList.tsx                          // Container, manages state
├── ExperienceCard.tsx                          // Card with view/edit toggle
├── ExperienceCardView.tsx                      // Read-only display
├── ExperienceCardEdit.tsx                      // Edit form with validation
├── ExperienceAuthBadge.tsx                     // Auth status badge + modal
├── AddExperienceButton.tsx                     // Floating "+" button
└── DeleteConfirmModal.tsx                      // Confirmation dialog

web/src/services/
├── experience.service.ts                       // API calls to Cloud Function
└── auth.service.ts                            // Firebase Auth utilities
```

**Auth Flow:**
1. Page loads → Check Firebase auth state
2. If authenticated AND email in authorized list → Show "Editor" badge
3. If not authenticated → Show "Viewer" badge
4. Click badge → Open Firebase Google Sign-In modal
5. After auth → Update badge, enable edit mode UI

**Edit Flow:**
1. Editor clicks "Edit" on card
2. Card switches to edit mode (inline form)
3. User modifies fields
4. User clicks "Save":
   - Validate title (required)
   - Validate startDate (required, YYYY-MM format)
   - Call Cloud Function with auth token
   - On success → Update local state, switch to view mode
   - On error → Show error message, stay in edit mode
5. User clicks "Cancel":
   - Revert all changes to original values
   - Switch to view mode
6. User clicks "Delete":
   - Show confirmation modal
   - On confirm → Call Cloud Function DELETE endpoint
   - On success → Remove from list
   - On cancel → Close modal, stay in edit mode

### 4. UI/UX Design

**Layout (Simple, Clean):**
```
┌─────────────────────────────────────────────────────────┐
│  Experience                      [👁️ Viewer] [Sign In] │ ← Header
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Title                          Jan 2020 - Present │ │ ← Card (View)
│  │                                                     │ │
│  │  Body text rendered as markdown...                 │ │
│  │                                                     │ │
│  │  Notes: Additional context here                    │ │
│  │                                        [Edit]       │ │ ← Edit button (auth only)
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Title: [___________________________]              │ │ ← Card (Edit)
│  │  Start: [Jan 2020 ▼]  End: [Dec 2022 ▼]          │ │
│  │  Body:                                             │ │
│  │  [_________________________________________]       │ │
│  │  [_________________________________________]       │ │
│  │  Notes: [_________________________________]        │ │
│  │                                                     │ │
│  │  [Save]  [Cancel]  [Delete]                        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                                              [+]        │ ← Floating add button
└─────────────────────────────────────────────────────────┘
```

**Theme:**
- **Background:** `#141821` (dark, matches site)
- **Cards:** `background: rgba(255,255,255,0.05)`, subtle border
- **Text:** White/gray palette
- **Max Width:** 800px (centered)
- **Buttons:** Match ContactForm primary button style
- **Inputs:** Match ContactForm input styling
- **Font:** Inherit from site theme

**Date Display Format:**
- "Jan 2020 - Present" (endDate is null)
- "Jan 2020 - Dec 2022" (endDate provided)
- Hide date section if both dates missing

### 5. SEO Configuration

**Page Meta:**
```html
<meta name="robots" content="noindex, nofollow" />
```

**Sitemap Exclusion:**
Add to `gatsby-config.ts`:
```typescript
{
  resolve: `gatsby-plugin-sitemap`,
  options: {
    excludes: ['/experience/', '/experience/**'],
  },
}
```

**robots.txt:**
```
User-agent: *
Disallow: /experience/
```

---

## Implementation Plan

### ✅ Phase 1: Backend Foundation (3-4 hours)

#### Task 1.1: Auth Middleware
**File:** `functions/src/middleware/auth.middleware.ts`

- [ ] Create auth middleware function
- [ ] Extract Firebase ID token from `Authorization: Bearer <token>` header
- [ ] Verify token using Firebase Admin SDK
- [ ] Check email against `AUTHORIZED_EDITORS` array
- [ ] Verify `email_verified === true`
- [ ] Attach user info to `req.user` (email, uid)
- [ ] Error handling with proper error codes
- [ ] Logging with requestId
- [ ] Unit tests

#### Task 1.2: Experience Cloud Function
**File:** `functions/src/experience.ts`

- [ ] Create main handler function
- [ ] Implement CORS (same as contact form)
- [ ] Implement routing (GET, POST, PUT, DELETE)
- [ ] Apply auth middleware to protected routes
- [ ] Create Joi validation schema with:
  - `title`: required, 1-200 chars
  - `startDate`: required, YYYY-MM format
  - `endDate`: optional, YYYY-MM format or null
  - `body`: optional, max 10000 chars
  - `notes`: optional, max 2000 chars
- [ ] Implement GET /experience/entries (public, no auth)
- [ ] Implement POST /experience/entries (auth required)
- [ ] Implement PUT /experience/entries/:id (auth required)
- [ ] Implement DELETE /experience/entries/:id (auth required)
- [ ] Add comprehensive error handling
- [ ] Add request logging with trace IDs
- [ ] Unit tests

#### Task 1.3: Firestore Service
**File:** `functions/src/services/experience.service.ts`

- [ ] Create ExperienceService class
- [ ] Implement `listEntries()` - fetch all, sorted by startDate desc
- [ ] Implement `createEntry(data, userEmail)` - add createdBy/createdAt
- [ ] Implement `updateEntry(id, data, userEmail)` - update updatedBy/updatedAt
- [ ] Implement `deleteEntry(id)` - soft delete or hard delete
- [ ] Error handling
- [ ] Unit tests

#### Task 1.4: Deploy Backend
- [ ] Update Firestore security rules
- [ ] Add function secrets config (if needed)
- [ ] Deploy function: `firebase deploy --only functions:manageExperience`
- [ ] Test all endpoints with Postman/curl
- [ ] Verify auth enforcement
- [ ] Verify validation errors

---

### ⬜ Phase 2: Frontend Auth (2 hours)

#### Task 2.1: Auth Service
**File:** `web/src/services/auth.service.ts`

- [ ] Initialize Firebase Auth
- [ ] Create `initAuth()` - set up onAuthStateChanged listener
- [ ] Create `isAuthorizedEditor(email)` - check against editor list
- [ ] Create `signInWithGoogle()` - trigger Google Sign-In popup
- [ ] Create `signOut()` - sign out user
- [ ] Create `getCurrentUser()` - get current user info
- [ ] Export auth state hooks

#### Task 2.2: Auth Badge Component
**File:** `web/src/components/experience/ExperienceAuthBadge.tsx`

- [ ] Create badge component
- [ ] Show "👁️ Viewer" when not authenticated
- [ ] Show "✏️ Editor" when authenticated as authorized user
- [ ] Click badge → open Google Sign-In modal
- [ ] Show "Sign Out" button when authenticated
- [ ] Style to match theme (top-right corner)

---

### ⬜ Phase 3: Read-Only View (2-3 hours)

#### Task 3.1: Experience Page
**File:** `web/src/pages/experience.tsx`

- [ ] Create page component
- [ ] Add SEO meta tags (noindex, nofollow)
- [ ] Add page title "Experience"
- [ ] Render ExperienceList component
- [ ] Render ExperienceAuthBadge
- [ ] Simple layout (max 800px centered)

#### Task 3.2: Experience Service
**File:** `web/src/services/experience.service.ts`

- [ ] Create API client for Cloud Function
- [ ] Implement `fetchEntries()` - GET /experience/entries
- [ ] Implement `createEntry(data, token)` - POST with auth
- [ ] Implement `updateEntry(id, data, token)` - PUT with auth
- [ ] Implement `deleteEntry(id, token)` - DELETE with auth
- [ ] Error handling and parsing
- [ ] Add loading states

#### Task 3.3: Experience List
**File:** `web/src/components/experience/ExperienceList.tsx`

- [ ] Fetch entries on mount
- [ ] Sort by startDate (newest first)
- [ ] Render list of ExperienceCard components
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Handle empty state ("No entries yet")

#### Task 3.4: Experience Card (View Mode)
**File:** `web/src/components/experience/ExperienceCardView.tsx`

- [ ] Display title (if exists)
- [ ] Display date range (formatted)
- [ ] Render markdown body (use react-markdown)
- [ ] Display notes (if exists)
- [ ] Hide empty fields
- [ ] Style card to match theme
- [ ] Show "Edit" button if user is authorized editor

---

### ⬜ Phase 4: Edit Mode (3-4 hours)

#### Task 4.1: Experience Card Edit Form
**File:** `web/src/components/experience/ExperienceCardEdit.tsx`

- [ ] Create form with controlled inputs
- [ ] Title input (required, show error if empty on save)
- [ ] Start date picker (required, YYYY-MM format)
- [ ] End date picker (optional, YYYY-MM format, checkbox for "Present")
- [ ] Body textarea (markdown)
- [ ] Notes textarea
- [ ] Client-side validation
- [ ] Save button (disabled if invalid)
- [ ] Cancel button
- [ ] Delete button
- [ ] Loading state during save
- [ ] Error messages

#### Task 4.2: Experience Card Container
**File:** `web/src/components/experience/ExperienceCard.tsx`

- [ ] Manage view/edit state
- [ ] Toggle between ExperienceCardView and ExperienceCardEdit
- [ ] Handle save → call API → update parent state
- [ ] Handle cancel → revert to original data
- [ ] Handle delete → show confirmation modal
- [ ] Pass auth token to API calls

---

### ⬜ Phase 5: Add/Delete (2 hours)

#### Task 5.1: Add Experience Button
**File:** `web/src/components/experience/AddExperienceButton.tsx`

- [ ] Floating "+" button (bottom-right)
- [ ] Only visible to authorized editors
- [ ] Click → create empty entry in Firestore
- [ ] Immediately open new entry in edit mode
- [ ] Handle errors

#### Task 5.2: Delete Confirmation Modal
**File:** `web/src/components/experience/DeleteConfirmModal.tsx`

- [ ] Modal dialog
- [ ] Show entry title (or "this entry")
- [ ] "Are you sure?" message
- [ ] Confirm button → call delete API
- [ ] Cancel button → close modal
- [ ] Loading state during delete

---

### ⬜ Phase 6: Polish & Security (1-2 hours)

#### Task 6.1: SEO Configuration
- [ ] Update `gatsby-config.ts` sitemap exclusion
- [ ] Add/update `static/robots.txt`
- [ ] Verify meta tags in page

#### Task 6.2: Error Handling & UX
- [ ] Add toast notifications for errors
- [ ] Add loading spinners
- [ ] Add optimistic UI updates
- [ ] Handle offline state gracefully

#### Task 6.3: Testing & Security Audit
- [ ] Test all CRUD operations
- [ ] Test auth flow (sign in, sign out)
- [ ] Test unauthorized access attempts
- [ ] Test validation errors
- [ ] Test with both authorized emails
- [ ] Verify Firestore security rules
- [ ] Verify Cloud Function auth enforcement
- [ ] Check for XSS vulnerabilities (markdown rendering)
- [ ] Verify date validation

#### Task 6.4: Documentation
- [ ] Update this doc with final architecture
- [ ] Add API documentation
- [ ] Add deployment instructions
- [ ] Add troubleshooting guide

---

## API Reference

### Endpoints

#### `GET /experience/entries`
**Description:** Fetch all experience entries (public)
**Auth:** None required
**Response:**
```json
{
  "success": true,
  "entries": [
    {
      "id": "abc123",
      "title": "Senior Engineer",
      "body": "Description...",
      "startDate": "2020-01",
      "endDate": null,
      "notes": "Remote position",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "createdBy": "contact@joshwentworth.com",
      "updatedBy": "contact@joshwentworth.com"
    }
  ]
}
```

#### `POST /experience/entries`
**Description:** Create new experience entry
**Auth:** Required (Bearer token)
**Request:**
```json
{
  "title": "Senior Engineer",
  "body": "Description...",
  "startDate": "2020-01",
  "endDate": null,
  "notes": "Remote position"
}
```
**Response:**
```json
{
  "success": true,
  "entry": { /* full entry object */ },
  "requestId": "req_123"
}
```

#### `PUT /experience/entries/:id`
**Description:** Update existing entry
**Auth:** Required (Bearer token)
**Request:** Same as POST
**Response:** Same as POST

#### `DELETE /experience/entries/:id`
**Description:** Delete entry
**Auth:** Required (Bearer token)
**Response:**
```json
{
  "success": true,
  "message": "Entry deleted successfully",
  "requestId": "req_123"
}
```

---

## Security Considerations

### Authentication
- Firebase ID tokens used for auth
- Tokens verified server-side via Firebase Admin SDK
- Email must be in `AUTHORIZED_EDITORS` list
- Email must be verified (`email_verified === true`)

### Authorization
- Firestore security rules enforce write restrictions
- Cloud Function middleware double-checks authorization
- Client-side checks for UI (not relied upon for security)

### Data Validation
- Server-side validation with Joi
- Title and startDate required for save operations
- Date format strictly validated (YYYY-MM)
- Field length limits enforced

### XSS Prevention
- Markdown rendered with `react-markdown` (safe by default)
- User input sanitized before storage
- No `dangerouslySetInnerHTML` used

### Rate Limiting
- Consider adding rate limiting to Cloud Function (future enhancement)

---

## Deployment

### Backend
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Cloud Function
firebase deploy --only functions:manageExperience
```

### Frontend
```bash
# Build and deploy to staging
npm run build:web
firebase deploy --only hosting:staging

# Deploy to production
firebase deploy --only hosting:production
```

---

## Testing Checklist

### Backend
- [ ] GET /experience/entries returns sorted list
- [ ] POST creates entry with valid data
- [ ] POST rejects missing title
- [ ] POST rejects missing startDate
- [ ] POST rejects invalid date format
- [ ] PUT updates entry successfully
- [ ] PUT enforces same validation as POST
- [ ] DELETE removes entry
- [ ] All protected endpoints reject unauthenticated requests
- [ ] All protected endpoints reject unauthorized emails
- [ ] Error codes are consistent and descriptive

### Frontend
- [ ] Page loads and displays entries
- [ ] Entries sorted by startDate (newest first)
- [ ] Auth badge shows "Viewer" when not logged in
- [ ] Sign in flow works correctly
- [ ] Auth badge shows "Editor" when logged in as authorized user
- [ ] Edit button only visible to editors
- [ ] Edit mode activates on click
- [ ] Form validation works (title, startDate required)
- [ ] Save updates entry and switches to view mode
- [ ] Cancel reverts changes and switches to view mode
- [ ] Delete shows confirmation modal
- [ ] Delete removes entry from list
- [ ] Add button creates new entry in edit mode
- [ ] Markdown renders correctly
- [ ] Date formatting is correct
- [ ] Page is excluded from search engines
- [ ] Layout matches site theme

---

## Future Enhancements

- [ ] Add rich text editor for markdown body
- [ ] Add tags/categories for filtering
- [ ] Add search functionality
- [ ] Add export to PDF/Resume format
- [ ] Add analytics tracking
- [ ] Add rate limiting to Cloud Function
- [ ] Add optimistic UI updates
- [ ] Add drag-to-reorder functionality
- [ ] Add company logos/images

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2025-10-07 | Claude Code | Initial document created |
| | | |
