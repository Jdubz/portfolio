# Portfolio Project Context

## Overview
Firebase-based monorepo containing Josh Wentworth's professional portfolio with a Gatsby frontend and Cloud Functions backend. Includes AI-powered resume generation, contact forms, and job finder integration.

## Related Projects

### Job Finder
**Location:** `/home/jdubz/Development/job-finder`
**Purpose:** AI-powered web scraper that finds and analyzes job postings matching your profile
**Language:** Python
**Integration:** Shares Firestore database and provides job matching data to portfolio

**Key Integration Points:**
- **Shared Database:** Both projects use the same Firestore instance (`portfolio` database)
- **Profile Data:** Job-finder reads from `experience-entries` and `experience-blurbs` collections
- **Job Queue:** Portfolio displays job queue status from `job-queue` collection
- **Job Matches:** Portfolio shows matched jobs from `job-matches` collection
- **Configuration:** Both use `job-finder-config` collection for settings

**Data Flow:**
```
job-finder (scrape + analyze) → Firestore → portfolio (display + manage)
```

## Shared Firestore Collections

### Used by Both Projects
- `experience-entries`: Work experience (portfolio writes, job-finder reads)
- `experience-blurbs`: Skills and highlights (portfolio writes, job-finder reads)
- `job-queue`: Pending jobs to process (portfolio writes, job-finder reads/writes)
- `job-matches`: Analyzed job results (job-finder writes, portfolio reads)
- `job-finder-config`: Stop lists, AI settings, queue settings (portfolio writes, job-finder reads)

### Portfolio-Only Collections
- `generator_defaults`: Default personal info for AI resume generation
- `generator_blurbs`: Custom prompt templates
- `generator_history`: Generated document history

## Common Types

### Queue Types (shared)
Located in both:
- Portfolio: `functions/src/types/job-queue.types.ts`
- Job-finder: Python equivalents in `src/job_finder/queue/models.py`

**Core Types:**
- `QueueItem`: Job queue entries with status tracking
- `QueueStatus`: `"pending" | "processing" | "success" | "failed" | "skipped"`
- `StopList`: Excluded companies, keywords, domains
- `JobMatch`: AI-analyzed job matches with scores

### Profile Types
- Portfolio: TypeScript interfaces for experience/blurbs
- Job-finder: Pydantic models in `src/job_finder/profile/schema.py`

**Note:** These types are currently duplicated. Consider using shared-types package.

## Cross-Repository Workflows

### Adding New Job Sources
1. **Job-finder:** Add scraper in `src/job_finder/scrapers/[site].py`
2. **Job-finder:** Register in company sources via `JobSourcesManager`
3. **Portfolio:** UI automatically displays new matches via Firestore
4. **Portfolio:** Optional: Add source-specific filtering in job-finder config page

### Updating Profile Data
1. **Portfolio:** User edits experience via `/experience` page
2. **Portfolio:** Data saved to `experience-entries` collection
3. **Job-finder:** Automatically uses updated profile on next run (via `FirestoreProfileLoader`)
4. **Job-finder:** Re-analyzes jobs with new profile data

### Job Submission Flow
1. **Portfolio:** User submits job URL via `/jobs/submit` page
2. **Portfolio:** API validates and writes to `job-queue` collection
3. **Job-finder:** Queue worker picks up pending jobs (polls every 60s)
4. **Job-finder:** Scrapes, analyzes, writes to `job-matches`
5. **Portfolio:** UI polls for status updates and displays results

## Environment Configuration

### Firebase Connection
Both projects connect to the same Firebase project:
- **Local:** Uses Firebase emulators
- **Staging:** `portfolio-staging` database
- **Production:** `portfolio` database

**Credentials:**
- Portfolio: Uses Firebase Admin SDK (automatic in Cloud Functions)
- Job-finder: Requires `GOOGLE_APPLICATION_CREDENTIALS` env var

### Service Account Setup (Job-finder)
```bash
# Download from Firebase Console → Project Settings → Service Accounts
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

## Development Tips

### When Working in Portfolio
- Check job-finder Python models when modifying Firestore schema
- Test job queue integration with job-finder worker running
- Queue-related types are in `functions/src/types/job-queue.types.ts`

### When Working in Job-finder
- Check portfolio TypeScript types when modifying queue data structure
- Test with portfolio UI to verify data displays correctly
- Profile schema is in `src/job_finder/profile/schema.py`

### Running Both Projects Together
```bash
# Terminal 1: Portfolio (Firebase emulators + web)
cd /home/jdubz/Development/portfolio
make firebase-emulators

# Terminal 2: Portfolio web dev server
cd /home/jdubz/Development/portfolio
make dev

# Terminal 3: Job-finder queue worker
cd /home/jdubz/Development/job-finder
python -m job_finder.queue.processor
```

## Documentation

### Portfolio Docs
- Main: `/home/jdubz/Development/portfolio/CLAUDE.md`
- Architecture: `/home/jdubz/Development/portfolio/docs/development/ARCHITECTURE.md`
- Integration Guide: `/home/jdubz/Development/portfolio/PORTFOLIO_INTEGRATION_GUIDE.md`

### Job-finder Docs
- Main: `/home/jdubz/Development/job-finder/CLAUDE.md`
- Architecture: `/home/jdubz/Development/job-finder/docs/architecture.md`
- Queue System: `/home/jdubz/Development/job-finder/docs/queue-system.md`
- Integration: `/home/jdubz/Development/job-finder/docs/integrations/portfolio.md`

## Testing Cross-Repository Changes

### Firestore Schema Changes
1. Update both TypeScript and Python type definitions
2. Test with Firebase emulator data
3. Deploy to staging and verify both projects work
4. Create migration script if needed for production data

### Queue System Changes
1. Update Python queue processor
2. Update TypeScript API clients
3. Test full flow: submit → process → display
4. Check error handling in both directions

## Common Pitfalls

- **Type Mismatches:** Queue types are duplicated in TS and Python - keep them in sync
- **Timestamp Formats:** Portfolio uses Firebase Timestamps, job-finder uses Python datetime
- **Collection Names:** Use exact names - typos break cross-repo integration
- **Emulator Data:** Job-finder needs seeded emulator data to test against portfolio collections
