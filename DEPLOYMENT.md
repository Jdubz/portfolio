# Deployment Guide - Josh Wentworth Portfolio

## 🚀 Deployment Setup Overview

This portfolio uses a **staging branch workflow** with Firebase hosting and GitHub Actions for automated deployments.

### Branch Structure
- **`main`** - Production branch (deploys to production Firebase site)
- **`staging`** - Working branch (deploys to staging Firebase site)

### Deployment Workflow
1. **Development** → Work on `staging` branch
2. **Staging Deployment** → Push to `staging` triggers automatic deployment
3. **Production Deployment** → PR from `staging` → `main` + merge triggers production deployment

---

## 🔧 Required Setup

### 1. Firebase Configuration

**Firebase Sites:**
- **Production**: `jsdubz-production`
- **Staging**: `stagingjsw`
- **Project ID**: `static-sites-257923`

### 2. GitHub Secrets Required

You need to set up this secret in GitHub repository settings:

```
FIREBASE_SERVICE_ACCOUNT
```

**To get the service account key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`static-sites-257923`)
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Copy the entire JSON content
6. Add it as `FIREBASE_SERVICE_ACCOUNT` secret in GitHub

### 3. Workflow Files

The following workflows are configured:

#### 📄 `.github/workflows/deploy-staging.yml`
- **Trigger**: Push to `staging` branch
- **Target**: Firebase staging site (`stagingjsw`)
- **Build Environment**: `staging`

#### 📄 `.github/workflows/deploy-production.yml`
- **Trigger**: Push to `main` branch
- **Target**: Firebase production site (`jsdubz-production`)
- **Build Environment**: `production`

#### 📄 `.github/workflows/pr-quality-gate.yml`
- **Trigger**: Pull requests to `main` or `staging`
- **Checks**: TypeScript compilation + Gatsby build verification

---

## 🌊 Development Workflow

### Working on New Features

```bash
# Make sure you're on staging branch
git checkout staging
git pull origin staging

# Make your changes
# ... edit files ...

# Commit and push (triggers staging deployment)
git add -A
git commit -m "Add new feature"
git push origin staging
```

### Deploying to Production

```bash
# Create PR from staging to main
gh pr create --base main --head staging --title "Release v1.x.x" --body "Production deployment"

# After PR approval and merge, production deployment triggers automatically
```

---

## 🔍 Firebase Hosting Details

### Configuration Files

#### `firebase.json`
```json
{
  "hosting": [
    {
      "target": "production",
      "public": "public",
      "cleanUrls": true,
      "trailingSlash": false,
      // ... security headers and caching rules
    },
    {
      "target": "staging",
      "public": "public",
      // ... staging-specific configuration (no indexing)
    }
  ]
}
```

#### `.firebaserc`
```json
{
  "projects": {
    "default": "static-sites-257923"
  },
  "targets": {
    "static-sites-257923": {
      "hosting": {
        "production": ["jsdubz-production"],
        "staging": ["stagingjsw"]
      }
    }
  }
}
```

### npm Scripts for Deployment

The following npm scripts are available for Firebase operations:

```bash
# Deployment Scripts (builds and deploys)
npm run deploy:staging        # Build and deploy to staging
npm run deploy:production     # Build and deploy to production
npm run deploy:all           # Build and deploy to both environments

# Development & Testing Scripts
npm run firebase:emulate      # Start Firebase emulator (staging: :5005, production: :5000)
npm run firebase:serve        # Serve built site locally on :5000

# Utility Scripts
npm run firebase:login        # Authenticate with Firebase
npm run firebase:projects     # List available Firebase projects
npm run firebase:use          # Set project to static-sites-257923
```

### Manual Deployment (if needed)

```bash
# Using npm scripts (recommended)
npm run deploy:staging

# Or direct Firebase CLI commands
npm run build
firebase deploy --only hosting:staging
firebase deploy --only hosting:production
```

---

## ⚙️ Workflow Features

### Staging Deployment
✅ **Automatic builds** on staging branch push
✅ **Environment variables** set for staging
✅ **Firebase deployment** to staging site
✅ **Build caching** for faster subsequent builds

### Production Deployment
✅ **Automatic builds** on main branch push
✅ **Production environment** configuration
✅ **Firebase deployment** to production site
✅ **Larger memory allocation** for production builds

### Quality Gate (PR Checks)
✅ **TypeScript compilation** verification
✅ **Gatsby build** success check
✅ **Build caching** for faster PR checks
✅ **Automated status** reporting

---

## 🐛 Troubleshooting

### Common Issues

**1. Workflow fails with "package-lock.json not found"**
- Run `npm install` to regenerate package-lock.json
- Commit and push the file

**2. Firebase deployment fails with authentication error**
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is correctly set
- Ensure the service account has Firebase Hosting Admin role

**3. Build fails with memory issues**
- Check NODE_OPTIONS memory allocation in workflow files
- Staging uses 6GB, production uses 8GB

**4. TypeScript compilation errors**
- Run `npx tsc --noEmit` locally to check for type errors
- Fix TypeScript issues before pushing

### Local Testing

```bash
# Test build locally
npm run build

# Test with Firebase emulator (both staging and production)
npm run firebase:emulate

# Access sites at:
# Production: http://localhost:5000
# Staging: http://localhost:5005

# Or serve built site only (single environment)
npm run firebase:serve
# Access at: http://localhost:5000
```

---

## 📊 Deployment Status

You can monitor deployment status:

- **GitHub Actions**: Check the Actions tab in your repository
- **Firebase Console**: View deployment history at [Firebase Console](https://console.firebase.google.com/)
- **Live Sites**:
  - **Staging**: `https://stagingjsw.web.app`
  - **Production**: `https://jsdubz-production.web.app`

---

## 🔒 Security Headers

Both staging and production include security headers:
- **Content Security Policy** (CSP)
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Strict Transport Security** (HSTS)
- **X-XSS-Protection**

**Staging Additional Headers:**
- **X-Robots-Tag**: `noindex, nofollow` (prevents search indexing)

---

*Last updated: December 2024*