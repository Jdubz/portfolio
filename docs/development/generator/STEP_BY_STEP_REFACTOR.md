# Step-by-Step Generation Refactor Plan

## Overview
Refactor the monolithic `/generator/generate` endpoint into step-by-step API calls to reduce memory usage, enable retry capability, and provide better real-time progress tracking.

**Note**: This refactor also includes renaming "defaults" → "personalInfo" throughout the codebase for better clarity.

## Current Architecture (Monolithic)
```
POST /generator/generate
  ├─ Fetch personalInfo & experience data
  ├─ Generate resume with AI (holds in memory)
  ├─ Generate cover letter with AI (holds in memory)
  ├─ Create resume PDF (holds in memory)
  ├─ Create cover letter PDF (holds in memory)
  └─ Upload both PDFs to GCS

Problem: All buffers held in memory until the end. No retry capability.
```

## New Architecture (Step-by-Step)
```
POST /generator/start
  └─ Creates request document, initializes steps

POST /generator/step/:requestId (called repeatedly)
  ├─ Determines next pending step
  ├─ Executes that step
  ├─ Saves intermediate results to Firestore
  ├─ Updates step status
  └─ Returns next step to execute (or "complete")

Frontend orchestrates the flow:
  1. Call /start
  2. Loop: Call /step until all steps complete
  3. Listen to Firestore for real-time progress
```

## Benefits
1. **Lower Memory**: Each API call only handles one step's data
2. **Retry Capability**: Failed steps can be re-executed without re-running successful ones
3. **Better Progress**: Frontend sees actual progress, not simulated delays
4. **Scalability**: Smaller function invocations, better cold start performance
5. **Debugging**: Easier to isolate which step failed

## Terminology Changes

This refactor includes renaming "defaults" → "personalInfo" for better clarity:

| Old Name | New Name | Description |
|----------|----------|-------------|
| `GeneratorDefaults` | `PersonalInfo` | Type definition |
| `UpdateGeneratorDefaultsData` | `UpdatePersonalInfoData` | Update type |
| `getDefaults()` | `getPersonalInfo()` | Service method |
| `updateDefaults()` | `updatePersonalInfo()` | Service method |
| `/generator/defaults` | `/generator/personal-info` | API endpoint |
| `generator/default` (Firestore doc) | `generator/personal-info` | Firestore document ID |
| `request.defaults` | `request.personalInfo` | Field in request document |

**Migration Note**: The Firestore document ID change (`default` → `personal-info`) requires a data migration script or manual rename in the Firebase Console.

## Implementation Steps

### Backend Changes

#### 1. Update Firestore Schema
**File**: `functions/src/types/generator.types.ts`

Add `intermediateResults` to `GeneratorRequest`:
```typescript
intermediateResults?: {
  // AI-generated content (stored after AI generation steps)
  resumeContent?: ResumeContent
  coverLetterContent?: CoverLetterContent

  // Token usage tracking
  resumeTokenUsage?: TokenUsage
  coverLetterTokenUsage?: TokenUsage

  // Model information
  model?: string
}
```

**Status**: ✅ Complete

#### 2. Add Service Methods
**File**: `functions/src/services/generator.service.ts`

Add method to update intermediate results:
```typescript
async updateIntermediateResults(
  requestId: string,
  results: Partial<GeneratorRequest["intermediateResults"]>
): Promise<void>
```

**Status**: ✅ Complete

#### 3. Create POST /generator/start Endpoint
**File**: `functions/src/generator.ts`

**Route**: `POST /generator/start`
**Auth**: Public (rate limited)
**Purpose**: Initialize generation request

**Request Body**:
```json
{
  "generateType": "both",
  "provider": "gemini",
  "job": {
    "role": "Senior Engineer",
    "company": "Google",
    "jobDescriptionText": "..."
  },
  "preferences": {
    "emphasize": ["TypeScript", "React"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "resume-generator-request-123",
    "status": "pending",
    "nextStep": "fetch_data"
  }
}
```

**Implementation**:
1. Validate request (same schema as `/generate`)
2. Fetch personalInfo (from `personal-info` document)
3. Fetch experience data
4. Create request document with `createRequest()`
5. Initialize steps with `createInitialSteps()`
6. Set status to "pending"
7. Return request ID

#### 4. Create POST /generator/step/:requestId Endpoint
**File**: `functions/src/generator.ts`

**Route**: `POST /generator/step/:requestId`
**Auth**: Public (no additional rate limit - request already created)
**Purpose**: Execute next pending step

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "resume-generator-request-123",
    "stepCompleted": "fetch_data",
    "nextStep": "generate_resume",
    "status": "processing"
  }
}
```

**Step Execution Logic**:

```typescript
async function handleExecuteStep(req: Request, res: Response, requestId: string) {
  // 1. Get request document
  const request = await generatorService.getRequest(requestId)

  // 2. Find next pending step
  const nextStep = request.steps?.find(s => s.status === 'pending')
  if (!nextStep) {
    return res.json({ success: true, status: 'completed', message: 'All steps complete' })
  }

  // 3. Execute step based on ID
  switch (nextStep.id) {
    case 'fetch_data':
      await executeFetchData(request)
      break
    case 'generate_resume':
      await executeGenerateResume(request)
      break
    case 'generate_cover_letter':
      await executeGenerateCoverLetter(request)
      break
    case 'create_resume_pdf':
      await executeCreateResumePDF(request)
      break
    case 'create_cover_letter_pdf':
      await executeCreateCoverLetterPDF(request)
      break
    case 'upload_documents':
      await executeUploadDocuments(request)
      break
  }

  // 4. Return next step
  const updatedRequest = await generatorService.getRequest(requestId)
  const nextPendingStep = updatedRequest.steps?.find(s => s.status === 'pending')

  return res.json({
    success: true,
    stepCompleted: nextStep.id,
    nextStep: nextPendingStep?.id,
    status: nextPendingStep ? 'processing' : 'completed'
  })
}
```

**Individual Step Functions**:

```typescript
async function executeFetchData(request: GeneratorRequest) {
  // Update step to in_progress
  let steps = startStep(request.steps!, 'fetch_data')
  await generatorService.updateSteps(request.id, steps)

  // Data already fetched during /start, just complete the step
  steps = completeStep(steps, 'fetch_data')
  await generatorService.updateSteps(request.id, steps)
}

async function executeGenerateResume(request: GeneratorRequest) {
  // Update step to in_progress
  let steps = startStep(request.steps!, 'generate_resume')
  await generatorService.updateSteps(request.id, steps)

  // Initialize AI provider
  const aiProvider = await createAIProvider(request.provider, logger)

  // Generate resume content
  const result = await aiProvider.generateResume({
    personalInfo: { /* from request.personalInfo */ },
    job: request.job,
    experienceEntries: request.experienceData.entries,
    experienceBlurbs: request.experienceData.blurbs,
    emphasize: request.preferences?.emphasize,
    customPrompts: request.personalInfo.aiPrompts?.resume
  })

  // Save intermediate results to Firestore
  await generatorService.updateIntermediateResults(request.id, {
    resumeContent: result.content,
    resumeTokenUsage: result.tokenUsage,
    model: result.model
  })

  // Complete step
  steps = completeStep(steps, 'generate_resume')
  await generatorService.updateSteps(request.id, steps)
}

async function executeGenerateCoverLetter(request: GeneratorRequest) {
  // Similar to executeGenerateResume but for cover letter
  let steps = startStep(request.steps!, 'generate_cover_letter')
  await generatorService.updateSteps(request.id, steps)

  const aiProvider = await createAIProvider(request.provider, logger)
  const result = await aiProvider.generateCoverLetter(/* ... */)

  await generatorService.updateIntermediateResults(request.id, {
    coverLetterContent: result.content,
    coverLetterTokenUsage: result.tokenUsage,
    model: result.model
  })

  steps = completeStep(steps, 'generate_cover_letter')
  await generatorService.updateSteps(request.id, steps)
}

async function executeCreateResumePDF(request: GeneratorRequest) {
  let steps = startStep(request.steps!, 'create_resume_pdf')
  await generatorService.updateSteps(request.id, steps)

  // Load resume content from intermediateResults
  const resumeContent = request.intermediateResults?.resumeContent
  if (!resumeContent) throw new Error('Resume content not found')

  // Generate PDF
  const pdf = await pdfService.generateResumePDF(
    resumeContent,
    'modern',
    request.personalInfo.accentColor
  )

  // Upload to GCS immediately
  const companySafe = request.job.company.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const roleSafe = request.job.role.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${companySafe}_${roleSafe}_resume_${timestamp}.pdf`

  const uploadResult = await storageService.uploadPDF(pdf, filename, 'resume')
  const signedUrl = await storageService.generateSignedUrl(uploadResult.gcsPath, { expiresInHours: 168 })

  // Complete step with URL
  steps = completeStep(steps, 'create_resume_pdf', { resumeUrl: signedUrl })
  await generatorService.updateSteps(request.id, steps)

  // Clear PDF buffer immediately
  pdf = null
}

async function executeCreateCoverLetterPDF(request: GeneratorRequest) {
  // Similar to executeCreateResumePDF but for cover letter
}

async function executeUploadDocuments(request: GeneratorRequest) {
  // This step is now redundant since we upload in PDF creation steps
  // Just mark it as complete
  let steps = startStep(request.steps!, 'upload_documents')
  steps = completeStep(steps, 'upload_documents')
  await generatorService.updateSteps(request.id, steps)

  // Update overall status to completed
  await generatorService.updateStatus(request.id, 'completed')

  // Create response document
  await generatorService.createResponse(request.id, {
    success: true,
    resume: request.intermediateResults?.resumeContent,
    coverLetter: request.intermediateResults?.coverLetterContent
  }, {
    durationMs: Date.now() - request.createdAt.toMillis(),
    tokenUsage: {
      /* aggregate from intermediateResults */
    },
    costUsd: /* calculate from token usage */,
    model: request.intermediateResults?.model || 'unknown'
  })
}
```

#### 5. Add Route Handlers
**File**: `functions/src/generator.ts`

In `handleGeneratorRequest()`, add routes:

```typescript
// Route: POST /generator/start - Initialize generation (public, rate limited)
if (req.method === "POST" && path === "/generator/start") {
  const isAuthenticated = await checkOptionalAuth(req as AuthenticatedRequest, logger)
  const rateLimiter = isAuthenticated ? generatorEditorRateLimiter : generatorRateLimiter
  await new Promise<void>((resolve, reject) => {
    rateLimiter(req, res, (err) => (err ? reject(err) : resolve()))
  })

  await handleStartGeneration(req, res, requestId)
  resolve()
  return
}

// Route: POST /generator/step/:requestId - Execute next step (public, no additional rate limit)
if (req.method === "POST" && path.startsWith("/generator/step/")) {
  await handleExecuteStep(req, res, requestId)
  resolve()
  return
}
```

### Frontend Changes

#### 1. Update API Client
**File**: `web/src/api/generator-client.ts`

Add new methods:
```typescript
async startGeneration(request: GenerateRequest): Promise<{ requestId: string; nextStep: string }> {
  return this.post<{ requestId: string; nextStep: string }>("/generator/start", request, false)
}

async executeStep(requestId: string): Promise<{
  stepCompleted: string
  nextStep?: string
  status: string
}> {
  return this.post<{
    stepCompleted: string
    nextStep?: string
    status: string
  }>(`/generator/step/${requestId}`, {}, false)
}
```

#### 2. Update DocumentBuilderTab
**File**: `web/src/components/tabs/DocumentBuilderTab.tsx`

Replace monolithic `handleSubmit` with step orchestration:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setGenerating(true)
  setError(null)

  // Initialize steps UI
  const initialSteps = buildInitialSteps(formState.generateType)
  setGenerationSteps(initialSteps)

  try {
    // Step 1: Start generation
    const { requestId } = await generatorClient.startGeneration(payload)
    setGenerationRequestId(requestId)

    // Step 2: Execute steps one by one
    let hasMoreSteps = true
    while (hasMoreSteps) {
      const result = await generatorClient.executeStep(requestId)

      if (result.status === 'completed') {
        hasMoreSteps = false
      }

      // Firestore listener will update UI automatically
      // Small delay to allow listener to catch up
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setSuccess(true)
    setGenerating(false)
  } catch (err) {
    setError(err.message)
    setGenerating(false)
  }
}
```

#### 3. Add Retry Logic
**File**: `web/src/components/tabs/DocumentBuilderTab.tsx`

```typescript
const retryFailedStep = async () => {
  if (!generationRequestId) return

  try {
    // Re-execute the failed step
    await generatorClient.executeStep(generationRequestId)

    // Continue with remaining steps
    let hasMoreSteps = true
    while (hasMoreSteps) {
      const result = await generatorClient.executeStep(generationRequestId)
      if (result.status === 'completed') {
        hasMoreSteps = false
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (err) {
    setError(err.message)
  }
}

// Show retry button if any step failed
{generationSteps.some(s => s.status === 'failed') && (
  <Button onClick={retryFailedStep}>Retry Failed Step</Button>
)}
```

## Migration Strategy

1. **Phase 1**: Keep old `/generator/generate` endpoint working
2. **Phase 2**: Add new `/generator/start` and `/generator/step/:requestId` endpoints
3. **Phase 3**: Update frontend to use new endpoints (feature flag?)
4. **Phase 4**: Test thoroughly with both flows
5. **Phase 5**: Remove old endpoint after migration complete

## Testing Checklist

- [ ] Start generation and complete all steps successfully
- [ ] Verify Firestore updates after each step
- [ ] Test with resume only
- [ ] Test with cover letter only
- [ ] Test with both
- [ ] Test retry on failed AI generation step
- [ ] Test retry on failed PDF generation step
- [ ] Test retry on failed upload step
- [ ] Verify memory usage is lower per function invocation
- [ ] Verify download URLs work
- [ ] Test rate limiting on /start endpoint
- [ ] Test error handling for invalid request IDs

## Rollback Plan

If issues arise:
1. Revert frontend to use `/generator/generate`
2. Keep new endpoints for future use
3. Debug issues in development
4. Re-deploy when fixed
