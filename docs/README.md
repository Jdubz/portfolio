# Documentation

This directory contains all documentation for the Josh Wentworth Portfolio project.

## 📂 Directory Structure

```
docs/
├── development/
│   ├── ARCHITECTURE.md          # System architecture and patterns
│   ├── NEXT_STEPS.md            # Future roadmap (optional enhancements)
│   └── SETUP.md                 # Development setup guide
├── setup/
│   └── FIREBASE_CONFIG_CHECKLIST.md  # Firebase configuration guide
├── infrastructure/
│   ├── database-management.md   # Database operations and migrations
│   └── CHANGELOG.md             # Infrastructure version history
├── brand/                       # Brand assets and guidelines
├── features/
│   └── job-scraping-ui.md       # Job scraping UI documentation
├── CHANGELOG.md                 # Project version history
├── DEVELOPMENT_WORKFLOW.md      # Git workflow and deployment
└── CONTENT_ITEMS_SEED.md        # Content schema seed data
```

## 📚 Key Documents

### Architecture & Development

**[ARCHITECTURE.md](./development/ARCHITECTURE.md)**
- Complete system architecture overview
- API client patterns and state management
- Form components and validation
- Firebase integration patterns
- Development workflow and best practices

**[CLAUDE.md](../CLAUDE.md)** (root level)
- Project overview for AI assistants
- Technology stack and structure
- Common development commands
- Cross-project integration (job-finder)
- Important patterns and conventions

### Setup & Configuration

**[SETUP.md](./development/SETUP.md)**
- Local development environment setup
- Firebase emulator configuration
- Testing setup and workflows

**[FIREBASE_CONFIG_CHECKLIST.md](./setup/FIREBASE_CONFIG_CHECKLIST.md)**
- Firebase project configuration
- Service account setup
- Secret Manager configuration
- Firestore database setup

**[DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)**
- Git branching strategy (feature → staging → main)
- Deployment workflows
- CI/CD pipeline documentation
- Testing and linting requirements

### Database & Infrastructure

**[database-management.md](./infrastructure/database-management.md)**
- Firestore collections overview
- Data migration procedures
- Index management
- Backup and restore strategies

### Features

**[job-scraping-ui.md](./features/job-scraping-ui.md)**
- Job scraping interface documentation
- Queue management UI
- Integration with job-finder Python application

### Brand & Design

**[Brand Guidelines](./brand/README.md)**
- Logo kit and usage guidelines
- Color palette (Electric Blue, Cyber Magenta, Neon Coral)
- Typography (Poppins, Inter)
- Custom icon pack (50+ engineering icons)
- Favicon and visual assets

### Planning

**[NEXT_STEPS.md](./development/NEXT_STEPS.md)**
- Future enhancement roadmap
- Optional improvements and features
- **Note:** All core functionality is complete and production-ready

## 🚀 Quick Start

### For New Developers

1. **Understand the architecture:** Read [CLAUDE.md](../CLAUDE.md) for project overview
2. **Set up locally:** Follow [SETUP.md](./development/SETUP.md)
3. **Learn the workflow:** Review [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md)
4. **Review patterns:** Check [ARCHITECTURE.md](./development/ARCHITECTURE.md)

### For Making Changes

1. **Create feature branch** from `staging`
2. **Follow patterns** in ARCHITECTURE.md
3. **Write tests** for new functionality
4. **Create changeset:** `npm run changeset`
5. **PR to staging** → test → PR to main

### For Deployment

```bash
# Deploy to staging (auto-deploys on push)
git push origin staging

# Deploy to production (via PR)
gh pr create --base main --head staging
```

## 🔗 Project Links

- **Live Site:** https://joshwentworth.com
- **Staging:** https://staging.joshwentworth.com
- **GitHub:** https://github.com/Jdubz/portfolio
- **Firebase Console:** https://console.firebase.google.com/project/static-sites-257923
- **GCP Console:** https://console.cloud.google.com/home/dashboard?project=static-sites-257923

## 📊 Version Control

**[CHANGELOG.md](./CHANGELOG.md)**
- Project version history
- Release notes for all major changes
- Breaking changes and migration guides

**Changesets:**
- Run `npm run changeset` to create a changeset
- Changesets are auto-consumed on merge to main
- Version bumps happen automatically via GitHub Actions

## 🔍 Cross-Project Integration

This portfolio integrates with the **job-finder** Python application:

- **Shared Firestore Collections:**
  - `job-queue` - Job processing queue
  - `job-matches` - AI-analyzed job matches
  - `companies` - Company information cache
  - `job-sources` - Job board sources

- **Shared Types Package:**
  - Located at `../shared-types`
  - TypeScript types mirror Python Pydantic models
  - Single source of truth for data structures

See [CLAUDE.md](../CLAUDE.md) "Cross-Project Integration" section for details.

## 📝 Documentation Standards

When adding or updating documentation:

1. **Place in appropriate directory** (development, setup, infrastructure, etc.)
2. **Update this index** when adding new documents
3. **Use clear headings** and consistent formatting
4. **Include code examples** with proper syntax highlighting
5. **Link related documentation** for easy navigation
6. **Update last modified date** at bottom of document

## 🛠️ External Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Functions](https://cloud.google.com/functions/docs)
- [Theme UI Documentation](https://theme-ui.com/)
- [React Documentation](https://react.dev/)
- [Changesets](https://github.com/changesets/changesets)

---

**Last Updated:** 2025-10-17
