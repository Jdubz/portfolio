#!/bin/bash

# Test script for contact form function
# Usage: ./test-contact-form.sh [emulator|staging|production]

set -e

ENVIRONMENT=${1:-emulator}

case $ENVIRONMENT in
  emulator)
    URL="http://localhost:5001/static-sites-257923/us-central1/handleContactForm"
    echo "Testing contact form on EMULATOR..."
    ;;
  staging)
    URL="https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm-staging"
    echo "Testing contact form on STAGING..."
    ;;
  production)
    URL="https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm"
    echo "Testing contact form on PRODUCTION..."
    ;;
  *)
    echo "Usage: $0 [emulator|staging|production]"
    exit 1
    ;;
esac

echo "URL: $URL"
echo ""

# Test 1: Valid submission
echo "Test 1: Valid contact form submission"
echo "======================================"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the test script"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Test 1 PASSED"
else
  echo "❌ Test 1 FAILED - Expected 200, got $HTTP_CODE"
fi

echo ""

# Test 2: Invalid email
echo "Test 2: Invalid email validation"
echo "================================="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "message": "This should fail"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Test 2 PASSED"
else
  echo "❌ Test 2 FAILED - Expected 400, got $HTTP_CODE"
fi

echo ""

# Test 3: Missing required field
echo "Test 3: Missing required field"
echo "==============================="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "400" ]; then
  echo "✅ Test 3 PASSED"
else
  echo "❌ Test 3 FAILED - Expected 400, got $HTTP_CODE"
fi

echo ""

# Test 4: Honeypot (bot detection)
echo "Test 4: Honeypot bot detection"
echo "==============================="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bot User",
    "email": "bot@example.com",
    "message": "I am a bot",
    "honeypot": "filled by bot"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response: $BODY"
echo "HTTP Code: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q "success"; then
    echo "✅ Test 4 PASSED (Bot gets success response to hide honeypot)"
  else
    echo "❌ Test 4 FAILED - Expected success response"
  fi
else
  echo "❌ Test 4 FAILED - Expected 200, got $HTTP_CODE"
fi

echo ""
echo "All tests complete!"
