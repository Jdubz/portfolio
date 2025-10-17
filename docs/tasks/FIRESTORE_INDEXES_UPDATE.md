# Firestore Indexes Update - Job Queue Support

**Created**: 2025-10-17
**Status**: Ready for deployment via CI/CD
**Related**: Job-Finder Integration

## Summary

Added missing Firestore composite index to support job-finder queue manager queries.

## Problem

The job-finder Python application was failing with missing index errors when querying the `job-queue` collection. The error occurred on the `url_exists_in_queue()` query which checks for duplicate URLs.

## Changes Made

### File Modified
- `/home/jdubz/Development/portfolio/firestore.indexes.json`

### Index Added

**Collection**: `job-queue`
**Purpose**: Support URL duplicate checking query
**Query Pattern**: `.where("url", "==", url).limit(1)`

```json
{
  "collectionGroup": "job-queue",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "url",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "__name__",
      "order": "ASCENDING"
    }
  ]
}
```

## Existing Indexes

The following indexes were already present and support other job-queue queries:

### Index 1: Status + Created At
**Purpose**: Get pending items in FIFO order
**Query**: `.where("status", "==", "pending").order_by("created_at")`

```json
{
  "collectionGroup": "job-queue",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "created_at",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "__name__",
      "order": "ASCENDING"
    }
  ]
}
```

### Index 2: Status + Completed At
**Purpose**: Clean old completed items
**Query**: `.where("status", "in", [...]).where("completed_at", "<", cutoff)`

```json
{
  "collectionGroup": "job-queue",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "completed_at",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "__name__",
      "order": "ASCENDING"
    }
  ]
}
```

## Job-Finder Query Patterns

The job-finder `QueueManager` class uses these query patterns:

1. **Get pending items** (manager.py:70-99)
   - Query: `where("status", "==", "pending").order_by("created_at").limit(10)`
   - Index: status + created_at (existing)

2. **Check URL exists** (manager.py:202-220)
   - Query: `where("url", "==", url).limit(1)`
   - Index: url (NEW - added in this update)

3. **Clean old completed** (manager.py:257-301)
   - Query: `where("status", "in", [...]).where("completed_at", "<", cutoff)`
   - Index: status + completed_at (existing)

4. **Get queue stats** (manager.py:222-255)
   - Query: `stream()` all documents (no index needed)

## Deployment

### Automatic Deployment via CI/CD

These indexes will be deployed automatically when pushing to `staging` or `main` branches via the GitHub Actions workflow (`.github/workflows/deploy.yml`).

**Deployment step** (line 179-184):
```yaml
- name: Deploy Firestore Rules to All Databases
  working-directory: portfolio
  run: |
    echo "Deploying Firestore security rules to all databases..."
    npx firebase deploy --only firestore --force --non-interactive
    echo "✅ Firestore rules deployed successfully"
```

The `--only firestore` flag deploys both:
- `firestore.rules` (security rules)
- `firestore.indexes.json` (composite indexes)

### Deployment Timeline

- **Push to staging branch** → Indexes deployed to `portfolio-staging` database
- **Merge to main branch** → Indexes deployed to `portfolio` (production) database

### Index Build Time

After deployment, Firestore will build the new index in the background. This typically takes:
- Small collections (<1000 docs): 1-5 minutes
- Medium collections (1000-10000 docs): 5-30 minutes
- Large collections (>10000 docs): 30+ minutes

## Verification

After deployment, verify the index is built:

1. **Firebase Console**:
   - Go to: https://console.firebase.google.com/project/static-sites-257923/firestore/indexes
   - Select database: `portfolio-staging` or `portfolio`
   - Look for `job-queue` collection indexes
   - Status should show "Enabled" (green)

2. **Test job-finder integration**:
   ```bash
   cd /home/jdubz/Development/job-finder
   python -m job_finder.queue.worker
   ```

   Should no longer show "missing index" errors when:
   - Checking for duplicate URLs
   - Getting pending items
   - Cleaning old completed items

## Related Files

- **Index Definition**: `/home/jdubz/Development/portfolio/firestore.indexes.json`
- **CI/CD Workflow**: `/home/jdubz/Development/portfolio/.github/workflows/deploy.yml`
- **Job-Finder Queries**: `/home/jdubz/Development/job-finder/src/job_finder/queue/manager.py`

## Notes

- All job-queue queries now have proper indexes
- No manual index creation needed - handled by CI/CD
- Job-finder integration should work smoothly after deployment
- Index builds automatically in background after deployment
