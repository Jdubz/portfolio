# Common Mistakes & How to Avoid Them

> **Last Updated:** October 13, 2025
>
> This document catalogs common mistakes made during development and provides solutions to prevent them from happening again.

---

## Table of Contents

1. [Environment Detection Issues](#environment-detection-issues)
2. [TypeScript Type Safety](#typescript-type-safety)
3. [Firebase & Firestore](#firebase--firestore)
4. [Google Cloud Storage](#google-cloud-storage)
5. [Testing](#testing)
6. [React & Frontend](#react--frontend)

---

## Environment Detection Issues

### ❌ Problem: Using `NODE_ENV` for emulator detection

**Don't:**
```typescript
const isLocal = process.env.NODE_ENV === "development"
const useEmulator = process.env.NODE_ENV === "development"
```

**Why it's wrong:**
- `NODE_ENV` can be set to various values in Cloud Functions (e.g., `"staging"`, `"production"`)
- Cloud Functions may set `NODE_ENV` for logging purposes, but it doesn't indicate emulator usage
- This causes deployed functions to incorrectly detect as "local" and try to connect to `127.0.0.1`

**Do:**
```typescript
// ONLY use FUNCTIONS_EMULATOR for emulator detection
const isLocal = process.env.FUNCTIONS_EMULATOR === "true"
const useEmulator = process.env.FUNCTIONS_EMULATOR === "true"
```

**Reference:**
- See [storage.service.ts:63](../../functions/src/services/storage.service.ts#L63)
- See [GCS Environment Setup](./generator/GCS_ENVIRONMENT_SETUP.md)

### ❌ Problem: Checking for absence of `GCP_PROJECT`

**Don't:**
```typescript
const isLocal = !process.env.GCP_PROJECT
```

**Why it's wrong:**
- Cloud Functions automatically provide project context to the Storage client
- `GCP_PROJECT` is not always set as an environment variable in deployed functions
- This causes production functions to detect as local

**Do:**
```typescript
// Rely on explicit emulator flag only
const isLocal = process.env.FUNCTIONS_EMULATOR === "true"

// Or use ENVIRONMENT variable for staging/prod distinction
const isStaging = process.env.ENVIRONMENT === "staging"
```

---

## TypeScript Type Safety

### ❌ Problem: TypeScript inference issues after validation

**Don't:**
```typescript
if (!fileBuffer || !filename) {
  return
}

// TypeScript still thinks these could be null
const ext = filename.split(".").pop() // Error: Property 'split' does not exist on type 'never'
```

**Why it's wrong:**
- After early returns, TypeScript narrows the types to `never` because it can't track the validation logic

**Do:**
```typescript
if (!fileBuffer || !filename) {
  return
}

// Add explicit type assertions after validation
const validFileBuffer = fileBuffer as Buffer
const validFilename = filename as string

const ext = validFilename.split(".").pop() // ✅ Works
```

**Reference:**
- See [generator.ts:837-840](../../functions/src/generator.ts#L837-L840)

### ❌ Problem: Using `any` type

**Don't:**
```typescript
const handleData = (data: any) => {
  return data.someField
}
```

**Why it's wrong:**
- Loses all type safety
- Masks potential bugs
- Makes refactoring harder

**Do:**
```typescript
interface DataType {
  someField: string
}

const handleData = (data: DataType) => {
  return data.someField
}

// Or use type assertions for API responses
const result = (await response.json()) as { data: DataType }
```

---

## Firebase & Firestore

### ❌ Problem: Not using named databases

**Don't:**
```typescript
const db = new Firestore() // Uses (default) database
```

**Why it's wrong:**
- Can accidentally write to wrong database
- Makes environment switching harder
- Doesn't support multiple databases per project

**Do:**
```typescript
import { DATABASE_ID } from "../config/database"

const db = new Firestore({
  databaseId: DATABASE_ID, // "portfolio", "portfolio-staging", etc.
})
```

**Reference:**
- See [database.ts](../../functions/src/config/database.ts)
- See [generator.service.ts:29](../../functions/src/services/generator.service.ts#L29)

### ❌ Problem: Hardcoding collection names

**Don't:**
```typescript
const doc = await db.collection("generator").doc("default").get()
```

**Why it's wrong:**
- Magic strings are error-prone
- Hard to refactor
- No autocomplete/type checking

**Do:**
```typescript
import { GENERATOR_COLLECTION } from "../config/database"

const doc = await db.collection(GENERATOR_COLLECTION).doc("default").get()
```

---

## Google Cloud Storage

### ❌ Problem: Not setting explicit project ID

**Don't:**
```typescript
this.storage = new Storage() // Relies on auto-detection
```

**Why it's wrong:**
- Can fail in some Cloud Functions environments
- Makes debugging harder
- May use wrong project in multi-project setups

**Do:**
```typescript
this.storage = new Storage({
  projectId: "static-sites-257923",
})
```

**Reference:**
- See [storage.service.ts:72](../../functions/src/services/storage.service.ts#L72)

### ❌ Problem: Not handling emulator configuration

**Don't:**
```typescript
// Initialize Storage without checking for emulator
const storage = new Storage()
```

**Why it's wrong:**
- Won't connect to local emulator in development
- Attempts to use real GCS credentials locally
- Makes local development harder

**Do:**
```typescript
if (this.useEmulator) {
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199"
  this.storage = new Storage({
    projectId: "static-sites-257923",
    apiEndpoint: `http://${emulatorHost}`,
  })
} else {
  this.storage = new Storage({
    projectId: "static-sites-257923",
  })
}
```

**Reference:**
- See [storage.service.ts:59-80](../../functions/src/services/storage.service.ts#L59-L80)

---

## Testing

### ❌ Problem: Tests failing due to missing type assertions

**Don't:**
```typescript
// Test passes locally but fails in CI
expect(result.data).toBeDefined()
```

**Why it's wrong:**
- TypeScript compilation may succeed locally but fail in CI
- Type narrowing issues can cause test failures

**Do:**
```typescript
// Ensure proper types in source code to avoid test failures
const validData = data as ExpectedType
expect(validData.field).toBeDefined()
```

### ❌ Problem: Not mocking environment variables

**Don't:**
```typescript
// Test relies on actual environment variables
it("should use staging bucket", () => {
  const service = new StorageService()
  expect(service.bucketName).toBe("...-staging")
})
```

**Why it's wrong:**
- Tests depend on external configuration
- Tests may pass locally but fail in CI
- Hard to test different scenarios

**Do:**
```typescript
it("should use staging bucket", () => {
  process.env.ENVIRONMENT = "staging"
  const service = new StorageService()
  expect(service.bucketName).toBe("joshwentworth-resumes-staging")

  // Clean up
  delete process.env.ENVIRONMENT
})
```

---

## React & Frontend

### ❌ Problem: Using `||` instead of `??` for nullish coalescing

**Don't:**
```typescript
const value = props.value || "default"
```

**Why it's wrong:**
- `||` treats `0`, `""`, `false` as falsy and returns default
- `??` only checks for `null` or `undefined`

**Do:**
```typescript
const value = props.value ?? "default" // Only uses default if null/undefined
```

**Reference:**
- ESLint rule: `@typescript-eslint/prefer-nullish-coalescing`

### ❌ Problem: Not handling loading states

**Don't:**
```typescript
const MyComponent = () => {
  const { data } = useData()
  return <div>{data.field}</div> // Crashes if data is undefined
}
```

**Why it's wrong:**
- Component crashes on initial render
- Poor user experience
- No loading indicator

**Do:**
```typescript
const MyComponent = () => {
  const { data, loading, error } = useData()

  if (loading) return <Spinner />
  if (error) return <Alert>{error.message}</Alert>
  if (!data) return null

  return <div>{data.field}</div>
}
```

### ❌ Problem: Unused dependencies in useEffect

**Don't:**
```typescript
useEffect(() => {
  fetchData(userId)
}, []) // Missing userId dependency
```

**Why it's wrong:**
- Effect doesn't re-run when userId changes
- Stale data bugs
- ESLint warning

**Do:**
```typescript
useEffect(() => {
  fetchData(userId)
}, [userId]) // Include all dependencies

// Or use useCallback if fetchData needs to be stable
const fetchData = useCallback((id: string) => {
  // fetch logic
}, [])

useEffect(() => {
  fetchData(userId)
}, [fetchData, userId])
```

---

## Best Practices Summary

### Environment Detection
✅ **Always use `FUNCTIONS_EMULATOR` for emulator detection**
✅ **Never rely on `NODE_ENV` for environment detection in Cloud Functions**
✅ **Use `ENVIRONMENT` variable for staging/production distinction**

### TypeScript
✅ **Add type assertions after validation checks**
✅ **Never use `any` - use `unknown` or proper types**
✅ **Use const assertions for literal types**

### Firebase
✅ **Always specify `databaseId` when initializing Firestore**
✅ **Import collection names from constants**
✅ **Handle both emulator and production modes**

### Storage
✅ **Always set explicit `projectId` for Storage client**
✅ **Check for emulator before initializing Storage**
✅ **Use environment-aware bucket selection**

### Testing
✅ **Mock environment variables in tests**
✅ **Clean up mocks in afterEach/afterAll**
✅ **Test both success and error paths**

### React
✅ **Use `??` for nullish coalescing**
✅ **Handle loading/error states**
✅ **Include all dependencies in useEffect**
✅ **Use useCallback for stable function references**

---

## Quick Reference Checklist

Before committing code, check:

- [ ] No `NODE_ENV` checks for emulator detection
- [ ] No `!process.env.GCP_PROJECT` checks
- [ ] Type assertions added after validation
- [ ] No `any` types (unless absolutely necessary)
- [ ] `databaseId` specified in Firestore initialization
- [ ] `projectId` specified in Storage initialization
- [ ] Environment variables mocked in tests
- [ ] `??` used instead of `||` for nullish coalescing
- [ ] Loading/error states handled in React components
- [ ] All useEffect dependencies included

---

## Related Documentation

- [Architecture](./ARCHITECTURE.md) - System design patterns
- [GCS Environment Setup](./generator/GCS_ENVIRONMENT_SETUP.md) - Storage configuration
- [Generator README](./generator/README.md) - Resume generator documentation
- [Development Workflow](../DEVELOPMENT_WORKFLOW.md) - Git and deployment workflow
