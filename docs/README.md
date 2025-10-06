# Documentation

This directory contains all documentation for the Josh Wentworth Portfolio project.

## 📂 Directory Structure

```
docs/
├── setup/              # Setup and configuration guides
├── deployment/         # Deployment documentation
├── development/        # Development guides, quick links, and roadmap
├── audit/             # Code and security audits
├── brand/             # Brand assets and guidelines
├── archive/           # Historical documentation (completed checklists, old analyses)
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

- **[Firebase Analytics](./setup/firebase-analytics.md)**
  Firebase Analytics integration guide with environment configuration, custom event tracking, and usage examples.

- **[Security Setup](./setup/security-setup.md)**
  Cloud Function security setup including Firebase App Check, rate limiting, and CORS configuration.

### Deployment

- **[Deployment Guide](./deployment/DEPLOYMENT.md)**
  Main deployment documentation covering Firebase hosting, Cloud Functions, and CI/CD workflows.

- **[GitHub Actions CI/CD](./deployment/github-actions-cicd.md)**
  Current CI/CD pipeline architecture, security setup, and troubleshooting guide.

- **[Workload Identity Setup](./deployment/workload-identity-setup.md)**
  Detailed Workload Identity Federation configuration for secure GitHub Actions deployments.

- **[Functions Deployment](./deployment/functions-deployment.md)**
  Cloud Functions-specific deployment instructions, including staging vs production environments.

- **[Versioning Strategy](./deployment/VERSIONING.md)**
  Semantic versioning guidelines and automated release process documentation.

### Development

- **[Quick Links & Resources](./development/TODO.md)**
  Quick access to live URLs, dashboards, external projects, and common development commands.

- **[Planned Improvements](./development/planned-improvements.md)**
  Roadmap of future enhancements, optimizations, and technical debt to address.

- **[Known Issues](./development/KNOWN_ISSUES.md)**
  Current known issues, workarounds, and their status.

- **[Monorepo Migration](./development/MONOREPO_MIGRATION.md)**
  Historical documentation of the migration from separate repositories to a unified monorepo structure.

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
3. Review [Firebase Analytics](./setup/firebase-analytics.md) for tracking setup
4. Review [Deployment Guide](./deployment/DEPLOYMENT.md) before deploying

### Troubleshooting
1. Check [Known Issues](./development/KNOWN_ISSUES.md) first
2. Review [GitHub Actions CI/CD](./deployment/github-actions-cicd.md) troubleshooting section
3. Check [Security Audit](./audit/SECURITY_AUDIT.md) for environment variable issues
4. Review relevant setup guides for specific features

### Making Changes
1. Review [Code Audit Report](./audit/code-audit.md) for code quality standards
2. Check [Planned Improvements](./development/planned-improvements.md) for roadmap
3. Use [Quick Links](./development/TODO.md) for dashboards and live URLs
4. Update [CHANGELOG](./CHANGELOG.md) with your changes
5. Follow [Versioning Strategy](./deployment/VERSIONING.md) for releases

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

**Last Updated:** 2025-10-06
