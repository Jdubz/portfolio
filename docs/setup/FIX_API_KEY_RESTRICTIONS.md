# Fix API Key HTTP Referrer Restrictions

## Current Error
```
Firebase: Error (auth/internal-error)
```

Occurs when clicking "Sign In" button on staging.

## Root Cause

The Firebase API key (`AIzaSyAxzl0u55AkWKTKLjGJRX1pxtApS8yC39c`) has **HTTP referrer restrictions** that likely don't include `staging.joshwentworth.com`.

When Google OAuth tries to validate the API key from staging.joshwentworth.com, it gets rejected because the referrer isn't in the allowed list.

## Fix: Update API Key Restrictions

### 1. Go to Google Cloud Console API Keys

https://console.cloud.google.com/apis/credentials?project=static-sites-257923

### 2. Find the API Key

Look for API key: `AIzaSyAxzl0u55AkWKTKLjGJRX1pxtApS8yC39c`

Or find it by name (likely "Browser key (auto created by Firebase)")

### 3. Click Edit (pencil icon)

### 4. Check "Website restrictions"

Under "Application restrictions", check what's currently listed under "Website restrictions"

### 5. Add Missing Domains

Under "Website restrictions" → "Accept requests from these HTTP referrers (websites)", ensure these are ALL listed:

```
staging.joshwentworth.com/*
joshwentworth.com/*
www.joshwentworth.com/*
static-sites-257923.firebaseapp.com/*
static-sites-257923.web.app/*
localhost:*
127.0.0.1:*
```

**IMPORTANT:**
- Include the `/*` wildcard at the end
- Include both HTTP and HTTPS if needed
- Include localhost for development

### 6. Check "API restrictions"

Under "API restrictions", ensure these Firebase APIs are enabled:
- Identity Toolkit API
- Token Service API
- Firebase Authentication API
- Firebase Installations API

### 7. Save

Click "Save" at the bottom.

## Verification

After saving:

1. Wait 1-2 minutes for changes to propagate
2. Go to: https://staging.joshwentworth.com/resume-builder
3. Click "Viewer" to sign in
4. OAuth popup should work without errors

## Why This Fixes It

The API key is used to:
1. Initialize Firebase Auth
2. Communicate with Google's OAuth servers
3. Validate auth tokens

When the HTTP referrer (`staging.joshwentworth.com`) isn't in the allowed list:
- Google rejects the API request
- Returns generic `auth/internal-error`
- OAuth flow fails

Adding the domain to allowed referrers:
- Google accepts the API request from staging
- OAuth flow completes successfully
- User can sign in

## Alternative: No Restrictions (NOT RECOMMENDED)

You could remove all restrictions by selecting "None" under "Application restrictions", but this is **not recommended** for security reasons. Only do this for temporary testing.

## Related Configuration

This is separate from but related to:
- ✅ Firebase Authorized Domains (already configured)
- ✅ OAuth Redirect URIs (already configured)
- ❌ API Key HTTP Referrer Restrictions (NEEDS FIX)

All three must be configured for custom domain auth to work.
