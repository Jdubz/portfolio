# Contact Form Cloud Function

## Local Development

1. Install dependencies:

```bash
cd functions/contact-form
npm install
```

2. Create local environment file:

```bash
cp .env.example .env.local
```

3. Run function locally:

```bash
npm start
```

4. Test the function:

```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from local development."
  }'
```

## Environment Variables

### Local Development (.env.local)

```
NODE_ENV=development
FROM_EMAIL=noreply@localhost
TO_EMAIL=your-email@example.com
REPLY_TO_EMAIL=hello@localhost
```

### Google Cloud Secrets (Production/Staging)

The following secrets should be created in Google Secret Manager:

- `smtp-host` - SMTP server hostname (e.g., smtp.sendgrid.net)
- `smtp-user` - SMTP username
- `smtp-password` - SMTP password/API key
- `from-email` - From email address (e.g., noreply@joshwentworth.com)
- `to-email` - Your email address to receive notifications
- `reply-to-email` - Reply-to address (e.g., hello@joshwentworth.com)

Create secrets using:

```bash
echo -n "your-smtp-host" | gcloud secrets create smtp-host --data-file=-
echo -n "your-smtp-user" | gcloud secrets create smtp-user --data-file=-
echo -n "your-smtp-password" | gcloud secrets create smtp-password --data-file=-
echo -n "noreply@joshwentworth.com" | gcloud secrets create from-email --data-file=-
echo -n "your-email@example.com" | gcloud secrets create to-email --data-file=-
echo -n "hello@joshwentworth.com" | gcloud secrets create reply-to-email --data-file=-
```

## Deployment

### Automatic Deployment via GitHub Actions

- Push to `staging` branch → deploys to staging environment
- Push to `main` branch → deploys to production environment

### Manual Deployment

```bash
# Build function
npm run build

# Deploy to staging
gcloud functions deploy contact-form-staging \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=handleContactForm \
  --trigger=http \
  --allow-unauthenticated \
  --memory=256Mi \
  --timeout=60s \
  --set-env-vars="NODE_ENV=staging,ENVIRONMENT=staging"

# Deploy to production
gcloud functions deploy contact-form \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=handleContactForm \
  --trigger=http \
  --allow-unauthenticated \
  --memory=512Mi \
  --timeout=60s \
  --set-env-vars="NODE_ENV=production,ENVIRONMENT=production"
```

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run linting:

```bash
npm run lint
npm run lint:fix
```

## Function URLs

### Staging

`https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging`

### Production

`https://us-central1-static-sites-257923.cloudfunctions.net/contact-form`

## Integration with Frontend

Update your contact form to POST to the appropriate function URL:

```typescript
const response = await fetch("https://us-central1-static-sites-257923.cloudfunctions.net/contact-form", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: formData.name,
    email: formData.email,
    message: formData.message,
    honeypot: "", // Add honeypot field for spam detection
  }),
})

if (!response.ok) {
  throw new Error("Failed to send message")
}

const result = await response.json()
console.log("Success:", result.message)
```
