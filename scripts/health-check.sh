#!/bin/bash
#
# Health Check Script for Cloud Functions
#
# Checks the health of all deployed Cloud Functions (production and staging).
# Each function should respond with HTTP 200 and a JSON response indicating health status.
#
# Usage:
#   ./scripts/health-check.sh              # Check all functions
#   ./scripts/health-check.sh production   # Check only production functions
#   ./scripts/health-check.sh staging      # Check only staging functions
#   ./scripts/health-check.sh local        # Check local emulators
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="static-sites-257923"
REGION="us-central1"

# Determine which environment to check
ENVIRONMENT="${1:-all}"

# Function to check health endpoint
check_health() {
  local name=$1
  local url=$2
  local timeout=10

  echo -n "Checking $name... "

  # Make request with timeout
  response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" "$url" 2>&1)
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)

  # Check HTTP status code
  if [ "$http_code" = "200" ]; then
    # Parse JSON response
    service=$(echo "$body" | jq -r '.service' 2>/dev/null || echo "unknown")
    status=$(echo "$body" | jq -r '.status' 2>/dev/null || echo "unknown")
    timestamp=$(echo "$body" | jq -r '.timestamp' 2>/dev/null || echo "unknown")

    if [ "$status" = "healthy" ]; then
      echo -e "${GREEN}✓ HEALTHY${NC} (service: $service, time: $timestamp)"
      return 0
    else
      echo -e "${YELLOW}⚠ UNHEALTHY${NC} (status: $status)"
      return 1
    fi
  elif [ "$http_code" = "000" ]; then
    echo -e "${RED}✗ TIMEOUT${NC} (no response after ${timeout}s)"
    return 1
  else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    if [ -n "$body" ]; then
      echo "  Response: $body" | head -c 200
    fi
    return 1
  fi
}

# Track failures
failures=0
total=0

echo "=================================================="
echo "Cloud Functions Health Check"
echo "Environment: $ENVIRONMENT"
echo "=================================================="
echo ""

# Check local emulators
if [ "$ENVIRONMENT" = "local" ] || [ "$ENVIRONMENT" = "all" ]; then
  echo "--- Local Emulators ---"

  if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    check_health "contact-form (local)" "http://localhost:5001/$PROJECT_ID/$REGION/contact-form/health" || ((failures++))
    ((total++))

    check_health "manageExperience (local)" "http://localhost:5001/$PROJECT_ID/$REGION/manageExperience/health" || ((failures++))
    ((total++))

    check_health "manageGenerator (local)" "http://localhost:5001/$PROJECT_ID/$REGION/manageGenerator/health" || ((failures++))
    ((total++))
  else
    echo -e "${YELLOW}⚠ Emulator not running (port 5001 not listening)${NC}"
  fi

  echo ""
fi

# Check staging functions
if [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "all" ]; then
  echo "--- Staging Functions ---"

  check_health "contact-form-staging" "https://$REGION-$PROJECT_ID.cloudfunctions.net/contact-form-staging/health" || ((failures++))
  ((total++))

  check_health "manageExperience-staging" "https://$REGION-$PROJECT_ID.cloudfunctions.net/manageExperience-staging/health" || ((failures++))
  ((total++))

  check_health "manageGenerator-staging" "https://$REGION-$PROJECT_ID.cloudfunctions.net/manageGenerator-staging/health" || ((failures++))
  ((total++))

  echo ""
fi

# Check production functions
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "all" ]; then
  echo "--- Production Functions ---"

  check_health "contact-form" "https://$REGION-$PROJECT_ID.cloudfunctions.net/contact-form/health" || ((failures++))
  ((total++))

  check_health "manageExperience" "https://$REGION-$PROJECT_ID.cloudfunctions.net/manageExperience/health" || ((failures++))
  ((total++))

  # Note: manageGenerator production not yet deployed
  # check_health "manageGenerator" "https://$REGION-$PROJECT_ID.cloudfunctions.net/manageGenerator/health" || ((failures++))
  # ((total++))

  echo ""
fi

# Summary
echo "=================================================="
if [ $failures -eq 0 ]; then
  echo -e "${GREEN}✓ All $total functions are healthy${NC}"
  exit 0
else
  echo -e "${RED}✗ $failures of $total functions failed health check${NC}"
  exit 1
fi
