# AI Resume Generator - Setup Guide

> **Quick Start:** Get the generator running locally in 5 minutes

## Prerequisites

- Node.js 18+
- npm 8+
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI API key (required for OpenAI provider)
- Google AI API key (required for Gemini provider)

## 1. Environment Setup

### Create Environment File

```bash
# Copy the example environment file
cp functions/.env.example functions/.env
```

### Configure API Keys

Edit `functions/.env` with your API keys:

```bash
# AI Provider Keys (at least one required)
OPENAI_API_KEY=sk-proj-...              # For OpenAI GPT-4o
GOOGLE_API_KEY=...                      # For Google Gemini 2.0 Flash

# Mock Mode (for local dev without API calls)
OPENAI_MOCK_MODE=true                   # Skip OpenAI API, use mock data
GEMINI_MOCK_MODE=true                   # Skip Gemini API, use mock data

# Firestore (automatically set by emulator)
FUNCTIONS_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080

# Firebase Storage Emulator
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

### Mock Mode vs Real APIs

**Mock Mode** (recommended for local dev):
- No API keys required
- Instant responses with realistic mock data
- No API costs
- Enable with `OPENAI_MOCK_MODE=true` and/or `GEMINI_MOCK_MODE=true`

**Real APIs** (for testing actual integration):
- Requires valid API keys
- Real AI responses
- Costs per generation (~$0.0011 for Gemini, ~$0.0275 for OpenAI)
- Set mock mode variables to `false` or omit them

## 2. Install Dependencies

```bash
# Root dependencies
npm install

# Function dependencies
cd functions && npm install && cd ..

# Web dependencies
cd web && npm install && cd ..
```

## 3. Seed Default Settings

The generator requires a `default` document with personal info. Seed it once:

```bash
# Local emulator (requires emulators running)
make seed-generator-defaults

# Staging database (after deploying to staging)
make seed-generator-staging

# Production database (after deploying to production)
make seed-generator-prod
```

**What this does:**
- Creates `generator/default` document in Firestore
- Sets default name, email, location, accent color, etc.
- Editors can update these via the Personal Info tab in the UI

## 4. Start Firebase Emulators

### Option A: With Persistence (Recommended)

Data persists across emulator restarts:

```bash
make firebase-emulators
# OR
npm run firebase:serve
# OR
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

### Option B: Clean Slate

Fresh emulator state on each start:

```bash
make firebase-emulators-clean
# OR
npm run firebase:serve:clean
# OR
firebase emulators:start
```

### Emulator Ports

- **Functions:** http://localhost:5001
- **Firestore:** http://localhost:8080
- **Auth:** http://localhost:9099
- **Storage:** http://localhost:9199
- **Emulator UI:** http://localhost:4000

## 5. Start Gatsby Dev Server

In a **separate terminal**:

```bash
make dev
# OR
npm run dev
# OR
cd web && gatsby develop
```

Visit: **http://localhost:8000/resume-builder**

## 6. Verify Setup

### Check Generator Health

The manageGenerator function includes a `/generator/health` endpoint:

```bash
# Local emulator
curl http://localhost:5001/static-sites-257923/us-central1/manageGenerator/generator/health

# Staging
curl https://us-central1-static-sites-257923.cloudfunctions.net/manageGenerator-staging/generator/health

# Production
curl https://us-central1-static-sites-257923.cloudfunctions.net/manageGenerator/generator/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T12:00:00.000Z",
  "environment": "development",
  "mockMode": {
    "openai": true,
    "gemini": true
  }
}
```

### Test Generation Flow

1. Navigate to http://localhost:8000/resume-builder
2. Fill out the "Document Builder" form:
   - Select document type (Resume, Cover Letter, or Both)
   - Choose AI provider (OpenAI or Gemini)
   - Enter job details (company, role)
   - Optionally paste job description
3. Click "Generate Documents"
4. Watch the progress checklist update in real-time
5. Download PDFs as they become available

## Google Cloud Storage (GCS) Setup

### Environment Detection

The storage service automatically detects the environment:

| Environment | Bucket | Detection Method |
|------------|--------|------------------|
| **Local** | Uses Storage Emulator | `FUNCTIONS_EMULATOR=true` |
| **Staging** | `joshwentworth-resumes-staging` | `ENVIRONMENT=staging` |
| **Production** | `joshwentworth-resumes` | Default (no env vars) |

### Local Development (Storage Emulator)

**No bucket creation required!** The Firebase Storage Emulator:
- Automatically creates buckets on first use
- Stores files in `./emulator-data/storage_export/`
- Persists data across restarts (with `--export-on-exit`)
- Accessible via Emulator UI at http://localhost:4000

**Viewing Files:**
1. Open http://localhost:4000
2. Navigate to Storage tab
3. Browse uploaded files by path: `resumes/YYYY-MM-DD/filename.pdf`

**Managing Emulator Data:**
```bash
# Clear all emulator data (fresh start)
rm -rf ./emulator-data/*

# Keep directory structure
touch ./emulator-data/.gitkeep
```

### Staging Environment

Create the staging bucket (one-time setup):

```bash
gcloud storage buckets create gs://joshwentworth-resumes-staging \
  --project=static-sites-257923 \
  --location=us-central1 \
  --uniform-bucket-level-access

# Set lifecycle policy (transition to COLDLINE after 90 days)
gcloud storage buckets update gs://joshwentworth-resumes-staging \
  --lifecycle-file=storage-lifecycle.json
```

### Production Environment

The production bucket already exists: `gs://joshwentworth-resumes`

Verify lifecycle policy:
```bash
gcloud storage buckets describe gs://joshwentworth-resumes --format="json(lifecycle)"
```

### Storage Lifecycle Management

**Purpose:** Reduce storage costs by moving old files to cheaper storage class

**Policy:**
- Files older than 90 days → automatically moved to COLDLINE storage
- Reduces costs from $0.020/GB to $0.004/GB (80% savings)
- No impact on signed URLs or download functionality
- Slightly slower first-byte latency for cold files (~milliseconds)

**Lifecycle configuration** (`storage-lifecycle.json`):
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
          "age": 90
        }
      }
    ]
  }
}
```

## Editor Role Management

Editors have additional privileges:
- 20 requests per 15 minutes (vs 10 for viewers)
- 7-day signed URLs (vs 1 hour for viewers)
- Access to document history
- Ability to update default personal info

### Grant Editor Role

```bash
make editor-add EMAIL=user@example.com
```

### Revoke Editor Role

```bash
make editor-remove EMAIL=user@example.com
```

### List All Editors

```bash
make editor-list
```

### Check User's Role

```bash
make editor-check EMAIL=user@example.com
```

**Important:** Users must sign out and sign back in for role changes to take effect.

## Testing

### Run All Tests

```bash
# Functions tests (211+ tests)
cd functions && npm test

# Web tests (28+ tests)
cd web && npm test

# Specific test suites
cd functions && npm test -- generator
cd functions && npm test -- ai-provider
cd functions && npm test -- openai.service
cd functions && npm test -- gemini.service
```

### Test with Real APIs

1. Set mock mode to false in `functions/.env`:
   ```bash
   OPENAI_MOCK_MODE=false
   GEMINI_MOCK_MODE=false
   ```

2. Restart emulators:
   ```bash
   # Stop emulators (Ctrl+C)
   # Restart
   make firebase-emulators
   ```

3. Generate a document and verify:
   - Real AI responses (check quality)
   - Token usage tracked in response document
   - Cost calculated correctly

## Deployment

### Staging Deployment

```bash
# Deploy everything to staging
npm run deploy:staging

# Or deploy just the generator function
make deploy-function FUNC=manageGenerator-staging
```

After deploying:
1. Verify health endpoint
2. Seed default settings (if first deploy)
3. Test generation with both providers
4. Check Firestore for request/response documents
5. Verify GCS files created with correct permissions

### Production Deployment

```bash
# Build and deploy to production
npm run deploy:production

# Or deploy just the generator function
make deploy-function FUNC=manageGenerator
```

### Post-Deployment Checklist

- [ ] Verify Firestore indexes created (check Firebase console)
- [ ] Verify GCS lifecycle policies active
- [ ] Test generation with both providers
- [ ] Test auth flow (sign in, editor role)
- [ ] Verify signed URLs work (viewer: 1 hour, editor: 7 days)
- [ ] Check rate limiting (10 viewer, 20 editor)
- [ ] Monitor error logs for first 24 hours
- [ ] Verify cost tracking (OpenAI/Gemini usage)

## Troubleshooting

### "Rate limit exceeded"

**Cause:** Too many requests in 15-minute window

**Solutions:**
- Wait 15 minutes for rate limit to reset
- Sign in as editor for higher limit (20 vs 10)
- Check rate limit documents in Firestore: `generator/rate-limit-*`

### "GCS upload failed"

**Cause:** Missing permissions or bucket doesn't exist

**Solutions:**
1. Verify bucket exists:
   ```bash
   gcloud storage buckets describe gs://BUCKET_NAME
   ```

2. Grant necessary IAM roles:
   ```bash
   # For Cloud Functions service account
   gcloud projects add-iam-policy-binding static-sites-257923 \
     --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/storage.objectAdmin"

   gcloud projects add-iam-policy-binding static-sites-257923 \
     --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
     --role="roles/iam.serviceAccountTokenCreator"
   ```

### "Mock data not loading"

**Cause:** Environment variables not set or emulators not restarted

**Solutions:**
1. Verify `functions/.env` has mock mode enabled:
   ```bash
   OPENAI_MOCK_MODE=true
   GEMINI_MOCK_MODE=true
   ```

2. Restart emulators:
   ```bash
   # Stop emulators (Ctrl+C)
   make firebase-emulators
   ```

3. Check health endpoint for mock mode status:
   ```bash
   curl http://localhost:5001/.../manageGenerator/generator/health
   ```

### "Signed URL expired"

**Cause:** URLs expire after 1 hour (viewers) or 7 days (editors)

**Solutions:**
- Re-generate the document to get new signed URLs
- Check `urlExpiresIn` field in response
- Implement URL refresh endpoint (TODO)

### "Firestore permission denied"

**Cause:** Invalid auth token or incorrect role

**Solutions:**
1. Sign out and sign back in (refresh auth token)
2. Verify user has correct role:
   ```bash
   make editor-check EMAIL=user@example.com
   ```
3. Check Firestore security rules in Firebase console

### "OpenAI API error" / "Gemini API error"

**Cause:** Invalid API key or rate limit exceeded

**Solutions:**
1. Verify API key in `functions/.env`
2. Check API quota/billing in provider console
3. Switch to mock mode for local development
4. Try the other provider as fallback

## Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Functions (local)
DEBUG=generator:* make firebase-emulators

# Web (local)
GATSBY_LOG_LEVEL=verbose make dev
```

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Read [PLAN.md](./PLAN.md) for future enhancement ideas
- Explore the Emulator UI at http://localhost:4000
- Try generating documents with both AI providers
- Review Firestore documents to understand data structure
