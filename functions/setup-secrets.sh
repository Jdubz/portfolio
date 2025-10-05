#!/bin/bash

# Setup script for GCP Secret Manager secrets
# Run this script after authenticating with gcloud CLI
# Usage: ./setup-secrets.sh

set -e

PROJECT_ID="static-sites-257923"

echo "Setting up GCP Secret Manager secrets for project: $PROJECT_ID"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set the project
gcloud config set project $PROJECT_ID

echo "Creating secrets..."
echo ""

# Prompt for Mailgun API key
echo "Enter your Mailgun API key:"
read -r MAILGUN_API_KEY

# Create mailgun-api-key secret
echo "Creating mailgun-api-key..."
echo -n "$MAILGUN_API_KEY" | \
  gcloud secrets create mailgun-api-key \
    --data-file=- \
    --replication-policy="automatic" \
    || echo "Secret mailgun-api-key already exists, updating..."

if gcloud secrets describe mailgun-api-key &> /dev/null; then
  echo -n "$MAILGUN_API_KEY" | \
    gcloud secrets versions add mailgun-api-key --data-file=-
fi

# Create mailgun-domain secret
echo "Creating mailgun-domain..."
echo -n "joshwentworth.com" | \
  gcloud secrets create mailgun-domain \
    --data-file=- \
    --replication-policy="automatic" \
    || echo "Secret mailgun-domain already exists, updating..."

if gcloud secrets describe mailgun-domain &> /dev/null; then
  echo -n "joshwentworth.com" | \
    gcloud secrets versions add mailgun-domain --data-file=-
fi

# Create from-email secret
echo "Creating from-email..."
echo -n "noreply@joshwentworth.com" | \
  gcloud secrets create from-email \
    --data-file=- \
    --replication-policy="automatic" \
    || echo "Secret from-email already exists, updating..."

if gcloud secrets describe from-email &> /dev/null; then
  echo -n "noreply@joshwentworth.com" | \
    gcloud secrets versions add from-email --data-file=-
fi

# Create to-email secret
echo "Creating to-email..."
echo -n "contact-form@joshwentworth.com" | \
  gcloud secrets create to-email \
    --data-file=- \
    --replication-policy="automatic" \
    || echo "Secret to-email already exists, updating..."

if gcloud secrets describe to-email &> /dev/null; then
  echo -n "contact-form@joshwentworth.com" | \
    gcloud secrets versions add to-email --data-file=-
fi

# Create reply-to-email secret
echo "Creating reply-to-email..."
echo -n "hello@joshwentworth.com" | \
  gcloud secrets create reply-to-email \
    --data-file=- \
    --replication-policy="automatic" \
    || echo "Secret reply-to-email already exists, updating..."

if gcloud secrets describe reply-to-email &> /dev/null; then
  echo -n "hello@joshwentworth.com" | \
    gcloud secrets versions add reply-to-email --data-file=-
fi

echo ""
echo "✅ All secrets created successfully!"
echo ""
echo "To verify secrets were created, run:"
echo "  gcloud secrets list --project=$PROJECT_ID"
echo ""
echo "Grant Cloud Functions access to secrets:"
echo "  PROJECT_NUMBER=\$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')"
echo "  gcloud secrets add-iam-policy-binding mailgun-api-key --member=serviceAccount:\$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor"
echo "  gcloud secrets add-iam-policy-binding mailgun-domain --member=serviceAccount:\$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor"
echo "  gcloud secrets add-iam-policy-binding from-email --member=serviceAccount:\$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor"
echo "  gcloud secrets add-iam-policy-binding to-email --member=serviceAccount:\$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor"
echo "  gcloud secrets add-iam-policy-binding reply-to-email --member=serviceAccount:\$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role=roles/secretmanager.secretAccessor"
