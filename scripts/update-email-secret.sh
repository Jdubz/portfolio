#!/bin/bash

# Script to update the to-email secret in Google Cloud Secret Manager
# Usage: ./scripts/update-email-secret.sh <new-email-address>

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NEW_EMAIL=$1

if [ -z "$NEW_EMAIL" ]; then
  echo -e "${RED}Error: Email address required${NC}"
  echo "Usage: $0 <new-email-address>"
  echo "Example: $0 cicd@joshwentworth.com"
  exit 1
fi

# Validate email format
if ! echo "$NEW_EMAIL" | grep -E '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' > /dev/null; then
  echo -e "${RED}Error: Invalid email format${NC}"
  exit 1
fi

PROJECT_ID="static-sites-257923"

echo -e "${GREEN}=== Updating to-email Secret ===${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI not installed${NC}"
  echo "Install from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Show current value
echo -e "${YELLOW}Current value:${NC}"
gcloud secrets versions access latest --secret=to-email --project=$PROJECT_ID 2>/dev/null || echo "Could not read current value"
echo ""

# Confirm update
echo -e "${YELLOW}New value will be:${NC} $NEW_EMAIL"
read -p "Continue? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
  echo "Aborted"
  exit 0
fi

# Update secret
echo -e "\n${GREEN}Updating secret...${NC}"
echo -n "$NEW_EMAIL" | gcloud secrets versions add to-email \
  --project=$PROJECT_ID \
  --data-file=-

echo -e "${GREEN}✓ Secret updated successfully${NC}\n"

# Verify
echo -e "${YELLOW}New value:${NC}"
gcloud secrets versions access latest --secret=to-email --project=$PROJECT_ID

echo -e "\n${GREEN}=== Next Steps ===${NC}"
echo "1. Redeploy Cloud Functions to pick up the new secret:"
echo "   cd functions && make deploy-staging"
echo "   cd functions && make deploy-production"
echo ""
echo "2. Or wait for next GitHub Actions deployment (automatic)"
echo ""
echo "Note: Cloud Functions cache secret values, so redeploy is required."
