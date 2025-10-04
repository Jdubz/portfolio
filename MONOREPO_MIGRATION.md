# Monorepo Migration Guide

## Overview

This repository has been restructured from a mixed Gatsby/Functions setup to a Firebase monorepo following best practices.

## New Structure

```
portfolio/
├── web/                    # Gatsby static site
│   ├── src/               # React components and pages
│   ├── static/            # Static assets
│   ├── gatsby-*.{ts,js}   # Gatsby configuration
│   ├── package.json       # Web dependencies
│   └── patches/           # npm patches
│
├── functions/             # Cloud Functions (flattened)
│   ├── src/
│   │   ├── index.ts      # Main entry point
│   │   ├── services/     # Business logic
│   │   └── __tests__/    # Function tests
│   ├── package.json      # Function dependencies
│   └── tsconfig.json     # TypeScript config
│
├── firebase.json         # Updated paths
├── package.json          # Root workspace
└── Makefile             # Updated commands
```

## What Changed

### Directory Structure
- ✅ Moved all Gatsby files to `web/` directory
- ✅ Flattened `functions/contact-form/` to `functions/`
- ✅ Created root workspace with `package.json`
- ✅ Removed duplicate files from root

### Configuration Updates
- ✅ `firebase.json` - Updated `public` path to `web/public`, added functions config
- ✅ `package.json` - Created root workspace with npm workspaces
- ✅ `.gitignore` - Updated paths for web/public and functions/lib
- ✅ `Makefile` - Updated all commands to use new paths

### CI/CD Updates
- ✅ `.github/workflows/deploy.yml` - Updated to work from web/ directory
- ✅ `.github/workflows/deploy-contact-function.yml` - Updated paths from `functions/contact-form` to `functions`

### Documentation Updates
- ✅ `README.md` - Complete rewrite for monorepo structure
- ✅ All docs still valid, paths unchanged

## Migration Checklist

- [x] Create monorepo directory structure
- [x] Move Gatsby project to web/
- [x] Flatten functions to top-level
- [x] Update firebase.json
- [x] Update GitHub Actions workflows  
- [x] Update Makefile
- [x] Create root package.json workspace
- [x] Update .gitignore
- [x] Update README.md
- [x] Clean up old files
- [x] Install dependencies

## Commands Quick Reference

### Development
```bash
# Web
npm run dev              # or make dev
cd web && npm run develop

# Functions  
npm run dev:functions    # or make dev-functions
cd functions && npm run dev

# Both (Firebase Emulators)
npm run firebase:serve   # or make firebase-serve
```

### Building
```bash
npm run build:web
npm run build:functions
npm run build            # builds web only (for backwards compat)
```

### Testing
```bash
npm run test:web
npm run test:functions
npm test                 # runs all tests
```

### Deployment
```bash
# Staging
npm run deploy:staging
npm run deploy:functions:staging

# Production
npm run deploy:production
npm run deploy:functions:production
```

## Breaking Changes

### For Developers
1. **Install location**: Must run `npm install` from root first
2. **Development**: Use `npm run dev` from root OR `cd web && npm run develop`
3. **Functions**: Now at `functions/` instead of `functions/contact-form/`
4. **Build output**: Web builds to `web/public/` instead of `public/`

### For CI/CD
1. All workflows updated to use `working-directory: web` or `working-directory: functions`
2. Cache paths updated to include both `web/package-lock.json` and `functions/package-lock.json`
3. Firebase deploy predeploy hooks updated to `cd web && npm run build`

## Benefits

1. **Clear Separation**: Web and Functions are clearly separated
2. **Best Practices**: Follows Firebase monorepo recommendations
3. **Scalability**: Easy to add more functions or apps
4. **Workspace Management**: npm workspaces handles dependencies
5. **CI/CD Clarity**: Each component has its own workflow steps

## Rollback Plan

If needed, the old structure is preserved in git history:
```bash
git log --all -- functions/contact-form/
```

To rollback:
```bash
git revert <commit-hash>
```

## Next Steps

1. Test local development with `make dev`
2. Test functions locally with `make dev-functions`
3. Run Firebase emulators with `make firebase-serve`
4. Deploy to staging to verify
5. Remove old `package-lock.json` from root if not used

## Support

For questions or issues:
- Check [README.md](./README.md) for commands
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment
- See [CONTACT_FUNCTION_SETUP.md](./CONTACT_FUNCTION_SETUP.md) for functions setup
