# Local Development Authentication Setup

## Overview

When developing locally, you need to use the **Firebase Auth Emulator** instead of production authentication. This document explains how to set up and use local auth properly.

## Problem

When you sign in with Google OAuth in development, you're authenticating against **production Firebase**, which gives you a production token. However, your local Cloud Functions are running in the **emulator**, which has its own isolated auth state. The emulator cannot verify production tokens, causing `401 Unauthorized` errors.

**Error you might see:**
```
POST http://localhost:5001/.../manageExperience/experience/entries 401 (Unauthorized)
Token verification failed: The Firebase ID token has been revoked.
```

## Solution

Use the Firebase Auth Emulator with test accounts that have the proper custom claims.

---

## Quick Start

### 1. Start the Firebase Emulators

```bash
make firebase-emulators
```

This starts:
- **Auth Emulator** on port 9099
- **Firestore Emulator** on port 8080
- **Functions Emulator** on port 5001
- **Emulator UI** on port 4000

### 2. Set up test users with editor role

```bash
node scripts/setup-emulator-auth.js
```

This creates:
- `contact@joshwentworth.com` (editor role) - password: `testpassword123`
- `test@example.com` (viewer role) - password: `testpassword123`

### 3. Sign in to your local app

Go to http://localhost:8000/experience

**Option A: Click "Sign in with Google"**
- The emulator will show an auth selection UI
- **Select your test account** (contact@joshwentworth.com)
- Auto-signs in without password prompt (emulator feature)

**Option B: Use the browser console** (advanced)
```javascript
// In browser console at http://localhost:8000/experience
const { signInWithEmail } = await import('./src/hooks/useAuth')
await signInWithEmail('contact@joshwentworth.com', 'testpassword123')
```

### 4. Verify authentication

After sign-in, you should see in the console:
```
ℹ️ User authenticated
{
  "email": "contact@joshwentworth.com",
  "uid": "...",
  "isEditor": true,
  "role": "editor"
}
```

---

## How It Works

### Development Flow (with emulators)

```
┌─────────────┐
│   Browser   │
│ (localhost) │
└──────┬──────┘
       │ 1. signInWithGoogle()
       │
       v
┌─────────────────────┐
│  Auth Emulator UI   │
│   localhost:9099    │  ← Shows test account selection
└──────┬──────────────┘
       │ 2. Returns emulator token
       │    (valid only for emulator)
       v
┌──────────────────────┐
│   Frontend State     │
│  user.getIdToken()   │
└──────┬───────────────┘
       │ 3. API request with token
       │    Authorization: Bearer <emulator-token>
       v
┌────────────────────────────┐
│   Functions Emulator       │
│   localhost:5001           │
│                            │
│ → verifyIdToken()          │ ← Uses emulator's Admin SDK
│   ✅ Token is valid        │    (knows about emulator tokens)
│   ✅ Custom claims present │
│      { role: "editor" }    │
└────────────────────────────┘
```

### Production Flow (real Firebase)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. signInWithGoogle()
       │
       v
┌─────────────────────┐
│  Google OAuth       │
│  accounts.google.com│  ← Real Google sign-in
└──────┬──────────────┘
       │ 2. Returns production token
       │
       v
┌──────────────────────┐
│   Frontend State     │
│  user.getIdToken()   │
└──────┬───────────────┘
       │ 3. API request with token
       │    Authorization: Bearer <prod-token>
       v
┌────────────────────────────┐
│   Cloud Functions (prod)   │
│   us-central1-...          │
│                            │
│ → verifyIdToken()          │ ← Uses production Admin SDK
│   ✅ Token is valid        │    (verifies with Firebase)
│   ✅ Custom claims present │
│      { role: "editor" }    │
└────────────────────────────┘
```

---

## Environment Configuration

The emulator connection is controlled by environment variables:

**`.env.development`** (used by `gatsby develop`):
```bash
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=localhost

# API points to emulator
GATSBY_EXPERIENCE_API_URL=http://localhost:5001/static-sites-257923/us-central1/manageExperience
```

**`.env.production`**:
```bash
GATSBY_USE_FIREBASE_EMULATORS=false

# API points to production
GATSBY_EXPERIENCE_API_URL=https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience
```

### How emulator connection works

In `useAuth.ts`:
```typescript
// Connect to emulators in development
if (process.env.GATSBY_USE_FIREBASE_EMULATORS === "true") {
  const { connectAuthEmulator } = await import("firebase/auth")
  const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? "localhost"
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, {
    disableWarnings: true
  })
}
```

This tells the Firebase client SDK to use the emulator instead of production.

---

## Managing Test Users

### View users in Emulator UI

Open http://localhost:4000/auth to see all test users.

### Add a new test user

**Option 1: Emulator UI**
1. Go to http://localhost:4000/auth
2. Click "Add User"
3. Enter email and password
4. After creation, click on the user
5. Click "Edit Custom Claims"
6. Add: `{"role": "editor"}`

**Option 2: Script (recommended)**

Edit `scripts/setup-emulator-auth.js` and add to `TEST_USERS`:
```javascript
{
  email: "newuser@example.com",
  password: "testpassword123",
  displayName: "New User",
  emailVerified: true,
  customClaims: { role: "editor" },
}
```

Then run:
```bash
node scripts/setup-emulator-auth.js
```

### Delete test data

The emulator data is persisted in `/emulator-data/`. To reset:

```bash
# Stop emulators
Ctrl+C

# Delete persisted data
rm -rf emulator-data/

# Restart emulators (will be empty)
make firebase-emulators

# Re-add test users
node scripts/setup-emulator-auth.js
```

---

## Troubleshooting

### Issue: "Token has been revoked"

**Cause:** You're signed in with a production token, but your API calls go to the emulator.

**Solution:**
1. Open http://localhost:8000/experience
2. Click "Sign Out"
3. Click "Sign in with Google"
4. **Select the test account from the emulator UI**

### Issue: "Access denied - editor role required"

**Cause:** Your test user doesn't have the `role: "editor"` custom claim.

**Solution:**
```bash
# Re-run the setup script to ensure claims are set
node scripts/setup-emulator-auth.js
```

Or manually add claims in the Emulator UI at http://localhost:4000/auth.

### Issue: Emulator UI shows no users

**Cause:** Emulator was restarted without `--export-on-exit` flag.

**Solution:**
```bash
# Our Makefile already includes this, but ensure you're using:
make firebase-emulators

# NOT:
firebase emulators:start  # ❌ (no persistence)
```

### Issue: "Failed to connect to emulator"

**Cause:** Emulators aren't running.

**Solution:**
```bash
# Terminal 1: Start emulators
make firebase-emulators

# Terminal 2: Start dev server
make dev
```

---

## Production Deployment

**Important:** The emulator setup is **only for local development**. In production:

1. ✅ Users sign in with real Google OAuth
2. ✅ Custom claims are managed via Firebase Console
3. ✅ All tokens are verified against production Firebase

To add editor role in production:
1. Go to [Firebase Console](https://console.firebase.google.com/project/static-sites-257923/authentication/users)
2. Find the user
3. Click the 3-dot menu → "Edit user"
4. Add custom claim: `{"role": "editor"}`

---

## Summary

**Development (with emulators):**
- ✅ Use `make firebase-emulators`
- ✅ Use `node scripts/setup-emulator-auth.js` to create test users
- ✅ Sign in with test accounts (contact@joshwentworth.com)
- ✅ Token works with local Cloud Functions

**Production:**
- ✅ Use real Google OAuth
- ✅ Manage custom claims in Firebase Console
- ✅ Token works with deployed Cloud Functions

**Never mix them:**
- ❌ Production token with emulator functions = 401 error
- ❌ Emulator token with production functions = 401 error
