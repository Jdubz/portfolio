# Gemini Authentication Setup

> **⚠️ IMPORTANT UPDATE (2025):** This document describes the current implementation using direct Gemini API calls. However, **Firebase explicitly recommends migrating to Firebase Genkit** for production Cloud Functions. See [FIREBASE_GENKIT_MIGRATION.md](./FIREBASE_GENKIT_MIGRATION.md) for the recommended approach.
>
> **Firebase's Official Statement:**
> > "Calling the Gemini API directly from your web app using the Google Gen AI SDK is only for prototyping and exploring the Gemini generative AI models... you should use Firebase AI Logic instead."
> > — [Firebase AI Logic Documentation](https://firebase.google.com/docs/ai-logic)

## Current Issue (Staging Deployment)

The resume generator is failing in staging with:
```
No API key available for Gemini. Set GEMINI_MOCK_MODE=true for local dev,
GOOGLE_API_KEY environment variable, or add gemini-api-key to Secret Manager.
```

## Immediate Fix: Add Gemini API Key to Secret Manager

**Note:** This is a temporary fix for the current implementation. The long-term solution is migrating to Firebase Genkit (see migration plan linked above).

### Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Add to Secret Manager

```bash
# Create the secret (first time)
echo 'YOUR_GEMINI_API_KEY_HERE' | gcloud secrets create gemini-api-key \
  --data-file=- \
  --project=static-sites-257923

# Or update existing secret (if it exists)
echo 'YOUR_GEMINI_API_KEY_HERE' | gcloud secrets versions add gemini-api-key \
  --data-file=- \
  --project=static-sites-257923
```

### Step 3: Grant Access to Cloud Function Service Account

```bash
# Grant the generator function's service account access to the secret
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=static-sites-257923
```

### Step 4: Verify Deployment Configuration

The function deployment is already configured to access `gemini-api-key` from Secret Manager in [generator.ts:731](../../functions/src/generator.ts#L731):

```typescript
export const manageGenerator = https.onRequest(
  {
    secrets: ["openai-api-key", "gemini-api-key"],  // Already configured
    serviceAccount: "cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com",
  },
  handleGeneratorRequest
)
```

## Current Authentication Flow (Legacy)

⚠️ **This approach is for prototyping only according to Firebase**

The `ai-provider.factory.ts` checks for Gemini API keys in this order:

1. **Mock Mode** (local development):
   ```bash
   export GEMINI_MOCK_MODE=true
   ```

2. **Environment Variable** (manual setup):
   ```bash
   export GOOGLE_API_KEY=your-api-key
   ```

3. **Secret Manager** (production):
   - Automatically retrieved from `gemini-api-key` secret
   - Cached to avoid repeated Secret Manager calls

## Recommended Approach: Firebase Genkit (Production)

According to Firebase's 2025 best practices, production applications should use **Firebase Genkit** instead of direct API calls.

### Why Genkit?

| Feature | Current (Direct API) | Genkit (Recommended) |
|---------|---------------------|----------------------|
| **Purpose** | Prototyping only ❌ | Production-ready ✅ |
| **Secret Management** | Manual code | Automatic via `defineSecret()` |
| **Authentication** | Custom middleware | Built-in `authPolicy` |
| **Streaming** | Not supported | Built-in `sendChunk()` |
| **Monitoring** | Manual logging | Firebase Console dashboards |
| **Dev Tools** | None | Genkit Developer UI |
| **Multi-provider** | Custom factory | Built-in plugins |

### Migration Path

See [FIREBASE_GENKIT_MIGRATION.md](./FIREBASE_GENKIT_MIGRATION.md) for complete migration plan (6-9 days estimated).

Quick example of the Genkit approach:

```typescript
// config/secrets.ts
import { defineSecret } from 'firebase-functions/params'
export const geminiApiKey = defineSecret('GEMINI_API_KEY')

// flows/resume.flow.ts
import { ai } from '@genkit-ai/core'
export const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResume',
    inputSchema: ResumeInputSchema,
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (input, { sendChunk }) => {
    const { stream, output } = await ai.generateStream({
      model: gemini20FlashExp,
      prompt: buildResumePrompt(input),
    })

    for await (const chunk of stream) {
      sendChunk(chunk.text)  // Stream to client
    }

    return (await output).text
  }
)

// index.ts
export const generateResume = onCallGenkit(
  {
    secrets: [geminiApiKey],
    enforceAppCheck: true,
    authPolicy: hasClaim('email_verified'),
  },
  generateResumeFlow
)
```

## Local Development

### Option 1: Mock Mode (Recommended)
```bash
export GEMINI_MOCK_MODE=true
npm run dev
```

### Option 2: Use Your Own API Key
```bash
export GOOGLE_API_KEY=your-api-key-here
npm run dev
```

### Option 3: Add to .env (Git-ignored)
```bash
# functions/.env
GOOGLE_API_KEY=your-api-key-here
```

## Testing

The test suite automatically uses mock mode when `NODE_ENV=test` or `JEST_WORKER_ID` is set.

## Cost Control

Gemini pricing (as of 2025):
- Input: $0.10 per 1M tokens (92% cheaper than OpenAI)
- Output: $0.40 per 1M tokens (92% cheaper than OpenAI)
- Typical resume generation: ~$0.0006 (vs $0.015 for OpenAI)

Rate limiting is enforced:
- Viewers: 10 requests per 15 minutes
- Editors: 20 requests per 15 minutes

## Troubleshooting

### "No API key available for Gemini"
- **Cause**: `gemini-api-key` secret not in Secret Manager
- **Solution**: Follow Step 2 above

### "Permission denied on secret"
- **Cause**: Service account lacks access to secret
- **Solution**: Follow Step 3 above

### "Model not found" or "Invalid API key"
- **Cause**: Invalid or expired API key
- **Solution**: Generate new key from AI Studio, update secret

### "Rate limit exceeded"
- **Cause**: Too many requests to Gemini API
- **Solution**: Normal - wait 15 minutes or use editor account for higher limits

## Next Steps

1. **Immediate:** Follow steps 1-3 above to add `gemini-api-key` to Secret Manager (fixes current staging issue)
2. **Short-term (Optional):** Test Genkit locally with Developer UI
3. **Long-term (Recommended):** Migrate to Firebase Genkit (see [migration plan](./FIREBASE_GENKIT_MIGRATION.md))

## References

- [Firebase AI Logic Documentation](https://firebase.google.com/docs/ai-logic) - Why direct API is prototyping-only
- [Firebase Genkit Documentation](https://firebase.google.com/docs/genkit) - Recommended production approach
- [Streaming Cloud Functions with Genkit](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/) - Official best practices
- [Google AI Studio](https://aistudio.google.com/apikey) - Get API key (temporary fix)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
