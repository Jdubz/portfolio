#!/bin/bash

# Get Firebase Auth emulator ID token for testing
# Usage: ./get-auth-token.sh [email]

EMAIL="${1:-contact@joshwentworth.com}"
PROJECT_ID="static-sites-257923"
EMULATOR_URL="http://127.0.0.1:9099"

echo "Getting ID token for: $EMAIL"
echo ""

# Step 1: Get user info to find localId
echo "Finding user..."
USERS_RESPONSE=$(curl -s "${EMULATOR_URL}/emulator/v1/projects/${PROJECT_ID}/accounts")

# Extract localId for the email
LOCAL_ID=$(echo "$USERS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
users = data.get('users', [])
for user in users:
    if user.get('email') == '$EMAIL':
        print(user.get('localId'))
        break
" 2>/dev/null)

if [ -z "$LOCAL_ID" ]; then
    echo "Error: User not found with email: $EMAIL"
    echo ""
    echo "Available users:"
    echo "$USERS_RESPONSE" | python3 -m json.tool 2>/dev/null | grep -A 1 '"email"'
    exit 1
fi

echo "Found user with localId: $LOCAL_ID"
echo ""

# Step 2: Sign in to get ID token
echo "Signing in..."
SIGNIN_RESPONSE=$(curl -s -X POST "${EMULATOR_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${EMAIL}\",
    \"password\": \"password123\",
    \"returnSecureToken\": true
  }")

# Extract ID token
ID_TOKEN=$(echo "$SIGNIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('idToken', ''))
except:
    pass
" 2>/dev/null)

if [ -z "$ID_TOKEN" ]; then
    echo "Error: Could not get ID token"
    echo ""
    echo "Response:"
    echo "$SIGNIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SIGNIN_RESPONSE"
    echo ""
    echo "Note: The emulator may not have a password set for this user."
    echo "To get the token manually:"
    echo "  1. Go to http://127.0.0.1:4000/auth"
    echo "  2. Click on the user"
    echo "  3. Look for 'ID Token' in the user details"
    echo "  4. Copy the token"
    exit 1
fi

echo "✓ Success!"
echo ""
echo "=========================================="
echo "ID Token:"
echo "=========================================="
echo "$ID_TOKEN"
echo ""
echo "=========================================="
echo ""
echo "To test the Experience API, run:"
echo "  ./test-experience-auth.sh '$ID_TOKEN'"
echo ""
echo "Or export it:"
echo "  export AUTH_TOKEN='$ID_TOKEN'"
echo "  curl -H \"Authorization: Bearer \$AUTH_TOKEN\" ..."
