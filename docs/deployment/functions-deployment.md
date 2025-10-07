# Contact Form Cloud Function - Deployment Guide

This guide covers deploying the contact form Cloud Function to Google Cloud Platform.

## Prerequisites

1. Google Cloud SDK (`gcloud`) installed and authenticated
2. Project ID: `static-sites-257923`
3. Mailgun account with verified domain

## 1. Set Up GCP Secrets

Run the setup script to create all required secrets:

```bash
cd functions
./setup-secrets.sh
```

This creates the following secrets in GCP Secret Manager:
- `mailgun-api-key`: Your Mailgun API key
- `mailgun-domain`: Your Mailgun sending domain (joshwentworth.com)
- `from-email`: Sender email address (noreply@joshwentworth.com)
- `to-email`: Recipient email address (cicd@joshwentworth.com) - for automated CI/CD notifications
- `reply-to-email`: Reply-to email address (hello@joshwentworth.com)

## 2. Grant Cloud Functions Access to Secrets

Get your project number and grant the Cloud Functions service account access:

```bash
PROJECT_NUMBER=$(gcloud projects describe static-sites-257923 --format='value(projectNumber)')

# Grant access to all secrets
for SECRET in mailgun-api-key mailgun-domain from-email to-email reply-to-email; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

## 3. Enable Required APIs

```bash
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 4. Initialize Firestore

If you haven't already, initialize Firestore in your project:

1. Go to [Google Cloud Console - Firestore](https://console.cloud.google.com/firestore)
2. Select "Native Mode"
3. Choose a location (e.g., `us-central`)
4. Click "Create Database"

## 5. Deploy the Cloud Function

From the `functions` directory:

```bash
npm run build
npm run deploy
```

Or manually:

```bash
gcloud functions deploy handleContactForm \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=handleContactForm \
  --trigger-http \
  --allow-unauthenticated \
  --max-instances=10 \
  --memory=256MB \
  --timeout=60s \
  --set-secrets='MAILGUN_API_KEY=mailgun-api-key:latest,MAILGUN_DOMAIN=mailgun-domain:latest,FROM_EMAIL=from-email:latest,TO_EMAIL=to-email:latest,REPLY_TO_EMAIL=reply-to-email:latest'
```

## 6. Configure Frontend Environment Variables

The function URL will be displayed after deployment. Set it in your build environment:

For production builds (Firebase Hosting, Netlify, etc.):
```bash
GATSBY_CONTACT_FUNCTION_URL=https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm
```

For local development (.env.development):
```bash
# Use deployed function URL for testing
GATSBY_CONTACT_FUNCTION_URL=https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm
```

## 7. Test the Deployment

Test the Cloud Function directly:

```bash
curl -X POST https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the deployment guide."
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "requestId": "req_..."
}
```

## 8. Verify Firestore Storage

Check Firestore to confirm the submission was saved:

```bash
gcloud firestore documents list contact-submissions --limit=1
```

Or view in the [Firestore Console](https://console.cloud.google.com/firestore/data).

## 9. Check Logs

View function logs:

```bash
gcloud functions logs read handleContactForm --region=us-central1 --limit=50
```

## Local Development

For local testing with the Functions Emulator:

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Start the emulator:
   ```bash
   firebase emulators:start --only functions
   ```

3. Update `.env.development`:
   ```bash
   GATSBY_CONTACT_FUNCTION_URL=http://localhost:5001/static-sites-257923/us-central1/handleContactForm
   ```

## Troubleshooting

### Emails not sending
- Verify Mailgun domain is verified in Mailgun dashboard
- Check DNS records (SPF, DKIM) are properly configured
- Review function logs for error messages
- Verify secrets are accessible to the function

### Firestore errors
- Ensure Firestore is initialized in Native Mode
- Check IAM permissions for the Cloud Functions service account
- Verify the collection name is "contact-submissions"

### CORS errors
- Check that your domain is in the CORS allowlist in `index.ts`
- Add additional domains if needed for staging/development environments

## Security Notes

- Never commit `.env.local` or `.env.production` files
- Rotate Mailgun API key if accidentally exposed
- Review Firestore security rules to protect contact submissions
- Consider adding rate limiting at the Cloud Function level
- Monitor for abuse via Cloud Logging

## Monitoring

Set up monitoring alerts for:
- Function execution errors
- High invocation rates (potential abuse)
- Firestore write failures
- Email sending failures

Use [Google Cloud Monitoring](https://console.cloud.google.com/monitoring) to create dashboards and alerts.
