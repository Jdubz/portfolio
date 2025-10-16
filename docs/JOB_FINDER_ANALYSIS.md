# Job-Finder Integration Analysis

**Date:** January 16, 2025
**Purpose:** Understand job-finder's job-listings collection to build management UI in portfolio

---

## Overview

**job-finder** is a Python-based job scraping and AI matching system that:
1. Scrapes job boards (RSS, APIs, company pages) based on configured sources
2. Filters jobs using traditional criteria (remote, keywords)
3. Fetches company information from websites (cached in Firestore)
4. Analyzes job fit using AI (Claude/GPT-4) with 0-100 match scores
5. Stores matched jobs in Firestore `job-matches` collection (80+ score threshold)

**Repository:** https://github.com/Jdubz/job-finder
**Branch:** `develop` (main development branch)
**Status:** 49% test coverage, 414 tests passing, production-ready

---

## Firestore Collections Used by job-finder

### 1. `job-listings` Collection (What We Need to Manage)

**Purpose:** Stores job sources that job-finder scrapes from
**Access:** Read by job-finder, should be managed via portfolio UI

**Document Structure:**
```typescript
{
  // Core fields
  id: string                    // Auto-generated Firestore doc ID
  name: string                  // Human-readable (e.g., "Netflix Careers", "We Work Remotely")
  sourceType: string            // "rss" | "api" | "scraper" | "company-page"
  enabled: boolean              // Whether job-finder should scrape this source
  tags: string[]                // Categorization: ["remote", "tech", "big-tech"]

  // Configuration (varies by sourceType)
  config: {
    // RSS type:
    url?: string                // RSS feed URL
    parse_format?: string       // "standard" | "custom"
    title_field?: string
    description_field?: string
    link_field?: string
    company_extraction?: string // "from_title" | "from_field"

    // API type:
    base_url?: string
    auth_type?: string          // "none" | "api_key" | "oauth"
    api_key_env?: string        // Environment variable name
    endpoints?: object
    params?: object
    rate_limit?: string
    response_format?: string    // "json" | "xml"

    // Scraper type:
    url?: string
    method?: string             // "selenium" | "requests"
    selectors?: object          // CSS selectors for job elements
    pagination?: object

    // Company Page type:
    company_name?: string
    careers_url?: string
    company_website?: string
    company_info?: string       // Pre-fetched about/culture text
    method?: string             // "api" | "scraper" | "rss"
    // ... plus method-specific fields
  }

  // Tracking (updated by job-finder)
  lastScrapedAt: Timestamp | null
  lastScrapedStatus: "success" | "error" | "skipped" | null
  lastScrapedError: string | null
  totalJobsFound: number        // Cumulative count
  totalJobsMatched: number      // Cumulative count (score >= 80)

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 2. `job-matches` Collection

**Purpose:** Stores jobs that passed AI matching (80+ score)
**Access:** Read/write by job-finder, read-only in portfolio (Job Applications tab)

**Key Fields:**
- Job details (title, company, description, url, location, salary, postedDate)
- AI analysis (matchScore, matchedSkills, missingSkills, keyStrengths, keywords)
- Customization data (resumeIntakeData, customizationRecommendations)
- Application tracking (applied, appliedAt, status, documentGenerated, generationId)

### 3. `companies` Collection

**Purpose:** Cached company information (about, culture, mission, size, industry)
**Access:** Read/write by job-finder for caching website scrapes

---

## How job-finder Uses job-listings

### Workflow

```
1. Query Firestore: SELECT * FROM job-listings WHERE enabled = true
2. Apply company scoring (tech stack alignment, Portland office bonus)
3. Sort by score (Tier S > A > B > C > D)
4. For each listing:
   - Initialize appropriate scraper based on sourceType
   - Scrape jobs from the source
   - Update listing: lastScrapedAt, totalJobsFound
5. Filter jobs (remote/hybrid, no exclusions)
6. Fetch/cache company info
7. Run AI matching (analyze each job against user profile)
8. Store matches (score >= 80) to job-matches collection
9. Update listing: totalJobsMatched
```

### Company Scoring System

**Tech Stack Alignment** (up to 100 points):
- MongoDB: +15
- Redis: +15
- Kubernetes: +10
- Docker: +10
- Python: +10
- React/TypeScript: +10
- FastAPI: +10
- AWS/GCP: +10
- PostgreSQL: +10

**Location Bonus**:
- Portland office: +50 points

**Company Attributes** (up to 35 points):
- Remote-first: +15
- AI/ML focus: +10
- Strong engineering culture: +10

**Tiers**:
- S: 150+ points (highest priority)
- A: 100-149
- B: 70-99
- C: 50-69
- D: 0-49

---

## Current job-listings Examples

From `setup_job_listings.py`, the system currently includes:

**RSS Feeds:**
- We Work Remotely - Programming
- We Work Remotely - Full Stack
- Remotive - Software Development

**APIs:**
- RemoteOK API (enabled)
- Adzuna API (disabled - needs API keys)

**Company Pages:**
- Netflix Careers (enabled - API method)
- Shopify Careers (disabled - scraper not implemented)
- Stripe Careers (disabled - API not implemented)

---

## Schema Refactoring Status

**Current State:** No active refactoring in progress (checked latest commits)

**Recent Work:**
- Company info fetching merged (PR #13)
- Test coverage improvements (47% → 49%)
- Alerting system planned (not yet implemented)

**Schema is Stable:** Ready to build management UI

---

## Management UI Requirements

### View Mode (Read-Only Display)

**Priority Fields to Show:**
1. **Name** - Human-readable source name
2. **Status Badge** - Enabled/Disabled with color coding
3. **Source Type Badge** - "RSS" | "API" | "Scraper" | "Company Page"
4. **Last Scraped** - Relative time (e.g., "2 hours ago")
5. **Performance Stats:**
   - Total jobs found (all-time)
   - Total jobs matched (score >= 80)
   - Match rate: `(totalJobsMatched / totalJobsFound * 100)%`
6. **Last Status** - Success/Error indicator with error message
7. **Tags** - Pill badges (remote, tech, big-tech, etc.)

**Secondary Fields (Expandable Details):**
- Source URL (extracted from config based on sourceType)
- Company info (for company-page type)
- Configuration preview (formatted JSON)
- Created/Updated timestamps

**Actions:**
- Enable/Disable toggle
- Edit button (navigate to edit mode)
- View in Firestore (external link)
- Test scrape (trigger manual scrape - future feature)

### Edit Mode (Form for Updates)

**Editable Fields:**
- Name (text input)
- Enabled (toggle)
- Tags (multi-select chips)
- Source Type (dropdown, disabled after creation)
- Config (dynamic form based on sourceType)

**Config Forms by Source Type:**

**RSS:**
- URL (text input with validation)
- Parse format (dropdown)
- Field mappings (text inputs)

**API:**
- Base URL (text input)
- Auth type (dropdown)
- API key env var name (text input)
- Endpoints (JSON editor)
- Params (JSON editor)

**Scraper:**
- URL (text input)
- Method (dropdown: selenium | requests)
- Selectors (JSON editor)

**Company Page:**
- Company name (text input)
- Careers URL (text input)
- Company website (text input)
- Company info (textarea)
- Method (dropdown: api | scraper | rss)
- Method-specific fields (conditional)

**Validation:**
- Required: name, sourceType, config.url (or equivalent)
- URL format validation
- JSON validation for complex config fields
- Prevent saving if validation fails

---

## API Endpoints Needed in Portfolio

### Functions Backend

**File:** `functions/src/job-listings.ts` (new file)

```typescript
// GET /job-listings
// List all job listings (editor-only, auth required)
export const getJobListings = async (req, res) => {
  // Query Firestore job-listings collection
  // Return all documents with id field
}

// GET /job-listings/:id
// Get single job listing by ID
export const getJobListing = async (req, res) => {
  // Query by document ID
  // Return full document
}

// PUT /job-listings/:id
// Update job listing (editor-only, auth required)
export const updateJobListing = async (req, res) => {
  // Validate payload with Joi schema
  // Update Firestore document
  // Return updated document
}

// POST /job-listings
// Create new job listing (editor-only, auth required)
export const createJobListing = async (req, res) => {
  // Validate payload
  // Create Firestore document
  // Return created document with id
}

// DELETE /job-listings/:id
// Delete job listing (editor-only, auth required)
export const deleteJobListing = async (req, res) => {
  // Delete Firestore document
  // Return success
}

// POST /job-listings/:id/toggle
// Quick enable/disable toggle
export const toggleJobListing = async (req, res) => {
  // Update enabled field only
  // Return updated document
}
```

### Web API Client

**File:** `web/src/api/job-listings-client.ts` (new file)

```typescript
export class JobListingsClient extends ApiClient {
  async getListings(): Promise<JobListing[]>
  async getListing(id: string): Promise<JobListing>
  async createListing(data: CreateJobListingData): Promise<JobListing>
  async updateListing(id: string, data: UpdateJobListingData): Promise<JobListing>
  async deleteListing(id: string): Promise<void>
  async toggleEnabled(id: string, enabled: boolean): Promise<JobListing>
}
```

---

## UI Component Structure

### JobListingsTab Component

**File:** `web/src/components/tabs/JobListingsTab.tsx`

**Features:**
- Table view with sortable columns
- Filter by enabled/disabled, source type, tags
- Search by name
- Inline enable/disable toggle
- Click row to expand details
- Edit button opens modal
- Delete with confirmation

**Columns:**
1. Status (badge)
2. Name (with type badge)
3. Source Type
4. Last Scraped (relative time)
5. Stats (jobs found / matched)
6. Match Rate (%)
7. Actions (toggle, edit, delete)

**Sorting:**
- Default: Most recently scraped first
- Options: Name, Type, Status, Match Rate, Last Scraped

**Filtering:**
- Enabled/Disabled
- Source Type (RSS, API, Scraper, Company Page)
- Tags (multi-select)
- Last scrape status (Success, Error, Never)

### JobListingEditModal Component

**File:** `web/src/components/JobListingEditModal.tsx`

**Features:**
- Form with validation
- Dynamic config fields based on source type
- JSON editor for complex config
- Tag multi-select with creation
- Save/Cancel buttons
- Loading and error states

---

## Implementation Plan

### Phase 1: Backend API (1-2 hours)
1. Create `functions/src/job-listings.ts` with CRUD endpoints
2. Add Joi validation schemas for payload validation
3. Wire up to `functions/src/index.ts` exports
4. Add auth middleware (editor-only)
5. Test with curl/Postman

### Phase 2: API Client (30 minutes)
1. Create `web/src/api/job-listings-client.ts`
2. Extend ApiClient base class
3. Add TypeScript interfaces
4. Add error handling

### Phase 3: Types (30 minutes)
1. Create `web/src/types/job-listing.ts`
2. Mirror Firestore schema
3. Add form-specific types
4. Export all types

### Phase 4: View Component (2-3 hours)
1. Create `JobListingsTab.tsx` with table
2. Add sorting and filtering
3. Add enable/disable toggle
4. Add expand/collapse details
5. Style with Theme UI

### Phase 5: Edit Modal (2-3 hours)
1. Create `JobListingEditModal.tsx`
2. Build dynamic form based on sourceType
3. Add validation
4. Wire up API calls
5. Add success/error feedback

### Phase 6: Integration (30 minutes)
1. Add tab to resume-builder page
2. Test end-to-end
3. Add editor role check
4. Deploy to staging

**Total Estimate:** 6-8 hours

---

## Testing Strategy

### Manual Testing Checklist
- [ ] View all listings
- [ ] Toggle enable/disable (optimistic update)
- [ ] Sort by each column
- [ ] Filter by enabled, type, tags
- [ ] Search by name
- [ ] Expand details row
- [ ] Edit existing listing (each source type)
- [ ] Create new listing (each source type)
- [ ] Delete listing (with confirmation)
- [ ] Form validation (required fields, URL format, JSON format)
- [ ] Error handling (network failure, auth failure)

### Edge Cases
- Empty state (no listings)
- All listings disabled
- Long source names
- Missing lastScrapedAt
- Error state display
- Very large totalJobsFound numbers

---

## Future Enhancements

### Immediate
- **Test Scrape Button** - Trigger manual scrape for a source
- **Refresh Stats** - Re-fetch latest scrape data
- **Bulk Actions** - Enable/disable multiple sources at once
- **Import/Export** - JSON import/export for backup/migration

### Later
- **Analytics Dashboard** - Charts for scrape performance over time
- **Alerting** - Notify when scrape fails
- **Scheduling** - Per-source scrape schedules
- **Rate Limiting UI** - Configure rate limits per source
- **Clone Listing** - Duplicate existing source

---

## Questions for Next Session

1. Should we allow deleting listings that have found jobs? (Add confirmation with impact)
2. How should we display company scoring/tier in the UI?
3. Should we show preview of scraped jobs for each listing?
4. Do we want to support creating new source types beyond the 4 current types?
5. Should tag creation be restricted or open to any string?

---

**Status:** Analysis complete, ready to build once schema refactoring is confirmed finished.
