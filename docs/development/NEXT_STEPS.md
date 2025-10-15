# Portfolio - Next Steps

**Last Updated**: October 15, 2025

This document lists **prioritized outstanding work** for the portfolio project. All core features are complete and production-ready - these are optional enhancements.

---

## High Priority

### 1. Clean Up Misleading URL Expiry Code

**Status**: Not implemented
**Effort**: 1-2 hours
**Why**: Code claims URLs expire but they don't (buckets are public)

**Context:**
GCS buckets (`joshwentworth-resumes`, `joshwentworth-resumes-staging`) are configured as publicly readable. URLs **never expire** - they're permanent public HTTPS URLs like `https://storage.googleapis.com/BUCKET/PATH`.

**Current Misleading Code:**
- `generator.ts` calculates fake expiry times (7 days for editors, 1 hour for viewers)
- Stores fake `signedUrlExpiry` timestamps in Firestore
- Returns fake `urlExpiresIn: "7 days" or "1 hour"` to clients
- `storage.service.ts` ignores the `expiresInHours` parameter and returns public URLs

**Tasks:**
1. Remove expiry logic from `functions/src/generator.ts`:
   - Remove `expiresInHours` calculation (line 566)
   - Remove `signedUrlExpiry` from Firestore writes (lines 660, 671)
   - Remove `urlExpiresIn` from API responses (line 727)
   - Update `generateSignedUrl()` calls to not pass expiry parameter

2. Update `storage.service.ts`:
   - Rename `generateSignedUrl()` → `generatePublicUrl()`
   - Remove `SignedUrlOptions` interface
   - Update comments to clarify URLs are public and permanent

3. Update Firestore schema:
   - Remove `signedUrlExpiry` field from `generator_history` documents
   - Update existing docs or wait for natural turnover (90 day lifecycle)

4. Update frontend comments/docs mentioning "signed URLs" or "expiry"

---

## Medium Priority

### 2. Resume Template Library

**Status**: Not implemented
**Effort**: 6-8 hours
**Why**: Useful for users applying to similar roles repeatedly

**Use Case:**
Save and reuse common job descriptions and preferences as templates.

**Implementation:**
1. Create Firestore collection: `generator-templates`
   - Fields: name, job details, preferences, userId
   - Security: Users can only read/write their own templates

2. Add API endpoints:
   - `GET /generator/templates` - List user's templates
   - `POST /generator/templates` - Create template
   - `DELETE /generator/templates/:id` - Delete template

3. Add UI in Document Builder:
   - Template dropdown selector
   - "Load Template" button (auto-fills form)
   - "Save as Template" button

---

### 3. Analytics Dashboard (Editor Only)

**Status**: Not implemented
**Effort**: 10-15 hours
**Why**: Useful for monitoring usage and costs

**What to Build:**
- Total generations by day/week/month
- Success rate over time
- Cost analysis (OpenAI vs Gemini usage trends)
- Popular companies/roles
- User engagement (viewer vs editor activity)
- Average generation duration by provider

**Implementation:**
1. Create analytics route: `/resume-builder/analytics` (editor-only)

2. Add API endpoint:
   - `GET /generator/analytics?startDate=...&endDate=...`
   - Query Firestore responses within date range
   - Calculate metrics and group by provider/company

3. Create dashboard component:
   - Metric cards (total generations, success rate, cost)
   - Line chart (generations over time)
   - Pie chart (provider distribution)
   - Bar chart (top companies)
   - CSV export option

4. Use Chart.js or Recharts for visualizations

---

## Low Priority

### 4. Storage Class Background Sync

**Status**: Partially implemented
**Effort**: 2-3 hours
**Why**: Informational only, doesn't affect functionality

**Context:**
- GCS lifecycle policy automatically transitions files to COLDLINE after 90 days
- Firestore `storageClass` field **NOT** updated when transition happens

**Implementation:**
- Create scheduled Cloud Function (daily at 2 AM)
- Query all response documents with files
- Fetch GCS metadata for each file
- Update Firestore if storage class changed
- Display storage class in Document History UI

---

### 5. Enhanced Rate Limiting

**Status**: Current system works well
**Effort**: 30 minutes
**Why**: Marginal benefit

**Proposed Change:**
```typescript
// Use user.uid for authenticated users (tracks across devices)
const identifier = user?.uid || req.body.sessionId || generateSessionId()
```

**Benefits:**
- Rate limit follows authenticated users across devices
- Better tracking for editors

**Drawbacks:**
- Doesn't help viewers (still use session ID)
- Minimal practical benefit

---

## Won't Do (Unless Strong Demand)

### Batch Generation

**Effort**: 15-20 hours
**Why**: Rare use case, can run multiple generations manually

Use case: Generate 10 resumes for 10 jobs at once. Complex implementation for low-frequency need.

---

### LinkedIn Integration

**Effort**: 20-25 hours
**Why**: High maintenance burden, requires LinkedIn API approval

Use case: Auto-populate personal info and experience from LinkedIn. Significant effort with ongoing maintenance costs.

---

### Additional Resume Templates

**Effort**: 20-30 hours (mostly design)
**Why**: Current "modern" template covers 90% of use cases

Proposed templates: Traditional, Technical, Executive, Creative. Intentionally removed in Phase 2.3 to simplify system.

---

## Decision Framework

When deciding whether to implement a feature, ask:

1. **Frequency**: How often will this be used?
2. **Value per use**: How much does it improve the experience?
3. **Workaround**: Can users accomplish this another way?
4. **Maintenance**: How much ongoing work will it create?
5. **Complexity**: What's the risk of bugs or edge cases?

**Examples:**

- **URL Refresh**: ✅ Medium frequency, high value, simple → **Do it**
- **Analytics Dashboard**: ⚠️ Low frequency, medium value, can query Firestore → **Optional**
- **LinkedIn Integration**: ❌ Low frequency, high complexity, high maintenance → **Skip**
- **Batch Generation**: ❌ Very low frequency, can run multiple times manually → **Skip**

---

## Recently Completed ✅

### Frontend Terminology Migration (October 2025)

**Status**: Complete
**Impact**: Eliminated technical debt, consistent naming across frontend and backend

**Implementation:**
- Removed deprecated type aliases `GeneratorDefaults` and `UpdateDefaultsData` from types
- Removed deprecated API methods `getDefaults()` and `updateDefaults()` from generator client
- Updated all React components to use `personalInfo` terminology:
  - `SettingsTab.tsx` - Renamed variables and method calls
  - `AIPromptsTab.tsx` - Renamed variables and method calls
- Updated test files to use new terminology
- All 42 tests passing, linting clean

**Files Modified:**
- `web/src/types/generator.ts` - Removed deprecated type aliases
- `web/src/api/generator-client.ts` - Removed deprecated methods
- `web/src/components/tabs/SettingsTab.tsx` - Updated to use personalInfo
- `web/src/components/tabs/AIPromptsTab.tsx` - Updated to use personalInfo
- `web/src/api/__tests__/generator-client.test.ts` - Updated test expectations

### Job Matches API Refactoring (October 2025)

**Status**: Complete
**Impact**: Eliminated direct Firestore access from frontend, better security and consistency

**Implementation:**
- Added server-side API endpoints in `functions/src/generator.ts`:
  - `GET /generator/job-matches` - List all job matches (editor-only, auth required)
  - `PUT /generator/job-matches/:id` - Update job match (editor-only, auth required)
- Refactored `JobMatchClient` to extend `ApiClient` base class
- Removed all Firestore SDK imports from frontend
- Converted to HTTP-based API calls with proper authentication
- Consistent architecture with other API clients (GeneratorClient, ExperienceClient)

**Benefits:**
- No client-side auth timing issues
- Server-side security enforcement
- Easier debugging with HTTP error codes
- Complete decoupling from Firestore implementation

**Files Modified:**
- `functions/src/generator.ts` - Added job-matches endpoints and validation schema
- `web/src/api/job-match-client.ts` - Refactored to use HTTP instead of Firestore SDK

### Job Match AI Integration (October 2025)

**Status**: Complete
**Impact**: Significantly improves AI-generated resume and cover letter targeting

**Implementation:**
- Added JobMatchData interface with match insights (match score, matched/missing skills, key strengths, recommendations)
- Created fetchJobMatchData() helper to retrieve job match analysis from Firestore
- Enhanced AI prompts (both OpenAI and Gemini) to incorporate job match insights
- Job match data guides SELECTION and EMPHASIS without fabricating information
- When jobMatchId is provided, AI receives:
  - Match score and skill alignment
  - Customization recommendations (skills to emphasize, resume focus areas)
  - Achievement angles and cover letter talking points
  - Keywords to naturally incorporate

**Files Modified:**
- `functions/src/generator.ts` - Added job match data fetching
- `functions/src/types/generator.types.ts` - Added JobMatchData interface
- `functions/src/services/openai.service.ts` - Enhanced prompts with job match insights
- `functions/src/services/gemini.service.ts` - Enhanced prompts with job match insights

### Document Length Control (January 2025)

**Layer 1: Smarter AI Prompts** - Complete
- Resume: 600-750 words, max 3-4 entries, 4 bullets each
- Cover Letter: 250-350 words, casual/conversational tone
- AI actively SELECTS most relevant experiences
- Prioritizes relevance over recency, quality over quantity

### Attribution Footer (January 2025)

- Added footer to resume and cover letter PDFs
- Links to portfolio: "Generated by a custom AI resume builder built by the candidate — joshwentworth.com/resume-builder"
- Turns resume into portfolio piece itself

### Progressive Generation UI (October 2025)

- Real-time step-by-step progress tracking
- Early PDF downloads (download as soon as ready)
- Multi-step API with polling
- Complete end-to-end testing

### Multi-Provider AI (October 2025)

- OpenAI GPT-4o and Google Gemini 2.0 Flash
- Provider selection in UI with cost comparison
- Mock modes for local development
- 96% cost savings with Gemini

---

## System Health

**Current Status**: Production-ready with complete core functionality

**Test Coverage**:
- Web: 42 tests
- Functions: 169 tests
- Total: 211 tests

**Core Features Complete**:
- ✅ Multi-provider AI (OpenAI, Gemini)
- ✅ PDF export with modern templates
- ✅ GCS storage with signed URLs
- ✅ Firebase Auth integration
- ✅ Editor role management
- ✅ Rate limiting
- ✅ Firestore tracking
- ✅ Progressive generation UI
- ✅ Custom AI prompts
- ✅ Image upload (avatar, logo)
- ✅ Document history (editor-only)

---

## Recommended Priorities

**If you have 2 hours:**
1. Clean up misleading URL expiry code (1-2 hours)

**If you have a weekend:**
1. Clean up misleading URL expiry code (1-2 hours)
2. Resume template library (6-8 hours)

**If you have a week:**
1. Clean up misleading URL expiry code (1-2 hours)
2. Resume template library (6-8 hours)
3. Analytics dashboard (10-15 hours)
4. Storage class sync (2-3 hours)

**Otherwise:**
- System is production-ready as-is
- Monitor usage and gather user feedback
- Prioritize based on actual user needs

---

For architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
For development setup, see [SETUP.md](./SETUP.md)

---

**Last Updated**: October 15, 2025
