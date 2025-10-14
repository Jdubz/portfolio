# Portfolio Development Setup

**Quick Start**: Get the portfolio running locally in 10 minutes

---

## Prerequisites

- **Node.js 20+** (required for Gatsby 5 and Cloud Functions Gen 2)
- **npm 8+**
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**

---

## 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/Jdubz/portfolio.git
cd portfolio

# Install all dependencies (root, web, functions)
npm install
```

---

## 2. Environment Configuration

### Web Environment Files

Three environment files control web configuration:

**`.env.development`** (local development):
```env
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=localhost
FIRESTORE_DATABASE_ID=(default)
```

**`.env.staging`** (already configured):
- Points to `staging.joshwentworth.com`
- Uses `portfolio-staging` Firestore database

**`.env.production`** (already configured):
- Points to `joshwentworth.com`
- Uses `portfolio` Firestore database

### Functions Environment (Optional)

Create `functions/.env` for AI generation (optional for local dev):

```bash
# AI Provider API Keys (optional - use mock mode instead)
OPENAI_API_KEY=sk-proj-...              # For OpenAI GPT-4o
GOOGLE_API_KEY=...                      # For Google Gemini 2.0 Flash

# Mock Mode (recommended for local dev - no API keys needed!)
OPENAI_MOCK_MODE=true                   # Use mock data instead of real AI
GEMINI_MOCK_MODE=true                   # Use mock data instead of real AI

# Emulator (automatically set when emulators running)
FUNCTIONS_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

**Recommendation:** Use mock mode for local development (no API keys needed, instant responses, no costs).

---

## 3. Start Development Environment

### Option A: Using Makefile (Recommended)

**Terminal 1** - Start Firebase Emulators:
```bash
make firebase-emulators
```

**Terminal 2** - Start Gatsby Dev Server:
```bash
make dev
```

### Option B: Using npm scripts

**Terminal 1**:
```bash
npm run firebase:serve
```

**Terminal 2**:
```bash
npm run dev
```

### Emulator Ports

Once running, you'll have:
- **Gatsby Dev Server**: http://localhost:8000
- **Emulator UI**: http://localhost:4000
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **Storage**: http://localhost:9199

---

## 4. Seed Emulator Data (First Time Only)

Seed the emulator with test users and sample data:

```bash
make seed-emulators
```

This creates:
- **Test Editor**: `contact@joshwentworth.com` / `testpassword123`
- **Test Viewer**: `test@example.com` / `testpassword123`
- Sample experience entries and blurbs
- Generator default settings

---

## 5. Verify Setup

### Check Health Endpoints

```bash
# Contact form
curl http://localhost:5001/static-sites-257923/us-central1/handleContactForm/health

# Experience API
curl http://localhost:5001/static-sites-257923/us-central1/manageExperience/health

# Generator API
curl http://localhost:5001/static-sites-257923/us-central1/manageGenerator/generator/health
```

All should return `{"status": "healthy", ...}`.

### Test Pages

- **Home**: http://localhost:8000
- **Experience**: http://localhost:8000/experience
- **Resume Builder**: http://localhost:8000/resume-builder
- **Contact**: http://localhost:8000/#contact

---

## 6. AI Resume Generator Setup (Optional)

The generator works out of the box with mock mode. For real AI:

### Get API Keys

**Option 1: Google Gemini (96% cheaper)**
1. Get API key: https://ai.google.dev/
2. Add to `functions/.env`: `GOOGLE_API_KEY=...`
3. Set `GEMINI_MOCK_MODE=false`

**Option 2: OpenAI**
1. Get API key: https://platform.openai.com/api-keys
2. Add to `functions/.env`: `OPENAI_API_KEY=sk-proj-...`
3. Set `OPENAI_MOCK_MODE=false`

### Seed Generator Defaults

```bash
make seed-generator-defaults
```

This creates the `generator/personal-info` document with default personal information.

### Test Generation

1. Navigate to http://localhost:8000/resume-builder
2. Sign in as editor: `contact@joshwentworth.com` / `testpassword123`
3. Click "Document Builder" tab
4. Fill in job details and click "Generate"
5. Watch real-time progress and download PDFs

---

## 7. Editor Role Management

Editors have enhanced privileges:
- 20 requests per 15 min (vs 10 for viewers)
- 7-day signed URLs (vs 1 hour)
- Access to document history
- Can customize AI prompts

### Grant Editor Role

```bash
make editor-add EMAIL=user@example.com
```

### Check User Role

```bash
make editor-check EMAIL=user@example.com
```

**Note**: Users must sign out and sign back in for role changes to take effect.

---

## Common Development Commands

### Development

```bash
make dev                    # Start Gatsby dev server
make firebase-emulators     # Start Firebase emulators
make kill                   # Stop all servers and clean cache
```

### Testing

```bash
npm test                    # Run all tests (web + functions)
npm run test:web            # Web tests only
npm run test:functions      # Functions tests only
make lint                   # Lint all code
make lint-fix               # Auto-fix linting issues
```

### Building

```bash
npm run build               # Build production bundle
npm run build:web           # Build web only
npm run build:functions     # Build functions only
```

### Database Operations

```bash
make seed-emulators                 # Seed local emulator
make seed-generator-defaults        # Seed generator (local)
make seed-generator-staging         # Seed generator (staging)
make seed-generator-prod            # Seed generator (production)
```

### AI Prompts Migration

```bash
make migrate-ai-prompts-emulator    # Update AI prompts (local)
make migrate-ai-prompts-staging     # Update AI prompts (staging)
make migrate-ai-prompts-prod        # Update AI prompts (production)
```

---

## Git Workflow

```
feature_branch → staging → main
```

**Steps:**
1. Create feature branch from `staging`
2. Make changes and test locally
3. Create PR: `feature → staging`
4. Test on staging deployment
5. Create PR: `staging → main`
6. Production deployment

**Rules:**
- ✅ Create feature branches from `staging`
- ✅ Test on staging before merging to main
- ❌ Never push directly to `main`
- ❌ Never commit secrets or API keys

---

## Deployment

### Staging

```bash
# Push to staging branch (auto-deploys)
git push origin staging

# Or manual deploy
make deploy-staging
```

**URL**: https://staging.joshwentworth.com

### Production

```bash
# Create PR: staging → main, then merge
# Auto-deploys on merge

# Or manual deploy
make deploy-prod
```

**URL**: https://joshwentworth.com

---

## Troubleshooting

### Port Already in Use

```bash
# Kill all dev servers
make kill

# Or manually
lsof -ti:8000 | xargs kill -9  # Gatsby
lsof -ti:5001 | xargs kill -9  # Functions
```

### Gatsby Build Fails

```bash
# Clean cache and rebuild
npm run clean
npm run build
```

### Emulator Data Issues

```bash
# Clear all emulator data
rm -rf emulator-data/*

# Re-seed
make seed-emulators
```

### "Permission Denied" Errors

1. Sign out and sign back in (refresh auth token)
2. Verify user has correct role: `make editor-check EMAIL=...`
3. Check Firebase console for Firestore rules

### AI Generation Fails

1. Check health endpoint for mock mode status
2. Verify API keys in `functions/.env` (if using real APIs)
3. Check emulator logs for errors
4. Try switching providers (OpenAI ↔ Gemini)

### "Rate Limit Exceeded"

Wait 15 minutes, or sign in as editor for higher limit (20 vs 10 requests per 15 min).

---

## Environment Comparison

| Feature | Local | Staging | Production |
|---------|-------|---------|------------|
| **Domain** | localhost:8000 | staging.joshwentworth.com | joshwentworth.com |
| **Firestore** | (default) | portfolio-staging | portfolio |
| **Functions** | Emulator | *-staging suffix | Production |
| **Storage** | Emulator | *-staging bucket | Production bucket |
| **Auth** | Emulator users | Firebase Auth | Firebase Auth |
| **AI** | Mock mode | Real APIs | Real APIs |

---

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand system design
- Read [NEXT_STEPS.md](./NEXT_STEPS.md) for prioritized outstanding work
- Explore Emulator UI: http://localhost:4000
- Review Firestore data structure
- Test all features locally before deploying

---

## Getting Help

- **Makefile Commands**: Run `make` to see all available commands
- **Documentation**: See `docs/` directory
- **Issues**: https://github.com/Jdubz/portfolio/issues
- **Claude Code Guide**: See `CLAUDE.md` in root directory

---

**Last Updated**: January 2025
