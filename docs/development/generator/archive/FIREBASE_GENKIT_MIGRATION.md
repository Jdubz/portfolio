# Firebase Genkit Migration Plan

## Executive Summary

Our current AI implementation uses the direct Gemini/OpenAI APIs, which Firebase explicitly states is "only for prototyping." According to [Firebase's 2025 best practices](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/), production Cloud Functions should use **Firebase Genkit with `onCallGenkit()`**.

## Why Migrate to Genkit?

### Current Issues (Direct API Approach)
- ❌ **Prototyping-only**: Firebase states direct Gemini API is "only for prototyping"
- ❌ **Security risks**: API keys can be exposed to malicious actors
- ❌ **Manual secret management**: Custom Secret Manager integration
- ❌ **No streaming**: Can't stream responses to clients
- ❌ **Limited monitoring**: No built-in AI monitoring dashboards
- ❌ **Manual auth**: Custom authentication middleware
- ❌ **No dev tools**: No local UI for testing prompts

### Genkit Benefits
- ✅ **Production-ready**: Official Firebase recommendation for production
- ✅ **Secure by default**: API keys in Cloud Secret Manager automatically
- ✅ **Built-in streaming**: Incremental responses with `sendChunk()`
- ✅ **AI monitoring**: Firebase Console dashboards for model performance
- ✅ **Integrated auth**: App Check + Firebase Auth declaratively
- ✅ **Developer UI**: Local UI for testing, debugging, tracing
- ✅ **Multi-provider**: OpenAI, Anthropic, Ollama support out of the box
- ✅ **RAG support**: Vector databases (Chroma, Pinecone, Firestore)
- ✅ **Tool calling**: Built-in support for function/tool calling

## Firebase's Official Recommendation

> "For production or enterprise-scale apps, you should use Firebase AI Logic instead... Genkit is Firebase's open-source framework for sophisticated server-side AI development."
>
> — [Firebase AI Logic Documentation](https://firebase.google.com/docs/ai-logic)

> "The onCallGenkit trigger seamlessly integrates Firebase Genkit to productionize generative AI workflows."
>
> — [Build Responsive, AI-powered Apps with Cloud Functions](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/)

## Migration Plan

### Phase 1: Setup Genkit (1 day)
- [ ] Install Genkit dependencies
  ```bash
  npm install @genkit-ai/core @genkit-ai/firebase @genkit-ai/googleai @genkit-ai/openai -w contact-form-function
  ```
- [ ] Initialize Genkit configuration
- [ ] Set up local dev environment with Genkit UI
- [ ] Configure secrets using `defineSecret()`

### Phase 2: Migrate Resume Generation Flow (2-3 days)
- [ ] Convert `generateResume` to Genkit flow
- [ ] Convert `generateCoverLetter` to Genkit flow
- [ ] Update to use `onCallGenkit()` trigger
- [ ] Implement streaming responses with `sendChunk()`
- [ ] Add input/output schemas with Zod
- [ ] Configure authentication policies

### Phase 3: Update Services (1-2 days)
- [ ] Refactor OpenAI service to use Genkit's OpenAI plugin
- [ ] Refactor Gemini service to use Genkit's Google AI plugin
- [ ] Update AI provider factory for Genkit
- [ ] Remove manual Secret Manager code (Genkit handles this)

### Phase 4: Testing & Validation (1-2 days)
- [ ] Update unit tests for Genkit flows
- [ ] Test streaming responses
- [ ] Test authentication policies
- [ ] Validate cost tracking still works
- [ ] Test with Genkit Developer UI locally

### Phase 5: Deployment & Monitoring (1 day)
- [ ] Update deployment configuration
- [ ] Deploy to staging
- [ ] Verify Firebase Console monitoring dashboards
- [ ] Monitor performance and costs
- [ ] Deploy to production

**Total Estimated Time:** 6-9 days

## Code Example: Before vs After

### Before (Current - Direct API)
```typescript
// generator.ts - Manual implementation
const aiProvider = await createAIProvider(provider || "gemini", logger)
const resumeResult = await aiProvider.generateResume({
  personalInfo: { ... },
  job: { ... },
  experienceEntries: entries,
  experienceBlurbs: blurbs,
})

// ai-provider.factory.ts - Manual secret retrieval
async function getApiKey(secretName: string): Promise<string> {
  const client = new SecretManagerServiceClient()
  const [version] = await client.accessSecretVersion({ name: secretPath })
  // ... manual processing
}

// No streaming support
res.status(200).json({ success: true, data: resumePDF })
```

### After (Genkit - Best Practice)
```typescript
// flows/resume.flow.ts - Genkit flow
import { ai } from '@genkit-ai/core'
import { z } from 'zod'

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

    // Stream chunks to client
    for await (const chunk of stream) {
      sendChunk(chunk.text)
    }

    return (await output).text
  }
)

// index.ts - Simple deployment
import { onCallGenkit } from 'firebase-functions/v2'
import { geminiApiKey } from './config/secrets'

export const generateResume = onCallGenkit(
  {
    secrets: [geminiApiKey, openaiApiKey],
    enforceAppCheck: true,
    authPolicy: hasClaim('email_verified'),
  },
  generateResumeFlow
)
```

## Secret Management

### Before (Manual)
```typescript
// Custom Secret Manager code
const client = new SecretManagerServiceClient()
const [version] = await client.accessSecretVersion({ name: secretPath })
const apiKey = version.payload?.data?.toString()
```

### After (Genkit)
```typescript
// config/secrets.ts
import { defineSecret } from 'firebase-functions/params'

export const geminiApiKey = defineSecret('GEMINI_API_KEY')
export const openaiApiKey = defineSecret('OPENAI_API_KEY')

// Automatically loads from Secret Manager, no manual code needed
```

## Authentication & Security

### Before (Manual Middleware)
```typescript
// Custom auth middleware
const verifyAuthenticatedEditor = (logger: Logger) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1]
      const decodedToken = await admin.auth().verifyIdToken(token)
      // ... manual verification
    }
  }
```

### After (Genkit - Declarative)
```typescript
// Built-in auth policies
export const generateResume = onCallGenkit(
  {
    enforceAppCheck: true,  // App Check protection
    authPolicy: hasClaim('email_verified'),  // Firebase Auth
  },
  generateResumeFlow
)

// Or custom auth policy
authPolicy: (auth, input) => {
  if (!auth || !auth.email) {
    throw new Error('Unauthorized')
  }
}
```

## Monitoring & Debugging

### Before (Manual Logging)
```typescript
logger.info('Generating resume', { requestId })
logger.error('Failed to generate', { error, requestId })
```

### After (Genkit - Built-in)
```typescript
// Automatic tracing in Firebase Console
// - Request volumes
// - Latency percentiles
// - Error rates
// - Token usage
// - Cost tracking

// Local development
genkit start  // Opens Developer UI at http://localhost:4000
// - Test prompts interactively
// - Compare model outputs
// - View execution traces
// - Debug with visual feedback
```

## Streaming Responses

### Before (Not Supported)
```typescript
// Must wait for full generation
const resumeResult = await aiProvider.generateResume(input)
res.json({ resume: resumeResult.content })  // Send all at once
```

### After (Genkit - Streaming)
```typescript
// Client receives incremental updates
const { stream, output } = await ai.generateStream({ ... })

for await (const chunk of stream) {
  sendChunk(chunk.text)  // Stream to client in real-time
}

// Client code
const response = await fetch('https://...')
const reader = response.body.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // Display chunk to user immediately
}
```

## Cost & Performance Comparison

| Metric | Before (Direct API) | After (Genkit) |
|--------|---------------------|----------------|
| **Cold Start** | ~2-3 seconds | ~2-3 seconds |
| **API Calls** | 1-2 (resume + cover letter) | 1-2 (resume + cover letter) |
| **Token Usage** | Tracked manually | Tracked automatically |
| **Cost Tracking** | Custom implementation | Built-in dashboards |
| **Monitoring** | Custom logs | Firebase Console + traces |
| **Streaming** | ❌ Not supported | ✅ Built-in |
| **Development Speed** | Manual testing | UI-based testing |

## Risks & Mitigation

### Risk 1: Learning Curve
- **Mitigation**: Genkit documentation is excellent, migration can be incremental
- **Timeline**: 1-2 days to understand Genkit patterns

### Risk 2: Breaking Changes
- **Mitigation**: Keep old implementation until Genkit is fully tested
- **Timeline**: Deploy to staging first, validate before production

### Risk 3: Test Suite Updates
- **Mitigation**: Genkit provides test utilities, most tests can be adapted
- **Timeline**: 1 day to update test suite

## Decision

**Recommendation:** Migrate to Firebase Genkit

**Reasoning:**
1. Firebase explicitly recommends Genkit for production Cloud Functions
2. Security improvements (no API key exposure)
3. Better developer experience (local UI, tracing, monitoring)
4. Future-proof (official Firebase framework, active development)
5. Streaming support for better UX
6. Incremental migration possible (low risk)

## References

- [Firebase Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Deploy Genkit with Cloud Functions](https://genkit.dev/docs/firebase/)
- [onCallGenkit Reference](https://firebase.google.com/docs/functions/oncallgenkit)
- [Streaming Cloud Functions with Genkit](https://firebase.blog/posts/2025/03/streaming-cloud-functions-genkit/)
- [Building AI-powered Apps with Firebase](https://firebase.blog/posts/2025/05/building-ai-apps/)
