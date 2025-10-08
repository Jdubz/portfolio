#!/bin/bash
# Save current emulator data (users, firestore) to ./emulator-data
# This persists data across emulator restarts

set -e

PROJECT_ID="static-sites-257923"
EXPORT_DIR="./emulator-data"

echo "📦 Saving Firebase emulator data..."
echo ""

# Create export directory if it doesn't exist
mkdir -p "$EXPORT_DIR"

# Export Auth data
echo "🔐 Exporting Auth users..."
curl -s "http://localhost:9099/emulator/v1/projects/$PROJECT_ID/accounts/export" \
  -H "Content-Type: application/json" \
  -o "$EXPORT_DIR/auth_export.json"

if [ $? -eq 0 ]; then
  USER_COUNT=$(jq -r '.users | length // 0' "$EXPORT_DIR/auth_export.json" 2>/dev/null || echo "0")
  echo "✅ Saved $USER_COUNT users"
else
  echo "❌ Failed to export Auth data"
fi

# Export Firestore data
echo ""
echo "📄 Exporting Firestore data..."
curl -s -X POST "http://localhost:8080/emulator/v1/projects/$PROJECT_ID:export" \
  -H "Content-Type: application/json" \
  -d "{\"outputUriPrefix\": \"file://$PWD/$EXPORT_DIR\"}"

if [ $? -eq 0 ]; then
  echo "✅ Firestore data saved"
else
  echo "❌ Failed to export Firestore data"
fi

echo ""
echo "✨ Emulator data saved to: $EXPORT_DIR"
echo ""
echo "📝 This data will be automatically loaded when emulators restart"
echo "   (configured in firebase.json)"
