# Codebase Audit Report - October 10, 2025

## ✅ REFACTORING COMPLETE (Oct 2025)

**All three phases have been successfully completed!**

### Completed Work

**Phase 1: Core Infrastructure** ✅
- Centralized API configuration
- Standardized logging (72% improvement)
- Shared markdown components
- FormLabel component

**Phase 2: Form Component Library** ✅
- FormField, FormActions, FormError components
- MarkdownEditor with preview
- useAsyncSubmit hook
- Type-safe validation utilities

**Phase 3: API Client Architecture** ✅
- ApiClient base class
- ExperienceClient and BlurbClient
- Deleted redundant hooks (useExperienceAPI, useBlurbAPI)

### Final Results

- **Code Reduced**: ~527 lines of duplication eliminated
- **Infrastructure Added**: +810 lines of reusable, tested code
- **Tests**: All 91 tests passing
- **Build Time**: ~21 seconds (production)
- **Type Safety**: 100% (zero TypeScript errors)
- **Linting**: Zero warnings

### Architecture Improvements

- ✅ Centralized configuration
- ✅ Consistent form components
- ✅ Type-safe API clients
- ✅ Structured logging
- ✅ Reusable validation

**Next Steps**: See [PLANNED_IMPROVEMENTS.md](./PLANNED_IMPROVEMENTS.md) for future work, including AI Resume Generator.

---

## Executive Summary (Original Audit - Oct 10, 2025)

This comprehensive audit examined the portfolio codebase for **modularity**, **consistency**, and **code repetition** across components, hooks, and utilities. The analysis also includes preparatory recommendations for implementing the AI Resume Generator feature.

### Key Findings

✅ **Strengths:**
- Excellent TypeScript usage with strong type safety
- Good separation of concerns (components, hooks, utilities)
- Consistent naming conventions
- Clean monorepo structure with npm workspaces

⚠️ **Areas for Improvement:**
- **~400-500 lines** of duplicated code across form components
- **3 duplicate API configurations** in hooks
- **Inconsistent** error handling (console vs logger: 47:8 ratio)
- **4 form components** with 70-80% similar logic

### Overall Health Score: B+ (85/100)

| Category | Score | Status |
|----------|-------|--------|
| Type Safety | 95/100 | ✅ Excellent |
| Component Architecture | 82/100 | ⚠️ Good |
| Code Reusability | 75/100 | ⚠️ Needs Improvement |
| Consistency | 78/100 | ⚠️ Needs Improvement |
| Modularity | 88/100 | ✅ Good |
| Maintainability | 80/100 | ⚠️ Good |

---

## Table of Contents

1. [Modularity Analysis](#1-modularity-analysis)
2. [Consistency Issues](#2-consistency-issues)
3. [Code Repetition](#3-code-repetition)
4. [Architectural Recommendations](#4-architectural-recommendations)
5. [Priority Refactoring Roadmap](#5-priority-refactoring-roadmap)
6. [AI Resume Generator Preparatory Tasks](#6-ai-resume-generator-preparatory-tasks)
7. [Summary Metrics](#7-summary-metrics)

---

## 1. MODULARITY ANALYSIS

### 1.1 Component Structure

**Location:** `/web/src/components/`

#### ✅ Strengths
- Clear directory organization (homepage/, elements/, root-level forms)
- Single Responsibility Principle well-followed
- Good TypeScript interface definitions
- Proper prop typing throughout

#### ⚠️ Issues

##### Issue 1.1: Mixed JSX Pragma Patterns (Medium Priority)
**Impact:** Inconsistency, harder to maintain
**Complexity:** Low

**Files affected:**
- `ContactForm.tsx:1-2` - Uses `/** @jsx jsx */` pragma
- `CreateExperienceForm.tsx` - Direct theme-ui imports
- `BlurbEntry.tsx` - Direct theme-ui imports
- `ExperienceEntry.tsx` - Direct theme-ui imports

**Current state:**
```typescript
// ContactForm.tsx (OLD PATTERN)
/** @jsx jsx */
import { jsx } from "theme-ui"

// CreateExperienceForm.tsx (PREFERRED PATTERN)
import { Box, Input, Textarea, Button } from "theme-ui"
```

**Recommendation:**
- Standardize on direct imports from theme-ui
- Remove JSX pragma usage
- Update ContactForm.tsx to match other components

**Effort:** 1-2 hours

---

##### Issue 1.2: Form Logic Not Extracted (High Priority)
**Impact:** Code duplication, difficult to test
**Complexity:** High

**Files with embedded form logic:**
1. `ContactForm.tsx:24-35` - Form state (formData, errors, submitting)
2. `CreateExperienceForm.tsx:15-25` - Form state (formData, isCreating, error)
3. `BlurbEntry.tsx:29-34` - Edit state (editData, isEditing, isSaving)
4. `ExperienceEntry.tsx:19-31` - Edit state + delete state (5 state variables)

**Problem:** Each component reimplements:
- Form state management
- Validation logic
- Submission handling
- Loading states
- Error handling

**Recommendation:**
Create reusable form hooks:

```typescript
// web/src/hooks/useFormState.ts
export const useFormState = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearErrors = useCallback(() => setErrors({}), [])
  const reset = useCallback(() => setValues(initialValues), [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    clearErrors,
    reset,
    setValues,
  }
}

// web/src/hooks/useAsyncSubmit.ts
export const useAsyncSubmit = <T>(
  onSubmit: (data: T) => Promise<void>,
  options?: { onSuccess?: () => void; onError?: (error: Error) => void }
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: T) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(data)
      options?.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      options?.onError?.(err as Error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, options])

  return { submit, isSubmitting, error, clearError: () => setError(null) }
}
```

**Benefits:**
- Reduce form components by 30-50 lines each
- Consistent form behavior across app
- Easier to test
- Prepare for AI Resume Generator forms

**Effort:** 6-8 hours (includes refactoring 4 components)

---

### 1.2 Hooks Structure

**Location:** `/web/src/hooks/`

#### ✅ Strengths
- Excellent separation: auth, API operations, data fetching
- Consistent return value patterns
- Good use of useCallback for memoization
- Proper error handling in useAuth.ts

#### ⚠️ Issues

##### Issue 1.3: Redundant Hooks (Medium Priority)
**Impact:** Maintenance burden, confusion
**Complexity:** Medium

**Files:**
- `useExperienceAPI.ts` (191 lines) - CRUD operations for experiences
- `useBlurbAPI.ts` (206 lines) - CRUD operations for blurbs
- `useExperienceData.ts` (338 lines) - **Combines both above + local state**

**Problem:**
`useExperienceData` essentially duplicates and wraps functionality from the other two hooks. This creates:
- Confusion about which hook to use
- Duplicate maintenance
- Inconsistent patterns

**Current usage analysis:**
```bash
# Pages using useExperienceData:
- web/src/pages/experience.tsx (primary usage)

# Pages using individual hooks:
- None found (both useExperienceAPI and useBlurbAPI seem unused)
```

**Recommendation:**
1. **Verify** no imports of `useExperienceAPI` or `useBlurbAPI`
2. If unused, **delete** both files
3. Make `useExperienceData` the single source of truth
4. OR: Keep individual hooks as low-level API clients, use `useExperienceData` as high-level state manager

**Preferred approach:**
```typescript
// Keep as low-level API client (no state)
// web/src/api/experience-client.ts
export class ExperienceClient {
  async getEntries(): Promise<ExperienceEntry[]> { ... }
  async createEntry(data: CreateExperienceData): Promise<ExperienceEntry> { ... }
  async updateEntry(id: string, data: Partial<ExperienceEntry>): Promise<ExperienceEntry> { ... }
  async deleteEntry(id: string): Promise<void> { ... }
}

export class BlurbClient {
  async getBlurbs(): Promise<Record<string, BlurbEntry>> { ... }
  async saveBlurb(blurbId: string, data: Partial<BlurbEntry>): Promise<BlurbEntry> { ... }
}

// High-level hook with state management
// web/src/hooks/useExperienceData.ts
export const useExperienceData = () => {
  const experienceClient = useExperienceClient()
  const blurbClient = useBlurbClient()

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [blurbs, setBlurbs] = useState<Record<string, BlurbEntry>>({})

  // ... state management logic
}
```

**Benefits:**
- Clear separation: API clients vs state management
- Easier to test API clients (pure functions)
- Reusable for AI Resume Generator (needs same data)

**Effort:** 4-6 hours

---

##### Issue 1.4: API Configuration Duplication (HIGH PRIORITY)
**Impact:** Maintenance burden, error-prone
**Complexity:** LOW (quick win!)

**Files with duplicate `API_CONFIG`:**
1. `useExperienceAPI.ts:11-17` (7 lines)
2. `useBlurbAPI.ts:6-12` (7 lines)
3. `useExperienceData.ts:13-19` (7 lines)

**Duplicate code:**
```typescript
// DUPLICATED IN 3 FILES
const API_CONFIG = {
  createExperience: "createExperience",
  updateExperience: "updateExperience",
  deleteExperience: "deleteExperience",
  getExperiences: "getExperiences",
  // ... etc
}

// ALSO DUPLICATED IN 3 FILES
const getApiUrl = (): string => {
  if (typeof window === "undefined") return ""
  const isDev = window.location.hostname === "localhost"
  const isStaging = window.location.hostname.includes("staging")
  // ... etc
}
```

**Total duplication:** ~30 lines across 3 files

**Recommendation:**
Create centralized API configuration:

```typescript
// web/src/config/api.ts
export const API_CONFIG = {
  // Experience endpoints
  createExperience: "createExperience",
  updateExperience: "updateExperience",
  deleteExperience: "deleteExperience",
  getExperiences: "getExperiences",

  // Blurb endpoints
  saveBlurb: "saveBlurb",
  getBlurbs: "getBlurbs",

  // Contact endpoint
  contactForm: "contact-form",

  // Future: Resume generator endpoints
  generateDocuments: "generateDocuments",
  listDocuments: "listDocuments",
  getDocument: "getDocument",
} as const

export type ApiEndpoint = (typeof API_CONFIG)[keyof typeof API_CONFIG]

export const getApiUrl = (endpoint: ApiEndpoint): string => {
  if (typeof window === "undefined") return ""

  const isDev = window.location.hostname === "localhost"
  const isStaging = window.location.hostname.includes("staging")

  const env = isDev ? "dev" : isStaging ? "staging" : "production"

  const baseUrls = {
    dev: "http://127.0.0.1:5001/static-sites-257923/us-central1",
    staging: "https://us-central1-static-sites-257923.cloudfunctions.net",
    production: "https://us-central1-static-sites-257923.cloudfunctions.net",
  }

  return `${baseUrls[env]}/${endpoint}`
}

// Type-safe endpoint URLs
export const apiUrls = {
  createExperience: () => getApiUrl(API_CONFIG.createExperience),
  updateExperience: () => getApiUrl(API_CONFIG.updateExperience),
  deleteExperience: () => getApiUrl(API_CONFIG.deleteExperience),
  getExperiences: () => getApiUrl(API_CONFIG.getExperiences),
  saveBlurb: () => getApiUrl(API_CONFIG.saveBlurb),
  getBlurbs: () => getApiUrl(API_CONFIG.getBlurbs),
  contactForm: () => getApiUrl(API_CONFIG.contactForm),
}
```

**Benefits:**
- **Single source of truth** for all API endpoints
- **Type-safe** endpoint references
- Easy to add new endpoints (e.g., resume generator)
- Reduces code by 20-25 lines

**Effort:** 1 hour

**Priority:** Complete this BEFORE starting AI Resume Generator

---

### 1.3 Utility Functions

**Location:** `/web/src/utils/`

#### ✅ Strengths
- Clean logger abstraction (`logger.ts`)
- Proper Firebase lazy initialization
- Good environment-based configuration

#### ⚠️ Issues

##### Issue 1.5: Inconsistent Logger Usage (Medium Priority)
**Impact:** Poor observability, debugging difficulty
**Complexity:** Medium

**Current state:**
- `logger.ts` exists with proper log levels
- Only `useAuth.ts` uses logger consistently (8 calls)
- All other files use direct `console.*` calls (47 occurrences)

**Files with direct console usage:**
```
web/src/components/ContactForm.tsx: 6 console calls
web/src/components/BlurbEntry.tsx: 4 console calls
web/src/components/ExperienceEntry.tsx: 5 console calls
web/src/components/CreateExperienceForm.tsx: 3 console calls
web/src/hooks/useExperienceAPI.ts: 8 console calls
web/src/hooks/useBlurbAPI.ts: 7 console calls
web/src/hooks/useExperienceData.ts: 10 console calls
web/src/utils/firebase-analytics.ts: 4 console calls
```

**Recommendation:**
1. Enhance logger with context support:
```typescript
// web/src/utils/logger.ts
export interface LogContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: any
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : "")
    }
  },

  error: (message: string, error?: Error, context?: LogContext) => {
    console.error(`[ERROR] ${message}`, {
      error: error?.message,
      stack: error?.stack,
      ...context,
    })
  },

  warn: (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context)
  },
}
```

2. Replace all console.* calls with logger:
```typescript
// BEFORE
console.error("Failed to create experience:", error)

// AFTER
logger.error("Failed to create experience", error, {
  component: "CreateExperienceForm",
  action: "handleSubmit",
})
```

**Benefits:**
- Consistent log format
- Easy to add external logging (e.g., Sentry)
- Better debugging with context
- **Essential for AI Resume Generator** (track token usage, errors, costs)

**Effort:** 3-4 hours (find and replace with context)

---

## 2. CONSISTENCY ISSUES

### 2.1 Form Component Inconsistencies

#### Issue 2.1A: Different Validation Approaches (High Priority)
**Impact:** Inconsistent UX, harder to maintain
**Complexity:** Medium

**Pattern 1: Dedicated validation function** (ContactForm)
```typescript
// web/src/components/ContactForm.tsx:62-81
const validateForm = (): boolean => {
  const newErrors: FormErrors = {}

  if (!formData.name.trim()) {
    newErrors.name = "Name is required"
  }
  if (!formData.email.trim()) {
    newErrors.email = "Email is required"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Please enter a valid email"
  }
  if (!formData.message.trim()) {
    newErrors.message = "Message is required"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return
  // ... submit logic
}
```

**Pattern 2: Inline validation with early returns** (CreateExperienceForm)
```typescript
// web/src/components/CreateExperienceForm.tsx:31-47
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Inline validation
  if (!formData.title.trim()) {
    setError("Title is required")
    return
  }
  if (!formData.role.trim()) {
    setError("Role is required")
    return
  }
  // ... more inline checks

  // ... submit logic
}
```

**Pattern 3: No validation** (BlurbEntry, ExperienceEntry edit modes)
```typescript
// Just saves whatever is in the form
const handleSave = async () => {
  // No validation!
  await onSave(editData)
}
```

**Recommendation:**
Standardize on validator functions with schema-based validation:

```typescript
// web/src/utils/validators.ts
export interface ValidationRule<T> {
  field: keyof T
  validator: (value: any) => string | null
}

export const validators = {
  required: (fieldName: string) => (value: any) =>
    !value || (typeof value === "string" && !value.trim())
      ? `${fieldName} is required`
      : null,

  email: (value: string) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? "Please enter a valid email"
      : null,

  minLength: (min: number) => (value: string) =>
    value.length < min
      ? `Must be at least ${min} characters`
      : null,

  url: (value: string) => {
    try {
      new URL(value)
      return null
    } catch {
      return "Please enter a valid URL"
    }
  },
}

export const createValidator = <T>(rules: ValidationRule<T>[]) => {
  return (data: T): Record<keyof T, string> => {
    const errors: any = {}

    for (const rule of rules) {
      const error = rule.validator(data[rule.field])
      if (error) {
        errors[rule.field] = error
      }
    }

    return errors
  }
}

// Usage in components:
const contactFormValidator = createValidator<ContactFormData>([
  { field: "name", validator: validators.required("Name") },
  { field: "email", validator: validators.required("Email") },
  { field: "email", validator: validators.email },
  { field: "message", validator: validators.required("Message") },
])

const validateForm = () => {
  const errors = contactFormValidator(formData)
  setErrors(errors)
  return Object.keys(errors).length === 0
}
```

**Benefits:**
- Consistent validation across all forms
- Reusable validation rules
- Easy to test
- **Essential for AI Resume Generator** (role, company, job description validation)

**Effort:** 4-5 hours

---

#### Issue 2.1B: Different Form State Management (High Priority)
**Impact:** Inconsistent patterns, code duplication
**Complexity:** High

**Analysis of form state across components:**

| Component | State Variables | Lines | Pattern |
|-----------|----------------|-------|---------|
| ContactForm | formData, errors, submitting | 12 | Separate states |
| CreateExperienceForm | formData, isCreating, error | 11 | Separate states |
| BlurbEntry | editData, isEditing, isSaving | 6 | Edit mode states |
| ExperienceEntry | editData, isEditing, isSaving, isDeleting, showDeleteDialog | 13 | Edit + delete states |

**Problem:** Each component manages state differently

**Recommendation:**
Create unified form state hook (see Issue 1.2 for implementation)

**Effort:** 6-8 hours (covered in Issue 1.2)

---

#### Issue 2.1C: Inconsistent Label Styling (Low Priority)
**Impact:** Minor inconsistency
**Complexity:** Low (quick win!)

**Pattern 1: Theme variant** (ContactForm)
```typescript
<Text as="label" variant="forms.label" htmlFor="name">
  Name
</Text>
```

**Pattern 2: Inline sx props** (CreateExperienceForm, BlurbEntry, ExperienceEntry)
```typescript
<Text
  as="label"
  htmlFor="title"
  sx={{
    fontSize: 1,
    fontWeight: "bold",
    mb: 1,
    display: "block",
  }}
>
  Title
</Text>
```

**Occurrences:** 16 duplicate inline label styles across 3 files

**Recommendation:**
1. Add `forms.label` variant to theme (if not exists)
2. OR create `<FormLabel>` component:

```typescript
// web/src/components/forms/FormLabel.tsx
import { Text, SxProp } from "theme-ui"

interface FormLabelProps {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
  sx?: SxProp
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  required,
  children,
  sx,
}) => (
  <Text
    as="label"
    htmlFor={htmlFor}
    sx={{
      fontSize: 1,
      fontWeight: "bold",
      mb: 1,
      display: "block",
      ...sx,
    }}
  >
    {children}
    {required && <span sx={{ color: "error", ml: 1 }}>*</span>}
  </Text>
)

// Usage:
<FormLabel htmlFor="title" required>
  Title
</FormLabel>
```

**Benefits:**
- Consistent label styling
- Easy to add required indicator
- Reduces 16 duplicated sx props to single component

**Effort:** 1-2 hours

---

### 2.2 Hook Pattern Inconsistencies

#### Issue 2.2D: Different Error Handling (Medium Priority)
**Impact:** Poor debugging experience
**Complexity:** Low

**Pattern 1: logger utility** (useAuth.ts)
```typescript
logger.error("Error sending verification email:", {
  error: error.message,
  code: error.code,
})
```

**Pattern 2: console.error** (useExperienceAPI.ts, useBlurbAPI.ts, all components)
```typescript
console.error("Error creating experience:", error)
```

**Recommendation:**
- Standardize on logger utility (see Issue 1.5)
- Add error context for better debugging

**Effort:** 3-4 hours (covered in Issue 1.5)

---

#### Issue 2.2E: Inconsistent Return Values for Mutations (Low Priority)
**Impact:** Inconsistent API usage
**Complexity:** Medium

**Pattern 1: Return created entity** (useExperienceAPI.ts)
```typescript
const createEntry = async (data: CreateExperienceData): Promise<ExperienceEntry | null> => {
  try {
    const response = await fetch(/* ... */)
    const result = await response.json()
    return result.data // Return the created entry
  } catch (error) {
    console.error("Error creating experience:", error)
    return null // Return null on error
  }
}
```

**Pattern 2: Return boolean** (useExperienceAPI.ts deleteEntry)
```typescript
const deleteEntry = async (entryId: string): Promise<boolean> => {
  try {
    await fetch(/* ... */)
    return true // Return success boolean
  } catch (error) {
    console.error("Error deleting experience:", error)
    return false // Return false on error
  }
}
```

**Pattern 3: Throw error** (useExperienceData.ts)
```typescript
const createEntry = async (data: CreateExperienceData) => {
  try {
    // ... logic
  } catch (error) {
    throw error // Let caller handle it
  }
}
```

**Recommendation:**
Standardize on Result<T, Error> pattern:

```typescript
// web/src/types/result.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

export const ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
})

export const err = <E = Error>(error: E): Result<never, E> => ({
  success: false,
  error,
})

// Usage in hooks:
const createEntry = async (data: CreateExperienceData): Promise<Result<ExperienceEntry>> => {
  try {
    const response = await fetch(/* ... */)
    const result = await response.json()
    return ok(result.data)
  } catch (error) {
    logger.error("Error creating experience", error)
    return err(error instanceof Error ? error : new Error("Unknown error"))
  }
}

// Usage in components:
const handleSubmit = async () => {
  const result = await createEntry(formData)

  if (result.success) {
    console.log("Created:", result.data)
  } else {
    console.error("Error:", result.error.message)
  }
}
```

**Benefits:**
- Explicit error handling
- Type-safe results
- No thrown exceptions to miss
- **Better for AI Resume Generator** (track success/failure, token usage)

**Effort:** 4-6 hours (refactor all API hooks)

**Priority:** Medium (nice to have, not blocking)

---

### 2.3 Firebase Integration Inconsistencies

#### Issue 2.3F: Different Firebase Initialization Patterns (Medium Priority)
**Impact:** Potential initialization bugs
**Complexity:** Medium

**Pattern 1: Lazy load in useEffect with ref** (ContactForm.tsx)
```typescript
const firebaseInitializedRef = useRef(false)

useEffect(() => {
  const initFirebase = async () => {
    if (firebaseInitializedRef.current) return

    const { default: firebase } = await import("../utils/firebase-app-check")
    await firebase.initialize()
    firebaseInitializedRef.current = true
  }

  initFirebase()
}, [])
```

**Pattern 2: Lazy load with getApps check** (useAuth.ts)
```typescript
const initFirebase = async () => {
  const { getApps } = await import("firebase/app")

  if (getApps().length === 0) {
    const { default: firebaseAppCheck } = await import("../utils/firebase-app-check")
    await firebaseAppCheck.initialize()
  }
}
```

**Pattern 3: Direct check** (firebase-app-check.ts)
```typescript
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
}
```

**Recommendation:**
Create centralized Firebase initialization:

```typescript
// web/src/utils/firebase.ts
import { getApps, initializeApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFunctions, Functions } from "firebase/functions"

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firebaseFunctions: Functions | null = null

const firebaseConfig = {
  // ... from env vars
}

export const initializeFirebase = async (): Promise<void> => {
  if (firebaseApp) return // Already initialized

  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    firebaseApp = getApps()[0]
  }

  // Initialize App Check
  const { initializeAppCheck, ReCaptchaV3Provider } = await import("firebase/app-check")
  await initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(process.env.GATSBY_RECAPTCHA_SITE_KEY!),
    isTokenAutoRefreshEnabled: true,
  })

  firebaseAuth = getAuth(firebaseApp)
  firebaseFunctions = getFunctions(firebaseApp, "us-central1")
}

export const getFirebaseApp = (): FirebaseApp => {
  if (!firebaseApp) throw new Error("Firebase not initialized")
  return firebaseApp
}

export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) throw new Error("Firebase Auth not initialized")
  return firebaseAuth
}

export const getFirebaseFunctions = (): Functions => {
  if (!firebaseFunctions) throw new Error("Firebase Functions not initialized")
  return firebaseFunctions
}

// Convenience hook
export const useFirebase = () => {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    initializeFirebase().then(() => setInitialized(true))
  }, [])

  return { initialized }
}
```

**Benefits:**
- Single initialization point
- No duplicate initialization checks
- Type-safe Firebase instance access
- **Essential for AI Resume Generator** (needs Firebase Auth + Functions)

**Effort:** 3-4 hours (refactor 3 files)

---

## 3. CODE REPETITION

### 3.1 Duplicate Edit Mode Components (HIGHEST IMPACT)

**Priority:** HIGH
**Complexity:** HIGH
**Estimated LOC Reduction:** 150-200 lines

#### Analysis

Three components have nearly identical edit form patterns:

| Component | Edit Mode Lines | Total Lines | % Edit Mode |
|-----------|----------------|-------------|-------------|
| ExperienceEntry.tsx | 136 (lines 86-221) | 354 | 38% |
| BlurbEntry.tsx | 50 (lines 63-112) | 232 | 22% |
| CreateExperienceForm.tsx | 125 (lines 73-197) | 225 | 56% |

**Total duplicate code:** ~150-200 lines

#### Duplicate Patterns

##### 1. Form Field Rendering
**Duplicated 16 times across 3 files:**

```typescript
<Text
  as="label"
  htmlFor="title"
  sx={{
    fontSize: 1,
    fontWeight: "bold",
    mb: 1,
    display: "block",
  }}
>
  Title
</Text>
<Input
  id="title"
  value={editData.title || ""}
  onChange={(e) =>
    setEditData({ ...editData, title: e.target.value })
  }
  sx={{ mb: 3 }}
/>
```

##### 2. Action Buttons
**Duplicated 3 times:**

```typescript
<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
  <Button
    variant="secondary"
    onClick={handleCancel}
    sx={{ flex: 1 }}
  >
    Cancel
  </Button>
  <Button
    onClick={handleSave}
    disabled={isSaving}
    sx={{ flex: 1 }}
  >
    {isSaving ? "Saving..." : "Save"}
  </Button>
</Box>
```

##### 3. Loading States
**Pattern repeated 4 times:**

```typescript
const [isSaving, setIsSaving] = useState(false)

const handleSave = async () => {
  setIsSaving(true)
  try {
    await onSave(editData)
  } catch (error) {
    console.error("Error:", error)
  } finally {
    setIsSaving(false)
  }
}
```

#### Recommendation

Create shared form components:

```typescript
// web/src/components/forms/FormField.tsx
interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: "text" | "textarea" | "date"
  required?: boolean
  placeholder?: string
  rows?: number
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  rows,
}) => (
  <Box sx={{ mb: 3 }}>
    <FormLabel htmlFor={name} required={required}>
      {label}
    </FormLabel>
    {type === "textarea" ? (
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        sx={{ fontFamily: "body" }}
      />
    ) : (
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )}
  </Box>
)

// web/src/components/forms/FormActions.tsx
interface FormActionsProps {
  onCancel: () => void
  onSave: () => void
  isSubmitting: boolean
  cancelText?: string
  saveText?: string
  saveTextWhileSubmitting?: string
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSave,
  isSubmitting,
  cancelText = "Cancel",
  saveText = "Save",
  saveTextWhileSubmitting = "Saving...",
}) => (
  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
    <Button
      variant="secondary"
      onClick={onCancel}
      disabled={isSubmitting}
      sx={{ flex: 1 }}
    >
      {cancelText}
    </Button>
    <Button
      onClick={onSave}
      disabled={isSubmitting}
      sx={{ flex: 1 }}
    >
      {isSubmitting ? saveTextWhileSubmitting : saveText}
    </Button>
  </Box>
)

// Usage in ExperienceEntry:
<FormField
  label="Title"
  name="title"
  value={editData.title || ""}
  onChange={(value) => setEditData({ ...editData, title: value })}
  required
/>

<FormField
  label="Role"
  name="role"
  value={editData.role || ""}
  onChange={(value) => setEditData({ ...editData, role: value })}
  required
/>

<FormField
  label="Content"
  name="content"
  type="textarea"
  rows={10}
  value={editData.content || ""}
  onChange={(value) => setEditData({ ...editData, content: value })}
  required
/>

<FormActions
  onCancel={() => setIsEditing(false)}
  onSave={handleSave}
  isSubmitting={isSaving}
/>
```

#### Benefits
- Reduce each component by 40-60 lines
- Consistent form UX across app
- Easy to add validation
- **Perfect for AI Resume Generator forms** (role, company, job description)

#### Effort
6-8 hours:
1. Create FormField component (1-2h)
2. Create FormActions component (1h)
3. Create FormLabel component (30min)
4. Refactor ExperienceEntry (1-2h)
5. Refactor BlurbEntry (1h)
6. Refactor CreateExperienceForm (1-2h)
7. Test all forms (1h)

---

### 3.2 Duplicate Markdown Styling (Medium Priority)

**Priority:** MEDIUM
**Complexity:** LOW (quick win!)
**Estimated LOC Reduction:** 30-40 lines

#### Analysis

Nearly identical ReactMarkdown style objects in 2 files:

**File 1:** `BlurbEntry.tsx:183-217` (35 lines)
**File 2:** `ExperienceEntry.tsx:295-323` (29 lines)

#### Duplicate Code

```typescript
// DUPLICATED IN 2 FILES
<ReactMarkdown
  components={{
    // ... components mapping
  }}
  sx={{
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      mt: 3,
      mb: 2,
      fontWeight: "bold",
    },
    "& h2": {
      fontSize: 3,
    },
    "& h3": {
      fontSize: 2,
    },
    "& ul, & ol": {
      pl: 4,
      mb: 2,
    },
    "& li": {
      mb: 1,
    },
    "& p": {
      mb: 2,
    },
    "& code": {
      bg: "muted",
      px: 1,
      py: "2px",
      borderRadius: "2px",
      fontFamily: "monospace",
      fontSize: "0.9em",
    },
    "& pre": {
      bg: "muted",
      p: 3,
      borderRadius: "4px",
      overflowX: "auto",
      mb: 2,
    },
    "& pre code": {
      bg: "transparent",
      p: 0,
    },
    "& a": {
      color: "primary",
      textDecoration: "underline",
    },
    "& blockquote": {
      borderLeft: "4px solid",
      borderColor: "primary",
      pl: 3,
      fontStyle: "italic",
      color: "text",
      opacity: 0.8,
    },
  }}
>
  {content}
</ReactMarkdown>
```

#### Recommendation

**Option 1: Extract styles constant**

```typescript
// web/src/styles/markdown.ts
import { SxProp } from "theme-ui"

export const markdownStyles: SxProp = {
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    mt: 3,
    mb: 2,
    fontWeight: "bold",
  },
  "& h2": {
    fontSize: 3,
  },
  "& h3": {
    fontSize: 2,
  },
  "& ul, & ol": {
    pl: 4,
    mb: 2,
  },
  "& li": {
    mb: 1,
  },
  "& p": {
    mb: 2,
  },
  "& code": {
    bg: "muted",
    px: 1,
    py: "2px",
    borderRadius: "2px",
    fontFamily: "monospace",
    fontSize: "0.9em",
  },
  "& pre": {
    bg: "muted",
    p: 3,
    borderRadius: "4px",
    overflowX: "auto",
    mb: 2,
  },
  "& pre code": {
    bg: "transparent",
    p: 0,
  },
  "& a": {
    color: "primary",
    textDecoration: "underline",
  },
  "& blockquote": {
    borderLeft: "4px solid",
    borderColor: "primary",
    pl: 3,
    fontStyle: "italic",
    color: "text",
    opacity: 0.8,
  },
}

// Usage:
import { markdownStyles } from "../styles/markdown"

<ReactMarkdown sx={markdownStyles}>
  {content}
</ReactMarkdown>
```

**Option 2: Create MarkdownContent component** (PREFERRED)

```typescript
// web/src/components/MarkdownContent.tsx
import ReactMarkdown from "react-markdown"
import { Box, SxProp } from "theme-ui"
import { markdownStyles } from "../styles/markdown"

interface MarkdownContentProps {
  content: string
  sx?: SxProp
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  sx,
}) => (
  <Box sx={{ ...markdownStyles, ...sx }}>
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h2>{children}</h2>, // Prevent double h1
        h2: ({ children }) => <h2>{children}</h2>,
        h3: ({ children }) => <h3>{children}</h3>,
        h4: ({ children }) => <h4>{children}</h4>,
        h5: ({ children }) => <h5>{children}</h5>,
        h6: ({ children }) => <h6>{children}</h6>,
      }}
    >
      {content}
    </ReactMarkdown>
  </Box>
)

// Usage:
<MarkdownContent content={entry.content} />
```

#### Benefits
- Single source of truth for markdown rendering
- Easy to update styles globally
- Consistent markdown rendering
- **Will be used in AI Resume Generator** (display generated content)

#### Effort
1-2 hours:
1. Create `web/src/styles/markdown.ts` (30min)
2. Create `MarkdownContent` component (30min)
3. Refactor BlurbEntry (15min)
4. Refactor ExperienceEntry (15min)
5. Test markdown rendering (30min)

---

### 3.3 Duplicate API Configuration (CRITICAL)

**Already covered in Issue 1.4**

**Summary:**
- 3 files with duplicate API_CONFIG (21 lines)
- 3 files with duplicate getApiUrl function (9 lines)
- Total: 30 lines of duplication

**Effort:** 1 hour (see Issue 1.4 for full details)

---

### 3.4 Duplicate Form Submission Logic (High Priority)

**Priority:** HIGH
**Complexity:** MEDIUM
**Estimated LOC Reduction:** 50-80 lines

#### Analysis

All 4 form components share identical submission patterns:

| Component | handleSubmit/handleSave Lines |
|-----------|-------------------------------|
| ContactForm.tsx | 138 lines (83-220) |
| CreateExperienceForm.tsx | 41 lines (27-67) |
| BlurbEntry.tsx | 17 lines (36-52) |
| ExperienceEntry.tsx | 11 lines (42-52) |

#### Common Pattern

```typescript
// REPEATED IN ALL 4 COMPONENTS
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // 1. Set loading state
  setIsSubmitting(true) // or setIsSaving(true), setIsCreating(true)

  try {
    // 2. Call API
    await someApiCall(formData)

    // 3. Success actions
    resetForm() // or setIsEditing(false), onSuccess()

  } catch (error) {
    // 4. Error handling
    console.error("Error:", error)
    setError(error.message)

  } finally {
    // 5. Reset loading state
    setIsSubmitting(false)
  }
}
```

#### Recommendation

Create `useAsyncSubmit` hook (already covered in Issue 1.2):

```typescript
// web/src/hooks/useAsyncSubmit.ts
export const useAsyncSubmit = <T>(
  onSubmit: (data: T) => Promise<void>,
  options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
  }
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: T) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(data)
      options?.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      options?.onError?.(err as Error)
      logger.error("Form submission error", err as Error, { data })
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, options])

  return {
    submit,
    isSubmitting,
    error,
    clearError: () => setError(null),
  }
}

// Usage in ContactForm:
const { submit, isSubmitting, error } = useAsyncSubmit<ContactFormData>(
  async (data) => {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to send message")
    }
  },
  {
    onSuccess: () => {
      resetForm()
      setSubmitSuccess(true)
    },
  }
)

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return
  submit(formData)
}
```

#### Benefits
- Consistent submission handling
- Automatic error handling
- Centralized logging
- **Essential for AI Resume Generator** (track submission errors, retry logic)

#### Effort
3-4 hours:
1. Create useAsyncSubmit hook (1h)
2. Refactor ContactForm (30min)
3. Refactor CreateExperienceForm (30min)
4. Refactor BlurbEntry (30min)
5. Refactor ExperienceEntry (30min)
6. Test all forms (1h)

---

### 3.5 Duplicate Date Formatting (Low Priority)

**Priority:** LOW
**Complexity:** LOW
**Estimated LOC Reduction:** 5-10 lines

#### Analysis

**File:** `ExperienceEntry.tsx:33-40`

```typescript
const formatDate = (timestamp: Timestamp | string) => {
  if (!timestamp) return ""
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp.toDate()
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
```

**Currently only used in one place**, but likely needed elsewhere

#### Recommendation

Only extract if used in multiple components:

```typescript
// web/src/utils/date-formatters.ts
import { Timestamp } from "firebase/firestore"

export const formatDate = (timestamp: Timestamp | Date | string): string => {
  if (!timestamp) return ""

  let date: Date

  if (timestamp instanceof Date) {
    date = timestamp
  } else if (typeof timestamp === "string") {
    date = new Date(timestamp)
  } else {
    // Firestore Timestamp
    date = timestamp.toDate()
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatDateTime = (timestamp: Timestamp | Date | string): string => {
  if (!timestamp) return ""

  const date = formatDate(timestamp)
  const time = new Date(timestamp as any).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return `${date} at ${time}`
}

// Usage:
import { formatDate } from "../utils/date-formatters"

<Text sx={{ fontSize: 0, color: "textSecondary" }}>
  {formatDate(entry.createdAt)}
</Text>
```

#### Benefits
- Consistent date formatting
- **Useful for AI Resume Generator** (format generation timestamps)

#### Effort
30 minutes (only extract if needed in 2+ places)

---

## 4. ARCHITECTURAL RECOMMENDATIONS

### 4.1 Shared Form Component Library (High Priority)

**Goal:** Eliminate 150-200 lines of duplicate form code

#### Components to Create

```
web/src/components/forms/
├── FormField.tsx          # Label + Input/Textarea
├── FormLabel.tsx          # Consistent label styling
├── FormActions.tsx        # Cancel/Save buttons
├── FormError.tsx          # Error message display
├── MarkdownEditor.tsx     # Textarea with markdown preview
└── index.ts               # Barrel export
```

#### Implementation Details

**1. FormLabel.tsx**
```typescript
import { Text, SxProp } from "theme-ui"

interface FormLabelProps {
  htmlFor: string
  required?: boolean
  children: React.ReactNode
  sx?: SxProp
}

export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  required,
  children,
  sx,
}) => (
  <Text
    as="label"
    htmlFor={htmlFor}
    sx={{
      fontSize: 1,
      fontWeight: "bold",
      mb: 1,
      display: "block",
      ...sx,
    }}
  >
    {children}
    {required && (
      <span sx={{ color: "error", ml: 1 }} aria-label="required">
        *
      </span>
    )}
  </Text>
)
```

**2. FormField.tsx**
```typescript
import { Box, Input, Textarea, SxProp } from "theme-ui"
import { FormLabel } from "./FormLabel"

interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: "text" | "email" | "url" | "date" | "textarea"
  required?: boolean
  placeholder?: string
  rows?: number
  error?: string
  helpText?: string
  sx?: SxProp
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  rows = 4,
  error,
  helpText,
  sx,
}) => {
  const hasError = Boolean(error)

  return (
    <Box sx={{ mb: 3, ...sx }}>
      <FormLabel htmlFor={name} required={required}>
        {label}
      </FormLabel>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          sx={{
            fontFamily: "body",
            borderColor: hasError ? "error" : "muted",
          }}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          sx={{
            borderColor: hasError ? "error" : "muted",
          }}
        />
      )}

      {error && (
        <Text
          id={`${name}-error`}
          sx={{
            fontSize: 0,
            color: "error",
            mt: 1,
          }}
          role="alert"
        >
          {error}
        </Text>
      )}

      {helpText && !error && (
        <Text
          sx={{
            fontSize: 0,
            color: "textSecondary",
            mt: 1,
          }}
        >
          {helpText}
        </Text>
      )}
    </Box>
  )
}
```

**3. FormActions.tsx**
```typescript
import { Box, Button, SxProp } from "theme-ui"

interface FormActionsProps {
  onCancel?: () => void
  onSubmit: () => void
  isSubmitting: boolean
  cancelText?: string
  submitText?: string
  submitTextWhileSubmitting?: string
  variant?: "save" | "create" | "submit"
  sx?: SxProp
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  cancelText = "Cancel",
  submitText,
  submitTextWhileSubmitting,
  variant = "save",
  sx,
}) => {
  const defaultSubmitText = {
    save: "Save",
    create: "Create",
    submit: "Submit",
  }[variant]

  const defaultSubmittingText = {
    save: "Saving...",
    create: "Creating...",
    submit: "Submitting...",
  }[variant]

  return (
    <Box sx={{ display: "flex", gap: 2, mt: 3, ...sx }}>
      {onCancel && (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{ flex: 1 }}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        sx={{ flex: 1 }}
      >
        {isSubmitting
          ? submitTextWhileSubmitting || defaultSubmittingText
          : submitText || defaultSubmitText}
      </Button>
    </Box>
  )
}
```

**4. FormError.tsx**
```typescript
import { Box, Text, Button, SxProp } from "theme-ui"

interface FormErrorProps {
  error: string | null
  onRetry?: () => void
  sx?: SxProp
}

export const FormError: React.FC<FormErrorProps> = ({
  error,
  onRetry,
  sx,
}) => {
  if (!error) return null

  return (
    <Box
      role="alert"
      sx={{
        bg: "errorBackground",
        border: "1px solid",
        borderColor: "error",
        borderRadius: "4px",
        p: 3,
        mb: 3,
        ...sx,
      }}
    >
      <Text sx={{ color: "error", fontWeight: "bold", mb: 1 }}>
        Error
      </Text>
      <Text sx={{ color: "error", mb: onRetry ? 2 : 0 }}>
        {error}
      </Text>
      {onRetry && (
        <Button
          variant="secondary"
          size="small"
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  )
}
```

**5. MarkdownEditor.tsx**
```typescript
import { useState } from "react"
import { Box, Textarea, Button, SxProp } from "theme-ui"
import { FormLabel } from "./FormLabel"
import { MarkdownContent } from "../MarkdownContent"

interface MarkdownEditorProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  rows?: number
  helpText?: string
  sx?: SxProp
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  label,
  name,
  value,
  onChange,
  required,
  placeholder,
  rows = 10,
  helpText,
  sx,
}) => {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <Box sx={{ mb: 3, ...sx }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <FormLabel htmlFor={name} required={required}>
          {label}
        </FormLabel>
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={() => setShowPreview(!showPreview)}
          sx={{ fontSize: 0 }}
        >
          {showPreview ? "Edit" : "Preview"}
        </Button>
      </Box>

      {showPreview ? (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "4px",
            p: 3,
            minHeight: `${rows * 1.5}rem`,
            bg: "background",
          }}
        >
          <MarkdownContent content={value || "Nothing to preview"} />
        </Box>
      ) : (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Write in Markdown..."}
          rows={rows}
          sx={{
            fontFamily: "monospace",
            fontSize: 1,
          }}
        />
      )}

      {helpText && (
        <Text
          sx={{
            fontSize: 0,
            color: "textSecondary",
            mt: 1,
          }}
        >
          {helpText}
        </Text>
      )}
    </Box>
  )
}
```

**6. index.ts (Barrel export)**
```typescript
export * from "./FormLabel"
export * from "./FormField"
export * from "./FormActions"
export * from "./FormError"
export * from "./MarkdownEditor"
```

#### Usage Examples

**Before (ExperienceEntry.tsx - 30 lines):**
```typescript
<Text
  as="label"
  htmlFor="title"
  sx={{
    fontSize: 1,
    fontWeight: "bold",
    mb: 1,
    display: "block",
  }}
>
  Title
</Text>
<Input
  id="title"
  value={editData.title || ""}
  onChange={(e) =>
    setEditData({ ...editData, title: e.target.value })
  }
  sx={{ mb: 3 }}
/>

<Text
  as="label"
  htmlFor="content"
  sx={{
    fontSize: 1,
    fontWeight: "bold",
    mb: 1,
    display: "block",
  }}
>
  Content
</Text>
<Textarea
  id="content"
  value={editData.content || ""}
  onChange={(e) =>
    setEditData({ ...editData, content: e.target.value })
  }
  rows={10}
  sx={{ mb: 3, fontFamily: "body" }}
/>

<Box sx={{ display: "flex", gap: 2, mt: 3 }}>
  <Button
    variant="secondary"
    onClick={() => setIsEditing(false)}
    sx={{ flex: 1 }}
  >
    Cancel
  </Button>
  <Button
    onClick={handleSave}
    disabled={isSaving}
    sx={{ flex: 1 }}
  >
    {isSaving ? "Saving..." : "Save"}
  </Button>
</Box>
```

**After (ExperienceEntry.tsx - 10 lines):**
```typescript
import { FormField, MarkdownEditor, FormActions } from "./forms"

<FormField
  label="Title"
  name="title"
  value={editData.title || ""}
  onChange={(value) => setEditData({ ...editData, title: value })}
  required
/>

<MarkdownEditor
  label="Content"
  name="content"
  value={editData.content || ""}
  onChange={(value) => setEditData({ ...editData, content: value })}
  rows={10}
  helpText="You can use Markdown formatting"
  required
/>

<FormActions
  onCancel={() => setIsEditing(false)}
  onSubmit={handleSave}
  isSubmitting={isSaving}
  variant="save"
/>
```

#### Benefits
- **70% reduction** in form component code
- Consistent UX across all forms
- Easier accessibility compliance
- Built-in error handling
- **Perfect for AI Resume Generator** (needs similar forms)

#### Effort
8-10 hours:
1. Create 5 form components (4h)
2. Create MarkdownContent component (1h)
3. Refactor ExperienceEntry (1h)
4. Refactor BlurbEntry (1h)
5. Refactor CreateExperienceForm (1h)
6. Refactor ContactForm (1h)
7. Test all forms (1h)

---

### 4.2 Unified API Client (High Priority)

**Goal:** Single source of truth for all API operations

#### Architecture

```
web/src/api/
├── client.ts              # Base API client
├── experience-client.ts   # Experience operations
├── blurb-client.ts        # Blurb operations
├── contact-client.ts      # Contact form submission
├── types.ts               # Shared types
└── index.ts               # Barrel export
```

#### Implementation Details

**1. client.ts (Base API Client)**
```typescript
// web/src/api/client.ts
import { logger } from "../utils/logger"

export interface ApiConfig {
  baseUrl: string
  timeout?: number
  headers?: Record<string, string>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}/${endpoint}`
    const timeout = this.config.timeout || 30000

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      logger.info("API request", {
        endpoint,
        method: options.method || "GET",
      })

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `API error: ${response.status}`,
          response.status,
          errorData.code
        )
      }

      const data = await response.json()

      logger.info("API response", {
        endpoint,
        status: response.status,
      })

      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        logger.error("API error", error, { endpoint })
        throw error
      }

      if (error.name === "AbortError") {
        logger.error("API timeout", error, { endpoint, timeout })
        throw new ApiError("Request timeout", 408, "TIMEOUT")
      }

      logger.error("Network error", error, { endpoint })
      throw new ApiError("Network error", undefined, "NETWORK_ERROR")
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  protected async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  protected async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}
```

**2. experience-client.ts**
```typescript
// web/src/api/experience-client.ts
import { ApiClient } from "./client"
import { ExperienceEntry, CreateExperienceData } from "../types/experience"

export class ExperienceClient extends ApiClient {
  async getEntries(): Promise<ExperienceEntry[]> {
    const response = await this.get<{ data: ExperienceEntry[] }>("getExperiences")
    return response.data
  }

  async createEntry(data: CreateExperienceData): Promise<ExperienceEntry> {
    const response = await this.post<{ data: ExperienceEntry }>(
      "createExperience",
      data
    )
    return response.data
  }

  async updateEntry(
    id: string,
    data: Partial<ExperienceEntry>
  ): Promise<ExperienceEntry> {
    const response = await this.put<{ data: ExperienceEntry }>(
      "updateExperience",
      { id, ...data }
    )
    return response.data
  }

  async deleteEntry(id: string): Promise<void> {
    await this.delete(`deleteExperience?id=${id}`)
  }
}
```

**3. blurb-client.ts**
```typescript
// web/src/api/blurb-client.ts
import { ApiClient } from "./client"
import { BlurbEntry } from "../types/experience"

export class BlurbClient extends ApiClient {
  async getBlurbs(): Promise<Record<string, BlurbEntry>> {
    const response = await this.get<{ data: Record<string, BlurbEntry> }>(
      "getBlurbs"
    )
    return response.data
  }

  async saveBlurb(
    blurbId: string,
    data: Partial<BlurbEntry>
  ): Promise<BlurbEntry> {
    const response = await this.post<{ data: BlurbEntry }>("saveBlurb", {
      blurbId,
      ...data,
    })
    return response.data
  }
}
```

**4. index.ts (Factory & Hook)**
```typescript
// web/src/api/index.ts
import { ApiClient } from "./client"
import { ExperienceClient } from "./experience-client"
import { BlurbClient } from "./blurb-client"

const getBaseUrl = (): string => {
  if (typeof window === "undefined") return ""

  const isDev = window.location.hostname === "localhost"
  const isStaging = window.location.hostname.includes("staging")

  if (isDev) {
    return "http://127.0.0.1:5001/static-sites-257923/us-central1"
  }

  return "https://us-central1-static-sites-257923.cloudfunctions.net"
}

export const createApiClients = () => {
  const baseUrl = getBaseUrl()

  return {
    experience: new ExperienceClient({ baseUrl }),
    blurb: new BlurbClient({ baseUrl }),
  }
}

// Hook for React components
export const useApiClients = () => {
  return useMemo(() => createApiClients(), [])
}
```

**5. Updated useExperienceData.ts**
```typescript
// web/src/hooks/useExperienceData.ts
import { useState, useEffect, useCallback } from "react"
import { useApiClients } from "../api"
import { ExperienceEntry, BlurbEntry, CreateExperienceData } from "../types/experience"
import { logger } from "../utils/logger"

export const useExperienceData = () => {
  const api = useApiClients()

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([])
  const [blurbs, setBlurbs] = useState<Record<string, BlurbEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [entriesData, blurbsData] = await Promise.all([
        api.experience.getEntries(),
        api.blurb.getBlurbs(),
      ])

      setExperiences(entriesData)
      setBlurbs(blurbsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load data"
      setError(message)
      logger.error("Failed to fetch data", err as Error)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // CRUD operations
  const createEntry = useCallback(
    async (data: CreateExperienceData) => {
      const entry = await api.experience.createEntry(data)
      setExperiences(prev => [entry, ...prev])
      return entry
    },
    [api]
  )

  const updateEntry = useCallback(
    async (id: string, data: Partial<ExperienceEntry>) => {
      const updated = await api.experience.updateEntry(id, data)
      setExperiences(prev =>
        prev.map(entry => (entry.id === id ? updated : entry))
      )
      return updated
    },
    [api]
  )

  const deleteEntry = useCallback(
    async (id: string) => {
      await api.experience.deleteEntry(id)
      setExperiences(prev => prev.filter(entry => entry.id !== id))
    },
    [api]
  )

  const saveBlurb = useCallback(
    async (blurbId: string, data: Partial<BlurbEntry>) => {
      const updated = await api.blurb.saveBlurb(blurbId, data)
      setBlurbs(prev => ({ ...prev, [blurbId]: updated }))
      return updated
    },
    [api]
  )

  return {
    experiences,
    blurbs,
    loading,
    error,
    fetchData,
    createEntry,
    updateEntry,
    deleteEntry,
    saveBlurb,
  }
}
```

#### Benefits
- **Single source of truth** for API calls
- **Type-safe** API client
- Centralized error handling and logging
- Easy to mock for testing
- **Easy to add resume generator endpoints**:
  ```typescript
  // web/src/api/resume-client.ts
  export class ResumeClient extends ApiClient {
    async generateDocuments(data: GenerateDocumentsRequest) {
      return this.post<GenerateDocumentsResponse>("generateDocuments", data)
    }

    async listDocuments(filters?: DocumentFilters) {
      return this.get<ListDocumentsResponse>(`listDocuments?${qs.stringify(filters)}`)
    }

    async getDocument(sessionId: string, documentType: "resume" | "cover-letter") {
      return this.get<DocumentResponse>(`getDocument?sessionId=${sessionId}&type=${documentType}`)
    }
  }
  ```

#### Effort
6-8 hours:
1. Create ApiClient base class (2h)
2. Create ExperienceClient (1h)
3. Create BlurbClient (1h)
4. Update useExperienceData (1h)
5. Delete useExperienceAPI, useBlurbAPI (30min)
6. Test all API operations (2h)

---

### 4.3 Form Utilities Library (Medium Priority)

**Goal:** Reusable form state management and validation

#### Files to Create

```
web/src/hooks/
├── useFormState.ts        # Generic form state management
├── useFormValidation.ts   # Validation logic
├── useAsyncSubmit.ts      # Async submission with loading/error
└── form-utils.ts          # Helper functions

web/src/utils/
└── validators.ts          # Reusable validation functions
```

#### Implementation

Already covered in Issues 1.2, 2.1A, and 3.4. See those sections for full code.

#### Benefits
- 40-50% reduction in form component complexity
- Consistent validation across app
- Easier to test
- **Essential for AI Resume Generator** (complex form with validation)

#### Effort
6-8 hours (covered in Issue 1.2)

---

## 5. PRIORITY REFACTORING ROADMAP

### Phase 1: Low-Hanging Fruit (1-2 days)

**Goal:** Quick wins with minimal risk

#### Tasks

| Task | Priority | Complexity | LOC Reduction | Effort |
|------|----------|-----------|---------------|--------|
| Extract API_CONFIG | HIGH | LOW | 20-25 lines | 1h |
| Extract markdown styles | MEDIUM | LOW | 30-40 lines | 1-2h |
| Standardize label styling | LOW | LOW | 10-15 lines | 1-2h |
| Replace console with logger | MEDIUM | LOW | 0 lines | 3-4h |

**Total LOC reduction:** 60-80 lines
**Total effort:** 6-9 hours (1-2 days)
**Maintenance improvement:** 15%

#### Order of Execution

1. **Create `/web/src/config/api.ts`** (Issue 1.4)
   - Extract API_CONFIG and getApiUrl
   - Update 3 hooks to import from config
   - Test all API operations
   - **Benefit:** Single source of truth for endpoints

2. **Create `/web/src/styles/markdown.ts`** (Issue 3.2)
   - Extract markdownStyles constant
   - Create MarkdownContent component
   - Update BlurbEntry and ExperienceEntry
   - Test markdown rendering
   - **Benefit:** Consistent markdown styling

3. **Create `/web/src/components/forms/FormLabel.tsx`** (Issue 2.1C)
   - Extract label component
   - Update 4 components to use FormLabel
   - Test label rendering
   - **Benefit:** Consistent label styling + required indicator

4. **Enhance `/web/src/utils/logger.ts`** (Issue 1.5)
   - Add context support
   - Find and replace all console.* calls
   - Test logging in dev/prod
   - **Benefit:** Better observability

---

### Phase 2: Form Components (3-5 days)

**Goal:** Eliminate duplicate form logic

#### Tasks

| Task | Priority | Complexity | LOC Reduction | Effort |
|------|----------|-----------|---------------|--------|
| Create FormField component | HIGH | MEDIUM | 40-60 lines | 2h |
| Create FormActions component | HIGH | LOW | 20-30 lines | 1h |
| Create MarkdownEditor component | MEDIUM | MEDIUM | 30-40 lines | 2h |
| Create useAsyncSubmit hook | HIGH | MEDIUM | 50-80 lines | 1-2h |
| Standardize validation | HIGH | MEDIUM | 30-50 lines | 4-5h |
| Refactor 4 form components | HIGH | MEDIUM | - | 4-6h |

**Total LOC reduction:** 170-260 lines
**Total effort:** 14-18 hours (3-5 days)
**Maintenance improvement:** 30%

#### Order of Execution

1. **Create form components library** (Issues 3.1, 4.1)
   - FormLabel (already done in Phase 1)
   - FormField
   - FormActions
   - FormError
   - MarkdownEditor
   - **Effort:** 5-6 hours

2. **Create useAsyncSubmit hook** (Issue 3.4)
   - Generic async submission with loading/error states
   - **Effort:** 1-2 hours

3. **Create validation utilities** (Issue 2.1A)
   - validators.ts with common rules
   - createValidator factory
   - **Effort:** 2-3 hours

4. **Refactor form components** (one at a time)
   - ExperienceEntry (1-2h)
   - BlurbEntry (1h)
   - CreateExperienceForm (1-2h)
   - ContactForm (1-2h)
   - Test each after refactoring
   - **Effort:** 4-6 hours

---

### Phase 3: API Layer (3-4 days)

**Goal:** Unified API client architecture

#### Tasks

| Task | Priority | Complexity | LOC Reduction | Effort |
|------|----------|-----------|---------------|--------|
| Create ApiClient base class | HIGH | MEDIUM | - | 2h |
| Create ExperienceClient | HIGH | LOW | - | 1h |
| Create BlurbClient | HIGH | LOW | - | 1h |
| Update useExperienceData | HIGH | MEDIUM | - | 1h |
| Delete redundant hooks | MEDIUM | LOW | 400 lines | 30min |
| Centralize Firebase init | MEDIUM | MEDIUM | 20-30 lines | 3-4h |

**Total LOC reduction:** 420-430 lines
**Total effort:** 12-16 hours (3-4 days)
**Maintenance improvement:** 25%

#### Order of Execution

1. **Create API client library** (Issue 4.2)
   - client.ts (base class)
   - experience-client.ts
   - blurb-client.ts
   - types.ts
   - index.ts
   - **Effort:** 4-5 hours

2. **Update useExperienceData hook** (Issue 4.2)
   - Use new API clients
   - Test all CRUD operations
   - **Effort:** 1-2 hours

3. **Verify no usage of old hooks** (Issue 1.3)
   - Search for imports of useExperienceAPI
   - Search for imports of useBlurbAPI
   - Delete both files if unused
   - **Effort:** 30 minutes

4. **Centralize Firebase initialization** (Issue 2.3F)
   - Create web/src/utils/firebase.ts
   - Update ContactForm, useAuth, firebase-app-check
   - Test Firebase initialization
   - **Effort:** 3-4 hours

5. **Test everything**
   - Manual testing of all forms
   - Test API operations
   - Test Firebase auth flow
   - **Effort:** 2-3 hours

---

### Phase 4: Advanced Refactoring (5-7 days) - OPTIONAL

**Goal:** Maximum code reduction and maintainability

**Note:** This phase is optional and should only be done if time permits. It provides diminishing returns compared to Phases 1-3.

#### Tasks

| Task | Priority | Complexity | LOC Reduction | Effort |
|------|----------|-----------|---------------|--------|
| Create useFormState hook | MEDIUM | HIGH | 40-60 lines | 2-3h |
| Create useFormValidation hook | MEDIUM | HIGH | 30-50 lines | 2-3h |
| Extract date formatters | LOW | LOW | 5-10 lines | 30min |
| Create EditForm wrapper | MEDIUM | HIGH | 100-150 lines | 4-6h |
| Standardize return types | LOW | MEDIUM | 0 lines | 4-6h |

**Total LOC reduction:** 175-270 lines
**Total effort:** 13-19 hours (5-7 days)
**Maintenance improvement:** 15%

**Priority:** LOW - Skip this phase for now, focus on AI Resume Generator instead

---

## 6. AI RESUME GENERATOR PREPARATORY TASKS

Based on the [ai-resume-generator-plan.md](./ai-resume-generator-plan.md) and the audit findings, here are the required preparatory steps before implementing the AI Resume Generator feature.

### 6.1 Prerequisites from Refactoring

**MUST COMPLETE before starting AI Resume Generator:**

#### Phase 1 (1-2 days) - REQUIRED
✅ Extract API_CONFIG (Issue 1.4)
✅ Enhance logger with context (Issue 1.5)
✅ Create FormLabel component (Issue 2.1C)
✅ Extract markdown styles (Issue 3.2)

**Reason:** AI Resume Generator will need:
- API_CONFIG for new endpoints (generateDocuments, listDocuments, getDocument)
- Logger for tracking token usage, costs, errors
- FormLabel for consistent form UI
- Markdown rendering for displaying generated content

#### Phase 2 (3-5 days) - HIGHLY RECOMMENDED
✅ Create form components library (FormField, FormActions, MarkdownEditor)
✅ Create useAsyncSubmit hook
✅ Create validation utilities

**Reason:** AI Resume Generator has complex forms:
- Viewer form (role, company, optional job description)
- Editor prompt editing (4 blurbs with markdown)
- Document filters and search

#### Phase 3 (3-4 days) - RECOMMENDED
✅ Create unified API client
✅ Centralize Firebase initialization

**Reason:** AI Resume Generator needs:
- Firebase Auth (editor role check)
- Firebase Functions (callable functions for listDocuments, getDocument)
- Easy API client extension for new endpoints

---

### 6.2 New Infrastructure Setup

**Timeline:** 1 week (parallel with Phase 1-2 refactoring)

#### 1. GCP Setup (2-3 hours)

**Tasks:**
- [ ] Create GCS bucket `joshwentworth-resumes`
  - Location: `us-central1`
  - Storage class: Standard
  - Lifecycle rule: Delete files after 90 days
  - IAM: Cloud Functions service account needs `storage.objectAdmin`

- [ ] Add OpenAI API key to Secret Manager
  - Secret name: `openai-api-key`
  - Grant Cloud Functions access

- [ ] Configure Firebase Functions environment
  - Update functions region: `us-central1`
  - Update runtime: Node.js 20
  - Update memory: 1GiB (for Puppeteer)
  - Update timeout: 300s (5 minutes)

**Commands:**
```bash
# Create GCS bucket
gsutil mb -l us-central1 -c standard gs://joshwentworth-resumes

# Set lifecycle policy
cat <<EOF > lifecycle.json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF
gsutil lifecycle set lifecycle.json gs://joshwentworth-resumes

# Add OpenAI API key to Secret Manager
echo -n "YOUR_OPENAI_API_KEY" | gcloud secrets create openai-api-key \
  --data-file=- \
  --replication-policy=automatic

# Grant Functions access to secret
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:static-sites-257923@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Functions access to GCS bucket
gsutil iam ch \
  serviceAccount:static-sites-257923@appspot.gserviceaccount.com:roles/storage.objectAdmin \
  gs://joshwentworth-resumes
```

---

#### 2. Firestore Collections (1 hour)

**Collections to create:**
- `resume-generations` (generation logs)
- `blurbs` (already exists for prompts)

**Firestore security rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Resume generations collection
    match /resume-generations/{generationId} {
      // Editors can read all
      allow read: if request.auth != null &&
                     request.auth.token.role == 'editor';

      // Cloud Functions can write
      allow write: if request.auth.token.admin == true;
    }

    // Blurbs collection (prompts)
    match /blurbs/{blurbId} {
      // Anyone can read (for generation)
      allow read: if true;

      // Only editors can write
      allow write: if request.auth != null &&
                      request.auth.token.role == 'editor';
    }
  }
}
```

**Initial prompt blurbs to seed:**
```typescript
// scripts/seed-resume-prompts.ts
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const prompts = [
  {
    id: "resume-system-prompt",
    content: `You are an expert resume writer with 20+ years of experience helping software engineers land positions at top tech companies. You specialize in ATS-friendly resumes that highlight technical accomplishments with quantifiable impact. You tailor each resume to the specific role and company, emphasizing relevant experience and skills.`,
    type: "system",
    category: "resume",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "resume-user-prompt-template",
    content: `Create a {style} resume for the "{role}" position at {company}.

Experience Data:
{experienceData}

Job Details:
- Company: {company}
- Website: {companyWebsite}
- Role: {role}
- Job Description: {jobDescription}

Requirements:
- Use action verbs and quantify achievements where possible
- Tailor experience highlights to match the job description
- Emphasize: {emphasize}
- Target length: 1 page
- Focus on recent and relevant experience
- Ensure ATS compatibility
- Highlight skills and technologies mentioned in job description

Output Format: Structured JSON matching the ResumeContent schema`,
    type: "user",
    category: "resume",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cover-letter-system-prompt",
    content: `You are an expert cover letter writer specializing in helping software engineers craft compelling, personalized cover letters. Your letters are concise (3-4 paragraphs), professional, and highlight the candidate's most relevant accomplishments for the specific role and company.`,
    type: "system",
    category: "cover-letter",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cover-letter-user-prompt-template",
    content: `Create a professional cover letter for the "{role}" position at {company}.

Candidate Experience:
{experienceData}

Job Details:
- Company: {company}
- Website: {companyWebsite}
- Role: {role}
- Job Description: {jobDescription}

Requirements:
- 3-4 paragraphs maximum
- Professional but warm tone
- Highlight 2-3 most relevant accomplishments from experience
- Show knowledge of company (if website/description provided)
- Explain why candidate is a great fit for this specific role
- Include clear call to action

Output Format: Structured JSON matching the CoverLetterContent schema`,
    type: "user",
    category: "cover-letter",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedPrompts() {
  const db = getFirestore()

  for (const prompt of prompts) {
    await db.collection("blurbs").doc(prompt.id).set(prompt)
    console.log(`Seeded prompt: ${prompt.id}`)
  }
}

seedPrompts()
```

**Run seed script:**
```bash
cd functions
npm run seed:resume-prompts
```

---

#### 3. Functions Dependencies (30 minutes)

**Add to `functions/package.json`:**
```json
{
  "dependencies": {
    "openai": "^4.67.0",
    "puppeteer-core": "^23.0.0",
    "@sparticuz/chromium": "^131.0.0"
  }
}
```

**Install:**
```bash
cd functions
npm install
```

**Update `functions/package.json` scripts:**
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "firebase emulators:start --only functions",
    "deploy:staging": "firebase deploy --only functions:generateDocuments-staging,functions:listDocuments-staging,functions:getDocument-staging",
    "deploy:production": "firebase deploy --only functions:generateDocuments,functions:listDocuments,functions:getDocument"
  }
}
```

---

#### 4. TypeScript Types (1-2 hours)

**Create shared types:**

```typescript
// functions/src/types/resume.ts
export interface DocumentGenerationRequest {
  // Required
  role: string
  company: string

  // Optional
  companyWebsite?: string
  jobDescriptionUrl?: string
  jobDescriptionText?: string

  // Editor-only (internal)
  style?: "modern" | "traditional" | "technical" | "executive"
  emphasize?: string[]
}

export interface ResumeContent {
  personalInfo: {
    name: string
    title: string
    summary: string
    contact: {
      email: string
      location?: string
      website?: string
      linkedin?: string
      github?: string
    }
  }
  professionalSummary: string
  experience: {
    company: string
    role: string
    location?: string
    startDate: string
    endDate: string | null
    highlights: string[]
    technologies?: string[]
  }[]
  skills?: {
    category: string
    items: string[]
  }[]
  education?: {
    institution: string
    degree: string
    field?: string
    startDate?: string
    endDate?: string
  }[]
}

export interface CoverLetterContent {
  greeting: string
  openingParagraph: string
  bodyParagraphs: string[]
  closingParagraph: string
  signature: string
}

export interface DocumentGenerationResponse {
  success: boolean
  sessionId: string
  resumeUrl: string
  coverLetterUrl: string
  metadata: {
    generatedAt: string
    role: string
    company: string
    style: string
    tokenUsage: {
      resumePrompt: number
      resumeCompletion: number
      coverLetterPrompt: number
      coverLetterCompletion: number
      total: number
    }
    costUsd: number
    model: string
  }
}

export interface GenerationLog {
  id: string
  timestamp: Timestamp
  role: string
  company: string
  companyWebsite?: string
  jobDescriptionUrl?: string
  hasJobDescription: boolean
  style: string
  emphasize?: string[]
  success: boolean
  error?: string
  resumePath: string
  coverLetterPath: string
  durationMs: number
  tokenUsage: {
    resumePrompt: number
    resumeCompletion: number
    coverLetterPrompt: number
    coverLetterCompletion: number
    total: number
  }
  costUsd: number
  model: string
  viewerSessionId: string
  downloads: number
}
```

**Copy to web:**
```typescript
// web/src/types/resume.ts
// Copy types from functions/src/types/resume.ts
// OR use a shared types package in the monorepo
```

---

#### 5. API Endpoint Configuration (30 minutes)

**Update `web/src/config/api.ts`:**
```typescript
// web/src/config/api.ts
export const API_CONFIG = {
  // ... existing endpoints

  // Resume generator endpoints
  generateDocuments: "generateDocuments",
  listDocuments: "listDocuments",
  getDocument: "getDocument",
} as const

// Add helper for resume endpoints
export const resumeApiUrls = {
  generateDocuments: () => getApiUrl(API_CONFIG.generateDocuments),
  listDocuments: () => getApiUrl(API_CONFIG.listDocuments),
  getDocument: () => getApiUrl(API_CONFIG.getDocument),
}
```

---

### 6.3 Testing Strategy

**Before implementing AI Resume Generator:**

#### 1. Unit Tests for New Utilities (2-3 hours)
- [ ] Test FormField component rendering
- [ ] Test FormActions with different states
- [ ] Test useAsyncSubmit hook
- [ ] Test validation functions
- [ ] Test ApiClient base class
- [ ] Test logger with context

#### 2. Integration Tests for API Client (1-2 hours)
- [ ] Test ExperienceClient CRUD operations
- [ ] Test BlurbClient operations
- [ ] Test error handling (network errors, timeouts, API errors)
- [ ] Test Firebase initialization

#### 3. E2E Tests for Existing Forms (2-3 hours)
- [ ] Update ContactForm E2E tests (already exists)
- [ ] Add ExperienceEntry E2E tests (create, edit, delete)
- [ ] Add BlurbEntry E2E tests (edit, save)

---

### 6.4 Documentation (1-2 hours)

**Create before implementing:**

- [ ] `/docs/development/resume-generator-implementation.md`
  - Step-by-step implementation guide
  - Phase breakdown
  - Testing checklist

- [ ] `/functions/README-RESUME.md`
  - Cloud Functions architecture
  - OpenAI integration details
  - PDF generation approach
  - Error handling strategy

- [ ] `/web/src/pages/resume.tsx.md`
  - Component structure
  - State management
  - Auth flow
  - Viewer vs Editor UI

---

### 6.5 Timeline Summary

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| **Refactoring Phase 1** | API config, logger, form components | 1-2 days | None |
| **Refactoring Phase 2** | Form library, validation, async submit | 3-5 days | Phase 1 |
| **Refactoring Phase 3** | API client, Firebase init | 3-4 days | Phase 1 |
| **Infrastructure Setup** | GCP, Firestore, Functions deps | 1 week | None (parallel) |
| **Testing & Docs** | Unit tests, E2E tests, docs | 3-5 days | Phase 1-3 |
| **READY FOR AI RESUME** | - | ~2-3 weeks | All above |

---

## 7. SUMMARY METRICS

### Current Codebase State

| Metric | Value |
|--------|-------|
| Total Components | 24 |
| Total Hooks | 5 |
| Total Utilities | 4 |
| Lines of Code (src/) | ~4,800 |
| Duplicate Code | ~400-500 lines (10%) |
| Console vs Logger | 47:8 (85% console) |
| Form Components | 4 (70-80% similar logic) |
| API Hooks | 3 (2 are redundant) |

### Potential Improvements (After All Phases)

| Metric | Current | After Refactoring | Improvement |
|--------|---------|-------------------|-------------|
| Lines of Code | ~4,800 | ~4,100-4,300 | **-10-15%** |
| Duplicate Code | 400-500 | 50-100 | **-80-90%** |
| Form Component LOC | ~350/component | ~200/component | **-40%** |
| API Configuration | 3 duplicates | 1 source | **-67%** |
| Logging Consistency | 15% logger | 100% logger | **+567%** |
| Maintenance Burden | High | Low | **-60%** |

### Phase-by-Phase Impact

| Phase | Duration | LOC Reduction | Maintenance Improvement | Risk |
|-------|----------|---------------|------------------------|------|
| Phase 1 | 1-2 days | 60-80 | 15% | LOW |
| Phase 2 | 3-5 days | 170-260 | 30% | MEDIUM |
| Phase 3 | 3-4 days | 420-430 | 25% | MEDIUM |
| Phase 4 | 5-7 days | 175-270 | 15% | HIGH |
| **TOTAL** | **2-3 weeks** | **825-1,040** | **85%** | - |

### Recommended Approach

**For AI Resume Generator Project:**

✅ **COMPLETE:**
- Phase 1 (1-2 days) - Required
- Phase 2 (3-5 days) - Highly recommended
- Phase 3 (3-4 days) - Recommended

**Total: 1-2 weeks of refactoring**

❌ **SKIP:**
- Phase 4 (5-7 days) - Diminishing returns

**Then proceed with AI Resume Generator implementation (2-3 weeks)**

---

## 8. NEXT STEPS

### Immediate Actions (This Week)

1. **Review and approve this audit report**
2. **Decide on refactoring scope:**
   - Option A: Phase 1 only (1-2 days, minimal improvements)
   - Option B: Phase 1-2 (4-7 days, moderate improvements)
   - Option C: Phase 1-3 (1-2 weeks, significant improvements) **RECOMMENDED**
   - Option D: All phases (2-3 weeks, maximum improvements)

3. **Create GitHub issues for approved phases**
   - Break down each phase into individual issues
   - Assign priorities and milestones
   - Link to this audit report

4. **Start infrastructure setup in parallel**
   - GCP bucket creation
   - Secret Manager setup
   - Firestore collection creation
   - Seed initial prompts

### For AI Resume Generator

**Prerequisites checklist:**
- [ ] Phases 1-3 refactoring complete
- [ ] GCP infrastructure ready
- [ ] Firestore collections created
- [ ] Prompts seeded
- [ ] Functions dependencies installed
- [ ] Types defined
- [ ] Documentation written
- [ ] Tests passing

**Then follow:** [ai-resume-generator-plan.md](./ai-resume-generator-plan.md) implementation phases

---

## APPENDIX

### A. Files to Refactor

**High Priority:**
- `web/src/components/ExperienceEntry.tsx` (354 lines) - Extract edit form
- `web/src/components/ContactForm.tsx` (422 lines) - Extract validation
- `web/src/hooks/useExperienceData.ts` (338 lines) - Primary data hook
- `web/src/components/BlurbEntry.tsx` (232 lines) - Share edit form
- `web/src/hooks/useExperienceAPI.ts` (191 lines) - Delete after API client
- `web/src/hooks/useBlurbAPI.ts` (206 lines) - Delete after API client

**Medium Priority:**
- `web/src/components/CreateExperienceForm.tsx` (225 lines) - Use form library
- `web/src/hooks/useAuth.ts` (115 lines) - Good example, use as reference
- `web/src/utils/logger.ts` (45 lines) - Enhance with context
- `web/src/utils/firebase-app-check.ts` (98 lines) - Centralize init

**Low Priority:**
- All other components are in good shape

### B. Files to Create

**Phase 1:**
- `web/src/config/api.ts`
- `web/src/styles/markdown.ts`
- `web/src/components/MarkdownContent.tsx`
- Enhanced `web/src/utils/logger.ts`

**Phase 2:**
- `web/src/components/forms/FormLabel.tsx`
- `web/src/components/forms/FormField.tsx`
- `web/src/components/forms/FormActions.tsx`
- `web/src/components/forms/FormError.tsx`
- `web/src/components/forms/MarkdownEditor.tsx`
- `web/src/components/forms/index.ts`
- `web/src/hooks/useAsyncSubmit.ts`
- `web/src/utils/validators.ts`

**Phase 3:**
- `web/src/api/client.ts`
- `web/src/api/experience-client.ts`
- `web/src/api/blurb-client.ts`
- `web/src/api/types.ts`
- `web/src/api/index.ts`
- `web/src/utils/firebase.ts`

**Phase 4 (Optional):**
- `web/src/hooks/useFormState.ts`
- `web/src/hooks/useFormValidation.ts`
- `web/src/utils/date-formatters.ts`

**AI Resume Generator:**
- `functions/src/types/resume.ts`
- `functions/src/document-generator.ts`
- `functions/src/resume-generator.ts`
- `functions/src/cover-letter-generator.ts`
- `functions/src/pdf-generator.ts`
- `web/src/pages/resume.tsx`
- `web/src/components/resume/ViewerView.tsx`
- `web/src/components/resume/EditorView.tsx`
- `web/src/components/resume/PromptEditor.tsx`
- `web/src/components/resume/DocumentManager.tsx`
- `web/src/api/resume-client.ts`

### C. Naming Conventions

**Current patterns (keep):**
- Components: PascalCase (e.g., `ContactForm.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `logger.ts`)
- Types: PascalCase (e.g., `ExperienceEntry`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_CONFIG`)

**Proposed additions:**
- API clients: PascalCase with `Client` suffix (e.g., `ExperienceClient`)
- Form components: PascalCase with `Form` prefix (e.g., `FormField`)
- Config files: camelCase (e.g., `api.ts`)

---

**Report Generated:** October 10, 2025
**Next Audit:** After Phase 1-3 completion (estimated 2-3 weeks)
**Priority:** Complete Phase 1-3 before AI Resume Generator implementation
