# AI Resume Generator - Setup Guide

## Phase 1 MVP Implementation Status

✅ **Complete** - All code implemented and ready for testing

### Files Created/Modified

#### Cloud Functions Backend
- [functions/src/config/database.ts](../../functions/src/config/database.ts) - Added `GENERATOR_COLLECTION`
- [functions/src/types/generator.types.ts](../../functions/src/types/generator.types.ts) - Complete type definitions
- [functions/src/services/generator.service.ts](../../functions/src/services/generator.service.ts) - Firestore CRUD operations
- [functions/src/services/openai.service.ts](../../functions/src/services/openai.service.ts) - OpenAI structured outputs integration
- [functions/src/services/pdf.service.ts](../../functions/src/services/pdf.service.ts) - Puppeteer PDF generation
- [functions/src/templates/resume-modern.hbs](../../functions/src/templates/resume-modern.hbs) - Resume Handlebars template
- [functions/src/templates/cover-letter.hbs](../../functions/src/templates/cover-letter.hbs) - Cover letter template
- [functions/src/generator.ts](../../functions/src/generator.ts) - Main Cloud Function handler
- [functions/src/index.ts](../../functions/src/index.ts) - Export `manageGenerator` function

#### Web Frontend
- [web/src/pages/resume-builder.tsx](../../web/src/pages/resume-builder.tsx) - MVP test UI at `/resume-builder`

#### Dependencies Installed
```json
{
  "openai": "^6.3.0",
  "puppeteer-core": "^24.24.0",
  "@sparticuz/chromium": "^141.0.0",
  "handlebars": "^4.7.8"
}
```

---

## Prerequisites for Testing

### 1. OpenAI API Secret ✅

**Status**: Already configured!

The `openai-api-key` secret exists in Google Cloud Secret Manager and has been granted access to the Cloud Functions service account (`cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com`).

<details>
<summary>If you need to update the API key</summary>

```bash
# Create a new version of the secret
echo -n "YOUR_NEW_OPENAI_API_KEY" | gcloud secrets versions add openai-api-key \
  --project=static-sites-257923 \
  --data-file=-
```

**To get an OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key immediately (it won't be shown again)
</details>

---

### 2. Seed Default Settings Document

**Required** - The generator needs a `generator/default` document in Firestore.

**Option A: Via Firestore Console**
1. Go to [Firestore Console](https://console.firebase.google.com/project/static-sites-257923/firestore)
2. Select database: `(default)` for local, `portfolio` for production
3. Create collection: `generator`
4. Create document ID: `default`
5. Add fields:

```
id: "default" (string)
type: "defaults" (string)
name: "Josh Wentworth" (string)
email: "josh@joshwentworth.com" (string)
phone: "" (string, optional)
location: "San Francisco, CA" (string, optional)
website: "https://joshwentworth.com" (string, optional)
github: "https://github.com/jdubz" (string, optional)
linkedin: "https://linkedin.com/in/joshwentworth" (string, optional)
avatar: "" (string, optional)
logo: "" (string, optional)
accentColor: "#3B82F6" (string)
defaultStyle: "modern" (string)
createdAt: [Click "Add field" > "timestamp" > "Set to server timestamp"]
updatedAt: [Click "Add field" > "timestamp" > "Set to server timestamp"]
```

**Option B: Via Script (Recommended)**

Create a seed script at `functions/scripts/seed-defaults.ts`:

```typescript
import { Firestore, Timestamp } from "@google-cloud/firestore"
import { DATABASE_ID, GENERATOR_COLLECTION } from "../src/config/database"

async function seedDefaults() {
  const db = new Firestore({ databaseId: DATABASE_ID })

  const defaultsDoc = {
    id: "default",
    type: "defaults",
    name: "Josh Wentworth",
    email: "josh@joshwentworth.com",
    phone: "",
    location: "San Francisco, CA",
    website: "https://joshwentworth.com",
    github: "https://github.com/jdubz",
    linkedin: "https://linkedin.com/in/joshwentworth",
    avatar: "",
    logo: "",
    accentColor: "#3B82F6",
    defaultStyle: "modern",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await db.collection(GENERATOR_COLLECTION).doc("default").set(defaultsDoc)
  console.log("✅ Default settings seeded successfully!")
}

seedDefaults().catch(console.error)
```

Run with:
```bash
cd functions
npx tsx scripts/seed-defaults.ts
```

---

### 3. Verify Experience Data Exists

**Required** - The generator pulls experience entries and blurbs from Firestore.

Check that you have data in:
- Collection: `experience-entries` - Your work experience
- Collection: `experience-blurbs` - Reusable content snippets

**To verify:**
```bash
# Start emulators
firebase emulators:start

# In another terminal, check the experience page
open http://localhost:8000/experience
```

If the experience page loads successfully with data, you're good to go!

---

## Testing the Generator

### Local Testing (Emulators)

1. **Start Firebase Emulators:**
```bash
cd /home/jdubz/Development/portfolio
firebase emulators:start
```

2. **Start Gatsby Dev Server:**
```bash
cd web
npm run develop
```

3. **Navigate to Resume Builder:**
```
http://localhost:8000/resume-builder
```

4. **Fill out the form:**
   - **Generation Type**: Resume + Cover Letter (or choose one)
   - **Job Title/Role**: e.g., "Senior Full-Stack Engineer"
   - **Company**: e.g., "Google"
   - **Company Website** (optional): e.g., "https://www.google.com"
   - **Job Description URL** (optional): Paste a job posting URL
   - **Job Description Text** (optional): Or paste the full job description
   - **Keywords to Emphasize** (optional): e.g., "TypeScript, React, Node.js, AWS"

5. **Click "Generate Documents"**
   - Generation takes 30-60 seconds
   - Watch browser console for logs
   - Check Firebase emulator logs for backend processing

6. **Download PDFs**
   - Click "Download Resume" and/or "Download Cover Letter"
   - Review metadata (tokens, cost, duration)

### Production Testing

⚠️ **Wait until local testing succeeds first**

1. **Deploy Cloud Functions:**
```bash
cd functions
npm run deploy
```

2. **Deploy Gatsby Site:**
```bash
cd web
npm run build
firebase deploy --only hosting
```

3. **Navigate to:**
```
https://staging.joshwentworth.com/resume-builder
# or
https://joshwentworth.com/resume-builder
```

---

## API Endpoint Reference

### POST `/manageGenerator/generator/generate`

**Description**: Generate resume and/or cover letter

**Request Body:**
```json
{
  "generateType": "resume" | "coverLetter" | "both",
  "job": {
    "role": "Senior Full-Stack Engineer",
    "company": "Google",
    "companyWebsite": "https://www.google.com",
    "jobDescriptionUrl": "https://example.com/jobs/123",
    "jobDescriptionText": "Full job description text..."
  },
  "preferences": {
    "emphasize": ["TypeScript", "React", "Node.js"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "generationId": "resume-generator-request-1234567890-abc123",
  "responseId": "resume-generator-response-1234567890-def456",
  "resume": "base64-encoded-pdf-string",
  "coverLetter": "base64-encoded-pdf-string",
  "metadata": {
    "company": "Google",
    "role": "Senior Full-Stack Engineer",
    "model": "gpt-4o-2024-08-06",
    "tokenUsage": {
      "prompt": 1500,
      "completion": 800,
      "total": 2300
    },
    "costUsd": 0.0234,
    "durationMs": 45123
  },
  "requestId": "req_1234567890_xyz789"
}
```

### GET `/manageGenerator/generator/defaults`

**Description**: Get default settings (public)

### PUT `/manageGenerator/generator/defaults`

**Description**: Update default settings (authentication required)

### GET `/manageGenerator/generator/requests`

**Description**: List all generation requests (authentication required)

---

## Troubleshooting

### Error: "OpenAI API key not found"

**Solution**: Ensure the `openai-api-key` secret exists and has the correct permissions:
```bash
gcloud secrets describe openai-api-key --project=static-sites-257923
```

### Error: "Default settings not found"

**Solution**: Seed the `generator/default` document (see step 2 above)

### Error: "No experience data found"

**Solution**: Ensure `experience-entries` collection has data. Visit `/experience` page to verify.

### PDF Generation Timeout

**Symptom**: Function times out after 5 minutes

**Possible Causes**:
- Large number of experience entries
- Slow OpenAI API response
- Puppeteer taking too long to render

**Solutions**:
1. Check Cloud Functions logs for specific errors
2. Verify Chromium is launching correctly in Cloud Functions environment
3. Consider increasing timeout in [functions/src/generator.ts:415](../../functions/src/generator.ts#L415)

### CORS Errors

**Symptom**: Browser blocks request with CORS error

**Solution**: Verify your origin is in the CORS allowlist in [functions/src/generator.ts:51-58](../../functions/src/generator.ts#L51-L58):
```typescript
const corsOptions = {
  origin: [
    "https://joshwentworth.com",
    "https://www.joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
  // ...
}
```

---

## Next Steps (Phase 2)

Phase 1 is a proof of concept. Future enhancements include:

1. **Full Admin UI** - Edit default settings, view history, manage templates
2. **GCS Storage** - Store generated PDFs instead of base64 encoding
3. **Public Sharing** - Shareable links for generated documents
4. **Template Editor** - Visual editor for Handlebars templates
5. **Style Variants** - Traditional, technical, executive templates
6. **Analytics** - Track generation metrics, costs, usage patterns

See [ai-resume-generator-plan.md](./ai-resume-generator-plan.md) for complete roadmap.

---

## Quick Reference

**UI Location**: `/resume-builder`

**Backend Function**: `manageGenerator` (us-central1)

**Dependencies**: OpenAI API, Puppeteer, Handlebars, Firestore

**Collections Used**:
- `generator` - Default settings, requests, responses
- `experience-entries` - Work experience data
- `experience-blurbs` - Reusable content snippets

**Secrets Required**:
- `openai-api-key` - OpenAI API key

**Service Account**: `cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com`

---

## Documentation

- [Firestore Schema](./generator-firestore-schema.md) - Complete schema documentation
- [Implementation Guide](./generator-implementation-guide.md) - Code patterns and conventions
- [Phase 1 Audit](./phase-1-audit-report.md) - Pre-deployment audit results
- [API Response Fix](./api-response-format-fix.md) - Experience page bug fix

---

**Last Updated**: 2025-10-10
**Status**: Ready for testing (pending prerequisites)
