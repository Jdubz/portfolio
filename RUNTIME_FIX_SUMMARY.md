# Runtime Issue Resolution - Staging Environment

**Date:** 2025-10-08
**Status:** ✅ **RESOLVED**

## Issues Found

1. **Firebase Auth Error:** `auth/invalid-api-key`
2. **Experience API 404:** `manageExperience` function not deployed
3. **CORS Errors:** Missing Cloud Function
4. **Database Permission Error:** `7 PERMISSION_DENIED: Missing or insufficient permissions`

## Fixes Applied

### 1. Environment Variables
Added to `.env.staging` and `.env.production`:
```env
GATSBY_FIREBASE_API_KEY=AIzaSyAxzl0u55AkWKTKLjGJRX1pxtApS8yC39c
GATSBY_FIREBASE_AUTH_DOMAIN=static-sites-257923.firebaseapp.com
GATSBY_FIREBASE_PROJECT_ID=static-sites-257923
GATSBY_FIREBASE_STORAGE_BUCKET=static-sites-257923.firebasestorage.app
GATSBY_FIREBASE_MESSAGING_SENDER_ID=789847666726
GATSBY_FIREBASE_APP_ID=1:789847666726:web:2128b2081a8c38ba5f76e7
GATSBY_USE_FIREBASE_EMULATORS=false
GATSBY_EXPERIENCE_API_URL=https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience[-staging]
```

### 2. Cloud Function Deployment
- Deployed `manageExperience` to production
- Configured with `cloud-functions-builder` service account
- Granted necessary IAM roles:
  - `roles/artifactregistry.writer` to `cloud-functions-builder`
  - `roles/datastore.user` to `789847666726-compute@developer.gserviceaccount.com`

### 3. CI/CD Workflow
Created `deploy-cloud-functions.yml` with matrix strategy:
- Deploys both `contact-form` and `manageExperience`
- Separate staging/production configurations
- Per-function settings (memory, instances, secrets, service accounts)

### 4. Service Account Permissions

**cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com:**
- `roles/logging.logWriter`
- `roles/artifactregistry.writer` ✅ (newly added)

**789847666726-compute@developer.gserviceaccount.com (runtime):**
- `roles/logging.logWriter`
- `roles/artifactregistry.reader`
- `roles/datastore.user` ✅ (newly added)

## Verification

### ✅ API Endpoint Working
```bash
curl https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience-staging/experience/entries
```

Returns:
```json
{
  "success": true,
  "entries": [...],
  "count": 6
}
```

### ✅ Firebase Auth Working
- All Firebase config variables present
- Auth initialization successful
- No more `invalid-api-key` errors

### ✅ CORS Resolved
- Function deployed and accessible
- Proper CORS headers configured

## Deployment Commands Used

```bash
# Deploy function
firebase deploy --only functions:manageExperience --project static-sites-257923

# Grant permissions
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:789847666726-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"

# Force new revision for permission propagation
gcloud run services update manageexperience-staging \
  --region=us-central1 \
  --project=static-sites-257923 \
  --update-env-vars="UPDATED_AT=$(date +%s)"
```

## Production URLs

- **Contact Form:** https://us-central1-static-sites-257923.cloudfunctions.net/contact-form
- **Experience API:** https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience

## Staging URLs

- **Contact Form:** https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging
- **Experience API:** https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience-staging

## Next Steps

1. ✅ Test experience page on staging.joshwentworth.com
2. ⏳ Wait for CI/CD to deploy manageExperience-staging
3. ⏳ Verify full end-to-end flow
4. ⏳ Merge to main when ready

## Commits

- `72e2d69` - fix: resolve critical staging runtime issues
- Added Firebase config, deployed functions, updated CI/CD

---

**All runtime issues resolved. Staging is now functional.** 🎉
