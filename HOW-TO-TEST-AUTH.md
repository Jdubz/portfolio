# How to Test Experience API with Authentication

## Quick Start

### Step 1: Get Your ID Token

**Option A: From Auth Emulator UI (Easiest)**

1. Open: http://127.0.0.1:4000/auth
2. Click on the user: `contact@joshwentworth.com`
3. In the user details panel, find the **ID Token** field
4. Click the copy icon next to the token
5. The token will look like: `eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...` (very long)

**Option B: Try the automated script**
```bash
./get-auth-token.sh contact@joshwentworth.com
```

### Step 2: Run the Test Suite

```bash
./test-experience-auth.sh 'paste-your-token-here'
```

**Example:**
```bash
./test-experience-auth.sh 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmNzI1NDEwMWY1N...'
```

The script will:
1. ✅ Create an experience entry (POST)
2. ✅ List all entries (GET)
3. ✅ Update the entry (PUT)
4. ✅ Create a second entry (POST)
5. ✅ Verify 2 entries exist (GET)
6. ✅ Delete first entry (DELETE)
7. ✅ Verify 1 entry remains (GET)
8. ✅ Delete second entry (DELETE)
9. ✅ Test without auth (should fail with 401)

### Step 3: View Data in Firestore

1. Open: http://127.0.0.1:4000/firestore
2. Look for database: **portfolio**
3. Open collection: **experience**
4. You'll see all the experience entries created during testing

## Manual Testing

If you prefer to test manually:

```bash
# Export your token
export TOKEN='your-token-here'

# Create an entry
curl -X POST http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience/experience/entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "startDate": "2023-01",
    "endDate": "2024-12",
    "body": "Built cool stuff",
    "notes": "Remote work"
  }'

# List all entries
curl http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience/experience/entries

# Update an entry (use ID from create response)
curl -X PUT http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience/experience/entries/<entry-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Lead Developer"}'

# Delete an entry
curl -X DELETE http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience/experience/entries/<entry-id> \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### "Access denied - editor role required"
- **Fix**: Make sure custom claims are set on the user
- Go to Auth emulator UI > Click user > Custom claims: `{ "role": "editor" }`

### "Invalid authentication token"
- **Fix**: Token may have expired (1 hour expiry)
- Get a fresh token from the Auth emulator UI

### "Cannot find name 'EMAIL'"
- **Fix**: The automated script may have issues
- Use **Option A** (Auth Emulator UI) to get the token manually

### Token looks weird or has errors
- **Fix**: Make sure you copied the entire token
- Tokens are very long (hundreds of characters)
- Make sure no extra spaces or quotes

## What's Being Tested

### Custom Claims Authorization ✅
- User must have `role: 'editor'` in custom claims
- Email must be verified
- Token must be valid and not expired

### CRUD Operations ✅
- **Create**: POST with title, startDate (required)
- **Read**: GET all entries (public, no auth)
- **Update**: PUT with partial fields
- **Delete**: DELETE by ID

### Firestore Integration ✅
- Data persisted to `portfolio` database
- `experience` collection
- Includes createdBy, updatedBy, timestamps

## Next Steps

Once local testing passes:

1. ✅ Commit test scripts
2. ✅ Deploy to staging
3. ✅ Set custom claims in production Firebase Console
4. ✅ Test production endpoints
5. ✅ Build frontend (Phase 2)
