# Quick Links & Resources

This document contains quick links to external resources and project URLs for easy reference.

## 🔗 Live URLs

### Portfolio Sites
- **Production:** https://joshwentworth.com
- **Staging:** https://jw-portfolio-staging.web.app
- **Source Code:** https://github.com/Jdubz/portfolio

### Cloud Functions
- **Production:** https://us-central1-static-sites-257923.cloudfunctions.net/contact-form
- **Staging:** https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging

### Project Management
- **GitHub Issues:** https://github.com/Jdubz/portfolio/issues
- **GitHub Actions:** https://github.com/Jdubz/portfolio/actions
- **GitHub Pull Requests:** https://github.com/Jdubz/portfolio/pulls

## 📊 Dashboards

### Firebase Console
- **Project:** https://console.firebase.google.com/project/static-sites-257923
- **Analytics:** https://console.firebase.google.com/project/static-sites-257923/analytics
- **Hosting:** https://console.firebase.google.com/project/static-sites-257923/hosting
- **App Check:** https://console.firebase.google.com/project/static-sites-257923/appcheck

### Google Cloud Console
- **Project:** https://console.cloud.google.com/home/dashboard?project=static-sites-257923
- **Cloud Functions:** https://console.cloud.google.com/functions/list?project=static-sites-257923
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=static-sites-257923
- **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam?project=static-sites-257923
- **Artifact Registry:** https://console.cloud.google.com/artifacts?project=static-sites-257923
- **Logs Explorer:** https://console.cloud.google.com/logs/query?project=static-sites-257923

## 🎵 External Projects

### Featured Projects
- **Blinky Time Case Study:** https://github.com/Jdubz/blinky_time
- **Modular Synths & Music:** https://soundcloud.com/jsdubs

## 📚 Documentation Quick Access

### Internal Docs
- [Main Documentation Index](../README.md)
- [Planned Improvements](./planned-improvements.md)
- [Known Issues](./KNOWN_ISSUES.md)
- [Deployment Guide](../deployment/DEPLOYMENT.md)
- [CI/CD Pipeline](../deployment/github-actions-cicd.md)

### Setup Guides
- [Contact Form Setup](../setup/CONTACT_FORM_SETUP.md)
- [Firebase Analytics](../setup/firebase-analytics.md)
- [Firebase Emulators](../setup/FIREBASE_EMULATORS.md)
- [Security Setup](../setup/security-setup.md)

## 🛠️ Development Commands

### Local Development
```bash
# Start Gatsby dev server
cd web && npm run develop

# Start Firebase emulators
cd functions && npm run dev
```

### Deployment
```bash
# Deploy to staging
git push origin staging

# Deploy to production
git push origin main
```

### Testing & Linting
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

---

**Last Updated:** 2025-10-06
