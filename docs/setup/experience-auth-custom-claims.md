# Experience Page Authentication Setup

## Overview

The Experience page uses **Firebase Auth Custom Claims** for role-based access control. Instead of maintaining a list of authorized emails, we simply set a `role: 'editor'` custom claim on users who should have edit access.

## Custom Claims Approach

### Why Custom Claims?

- ✅ **Simpler**: No need to manage environment variables or secrets
- ✅ **Flexible**: Easy to add/remove editors in Firebase Console
- ✅ **Scalable**: Can add more roles in the future (viewer, admin, etc.)
- ✅ **Secure**: Claims are cryptographically signed in the ID token
- ✅ **Built-in**: Native Firebase feature, no external dependencies

### How It Works

1. User authenticates with Firebase Auth (Google Sign-In, email/password, etc.)
2. Firebase generates an ID token with the user's claims
3. Custom claims are included in the token: `{ role: 'editor' }`
4. Cloud Function verifies the token and checks for `role === 'editor'`
5. If valid, user can create/edit/delete experience entries

## Setting Up Editors

### Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `static-sites-257923`
3. Navigate to **Authentication** > **Users**
4. Find the user you want to make an editor
5. Click the user to open details
6. Scroll to **Custom claims** section
7. Add custom claim:
   ```json
   { "role": "editor" }
   ```
8. Save changes

### Admin SDK (Programmatic)

```typescript
import * as admin from 'firebase-admin'

// Set custom claims for a user
await admin.auth().setCustomUserClaims(uid, { role: 'editor' })

// Verify claims
const user = await admin.auth().getUser(uid)
console.log(user.customClaims) // { role: 'editor' }
```

### Firebase CLI (One-off)

```bash
# Install Firebase Admin SDK globally
npm install -g firebase-tools

# Set custom claims
firebase auth:users:set-custom-claims <uid> '{"role":"editor"}'
```

## Local Development (Emulator)

### Firebase Auth Emulator

The Auth emulator supports custom claims out of the box:

1. Start emulators:
   ```bash
   firebase emulators:start
   ```

2. Go to Auth Emulator UI: http://127.0.0.1:4000/auth

3. Create a test user (any email)

4. Edit the user and set custom claims:
   ```json
   { "role": "editor" }
   ```

5. Get the ID token from the emulator UI

6. Use the token in API requests:
   ```bash
   curl -X POST http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience/experience/entries \
     -H "Authorization: Bearer <emulator-token>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Entry","startDate":"2023-01"}'
   ```

### Emulator REST API

You can also set custom claims via the emulator REST API:

```bash
# Get the user's localId from the emulator UI or create user response
USER_ID="<localId>"

# Set custom claims
curl -X POST "http://127.0.0.1:9099/emulator/v1/projects/static-sites-257923/accounts:update" \
  -H "Content-Type: application/json" \
  -d '{
    "localId": "'$USER_ID'",
    "customAttributes": "{\"role\":\"editor\"}"
  }'
```

## Production Setup

### Required Steps

1. **Create Users**:
   - Go to Firebase Console > Authentication > Add user
   - Or let users sign up via the app

2. **Set Editor Role**:
   - For each editor, set custom claim: `{ "role": "editor" }`
   - Users to grant editor access:
     - `contact@joshwentworth.com`
     - `jwentwor@gmail.com`

3. **Deploy Cloud Function**:
   ```bash
   # No secrets needed! Custom claims are in the token
   firebase deploy --only functions:manageExperience
   ```

### Security Considerations

- ✅ Custom claims are signed by Firebase (tamper-proof)
- ✅ Claims are verified server-side in the Cloud Function
- ✅ Email verification is also required (`email_verified: true`)
- ✅ Tokens expire after 1 hour (standard Firebase behavior)
- ✅ No sensitive data stored in environment variables

## Testing Authentication

### Get a Valid Token

**From Firebase Console:**
1. Go to Authentication > Users
2. Click the user
3. Copy the UID
4. Use Firebase Admin SDK to generate a token:
   ```typescript
   const customToken = await admin.auth().createCustomToken(uid, { role: 'editor' })
   // Exchange for ID token via Firebase Auth API
   ```

**From Auth Emulator:**
1. Go to http://127.0.0.1:4000/auth
2. Find your user
3. Click "Token" to see the ID token
4. Copy the token

### Test with curl

```bash
# Test authenticated POST
curl -X POST http://127.0.0.1:5001/.../manageExperience/experience/entries \
  -H "Authorization: Bearer <your-id-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "startDate": "2023-01",
    "endDate": "2024-12",
    "body": "Built awesome features",
    "notes": "Remote position"
  }'

# Test authenticated PUT
curl -X PUT http://127.0.0.1:5001/.../manageExperience/experience/entries/<entry-id> \
  -H "Authorization: Bearer <your-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Lead Developer"}'

# Test authenticated DELETE
curl -X DELETE http://127.0.0.1:5001/.../manageExperience/experience/entries/<entry-id> \
  -H "Authorization: Bearer <your-id-token>"
```

## Troubleshooting

### "Access denied - editor role required"

- **Check custom claims**: Ensure `role: 'editor'` is set on the user
- **Refresh token**: Tokens don't update claims automatically, user must re-authenticate
- **Check email verification**: Email must be verified (`email_verified: true`)

### "Invalid authentication token"

- **Token expired**: Firebase tokens expire after 1 hour
- **Wrong environment**: Don't use emulator tokens in production
- **Format**: Ensure header is `Authorization: Bearer <token>`

### Cannot Set Custom Claims

- **Permissions**: Ensure you have Editor/Owner role in Firebase project
- **User exists**: User must be created before setting claims
- **Format**: JSON must be valid: `{ "role": "editor" }`

## Migration from AUTHORIZED_EDITORS

**Old approach (deprecated):**
```typescript
// ❌ Required managing email list in secrets
const AUTHORIZED_EDITORS = process.env.AUTHORIZED_EDITORS.split(',')
if (!AUTHORIZED_EDITORS.includes(email)) { ... }
```

**New approach (current):**
```typescript
// ✅ Check role from token claims
function hasEditorRole(decodedToken: auth.DecodedIdToken): boolean {
  return decodedToken.role === 'editor'
}
```

**Benefits:**
- No secrets to manage
- No environment variables to configure
- Easy to add/remove editors via Firebase Console
- More flexible for future role expansion

## Next Steps

1. ✅ Set custom claims for your editor accounts
2. ✅ Test locally with Auth emulator
3. ✅ Deploy to production
4. ✅ Grant editor access to authorized users
