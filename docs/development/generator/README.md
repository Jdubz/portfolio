# AI Resume Generator# AI Resume Generator

> **Status:** Phase 2.0a Complete ✅ | Ready for Testing & Deployment> **Status:** Phase 1 Complete ✅ | Phase 2 Ready to Start

> **Last Updated:** October 11, 2025> **Last Updated:** October 10, 2025

> **Branch:** `resume-generator`

AI-powered resume generator using OpenAI GPT-4o, Puppeteer PDF export, and Firestore tracking.

AI-powered resume and cover letter generator with multi-provider support (OpenAI GPT-4o, Google Gemini), Puppeteer PDF export, and Firestore tracking.

## Quick Links

## Quick Links

- **[Phase 2 Plan](./PHASE_2_PLAN.md)** - Next steps for full feature set (2-3 weeks)

- **[Firestore Schema](./SCHEMA.md)** - Database structure and types reference- **[Firestore Schema](./SCHEMA.md)** - Database structure reference

- **[PLANNED_IMPROVEMENTS.md](../PLANNED_IMPROVEMENTS.md)** - Overall project roadmap- **[PLANNED_IMPROVEMENTS.md](../PLANNED_IMPROVEMENTS.md)** - Overall project roadmap

---## Phase 1: What's Working ✅

## Current Status### Features

- ✅ Resume generation with OpenAI GPT-4o

### Phase 1: MVP ✅ COMPLETE- ✅ PDF export with logo/avatar support

- ✅ Job-tailored content based on description

**Features:**- ✅ Firestore request/response tracking

- ✅ Resume generation with OpenAI GPT-4o- ✅ Token usage and cost metrics

- ✅ Cover letter generation (backend complete)- ✅ Rate limiting (10 requests/15min)

- ✅ PDF export with logo/avatar support- ✅ Mock mode for local dev (OPENAI_MOCK_MODE=true)

- ✅ Job-tailored content based on description- ✅ Type-safe end-to-end

- ✅ Firestore request/response tracking

- ✅ Token usage and cost metrics### Architecture

- ✅ Rate limiting (10 requests/15min)

- ✅ Mock mode for local dev (`OPENAI_MOCK_MODE=true`)**Backend** ([functions/src/](../../functions/src/))

- ✅ Type-safe end-to-end```

- ✅ Comprehensive test coverage (211 tests passing)generator.ts # Cloud Function (POST /generator/generate)

├── services/

### Phase 2.0a: AI Provider Selection ✅ COMPLETE│ ├── generator.service.ts # Firestore CRUD

│ ├── openai.service.ts # OpenAI structured outputs

**Features:**│ └── pdf.service.ts # Puppeteer + Handlebars

- ✅ Multi-provider support (OpenAI + Gemini)├── templates/

- ✅ Provider selection UI with cost comparison│ └── resume-modern.hbs # PDF template

- ✅ LocalStorage preference persistence└── types/

- ✅ 96% cost savings with Gemini vs OpenAI └── generator.types.ts # Shared types

- ✅ Factory pattern for provider abstraction```

- ✅ Provider-specific cost calculation

- ✅ Comprehensive unit tests (17 factory + 15 Gemini tests)**Frontend** ([web/src/](../../web/src/))

```````

**Cost Comparison:**pages/resume-builder.tsx       # Basic UI at /resume-builder

- Gemini 2.0 Flash: **$0.0011/generation** (default)api/generator-client.ts        # API client (28 tests)

- OpenAI GPT-4o: **$0.0275/generation**types/generator.ts             # Shared types

- **Savings: 96% cheaper with Gemini**```



**What's Ready:**### Key Decisions

- ✅ Backend: Fully implemented and tested

- ✅ Frontend: Provider selection dropdown with cost display**What we shipped:**

- ✅ Tests: 211/211 passing- Resume-only generation (cover letter service exists but not exposed)

- 🔄 Next: Local testing → Staging deployment → Production- Base64 PDF response (no GCS storage yet)

- Public access (no authentication required)

---- Single template (modern style)



## Architecture**Why:**

- Prove core generation works

### Backend (`functions/src/`)- Minimize scope for MVP

- Faster iteration

```text

generator.ts                    # Cloud Function (POST /generator/generate)## Current Limitations

├── services/

│   ├── generator.service.ts    # Firestore CRUD1. **No cover letter in UI** - Service implemented, needs checkbox

│   ├── ai-provider.factory.ts  # Provider factory (NEW ✨)2. **No document history** - PDFs not stored, need GCS

│   ├── gemini.service.ts       # Gemini provider (NEW ✨)3. **No authentication** - All users are viewers, no editor features

│   ├── openai.service.ts       # OpenAI provider (refactored)4. **Single template** - Only "modern" style

│   └── pdf.service.ts          # Puppeteer + Handlebars5. **Rate limiting applies to all** - No bypass for editors

├── templates/

│   └── resume-modern.hbs       # PDF template## Local Development

└── types/

    └── generator.types.ts      # Shared types + AIProvider interface### Prerequisites

``````bash

# 1. Install dependencies

**Key Components:**cd functions && npm install



1. **AI Provider Factory** (`ai-provider.factory.ts`)# 2. Set environment variables

   - Factory pattern for creating provider instancesecho "OPENAI_MOCK_MODE=true" >> functions/.env.local

   - Environment-based configuration (API keys from Secret Manager)echo "ENVIRONMENT=development" >> functions/.env.local

   - Mock mode support for development

   - 17 passing unit tests# 3. Seed defaults document (one-time)

# Via Firestore console or script - see SCHEMA.md

2. **Gemini Provider** (`gemini.service.ts`)```

   - Uses `@google/generative-ai` SDK

   - Model: `gemini-2.0-flash-exp`### Run

   - Structured JSON output with schema validation```bash

   - Temperature 0 for deterministic outputs# Terminal 1: Start emulators

   - 15 passing unit testsnpm run emulators



3. **OpenAI Provider** (`openai.service.ts`)# Terminal 2: Start web dev server

   - Refactored to implement AIProvider interfacecd web && npm run dev

   - Model: `gpt-4o-2024-08-06````

   - Structured outputs with JSON schema

   - Maintains all existing functionality**Test:** http://localhost:8000/resume-builder



4. **Generator Service** (`generator.ts`)### Testing

   - Accepts `provider` parameter in requests```bash

   - Validates provider selection ('openai' | 'gemini')# All tests (136 total)

   - Uses factory to instantiate appropriate providernpm test

   - Tracks provider used in response metadata

   - Provider-specific cost calculation# Generator tests only

cd functions && npm test -- generator

### Frontend (`web/src/`)```



```text## Deployment

pages/resume-builder.tsx        # Main UI at /resume-builder

├── Provider selection dropdown**Not yet deployed to production**

├── Job description input

├── Generate type selector (resume/cover letter/both)Phase 1 is working in local dev. Deployment planned after Phase 2.3 (authentication) is complete.

├── Cost display (estimated + actual)

└── PDF download## Getting Help



api/generator-client.ts         # API client (28 tests)**Found a bug?** Open an issue with:

types/generator.ts              # Shared types- What you tried

```- Expected vs actual behavior

- Error logs (check browser console + function logs)

**UI Features:**

- Provider dropdown (Gemini default, OpenAI premium)**Want to contribute?** See [Phase 2 Plan](./PHASE_2_PLAN.md) for tasks.

- Model name display (e.g., "gemini-2.0-flash-exp")

- Estimated cost before generation## Recent Changes

- Actual cost after generation

- LocalStorage persistence for provider preference- `062f1f5` - docs: Phase 1 status and Phase 2 plan

- `75f2278` - refactor: type consistency fixes

---- `d46eb49` - fix: Firestore undefined value errors

- `c598985` - feat: logo/avatar in PDF template

## Environment Setup- `eeb6773` - feat: Phase 1 MVP implementation



### Required Environment VariablesSee full history: `git log --oneline --grep="resume\|generator" -i`


**Cloud Functions:**

```bash
GOOGLE_API_KEY          # For Gemini (Secret Manager)
OPENAI_API_KEY          # For OpenAI (Secret Manager)
OPENAI_MOCK_MODE=true   # Optional: Local dev mock mode
```````

**Secret Manager Setup:**

```bash
# Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --project=portfolio-staging

# OpenAI API Key (if not already set)
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create OPENAI_API_KEY \
  --data-file=- \
  --project=portfolio-staging
```

### Cloud Function Configuration

**manageGenerator Function:**

- Memory: **1Gi** (increased for Puppeteer)
- Timeout: **120s** (increased for PDF generation)
- Runtime: Node.js 20
- Region: us-central1

---

## Testing

### Run All Tests

```bash
# Backend tests (169 passing)
cd functions
npm test

# Frontend tests (42 passing)
cd web
npm test

# Total: 211 tests passing ✅
```

### Key Test Suites

**Backend:**

- `ai-provider.factory.test.ts` - 17 tests (provider factory)
- `gemini.service.test.ts` - 15 tests (Gemini integration)
- `openai.service.test.ts` - Existing coverage
- `generator.integration.test.ts` - End-to-end tests

**Frontend:**

- `generator-client.test.ts` - 28 tests (API client)

---

## Local Development

### 1. Start Emulators

```bash
# Terminal 1: Start Firebase emulators
npm run emulators
```

### 2. Seed Test Data

```bash
# Terminal 2: Seed Firestore with defaults
make seed-generator
```

### 3. Start Web Dev Server

```bash
# Terminal 3: Start Gatsby dev
cd web
npm run dev
```

### 4. Test the UI

Visit: [http://localhost:8000/resume-builder](http://localhost:8000/resume-builder)

**Test both providers:**

1. Select "Gemini" → Generate → Verify result
2. Select "OpenAI" → Generate → Verify result
3. Check localStorage persistence (reload page, verify selection)
4. Verify cost calculations display correctly

---

## Deployment

### Staging

```bash
# Deploy functions
firebase deploy --only functions:manageGenerator --project portfolio-staging

# Verify deployment
curl -X POST https://us-central1-portfolio-staging.cloudfunctions.net/manageGenerator/generator/generate \
  -H "Content-Type: application/json" \
  -d '{"jobDescription":"Software Engineer","generateType":"resume","provider":"gemini"}'
```

### Production

```bash
# Deploy functions
firebase deploy --only functions:manageGenerator --project portfolio-prod

# Add production secrets (if not already done)
echo -n "PROD_GEMINI_KEY" | gcloud secrets create GOOGLE_API_KEY \
  --data-file=- \
  --project=portfolio-prod
```

---

## Roadmap: Phase 2 (Next Steps)

### Phase 2.1: Cover Letter UI Integration

**Timeline:** 1-2 days | **Status:** Not Started

- [ ] Add "Also generate cover letter" checkbox
- [ ] Handle `generateType: "both"` in frontend
- [ ] Display two download buttons when both generated
- [ ] Show separate cost metrics for each document
- [ ] Test with both AI providers

**Files to Update:**

- `web/src/pages/resume-builder.tsx` - Add checkbox and dual download UI
- Backend already fully supports cover letters ✅

### Phase 2.2: GCS Storage & Document History

**Timeline:** 2-3 days | **Status:** Not Started

- [ ] Create GCS bucket with lifecycle policy
- [ ] Update generator to upload PDFs to GCS
- [ ] Add signed URL generation for downloads
- [ ] Create document history API endpoints
- [ ] Build history table UI
- [ ] Add "View History" page

### Phase 2.3: Authentication & Editor Features

**Timeline:** 3-4 days | **Status:** Not Started

- [ ] Add auth middleware to editor routes
- [ ] Create settings editor UI for defaults
- [ ] Implement avatar/logo upload to Firebase Storage
- [ ] Add role-based features (viewer vs editor)
- [ ] Higher rate limits for authenticated editors

### Phase 2.4: Prompt Management UI

**Timeline:** 2-3 days | **Status:** Not Started

- [ ] Create prompt editor UI
- [ ] Store prompt versions in Firestore
- [ ] A/B testing framework for prompts
- [ ] Rollback capability
- [ ] Performance metrics per prompt version

### Phase 2.5: Additional Templates

**Timeline:** 2-3 days | **Status:** Not Started

- [ ] Design 2-3 additional resume templates
- [ ] Template selection UI
- [ ] Template preview before generation
- [ ] Template-specific styling

### Phase 2.6: Code Quality & Polish

**Timeline:** 1 day | **Status:** Not Started

- [ ] Comprehensive error handling review
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation updates
- [ ] User-facing help text

**Total Phase 2 Estimate:** 12-17 days

---

## Key Technical Decisions

### Why Multi-Provider Support?

1. **Cost Optimization:** 96% savings with Gemini
2. **Risk Mitigation:** Not locked into one vendor
3. **Quality Options:** Users can choose based on preference
4. **Future Flexibility:** Easy to add Claude, Llama, etc.

### Why Gemini as Default?

1. **Cost:** $0.0011 vs $0.0275 per generation
2. **Quality:** Comparable quality for resume generation
3. **Speed:** Very fast (gemini-2.0-flash-exp)
4. **Free Tier:** Available for testing

### Why Factory Pattern?

1. **Extensibility:** Easy to add new providers
2. **Testability:** Mock providers for testing
3. **Consistency:** All providers implement same interface
4. **Maintainability:** Provider-specific logic encapsulated

### Why Firestore for Tracking?

1. **Reproducibility:** Complete request snapshots
2. **Debugging:** Trace from response → request → inputs
3. **Analytics:** Token usage, costs, success rates
4. **Audit Trail:** Full history of generations

---

## Monitoring & Analytics

### Key Metrics to Track (Post-Deployment)

**Usage:**

- Total generations per day/week/month
- Provider distribution (% Gemini vs OpenAI)
- Generate type distribution (resume vs cover letter vs both)

**Performance:**

- Average generation time by provider
- Success rate by provider
- Error rates and types

**Cost:**

- Total cost per provider
- Average cost per generation
- Cost trends over time

**Quality:**

- User feedback/ratings
- Regeneration rate (indicates quality issues)

### Billing Alerts

Set up alerts for cost thresholds:

- Gemini: $5/month (conservative for 96% cheaper model)
- OpenAI: $50/month (higher threshold for premium users)

---

## Troubleshooting

### Common Issues

**Issue:** Generator timeout (120s exceeded)
**Solution:** Check Puppeteer memory usage, verify 1Gi allocation, optimize template rendering

**Issue:** Hallucinated content in generated resumes
**Solution:** Verify temperature=0, check prompt instructions, review AI provider prompts

**Issue:** PDF generation fails
**Solution:** Check Puppeteer logs, verify template syntax, ensure logo/avatar URLs accessible

**Issue:** Provider selection not persisting
**Solution:** Check browser localStorage, verify localStorage key matches code

**Issue:** Cost calculation incorrect
**Solution:** Verify token counts from provider response, check pricing constants

### Debug Mode

Enable verbose logging:

```bash
# In Cloud Functions
firebase functions:config:set debug.enabled=true

# Locally
OPENAI_MOCK_MODE=true npm run emulators
```

---

## Security Considerations

### API Key Management

- ✅ All API keys stored in Secret Manager
- ✅ Never commit API keys to git
- ✅ Function service account has minimal permissions
- ✅ Rate limiting prevents abuse (10 req/15min)

### Data Privacy

- ✅ User data stored in Firestore (not sent to AI providers beyond generation)
- ✅ Generated PDFs can be stored in GCS with signed URLs (Phase 2.2)
- ✅ No PII logged in function logs

### Input Validation

- ✅ All inputs validated with Zod schemas
- ✅ Job description max length enforced
- ✅ Provider selection validated against enum
- ✅ Generate type validated against enum

---

## Contributing

### Adding a New AI Provider

1. **Create Provider Service** (`services/your-provider.service.ts`)

   ```typescript
   import { AIProvider } from "../types/generator.types"

   export class YourProvider implements AIProvider {
     async generateResume(/* params */) {
       /* ... */
     }
     async generateCoverLetter(/* params */) {
       /* ... */
     }
     calculateCost(/* params */) {
       /* ... */
     }
   }
   ```

2. **Update Factory** (`ai-provider.factory.ts`)

   ```typescript
   case 'your-provider':
     return new YourProvider(apiKey);
   ```

3. **Update Types** (`types/generator.types.ts`)

   ```typescript
   type AIProviderType = "openai" | "gemini" | "your-provider"
   ```

4. **Add Tests** (`services/__tests__/your-provider.service.test.ts`)
   - Test generateResume
   - Test generateCoverLetter
   - Test calculateCost
   - Test error handling

5. **Update UI** (`web/src/pages/resume-builder.tsx`)

   ```tsx
   <option value="your-provider">Your Provider (model-name)</option>
   ```

---

## References

- **[Firestore Schema](./SCHEMA.md)** - Complete database structure
- **[OpenAI API Docs](https://platform.openai.com/docs)** - OpenAI integration
- **[Gemini API Docs](https://ai.google.dev/docs)** - Gemini integration
- **[Puppeteer Docs](https://pptr.dev/)** - PDF generation
- **[Firebase Functions](https://firebase.google.com/docs/functions)** - Cloud deployment

---

## Success Criteria

### Phase 2.0a Success Criteria ✅

All criteria met:

- [x] Can generate resume with both Gemini and OpenAI
- [x] UI clearly shows which provider is selected
- [x] Cost accurately reflects provider used
- [x] Provider preference persists across sessions
- [x] Default to Gemini (cheaper option)
- [x] All tests passing (211 tests)
- [x] Type-safe end-to-end
- [x] Zero lint errors

### Overall Project Success Criteria

- [ ] Production deployment with both providers
- [ ] User-facing documentation published
- [ ] Cost monitoring and alerts configured
- [ ] Phase 2.1-2.6 features implemented
- [ ] User feedback collected and incorporated
- [ ] Performance metrics tracking enabled

---

**Ready for testing and deployment!** 🚀

For questions or issues, check the troubleshooting section above or review the Firestore schema documentation.
