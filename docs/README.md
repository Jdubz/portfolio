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

- **[Firebase Analytics](./setup/firebase-analytics.md)**
  Firebase Analytics integration guide with environment configuration, custom event tracking, and usage examples.

- **[Security Setup](./setup/security-setup.md)**
  Cloud Function security setup including Firebase App Check, rate limiting, and CORS configuration.

### Deployment

- **[Deployment Guide](./deployment/DEPLOYMENT.md)**
  Main deployment documentation covering Firebase hosting, Cloud Functions, and CI/CD workflows.

- **[Functions Deployment](./deployment/functions-deployment.md)**
  Cloud Functions-specific deployment instructions, including staging vs production environments.

- **[Deployment Verification](./deployment/deployment-verification.md)**
  Pre-deployment checklist for Workload Identity Federation, service accounts, and CI/CD verification.

- **[GitHub Actions Analysis](./deployment/github-actions-analysis.md)**
  Analysis of GitHub Actions deployment pipeline security improvements and best practices.

- **[Workload Identity Setup](./deployment/workload-identity-setup.md)**
  Detailed Workload Identity Federation configuration for secure GitHub Actions deployments.

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

- **[Security Improvements](./audit/security-improvements.md)**
  Summary of GitHub Actions security upgrades from service account keys to Workload Identity Federation.

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
2. Review relevant setup guides
3. Check [Security Audit](./audit/SECURITY_AUDIT.md) for environment variable issues
4. Review [Deployment Verification](./deployment/deployment-verification.md) for deployment issues

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

**Last Updated:** 2025-10-06
