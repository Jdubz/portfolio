#!/bin/bash
#
# Deploy Cloud Functions with proper build service account
#
# DEPRECATED: Use Makefile instead
#   make deploy-function FUNC=<function-name>
#
# This script is kept for backward compatibility.
# All new deployments should use the Makefile command.
#

set -e

FUNCTION_NAME=$1

if [ -z "$FUNCTION_NAME" ]; then
  echo "Error: Function name required"
  echo ""
  echo "RECOMMENDED: Use Makefile command"
  echo "  make deploy-function FUNC=<function-name>"
  echo ""
  echo "Legacy usage: $0 <function-name>"
  echo ""
  echo "Available functions:"
  echo "  - uploadResume"
  echo "  - manageExperience"
  echo "  - handleContactForm"
  exit 1
fi

echo "⚠️  This script is deprecated. Use 'make deploy-function FUNC=$FUNCTION_NAME' instead."
echo ""
echo "Deploying function: $FUNCTION_NAME"
echo ""

# Call Makefile target
make deploy-function FUNC="$FUNCTION_NAME"
