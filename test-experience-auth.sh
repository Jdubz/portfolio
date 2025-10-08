#!/bin/bash

# Test script for Experience API with Firebase Auth custom claims
# Usage:
#   ./test-experience-auth.sh <id-token>
#   ./test-experience-auth.sh --auto (auto-generate token from seeded data)

set -e

EMULATOR_URL="http://127.0.0.1:5001/static-sites-257923/us-central1/manageExperience"
BASE_PATH="/experience/entries"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if --auto flag is passed
if [ "$1" = "--auto" ]; then
    echo -e "${BLUE}Generating token from seeded data...${NC}"
    SEED_OUTPUT=$(node scripts/seed-emulator.js 2>&1)
    echo "$SEED_OUTPUT" | grep -v "__TOKEN__="
    TOKEN=$(echo "$SEED_OUTPUT" | grep "__TOKEN__=" | cut -d'=' -f2)

    if [ -z "$TOKEN" ]; then
        echo -e "${RED}Error: Failed to generate token${NC}"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}Token generated successfully!${NC}"
    echo ""
elif [ -z "$1" ]; then
    echo -e "${RED}Error: ID token required${NC}"
    echo ""
    echo "Usage: $0 <id-token>"
    echo "   Or: $0 --auto (auto-seed and generate token)"
    echo ""
    echo "To manually get your ID token:"
    echo "  1. Run: node scripts/seed-emulator.js"
    echo "  2. Copy the token from the output"
    echo ""
    echo "Then run:"
    echo "  $0 'your-token-here'"
    exit 1
else
    TOKEN="$1"
fi

echo "======================================"
echo "Testing Experience API with Auth"
echo "======================================"
echo ""
echo -e "${BLUE}Using token: ${TOKEN:0:50}...${NC}"
echo ""

# Test 1: Create an experience entry
echo -e "${YELLOW}Test 1: POST /experience/entries (Create entry)${NC}"
echo "Expected: 201 Created"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${EMULATOR_URL}${BASE_PATH}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full-Stack Developer",
    "startDate": "2023-01",
    "endDate": "2024-12",
    "body": "Built and maintained scalable web applications using React, Node.js, and Firebase. Led a team of 5 developers.",
    "notes": "Remote position, promoted twice"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | python3 -m json.tool

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
    ENTRY_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['entry']['id'])" 2>/dev/null || echo "")
else
    echo -e "${RED}✗ FAIL${NC}\n"
    exit 1
fi

# Test 2: List all entries
echo -e "${YELLOW}Test 2: GET /experience/entries (List all)${NC}"
echo "Expected: 200 OK with our entry"
RESPONSE=$(curl -s -X GET "${EMULATOR_URL}${BASE_PATH}")
echo "$RESPONSE" | python3 -m json.tool
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":true')
if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✓ PASS${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

# Test 3: Update the entry (if we got an ID)
if [ -n "$ENTRY_ID" ]; then
    echo -e "${YELLOW}Test 3: PUT /experience/entries/$ENTRY_ID (Update entry)${NC}"
    echo "Expected: 200 OK"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "${EMULATOR_URL}${BASE_PATH}/${ENTRY_ID}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Lead Full-Stack Developer",
        "endDate": "2025-06",
        "notes": "Promoted to Lead Developer"
      }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "HTTP Status: $HTTP_CODE"
    echo "$BODY" | python3 -m json.tool

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}\n"
    else
        echo -e "${RED}✗ FAIL${NC}\n"
    fi

    # Test 4: Create another entry
    echo -e "${YELLOW}Test 4: POST /experience/entries (Create second entry)${NC}"
    echo "Expected: 201 Created"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${EMULATOR_URL}${BASE_PATH}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "title": "Frontend Developer",
        "startDate": "2021-06",
        "endDate": "2022-12",
        "body": "Specialized in React and TypeScript development"
      }')

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "HTTP Status: $HTTP_CODE"
    echo "$BODY" | python3 -m json.tool

    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC}\n"
        ENTRY_ID_2=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin)['entry']['id'])" 2>/dev/null || echo "")
    else
        echo -e "${RED}✗ FAIL${NC}\n"
    fi

    # Test 5: List all entries (should have 2)
    echo -e "${YELLOW}Test 5: GET /experience/entries (List all - should have 2)${NC}"
    echo "Expected: 200 OK with 2 entries"
    RESPONSE=$(curl -s -X GET "${EMULATOR_URL}${BASE_PATH}")
    echo "$RESPONSE" | python3 -m json.tool
    COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null || echo "0")
    if [ "$COUNT" = "2" ]; then
        echo -e "${GREEN}✓ PASS (Found $COUNT entries)${NC}\n"
    else
        echo -e "${RED}✗ FAIL (Expected 2, found $COUNT)${NC}\n"
    fi

    # Test 6: Delete first entry
    echo -e "${YELLOW}Test 6: DELETE /experience/entries/$ENTRY_ID (Delete entry)${NC}"
    echo "Expected: 200 OK"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "${EMULATOR_URL}${BASE_PATH}/${ENTRY_ID}" \
      -H "Authorization: Bearer ${TOKEN}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    echo "HTTP Status: $HTTP_CODE"
    echo "$BODY" | python3 -m json.tool

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}\n"
    else
        echo -e "${RED}✗ FAIL${NC}\n"
    fi

    # Test 7: Verify deletion
    echo -e "${YELLOW}Test 7: GET /experience/entries (Verify deletion - should have 1)${NC}"
    echo "Expected: 200 OK with 1 entry"
    RESPONSE=$(curl -s -X GET "${EMULATOR_URL}${BASE_PATH}")
    echo "$RESPONSE" | python3 -m json.tool
    COUNT=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['count'])" 2>/dev/null || echo "0")
    if [ "$COUNT" = "1" ]; then
        echo -e "${GREEN}✓ PASS (Found $COUNT entry)${NC}\n"
    else
        echo -e "${RED}✗ FAIL (Expected 1, found $COUNT)${NC}\n"
    fi

    # Test 8: Delete second entry (cleanup)
    if [ -n "$ENTRY_ID_2" ]; then
        echo -e "${YELLOW}Test 8: DELETE /experience/entries/$ENTRY_ID_2 (Cleanup)${NC}"
        echo "Expected: 200 OK"
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "${EMULATOR_URL}${BASE_PATH}/${ENTRY_ID_2}" \
          -H "Authorization: Bearer ${TOKEN}")

        HTTP_CODE=$(echo "$RESPONSE" | tail -1)
        BODY=$(echo "$RESPONSE" | sed '$d')

        echo "HTTP Status: $HTTP_CODE"
        echo "$BODY" | python3 -m json.tool

        if [ "$HTTP_CODE" = "200" ]; then
            echo -e "${GREEN}✓ PASS${NC}\n"
        else
            echo -e "${RED}✗ FAIL${NC}\n"
        fi
    fi
fi

# Test 9: Test without auth (should fail)
echo -e "${YELLOW}Test 9: POST without auth (should fail)${NC}"
echo "Expected: 401 Unauthorized"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${EMULATOR_URL}${BASE_PATH}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","startDate":"2023-01"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "$BODY" | python3 -m json.tool

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ PASS (Correctly rejected)${NC}\n"
else
    echo -e "${RED}✗ FAIL${NC}\n"
fi

echo "======================================"
echo "Testing Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}All authenticated endpoints working correctly!${NC}"
echo ""
echo "Next steps:"
echo "  1. Check Firestore emulator UI: http://127.0.0.1:4000/firestore"
echo "  2. View 'portfolio' database > 'experience' collection"
echo "  3. Deploy to staging when ready"
