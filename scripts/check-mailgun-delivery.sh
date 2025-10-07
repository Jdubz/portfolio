#!/bin/bash

# Script to check Mailgun delivery logs for debugging
# Usage: ./scripts/check-mailgun-delivery.sh [requestId]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if mailgun credentials are set
if [ -z "$MAILGUN_API_KEY" ]; then
  echo -e "${RED}Error: MAILGUN_API_KEY not set${NC}"
  echo "Run: export MAILGUN_API_KEY='your-api-key'"
  exit 1
fi

if [ -z "$MAILGUN_DOMAIN" ]; then
  MAILGUN_DOMAIN="joshwentworth.com"
  echo -e "${YELLOW}Using default domain: $MAILGUN_DOMAIN${NC}"
fi

REQUEST_ID=$1

echo -e "${GREEN}=== Mailgun Delivery Check ===${NC}\n"

# Function to check events
check_events() {
  local filter=$1
  local title=$2

  echo -e "${YELLOW}$title${NC}"
  curl -s --user "api:$MAILGUN_API_KEY" \
    "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/events?$filter&limit=20" \
    | jq -r '.items[] | "\(.timestamp | strftime("%Y-%m-%d %H:%M:%S")) [\(.event)] \(.message.headers["subject"] // "No subject") - \(.recipient) - \(.delivery-status.message // .reason // "No details")"'
  echo ""
}

if [ -n "$REQUEST_ID" ]; then
  echo -e "${GREEN}Filtering by Request ID: $REQUEST_ID${NC}\n"

  # Check for messages with this request ID
  echo -e "${YELLOW}Looking for messages with Request ID in headers...${NC}"
  curl -s --user "api:$MAILGUN_API_KEY" \
    "https://api.mailgun.net/v3/$MAILGUN_DOMAIN/events?limit=100" \
    | jq -r --arg rid "$REQUEST_ID" '.items[] | select(.message.headers["x-request-id"] == $rid) | "\(.timestamp | strftime("%Y-%m-%d %H:%M:%S")) [\(.event)] \(.message.headers.subject) - \(.recipient) - \(.delivery-status.message // .reason // "No details")"'
  echo ""
else
  # Recent failed deliveries
  check_events "event=failed" "Recent Failed Deliveries:"

  # Recent rejected messages
  check_events "event=rejected" "Recent Rejected Messages:"

  # Recent bounces
  check_events "event=bounced" "Recent Bounces:"

  # Recent accepted (pending delivery)
  check_events "event=accepted" "Recent Accepted (Pending Delivery):"

  # Recent delivered
  check_events "event=delivered&limit=5" "Recent Delivered (Last 5):"
fi

# Check domain verification status
echo -e "${YELLOW}Domain Verification Status:${NC}"
curl -s --user "api:$MAILGUN_API_KEY" \
  "https://api.mailgun.net/v3/domains/$MAILGUN_DOMAIN" \
  | jq -r '"Domain: \(.domain.name)\nState: \(.domain.state)\nSPF: \(.sending_dns_records[] | select(.record_type == "TXT" and (.name | contains("spf"))) | .valid)\nDKIM: \(.sending_dns_records[] | select(.record_type == "TXT" and (.name | contains("._domainkey"))) | .valid)\nTracking CNAME: \(.tracking_dns_records[0].valid // "N/A")"'

echo -e "\n${GREEN}=== Recommendations ===${NC}"
echo "1. If emails are 'accepted' but not 'delivered', check spam folders"
echo "2. Verify SPF and DKIM records are valid above"
echo "3. Check Mailgun logs dashboard: https://app.mailgun.com/app/logs"
echo "4. For specific message, use: $0 <requestId>"
echo "5. Check recipient email provider logs (Gmail, Outlook, etc.)"
