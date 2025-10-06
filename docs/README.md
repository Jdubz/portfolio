# Documentation

This directory contains all documentation for the Josh Wentworth Portfolio project.

## 📂 Directory Structure

```
docs/
├── setup/              # Setup and configuration guides
├── deployment/         # Deployment documentation
├── development/        # Development guides and notes
├── audit/             # Code and security audits
├── brand/             # Brand assets and guidelines
└── CHANGELOG.md       # Version history
```

## 📚 Documentation Index

### Setup & Configuration

- **[Contact Form Setup](./setup/CONTACT_FORM_SETUP.md)**
  Complete guide for setting up the contact form Cloud Function, including Mailgun configuration, GCP Secret Manager setup, and environment variables.

- **[Contact Function Setup](./setup/CONTACT_FUNCTION_SETUP.md)**
  Detailed Cloud Function deployment guide with troubleshooting steps.

- **[Firebase Emulators](./setup/FIREBASE_EMULATORS.md)**
  Local development environment setup using Firebase emulators for functions and hosting.

### Deployment

- **[Deployment Guide](./deployment/DEPLOYMENT.md)**
  Main deployment documentation covering Firebase hosting, Cloud Functions, and CI/CD workflows.

- **[Functions Deployment](./deployment/functions-deployment.md)**
  Cloud Functions-specific deployment instructions, including staging vs production environments.

- **[Versioning Strategy](./deployment/VERSIONING.md)**
  Semantic versioning guidelines and automated release process documentation.

### Development

- **[Monorepo Migration](./development/MONOREPO_MIGRATION.md)**
  Historical documentation of the migration from separate repositories to a unified monorepo structure.

- **[Known Issues](./development/KNOWN_ISSUES.md)**
  Current known issues, workarounds, and their status.

- **[TODO](./development/TODO.md)**
  Planned features, improvements, and technical debt to address.

### Audit & Security

- **[Code Audit Report](./audit/code-audit.md)**
  Comprehensive code quality audit covering dependencies, TypeScript configuration, build processes, and best practices.

- **[Security Audit](./audit/SECURITY_AUDIT.md)**
  Security findings, exposed secrets analysis, and remediation recommendations.

### Brand Assets

- **[Brand Guidelines](./brand/README.md)**
  Complete brand identity documentation including:
  - Logo kit (SVG, PNG in multiple sizes)
  - Color palette and gradients
  - Typography guidelines (Poppins, Inter)
  - Custom icon pack (50+ engineering-themed icons)
  - Favicon in multiple formats
  - Photography and visual assets

## 🔍 Quick Reference

### Getting Started
1. Read [Contact Form Setup](./setup/CONTACT_FORM_SETUP.md) for initial configuration
2. Check [Firebase Emulators](./setup/FIREBASE_EMULATORS.md) for local development
3. Review [Deployment Guide](./deployment/DEPLOYMENT.md) before deploying

### Troubleshooting
1. Check [Known Issues](./development/KNOWN_ISSUES.md) first
2. Review relevant setup guides
3. Check [Security Audit](./audit/SECURITY_AUDIT.md) for environment variable issues

### Making Changes
1. Review [Code Audit Report](./audit/code-audit.md) for code quality standards
2. Check [TODO](./development/TODO.md) for planned work
3. Update [CHANGELOG](./CHANGELOG.md) with your changes
4. Follow [Versioning Strategy](./deployment/VERSIONING.md) for releases

## 📝 Contributing to Documentation

When adding or updating documentation:

1. **Place files in appropriate directories**:
   - Setup/configuration → `setup/`
   - Deployment guides → `deployment/`
   - Development notes → `development/`
   - Audit reports → `audit/`

2. **Update this index** when adding new documentation

3. **Use clear headings** and consistent formatting

4. **Include code examples** where applicable

5. **Link related documentation** for easy navigation

## 🔗 External Resources

- [Gatsby Documentation](https://www.gatsbyjs.com/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Cloud Functions](https://cloud.google.com/functions/docs)
- [Theme UI Documentation](https://theme-ui.com/)
- [Mailgun API Documentation](https://documentation.mailgun.com/)

---

**Last Updated:** 2025-10-05
