# AI Resume Generator

> **Status:** Phase 2.3 Complete ✅ | Production Ready
>
> **Last Updated:** October 12, 2025
>
> **Branch:** `resume-generator`

AI-powered resume and cover letter generator with multi-provider support (OpenAI GPT-4o, Google Gemini 2.0), GCS storage, Firebase Authentication, and comprehensive Firestore tracking.

---

## Quick Links

- **[Firestore Schema](./SCHEMA.md)** - Complete database structure and types
- **[GCS Environment Setup](./GCS_ENVIRONMENT_SETUP.md)** - Storage configuration (local/staging/prod)
- **[Quickstart Guide](./QUICKSTART.md)** - Get started in 5 minutes

---

## What's Built ✅

### Core Features

- ✅ **AI Generation**
  - Multi-provider support (OpenAI GPT-4o, Google Gemini 2.0 Flash)
  - Provider selection UI with real-time cost comparison
  - Mock mode for local development (both providers)
  - Resume + Cover Letter generation
  - **Custom AI prompts** - Editors can customize system and user prompts via Firestore
  - Prompt template variables (e.g., `{{job.role}}`, `{{experienceData}}`)

- ✅ **PDF Export**
  - Modern template with Puppeteer + Handlebars
  - Logo and avatar support with GCS upload
  - Accent color customization
  - Professional formatting
  - **Image upload** - Avatar and logo upload with validation (5MB max, image types only)

- ✅ **Cloud Storage (GCS)**
  - Environment-aware bucket selection (local/staging/production)
  - Firebase Storage Emulator for local dev with persistence
  - Signed URLs (1 hour for viewers, 7 days for editors)
  - Lifecycle management (90-day COLDLINE transition)
  - Storage class tracking in Firestore
  - Image storage for avatars and logos

- ✅ **Authentication & Authorization**
  - Optional Firebase Auth (Google sign-in)
  - Editor role via custom claims
  - Tiered rate limiting (10 viewer / 20 editor requests per 15min)
  - Makefile scripts for role management

- ✅ **Database & Tracking**
  - Firestore request/response documents
  - Experience data snapshots for reproducibility
  - Token usage and cost metrics
  - Composite indexes for production queries
  - **Document history** - Editors can view all past generations
  - **Settings management** - Centralized default personal info (name, email, contacts, avatar, logo)

- ✅ **User Interface**
  - Tabbed interface with URL routing
  - Work Experience management
  - Document Builder (resume/cover letter generation)
  - AI Prompts editor (customize generation prompts)
  - Settings page (personal info, avatar, logo)
  - Document History (editor-only)
  - Provider-based role visibility (editors see more features)

- ✅ **Developer Experience**
  - Type-safe end-to-end (TypeScript)
  - Comprehensive test coverage (169+ tests)
  - Local emulator support with data persistence
  - Environment-aware configuration
  - Detailed logging and error handling
  - **Common mistakes documentation** - Prevent repeated issues

### Cost Comparison

| Provider | Cost per Generation | Speed | Notes |
|----------|-------------------|-------|-------|
| **Gemini 2.0 Flash** | **$0.0011** | ~3-5s | Default, 96% cheaper |
| OpenAI GPT-4o | $0.0275 | ~4-6s | Slightly better quality |

**Savings: 96% cheaper with Gemini while maintaining excellent quality**

---

## Architecture

### Backend (`functions/src/`)

```
generator.ts                      # Cloud Function (POST /generator/generate)
├── services/
│   ├── generator.service.ts      # Firestore CRUD (defaults, requests, responses)
│   ├── ai-provider.factory.ts    # Provider abstraction layer
│   ├── openai.service.ts         # OpenAI GPT-4o integration
│   ├── gemini.service.ts         # Google Gemini 2.0 integration
│   ├── pdf.service.ts            # Puppeteer PDF generation
│   ├── storage.service.ts        # GCS uploads and signed URLs
│   └── experience.service.ts     # Experience data fetching
├── templates/
│   └── resume-modern.hbs         # PDF template (Handlebars)
├── types/
│   └── generator.types.ts        # Shared types
└── config/
    ├── database.ts               # Firestore configuration
    └── openai-schema.ts          # Structured output schemas
```

### Frontend (`web/src/`)

```
pages/resume-builder.tsx          # Main UI at /resume-builder
├── contexts/
│   └── ResumeFormContext.tsx     # Form state management
├── api/
│   └── generator-client.ts       # API client (28 tests)
├── hooks/
│   └── useAuth.ts                # Firebase Auth hook
└── types/
    └── generator.ts              # Frontend types
```

### Database Structure (`generator` collection)

```
generator/
├── default                       # Personal info defaults (editors only)
├── resume-generator-request-*    # Generation requests
└── resume-generator-response-*   # Generation results with GCS paths
```

See [SCHEMA.md](./SCHEMA.md) for complete details.

---

## Getting Started

### 1. Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp functions/.env.example functions/.env

# Required: OpenAI API key
OPENAI_API_KEY=sk-...

# Required: Google AI API key (for Gemini)
GOOGLE_API_KEY=...

# Optional: Enable mock mode for local dev
OPENAI_MOCK_MODE=true
GEMINI_MOCK_MODE=true
```

### 2. Seed Default Settings

```bash
# Local emulator (requires emulators running)
make seed-generator-defaults

# Staging database
make seed-generator-staging

# Production database
make seed-generator-prod
```

### 3. Start Development

```bash
# Start Firebase emulators (with persistence)
make firebase-emulators

# In another terminal: Start Gatsby dev server
make dev
```

Visit: http://localhost:8000/resume-builder

### 4. Create Storage Buckets

```bash
# Production bucket (already exists)
# gs://joshwentworth-resumes

# Staging bucket
gcloud storage buckets create gs://joshwentworth-resumes-staging \
  --location=us-central1 \
  --uniform-bucket-level-access

# Local uses Firebase Storage Emulator (automatic)
```

See [GCS_ENVIRONMENT_SETUP.md](./GCS_ENVIRONMENT_SETUP.md) for complete setup.

---

## Editor Role Management

Editors get:
- 20 requests per 15 minutes (vs 10 for viewers)
- 7-day signed URLs (vs 1 hour)
- Access to document history
- Ability to update default personal info

### Commands

```bash
# Grant editor role
make editor-add EMAIL=user@example.com

# Revoke editor role
make editor-remove EMAIL=user@example.com

# List all editors
make editor-list

# Check user's role
make editor-check EMAIL=user@example.com
```

**Note:** Users must sign out and sign back in for role changes to take effect.

---

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
```

### Test Coverage

- ✅ Generator service (request/response CRUD)
- ✅ OpenAI service (structured outputs, error handling)
- ✅ Gemini service (JSON parsing, error handling)
- ✅ AI provider factory (provider selection, cost calculation)
- ✅ PDF service (template rendering)
- ✅ Storage service (environment-aware buckets)
- ✅ Generator endpoint (integration tests for both providers)
- ✅ Generator client (API calls, error handling)

---

## Deployment

### Staging

```bash
# Deploy everything to staging
npm run deploy:staging

# Or deploy just the generator function
make deploy-function FUNC=manageGenerator
```

### Production

```bash
# Build and deploy to production
npm run deploy:production
```

### Post-Deployment Checklist

1. ✅ Verify Firestore indexes are created
2. ✅ Verify GCS lifecycle policies are active
3. ✅ Test generation with both providers
4. ✅ Test auth flow (sign in, editor role)
5. ✅ Verify signed URLs work
6. ✅ Check rate limiting

---

## Configuration

### Environment Variables

**Functions** (`functions/.env`):

```bash
# AI Providers
OPENAI_API_KEY=sk-...           # Required
GOOGLE_API_KEY=...              # Required for Gemini

# Mock Mode (local dev)
OPENAI_MOCK_MODE=true           # Skip OpenAI API calls
GEMINI_MOCK_MODE=true           # Skip Gemini API calls

# Firestore
FUNCTIONS_EMULATOR=true         # Auto-set by emulator
FIRESTORE_EMULATOR_HOST=localhost:8080

# GCS Storage
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

**Web** (automatic, no config needed):
- Provider preference stored in localStorage
- Auto-detects Firebase emulators
- API client points to correct environment

### Firebase Configuration

**firebase.json:**
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 },
    "hub": { "port": 4400 }
  }
}
```

**firestore.indexes.json:**
- 5 composite indexes for production queries
- See [SCHEMA.md](./SCHEMA.md) for details

**storage.rules:**
- Public read via signed URLs
- Write access only for Cloud Functions

---

## Key Implementation Details

### 1. Provider Selection

The system uses a factory pattern to abstract AI providers:

```typescript
// User selects provider in UI
const provider = formState.aiProvider // "openai" | "gemini"

// Backend creates appropriate provider
const aiProvider = AIProviderFactory.createProvider(provider, logger)

// Generate content (same interface for both providers)
const result = await aiProvider.generateResume(options)
```

### 2. GCS Storage Flow

```typescript
// 1. Generate PDF
const pdf = await pdfService.generateResumePDF(content, style, color)

// 2. Upload to GCS (environment-aware bucket)
const { gcsPath, storageClass } = await storageService.uploadPDF(pdf, filename, "resume")

// 3. Generate signed URL (expiry based on user role)
const signedUrl = await storageService.generateSignedUrl(gcsPath, {
  expiresInHours: isEditor ? 168 : 1
})

// 4. Store in Firestore response document
await generatorService.createResponse(requestId, result, metrics, {
  resume: { gcsPath, signedUrl, size, storageClass }
})
```

### 3. Rate Limiting

Implemented using Firestore atomic operations:

```typescript
// Check rate limit
const sessionId = req.body.sessionId || generateSessionId()
const limit = isEditor ? 20 : 10  // requests per 15 min
const allowed = await checkRateLimit(sessionId, limit)
```

### 4. Experience Data Snapshot

For reproducibility, all experience data is snapshotted in the request document:

```typescript
const request = {
  experienceData: {
    entries: [...],  // Snapshot of experience-entries
    blurbs: [...]    // Snapshot of experience-blurbs
  }
}
```

This ensures:
- Regenerating from history uses exact same data
- Debugging failures is easier
- Compliance/audit trail

---

## Monitoring & Analytics

### Available Queries

```typescript
// List all requests for a viewer
const requests = await db.collection("generator")
  .where("type", "==", "request")
  .where("access.viewerSessionId", "==", sessionId)
  .where("createdAt", ">=", startDate)
  .orderBy("createdAt", "desc")
  .get()

// Calculate success rate
const responses = await db.collection("generator")
  .where("type", "==", "response")
  .where("result.success", "==", true)
  .get()

// Calculate total cost
let totalCost = 0
responses.forEach(doc => {
  totalCost += doc.data().metrics.costUsd || 0
})

// Filter by company
const companyRequests = await db.collection("generator")
  .where("type", "==", "request")
  .where("job.company", "==", "Google")
  .get()
```

See [SCHEMA.md](./SCHEMA.md) for more query examples.

### Metrics Tracked

- Token usage (prompt + completion, per document)
- Generation cost in USD
- Generation duration in milliseconds
- Success/failure rates
- Error types and stages
- Provider selection distribution

---

## Troubleshooting

### Common Issues

**1. "Rate limit exceeded"**
- Wait 15 minutes or use editor account
- Check rate limit status in Firestore

**2. "GCS upload failed"**
- Verify bucket exists and function has write permissions
- Check GCS bucket policies
- Ensure environment variables are set correctly

**3. "Mock data not loading"**
- Ensure `OPENAI_MOCK_MODE=true` or `GEMINI_MOCK_MODE=true` in `.env`
- Restart emulators after changing env vars

**4. "Signed URL expired"**
- URLs expire after 1 hour (viewers) or 7 days (editors)
- Re-generate the document to get new URL
- Check `urlExpiresIn` field in response

**5. "Firestore permission denied"**
- Verify Firebase Auth token is valid
- Check if user has correct role (editor vs viewer)
- Verify Firestore security rules

### Debug Mode

Enable detailed logging:

```bash
# Functions
DEBUG=generator:* npm run serve

# Web
GATSBY_LOG_LEVEL=verbose npm run develop
```

---

## What's Next?

### Optional Enhancements

These are **not required** for production but could be added later:

1. **Settings Editor UI** - Web interface for editors to update default personal info
   - Backend CRUD endpoints already exist (`/generator/defaults`)
   - Can currently manage via direct API calls

2. **Document History UI** - Web interface for editors to view past generations
   - Backend queries already work (see SCHEMA.md)
   - Can currently query Firestore directly

3. **Enhanced Rate Limiting** - Use user.uid instead of sessionId for authenticated users
   - Current implementation works fine
   - Would provide better cross-device tracking

4. **Additional Templates** - More resume styles beyond "modern"
   - Current "modern" template covers most use cases
   - Would require PDF template design work

5. **Batch Generation** - Generate multiple customized resumes at once
   - Useful for job seekers applying to many positions

---

## Contributing

This is a personal project, but feedback is welcome!

### Project Structure

- `functions/` - Cloud Functions (TypeScript)
- `web/` - Gatsby site (TypeScript + React)
- `docs/` - Documentation
- `scripts/` - Utility scripts (seeding, role management)

### Code Style

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Run `make lint` before committing
- Run `make test` to verify all tests pass

---

## License

Private project - All rights reserved.
