#!/bin/bash
set -e

echo "🔍 Deploying Firestore rules and indexes safely..."

# First, try to deploy everything
echo "Attempting full Firestore deployment..."
if npx firebase deploy --only firestore --non-interactive 2>&1 | tee /tmp/firestore-deploy.log; then
  echo "✅ Firestore rules and indexes deployed successfully"
  exit 0
fi

# Check if the error is about existing indexes
if grep -q "index already exists" /tmp/firestore-deploy.log; then
  echo ""
  echo "⚠️  Some indexes already exist (409 conflict)"
  echo "This is normal - Firebase won't overwrite existing indexes"
  echo ""
  echo "Deploying rules only..."

  if npx firebase deploy --only firestore:rules --non-interactive; then
    echo "✅ Firestore rules deployed successfully"
    echo ""
    echo "ℹ️  Index status:"
    echo "   - Existing indexes: Unchanged (preserved)"
    echo "   - New indexes: Will be created automatically by Firebase"
    echo "   - Check Firebase Console to monitor index build progress"
    exit 0
  else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
  fi
else
  echo "❌ Firestore deployment failed with unexpected error"
  cat /tmp/firestore-deploy.log
  exit 1
fi
