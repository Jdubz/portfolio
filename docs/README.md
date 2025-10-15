# Documentation

This directory contains all documentation for the Josh Wentworth Portfolio project.

## 📂 Directory Structure

```
docs/
├── development/
│   ├── ARCHITECTURE.md     # System architecture
│   ├── NEXT_STEPS.md       # Future roadmap and planning
│   ├── SETUP.md            # Development setup guide
│   └── test-audit/         # Test coverage reports
├── setup/                  # Firebase and infrastructure setup
├── infrastructure/         # Database and infrastructure docs
├── brand/                  # Brand assets and guidelines
├── testing/                # Test documentation
├── CHANGELOG.md            # Version history
└── DEVELOPMENT_WORKFLOW.md # Git workflow and deployment
```

## 📚 Documentation Index

### Architecture

- **[ARCHITECTURE.md](./development/ARCHITECTURE.md)**
  Comprehensive architecture documentation covering project structure, API clients, state management, form components, Firebase setup, and development workflow.

### Setup & Configuration

- **[Firebase Configuration](./development/setup/)**
  Setup guides for Firebase services, authentication, and deployment configuration.

### Plans & Roadmap

- **[NEXT_STEPS.md](./development/NEXT_STEPS.md)**
  Future roadmap for the entire project including prioritized improvements and planned features. All core functionality is complete and production-ready - this lists optional enhancements.

### Brand Assets

- **[Brand Guidelines](./brand/README.md)**
  Complete brand identity documentation including:
  - Logo kit (SVG, PNG in multiple sizes)
  - Color palette and gradients
  - Typography guidelines (Poppins, Inter)
  - Custom icon pack (50+ engineering-themed icons)
  - Favicon in multiple formats
  - Photography and visual assets

### Version History

- **[CHANGELOG.md](./CHANGELOG.md)**
  Version history and release notes for all major changes.

## 🔍 Quick Reference

### Getting Started

1. Read [ARCHITECTURE.md](./development/ARCHITECTURE.md) to understand the codebase structure
2. Check [NEXT_STEPS.md](./development/NEXT_STEPS.md) for the current roadmap
3. Follow [SETUP.md](./development/SETUP.md) for local development setup
4. Review [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for git workflow

### Making Changes

1. Review [ARCHITECTURE.md](./development/ARCHITECTURE.md) for architectural patterns
2. Check [NEXT_STEPS.md](./development/NEXT_STEPS.md) for planned work
3. Follow git workflow: feature → staging → main
4. Update [CHANGELOG.md](./CHANGELOG.md) with your changes
5. Add a changeset: `npm run changeset`

### Project Information

- **Live Site:** https://joshwentworth.com
- **Source Code:** https://github.com/Jdubz/portfolio
- **Firebase Console:** https://console.firebase.google.com/project/static-sites-257923
- **GCP Console:** https://console.cloud.google.com/home/dashboard?project=static-sites-257923

## 📝 Contributing to Documentation

When adding or updating documentation:

1. **Place files in appropriate directories**:
   - Architecture/development notes → `development/`
   - Brand assets → `brand/`

2. **Update this index** when adding new documentation

3. **Use clear headings** and consistent formatting

4. **Include code examples** where applicable

5. **Link related documentation** for easy navigation

## 🔗 External Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Functions](https://cloud.google.com/functions/docs)
- [Theme UI Documentation](https://theme-ui.com/)
- [React Documentation](https://react.dev/)

---

**Last Updated:** 2025-10-13
