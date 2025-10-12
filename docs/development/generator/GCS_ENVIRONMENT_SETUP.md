# GCS Environment-Aware Storage Setup

## Overview

The StorageService automatically selects the appropriate GCS bucket based on the deployment environment.

## Environment Detection

### Local/Development
- **Triggers**: `FUNCTIONS_EMULATOR=true`, `NODE_ENV=development`, or missing `GCP_PROJECT`
- **Behavior**: **Uses Firebase Storage Emulator** on port 9199
- **Bucket**: `joshwentworth-resumes-local`
- **Storage Location**:
  - Files persisted to `./emulator-data/` directory
  - Exported automatically on emulator shutdown
  - Auto-imported on emulator startup
  - **Survives emulator restarts**
- **Benefits**:
  - No GCS credentials needed for local dev
  - Real upload/download testing with actual files
  - Files viewable in Firebase Emulator UI (http://localhost:4000)
  - **Persistent storage** - your generated PDFs stay between sessions
  - Test the complete flow: upload → generate URL → download
  - No costs during development

### Staging
- **Triggers**: `ENVIRONMENT=staging`
- **Bucket**: `joshwentworth-resumes-staging`
- **Purpose**: Test GCS integration without affecting production data
- **Lifecycle**: Files move to Coldline storage after 90 days

### Production
- **Triggers**: Default when not local/staging
- **Bucket**: `joshwentworth-resumes`
- **Lifecycle**: Files move to Coldline storage after 90 days
- **Future**: Will integrate with NAS archival (see improvement plan #8)

## Storage Lifecycle

All buckets (staging and production) use the same lifecycle policy:

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 90,
          "matchesPrefix": ["resumes/", "cover-letters/"]
        }
      }
    ]
  }
}
```

**Cost Optimization**:
- First 90 days: Standard storage (~$0.02/GB/month)
- After 90 days: Coldline storage (~$0.004/GB/month)
- Files are **never deleted** automatically
- Future: Archived to local NAS for long-term storage

## File Organization

All environments use the same path structure:

```
resumes/
  └── YYYY-MM-DD/
      └── company_role_resume_timestamp.pdf

cover-letters/
  └── YYYY-MM-DD/
      └── company_role_cover_letter_timestamp.pdf
```

## Signed URL Expiry

- **Viewers (unauthenticated)**: 1 hour
- **Editors (authenticated)**: 7 days

## Emulator Behavior

When using the Storage Emulator (local development):

1. **Upload**: Stores files in emulator's in-memory storage
   ```
   StorageService using Firebase Storage Emulator {
     bucket: 'joshwentworth-resumes-local',
     emulatorHost: '127.0.0.1:9199'
   }
   ```

2. **Download URLs**: Returns emulator URLs (no signing needed)
   ```
   http://127.0.0.1:9199/v0/b/joshwentworth-resumes-local/o/resumes%2F2025-10-12%2Ftest.pdf?alt=media
   ```

3. **View Files**: Open Firebase Emulator UI at http://localhost:4000
   - Navigate to Storage tab
   - Browse uploaded files
   - Download directly from UI

4. **No Credentials Required**: Works without service account keys

## Testing Environments

### Local Testing
```bash
# Start emulators with persistence (recommended)
npm run firebase:serve
# OR
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data

# Start emulators without persistence (clean slate)
npm run firebase:serve:clean
# OR
firebase emulators:start

# StorageService will:
# - Detect FUNCTIONS_EMULATOR=true
# - Connect to Storage Emulator on port 9199
# - Store files in ./emulator-data/ (persisted across restarts)
# - Generate emulator URLs (not signed URLs)
```

**Viewing Files**:
- Emulator UI: http://localhost:4000 → Storage tab
- Files persist in `./emulator-data/storage_export/` directory
- On shutdown: Files exported to `./emulator-data/`
- On startup: Files imported from `./emulator-data/`

**Managing Emulator Data**:
```bash
# Clear all emulator data (fresh start)
rm -rf ./emulator-data/*

# Keep the directory structure
touch ./emulator-data/.gitkeep
```

### Staging Testing
```bash
# Deploy to staging
npm run deploy:staging

# StorageService will:
# - Detect ENVIRONMENT=staging
# - Use joshwentworth-resumes-staging bucket
# - Perform real GCS operations
```

### Production
```bash
# Deploy to production
npm run deploy

# StorageService will:
# - Use joshwentworth-resumes bucket
# - Perform real GCS operations
```

## Override Bucket (Advanced)

If you need to manually specify a bucket (testing, migration, etc.):

```typescript
// In generator.ts
const storageService = new StorageService("custom-bucket-name", logger)
```

This overrides the automatic environment detection.

## Monitoring

Check the logs to verify correct bucket selection:

```
StorageService initialized { bucket: 'joshwentworth-resumes-staging', environment: 'staging' }
```

Or in mock mode:
```
StorageService running in MOCK MODE - GCS uploads disabled { bucket: 'joshwentworth-resumes-local', environment: 'development' }
```

## Future Enhancements

See improvement plan task #8: **GCS to NAS Archival Integration**

- Automated sync from GCS to local NAS
- FTP/rsync/rclone integration
- Scheduled archival after files move to Coldline
- True offline backup solution
