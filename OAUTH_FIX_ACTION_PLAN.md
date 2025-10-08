# OAuth 404 Fix - Action Plan

## Root Cause Analysis

Based on comprehensive investigation, the Firebase Auth popup 404 is caused by **missing OAuth Redirect URIs** in Google Cloud Console.

### Verified Working Components ✅

1. **Firebase Hosting Auth Paths** - All returning 200 OK:
   - `https://staging.joshwentworth.com/__/auth/handler`
   - `https://staging.joshwentworth.com/__/auth/experiments.js`
   - `https://staging.joshwentworth.com/__/auth/handler.js`

2. **Firebase Authorized Domains** - Correctly configured in Firebase Console
3. **firebase.json Rewrites** - Properly excluding `__/auth/**` paths
4. **authDomain Configuration** - Correctly set to `static-sites-257923.firebaseapp.com`

### Root Cause ❌

**Google Cloud Console OAuth 2.0 Client ID is missing redirect URIs for custom domains.**

---

## Action Items

### 🔴 Priority 1: Fix OAuth Redirect URIs (REQUIRED)

**Location:** [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials?project=static-sites-257923)

**Steps:**

1. Navigate to GCP Console for project `static-sites-257923`
2. Go to **APIs & Services** → **Credentials**
3. Find the OAuth 2.0 Client ID used by Firebase (look for "Web client (auto created by Google Service)")
4. Click on the client ID to edit
5. Under **Authorized redirect URIs**, add:
   ```
   https://staging.joshwentworth.com/__/auth/handler
   https://joshwentworth.com/__/auth/handler
   https://www.joshwentworth.com/__/auth/handler
   ```
6. Click **Save**

**Expected Result:** OAuth popup will successfully redirect back to your site after authentication.

**Verification:**
```bash
# After adding URIs, test the auth flow:
# 1. Open https://staging.joshwentworth.com/experience
# 2. Click "Sign In"
# 3. Select Google account
# 4. Should redirect back successfully (no 404)
```

---

### 🟡 Priority 2: Alternative Solutions (If Above Fails)

#### Option A: Switch to Redirect-Based Auth

If popup continues to fail, use redirect-based authentication:

**File:** `web/src/hooks/useAuth.ts`

```typescript
import { signInWithRedirect, getRedirectResult } from "firebase/auth"

// Replace signInWithPopup with signInWithRedirect
export const signInWithGoogle = async (): Promise<void> => {
  const { getAuth, GoogleAuthProvider, signInWithRedirect } = await import("firebase/auth")
  const auth = getAuth()
  const provider = new GoogleAuthProvider()
  await signInWithRedirect(auth, provider)
  // User will be redirected away, result handled on return
}

// Add to useAuth hook initialization
useEffect(() => {
  const checkRedirectResult = async () => {
    const { getAuth, getRedirectResult } = await import("firebase/auth")
    const auth = getAuth()
    try {
      const result = await getRedirectResult(auth)
      if (result?.user) {
        // User successfully signed in via redirect
      }
    } catch (error) {
      console.error("Redirect sign-in error:", error)
    }
  }
  void checkRedirectResult()
}, [])
```

**Pros:**
- Works in all browser environments
- No popup blocker issues
- Better mobile experience

**Cons:**
- Full page redirect (less seamless)
- Loses page state during auth flow

#### Option B: Verify Firebase CLI Version

Ensure latest Firebase CLI:
```bash
npm install -g firebase-tools@latest
firebase --version  # Should be 13.x or higher
```

Then redeploy:
```bash
firebase deploy --only hosting:staging --project static-sites-257923
```

#### Option C: Check Browser Issues

1. Test in incognito/private mode
2. Disable browser extensions (especially privacy/ad blockers)
3. Check browser console for CORS/CSP errors
4. Try different browsers (Chrome, Firefox, Safari)

---

### 🟢 Priority 3: UX Improvements (Parallel Track)

See [docs/development/planned-improvements.md](docs/development/planned-improvements.md) for full UX improvement plan.

**Quick Wins:**

1. **Add Retry Button to Error State**
   ```tsx
   {authError && (
     <Alert variant="error" sx={{ mt: 2 }}>
       <Text>{authError}</Text>
       <Button onClick={handleSignIn} variant="secondary.sm" sx={{ mt: 2 }}>
         Try Again
       </Button>
     </Alert>
   )}
   ```

2. **Add Toast Notifications**
   - Install: `npm install react-hot-toast`
   - Show success/error toasts for auth state changes

3. **Improve Error Messages**
   ```typescript
   const getReadableError = (error: FirebaseError): string => {
     switch (error.code) {
       case 'auth/popup-closed-by-user':
         return 'Sign-in was cancelled. Please try again.'
       case 'auth/unauthorized-domain':
         return 'This domain is not authorized. Please contact support.'
       case 'auth/popup-blocked':
         return 'Pop-up was blocked. Please allow pop-ups and try again.'
       default:
         return error.message
     }
   }
   ```

4. **Add Loading Spinner on Button**
   ```tsx
   <Button disabled={signingIn}>
     {signingIn ? <Spinner size={16} sx={{ mr: 2 }} /> : null}
     {signingIn ? "Signing in..." : "Sign In"}
   </Button>
   ```

---

## Testing Checklist

After implementing fixes:

- [ ] OAuth popup opens successfully
- [ ] User can select Google account
- [ ] Redirect back to site works (no 404)
- [ ] User is authenticated and sees email
- [ ] Sign out works
- [ ] Error states show helpful messages
- [ ] Retry functionality works
- [ ] Works on mobile browsers
- [ ] Works in incognito mode
- [ ] Works across different browsers

---

## Expected Timeline

- **OAuth Redirect URI Fix:** 15-30 minutes (configuration only)
- **Testing & Verification:** 15 minutes
- **UX Improvements (optional):** 2-4 hours
- **Switch to Redirect Auth (if needed):** 1-2 hours

---

## Resources

- [Firebase Auth Domains Guide](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Google OAuth URIs Setup](https://developers.google.com/identity/protocols/oauth2/web-server#redirecturi)
- [Firebase Hosting Rewrites](https://firebase.google.com/docs/hosting/full-config#rewrites)
- [OAUTH_404_DEBUG.md](OAUTH_404_DEBUG.md) - Detailed troubleshooting

---

**Next Step:** Add OAuth redirect URIs in Google Cloud Console (Priority 1)
