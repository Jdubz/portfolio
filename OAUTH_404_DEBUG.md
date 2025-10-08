# OAuth 404 Debug Guide

## Issue
Google OAuth popup shows 404 error after user authenticates.

## Verification Steps Completed

### ✅ Firebase Hosting Auth Paths
All Firebase auth endpoints are working correctly:
```bash
curl -I https://staging.joshwentworth.com/__/auth/handler
# Returns: HTTP/2 200

curl -I https://staging.joshwentworth.com/__/auth/experiments.js
# Returns: HTTP/2 200

curl -I https://staging.joshwentworth.com/__/auth/handler.js
# Returns: HTTP/2 200
```

### ✅ Firebase Authorized Domains
Domains added to Firebase Console → Authentication → Settings → Authorized domains:
- `staging.joshwentworth.com`
- `joshwentworth.com`
- `www.joshwentworth.com`
- `localhost`
- `static-sites-257923.firebaseapp.com`

### ✅ firebase.json Configuration
```json
{
  "hosting": {
    "ignore": ["__/auth/**"],
    "rewrites": [...]
  }
}
```

## Root Cause Analysis

The 404 is likely happening at the **Google OAuth Consent Screen redirect**.

### Check Google Cloud Console OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=static-sites-257923)
2. Navigate to **APIs & Services** → **Credentials**
3. Find OAuth 2.0 Client ID used by Firebase
4. Check **Authorized redirect URIs**

### Required Redirect URIs

Firebase Auth uses these redirect patterns:
```
https://staging.joshwentworth.com/__/auth/handler
https://joshwentworth.com/__/auth/handler
https://www.joshwentworth.com/__/auth/handler
```

**If these are missing**, add them:
1. Click on the OAuth Client ID
2. Under "Authorized redirect URIs", add:
   - `https://staging.joshwentworth.com/__/auth/handler`
3. Save

### Alternative: Check Firebase Auto-Configuration

Firebase should automatically add redirect URIs when you add authorized domains. Check if this happened:

```bash
# List OAuth clients
gcloud auth application-default login
gcloud projects get-iam-policy static-sites-257923
```

## Quick Fix Attempts

### 1. Redeploy Firebase Hosting
```bash
firebase deploy --only hosting:staging --project static-sites-257923
```

### 2. Clear Browser Cache
The OAuth popup might be cached. Clear browser cache and cookies for:
- `accounts.google.com`
- `staging.joshwentworth.com`

### 3. Use Redirect Instead of Popup

Temporarily test with redirect-based auth instead of popup:

```typescript
// In useAuth.ts, change signInWithGoogle to use redirect
import { signInWithRedirect } from "firebase/auth"

export const signInWithGoogle = async (): Promise<User | null> => {
  const { getAuth, GoogleAuthProvider, signInWithRedirect } = await import("firebase/auth")
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
  return null // Result handled by getRedirectResult on next page load
}
```

Then add redirect result handler in useAuth hook initialization.

## Expected Behavior

When working correctly:
1. User clicks "Sign In"
2. Popup opens to Google OAuth
3. User selects account
4. Google redirects to `https://staging.joshwentworth.com/__/auth/handler?...`
5. Firebase handler processes the auth token
6. Popup closes
7. User is authenticated

## Current Behavior

1-3: ✅ Working
4: ❌ Shows "404. That's an error."
5-7: Never reached

## Next Steps

1. **Check Google Cloud Console OAuth redirect URIs** (most likely cause)
2. Test with redirect-based auth as workaround
3. Check Firebase project configuration matches GCP project
4. Verify no CORS/CSP blocking the redirect

---

**Most Likely Fix:** Add `https://staging.joshwentworth.com/__/auth/handler` to OAuth Authorized Redirect URIs in Google Cloud Console.
