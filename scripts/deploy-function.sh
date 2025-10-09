#!/bin/bash
#
# Deploy Cloud Functions with proper build service account
#
# Usage: ./scripts/deploy-function.sh <function-name>
#
# This script ensures functions are deployed with the correct build service account,
# avoiding IAM permission issues that occur when using Firebase CLI directly.
#

set -e

FUNCTION_NAME=$1
PROJECT_ID="static-sites-257923"
REGION="us-central1"
BUILD_SERVICE_ACCOUNT="projects/${PROJECT_ID}/serviceAccounts/cloud-functions-builder@${PROJECT_ID}.iam.gserviceaccount.com"

if [ -z "$FUNCTION_NAME" ]; then
  echo "Error: Function name required"
  echo "Usage: $0 <function-name>"
  echo ""
  echo "Available functions:"
  cd functions/src
  grep -l "export const.*https.onRequest" *.ts | sed 's/\.ts$//' | sed 's/^index$/handleContactForm/' | sed 's/^/  - /'
  exit 1
fi

echo "Deploying function: $FUNCTION_NAME"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Deploy using gcloud with build service account
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime=nodejs20 \
  --region="$REGION" \
  --source=functions \
  --entry-point="$FUNCTION_NAME" \
  --trigger-http \
  --build-service-account="$BUILD_SERVICE_ACCOUNT" \
  --project="$PROJECT_ID"

echo ""
echo "✅ Function deployed successfully!"
echo "URL: https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${FUNCTION_NAME}"
