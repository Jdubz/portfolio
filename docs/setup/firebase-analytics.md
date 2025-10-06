# Firebase Analytics Setup

## Overview

Firebase Analytics is integrated into the portfolio site to track user behavior, engagement, and conversions. This guide explains the setup, configuration, and usage.

## Current Status

✅ **Fully Implemented** (2025-10-06)
- Analytics SDK integrated
- Environment-aware initialization
- Custom event tracking helpers
- Example implementation in ContactForm

## Architecture

### Files Structure

```
web/
├── src/
│   ├── utils/
│   │   ├── firebase-app-check.ts      # App Check (initialized first)
│   │   └── firebase-analytics.ts       # Analytics (initialized after App Check)
│   └── components/
│       └── ContactForm.tsx             # Example: tracks form submissions
├── gatsby-browser.js                   # Initializes both on client entry
└── .env.*                              # Environment configuration
```

## Configuration

### Environment Variables

Analytics is controlled via the `GATSBY_ENABLE_ANALYTICS` environment variable:

**Development** (`.env.development`):
```bash
GATSBY_ENABLE_ANALYTICS=false  # Disabled to avoid polluting production data
```

**Staging** (`.env.staging`):
```bash
GATSBY_ENABLE_ANALYTICS=true   # Enabled for testing
```

**Production** (`.env.production`):
```bash
GATSBY_ENABLE_ANALYTICS=true   # Enabled for real tracking
```

### Firebase Configuration

The Firebase config in `firebase-app-check.ts` includes:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAxzl0u55AkWKTKLjGJRX1pxtApS8yC39c",
  authDomain: "static-sites-257923.firebaseapp.com",
  projectId: "static-sites-257923",
  storageBucket: "static-sites-257923.firebasestorage.app",
  messagingSenderId: "789847666726",
  appId: "1:789847666726:web:2128b2081a8c38ba5f76e7",
  measurementId: "G-DV9P4HR219",  // ← Analytics ID
}
```

## How It Works

### 1. Initialization Flow

```typescript
// gatsby-browser.js
export const onClientEntry = () => {
  // 1. Initialize Firebase App Check (security)
  initializeFirebaseAppCheck()

  // 2. Initialize Analytics (after App Check)
  initializeFirebaseAnalytics()
}
```

### 2. Smart Initialization

The `initializeFirebaseAnalytics()` function:
- ✅ Checks environment variable (`GATSBY_ENABLE_ANALYTICS`)
- ✅ Verifies browser support (detects ad blockers)
- ✅ Confirms Firebase app is initialized
- ✅ Enables data collection
- ✅ Logs initial `app_initialized` event

### 3. Automatic Tracking

Firebase Analytics automatically tracks:
- **Page views** - Every route change
- **Screen views** - App engagement
- **User properties** - Device, location, language
- **Session duration** - Time on site

### 4. Custom Events

Use the built-in helpers to track custom events:

```typescript
import { analyticsEvents } from "../utils/firebase-analytics"

// Contact form submission
analyticsEvents.contactFormSubmitted(true)  // success
analyticsEvents.contactFormSubmitted(false) // failure

// Project interactions
analyticsEvents.projectViewed("AI Assistant")
analyticsEvents.projectLinkClicked("AI Assistant", "github")

// Social links
analyticsEvents.socialLinkClicked("github")

// Resume downloads
analyticsEvents.resumeDownloaded()

// Section views
analyticsEvents.sectionViewed("about")
```

## Available Analytics Events

The `analyticsEvents` object in `firebase-analytics.ts` provides these helpers:

| Event | Parameters | Purpose |
|-------|-----------|---------|
| `contactFormSubmitted(success)` | `success: boolean` | Track form completion |
| `projectViewed(projectName)` | `project_name: string` | Track project engagement |
| `projectLinkClicked(projectName, linkType)` | `project_name: string`<br>`link_type: string` | Track project clicks |
| `socialLinkClicked(platform)` | `platform: string` | Track social media clicks |
| `resumeDownloaded()` | None | Track resume downloads |
| `sectionViewed(sectionName)` | `section_name: string` | Track section engagement |

## Implementation Example

Here's how analytics is implemented in the ContactForm:

```typescript
import { analyticsEvents } from "../utils/firebase-analytics"

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    // ... form submission logic ...

    if (response.ok) {
      // Track success
      analyticsEvents.contactFormSubmitted(true)
    }
  } catch (error) {
    // Track failure
    analyticsEvents.contactFormSubmitted(false)
  }
}
```

## Adding Custom Events

### Method 1: Use Built-in Helpers

```typescript
import { analyticsEvents } from "../utils/firebase-analytics"

// Just call the helper
analyticsEvents.projectViewed("My Project")
```

### Method 2: Create New Event

Add to `analyticsEvents` in `firebase-analytics.ts`:

```typescript
export const analyticsEvents = {
  // ... existing events ...

  // New custom event
  newsletterSignup: (source: string) => {
    logAnalyticsEvent("newsletter_signup", { source })
  },
}
```

### Method 3: Direct Event Logging

```typescript
import { logAnalyticsEvent } from "../utils/firebase-analytics"

// Log directly with custom parameters
logAnalyticsEvent("custom_event", {
  category: "engagement",
  action: "click",
  label: "hero-cta",
})
```

## Viewing Analytics Data

### Firebase Console

1. Visit: https://console.firebase.google.com/project/static-sites-257923/analytics
2. Navigate to **Analytics** → **Dashboard**
3. Explore:
   - **Events** - See all tracked events
   - **Conversions** - Mark important events
   - **User Properties** - Demographics and behavior
   - **Funnels** - Track user journeys
   - **Retention** - User engagement over time

### Data Appears After

- **Real-time**: Immediate (1-5 minutes)
- **Dashboard**: 24-48 hours for full processing
- **Custom reports**: 24-48 hours

## Best Practices

### ✅ Do

- Track key user actions (form submissions, project views, downloads)
- Use descriptive event names (`snake_case` format)
- Include relevant parameters for filtering
- Respect user privacy and GDPR
- Test analytics in staging before production

### ❌ Don't

- Track personally identifiable information (PII)
- Log sensitive data (emails, passwords, etc.)
- Create too many custom events (use parameters instead)
- Enable analytics in development (pollutes data)
- Track every single click (be selective)

## Privacy & GDPR Compliance

### Current Implementation

✅ No PII tracked (names, emails, etc.)
✅ Uses Google's default data retention (14 months)
✅ Respects Do Not Track browser settings
✅ No cross-site tracking cookies

### Future Considerations

If you need GDPR compliance:
1. Add cookie consent banner
2. Only initialize analytics after consent
3. Update privacy policy
4. Implement data deletion requests

## Troubleshooting

### Analytics Not Working

**Check browser console:**
```
[Analytics] Initialized successfully  ✅
[Analytics] Disabled via GATSBY_ENABLE_ANALYTICS  ⚠️
[Analytics] Not supported in this environment  ⚠️
```

**Common issues:**

1. **Ad blocker** - Firebase Analytics is blocked by most ad blockers
   - Solution: Test in incognito mode or disable ad blocker

2. **Wrong environment** - `GATSBY_ENABLE_ANALYTICS=false`
   - Solution: Check `.env.*` files

3. **Build issue** - Environment variables not loaded
   - Solution: Rebuild with `npm run build`

4. **Firebase app not initialized** - App Check failed
   - Solution: Check App Check setup in browser console

### No Data in Firebase Console

1. **Wait 24-48 hours** - Initial data takes time to process
2. **Check real-time reports** - Should show data within minutes
3. **Verify events are firing** - Check browser console or DebugView
4. **Check Firebase project** - Ensure you're viewing correct project

### Testing Analytics

Use Firebase DebugView for real-time testing:

```bash
# Enable debug mode
GATSBY_ENABLE_ANALYTICS=true FIREBASE_DEBUG=true npm run develop

# Visit your site, then check DebugView:
# https://console.firebase.google.com/project/static-sites-257923/analytics/debugview
```

## Related Documentation

- [Security Setup Guide](./security-setup.md) - Firebase App Check configuration
- [Contact Form Setup](./CONTACT_FORM_SETUP.md) - Related form infrastructure
- [Firebase Emulators](./FIREBASE_EMULATORS.md) - Local development testing

## External Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Google Analytics 4 Events](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Analytics Best Practices](https://firebase.google.com/docs/analytics/best-practices)

---

**Last Updated:** 2025-10-06
**Status:** ✅ Active in staging and production
