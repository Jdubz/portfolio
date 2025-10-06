# Environment Configuration

This document explains how to manage environment variables for different deployment environments.

## Environment Files

The project uses environment-specific `.env` files:

```
.env.development  → Local development (gatsby develop)
.env.staging      → Staging builds and deployments
.env.production   → Production builds and deployments
```

### Local Overrides

You can create `.env.{environment}.local` files for personal settings that won't be committed to git:

```
.env.development.local  → Personal dev settings (gitignored)
.env.staging.local      → Personal staging overrides (gitignored)
.env.production.local   → Personal production overrides (gitignored)
```

## Loading Priority

When Gatsby starts, environment variables are loaded in this order (later files override earlier ones):

1. `.env` (base file, if exists)
2. `.env.{GATSBY_ACTIVE_ENV}` or `.env.{NODE_ENV}` (environment-specific)
3. `.env.{GATSBY_ACTIVE_ENV}.local` (personal overrides, gitignored)

## Usage

### Local Development

```bash
# Uses .env.development automatically
npm run develop
```

### Build for Staging

```bash
# Set environment, then build
GATSBY_ACTIVE_ENV=staging npm run build
```

### Build for Production

```bash
# Uses .env.production (NODE_ENV=production by default)
npm run build
```

## CI/CD (GitHub Actions)

The deployment workflow automatically sets `GATSBY_ACTIVE_ENV`:

- **main branch** → `GATSBY_ACTIVE_ENV=production`
- **staging branch** → `GATSBY_ACTIVE_ENV=staging`

No need to create `.env.production` dynamically - it's committed to the repo.

## Environment Variables

### GATSBY_CONTACT_FUNCTION_URL

The contact form function URL varies by environment:

- **Development**: `http://localhost:5001/static-sites-257923/us-central1/handleContactForm` (emulator)
- **Staging**: `https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging`
- **Production**: `https://us-central1-static-sites-257923.cloudfunctions.net/contact-form`

### GATSBY_ENVIRONMENT

Identifies which environment the build is for:

- `development`
- `staging`
- `production`

## Adding New Variables

1. Add to appropriate `.env.{environment}` file(s)
2. Prefix with `GATSBY_` to make it available to client-side code
3. Variables without `GATSBY_` prefix are only available during build

### Example

```bash
# .env.development
GATSBY_API_URL=http://localhost:3000/api
GATSBY_ENVIRONMENT=development

# .env.staging
GATSBY_API_URL=https://staging-api.joshwentworth.com/api
GATSBY_ENVIRONMENT=staging

# .env.production
GATSBY_API_URL=https://api.joshwentworth.com/api
GATSBY_ENVIRONMENT=production
```

## Troubleshooting

### Environment variable not loading

1. Check the file exists: `ls -la web/.env.*`
2. Check Gatsby config console output shows the file loaded
3. Ensure variable is prefixed with `GATSBY_` for client-side access
4. Restart dev server after changing `.env` files

### Build uses wrong environment

Check that `GATSBY_ACTIVE_ENV` or `NODE_ENV` is set correctly:

```bash
echo $GATSBY_ACTIVE_ENV
echo $NODE_ENV
```

### Need different URL for remote testing

Create `.env.development.local`:

```bash
# Test against staging backend
GATSBY_CONTACT_FUNCTION_URL=https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging

# Or test with remote emulator
GATSBY_CONTACT_FUNCTION_URL=http://192.168.86.35:5001/static-sites-257923/us-central1/handleContactForm
```

This file is gitignored and won't affect other developers.
