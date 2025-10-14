# Portfolio - Next Steps

**Last Updated**: January 2025

This document lists **prioritized outstanding work** for the portfolio project. All core features are complete and production-ready - these are optional enhancements.

---

## High Priority

### 1. Frontend Terminology Migration

**Status**: Backend complete, frontend partially complete
**Effort**: 2-3 hours
**Why**: Technical debt cleanup, backend already migrated

**Context:**
Backend uses "personalInfo" terminology but frontend still uses "defaults" in some places.

**Tasks:**
1. Update frontend types (`web/src/types/generator.ts`):
   - Rename `GeneratorDefaults` → `PersonalInfo`
   - Rename `UpdateDefaultsData` → `UpdatePersonalInfoData`

2. Update API client (`web/src/api/generator-client.ts`):
   - Remove deprecated method aliases: `getDefaults()`, `updateDefaults()`

3. Update components:
   - Search for usages: `rg "getDefaults|updateDefaults|GeneratorDefaults" web/src/`
   - Update state variable names from `defaults` to `personalInfo`

4. Test thoroughly:
   ```bash
   npm run test:web
   npm run lint:web
   npm run build:web
   ```

**Note:** Firestore migration already complete (all environments).

---

## Medium Priority

### 2. URL Expiry Handling

**Status**: Not implemented
**Effort**: 3-4 hours
**Why**: Quality of life improvement for users

**Current Behavior:**
- Signed URLs expire after 1 hour (viewers) or 7 days (editors)
- Users must re-generate document if URL expired
- No warning before expiry

**Proposed Enhancement:**
- Display expiry time in Document History
- Show warning badge when URL expires soon
- Add "Refresh URL" button to regenerate signed URL without re-generating document

**Implementation:**
1. Create endpoint: `POST /generator/requests/:id/refresh-url`
   - Regenerate signed URLs with fresh expiry
   - Update response document in Firestore
   - Return new URLs

2. Update Document History UI:
   - Show expiry timestamp
   - Add warning badges (expired, expires soon)
   - Add refresh button for expired URLs

3. Add API client method:
   ```typescript
   async refreshUrls(requestId: string): Promise<GenerateResponse>
   ```

---

### 3. Resume Template Library

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

### 4. Analytics Dashboard (Editor Only)

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

### 5. Storage Class Background Sync

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

### 6. Enhanced Rate Limiting

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

**If you have 3 hours:**
1. Frontend terminology migration (2-3 hours)

**If you have a weekend:**
1. Frontend terminology migration (2-3 hours)
2. URL expiry handling (3-4 hours)
3. Resume template library (6-8 hours)

**If you have a week:**
1. All of the above
2. Analytics dashboard (10-15 hours)
3. Storage class sync (2-3 hours)

**Otherwise:**
- System is production-ready as-is
- Monitor usage and gather user feedback
- Prioritize based on actual user needs

---

For architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
For development setup, see [SETUP.md](./SETUP.md)

---

**Last Updated**: January 2025
