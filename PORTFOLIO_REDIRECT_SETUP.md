# Portfolio Redirect Setup

## Overview
Added 301 permanent redirects from the portfolio website to the new Job Finder Firebase application.

## Changes Made

### 1. Firebase Hosting Redirects (`firebase.json`)

Added redirects for both **production** and **staging** hosting targets:

#### Production Redirects
- `/resume-builder{,/**}` → `https://job-finder.joshwentworth.com` (301)
- `/app{,/**}` → `https://job-finder.joshwentworth.com` (301)

#### Staging Redirects  
- `/resume-builder{,/**}` → `https://job-finder-staging.joshwentworth.com` (301)
- `/app{,/**}` → `https://job-finder-staging.joshwentworth.com` (301)

### 2. App Page Update (`web/src/pages/app.tsx`)

Updated the `/app` page to indicate redirection:
- Changed heading from "Coming Soon" to "Redirecting..."
- Updated messaging to reflect the move to a dedicated domain
- Added information about the automatic redirect

## How It Works

1. **Firebase Hosting** handles the redirects at the CDN level
2. Requests to old URLs are automatically redirected with HTTP 301 status
3. The `{,/**}` glob pattern matches both the base path and all sub-paths
4. SEO-friendly: 301 permanent redirect signals search engines the content has moved

## URLs Affected

### Old Portfolio URLs (redirected)
- `https://joshwentworth.com/resume-builder`
- `https://joshwentworth.com/resume-builder/*`
- `https://joshwentworth.com/app`
- `https://joshwentworth.com/app/*`
- `https://staging.joshwentworth.com/resume-builder`
- `https://staging.joshwentworth.com/resume-builder/*`
- `https://staging.joshwentworth.com/app`
- `https://staging.joshwentworth.com/app/*`

### New Job Finder URLs (destinations)
- **Production**: `https://job-finder.joshwentworth.com`
- **Staging**: `https://job-finder-staging.joshwentworth.com`

## Testing

After deployment, verify redirects work:

```bash
# Production
curl -I https://joshwentworth.com/resume-builder
# Should return: HTTP/2 301
# Location: https://job-finder.joshwentworth.com

curl -I https://joshwentworth.com/app
# Should return: HTTP/2 301
# Location: https://job-finder.joshwentworth.com

# Staging
curl -I https://staging.joshwentworth.com/resume-builder
# Should return: HTTP/2 301
# Location: https://job-finder-staging.joshwentworth.com
```

## Deployment

Changes committed directly to `staging` branch:
- Commit: `d4041c4` - Added redirects and updated app page
- Commit: `8a79ffa` - Fixed Prettier formatting
- Pushed to: `origin/staging`

Deploy to Firebase Hosting:
```bash
# Deploy staging
firebase deploy --only hosting:staging

# After testing, deploy production
firebase deploy --only hosting:production
```

## Benefits

1. **Backward Compatibility**: Old bookmarks and links continue to work
2. **SEO Preservation**: 301 redirects maintain search engine rankings
3. **User Experience**: Automatic redirection with no broken links
4. **Clean Separation**: Portfolio and Job Finder are now separate apps
5. **Maintainability**: Simple redirect rules easy to update if needed

## Related Documentation

- Job Finder FE Custom Domain Setup: `job-finder-FE/CUSTOM_DOMAIN_SETUP.md`
- Job Finder FE DNS Setup: `job-finder-app-manager/DNS_SETUP_ACTION_REQUIRED.md`
