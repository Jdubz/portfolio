# Firebase Configuration Checklist

## Issue
Google OAuth returns `auth/internal-error` on BOTH staging and production.
Code hasn't changed but auth stopped working - indicates **Firebase Console configuration change**.

## What to Check

### 1. Firebase Authorized Domains
https://console.firebase.google.com/project/static-sites-257923/authentication/settings

**Should have:**
- ✅ `localhost`
- ✅ `staging.joshwentworth.com`
- ✅ `joshwentworth.com`
- ✅ `www.joshwentworth.com`
- ✅ `static-sites-257923.firebaseapp.com`
- ✅ `static-sites-257923.web.app`

**Check:** Did any of these get removed?

### 2. Google Cloud OAuth Client - Authorized Redirect URIs
https://console.cloud.google.com/apis/credentials?project=static-sites-257923

Find: OAuth 2.0 Client ID (Web client)

**Should have under "Authorized redirect URIs":**
- ✅ `https://staging.joshwentworth.com/__/auth/handler`
- ✅ `https://joshwentworth.com/__/auth/handler`
- ✅ `https://www.joshwentworth.com/__/auth/handler`
- ✅ `https://static-sites-257923.firebaseapp.com/__/auth/handler`
- ✅ `https://static-sites-257923.web.app/__/auth/handler`

**Check:** Did any of these get removed?

### 3. Google Cloud OAuth Client - Authorized JavaScript Origins
https://console.cloud.google.com/apis/credentials?project=static-sites-257923

Same OAuth client, check "Authorized JavaScript origins":

**Should have:**
- ✅ `https://staging.joshwentworth.com`
- ✅ `https://joshwentworth.com`
- ✅ `https://www.joshwentworth.com`
- ✅ `https://static-sites-257923.firebaseapp.com`
- ✅ `https://static-sites-257923.web.app`
- ✅ `http://localhost:8000`
- ✅ `http://localhost:9000`

**Check:** Did any of these get removed?

### 4. API Key HTTP Referrer Restrictions
https://console.cloud.google.com/apis/credentials?project=static-sites-257923

Find: API Key `AIzaSyAxzl0u55AkWKTKLjGJRX1pxtApS8yC39c`

**Check "Website restrictions":**

Should have in "Accept requests from these HTTP referrers":
- ✅ `staging.joshwentworth.com/*`
- ✅ `joshwentworth.com/*`
- ✅ `www.joshwentworth.com/*`
- ✅ `static-sites-257923.firebaseapp.com/*`
- ✅ `static-sites-257923.web.app/*`
- ✅ `localhost:*`
- ✅ `127.0.0.1:*`

**Check:**
- Are ANY domains listed?
- Were restrictions added that block our domains?
- Is it set to "None" (no restrictions)?

### 5. Google Sign-In Provider Status
https://console.firebase.google.com/project/static-sites-257923/authentication/providers

**Check:**
- ✅ Is "Google" provider **enabled**?
- ✅ Does it show the correct Web SDK configuration?
- ✅ Is there a Web client ID listed?

**Could it have been:**
- Accidentally disabled?
- Web client ID changed?
- Configuration reset?

### 6. Identity Toolkit API Status
https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=static-sites-257923

**Check:**
- ✅ Is "Identity Toolkit API" **enabled**?

**Could it have been:**
- Accidentally disabled?
- Quota exceeded?
- API restrictions added?

### 7. Recent Activity
https://console.cloud.google.com/home/activity?project=static-sites-257923

**Check:**
- Look for recent changes to credentials
- Look for changes to API configurations
- Look for changes by any team members
- Look for automated changes

## Most Likely Culprits

Based on `auth/internal-error` affecting BOTH staging and production:

1. **Google OAuth Client credentials modified/deleted**
   - Check if Web client still exists
   - Check if redirect URIs were removed

2. **API Key restrictions added**
   - Check if HTTP referrer restrictions were added
   - Check if domains were removed from allowed list

3. **Identity Toolkit API disabled**
   - Check if API is still enabled
   - Check if there's a quota issue

4. **Google Sign-In provider disabled**
   - Check if provider is still enabled in Firebase Console

## How to Test

After making changes in Firebase/GCP Console:

1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache and cookies
3. Try signing in on staging: https://staging.joshwentworth.com/experience
4. Try signing in on production: https://joshwentworth.com/experience

## Rollback Plan

If you can't identify the issue, you can:

1. **Temporarily remove all API key restrictions** (for testing only)
2. **Recreate OAuth client with correct settings**
3. **Contact Google Cloud support** for configuration audit
