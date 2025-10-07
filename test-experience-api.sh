#!/bin/bash

# Test script for Experience API endpoints on Firebase Emulator
# Usage: ./test-experience-api.sh

EMULATOR_URL="http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience"
BASE_PATH="/experience/entries"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Testing Experience API on Emulator"
echo "======================================"
echo ""

# Test 1: GET /experience/entries (public, should work)
echo -e "${YELLOW}Test 1: GET /experience/entries (public)${NC}"
echo "Expected: 200 OK with empty entries array"
RESPONSE=$(curl -s -X GET "${EMULATOR_URL}${BASE_PATH}")
echo "$RESPONSE" | python3 -m json.tool
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 2: POST without authentication (should fail)
echo -e "${YELLOW}Test 2: POST /experience/entries (no auth)${NC}"
echo "Expected: 401 Unauthorized"
RESPONSE=$(curl -s -X POST "${EMULATOR_URL}${BASE_PATH}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Entry","startDate":"2023-01"}')
echo "$RESPONSE" | python3 -m json.tool
ERROR=$(echo "$RESPONSE" | grep -o '"error":"UNAUTHORIZED"')
if [ -n "$ERROR" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 3: POST with invalid data (should fail validation)
echo -e "${YELLOW}Test 3: POST /experience/entries (invalid data - missing required fields)${NC}"
echo "Expected: 400 Validation Failed"
RESPONSE=$(curl -s -X POST "${EMULATOR_URL}${BASE_PATH}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"body":"Missing title and startDate"}')
echo "$RESPONSE" | python3 -m json.tool
ERROR=$(echo "$RESPONSE" | grep -o '"error":"VALIDATION_FAILED\|UNAUTHORIZED"')
if [ -n "$ERROR" ]; then
    echo -e "${GREEN}✓ PASS (rejected - auth or validation)${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 4: PUT without authentication (should fail)
echo -e "${YELLOW}Test 4: PUT /experience/entries/fake-id (no auth)${NC}"
echo "Expected: 401 Unauthorized"
RESPONSE=$(curl -s -X PUT "${EMULATOR_URL}${BASE_PATH}/fake-id" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}')
echo "$RESPONSE" | python3 -m json.tool
ERROR=$(echo "$RESPONSE" | grep -o '"error":"UNAUTHORIZED"')
if [ -n "$ERROR" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 5: DELETE without authentication (should fail)
echo -e "${YELLOW}Test 5: DELETE /experience/entries/fake-id (no auth)${NC}"
echo "Expected: 401 Unauthorized"
RESPONSE=$(curl -s -X DELETE "${EMULATOR_URL}${BASE_PATH}/fake-id")
echo "$RESPONSE" | python3 -m json.tool
ERROR=$(echo "$RESPONSE" | grep -o '"error":"UNAUTHORIZED"')
if [ -n "$ERROR" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 6: OPTIONS preflight (CORS)
echo -e "${YELLOW}Test 6: OPTIONS /experience/entries (CORS preflight)${NC}"
echo "Expected: 204 No Content"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${EMULATOR_URL}${BASE_PATH}" \
  -H "Origin: http://localhost:8000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "204" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 7: Invalid method (should fail)
echo -e "${YELLOW}Test 7: PATCH /experience/entries (method not allowed)${NC}"
echo "Expected: 405 Method Not Allowed"
RESPONSE=$(curl -s -X PATCH "${EMULATOR_URL}${BASE_PATH}")
echo "$RESPONSE" | python3 -m json.tool
ERROR=$(echo "$RESPONSE" | grep -o '"error":"METHOD_NOT_ALLOWED"')
if [ -n "$ERROR" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

echo "======================================"
echo "Testing Complete!"
echo "======================================"
echo ""
echo "To test authenticated endpoints:"
echo "1. Get a Firebase ID token from the Auth emulator UI at http://127.0.0.1:4000/auth"
echo "2. Use: curl -H 'Authorization: Bearer <token>' ..."
echo ""
echo "Note: Authenticated tests require .secret.local file with AUTHORIZED_EDITORS"
echo "File location: functions/.secret.local"
echo "Content: AUTHORIZED_EDITORS=contact@joshwentworth.com,jwentwor@gmail.com"
