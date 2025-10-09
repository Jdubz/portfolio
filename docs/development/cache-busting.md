# Cache Busting

This project includes an intelligent cache-busting system that automatically invalidates browser caches when necessary, ensuring users always get the latest version of the app.

## Overview

The system tracks a **cache version** that changes when:

1. **Package version changes** (semantic versioning)
2. **CACHE_BUST flag is set** in a changeset (manual control)
3. **Git commit hash changes** (development builds)

When the cache version changes, the app automatically:

- Clears all service worker caches
- Unregisters service workers
- Clears localStorage (except user preferences)
- Forces a clean app state

## How It Works

### 1. Cache Version Generation

**Script:** `scripts/cache-version.js`

Runs before every build (`prebuild` hook) and generates a cache version:

**Production:**

```
1.13.3                    # Normal release
1.14.0-bust-a3f2c8d1     # Cache bust release
```

**Development:**

```
1.13.3-abc123f           # Version + git hash
```

### 2. Changeset CACHE_BUST Flag

When creating a changeset, you're prompted:

```bash
git commit -m "feat: update service worker"

# Auto-changeset prompts:
Change type? (patch/minor/major) [minor]: minor
Summary of changes [update service worker]: <enter>

⚠️  Does this change require users to hard refresh?
   (Service worker changes, critical CSS/JS updates, etc.)

Force cache invalidation? (y/N) [N]: y

✓ Created changeset: .changeset/brave-lion-roars.md
🔥 Cache bust enabled - users will get a hard refresh
```

The changeset file includes:

```markdown
---
"josh-wentworth-portfolio": minor
---

Update service worker for offline support

CACHE_BUST: true
```

### 3. Build-Time Processing

When you build:

```bash
npm run build

# prebuild runs:
🔥 CACHE_BUST flag detected - forcing cache invalidation
   Cache version: 1.14.0-bust-a3f2c8d1

# Writes to web/.env.cache:
GATSBY_CACHE_VERSION=1.14.0-bust-a3f2c8d1
```

### 4. Client-Side Detection

When users visit the site (`gatsby-browser.js`):

```javascript
📦 Cache version check:
   current: 1.14.0-bust-a3f2c8d1
   stored: 1.13.3

🔥 Cache version mismatch - invalidating caches
   Deleting cache: workbox-precache-v2
   Deleting cache: gatsby-plugin-image
   Unregistering service worker

📢 App updated: 1.13.3 → 1.14.0-bust-a3f2c8d1
✅ Cache invalidation complete
```

The app automatically:

- Clears all caches
- Stores the new version
- Continues loading with fresh assets

## When to Use CACHE_BUST

### Always Use For:

✅ **Service worker changes**

- New caching strategies
- Offline functionality updates
- Precache manifest changes

✅ **Critical CSS/JS updates**

- Breaking style changes
- Major JavaScript refactors
- Bundle restructuring

✅ **Asset URL changes**

- Image CDN migrations
- Font loading changes
- External resource updates

✅ **Breaking localStorage schema changes**

- Changed data structures
- New storage keys
- Incompatible formats

### Usually Don't Need For:

❌ **Content updates** - Regular page edits

❌ **Minor style tweaks** - Small CSS adjustments

❌ **Backend changes** - API updates that don't affect client

❌ **Documentation** - README or docs changes

## Manual Usage

### Force Cache Bust in Existing Changeset

Edit your changeset file:

```bash
# Find your changeset
ls -lt .changeset/*.md | head -1

# Edit it
nano .changeset/your-changeset.md
```

Add the flag:

```markdown
---
"josh-wentworth-portfolio": patch
---

Fix critical rendering bug

CACHE_BUST: true
```

### Programmatic Cache Invalidation

Import the utilities:

```typescript
import { forceHardRefresh, invalidateAllCaches } from "@/utils/cache-version"

// Just clear caches (no reload)
await invalidateAllCaches()

// Clear caches and reload
await forceHardRefresh()
```

### Manual Build with Cache Bust

Set environment variable:

```bash
FORCE_CACHE_BUST=1 npm run build
```

Or temporarily add to a changeset:

```bash
echo "CACHE_BUST: true" >> .changeset/temp-bust.md
npm run build
git checkout .changeset/temp-bust.md
```

## What Gets Cached

### Preserved During Invalidation

✅ **User preferences:**

- `theme` (light/dark mode)
- `cookie-consent`
- `analytics-consent`

### Cleared During Invalidation

❌ **Service worker caches:**

- `workbox-precache-v2`
- `workbox-runtime`
- `gatsby-plugin-image`
- Any custom caches

❌ **LocalStorage (except preserved keys)**

❌ **SessionStorage (everything)**

## Development Workflow

### Example 1: Service Worker Update

```bash
# Make changes to service worker
git add web/gatsby-config.ts

git commit -m "feat: add offline page caching"

# Hook prompts:
Change type? minor
Summary: add offline page caching
Force cache invalidation? y

✓ Created changeset with CACHE_BUST flag

# Later, when merged and versioned:
npm run build
# 🔥 CACHE_BUST detected → generates bust version
```

### Example 2: Critical CSS Fix

```bash
git add web/src/gatsby-plugin-theme-ui/index.ts

git commit -m "fix: resolve broken layout on mobile"

# Hook prompts:
Change type? patch
Summary: resolve broken layout on mobile
Force cache invalidation? y

✓ Changeset created with cache bust
```

### Example 3: Regular Feature (No Bust)

```bash
git add web/src/components/NewFeature.tsx

git commit -m "feat: add new feature"

# Hook prompts:
Change type? minor
Summary: add new feature
Force cache invalidation? n

✓ Changeset created (no cache bust)
```

## Monitoring

### Check Current Version

In browser console:

```javascript
console.log(window.__CACHE_VERSION__)
// "1.14.0-bust-a3f2c8d1"

console.log(localStorage.getItem("app-cache-version"))
// "1.14.0-bust-a3f2c8d1"
```

### Check for Updates

```javascript
import { shouldInvalidateCache } from "@/utils/cache-version"

if (shouldInvalidateCache()) {
  console.log("Update available!")
}
```

### Listen for Updates

```javascript
window.addEventListener("app-updated", (event) => {
  const { from, to } = event.detail
  console.log(`Updated from ${from} to ${to}`)

  // Show toast notification
  showToast(`App updated to ${to}`)
})
```

## Implementation Details

### Files Created

1. **`scripts/cache-version.js`** - Version generator
   - Detects CACHE_BUST flags
   - Generates version strings
   - Writes to `.env.cache`

2. **`web/src/utils/cache-version.ts`** - Client utilities
   - Version comparison
   - Cache invalidation
   - LocalStorage management

3. **`web/gatsby-browser.js`** - Initialization
   - Runs on app load
   - Automatic cache checks
   - Event dispatching

### Environment Variables

**`GATSBY_CACHE_VERSION`** - Current cache version

- Set automatically by `prebuild` script
- Available in client code
- Used for version comparison

### Build Process

```
1. npm run build
   ↓
2. prebuild hook runs
   ↓
3. scripts/cache-version.js
   ↓
4. Checks for CACHE_BUST in changesets
   ↓
5. Generates version string
   ↓
6. Writes to web/.env.cache
   ↓
7. Gatsby loads environment
   ↓
8. GATSBY_CACHE_VERSION available in code
```

## Troubleshooting

### Cache not invalidating

**Check:**

1. Is `GATSBY_CACHE_VERSION` set?

```bash
cat web/.env.cache
```

2. Is the version different?

```javascript
console.log(window.__CACHE_VERSION__)
console.log(localStorage.getItem("app-cache-version"))
```

3. Is the cache version utility imported?

```bash
grep -r "initCacheVersionCheck" web/
```

### False cache busts

**Problem:** Cache invalidates on every deployment

**Cause:** Version changes on every build (dev mode)

**Solution:** Check if `NODE_ENV=production` is set:

```bash
NODE_ENV=production npm run build
```

### Users not getting updates

**Problem:** Users see old version after deployment

**Solutions:**

1. **Add CACHE_BUST flag** to next changeset
2. **Check service worker** is not overly aggressive
3. **Verify .env.cache** is generated correctly

## Best Practices

### 1. Be Conservative

Only use CACHE_BUST when truly necessary:

- Service worker changes
- Critical fixes
- Breaking changes

### 2. Document Why

Add explanation in changeset:

```markdown
---
"josh-wentworth-portfolio": minor
---

Update service worker to cache new routes

CACHE_BUST: true

Reason: Service worker precache manifest changed, requires cache invalidation to prevent stale content.
```

### 3. Test Before Merging

Build locally with cache bust:

```bash
npm run build
# Check output: 🔥 CACHE_BUST detected
```

### 4. Notify Users

Consider showing a toast notification:

```typescript
window.addEventListener("app-updated", () => {
  showToast("App updated! New features available.", {
    action: {
      label: "Reload",
      onClick: () => window.location.reload(),
    },
  })
})
```

## Resources

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Gatsby Environment Variables](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)
