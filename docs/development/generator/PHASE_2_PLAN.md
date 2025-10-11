# AI Resume Generator - Phase 2 Plan

> **Timeline:** 2-3 weeks (12-17 days)
> **Goal:** Production-ready feature with authentication, storage, and full UI

## Overview

Phase 2 adds the remaining features to make this production-ready:
- Cover letter generation (UI only, service done)
- GCS storage for document history
- Authentication and editor features
- Prompt management
- Additional templates
- Code quality improvements

## Phase 2.0: API Refactoring (Memory & Progress)

**Timeline:** 1-2 days
**Complexity:** Medium
**Status:** Planned
**Priority:** HIGH - Blocking current memory issues

### Problem Statement
Current implementation has critical issues:
- **Memory exhaustion**: 512Mi insufficient for Puppeteer (needs 582Mi+)
- **Fake progress**: Current progress is estimated, not real
- **All-or-nothing**: Single request generates everything or fails completely
- **Poor UX**: User waits 30+ seconds with no real feedback

### Solution: Split into 3 API Calls

**New API Flow:**
1. `POST /generator/requests` - Create request, prepare data (fast, < 1s)
   - Returns `requestId` immediately
   - Status: `pending`

2. `POST /generator/requests/:id/resume` - Generate resume (20-30s)
   - OpenAI call + PDF generation
   - Returns resume PDF
   - Updates status: `resume_complete`

3. `POST /generator/requests/:id/cover-letter` - Generate cover letter (15-20s)
   - OpenAI call + PDF generation
   - Returns cover letter PDF
   - Updates status: `complete`

### Benefits
- **Lower memory per call**: Each operation uses <300Mi
- **True progress**: Real status updates, not estimates
- **Partial success**: Get resume even if cover letter fails
- **Better UX**: Show resume immediately, cover letter follows
- **Easier retry**: Retry individual steps without re-doing work

### Tasks

**Backend:**
- [ ] Refactor generator.ts into 3 separate handlers
  - [ ] `createRequest()` - Prepare data, create document
  - [ ] `generateResume()` - OpenAI + PDF for resume only
  - [ ] `generateCoverLetter()` - OpenAI + PDF for cover letter only
- [ ] Update request status flow: `pending` → `resume_complete` → `complete`
- [ ] Store intermediate results in Firestore document
- [ ] Add proper error recovery for each step

**Frontend:**
- [ ] Update generator-client with 3 new methods
  - [ ] `createRequest()`
  - [ ] `generateResume(requestId)`
  - [ ] `generateCoverLetter(requestId)`
- [ ] Add state machine for request lifecycle
- [ ] Show resume download immediately after resume completes
- [ ] Continue generating cover letter in background
- [ ] Handle partial failures gracefully

### Success Criteria
- Each API call uses <400Mi memory
- User sees resume within 30 seconds
- Cover letter available 15-20 seconds later
- Failed cover letter doesn't affect resume
- Progress bar shows real status

---

## Phase 2.1a: Progress Updates (DEPRECATED - See 2.0)

**Status:** Superseded by Phase 2.0 refactoring

The progress update implementation is being replaced with a better architecture
that splits generation into separate API calls, providing true progress instead
of estimates.

### Documentation
See [PROGRESS_UPDATES_PLAN.md](./PROGRESS_UPDATES_PLAN.md) for historical context.

---

## Phase 2.1: Cover Letter Integration

**Timeline:** 1-2 days
**Complexity:** Low (service already implemented)

### Tasks
- [ ] Update API to accept `generateType: "resume" | "coverLetter" | "both"`
- [ ] Modify generator.ts to handle "both" generation
- [ ] Return both PDFs in response
- [ ] Add checkbox in UI: "Also generate cover letter"
- [ ] Display two download buttons when both generated
- [ ] Show separate metrics (tokens, cost) for each

### Success Criteria
- Can generate resume only, cover letter only, or both
- Each document has its own download button
- Metrics accurately reflect cost of both documents

---

## Phase 2.2: GCS Storage & Document History

**Timeline:** 2-3 days
**Complexity:** Medium

### Tasks

**Backend:**
- [ ] Create GCS bucket `joshwentworth-resumes`
- [ ] Configure lifecycle policy (90-day auto-delete)
- [ ] Set IAM permissions for Cloud Functions service account
- [ ] Update generator.ts to upload PDFs to GCS
- [ ] Generate signed URLs (1hr for viewers, 7 days for editors)
- [ ] Update GeneratorResponse schema with GCS paths
- [ ] Add `GET /generator/requests` endpoint (editor-only)
- [ ] Add `GET /generator/requests/:id` endpoint (editor-only)

**Frontend:**
- [ ] Update generator-client with `listRequests()` method
- [ ] Create DocumentHistoryTable component
- [ ] Add "View History" tab (editors only)
- [ ] Display: date, role, company, status, cost, downloads
- [ ] Implement filters (search, date range)
- [ ] Download from signed URLs

### Success Criteria
- PDFs stored in GCS with proper paths
- Documents auto-delete after 90 days
- Editors can see all generations
- Download tracking works

---

## Phase 2.3: Authentication & Editor Features

**Timeline:** 3-4 days
**Complexity:** Medium-High

### Tasks

**Backend:**
- [ ] Add auth middleware to editor routes
- [ ] Create `PUT /generator/defaults` route (editor-only)
- [ ] Add Firebase Storage integration for avatar/logo uploads
  - [ ] Create `/generator-assets/avatars/` bucket path
  - [ ] Create `/generator-assets/logos/` bucket path
  - [ ] Generate public URLs or signed URLs for uploaded images
  - [ ] Store URLs in generator defaults document
  - [ ] Update PDF service to fetch from Storage URLs when provided
- [ ] Implement higher rate limits for editors (20 vs 10)
- [ ] Add `createdBy` tracking for authenticated users

**Frontend:**
- [ ] Add Firebase Auth (same pattern as experience page)
- [ ] Create `useAuth` hook integration
- [ ] Conditional UI based on auth state:
  - Viewer: Simple form + download
  - Editor: Tabs (Generate | History | Settings)
- [ ] Add "Edit Defaults" form for personal info
  - [ ] Text fields: name, email, phone, location
  - [ ] URL fields: website, GitHub, LinkedIn
  - [ ] File upload: avatar (profile photo)
  - [ ] File upload: logo (personal branding)
  - [ ] Color picker: accent color
  - [ ] Dropdown: default template style
- [ ] Show auth status indicator
- [ ] Login/logout buttons

### Success Criteria
- Viewers can use without login
- Editors must authenticate
- Editors see additional features
- Editors can upload and update avatar/logo images
- Uploaded images appear in generated resumes
- System falls back to template assets when no custom images uploaded
- Rate limits differ by role

---

## Phase 2.4: Prompt Management

**Timeline:** 2-3 days
**Complexity:** Medium

### Tasks

**Backend:**
- [ ] Create 4 prompt blurbs in Firestore:
  - `resume-system-prompt`
  - `resume-user-prompt-template`
  - `cover-letter-system-prompt`
  - `cover-letter-user-prompt-template`
- [ ] Implement variable substitution: `{role}`, `{company}`, `{jobDescription}`, etc.
- [ ] Update OpenAIService to use prompts from Firestore
- [ ] Remove hardcoded prompts

**Frontend:**
- [ ] Add "Prompts" tab to editor view
- [ ] Reuse BlurbEditor component from experience page
- [ ] Display all 4 prompt blurbs
- [ ] Show available variables documentation
- [ ] Add "Reset to default" button

### Success Criteria
- Editors can customize prompts
- Variables are substituted correctly
- Changes apply to next generation immediately

---

## Phase 2.5: Additional Templates

**Timeline:** 2-3 days
**Complexity:** Medium

### Tasks

**Backend:**
- [ ] Create `resume-traditional.hbs` template
  - Conservative design, serif fonts, black/white
- [ ] Create `resume-technical.hbs` template
  - Focus on skills/tech, compact format, code-friendly
- [ ] Create `resume-executive.hbs` template
  - Leadership-focused, elegant, more whitespace
- [ ] Update PDFService to load templates dynamically
- [ ] Pass style preference through generation pipeline

**Frontend:**
- [ ] Add style selector dropdown
- [ ] Show brief description of each style
- [ ] Optional: Template preview images

### Success Criteria
- Can select from 4 template styles
- Each template has distinct visual style
- Style preference persists in Firestore

---

## Phase 2.6: Code Quality Improvements

**Timeline:** 1 day
**Complexity:** Low (refactoring)

### Tasks
1. **Extract Chrome Detection** (pdf.service.ts)
   ```typescript
   private async findLocalChrome(): Promise<string | null> {
     // Try multiple paths, return first found
   }
   ```

2. **Extract Job Description Builder** (generator.ts)
   ```typescript
   function buildJobDescription(job: JobDetails): string {
     // Build formatted job description
   }
   ```

3. **Document Service Account** (experience.ts)
   - Add comments explaining cloud-functions-builder vs compute service account
   - Document when to use each

### Success Criteria
- Code is more readable
- Duplication removed
- Service account usage is documented

---

## Implementation Order

**Recommended sequence:**

1. **2.1 Cover Letter** (quick win, high user value)
2. **2.3 Authentication** (unlocks editor features)
3. **2.2 GCS Storage** (enables history)
4. **2.4 Prompts** (customization)
5. **2.5 Templates** (nice-to-have)
6. **2.6 Code Quality** (clean up)

**Why this order:**
- Cover letter is fast and valuable
- Auth is required before storage/prompts make sense
- Templates and quality are less critical

---

## Testing Strategy

### Per Phase
- Unit tests for new services/functions
- Integration tests for API endpoints
- Frontend component tests

### End-to-End (After 2.6)
- [ ] Viewer flow: Generate resume → download
- [ ] Editor flow: Login → edit prompts → generate → view history
- [ ] Rate limiting works correctly
- [ ] All templates render properly
- [ ] Cost tracking is accurate

---

## Deployment Checklist

Before deploying to production:

### Secrets & Config
- [ ] OpenAI API key in Secret Manager (production)
- [ ] Set billing alerts ($50/month threshold)
- [ ] Rotate API key quarterly

### GCS
- [ ] Create bucket with lifecycle policy
- [ ] Configure IAM permissions
- [ ] Test signed URL generation

### Firestore
- [ ] Deploy security rules
- [ ] Create indexes
- [ ] Seed default settings
- [ ] Create default prompt blurbs

### Monitoring
- [ ] Cloud Monitoring dashboards
- [ ] Error alerting (>5% error rate)
- [ ] Cost tracking
- [ ] Usage metrics

### Testing
- [ ] All 136+ tests passing
- [ ] E2E testing in staging
- [ ] Load testing (100 concurrent requests)
- [ ] Security audit

---

## Phase 3: Future Enhancements

**Not in Phase 2 scope - future consideration:**

- ATS optimization scoring
- Keyword analysis vs job description
- Multi-language support
- LaTeX export
- Resume preview before download
- Application tracking
- Interview/outcome tracking
- A/B testing for prompts
- Email delivery

See [PLANNED_IMPROVEMENTS.md](../PLANNED_IMPROVEMENTS.md) for complete roadmap.

---

## Questions?

- Check [README.md](./README.md) for current status
- Check [SCHEMA.md](./SCHEMA.md) for database structure
- Open an issue for bugs or feature requests
