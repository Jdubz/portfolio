# AI Resume Generator

> **Status:** Phase 1 Complete ✅ | Phase 2 Ready to Start
> **Last Updated:** October 10, 2025

AI-powered resume generator using OpenAI GPT-4o, Puppeteer PDF export, and Firestore tracking.

## Quick Links

- **[Phase 2 Plan](./PHASE_2_PLAN.md)** - Next steps for full feature set (2-3 weeks)
- **[Firestore Schema](./SCHEMA.md)** - Database structure reference
- **[PLANNED_IMPROVEMENTS.md](../PLANNED_IMPROVEMENTS.md)** - Overall project roadmap

## Phase 1: What's Working ✅

### Features
- ✅ Resume generation with OpenAI GPT-4o
- ✅ PDF export with logo/avatar support
- ✅ Job-tailored content based on description
- ✅ Firestore request/response tracking
- ✅ Token usage and cost metrics
- ✅ Rate limiting (10 requests/15min)
- ✅ Mock mode for local dev (OPENAI_MOCK_MODE=true)
- ✅ Type-safe end-to-end

### Architecture

**Backend** ([functions/src/](../../functions/src/))
```
generator.ts              # Cloud Function (POST /generator/generate)
├── services/
│   ├── generator.service.ts   # Firestore CRUD
│   ├── openai.service.ts      # OpenAI structured outputs
│   └── pdf.service.ts         # Puppeteer + Handlebars
├── templates/
│   └── resume-modern.hbs      # PDF template
└── types/
    └── generator.types.ts     # Shared types
```

**Frontend** ([web/src/](../../web/src/))
```
pages/resume-builder.tsx       # Basic UI at /resume-builder
api/generator-client.ts        # API client (28 tests)
types/generator.ts             # Shared types
```

### Key Decisions

**What we shipped:**
- Resume-only generation (cover letter service exists but not exposed)
- Base64 PDF response (no GCS storage yet)
- Public access (no authentication required)
- Single template (modern style)

**Why:**
- Prove core generation works
- Minimize scope for MVP
- Faster iteration

## Current Limitations

1. **No cover letter in UI** - Service implemented, needs checkbox
2. **No document history** - PDFs not stored, need GCS
3. **No authentication** - All users are viewers, no editor features
4. **Single template** - Only "modern" style
5. **Rate limiting applies to all** - No bypass for editors

## Local Development

### Prerequisites
```bash
# 1. Install dependencies
cd functions && npm install

# 2. Set environment variables
echo "OPENAI_MOCK_MODE=true" >> functions/.env.local
echo "ENVIRONMENT=development" >> functions/.env.local

# 3. Seed defaults document (one-time)
# Via Firestore console or script - see SCHEMA.md
```

### Run
```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Start web dev server
cd web && npm run dev
```

**Test:** http://localhost:8000/resume-builder

### Testing
```bash
# All tests (136 total)
npm test

# Generator tests only
cd functions && npm test -- generator
```

## Deployment

**Not yet deployed to production**

Phase 1 is working in local dev. Deployment planned after Phase 2.3 (authentication) is complete.

## Getting Help

**Found a bug?** Open an issue with:
- What you tried
- Expected vs actual behavior
- Error logs (check browser console + function logs)

**Want to contribute?** See [Phase 2 Plan](./PHASE_2_PLAN.md) for tasks.

## Recent Changes

- `062f1f5` - docs: Phase 1 status and Phase 2 plan
- `75f2278` - refactor: type consistency fixes
- `d46eb49` - fix: Firestore undefined value errors
- `c598985` - feat: logo/avatar in PDF template
- `eeb6773` - feat: Phase 1 MVP implementation

See full history: `git log --oneline --grep="resume\|generator" -i`
