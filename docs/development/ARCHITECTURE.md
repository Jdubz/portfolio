# Portfolio Architecture

**Last Updated**: October 2025
**Status**: Post Phase 1-3 Refactoring

## Overview

This is a monorepo containing a Gatsby static site with Firebase backend for content management.

## Project Structure

```
portfolio/
├── web/                      # Gatsby frontend
│   ├── src/
│   │   ├── api/             # API client layer (NEW)
│   │   ├── components/      # React components
│   │   ├── config/          # Configuration files
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Gatsby pages
│   │   ├── styles/          # Shared styles
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── static/              # Static assets
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── config/          # Function configuration
│       ├── middleware/      # Auth middleware
│       ├── services/        # Business logic
│       └── index.ts         # Function exports
├── scripts/                 # Build and utility scripts
└── docs/                    # Documentation
```

## Key Architectural Patterns

### 1. API Client Layer (`web/src/api/`)

Centralized HTTP client for all backend communication.

- **ApiClient** (base class): Common HTTP methods, error handling, auth injection
- **ExperienceClient**: Experience entry CRUD operations
- **BlurbClient**: Blurb CRUD operations

**Example**:
```typescript
import { experienceClient } from '../api'

const entries = await experienceClient.getEntries()
const newEntry = await experienceClient.createEntry(data)
```

### 2. State Management Hooks (`web/src/hooks/`)

React hooks manage UI state and call API clients.

- **useAuth**: Authentication state and Firebase Auth integration
- **useExperienceData**: Combined data fetching for experience page (entries + blurbs)

**Pattern**: Hooks handle React state, API clients handle HTTP.

### 3. Form Components (`web/src/components/`)

Reusable form components for consistent UX.

- **FormField**: Unified input/textarea with label and error display
- **FormLabel**: Standardized label styling
- **FormActions**: Consistent action buttons (Cancel, Save, Delete)
- **FormError**: Error message display
- **MarkdownEditor**: Markdown textarea with preview toggle

### 4. Validation (`web/src/utils/validators.ts`)

Type-safe form validation with reusable rules.

```typescript
const validator = createValidator<FormData>([
  { field: "email", validator: validators.required("Email") },
  { field: "email", validator: validators.email },
])

const errors = validator(formData)
```

### 5. Centralized Configuration (`web/src/config/`)

- **api.ts**: API endpoints and URL generation
- Environment-specific configuration via `.env` files

### 6. Logging (`web/src/utils/logger.ts`)

Structured logging with context:
- Development/Staging: Console output
- Production: Google Cloud Logging (if configured)

```typescript
logger.info("User action", { userId, action: "create" })
logger.error("API failed", error, { endpoint, status })
```

### 7. Markdown Rendering (`web/src/components/MarkdownContent.tsx`, `web/src/styles/markdown.ts`)

Centralized markdown styling for consistent content rendering.

## Firebase Architecture

### Firestore Database

**Collections**:
- `experiences`: Experience entries (jobs, projects)
- `blurbs`: Markdown content sections (intro, skills, etc.)

**Security**: Firestore rules enforce authentication for write operations.

### Cloud Functions

**manageExperience**: REST API for experience/blurb CRUD
- `GET /experience/entries` - List all entries
- `POST /experience/entries` - Create entry (auth required)
- `PUT /experience/entries/:id` - Update entry (auth required)
- `DELETE /experience/entries/:id` - Delete entry (auth required)
- `GET /experience/blurbs` - List all blurbs
- `POST /experience/blurbs` - Create blurb (auth required)
- `PUT /experience/blurbs/:name` - Update blurb (auth required)
- `DELETE /experience/blurbs/:name` - Delete blurb (auth required)

**contact-form**: Contact form submission handler

### Secrets Management

Secrets are stored in Google Cloud Secret Manager:

- **openai-api-key**: OpenAI API key for AI resume generator
  - Accessible by Cloud Functions default service account
  - Created: October 2025
  - Purpose: Resume and cover letter generation (planned feature)

### Authentication

- **Firebase Auth** with Google OAuth provider
- **Custom claims**: `role: "editor"` for content management access
- **Emulator support**: Local development with test users

## Development Setup

### Local Development

```bash
# Install dependencies
npm install

# Start Firebase emulators (Terminal 1)
npm run emulators

# Start Gatsby dev server (Terminal 2)
npm run dev --workspace=web

# Setup emulator auth (first time only)
node scripts/setup-emulator-auth.js
```

**Test accounts**:
- Editor: `contact@joshwentworth.com` / `testpassword123`
- Viewer: `test@example.com` / `testpassword123`

### Environment Variables

**Development** (`.env.development`):
- `GATSBY_USE_FIREBASE_EMULATORS=true`
- `GATSBY_EMULATOR_HOST=localhost`
- `FIRESTORE_DATABASE_ID=(default)` - For emulator persistence

**Production** (`.env.production`):
- Firebase config (API keys, project ID, etc.)
- `FIRESTORE_DATABASE_ID=portfolio` - Named database

## Testing

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Build production
npm run build --workspace=web
```

## Recent Refactoring (Oct 2025)

Completed Phase 1-3 refactoring:

1. **Phase 1**: Centralized config, standardized logging, shared components
2. **Phase 2**: Form component library, validation utilities, useAsyncSubmit hook
3. **Phase 3**: Unified API client architecture

**Impact**:
- ~527 lines of duplicate code eliminated
- +810 lines of reusable infrastructure added
- Significantly improved maintainability and testability

## Next Steps

See [PLANNED_IMPROVEMENTS.md](./PLANNED_IMPROVEMENTS.md) for future enhancements.
