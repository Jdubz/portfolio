# Generator Implementation Guide

> **Purpose:** Document existing codebase patterns and implementation specifics for the AI Resume Generator
> **Created:** October 10, 2025
> **Status:** Ready for Phase 1 implementation

## Overview

This guide documents the existing patterns in the codebase that we MUST follow when implementing the AI Resume Generator feature. Following these patterns ensures consistency, maintainability, and proper integration with existing infrastructure.

---

## 1. Firestore Service Pattern

### Existing Pattern (Experience & Blurb Services)

**Location:** `functions/src/services/`

**Key Characteristics:**

- Class-based service architecture
- Firestore initialization with named database ID
- SimpleLogger interface for consistent logging
- Collection names from centralized config
- Proper error handling with logging
- TypeScript interfaces for data models

**Example Structure:**

```typescript
// functions/src/services/generator.service.ts

import { Firestore, Timestamp, FieldValue } from "@google-cloud/firestore"
import { DATABASE_ID, GENERATOR_COLLECTION } from "../config/database"

type SimpleLogger = {
  info: (message: string, data?: unknown) => void
  warning: (message: string, data?: unknown) => void
  error: (message: string, data?: unknown) => void
}

export class GeneratorService {
  private db: Firestore
  private logger: SimpleLogger
  private collectionName = GENERATOR_COLLECTION

  constructor(logger?: SimpleLogger) {
    // Initialize Firestore with the named database "portfolio"
    this.db = new Firestore({
      databaseId: DATABASE_ID,
    })

    const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

    this.logger = logger || {
      info: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
      },
      warning: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
      },
      error: (message: string, data?: unknown) => {
        if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
      },
    }
  }

  // Service methods here...
}
```

### Implementation Requirements for GeneratorService

**Must implement:**

1. `getDefaults()` - Get default settings document
2. `updateDefaults()` - Update default settings (editor only)
3. `createRequest()` - Create generation request document
4. `getRequest(id)` - Get request by ID
5. `createResponse()` - Create generation response document
6. `getResponse(id)` - Get response by ID
7. `updateResponse(id)` - Update response (for signed URLs)
8. `listRequests(filters?)` - List requests with optional filters
9. `getRequestWithResponse(id)` - Get request and response together

**Pattern Notes:**

- Use `Timestamp.now()` for timestamps
- Use `FieldValue.serverTimestamp()` for server-side timestamps
- Always log operations with appropriate level (info, warning, error)
- Handle `doc.exists` checks before accessing data
- Cast with `as Omit<Type, "id">` pattern when spreading doc.data()
- Return typed interfaces, never raw Firestore documents

---

## 2. Database Configuration Pattern

### Existing Pattern

**Location:** `functions/src/config/database.ts`

**Current Configuration:**

```typescript
export const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || "(default)"
export const EXPERIENCE_COLLECTION = "experience-entries"
export const BLURBS_COLLECTION = "experience-blurbs"
```

### Implementation Requirements

**Add to database.ts:**

```typescript
/**
 * Generator collection name
 */
export const GENERATOR_COLLECTION = "generator"
```

**Usage in services:**

```typescript
import { DATABASE_ID, GENERATOR_COLLECTION } from "../config/database"

const COLLECTION_NAME = GENERATOR_COLLECTION
```

---

## 3. Cloud Function Pattern

### Existing Pattern (Experience Function)

**Location:** `functions/src/experience.ts`, `functions/src/index.ts`

**Key Characteristics:**

- Express-style request handlers
- CORS configuration with allowed origins
- Joi validation schemas
- Error code constants with structured responses
- Request ID generation for tracking
- Manual routing (no express router)
- Auth middleware integration
- Response format: `{ success, data, error, errorCode, requestId }`

**Example Structure:**

```typescript
// functions/src/generator.ts

import { https } from "firebase-functions/v2"
import type { Request, Response } from "express"
import cors from "cors"
import Joi from "joi"
import { GeneratorService } from "./services/generator.service"
import { ExperienceService } from "./services/experience.service"
import { BlurbService } from "./services/blurb.service"
import { verifyAuthenticatedEditor, type AuthenticatedRequest } from "./middleware/auth.middleware"
import { verifyAppCheck } from "./middleware/app-check.middleware"
import { resumeGeneratorRateLimiter } from "./middleware/rate-limit.middleware"

// Error codes
const ERROR_CODES = {
  VALIDATION_FAILED: { code: "GEN_VAL_001", status: 400, message: "Validation failed" },
  NOT_FOUND: { code: "GEN_REQ_001", status: 404, message: "Resource not found" },
  METHOD_NOT_ALLOWED: { code: "GEN_REQ_002", status: 405, message: "Method not allowed" },
  OPENAI_ERROR: { code: "GEN_AI_001", status: 503, message: "AI service error" },
  PDF_GENERATION_ERROR: { code: "GEN_PDF_001", status: 500, message: "PDF generation failed" },
  FIRESTORE_ERROR: { code: "GEN_DB_001", status: 503, message: "Database error" },
  INTERNAL_ERROR: { code: "GEN_SYS_001", status: 500, message: "Internal server error" },
} as const

// Logger
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

const logger = {
  info: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
  },
  warning: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
  },
  error: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
  },
}

// Initialize services
const generatorService = new GeneratorService(logger)
const experienceService = new ExperienceService(logger)
const blurbService = new BlurbService(logger)

// CORS configuration (MUST match existing origins)
const corsOptions = {
  origin: [
    "https://joshwentworth.com",
    "https://www.joshwentworth.com",
    "https://staging.joshwentworth.com",
    "http://localhost:8000",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

const corsHandler = cors(corsOptions)

// Validation schemas
const generateRequestSchema = Joi.object({
  generateType: Joi.string().valid("resume", "coverLetter", "both").required(),
  job: Joi.object({
    role: Joi.string().trim().min(1).max(200).required(),
    company: Joi.string().trim().min(1).max(200).required(),
    companyWebsite: Joi.string().uri().optional().allow(""),
    jobDescriptionUrl: Joi.string().uri().optional().allow(""),
    jobDescriptionText: Joi.string().trim().max(10000).optional().allow(""),
  }).required(),
  preferences: Joi.object({
    style: Joi.string().valid("modern", "traditional", "technical", "executive").optional(),
    emphasize: Joi.array().items(Joi.string()).optional(),
  }).optional(),
})

// Request ID generator (consistent pattern)
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

// Main handler
const handleGeneratorRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = generateRequestId()

  try {
    // Handle CORS
    await new Promise<void>((resolve, reject) => {
      corsHandler(req, res, async () => {
        try {
          // Handle OPTIONS preflight
          if (req.method === "OPTIONS") {
            res.status(204).send("")
            resolve()
            return
          }

          const path = req.path || req.url

          // Route: POST /generator/generate - Generate documents (public or authenticated)
          if (req.method === "POST" && path === "/generator/generate") {
            await handleGenerate(req, res, requestId)
            resolve()
            return
          }

          // Route: GET /generator/defaults - Get default settings (public)
          if (req.method === "GET" && path === "/generator/defaults") {
            await handleGetDefaults(req, res, requestId)
            resolve()
            return
          }

          // All other routes require authentication
          await new Promise<void>((resolveAuth, rejectAuth) => {
            verifyAuthenticatedEditor(logger)(req as AuthenticatedRequest, res, (err) => {
              if (err) rejectAuth(err)
              else resolveAuth()
            })
          })

          // Route: PUT /generator/defaults - Update defaults (auth required)
          if (req.method === "PUT" && path === "/generator/defaults") {
            await handleUpdateDefaults(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Route: GET /generator/requests - List requests (auth required)
          if (req.method === "GET" && path === "/generator/requests") {
            await handleListRequests(req as AuthenticatedRequest, res, requestId)
            resolve()
            return
          }

          // Unknown route
          const err = ERROR_CODES.METHOD_NOT_ALLOWED
          res.status(err.status).json({
            success: false,
            error: "METHOD_NOT_ALLOWED",
            errorCode: err.code,
            message: err.message,
            requestId,
          })
          resolve()
        } catch (err) {
          reject(err)
        }
      })
    })
  } catch (error) {
    logger.error("Unexpected error in generator handler", { error, requestId })
    const err = ERROR_CODES.INTERNAL_ERROR
    res.status(err.status).json({
      success: false,
      error: "INTERNAL_ERROR",
      errorCode: err.code,
      message: err.message,
      requestId,
    })
  }
}

// Export as Firebase HTTP Function (v2)
export const manageGenerator = https.onRequest(
  {
    region: "us-central1",
    memory: "1GiB", // Higher for Puppeteer
    maxInstances: 10,
    timeoutSeconds: 300, // 5 minutes for PDF generation
    secrets: ["openai-api-key"], // Add OpenAI key to secrets
    serviceAccount: "cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com",
  },
  handleGeneratorRequest
)
```

### Implementation Requirements

**Must follow:**

1. **Error Codes:** Use consistent prefix `GEN_` with category and number
2. **Logger:** Use same SimpleLogger pattern with test environment check
3. **CORS:** Use exact same origins list as existing functions
4. **Request IDs:** Use same generation pattern `req_{timestamp}_{random}`
5. **Response Format:** Always return `{ success, data?, error?, errorCode?, requestId }`
6. **Validation:** Use Joi for all request validation
7. **Routing:** Manual path-based routing (no express router)
8. **Auth:** Use existing `verifyAuthenticatedEditor` middleware
9. **Secrets:** Declare in function config, access via `process.env`
10. **Memory:** 1GiB for Puppeteer (vs 256MiB for simple functions)
11. **Timeout:** 300s (5 min) for generation (vs 60s default)

**Export in index.ts:**

```typescript
// functions/src/index.ts

export { manageGenerator } from "./generator"
```

---

## 4. Rate Limiting Pattern

### Existing Pattern

**Location:** `functions/src/middleware/rate-limit.middleware.ts`

**Current Implementation:**

```typescript
import rateLimit from "express-rate-limit"

export const contactFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 10,
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "CF_SEC_003",
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Rate limit exceeded", { ip: req.ip, path: req.path })
    res.status(429).json({ /* error response */ })
  },
})
```

### Implementation Requirements

**Add to rate-limit.middleware.ts:**

```typescript
/**
 * Rate limiter for resume generator (public users)
 * 10 requests per 15 minutes per IP
 */
export const resumeGeneratorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 generations per 15 minutes
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "GEN_SEC_001",
    message: "Too many resume generation requests. Please try again in 15 minutes.",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnvironment,
  handler: (req, res) => {
    console.warn("[RateLimit] Resume generator rate limit exceeded", {
      ip: req.ip,
      path: req.path,
    })

    res.status(429).json({
      success: false,
      error: "RATE_LIMIT_EXCEEDED",
      errorCode: "GEN_SEC_001",
      message: "Too many resume generation requests from this IP. Please try again in 15 minutes.",
    })
  },
})

/**
 * More restrictive rate limiter for editors (optional)
 * Editors might have slightly higher limits
 */
export const resumeGeneratorEditorRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Editors get double the limit
  message: {
    success: false,
    error: "RATE_LIMIT_EXCEEDED",
    errorCode: "GEN_SEC_002",
    message: "Too many resume generation requests. Please try again later.",
  },
  skip: () => isTestEnvironment,
})
```

---

## 5. Frontend API Client Pattern

### Existing Pattern

**Location:** `web/src/api/`

**Base Client:**

```typescript
// web/src/api/client.ts

export class ApiClient {
  protected baseUrl: string

  constructor() {
    this.baseUrl = getApiUrl() // From config
  }

  protected async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    // ... implementation
  }

  protected async post<T>(endpoint: string, body: unknown, requiresAuth = true): Promise<T> {
    // ... implementation
  }

  protected async put<T>(endpoint: string, body: unknown, requiresAuth = true): Promise<T> {
    // ... implementation
  }

  protected async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    // ... implementation
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Extracts data from ApiResponse<T> format
    // Throws on error with proper logging
  }
}
```

**Extended Client Example:**

```typescript
// web/src/api/experience-client.ts

export class ExperienceClient extends ApiClient {
  async getEntries(): Promise<ExperienceEntry[]> {
    const response = await this.get<{ entries: ExperienceEntry[] }>("/experience/entries", false)
    return response.entries
  }

  async createEntry(data: CreateExperienceData): Promise<ExperienceEntry> {
    const response = await this.post<{ entry: ExperienceEntry }>("/experience/entries", data, true)
    return response.entry
  }
}

export const experienceClient = new ExperienceClient()
```

### Implementation Requirements

**Create Generator Client:**

```typescript
// web/src/api/generator-client.ts

import { ApiClient } from "./client"
import type {
  GeneratorDefaults,
  GeneratorRequest,
  GeneratorResponse,
  GenerateDocumentsRequest,
  GenerateDocumentsResponse,
} from "../types/generator"

export class GeneratorClient extends ApiClient {
  /**
   * Get default settings (public)
   */
  async getDefaults(): Promise<GeneratorDefaults> {
    const response = await this.get<{ defaults: GeneratorDefaults }>("/generator/defaults", false)
    return response.defaults
  }

  /**
   * Update default settings (editor only)
   */
  async updateDefaults(data: Partial<GeneratorDefaults>): Promise<GeneratorDefaults> {
    const response = await this.put<{ defaults: GeneratorDefaults }>("/generator/defaults", data, true)
    return response.defaults
  }

  /**
   * Generate documents (public or authenticated)
   */
  async generateDocuments(data: GenerateDocumentsRequest): Promise<GenerateDocumentsResponse> {
    const response = await this.post<{ generation: GenerateDocumentsResponse }>(
      "/generator/generate",
      data,
      false // Public endpoint
    )
    return response.generation
  }

  /**
   * List all generation requests (editor only)
   */
  async listRequests(filters?: RequestFilters): Promise<GeneratorRequest[]> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any).toString()}` : ""
    const response = await this.get<{ requests: GeneratorRequest[] }>(
      `/generator/requests${queryParams}`,
      true
    )
    return response.requests
  }

  /**
   * Get request with response (editor only)
   */
  async getRequestWithResponse(requestId: string): Promise<{
    request: GeneratorRequest
    response: GeneratorResponse
  }> {
    const response = await this.get<{
      request: GeneratorRequest
      response: GeneratorResponse
    }>(`/generator/requests/${requestId}`, true)
    return response
  }
}

// Export singleton instance
export const generatorClient = new GeneratorClient()
```

**Export in index.ts:**

```typescript
// web/src/api/index.ts

export { generatorClient } from "./generator-client"
export type { GeneratorClient } from "./generator-client"
```

---

## 6. Secret Manager Pattern

### Existing Pattern

**Location:** `functions/src/services/secret-manager.service.ts`

**Usage:**

```typescript
import { SecretManagerService } from "./services/secret-manager.service"

const secretManager = new SecretManagerService()

// Get single secret
const apiKey = await secretManager.getSecret("openai-api-key")

// Get multiple secrets
const secrets = await secretManager.getSecrets(["openai-api-key", "other-secret"])

// Check environment
const isLocal = secretManager.isLocalDevelopment()
const config = secretManager.getEnvironmentConfig()
```

### Implementation Requirements

**In Cloud Function:**

1. Declare secret in function config:

```typescript
export const manageGenerator = https.onRequest(
  {
    secrets: ["openai-api-key"], // Secret name in Secret Manager
    // ...
  },
  handler
)
```

2. Access via environment variable or Secret Manager service:

```typescript
// Option A: Environment variable (Firebase injects it)
const openaiApiKey = process.env.OPENAI_API_KEY

// Option B: Secret Manager service (more flexible)
const secretManager = new SecretManagerService()
const openaiApiKey = await secretManager.getSecret("openai-api-key")
```

**Creating the secret:**

```bash
# In Google Cloud Console or via gcloud CLI
gcloud secrets create openai-api-key \
  --project=static-sites-257923 \
  --replication-policy="automatic"

# Add secret version
echo -n "sk-..." | gcloud secrets versions add openai-api-key \
  --project=static-sites-257923 \
  --data-file=-
```

---

## 7. Package.json Dependencies

### Current Dependencies (functions/package.json)

```json
{
  "dependencies": {
    "@google-cloud/firestore": "^7.11.6",
    "@google-cloud/secret-manager": "^5.5.0",
    "firebase-admin": "^13.5.0",
    "firebase-functions": "^6.4.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^8.1.0",
    "joi": "^17.13.3",
    "typescript": "^5.9.3"
  }
}
```

### Implementation Requirements

**Add these dependencies:**

```json
{
  "dependencies": {
    "openai": "^4.67.0",
    "puppeteer-core": "^23.0.0",
    "@sparticuz/chromium": "^131.0.0",
    "handlebars": "^4.7.8"
  },
  "devDependencies": {
    "@types/handlebars": "^4.1.0"
  }
}
```

**Install command:**

```bash
cd functions
npm install openai puppeteer-core @sparticuz/chromium handlebars
npm install -D @types/handlebars
```

---

## 8. TypeScript Interface Patterns

### Existing Pattern

**Location:** Service files export interfaces alongside class

```typescript
// functions/src/services/experience.service.ts

export interface ExperienceEntry {
  id: string
  title: string
  role?: string
  location?: string
  body?: string
  startDate: string
  endDate?: string | null
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}

export interface CreateExperienceData {
  title: string
  role?: string
  // ...
}

export interface UpdateExperienceData {
  title?: string
  role?: string
  // ...
}

export class ExperienceService {
  // Uses interfaces
}
```

### Implementation Requirements

**Create shared types file:**

```typescript
// functions/src/types/generator.types.ts

import { Timestamp } from "@google-cloud/firestore"

export type GenerationType = "resume" | "coverLetter" | "both"

export interface GeneratorDefaults {
  id: "default"
  type: "defaults"
  name: string
  email: string
  phone?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  avatar?: string
  logo?: string
  accentColor: string
  defaultStyle: "modern" | "traditional" | "technical" | "executive"
  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy?: string
}

export interface GeneratorRequest {
  id: string
  type: "request"
  generateType: GenerationType
  defaults: Omit<GeneratorDefaults, "id" | "type" | "createdAt" | "updatedAt" | "updatedBy">
  job: {
    role: string
    company: string
    companyWebsite?: string
    jobDescriptionUrl?: string
    jobDescriptionText?: string
  }
  preferences?: {
    style?: string
    emphasize?: string[]
  }
  experienceData: {
    entries: ExperienceEntry[]
    blurbs: BlurbEntry[]
  }
  status: "pending" | "processing" | "completed" | "failed"
  access: {
    viewerSessionId?: string
    isPublic: boolean
  }
  createdAt: Timestamp
  createdBy?: string
}

export interface GeneratorResponse {
  id: string
  type: "response"
  requestId: string
  result: {
    success: boolean
    resume?: ResumeContent
    coverLetter?: CoverLetterContent
    error?: {
      message: string
      code?: string
      stage?: string
      details?: unknown
    }
  }
  files: {
    resume?: {
      gcsPath: string
      signedUrl?: string
      signedUrlExpiry?: Timestamp
      size?: number
    }
    coverLetter?: {
      gcsPath: string
      signedUrl?: string
      signedUrlExpiry?: Timestamp
      size?: number
    }
  }
  metrics: {
    durationMs: number
    tokenUsage?: {
      resumePrompt?: number
      resumeCompletion?: number
      coverLetterPrompt?: number
      coverLetterCompletion?: number
      total: number
    }
    costUsd?: number
    model: string
  }
  tracking: {
    downloads: number
    lastDownloadedAt?: Timestamp
    downloadHistory?: Array<{
      timestamp: Timestamp
      documentType: "resume" | "coverLetter"
      downloadedBy?: string
    }>
  }
  createdAt: Timestamp
  updatedAt?: Timestamp
}

// Import from existing services
import { ExperienceEntry } from "../services/experience.service"
import { BlurbEntry } from "../services/blurb.service"
```

---

## 9. Logging Pattern

### Existing Pattern

**Consistent across all services and functions:**

```typescript
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined

const logger = {
  info: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.log(`[INFO] ${message}`, data || "")
  },
  warning: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.warn(`[WARN] ${message}`, data || "")
  },
  error: (message: string, data?: unknown) => {
    if (!isTestEnvironment) console.error(`[ERROR] ${message}`, data || "")
  },
}
```

### Implementation Requirements

**Use same logger in all new code:**

- Services receive logger in constructor (optional, creates default if not provided)
- Functions create logger at module level
- Always suppress logs in test environment
- Use appropriate level: `info` for normal operations, `warning` for non-critical failures, `error` for failures
- Include context data in second parameter

---

## 10. Error Code Naming Convention

### Existing Patterns

**Contact Form:** `CF_*` (e.g., `CF_VAL_001`, `CF_SEC_003`)
**Experience:** `EXP_*` (e.g., `EXP_VAL_001`, `EXP_DB_001`)

**Categories:**

- `VAL` - Validation errors (400)
- `REQ` - Request errors (404, 405)
- `SEC` - Security errors (401, 429)
- `DB` - Database errors (503)
- `SYS` - System errors (500)
- Custom categories as needed

### Implementation Requirements

**Generator Error Codes:**

- Prefix: `GEN_`
- Categories:
  - `GEN_VAL_*` - Validation
  - `GEN_REQ_*` - Request errors
  - `GEN_SEC_*` - Security/rate limiting
  - `GEN_AI_*` - OpenAI errors
  - `GEN_PDF_*` - PDF generation errors
  - `GEN_DB_*` - Database errors
  - `GEN_SYS_*` - System errors

---

## Checklist: Before Starting Implementation

- [ ] Review all existing services (Experience, Blurb)
- [ ] Review existing Cloud Function (manageExperience, handleContactForm)
- [ ] Review existing API clients (ExperienceClient, BlurbClient)
- [ ] Understand Firestore database config
- [ ] Understand Secret Manager service
- [ ] Understand rate limiting middleware
- [ ] Understand error code conventions
- [ ] Understand logging patterns
- [ ] Verify OpenAI secret exists in Secret Manager
- [ ] Verify all dependencies are documented
- [ ] Create types file for generator interfaces
- [ ] Plan service method signatures
- [ ] Plan Cloud Function routes
- [ ] Plan API client methods

---

## Phase 1 MVP Checklist

Using the patterns documented above:

### Backend

- [ ] Add `GENERATOR_COLLECTION` to `functions/src/config/database.ts`
- [ ] Create `functions/src/types/generator.types.ts` with all interfaces
- [ ] Create `functions/src/services/generator.service.ts`
  - [ ] Implement `getDefaults()`
  - [ ] Implement `createRequest()`
  - [ ] Implement `createResponse()`
- [ ] Create `functions/src/generator.ts` Cloud Function
  - [ ] Set up error codes (`GEN_*`)
  - [ ] Set up logger
  - [ ] Set up CORS (match existing origins)
  - [ ] Set up Joi validation schemas
  - [ ] Implement `POST /generator/generate` route (basic version)
  - [ ] Implement `GET /generator/defaults` route
- [ ] Export function in `functions/src/index.ts`
- [ ] Install dependencies (openai, puppeteer-core, handlebars)
- [ ] Create OpenAI secret in Secret Manager
- [ ] Seed default settings document in Firestore

### OpenAI Integration

- [ ] Create OpenAI client wrapper
- [ ] Define structured output schemas
- [ ] Implement resume generation
- [ ] Implement token usage tracking
- [ ] Implement cost calculation

### PDF Generation

- [ ] Create Handlebars resume template (modern style)
- [ ] Create Puppeteer wrapper for PDF generation
- [ ] Test PDF output quality

### Testing

- [ ] Test Cloud Function locally with emulator
- [ ] Test OpenAI integration with real API
- [ ] Test PDF generation
- [ ] Test end-to-end flow

---

## Notes

- All patterns are based on existing codebase (October 2025)
- Deviating from these patterns will create inconsistencies
- When in doubt, reference existing services/functions
- Keep security, error handling, and logging consistent
- Document any new patterns that emerge during implementation
