# Progress Updates for Resume Generation

> **Status:** Backend Complete ✅ | Frontend Pending ⏳
> **Complexity:** Medium
> **Estimated Time Remaining:** 1-1.5 hours (frontend polling + UI)

## Current Status

**Completed:**
- ✅ Backend progress tracking infrastructure
- ✅ Progress updates at 7 key stages throughout generation
- ✅ GET endpoint for polling request status
- ✅ Frontend types and API client method

**Remaining:**
- ⏳ Frontend polling logic in resume-builder.tsx
- ⏳ Progress bar UI component
- ⏳ End-to-end testing

## Overview

Add real-time progress updates to the resume generation process so users can see what's happening during the 15-30 second generation time.

## Current Experience

❌ User clicks "Generate" → sees spinner → waits 15-30 seconds → gets result
- No indication of what's happening
- User doesn't know if it's working or stuck
- Anxiety-inducing for users

## Desired Experience

✅ User clicks "Generate" → sees detailed progress → knows what's happening → gets result
- "Fetching your experience data..."
- "Generating resume content with AI..."
- "Creating PDF document..."
- "Almost done..."

## Implementation Approach

### Option 1: Firestore Progress Field (Recommended)

**Backend Changes:**

1. **Add progress field to GeneratorRequest** (Already done ✅)
   ```typescript
   progress?: {
     stage: "initializing" | "fetching_data" | "generating_resume" | "generating_cover_letter" | "creating_pdf" | "finalizing"
     message: string
     percentage: number // 0-100
     updatedAt: Timestamp
   }
   ```

2. **Add updateProgress method** (Already done ✅)
   ```typescript
   async updateProgress(
     requestId: string,
     stage: string,
     message: string,
     percentage: number
   ): Promise<void>
   ```

3. **Update generator.ts at key points:**
   ```typescript
   // After creating request
   await generatorService.updateProgress(requestId, "initializing", "Initializing AI service...", 10)

   // After fetching data
   await generatorService.updateProgress(requestId, "fetching_data", "Fetched experience data", 20)

   // Before generating resume
   await generatorService.updateProgress(requestId, "generating_resume", "Generating resume content...", 30)

   // After generating resume
   await generatorService.updateProgress(requestId, "creating_pdf", "Creating PDF...", 70)

   // Before finalizing
   await generatorService.updateProgress(requestId, "finalizing", "Finalizing...", 90)
   ```

**Frontend Changes:**

1. **Return requestId immediately in API response:**
   ```typescript
   // Instead of waiting for completion, return requestId
   res.status(202).json({
     success: true,
     requestId: generationRequestId,
     message: "Generation started"
   })
   ```

2. **Poll for progress in frontend:**
   ```typescript
   // Poll every 1 second
   const pollProgress = async (requestId: string) => {
     const interval = setInterval(async () => {
       const request = await generatorClient.getRequest(requestId)

       if (request.progress) {
         setProgress({
           message: request.progress.message,
           percentage: request.progress.percentage
         })
       }

       if (request.status === "completed") {
         clearInterval(interval)
         // Fetch final response
       }
     }, 1000)
   }
   ```

3. **Update UI with progress bar:**
   ```tsx
   {generating && progress && (
     <Box>
       <Progress value={progress.percentage} max={100} />
       <Text>{progress.message}</Text>
     </Box>
   )}
   ```

### Option 2: Server-Sent Events (SSE)

More complex but true real-time updates without polling.

**Pros:**
- True push updates
- No polling overhead
- Better user experience

**Cons:**
- More complex to implement
- Requires separate endpoint
- Cloud Functions timeout concerns

**Not recommended for Phase 2.1** - save for later optimization.

## Progress Stages and Messages

```typescript
const PROGRESS_STAGES = {
  initializing: {
    message: "Initializing AI service...",
    percentage: 10
  },
  fetching_data: {
    message: "Fetching your experience data...",
    percentage: 20
  },
  generating_resume: {
    message: "Generating tailored resume content...",
    percentage: 40
  },
  generating_cover_letter: {
    message: "Writing cover letter...",
    percentage: 60
  },
  creating_pdf: {
    message: "Creating PDF document...",
    percentage: 80
  },
  finalizing: {
    message: "Almost done...",
    percentage: 95
  }
}
```

## Implementation Steps

1. ✅ Add progress field to GeneratorRequest type
2. ✅ Add updateProgress method to GeneratorService
3. ✅ Update generator.ts to call updateProgress at each stage
4. ✅ Add GET /generator/requests/:id endpoint for polling
5. ✅ Add GenerationProgress type to frontend
6. ✅ Add getRequest method to GeneratorClient
7. [ ] Add polling logic in resume-builder.tsx
8. [ ] Add progress bar UI component
9. [ ] Test with real generation

## Testing

**Local Development:**
```bash
# Start emulators
make firebase-emulators

# Generate resume
make test-generator-api

# Check progress in Firestore UI
open http://localhost:4000/firestore/data/generator
```

**Frontend Testing:**
```bash
# Should see progress bar updating
# Should see messages changing
# Should complete successfully
```

## Future Enhancements (Phase 3)

- [ ] WebSocket support for true real-time updates
- [ ] Progress estimation based on generateType (resume vs both)
- [ ] Detailed sub-steps (e.g., "Analyzing 15 experience entries...")
- [ ] Cancel/abort generation
- [ ] Retry failed generations

## Files Modified

**Backend (Completed ✅):**
- ✅ `functions/src/types/generator.types.ts` - Added progress field to GeneratorRequest
- ✅ `functions/src/services/generator.service.ts` - Added updateProgress method
- ✅ `functions/src/generator.ts` - Added progress updates at 7 key stages:
  - Initializing (10%)
  - Data fetched (20%)
  - Generating resume (30-40%)
  - Generating cover letter (40-60%)
  - Creating PDF (50-80%)
  - Finalizing (95%)
  - Complete (100%)
- ✅ `functions/src/generator.ts` - Added GET /generator/requests/:id endpoint

**Frontend (Partially Completed):**
- ✅ `web/src/types/generator.ts` - Added GenerationProgress interface and progress field to GenerationRequest
- ✅ `web/src/api/generator-client.ts` - Added getRequest method
- [ ] `web/src/pages/resume-builder.tsx` - Need to add polling logic + progress UI

## Estimated Timeline

- Backend updates: 30 minutes
- Frontend polling: 45 minutes
- UI components: 45 minutes
- Testing: 30 minutes

**Total: 2.5 hours**

## Notes

- Progress updates are non-critical (errors don't fail generation)
- Polling every 1 second is acceptable for 15-30 second operations
- Consider adding exponential backoff if generation takes longer
- Progress percentages are estimates, not exact measurements
