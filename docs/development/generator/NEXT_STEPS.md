# Next Steps for Generator Refactor

## What's Been Completed

### 1. TypeScript Errors Fixed ✅
- Fixed `GenerationProgress` component (removed unused props)
- Fixed logger method (`warning` → `warn`)
- Fixed API response handling in DocumentBuilderTab

### 2. Step-by-Step Refactor Plan Created ✅
- **Location**: `docs/development/generator/STEP_BY_STEP_REFACTOR.md`
- Comprehensive plan for breaking monolithic `/generator/generate` into:
  - `POST /generator/start` - Initialize generation
  - `POST /generator/step/:requestId` - Execute next step
- Includes detailed implementation for each step function
- Frontend orchestration logic documented
- Retry capability design included

### 3. Terminology Changes Started ✅
- **Location**: `docs/development/generator/TERMINOLOGY_CHANGES_SUMMARY.md`
- Backend types fully migrated (`GeneratorDefaults` → `PersonalInfo`)
- Backend service fully migrated with backward compatibility
- `GeneratorRequest` schema updated (`defaults` → `personalInfo`)
- Added `intermediateResults` field for retry capability

## What's Next

You have two paths forward. Choose based on priority:

### Path A: Complete Terminology Changes First (Recommended)
**Why**: Smaller, safer change. Can be deployed independently. Avoids doing two big changes at once.

**Steps**:
1. **Migrate Firestore Document** ⚠️ **CRITICAL FIRST STEP**
   ```bash
   # In Firebase Console or via script:
   # Rename generator/default → generator/personal-info
   ```

2. **Update Backend API Handlers**
   - Edit `functions/src/generator.ts`
   - Change route: `/generator/defaults` → `/generator/personal-info`
   - Rename handlers: `handleGetDefaults()` → `handleGetPersonalInfo()`
   - Update `handleGenerate()` to call `getPersonalInfo()`

3. **Update Frontend**
   - Edit `web/src/types/generator.ts`
   - Edit `web/src/api/generator-client.ts`
   - Find/replace component usages

4. **Test & Deploy**
   - Test all endpoints
   - Deploy to staging
   - Verify, then deploy to production

**Estimated Time**: 2-3 hours

### Path B: Implement Step-by-Step Refactor (Bigger Change)
**Why**: Solves the memory issue and enables retry capability. More complex but higher value.

**Steps**:
1. **Complete Terminology Changes** (Same as Path A - do this first!)

2. **Implement Backend Endpoints**
   - Add `POST /generator/start` handler
   - Add `POST /generator/step/:requestId` handler
   - Implement step execution functions:
     - `executeFetchData()`
     - `executeGenerateResume()`
     - `executeGenerateCoverLetter()`
     - `executeCreateResumePDF()`
     - `executeCreateCoverLetterPDF()`
     - `executeUploadDocuments()`

3. **Update Frontend**
   - Add `startGeneration()` to API client
   - Add `executeStep()` to API client
   - Refactor `handleSubmit()` to orchestrate steps
   - Add retry button for failed steps

4. **Test Thoroughly**
   - Test all document types (resume, cover letter, both)
   - Test retry on failed steps
   - Verify memory usage improvements
   - Test error handling

5. **Deploy with Feature Flag** (Optional but recommended)
   - Keep old `/generator/generate` endpoint working
   - Add env var to toggle new flow
   - Deploy to staging with new flow enabled
   - Verify thoroughly
   - Enable in production
   - Remove old endpoint after confidence

**Estimated Time**: 1-2 days

## Recommendation

**Start with Path A** (terminology changes):
1. It's a smaller, safer change
2. Can be completed in one session
3. Makes the codebase clearer before the big refactor
4. Can be deployed independently
5. Reduces risk - if something goes wrong, easier to rollback

**Then do Path B** (step-by-step refactor):
1. With clearer terminology in place, the refactor will be easier
2. Can take your time and test thoroughly
3. Can keep old endpoint as fallback during migration

## Important Notes

⚠️ **Firestore Document Migration is Required**
- The `generator/default` document must be renamed to `generator/personal-info`
- This must be done BEFORE deploying backend changes
- Use Firebase Console or the migration script in `TERMINOLOGY_CHANGES_SUMMARY.md`

🔄 **Backward Compatibility**
- Both refactors include backward compatibility layers
- Deprecated methods/types remain during transition
- Can be removed after full migration and verification

📝 **Documentation**
- All plans are documented in `/docs/development/generator/`
- Refer to those docs during implementation
- Update them if you make changes to the approach

## Questions to Consider

Before starting, decide:
1. Do you want to deploy terminology changes first, or do everything at once?
2. Should we keep the old `/generator/generate` endpoint during migration?
3. How will we test the refactored flow? (local emulators? staging?)
4. When is a good time to migrate the Firestore document?

## Ready to Start?

If you're ready to proceed:
1. Choose Path A or Path B
2. Start with the Firestore document migration (if Path A)
3. Follow the steps in the appropriate documentation
4. Test thoroughly at each stage
5. Let me know if you need help with any specific step!
