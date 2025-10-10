# Generator Firestore Collection Schema

> **Collection:** `generator`
> **Purpose:** Store default settings, generation requests, and generation responses with complete reproducibility
> **Last Updated:** October 10, 2025

## Overview

The `generator` collection uses a **three-document-type approach**:

1. **One special `default` document** - Default personal settings and styling preferences
2. **Request documents (`resume-generator-request-{id}`)** - Generation requests with snapshots of settings and experience
3. **Response documents (`resume-generator-response-{id}`)** - Generated documents with GCS links and reference to request

This design ensures:
- ✅ Clear separation of request/response data
- ✅ Complete reproducibility (request stores snapshot of all inputs)
- ✅ Easy debugging (trace from response → request → inputs)
- ✅ Flexible generation options (resume only, cover letter only, or both)
- ✅ Comprehensive analytics (success rates, costs, token usage)

---

## Document Types

### 1. Default Settings Document

**Document ID:** `default`

Stores the default personal information and styling preferences that editors can modify.

```typescript
interface GeneratorDefaults {
  // Document identification
  id: "default"
  type: "defaults"

  // Personal Information (all required, handle falsy gracefully)
  name: string // "Josh Wentworth"
  email: string // "josh@example.com"
  phone?: string // "(555) 123-4567"
  location?: string // "San Francisco, CA"

  // Online Presence
  website?: string // "https://joshwentworth.com"
  github?: string // "https://github.com/jdubz"
  linkedin?: string // "https://linkedin.com/in/joshwentworth"

  // Visual Branding
  avatar?: string // URL or GCS path to profile photo
  logo?: string // URL or GCS path to personal logo
  accentColor: string // "#3B82F6" - used in resume styling

  // Resume Style Preferences
  defaultStyle: "modern" | "traditional" | "technical" | "executive"

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy?: string // Email of last editor
}
```

**Example Document:**

```json
{
  "id": "default",
  "type": "defaults",
  "name": "Josh Wentworth",
  "email": "josh@joshwentworth.com",
  "phone": "",
  "location": "San Francisco, CA",
  "website": "https://joshwentworth.com",
  "github": "https://github.com/jdubz",
  "linkedin": "https://linkedin.com/in/joshwentworth",
  "avatar": "",
  "logo": "",
  "accentColor": "#3B82F6",
  "defaultStyle": "modern",
  "createdAt": "2025-10-10T00:00:00Z",
  "updatedAt": "2025-10-10T00:00:00Z",
  "updatedBy": "josh@joshwentworth.com"
}
```

---

### 2. Request Documents

**Document ID Pattern:** `resume-generator-request-{timestamp}_{randomId}`

Stores the complete generation request including job details, settings snapshot, and experience snapshot.

```typescript
type GenerationType = "resume" | "coverLetter" | "both"

interface GeneratorRequest {
  // Document identification
  id: string // "resume-generator-request-1697123456-abc123"
  type: "request"

  // Generation Options (same for editors and viewers)
  generateType: GenerationType // "resume" | "coverLetter" | "both"

  // Snapshot of defaults at request time
  // This ensures reproducibility even if defaults change later
  defaults: {
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
    defaultStyle: string
  }

  // Job Application Details
  job: {
    role: string // Required: "Senior Full-Stack Engineer"
    company: string // Required: "Google"
    companyWebsite?: string // Optional: "https://google.com"
    jobDescriptionUrl?: string // Optional: URL to fetch job description
    jobDescriptionText?: string // Optional: Pasted job description
  }

  // Generation Preferences (optional overrides)
  preferences?: {
    style?: string // Override defaultStyle
    emphasize?: string[] // Keywords to emphasize: ["TypeScript", "React"]
  }

  // Experience Data Snapshot
  // Critical for reproducibility and debugging
  experienceData: {
    entries: ExperienceEntry[] // Snapshot of experience-entries at request time
    blurbs: Blurb[] // Snapshot of experience-blurbs at request time
  }

  // Request Status
  status: "pending" | "processing" | "completed" | "failed"

  // Access Control
  access: {
    viewerSessionId?: string // For public users to retrieve their own docs
    isPublic: boolean // true for viewers, false for editors
  }

  // Timestamps & Metadata
  createdAt: Timestamp
  createdBy?: string // Email if editor, undefined if viewer
}
```

**Example Request Document (Both Resume and Cover Letter):**

```json
{
  "id": "resume-generator-request-1697123456-abc123",
  "type": "request",
  "generateType": "both",
  "defaults": {
    "name": "Josh Wentworth",
    "email": "josh@joshwentworth.com",
    "phone": "",
    "location": "San Francisco, CA",
    "website": "https://joshwentworth.com",
    "github": "https://github.com/jdubz",
    "linkedin": "https://linkedin.com/in/joshwentworth",
    "accentColor": "#3B82F6",
    "defaultStyle": "modern"
  },
  "job": {
    "role": "Senior Full-Stack Engineer",
    "company": "Google",
    "companyWebsite": "https://careers.google.com",
    "jobDescriptionUrl": "https://careers.google.com/jobs/123456"
  },
  "preferences": {
    "emphasize": ["TypeScript", "React", "Node.js"]
  },
  "experienceData": {
    "entries": [...],
    "blurbs": [...]
  },
  "status": "pending",
  "access": {
    "viewerSessionId": "session_abc123",
    "isPublic": true
  },
  "createdAt": "2025-10-10T12:00:00Z"
}
```

**Example Request Document (Resume Only):**

```json
{
  "id": "resume-generator-request-1697234567-def456",
  "type": "request",
  "generateType": "resume",
  "defaults": {...},
  "job": {
    "role": "Engineering Manager",
    "company": "Meta"
  },
  "experienceData": {...},
  "status": "completed",
  "access": {
    "isPublic": false
  },
  "createdAt": "2025-10-10T13:00:00Z",
  "createdBy": "josh@joshwentworth.com"
}
```

---

### 3. Response Documents

**Document ID Pattern:** `resume-generator-response-{timestamp}_{randomId}` (matches request ID)

Stores the generation results, GCS file links, OpenAI response data, and reference back to the request.

```typescript
interface GeneratorResponse {
  // Document identification
  id: string // "resume-generator-response-1697123456-abc123" (same as request)
  type: "response"

  // Reference to request document
  requestId: string // "resume-generator-request-1697123456-abc123"

  // Generation Results
  result: {
    success: boolean

    // Generated Content (OpenAI structured outputs)
    resume?: ResumeContent // If generateType includes "resume"
    coverLetter?: CoverLetterContent // If generateType includes "coverLetter"

    // Error Information (if failed)
    error?: {
      message: string
      code?: string
      stage?: "fetch_defaults" | "fetch_experience" | "openai_resume" | "openai_cover_letter" | "pdf_generation" | "gcs_upload"
      details?: unknown
    }
  }

  // Generated Files in GCS
  files: {
    // Resume file (if generateType includes "resume")
    resume?: {
      gcsPath: string // "resume-generator-request-1697123456-abc123/resume.pdf"
      signedUrl?: string // Temporary signed URL
      signedUrlExpiry?: Timestamp // When signed URL expires
      size?: number // File size in bytes
    }

    // Cover letter file (if generateType includes "coverLetter")
    coverLetter?: {
      gcsPath: string // "resume-generator-request-1697123456-abc123/cover-letter.pdf"
      signedUrl?: string // Temporary signed URL
      signedUrlExpiry?: Timestamp // When signed URL expires
      size?: number // File size in bytes
    }
  }

  // Performance Metrics
  metrics: {
    durationMs: number // Total generation time

    // Token usage (if OpenAI was called)
    tokenUsage?: {
      resumePrompt?: number
      resumeCompletion?: number
      coverLetterPrompt?: number
      coverLetterCompletion?: number
      total: number
    }

    // Cost calculation
    costUsd?: number // Calculated from token usage

    // Model information
    model: string // "gpt-4o-2024-08-06"
  }

  // Download Tracking
  tracking: {
    downloads: number // Total download count
    lastDownloadedAt?: Timestamp
    downloadHistory?: Array<{
      timestamp: Timestamp
      documentType: "resume" | "coverLetter"
      downloadedBy?: string // Email if editor
    }>
  }

  // Timestamps
  createdAt: Timestamp
  updatedAt?: Timestamp // Updated when downloaded or re-generated URLs
}
```

**Example Response Document (Both Documents Generated):**

```json
{
  "id": "resume-generator-response-1697123456-abc123",
  "type": "response",
  "requestId": "resume-generator-request-1697123456-abc123",
  "result": {
    "success": true,
    "resume": {
      "personalInfo": {...},
      "professionalSummary": "...",
      "experience": [...],
      "skills": [...]
    },
    "coverLetter": {
      "greeting": "Dear Hiring Manager,",
      "openingParagraph": "...",
      "bodyParagraphs": [...],
      "closingParagraph": "...",
      "signature": "Sincerely, Josh Wentworth"
    }
  },
  "files": {
    "resume": {
      "gcsPath": "resume-generator-request-1697123456-abc123/resume.pdf",
      "signedUrl": "https://storage.googleapis.com/...",
      "signedUrlExpiry": "2025-10-10T13:00:00Z",
      "size": 245678
    },
    "coverLetter": {
      "gcsPath": "resume-generator-request-1697123456-abc123/cover-letter.pdf",
      "signedUrl": "https://storage.googleapis.com/...",
      "signedUrlExpiry": "2025-10-10T13:00:00Z",
      "size": 123456
    }
  },
  "metrics": {
    "durationMs": 8234,
    "tokenUsage": {
      "resumePrompt": 2500,
      "resumeCompletion": 1500,
      "coverLetterPrompt": 2000,
      "coverLetterCompletion": 800,
      "total": 6800
    },
    "costUsd": 0.034,
    "model": "gpt-4o-2024-08-06"
  },
  "tracking": {
    "downloads": 2,
    "lastDownloadedAt": "2025-10-10T12:30:00Z",
    "downloadHistory": [
      {
        "timestamp": "2025-10-10T12:10:00Z",
        "documentType": "resume"
      },
      {
        "timestamp": "2025-10-10T12:30:00Z",
        "documentType": "coverLetter"
      }
    ]
  },
  "createdAt": "2025-10-10T12:05:00Z"
}
```

**Example Response Document (Failed Generation):**

```json
{
  "id": "resume-generator-response-1697345678-ghi789",
  "type": "response",
  "requestId": "resume-generator-request-1697345678-ghi789",
  "result": {
    "success": false,
    "error": {
      "message": "OpenAI API rate limit exceeded",
      "code": "RATE_LIMIT_EXCEEDED",
      "stage": "openai_resume",
      "details": {
        "statusCode": 429,
        "retryAfter": 60
      }
    }
  },
  "files": {},
  "metrics": {
    "durationMs": 1234,
    "model": "gpt-4o-2024-08-06"
  },
  "tracking": {
    "downloads": 0
  },
  "createdAt": "2025-10-10T14:00:00Z"
}
```

---

## Supporting Type Definitions

### Experience Types (from existing experience page)

```typescript
interface ExperienceEntry {
  id: string
  title: string
  role?: string
  location?: string
  body?: string
  startDate: string // "YYYY-MM"
  endDate?: string | null
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}

interface Blurb {
  name: string // Unique identifier
  title: string
  content: string // Markdown
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
}
```

### OpenAI Response Types

```typescript
interface ResumeContent {
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

interface CoverLetterContent {
  greeting: string
  openingParagraph: string
  bodyParagraphs: string[]
  closingParagraph: string
  signature: string
}
```

---

## Collection Structure

```
generator/
├── default                                      # Default settings
├── resume-generator-request-1697123456-abc123  # Request
├── resume-generator-response-1697123456-abc123 # Response (matches request ID)
├── resume-generator-request-1697234567-def456  # Request
├── resume-generator-response-1697234567-def456 # Response
└── ...
```

---

## Relationships

```
┌─────────────────┐
│    default      │ ← Stores default settings
└─────────────────┘

        ↓ (snapshot copied to request)

┌─────────────────────────┐
│  resume-generator-      │ ← Generation request
│  request-{id}           │   + Settings snapshot
│                         │   + Experience snapshot
│  generateType: "both"   │   + Job details
└─────────────────────────┘

        ↓ (request processed)

┌─────────────────────────┐
│  resume-generator-      │ ← Generation response
│  response-{id}          │   + OpenAI responses
│                         │   + GCS file links
│  requestId: {id}        │   + Metrics
└─────────────────────────┘
```

---

## Query Patterns

### Get Default Settings

```typescript
const defaultsDoc = await db.collection('generator').doc('default').get()
const defaults = defaultsDoc.data() as GeneratorDefaults
```

### List All Requests (Document Manager)

```typescript
const snapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get()

const requests = snapshot.docs.map(doc => doc.data() as GeneratorRequest)
```

### Get Request and Response Together

```typescript
const requestId = "resume-generator-request-1697123456-abc123"
const responseId = requestId.replace('request', 'response')

const [requestDoc, responseDoc] = await Promise.all([
  db.collection('generator').doc(requestId).get(),
  db.collection('generator').doc(responseId).get()
])

const request = requestDoc.data() as GeneratorRequest
const response = responseDoc.data() as GeneratorResponse
```

### Find My Generations (Viewer)

```typescript
const sessionId = sessionStorage.getItem('resumeSessionId')

const requestsSnapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .where('access.viewerSessionId', '==', sessionId)
  .orderBy('createdAt', 'desc')
  .get()

// Then fetch corresponding responses
const responseIds = requestsSnapshot.docs.map(doc =>
  doc.id.replace('request', 'response')
)

const responses = await Promise.all(
  responseIds.map(id => db.collection('generator').doc(id).get())
)
```

### Calculate Success Rate (Analytics)

```typescript
const responsesSnapshot = await db.collection('generator')
  .where('type', '==', 'response')
  .get()

const successful = responsesSnapshot.docs.filter(
  doc => doc.data().result.success
).length

const successRate = (successful / responsesSnapshot.size) * 100
```

### Calculate Total Cost (Analytics)

```typescript
const responsesSnapshot = await db.collection('generator')
  .where('type', '==', 'response')
  .where('result.success', '==', true)
  .get()

const totalCost = responsesSnapshot.docs.reduce(
  (sum, doc) => sum + (doc.data().metrics.costUsd || 0),
  0
)
```

### Search by Company or Role

```typescript
const requestsSnapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .where('job.company', '==', 'Google')
  .get()
```

### Filter by Generation Type

```typescript
// Only resume generations
const resumeOnlySnapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .where('generateType', '==', 'resume')
  .get()

// Only cover letter generations
const coverLetterOnlySnapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .where('generateType', '==', 'coverLetter')
  .get()

// Both documents
const bothSnapshot = await db.collection('generator')
  .where('type', '==', 'request')
  .where('generateType', '==', 'both')
  .get()
```

---

## Firestore Indexes Required

Create these composite indexes for efficient queries:

```json
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "access.viewerSessionId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "result.success", "order": "ASCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "generateType", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "generator",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "job.company", "order": "ASCENDING" }
  ]
}
```

---

## Benefits of This Schema

### 1. Clear Separation of Concerns

- ✅ **Request documents** contain all inputs (immutable after creation)
- ✅ **Response documents** contain all outputs (can be updated for re-generated URLs)
- ✅ Easy to trace: response → request → inputs

### 2. Complete Reproducibility

Every request stores:
- ✅ All personal info settings (snapshot)
- ✅ Complete experience data (entries + blurbs)
- ✅ Exact job details
- ✅ Generation type (resume, cover letter, or both)

**Result:** Can reproduce any document exactly as it was generated

### 3. Flexible Generation Options

Same for editors and viewers:
- ✅ Generate resume only
- ✅ Generate cover letter only
- ✅ Generate both documents

**Result:** Users choose exactly what they need

### 4. Efficient Storage

- ✅ Request stores inputs once (immutable)
- ✅ Response stores outputs (can update signed URLs without duplicating request)
- ✅ Matching IDs make relationships explicit

### 5. Better Analytics

Track separately:
- ✅ Request patterns (what people are requesting)
- ✅ Response success rates (what's working)
- ✅ Generation types (resume vs cover letter popularity)
- ✅ Download patterns (what gets downloaded)

### 6. Scalability

- ✅ Can query requests and responses independently
- ✅ Can regenerate signed URLs without touching request data
- ✅ Can delete old responses without losing request history

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /generator/default {
      // Anyone can read default settings
      allow read: if true;

      // Only authenticated editors can update
      allow write: if request.auth != null && request.auth.token.role == 'editor';
    }

    match /generator/{docId} {
      // Skip default document (handled above)
      allow read, write: if docId != 'default';

      // Authenticated editors can read all documents
      allow read: if request.auth != null && request.auth.token.role == 'editor';

      // Cloud Functions can write documents
      allow write: if request.auth != null;

      // Viewers can read their own request/response documents
      // This is enforced in Cloud Function, not here
    }
  }
}
```

---

## Example: Creating Request and Response

```typescript
import { db } from './config/database'
import { FieldValue } from 'firebase-admin/firestore'

async function createGenerationRequest(
  generateType: GenerationType,
  job: JobDetails,
  defaults: GeneratorDefaults,
  experienceData: { entries: ExperienceEntry[], blurbs: Blurb[] },
  preferences?: GenerationPreferences,
  viewerSessionId?: string,
  editorEmail?: string
): Promise<string> {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).slice(2, 11)
  const requestId = `resume-generator-request-${timestamp}-${randomId}`

  const request: GeneratorRequest = {
    id: requestId,
    type: 'request',
    generateType,
    defaults: {
      name: defaults.name,
      email: defaults.email,
      phone: defaults.phone,
      location: defaults.location,
      website: defaults.website,
      github: defaults.github,
      linkedin: defaults.linkedin,
      avatar: defaults.avatar,
      logo: defaults.logo,
      accentColor: defaults.accentColor,
      defaultStyle: defaults.defaultStyle,
    },
    job,
    preferences,
    experienceData,
    status: 'pending',
    access: {
      viewerSessionId,
      isPublic: !editorEmail,
    },
    createdAt: FieldValue.serverTimestamp(),
    createdBy: editorEmail,
  }

  await db.collection('generator').doc(requestId).set(request)

  return requestId
}

async function createGenerationResponse(
  requestId: string,
  result: GenerationResult,
  files: GeneratedFiles,
  metrics: GenerationMetrics
): Promise<void> {
  const responseId = requestId.replace('request', 'response')

  const response: GeneratorResponse = {
    id: responseId,
    type: 'response',
    requestId,
    result,
    files,
    metrics,
    tracking: {
      downloads: 0,
    },
    createdAt: FieldValue.serverTimestamp(),
  }

  await db.collection('generator').doc(responseId).set(response)
}
```

---

## Migration Plan

### Phase 1 (MVP)

1. Create `generator` collection
2. Seed `default` document with initial settings
3. Create request documents for each generation
4. Create response documents with basic fields
5. No GCS yet (PDFs returned directly, no `files` field)

### Phase 2 (Full)

1. Add GCS bucket setup
2. Upload PDFs to GCS after generation
3. Add `files` field to response documents with GCS paths
4. Generate signed URLs
5. Implement download tracking in response documents
