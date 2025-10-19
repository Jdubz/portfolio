# Portfolio Project - Architectural Context

**Last Updated**: 2025-10-19

> **Note**: This project recently underwent a major simplification. All Job Finder features (AI resume generation, experience management, job queue) have been removed. The codebase now focuses solely on the portfolio showcase site with a contact form.

> **Migration Status**: Worker A (Configuration & Dependency Cleanup) completed October 19, 2025. All frontend and backend dependencies cleaned, builds passing, documentation updated. See `WORKER_A_PROGRESS.md` for details.

This document serves as the single source of truth for architectural decisions, design patterns, and important context for the portfolio project.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Design Decisions](#key-design-decisions)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Security & Performance](#security--performance)
6. [Development Patterns](#development-patterns)

---

## System Architecture

### Monorepo Structure

This is a minimal Firebase monorepo combining:
- **Web**: Gatsby 5 static site (React 18 + Theme UI + TypeScript)
- **Functions**: Single Cloud Function Gen 2 for contact form (Node.js 20)

**Removed** (October 2025 cleanup):
- Database (Firestore) - No longer needed
- Storage (GCS) - No longer needed
- AI Services - Removed
- Authentication - Removed
- Multiple backend functions - Consolidated to contact form only

### Simplified Architecture

```
┌─────────────────────┐
│   Static Website    │
│   (Gatsby/React)    │
│   - Homepage        │
│   - Projects        │
│   - Contact Page    │
│   - Legal Pages     │
└──────────┬──────────┘
           │
           │ HTTP POST
           ▼
  ┌────────────────────┐
  │  Contact Function  │
  │  (Cloud Functions) │
  │  - Validation      │
  │  - Rate Limiting   │
  │  - Email via       │
  │    Mailgun         │
  └────────────────────┘
```

---

## Key Design Decisions

### 1. Static Site Generation (Gatsby)

**Why**: Maximum performance and simplicity

- Pre-rendered pages at build time
- No runtime database queries
- Excellent SEO and page speed
- CDN-friendly with Firebase Hosting
- Markdown-based content (MDX)

### 2. Serverless Contact Form

**Why**: Minimal infrastructure, pay-per-use

- Single Cloud Function handles contact submissions
- Rate limiting prevents abuse
- Joi validation for security
- Mailgun for reliable email delivery
- No database required (stateless)

### 3. Theme UI for Styling

**Why**: Constraint-based design system

- Centralized theme configuration
- Responsive design with scales
- Dark mode support built-in
- Professional brand implementation
- CSS-in-JS with TypeScript support

### 4. Monorepo with Workspaces

**Why**: Simple dependency management

- Shared linting and testing configuration
- Single `npm install` for entire project
- Coordinated versioning with Changesets
- Easier CI/CD pipeline

---

## Technology Stack

### Web Stack
- **Gatsby 5** - Static site generator
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Theme UI** - Styling system
- **React Spring** - Animations
- **MDX** - Markdown with JSX

### Functions Stack
- **Cloud Functions Gen 2** - Serverless compute
- **TypeScript** - Type-safe functions
- **Mailgun** - Email delivery
- **Joi** - Validation
- **Express Rate Limit** - Abuse prevention

### Development Tools
- **Jest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Changesets** - Version management

---

## Project Structure

```
portfolio/
├── web/                        # Gatsby frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── homepage/     # Homepage-specific components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ...
│   │   ├── pages/            # Gatsby pages (routes)
│   │   │   ├── index.tsx    # Homepage
│   │   │   ├── contact.tsx  # Contact page
│   │   │   ├── privacy.tsx  # Privacy policy
│   │   │   ├── terms.tsx    # Terms of service
│   │   │   └── app.tsx      # Placeholder for future app
│   │   ├── content/         # MDX content files
│   │   ├── styles/          # Theme configuration
│   │   └── utils/           # Utility functions
│   ├── static/              # Static assets
│   └── gatsby-*.ts          # Gatsby configuration
│
├── functions/                 # Cloud Functions
│   └── src/
│       ├── index.ts          # Contact form handler
│       ├── config/           # Configuration
│       ├── services/         # Email service
│       └── utils/            # Utilities
│
├── scripts/                   # Build and deployment scripts
├── docs/                      # Documentation
├── firebase.json             # Firebase hosting configuration
└── package.json              # Root workspace config
```

---

## Security & Performance

### Security Measures

**Contact Form Protection**:
- Rate limiting (5 requests per 15 minutes per IP)
- Joi validation for all inputs
- Email address validation
- XSS prevention through sanitization
- CORS configuration
- Firebase Hosting security headers

**Hosting Security Headers**:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy

### Performance Optimizations

**Build-Time**:
- Static page generation
- Image optimization
- CSS minification
- JavaScript bundling and code splitting

**Runtime**:
- CDN delivery via Firebase Hosting
- Aggressive caching headers
- Lazy loading for images
- Parallax animations with React Spring

**Bundle Size**:
- Tree-shaking unused code
- Minimal dependencies (~70% reduction after cleanup)
- No runtime database queries

---

## Development Patterns

### Git Workflow

```
feature_branch → staging → main
```

**Rules**:
1. Create feature branches from `staging`
2. Create PR: `feature → staging`
3. Test on staging deployment
4. Create PR: `staging → main` for production
5. Never push directly to `main`

### Testing Strategy

**Unit Tests** (Jest):
- Component testing (React Testing Library)
- Utility function testing
- Function service testing
- Coverage: Forms, validation, utilities

**E2E Tests** (Playwright):
- Contact form submission
- Page navigation
- Responsive design
- Cross-browser testing

### Deployment

**Environments**:
- **Staging**: `staging.joshwentworth.com`
- **Production**: `joshwentworth.com`

**CI/CD** (GitHub Actions):
- Push to `staging` → auto-deploy to staging
- Merge to `main` → auto-deploy to production
- Pre-push hooks run tests
- Changesets for versioning

---

## Future Considerations

### Potential Enhancements

1. **Analytics**: Add privacy-friendly analytics (Plausible/Fathom)
2. **CMS Integration**: Consider Contentful/Sanity for easier content updates
3. **React App**: The `/app` route is prepared for a future React application
4. **Contact Form DB**: Could add Firestore to log submissions for tracking
5. **Newsletter**: Could integrate with email service for updates

### Technical Debt

**Current Status**: Minimal technical debt after October 2025 cleanup

**Remaining Cleanup**:
- Makefile has some obsolete Job Finder targets (documented in migration plan)
- Some scripts in `scripts/` directory are obsolete
- Firebase emulator configuration includes unused services (Firestore, Storage)

These items are documented and tracked but don't affect production functionality.

---

## Migration History

### October 2025: Major Simplification

**What Was Removed**:
- AI Resume Generator (OpenAI, Gemini integration)
- PDF generation (Puppeteer)
- Experience management system
- Job queue integration
- Firebase Authentication
- Firestore database
- Google Cloud Storage
- 25+ npm packages (~70% reduction)
- 40,000+ lines of code removed

**What Remains**:
- Portfolio showcase site
- Contact form with Mailgun
- Professional branding
- Static site generation
- Minimal serverless infrastructure

**Why**:
- Focus on core portfolio functionality
- Reduce maintenance burden
- Simplify deployment
- Improve performance
- Lower costs

**Documentation**: See `MIGRATION_PLAN_TWO_WORKERS.md` for complete details.

---

## Contact

For questions about this architecture:
- **Email**: hello@joshwentworth.com
- **Developer**: Josh Wentworth
