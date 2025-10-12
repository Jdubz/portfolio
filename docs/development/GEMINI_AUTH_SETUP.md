# Gemini Authentication Setup

## Current Issue (Staging Deployment)

The resume generator is failing in staging with:
```
No API key available for Gemini. Set GEMINI_MOCK_MODE=true for local dev,
GOOGLE_API_KEY environment variable, or add gemini-api-key to Secret Manager.
```

## Solution: Add Gemini API Key to Secret Manager

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
  --member="serviceAccount:generator-runtime@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=static-sites-257923
```

### Step 4: Update Function Deployment (if needed)

The function deployment should already be configured to access `gemini-api-key` from Secret Manager. If not, ensure the deployment includes:

```bash
--set-secrets=GEMINI_API_KEY=gemini-api-key:latest
```

Or in the function configuration, add `gemini-api-key` to the secrets list.

## Current Authentication Flow

The `ai-provider.factory.ts` checks for Gemini API keys in this order:

1. **Mock Mode** (local development):
   ```bash
   export GEMINI_MOCK_MODE=true
   ```

2. **Environment Variable** (Firebase AI automatic):
   ```bash
   export GOOGLE_API_KEY=your-api-key
   ```

3. **Secret Manager** (production):
   - Automatically retrieved from `gemini-api-key` secret
   - Cached to avoid repeated Secret Manager calls

## Firebase Recommended Approach

According to [Firebase documentation](https://firebase.google.com/docs/vertex-ai/get-started), there are two approaches:

### Option A: Generative AI SDK with API Keys (Current)
- Uses `@google/generative-ai` package
- Requires API key from Google AI Studio
- Simpler setup, works everywhere
- **Currently implemented** ✅

### Option B: Vertex AI SDK with ADC (Alternative)
- Uses `@google-cloud/vertexai` package
- Uses Application Default Credentials
- No API key needed in production
- Better for enterprise deployments
- Requires more setup

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

## Next Steps (Optional Migration to Vertex AI)

If you want to migrate to Vertex AI with ADC (no API keys needed):

1. Install Vertex AI SDK:
   ```bash
   npm install @google-cloud/vertexai -w contact-form-function
   ```

2. Update `gemini.service.ts` to use Vertex AI SDK

3. Grant Vertex AI permissions to service account:
   ```bash
   gcloud projects add-iam-policy-binding static-sites-257923 \
     --member="serviceAccount:generator-runtime@static-sites-257923.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

4. Enable Vertex AI API:
   ```bash
   gcloud services enable aiplatform.googleapis.com --project=static-sites-257923
   ```

This is a more robust solution for production but requires more setup.

## References

- [Google AI Studio](https://aistudio.google.com/apikey)
- [Firebase Vertex AI Docs](https://firebase.google.com/docs/vertex-ai/get-started)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
