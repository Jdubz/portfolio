# API Response Format Fix

> **Date:** October 10, 2025
> **Issue:** Experience page failing to load data
> **Root Cause:** Response format mismatch between backend and frontend API client
> **Status:** ✅ FIXED

## Problem

The experience page was throwing errors:

```
Cannot read properties of undefined (reading 'entries')
at ExperienceClient.getEntries (experience-client.ts:16)

Cannot read properties of undefined (reading 'blurbs')
at BlurbClient.getBlurbs (blurb-client.ts:16)
```

## Root Cause Analysis

### Phase 3 Refactoring Introduced a Mismatch

During the Phase 3 refactoring (commit `55c8b5c`), a unified `ApiClient` base class was created with a standardized response format.

**Frontend Expectation** (`ApiClient.handleResponse`):

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  error?: string
  errorCode?: string
  data?: T  // ← Data is nested in a "data" property
}

// handleResponse returns:
return data.data as T  // ← Expects data.data
```

**Backend Reality** (`experience.ts` responses):

```typescript
// BEFORE FIX (WRONG):
res.status(200).json({
  success: true,
  entries,  // ← Direct property
  count: entries.length,
  requestId,
})
```

### The Mismatch

- **Frontend expects:** `{ success: true, data: { entries: [...] } }`
- **Backend was returning:** `{ success: true, entries: [...] }`
- **Result:** `response.entries` was `undefined` because the data wasn't in `response.data.entries`

## Solution

Updated **all** success responses in `functions/src/experience.ts` to wrap data in a `data` property:

```typescript
// AFTER FIX (CORRECT):
res.status(200).json({
  success: true,
  data: {
    entries,  // ← Wrapped in data object
  },
  requestId,
})
```

## Files Modified

### `functions/src/experience.ts`

Fixed 8 response handlers:

1. ✅ `handleListAll` - List all entries and blurbs
2. ✅ `handleListEntries` - List entries
3. ✅ `handleUpdateEntry` - Update entry
4. ✅ `handleListBlurbs` - List blurbs
5. ✅ `handleGetBlurb` - Get single blurb
6. ✅ `handleCreateBlurb` - Create blurb
7. ✅ `handleUpdateBlurb` - Update blurb
8. ✅ `handleCreateEntry` - Create entry (implicit from replace_all)

### Response Format Changes

#### Before (Incorrect)

```typescript
// GET /experience/entries
{
  "success": true,
  "entries": [...],
  "count": 10,
  "requestId": "req_123"
}

// GET /experience/blurbs
{
  "success": true,
  "blurbs": [...],
  "count": 5,
  "requestId": "req_123"
}

// POST /experience/entries
{
  "success": true,
  "entry": { ... },
  "requestId": "req_123"
}

// PUT /experience/blurbs/:name
{
  "success": true,
  "blurb": { ... },
  "requestId": "req_123"
}
```

#### After (Correct)

```typescript
// GET /experience/entries
{
  "success": true,
  "data": {
    "entries": [...]
  },
  "requestId": "req_123"
}

// GET /experience/blurbs
{
  "success": true,
  "data": {
    "blurbs": [...]
  },
  "requestId": "req_123"
}

// POST /experience/entries
{
  "success": true,
  "data": {
    "entry": { ... }
  },
  "requestId": "req_123"
}

// PUT /experience/blurbs/:name
{
  "success": true,
  "data": {
    "blurb": { ... }
  },
  "requestId": "req_123"
}
```

## Why This Wasn't Caught Before

1. **Phase 3 refactoring** created the `ApiClient` base class
2. **Backend wasn't updated** to match the new client expectations
3. **No tests** existed to catch the mismatch
4. **Likely the app was never restarted** after the Phase 3 refactor, so cached responses worked

## Impact on Phase 1 (Generator)

**None.** The generator implementation was never deployed or tested yet, so this issue existed before we started Phase 1.

Our Phase 1 audit correctly identified that we didn't modify any experience-related files, and we were right - **Phase 1 didn't cause this issue.**

## Testing

### Manual Test

```bash
# 1. Rebuild functions
cd functions
npm run build

# 2. Restart emulator
firebase emulators:start

# 3. Test endpoints
curl http://localhost:5001/.../manageExperience/experience/entries
# Should return: { "success": true, "data": { "entries": [...] }, "requestId": "..." }

curl http://localhost:5001/.../manageExperience/experience/blurbs
# Should return: { "success": true, "data": { "blurbs": [...] }, "requestId": "..." }
```

### Frontend Test

1. Hard refresh browser (Ctrl+Shift+R)
2. Navigate to `/experience` page
3. Verify entries and blurbs load correctly
4. Verify no console errors

## Lessons Learned

1. **Breaking changes need migration** - When refactoring API patterns, update backend AND frontend together
2. **Tests would have caught this** - Integration tests between client and server would prevent this
3. **Type safety only goes so far** - TypeScript can't catch runtime JSON structure mismatches
4. **Document API contracts** - Clear documentation of expected response formats

## Action Items

- [ ] Add integration tests for all API endpoints
- [ ] Document standard response format in API docs
- [ ] Consider using a schema validation library (Zod) for responses
- [ ] Add E2E tests for critical user flows

## Related Issues

- Phase 3 refactoring: commit `55c8b5c`
- Phase 1 audit: [phase-1-audit-report.md](./phase-1-audit-report.md)

---

**Fixed By:** Claude (AI Assistant)
**Date:** October 10, 2025
**Status:** ✅ Resolved
