# Firebase Auth Domain Fix

## Issue

```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
```

Staging domain `staging.joshwentworth.com` is not authorized in Firebase Authentication.

## Solution

Add `staging.joshwentworth.com` to Firebase's authorized domains:

### Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/static-sites-257923/authentication/settings)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain**
4. Enter: `staging.joshwentworth.com`
5. Click **Add**

### Current Authorized Domains

Should include:
- ✅ `static-sites-257923.firebaseapp.com`
- ✅ `joshwentworth.com`
- ✅ `www.joshwentworth.com`
- ❌ `staging.joshwentworth.com` **(MISSING - needs to be added)**
- ✅ `localhost` (for development)

### Verification

After adding the domain, test by:
1. Navigate to https://staging.joshwentworth.com/experience
2. Click "Sign in with Google"
3. Should successfully redirect to Google OAuth
4. Should return to staging site after authentication

## Alternative: Use Firebase CLI (if available)

```bash
# This API may not be available via CLI - use Console instead
firebase auth:config --project static-sites-257923
```

## Production Note

When deploying to production, `joshwentworth.com` and `www.joshwentworth.com` should already be authorized.

---

**Action Required:** Manually add `staging.joshwentworth.com` in Firebase Console → Authentication → Settings → Authorized domains
