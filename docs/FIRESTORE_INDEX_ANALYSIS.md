# Firestore Index Analysis & Management Plan

## Current State

### Portfolio Project (`firestore.indexes.json`)
Contains 5 indexes, all for the `generator` collection:
1. `type` ASC + `createdAt` DESC
2. `type` ASC + `access.viewerSessionId` ASC + `createdAt` DESC
3. `type` ASC + `result.success` ASC
4. `type` ASC + `generateType` ASC + `createdAt` DESC
5. `type` ASC + `job.company` ASC

**Missing:** No indexes for job-queue, job-matches, or job-sources collections

### Job-Finder Project (`firestore.indexes.json`)
Contains 10 indexes:
1-5. Same `generator` indexes BUT with `__name__` field added
6. `job-queue`: `status` ASC + `created_at` ASC
7. `job-matches`: `userId` ASC + `matchScore` DESC
8. `job-matches`: `userId` ASC + `status` ASC + `matchScore` DESC
9. `job-sources`: `enabled` ASC + `sourceType` ASC

## Issues Identified

### 1. Index Conflicts
- **Generator indexes:** Portfolio has basic versions, job-finder has enhanced versions with `__name__` field
- **Conflict risk:** Deploying from either project could overwrite the other's indexes

### 2. Missing Indexes in Portfolio
Portfolio is missing critical indexes for shared collections:
- **job-queue** collection queries
- **job-matches** collection queries
- **job-sources** collection queries

### 3. Actual Query Requirements

#### Portfolio Queries
**Frontend (web/src):**
- `job-queue`: `orderBy("created_at", "desc")` (useQueueManagement.ts:71)

**Backend (functions/src):**
- Uses APIs, not direct Firestore queries for job-queue

#### Job-Finder Queries
**job-queue:**
- `where("status", "==", "pending").order_by("created_at").limit(N)` (manager.py)
- `where("url", "==", url)` (single field, no composite index needed)
- `where("status", "in", [...]).where("completed_at", "<", date)` (cleanup query)

**job-matches:**
- `where("url", "==", url)` (single field)
- `where("userId", "==", uid).where("status", "==", status).where("matchScore", ">=", score).order_by("matchScore", "desc")` (firestore_storage.py)
- `where("url", "in", [urls]).where("userId", "==", uid)` (batch check)

**job-sources:**
- No complex queries found (likely filtered client-side)

## Required Indexes

### Composite Indexes Needed

1. **job-queue**
   ```json
   {
     "collectionGroup": "job-queue",
     "fields": [
       { "fieldPath": "status", "order": "ASCENDING" },
       { "fieldPath": "created_at", "order": "ASCENDING" }
     ]
   }
   ```

2. **job-queue cleanup**
   ```json
   {
     "collectionGroup": "job-queue",
     "fields": [
       { "fieldPath": "status", "order": "ASCENDING" },
       { "fieldPath": "completed_at", "order": "ASCENDING" }
     ]
   }
   ```

3. **job-matches user queries**
   ```json
   {
     "collectionGroup": "job-matches",
     "fields": [
       { "fieldPath": "userId", "order": "ASCENDING" },
       { "fieldPath": "matchScore", "order": "DESCENDING" }
     ]
   }
   ```

4. **job-matches filtered queries**
   ```json
   {
     "collectionGroup": "job-matches",
     "fields": [
       { "fieldPath": "userId", "order": "ASCENDING" },
       { "fieldPath": "status", "order": "ASCENDING" },
       { "fieldPath": "matchScore", "order": "DESCENDING" }
     ]
   }
   ```

### Note on `__name__` Field
- The `__name__` field in job-finder indexes provides deterministic ordering when other fields are equal
- It's a best practice but not strictly required
- Can help with pagination and consistent ordering

## CRITICAL CORRECTION: Firestore Index Behavior

**❌ PREVIOUS DOCUMENTATION WAS INCORRECT**

**✅ ACTUAL BEHAVIOR:** Firestore indexes are **DATABASE-SPECIFIC**, not global/collection-level.

**Key Facts:**
- Each named database requires its own indexes to be deployed
- Indexes in `(default)` database do NOT apply to `portfolio` or `portfolio-staging` databases
- You MUST deploy indexes to each database separately
- Different databases CAN have different indexes (though we use the same set)

**Evidence:**
Running `firebase firestore:indexes --database=portfolio-staging` showed:
- (default): Only generator indexes, NO job-queue indexes
- portfolio: generator + ONE job-queue index (manually created)
- portfolio-staging: Only generator indexes, NO job-queue indexes

This database-specific behavior caused system crashes when job-finder tried to query
`portfolio-staging` without the required indexes.

**Correct firebase.json configuration:**
```json
{
  "firestore": [
    {
      "database": "(default)",
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"  // Deploy to default
    },
    {
      "database": "portfolio",
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"  // Deploy to production
    },
    {
      "database": "portfolio-staging",
      "rules": "firestore.rules",
      "indexes": "firestore.indexes.json"  // Deploy to staging
    }
  ]
}
```

**Impact of Previous Misconfiguration:**
- Missing indexes in portfolio-staging caused continuous query failures
- Job-finder worker crashed every few minutes
- System was unusable until manually deploying missing indexes

**Fixed in commit:** f4bbfbc (2025-10-17)

## Proposed Solution: Single Source of Truth

### Option 1: Portfolio as Primary (RECOMMENDED)
**Rationale:**
- Portfolio is the web app that users interact with
- Functions are already deployed via Firebase from portfolio
- Easier to manage frontend + backend + indexes in one place
- Job-finder is a background worker that should adapt to the shared schema

**Implementation:**
1. Move all shared collection indexes to portfolio's `firestore.indexes.json`
2. Remove `firestore.indexes.json` from job-finder (or make it read-only/reference)
3. Deploy indexes from portfolio project only
4. Document that indexes are managed in portfolio

### Option 2: Separate Shared Indexes Repository
**Rationale:**
- Both projects are equal partners
- Indexes are truly shared infrastructure
- Could be part of `shared-types` package

**Implementation:**
1. Create `firestore.indexes.json` in `@jdubz/shared-types`
2. Symlink from both projects: `ln -s ../shared-types/firestore.indexes.json ./firestore.indexes.json`
3. Deploy from either project (they'd be identical)

### Option 3: Job-Finder Includes Portfolio Indexes
**Rationale:**
- Job-finder already has more complete indexes
- Job-finder could be the "infrastructure" project

**Drawbacks:**
- Portfolio team needs to coordinate with job-finder for any index changes
- Less intuitive (web app depending on background worker for infrastructure)

## Recommendation: Option 1 (Portfolio as Primary)

### Implementation Steps

1. **Update portfolio's `firestore.indexes.json`:**
   - Add all job-queue, job-matches, job-sources indexes
   - Add `__name__` fields to generator indexes for consistency
   - Document each index's purpose

2. **Remove/Archive job-finder's `firestore.indexes.json`:**
   - Create `firestore.indexes.ARCHIVED.json` with note
   - Add comment in job-finder README pointing to portfolio

3. **Update deployment workflows:**
   - Ensure portfolio's GitHub Actions deploy indexes
   - Add validation step to check index requirements

4. **Documentation:**
   - Add FIRESTORE_INDEXES.md to portfolio docs
   - Document query patterns that require indexes
   - Add guidelines for adding new indexes

5. **Validation:**
   - Run both applications against staging
   - Verify all queries work with new indexes
   - Monitor for any "missing index" errors

## Migration Checklist

- [ ] Create comprehensive `firestore.indexes.json` in portfolio
- [ ] Test index deployment to staging
- [ ] Verify all portfolio queries work
- [ ] Verify all job-finder queries work
- [ ] Deploy indexes to production
- [ ] Archive job-finder's index file
- [ ] Update documentation
- [ ] Add index management to portfolio CI/CD

## Long-term Maintenance

### Adding New Indexes
1. Identify query pattern in code
2. Add index to portfolio's `firestore.indexes.json`
3. Deploy to staging and test
4. Deploy to production
5. Document in code comments

### Index Naming Convention
Use comments in JSON to document purpose:
```json
{
  "indexes": [
    {
      "comment": "For job-queue polling by job-finder worker",
      "collectionGroup": "job-queue",
      ...
    }
  ]
}
```

### Monitoring
- Check Firebase Console for missing index warnings
- Monitor slow queries that might need indexes
- Review indexes quarterly for unused ones
