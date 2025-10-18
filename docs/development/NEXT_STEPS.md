# Portfolio - Next Steps

**Last Updated**: January 15, 2025

This document lists **prioritized outstanding work** for the portfolio project. All core features are complete and production-ready - these are optional enhancements.

---

## Critical Issues

### Firebase Authentication Error (BLOCKING PRODUCTION)

**Status**: URGENT - Affects both staging and production
**Estimated Effort**: 2-4 hours
**Impact**: CRITICAL - Users cannot authenticate

Google OAuth returns `auth/internal-error` on both staging and production environments.

**Diagnostic Steps**:
1. Check Firebase Console → Authentication → Settings → Authorized Domains
   - Verify all domains present: `localhost`, `staging.joshwentworth.com`, `joshwentworth.com`, `www.joshwentworth.com`
2. Check Google Cloud Console → APIs & Credentials → OAuth 2.0 Client ID
   - Verify all redirect URIs: `https://*.joshwentworth.com/__/auth/handler`, etc.
3. Check OAuth JavaScript Origins
   - Verify all domains including `http://localhost:8000`, `http://localhost:9000`
4. Review API Key HTTP Referrer Restrictions
   - Ensure no blocking restrictions were added
5. Verify Identity Toolkit API is enabled in GCP
6. Review GCP Activity logs for recent unauthorized changes

**Reference**: `/docs/setup/FIREBASE_CONFIG_CHECKLIST.md`

---

## Code Quality Issues

### TODO Comments to Address

**Status**: Ongoing cleanup
**Estimated Effort**: 2-3 hours total

**Items Found**:
1. **ProfileSectionEdit Structured Data** (`/web/src/components/content-types/ProfileSectionEdit.tsx:6`)
   - Add structured data fields when needed

2. **Cursor-Based Pagination** (`/functions/src/services/content-item.service.ts`)
   - Implement proper cursor-based pagination instead of limit/offset
   - Use Firestore `startAfter()` for scalable pagination
   - Update API to return `nextCursor` in response

---

## Quick Wins: Usability Improvements

**Context**: This tool works in concert with [job-finder](https://github.com/Jdubz/job-finder) to create the best job applications ever:
- **job-finder**: Discovers jobs, scrapes descriptions, analyzes match quality, extracts insights
- **portfolio (this tool)**: Generates hyper-customized resumes/cover letters using AI with job-finder's rich context

**Pipeline Vision**: job-finder → Firestore `job-matches` → portfolio tool → AI-generated documents → application submission

The following improvements focus on seamless integration, maximum automation, and producing the highest quality applications.

### Tier 1: Pipeline Integration (Critical for Best-in-Class Applications)

#### 1. Intelligent Context Utilization ✅
**Status**: Complete (January 2025)
**Effort**: Investigation revealed already implemented
**Impact**: CRITICAL - Maximize job-finder insights in AI generation

**Verification Results**:
After comprehensive code analysis, confirmed that ALL job match insights are already being used in AI prompts:

**OpenAI Service** (`functions/src/services/openai.service.ts:255-288`):
- ✅ `matchScore` - Overall match percentage
- ✅ `matchedSkills` - Skills that align with the job
- ✅ `missingSkills` - Skills to develop (with "don't fabricate" guidance)
- ✅ `keyStrengths` - What to highlight
- ✅ `potentialConcerns` - Address weaknesses through relevant experience
- ✅ `keywords` - Important keywords to use naturally
- ✅ `customizationRecommendations.skills_to_emphasize`
- ✅ `customizationRecommendations.resume_focus`
- ✅ `customizationRecommendations.cover_letter_points`
- ✅ `resumeIntakeData.target_summary`
- ✅ `resumeIntakeData.skills_priority`
- ✅ `resumeIntakeData.keywords_to_include`
- ✅ `resumeIntakeData.achievement_angles` (line 283)

**Gemini Service** (`functions/src/services/gemini.service.ts:313-347`):
- Identical comprehensive job match data usage
- Prompts are consistent between providers for quality parity

**Conclusion**: Task is complete. Both AI providers already leverage all job-finder insights comprehensively. Prompts explicitly instruct AI to use these insights for SELECTION and EMPHASIS only, without fabrication.

---

#### 2. One-Click Generation from Job Applications ✅
**Status**: Complete (January 2025)
**Effort**: 45 minutes (actual)
**Impact**: HIGH - Eliminates friction in pipeline workflow

**Achieved Workflow** (1 click):
1. Click "Generate" button in Job Applications table → Done
2. Watch real-time progress inline
3. Documents automatically linked to job match

**Implementation Completed**:
- ✅ Created reusable `useDocumentGeneration` hook
- ✅ Added `buildGenerationOptionsFromJobMatch` helper function
- ✅ "Generate" button in Actions column for jobs without documents
- ✅ Real-time progress display with `GenerationProgress` component
- ✅ Auto-populates all fields from job match:
  - `jobDescriptionText` / `description` → job description
  - `matchedSkills` + `keyStrengths` + `keywords` → emphasize field
  - `companyWebsite` → company website
  - `url` → job description URL
  - `jobMatchId` → links generation to job match
- ✅ Auto-updates job match after success:
  - `documentGenerated: true`
  - `generationId: <requestId>`
  - `documentGeneratedAt: <timestamp>`
- ✅ Graceful error handling with user notifications
- ✅ Uses AI provider preference from localStorage (defaults to Gemini)
- ✅ Optimistic UI updates (grayed out while generating)
- ✅ Completion animation (2-second delay to show success)

**Files Created/Modified**:
- `web/src/hooks/useDocumentGeneration.ts` - New reusable hook (235 lines)
- `web/src/components/tabs/JobApplicationsTab.tsx` - Added one-click generation (436 lines)
- `web/src/types/job-match.ts` - Added `documentGeneratedAt` to UpdateJobMatchData

**User Experience**:
- Single click → documents generated and linked
- No tab switching required
- Progress visible inline with step-by-step updates
- Row highlights during generation
- Automatic status update on completion

---

#### 3. Bulk Generation Queue
**Status**: Not implemented
**Effort**: 3-4 hours
**Impact**: CRITICAL - Process 10-20 job-finder results efficiently

**Use Case**:
- job-finder finds 15 promising roles
- User reviews matches, selects top 10
- Generate tailored documents for all 10 in one action

**Current State**:
- Must generate one at a time (tedious for high-volume applications)
- No queue management
- No aggregate progress tracking

**Implementation**:
- Multi-select checkboxes in Job Applications table
- "Generate Selected (N)" action button
- Queue-based processing:
  - Process sequentially to avoid rate limits (20 req/15min)
  - Show aggregate progress: "Generating 3/10..."
  - Individual job progress indicators
  - Pause/resume capability
- Summary on completion:
  - "✓ 8 succeeded, ✗ 2 failed"
  - Links to generated documents
  - Option to retry failed generations
- Update all job match statuses in batch

**Rate Limiting Considerations**:
- Editor limit: 20 requests / 15 minutes
- For 10 jobs: ~7.5 minutes at full speed
- Add smart throttling to stay under limits
- Estimate completion time based on queue size

**Files to Modify**:
- `web/src/components/tabs/JobApplicationsTab.tsx`
- `web/src/hooks/useBulkGeneration.ts` - New hook for queue management
- `web/src/components/BulkGenerationModal.tsx` - New component

**Nice-to-Have**:
- "Auto-generate all matches >80%" button
- Configurable priority: generate high-match jobs first

---

#### 4. Job Match Edit UI (Manual Override)
**Status**: Not implemented
**Effort**: 1-2 hours
**Impact**: MEDIUM - For edge cases where job-finder data needs adjustment

**Use Cases**:
- job-finder misclassified role or company
- Want to add manual notes/context
- Update job description after it changed
- Mark as applied/rejected manually

**Implementation**:
- "Edit" button in Job Applications table (each row)
- Modal form with all editable fields:
  - company, role, title, description, url
  - matchScore (manual override)
  - status, priority, notes
  - applied checkbox
- PUT to existing `/generator/job-matches/:id` endpoint
- Optimistic updates + revert on error

**Files to Create**:
- `web/src/components/JobMatchEditModal.tsx` - New component
- `web/src/components/tabs/JobApplicationsTab.tsx` - Add edit button

**Note**: Create is NOT needed - job-finder handles that

---

### Tier 2: Quality & Efficiency Improvements

#### 5. Smart Filtering & Sorting in Job Applications
**Status**: Not implemented
**Effort**: 1 hour
**Impact**: HIGH - Quickly find best opportunities from job-finder results

**Current State**:
- Shows all job matches in creation order
- No filtering or sorting

**Implementation**:
- **Filters**:
  - Match score: >90%, 80-90%, 70-80%, <70%
  - Status: Not Generated, Generated, Applied
  - Priority: High, Medium, Low (if job-finder sets this)
- **Sorting**:
  - By match score (default)
  - By creation date
  - By company name
  - By applied status
- **Quick Actions**:
  - "Show only high matches (>80%)" toggle
  - "Hide already applied" toggle
- Persist preferences in localStorage

**Files to Modify**:
- `web/src/components/tabs/JobApplicationsTab.tsx`

---

#### 6. PDF Inline Preview
**Status**: Not implemented
**Effort**: 1-2 hours
**Impact**: MEDIUM - Faster iteration, less clutter

**Problem**:
- Must download PDF to see result
- Clutters Downloads folder during iteration

**Implementation**:
- Use `react-pdf` or `<iframe>` to show PDF inline
- Collapsible preview panel
- Download button below preview

**Files to Modify**:
- `web/src/components/tabs/DocumentBuilderTab.tsx`
- `web/src/components/PDFPreview.tsx` - New component

---

#### 7. Bi-Directional Sync with job-finder
**Status**: Not implemented
**Effort**: 2-3 hours (requires job-finder API support)
**Impact**: HIGH - Close the feedback loop

**Vision**: Share insights between tools to improve both

**job-finder ← portfolio**:
- After generating documents, send feedback to job-finder:
  - Generation success/failure
  - Time to generate
  - Which keywords were most valuable
  - Document quality score (if manually rated)
- job-finder can use this to refine matching algorithm

**portfolio ← job-finder**:
- Real-time updates when job-finder creates new matches
- Webhook or polling mechanism
- Show notification: "5 new job matches found"

**Implementation Options**:
1. **Firestore Listeners** (easiest):
   - Portfolio watches `job-matches` collection for new docs
   - Both tools write to shared Firestore
2. **Webhooks**:
   - job-finder calls portfolio webhook on new match
   - portfolio calls job-finder webhook after generation
3. **Shared API**:
   - Create unified API for both tools

**Files to Create/Modify**:
- `web/src/hooks/useJobMatchListener.ts` - Firestore listener
- `functions/src/webhooks.ts` - Webhook handlers (if needed)

**Questions for job-finder integration**:
- Does job-finder expose an API?
- What feedback would improve match quality?
- How often does it run? (hourly cron? on-demand?)

---

### Tier 3: Nice to Have

#### 8. Generation History CSV Export
**Status**: Not implemented
**Effort**: 30 minutes
**Impact**: LOW - Better application tracking

**Implementation**:
- Add "Export CSV" button to Document History tab
- Export columns: Date, Company, Role, Status, AI Model, Cost, Generation ID
- Use `papaparse` or similar library

**Files to Modify**:
- `web/src/components/GenerationHistory.tsx`

---

#### 9. Default Form Values from Last Generation
**Status**: Not implemented
**Effort**: 30 minutes
**Impact**: LOW - Faster iteration for similar roles

**Implementation**:
- Store last successful generation params in localStorage
- Pre-fill form fields on load (except company/role)
- Add "Use Last Settings" button

---

#### 10. Generation Templates/Presets
**Status**: Not implemented
**Effort**: 2-3 hours
**Impact**: MEDIUM - Faster switching between role types

**Implementation**:
- Save generation presets: "Full Stack", "Frontend", "DevOps", "Leadership"
- Each preset includes: emphasize keywords, AI prompts, generation type
- Dropdown to load preset
- Store in Firestore under user account

---

#### 11. Keyboard Shortcuts
**Status**: Not implemented
**Effort**: 1-2 hours
**Impact**: LOW - Power user efficiency

**Shortcuts**:
- `Ctrl+Enter` - Generate documents
- `Ctrl+K` - Focus company field
- `Ctrl+N` - New job match
- `Esc` - Close modals

**Implementation**:
- Use `react-hotkeys-hook` or similar library

---

## Portfolio Showcase Enhancements

These features demonstrate the sophistication of the integrated job-finder → portfolio pipeline system.

### 12. Pipeline Analytics Dashboard
**Status**: Not implemented
**Effort**: 4-5 hours
**Impact**: Showcases end-to-end system intelligence

**Vision**: Show the complete pipeline in action with real data

**Metrics to Display**:

**job-finder → portfolio Pipeline**:
- Total jobs discovered vs. documents generated (conversion funnel)
- Average match score of generated documents
- Success rate by match score tier (>90%, 80-90%, etc.)
- Time from job discovery to document generation
- Most common matched skills across all applications

**Generation Performance**:
- Gemini vs OpenAI: cost comparison with actual data
- Average generation time per provider
- Total cost savings from using Gemini (e.g., "Saved $47.23 vs OpenAI")
- Token usage trends over time
- Generation success rate

**Application Outcomes** (manual input):
- Interview rate by match score
- Response rate by document quality
- Which keywords correlated with success
- Feedback loop to improve job-finder matching

**Implementation**:
- Aggregate data from `generator_history` + `job-matches` collections
- Cross-reference by `generationId` ↔ `jobMatchId`
- Use recharts for visualizations
- Real-time Firestore listeners for live updates
- Add as new tab: "Pipeline Analytics"

**Files to Create**:
- `web/src/components/tabs/PipelineAnalyticsTab.tsx` - New tab
- `web/src/hooks/usePipelineAnalytics.ts` - Data aggregation
- `web/src/components/analytics/FunnelChart.tsx` - Conversion funnel
- `web/src/components/analytics/CostComparison.tsx` - Cost savings

**Demo Value**: Shows technical sophistication + data-driven approach to job search

---

### 13. "How It Works" - Integrated System Documentation
**Status**: Complete
**Effort**: 3-4 hours (actual: 1 hour)
**Impact**: Demonstrates system design thinking

**Content**:

**Architecture Overview**:
- End-to-end pipeline diagram: job-finder → Firestore → portfolio → AI → GCS → Application
- Data flow between systems
- Firestore as integration layer

**job-finder Intelligence**:
- How it discovers and analyzes jobs
- Match scoring algorithm (high-level)
- What insights it provides (matchedSkills, keyStrengths, etc.)

**portfolio AI Customization**:
- How it uses job-finder insights in prompts
- Multi-provider AI strategy (Gemini vs OpenAI)
- Cost optimization (96% savings)
- PDF generation pipeline

**Security & Scale**:
- Firebase Auth + custom claims (editor role)
- Rate limiting strategy
- Cloud Functions Gen 2 architecture
- GCS lifecycle policies (COLDLINE after 90 days)

**Code Highlights**:
- Show interesting code snippets (with syntax highlighting)
- Link to GitHub if repo is public
- Explain technical decisions

**Files to Create**:
- `web/src/pages/how-it-works.tsx` - New page
- `web/src/components/architecture-diagram.svg` - System diagram
- Update navigation to include link

**Demo Value**: Shows full-stack expertise, system design, and integration skills

**Implementation** (Completed January 2025):
- Created `HowItWorksTab.tsx` component with comprehensive documentation
- Added as first tab in resume builder (accessible to all users, no auth required)
- Balances layman accessibility with technical depth
- Covers: pipeline architecture, multi-provider AI, cost optimization, security, quality philosophy
- Includes links to GitHub repos for both tools
- Explains integrated job-finder → portfolio system
- 480 lines of polished content

**Files Created/Modified**:
- `web/src/components/tabs/HowItWorksTab.tsx` - New component (480 lines)
- `web/src/pages/resume-builder.tsx` - Added tab as first in list

---

### Tier 4: Real-Time Job Alerting System

#### 14. Push Notification Integration with Job Finder
**Status**: Planned (Architecture designed January 2025)
**Effort**: 8-10 hours
**Impact**: CRITICAL - Real-time alerts for perfect match jobs from job-finder

**Use Case**:
- job-finder discovers a perfect match job (>90% match score)
- Instantly notify user via push notification (even if browser closed)
- User clicks notification → opens job details
- Seamless pipeline: Discovery → Alert → Review → Generate → Apply

**Architecture Overview**:

**Components**:
1. **Firebase Cloud Messaging (FCM)** - Web push notifications
2. **Webhook Endpoint** - Receives alerts from job-finder
3. **Service Worker** - Handles background notifications
4. **User Subscription Flow** - Permission request and token storage

**Current Infrastructure** (Already Available):
- ✅ Firebase SDK v12.3.0 with messaging support
- ✅ PWA manifest configured (standalone mode, icons)
- ✅ Service worker headers in firebase.json
- ✅ Cloud Functions infrastructure
- ✅ Firestore for token storage

**What's Needed**:
- Firebase Cloud Messaging initialization
- Service worker for push notifications (`firebase-messaging-sw.js`)
- User notification permission UI
- FCM token storage in Firestore
- Webhook Cloud Function endpoint

**Implementation Plan**:

**Phase 1: FCM Setup** (1-2 hours)
- Generate VAPID keys in Firebase Console
- Create `web/src/utils/firebase-messaging.ts` utility
- Create service worker `web/static/firebase-messaging-sw.js`
- Initialize FCM in app startup

**Phase 2: User Subscription** (2-3 hours)
- Create notification permission UI component
- Implement FCM token storage in Firestore collection `fcm_tokens`:
  ```typescript
  {
    userId: string         // Firebase Auth UID
    token: string          // FCM registration token
    createdAt: Timestamp
    lastUsed: Timestamp
    userAgent: string
    isActive: boolean
  }
  ```
- Add user preferences for notifications:
  ```typescript
  {
    notifications: {
      jobAlerts: boolean      // Opt-in/opt-out
      minMatchScore: number   // Only alert if score >= X
    }
  }
  ```
- Handle token refresh logic

**Phase 3: Webhook Endpoint** (2-3 hours)
- Create new Cloud Function `functions/src/job-alerts.ts`
- Endpoint: `POST /jobAlerts`
- Payload validation (Joi schema):
  ```typescript
  {
    jobId: string
    title: string
    company: string
    matchScore: number
    url: string
    userId?: string  // Optional: target specific user
  }
  ```
- Security:
  - API key authentication (shared secret with job-finder)
  - Rate limiting (max 10 alerts per minute)
  - Payload validation
- Fetch user's FCM tokens from Firestore
- Send push notification via Firebase Admin SDK:
  ```typescript
  admin.messaging().send({
    token: userToken,
    notification: {
      title: `Perfect Job Match: ${company}`,
      body: `${title} - ${matchScore}% match`,
      icon: '/favicons/primary-192.png'
    },
    data: {
      jobId,
      url,
      matchScore: matchScore.toString()
    },
    webpush: {
      fcmOptions: {
        link: url  // Click opens job URL
      }
    }
  })
  ```

**Phase 4: Service Worker** (1-2 hours)
- Handle background notifications
- Define notification click behavior:
  ```typescript
  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  })
  ```
- Show notification with job details
- Track analytics (optional)

**Phase 5: Testing** (1-2 hours)
- Test local notifications with Firebase emulator
- Test staging webhook with mock payload
- Verify notification appearance on Chrome, Firefox, Safari
- Test deep linking to job URLs
- Monitor error logs and delivery metrics

**Data Flow**:
```
job-finder discovers match
  ↓
POST /jobAlerts webhook
  ↓
Validate payload + check user preferences
  ↓
Fetch FCM tokens from Firestore
  ↓
Send push notification via Firebase Admin SDK
  ↓
User receives notification (even if browser closed)
  ↓
User clicks notification
  ↓
Opens job URL in new tab
  ↓
User reviews match and generates documents
```

**Browser Support**:
- ✅ Chrome/Edge/Firefox: Full support
- ✅ Safari iOS 16.4+: Push notification support (requires "Add to Home Screen")
- ✅ Safari macOS: Full support

**Cost Estimate**:
- Firebase Cloud Messaging: **FREE** for web push
- Cloud Function invocations: ~$0.0000004 per alert
- Firestore reads/writes: Minimal (token storage only)
- **Expected monthly cost**: < $1 for up to 10,000 alerts

**Security Considerations**:
- VAPID keys stored in Secret Manager
- Webhook authentication with API key
- Rate limiting to prevent abuse
- User opt-in required (notification permission)
- Token cleanup for expired/invalid tokens

**Future Enhancements**:
- Topic-based subscriptions (frontend jobs, backend jobs, etc.)
- Notification scheduling (don't send at night)
- Rich notifications with job preview images
- In-app notification center (persistent history)
- Analytics dashboard for alert effectiveness
- Customizable alert thresholds per user

**Files to Create**:
- `functions/src/job-alerts.ts` - Webhook endpoint
- `web/src/utils/firebase-messaging.ts` - FCM initialization
- `web/static/firebase-messaging-sw.js` - Service worker
- `web/src/components/NotificationSettings.tsx` - Permission UI
- `web/src/hooks/useNotifications.ts` - FCM token management

**Files to Modify**:
- `web/gatsby-browser.tsx` - Initialize FCM on app start
- `web/src/components/tabs/SettingsTab.tsx` - Add notification preferences
- `functions/src/index.ts` - Export job alerts function
- `firebase.json` - Ensure service worker headers configured

**Integration with job-finder**:
- job-finder needs webhook URL and API key
- Recommend alerting criteria: match score >85%, high priority roles
- Provide webhook payload format documentation
- Monitor delivery success rates and adjust thresholds

**Deployment**:
- Deploy to staging first for testing
- Verify notification delivery on mobile and desktop
- Deploy to production after verification
- Configure job-finder with production webhook URL

---

## Optional Enhancements (Low Priority)

All high-priority work is complete. The items below are optional enhancements that may be considered based on user needs.

### 1. Storage Class Background Sync

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

### 2. Enhanced Rate Limiting

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
- **LinkedIn Integration**: ❌ Low frequency, high complexity, high maintenance → **Skip**
- **Batch Generation**: ❌ Very low frequency, can run multiple times manually → **Skip**

---

## Recently Completed ✅

### SimpleLogger Type Migration (January 2025)

**Status**: Complete (Commits: 68f1dbb, 3922084, c78bba2)
**Impact**: Eliminated 137 lines of duplicate code across 10 files (73% reduction)

**Problem Solved:**
The `SimpleLogger` interface and default logger initialization pattern was duplicated across 13+ files. Every service class had the same 15-line logger initialization block, creating maintenance burden and inconsistency risk.

**Implementation:**
- **Infrastructure (68f1dbb):**
  - Created `functions/src/types/logger.types.ts` with shared `SimpleLogger` type
  - Created `createDefaultLogger()` factory in `functions/src/utils/logger.ts`
  - Created `createFirestoreInstance()` factory in `functions/src/config/firestore.ts`
  - Updated `GeneratorService` to demonstrate pattern (constructor: 23 → 5 lines)

- **Migration (3922084):**
  - Migrated 10 service files to use shared types and factories
  - Services: Experience, Blurb, Firestore, Email, OpenAI, Gemini, PDF, SecretManager
  - Updated ai-provider.factory.ts and auth.middleware.ts
  - Constructor size reductions: 60-83% across all services

- **Cleanup (c78bba2):**
  - Removed unused `DATABASE_ID` imports after migration
  - Fixed ESLint warnings

**Pattern Applied:**
```typescript
// Before (23 lines per service):
type SimpleLogger = { ... }  // Duplicated 13+ times
constructor(logger?: SimpleLogger) {
  this.db = new Firestore({ databaseId: DATABASE_ID })
  const isTestEnvironment = ...
  this.logger = logger || { /* 15 lines */ }
}

// After (5 lines):
import { createFirestoreInstance } from "../config/firestore"
import { createDefaultLogger } from "../utils/logger"
import type { SimpleLogger } from "../types/logger.types"

constructor(logger?: SimpleLogger) {
  this.db = createFirestoreInstance()
  this.logger = logger || createDefaultLogger()
}
```

**Verification:**
- All 211 tests passing (169 functions + 42 web)
- All linting checks passing (TypeScript + ESLint + Prettier)
- Single source of truth for logger type
- Consistent logging patterns across entire codebase

---

### URL Expiry Code Cleanup (October 2025)

**Status**: Complete (Commit: 756355f)
**Impact**: Eliminated misleading URL expiry logic, clarified that GCS URLs are permanent

**Problem Solved:**
GCS buckets are publicly readable, so URLs never expire. However, the code was calculating and storing fake expiry times (7 days for editors, 1 hour for viewers), which was misleading and created unnecessary complexity.

**Implementation:**
- **Backend Changes:**
  - Renamed `generateSignedUrl()` → `generatePublicUrl()` in storage.service.ts
  - Removed `SignedUrlOptions` interface (no longer needed)
  - Removed `expiresInHours` calculations from generator.ts
  - Removed `signedUrlExpiry` fields from Firestore writes
  - Removed `urlExpiresIn` from API responses
  - Fixed bug where image upload referenced undefined `signedUrl` variable

- **Frontend Changes:**
  - Updated `GenerateResponse` type: removed `urlExpiresIn` field
  - Updated `FileMetadata` type: `signedUrl` → `publicUrl`, removed `signedUrlExpiry`
  - Updated comments in `GenerationDetailsModal`, `GenerationHistory`, `DocumentBuilderTab`
  - Changed "signed URL" terminology to "public URL" throughout

**Verification:**
- All 169 functions tests passing
- All 42 web tests passing
- All linting clean (TypeScript + ESLint)

**Files Modified:**
- `functions/src/generator.ts` - Removed expiry calculations and updated method calls
- `functions/src/services/storage.service.ts` - Renamed methods, removed options interface
- `web/src/types/generator.ts` - Updated type definitions
- `web/src/components/GenerationDetailsModal.tsx` - Updated comments
- `web/src/components/GenerationHistory.tsx` - Updated comments
- `web/src/components/tabs/DocumentBuilderTab.tsx` - Updated comments
- `docs/development/NEXT_STEPS.md` - Documentation update

---

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
- ✅ GCS storage with public URLs (never expire)
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

**System is production-ready as-is:**
- All core features complete and tested
- Optional enhancements available if needed
- Monitor usage and gather user feedback
- Prioritize based on actual user needs

---

For architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
For development setup, see [SETUP.md](./SETUP.md)

---

**Last Updated**: January 15, 2025
