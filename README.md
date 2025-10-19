# Josh Wentworth - Portfolio

> **Software × Hardware × Fabrication**

A professional portfolio showcasing multidisciplinary engineering projects that blend software development, electronics design, and digital fabrication. Built as a lightweight Gatsby static site with serverless contact form functionality.

**Josh Wentworth**
_Multidisciplinary Engineer_

- **Email**: hello@joshwentworth.com
- **LinkedIn**: [linkedin.com/in/joshwentworth](https://linkedin.com/in/joshwentworth)
- **GitHub**: [github.com/joshwentworth](https://github.com/joshwentworth)

## 📁 Project Structure

This project is organized as a minimal Firebase hosting setup:

```
portfolio/
├── web/                    # Gatsby static site
│   ├── src/
│   │   ├── pages/         # Site pages (homepage, contact, legal)
│   │   ├── components/    # React components
│   │   └── sections/      # Homepage sections
│   ├── static/            # Static assets
│   └── package.json       # Web dependencies
│
├── functions/             # Cloud Functions (contact form only)
│   ├── contact-form/
│   │   └── index.ts       # Contact form handler
│   ├── src/
│   │   └── index.ts       # Function exports
│   └── package.json       # Minimal function dependencies
│
├── firebase.json          # Firebase hosting configuration
└── package.json           # Root workspace config
```

## 🔧 Built With

### Web Stack

- **Gatsby** - React-based static site generator
- **Theme UI** - Constraint-based styling system
- **React Spring** - Smooth parallax animations
- **MDX** - Markdown with JSX for content

### Functions Stack

- **Cloud Functions Gen 2** - Serverless contact form handler
- **TypeScript** - Type-safe function development
- **Mailgun** - Email delivery service
- **Joi & Zod** - Request validation
- **Express Rate Limit** - Rate limiting protection

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install all dependencies (root + workspaces)
npm install

# Or install individually
npm install              # Root dependencies
cd web && npm install   # Web dependencies
cd functions && npm install  # Functions dependencies
```

### Development

```bash
# Web development (port 8000)
npm run dev
# or
make dev

# Functions development (port 8080)
npm run dev:functions
# or
make dev-functions

# Run Firebase emulators (hosting + functions)
npm run firebase:serve
# or
make firebase-serve
```

### Building

```bash
# Build web
npm run build:web

# Build functions
npm run build:functions

# Build all
npm run build
```

### Testing

```bash
# Unit tests
npm test                    # Run all unit tests (web + functions)
npm run test:web           # Run web unit tests (Jest)
npm run test:functions     # Run functions unit tests (Jest)

# E2E tests (Playwright)
cd web
npm run test:e2e           # Run E2E tests headless
npm run test:e2e:ui        # Run E2E tests with UI mode
npm run test:e2e:debug     # Debug E2E tests
npm run test:e2e:report    # View test report
```

## 🎨 Brand Implementation

This portfolio implements Josh's complete brand identity:

- **Typography**: Poppins (headings) and Inter (body text)
- **Color Palette**: Premium surfaces with accent blue (#0EA5E9)
- **Engineering Icons**: Custom technical iconography

## 📦 Deployment

### Staging

```bash
# Deploy web to staging
npm run deploy:staging
# or
make deploy-staging

# Deploy functions to staging
npm run deploy:functions:staging
```

### Production

```bash
# Deploy web to production
npm run deploy:production
# or
make deploy-prod

# Deploy functions to production
npm run deploy:functions:production
```

## 🛠️ Available Commands

### Root Commands

```bash
npm run dev                      # Start web dev server
npm run dev:functions            # Start functions dev server
npm run build                    # Build web
npm run build:web               # Build web
npm run build:functions         # Build functions
npm test                        # Run all tests
npm run lint                    # Lint all workspaces
npm run clean                   # Clean web cache
```

### Makefile Commands

```bash
make help                # Show all available commands
make dev                 # Start web dev server
make dev-functions       # Start functions dev server
make build               # Build web
make test                # Run web tests
make test-functions      # Run functions tests
make clean               # Clean web cache
make firebase-serve      # Run Firebase emulators
make deploy-staging      # Deploy to staging
make deploy-prod         # Deploy to production
```

## ✨ Features

### Portfolio Showcase

- **Homepage**: Animated parallax sections showcasing engineering projects
- **Case Studies**: Detailed technical project breakdowns
- **Contact Form**: Secure serverless email delivery with rate limiting
- **Legal Pages**: Privacy policy and terms of service
- **Performance Optimized**: Static site generation for fast loading
- **SEO Friendly**: Optimized meta tags and structured data
- **Responsive Design**: Mobile-first with smooth animations

## 📝 Documentation

All documentation has been consolidated in the [`docs/`](./docs/) folder:

### Setup & Configuration

- [Firebase Configuration Checklist](./docs/setup/FIREBASE_CONFIG_CHECKLIST.md) - Complete setup guide
- [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md) - Git workflow and best practices

### Development

- **[Architecture](./docs/development/ARCHITECTURE.md)** - System design and patterns
- [Known Issues](./docs/development/KNOWN_ISSUES.md) - Current known issues and workarounds

### Brand Assets

- [Brand Guidelines](./docs/brand/README.md) - Complete brand identity and assets

### Changelog

- [Changelog](./docs/CHANGELOG.md) - Version history and release notes

## 🔒 Environment Variables

### Web (.env in web/)

```
GATSBY_CONTACT_FUNCTION_URL=https://...cloudfunctions.net/contact-form
```

### Functions (.env in functions/)

See [functions/.env.example](./functions/.env.example)

## 📜 License

0BSD - See [LICENSE](./LICENSE)

## 🤝 Contact

For questions or collaborations:

- Email: hello@joshwentworth.com
- LinkedIn: [linkedin.com/in/joshwentworth](https://linkedin.com/in/joshwentworth)
