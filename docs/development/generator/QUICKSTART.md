# Quick Start - AI Resume Generator (Local Development)

> **TL;DR:** Set `GEMINI_MOCK_MODE=true` in `functions/.env.local` to test locally without an API key.

## Problem

When testing the AI Resume Generator locally, you get this error:

```
No API key available for Gemini. Set GOOGLE_API_KEY environment variable
or add gemini-api-key to Secret Manager.
```

## Solution: Use Mock Mode

Both OpenAI and Gemini providers support **mock mode** for local development. This returns realistic mock responses without calling the actual AI APIs.

### Step 1: Verify `.env.local` Configuration

Check `functions/.env.local` has these lines:

```bash
# OpenAI Mock Mode
OPENAI_MOCK_MODE=true

# Gemini Mock Mode
GEMINI_MOCK_MODE=true
```

✅ **This is already configured!** The `.env.local` file has been updated.

### Step 2: Rebuild Functions

```bash
cd functions
npm run build
```

### Step 3: Restart Emulators

```bash
# Terminal 1: Stop existing emulators (Ctrl+C) and restart
cd /home/jdubz/Development/portfolio
npm run emulators

# Terminal 2: Web dev server
cd web
npm run dev
```

### Step 4: Test

1. Visit: [http://localhost:8000/resume-builder](http://localhost:8000/resume-builder)
2. Select "Gemini" provider
3. Fill in job details
4. Click "Generate Resume"
5. ✅ Should work with mock responses!

---

## How It Works

### Mock Mode Behavior

**When `GEMINI_MOCK_MODE=true`:**

- ✅ No API key required
- ✅ Returns realistic mock resume content
- ✅ Instant response (no network call)
- ✅ Includes mock token usage and cost metrics
- ✅ Perfect for UI testing and development

**Example Mock Response:**

```json
{
  "resume": {
    "summary": "Experienced Full Stack Engineer with 8+ years...",
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "Example Corp",
        "highlights": ["Led development of microservices architecture", "Improved API response time by 40%"]
      }
    ],
    "skills": {
      "Languages": ["TypeScript", "Python", "Go"],
      "Frameworks": ["React", "Node.js", "Next.js"]
    }
  },
  "tokenUsage": {
    "inputTokens": 2000,
    "outputTokens": 1000,
    "totalCost": 0.0006
  }
}
```

### Provider Factory Logic

The `ai-provider.factory.ts` checks in this order:

1. **Mock Mode** (`GEMINI_MOCK_MODE=true`) → Use mock provider ✅ Current
2. **Environment Variable** (`GOOGLE_API_KEY=xxx`) → Use real API
3. **Secret Manager** (`gemini-api-key`) → Use production secret
4. **Error** → No API key available

---

## Option: Use Real Gemini API (Optional)

If you want to test with the **real** Gemini API (it's free!):

### Get a Free API Key

1. Visit: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Add to `.env.local`

```bash
# In functions/.env.local
GEMINI_MOCK_MODE=false  # Disable mock mode
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX  # Your real API key
```

### Rebuild and Restart

```bash
cd functions && npm run build
# Restart emulators (Ctrl+C and npm run emulators)
```

Now it will use the **real** Gemini API! 🚀

---

## Comparison: Mock vs Real

| Feature              | Mock Mode       | Real API                     |
| -------------------- | --------------- | ---------------------------- |
| **API Key Required** | ❌ No           | ✅ Yes (free)                |
| **Network Call**     | ❌ No           | ✅ Yes                       |
| **Response Time**    | ⚡ Instant      | 🐌 2-5 seconds               |
| **Cost**             | 💰 $0.00        | 💰 ~$0.0006/generation       |
| **Quality**          | 📝 Mock data    | 🎯 Real AI                   |
| **Rate Limits**      | ❌ None         | ✅ Yes (RPM/TPM)             |
| **Best For**         | UI testing, dev | Integration testing, staging |

---

## Troubleshooting

### Error: "Secret [projects/.../secrets/gemini-api-key] not found"

**Cause:** You're running with `GEMINI_MOCK_MODE=false` but no API key set.

**Fix:**

```bash
# Option 1: Enable mock mode
echo "GEMINI_MOCK_MODE=true" >> functions/.env.local

# Option 2: Add real API key
echo "GOOGLE_API_KEY=your-api-key" >> functions/.env.local
```

### Error: "OPENAI_API_KEY is required"

**Fix:**

```bash
echo "OPENAI_MOCK_MODE=true" >> functions/.env.local
```

### Changes Not Taking Effect

**Fix:** Rebuild and restart:

```bash
cd functions && npm run build
# Restart emulators (Ctrl+C and npm run emulators)
```

### Still Getting Errors?

Check the function logs in your emulator terminal. Look for:

```
[INFO] Creating AI provider: gemini
[INFO] Using Gemini mock mode (no API key required)  ✅ Good!
```

OR

```
[ERROR] No Gemini API key found in environment or Secret Manager  ❌ Bad!
```

---

## Production Deployment

**Note:** Mock mode is only for local development!

In production, you **must** use a real API key:

### Option 1: Environment Variable (Recommended)

```bash
# Set in Firebase Functions config
firebase functions:config:set gemini.api_key="YOUR_API_KEY"
```

### Option 2: Secret Manager (More Secure)

```bash
# Add to Secret Manager
echo -n "YOUR_API_KEY" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --project=portfolio-staging
```

The factory will automatically detect Secret Manager in production.

---

## Next Steps

1. ✅ Test with mock mode locally
2. ✅ Verify both Gemini and OpenAI providers work
3. 🔄 Get real Gemini API key for staging testing
4. 🔄 Deploy to staging with real API
5. 🔄 Production deployment

---

**Questions?** Check the main [README.md](./README.md) for architecture details.
