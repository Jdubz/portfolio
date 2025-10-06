# Contact Form Cloud Function - Complete Setup

This document outlines the complete GCP Cloud Function implementation for handling portfolio contact form submissions.

## Architecture Overview

```
Frontend Contact Form
        ↓
   GCP Cloud Function
        ↓
   Email Service (configurable)
        ↓
   Email Notifications
```

## Features

### 🔐 Security & Validation

- **Input validation** using Joi schema
- **CORS protection** with whitelist of allowed origins
- **Honeypot spam detection** for bot prevention
- **Rate limiting headers** to prevent abuse
- **Request ID tracking** for debugging and monitoring

### 📧 Email Integration

- **Pluggable email service** architecture (ready for SendGrid, SES, etc.)
- **Notification emails** sent to site owner
- **Auto-reply emails** sent to form submitters
- **HTML and plain text** email templates
- **Local development** using Ethereal test accounts

### 🛠 Development Experience

- **TypeScript** with full type safety
- **Jest testing** with unit and integration tests
- **ESLint** configuration with TypeScript rules
- **Local development** with Functions Framework
- **Hot reload** development mode
- **Comprehensive logging** with GCP Cloud Logging

### 🚀 CI/CD Pipeline

- **GitHub Actions** workflows for automatic deployment
- **Environment-specific deployments** (staging/production)
- **Automated testing** before deployment
- **Integration testing** of deployed functions
- **Secret management** via Google Secret Manager

## File Structure

```
functions/contact-form/
├── src/
│   ├── index.ts                    # Main function entry point
│   ├── services/
│   │   ├── email.service.ts        # Email handling service
│   │   └── secret-manager.service.ts # GCP Secret Manager integration
│   └── __tests__/
│       └── index.test.ts           # Unit tests
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest test configuration
├── .eslintrc.js                    # ESLint rules
├── Makefile                        # Local development commands
├── README.md                       # Function documentation
├── .env.example                    # Environment variable template
└── .gitignore                      # Git ignore rules

.github/workflows/
└── deploy-contact-function.yml     # CI/CD pipeline
```

## Setup Instructions

### 1. Local Development Setup

```bash
# Navigate to function directory
cd functions/contact-form

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local

# Start function locally
npm start

# Test function (in another terminal)
make test-local
```

### 2. GCP Configuration

#### Create Secrets in Secret Manager

```bash
# SMTP Configuration (example with SendGrid)
echo -n "smtp.sendgrid.net" | gcloud secrets create smtp-host --data-file=-
echo -n "apikey" | gcloud secrets create smtp-user --data-file=-
echo -n "YOUR_SENDGRID_API_KEY" | gcloud secrets create smtp-password --data-file=-

# Email Addresses
echo -n "noreply@joshwentworth.com" | gcloud secrets create from-email --data-file=-
echo -n "your-email@example.com" | gcloud secrets create to-email --data-file=-
echo -n "hello@joshwentworth.com" | gcloud secrets create reply-to-email --data-file=-
```

#### Grant Function Access to Secrets

```bash
# Get the default compute service account
PROJECT_NUMBER=$(gcloud projects describe static-sites-257923 --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to all secrets
for secret in smtp-host smtp-user smtp-password from-email to-email reply-to-email; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository settings:

- `GCP_SA_KEY`: Service account key JSON for deployment

  ```bash
  # Create service account
  gcloud iam service-accounts create portfolio-deployer \
    --display-name="Portfolio CI/CD Deployer"

  # Grant necessary roles
  gcloud projects add-iam-policy-binding static-sites-257923 \
    --member="serviceAccount:portfolio-deployer@static-sites-257923.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.developer"

  # Create and download key
  gcloud iam service-accounts keys create key.json \
    --iam-account=portfolio-deployer@static-sites-257923.iam.gserviceaccount.com

  # Copy the contents of key.json to GCP_SA_KEY secret in GitHub
  ```

### 4. Frontend Integration

Update your contact form component:

```typescript
// Environment-based URL selection
const getFunctionUrl = () => {
  if (typeof window === "undefined") return "" // SSR

  const isProduction = window.location.hostname === "joshwentworth.com"
  return isProduction
    ? "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form"
    : "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging"
}

// Form submission
const handleSubmit = async (formData) => {
  const response = await fetch(getFunctionUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      message: formData.message,
      honeypot: "", // Important: empty honeypot for spam detection
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to send message")
  }

  return await response.json()
}
```

## Deployment

### Automatic Deployment

- **Staging**: Push to `staging` branch
- **Production**: Push to `main` branch

### Manual Deployment

```bash
# Staging
make deploy-staging

# Production
make deploy-production
```

## Monitoring & Debugging

### View Logs

```bash
# Function logs
gcloud functions logs read contact-form --region=us-central1

# Staging logs
gcloud functions logs read contact-form-staging --region=us-central1
```

### Test Deployed Functions

```bash
# Test staging
make test-staging

# Test production
make test-production
```

## Email Service Configuration

### SendGrid Setup (Recommended)

1. Create SendGrid account and get API key
2. Verify sender email address
3. Update secrets:
   ```bash
   echo -n "smtp.sendgrid.net" | gcloud secrets create smtp-host --data-file=-
   echo -n "apikey" | gcloud secrets create smtp-user --data-file=-
   echo -n "YOUR_API_KEY" | gcloud secrets create smtp-password --data-file=-
   ```

### AWS SES Setup

1. Verify domain in AWS SES
2. Create SMTP credentials
3. Update secrets:
   ```bash
   echo -n "email-smtp.us-east-1.amazonaws.com" | gcloud secrets create smtp-host --data-file=-
   echo -n "YOUR_SMTP_USERNAME" | gcloud secrets create smtp-user --data-file=-
   echo -n "YOUR_SMTP_PASSWORD" | gcloud secrets create smtp-password --data-file=-
   ```

### Other SMTP Services

The function supports any SMTP service. Update the secrets accordingly.

## Security Considerations

- **CORS**: Only allows requests from your domains
- **Input validation**: All fields validated and sanitized
- **Rate limiting**: Prevents abuse (implement at load balancer level)
- **Secrets**: All sensitive data stored in Secret Manager
- **Honeypot**: Catches most automated spam
- **Logging**: All requests logged for monitoring

## Cost Optimization

- **Memory allocation**: 256MB for staging, 512MB for production
- **Timeout**: 60 seconds (adjust based on email service latency)
- **Max instances**: 10 for staging, 50 for production
- **Cold starts**: Minimized with appropriate instance settings

## Troubleshooting

### Common Issues

1. **CORS errors**: Check allowed origins in function
2. **Email not sending**: Verify secrets and SMTP configuration
3. **Function timeout**: Increase timeout or optimize email service
4. **Deployment fails**: Check service account permissions

### Debug Commands

```bash
# Check function status
gcloud functions describe contact-form --region=us-central1

# View recent logs
gcloud functions logs read contact-form --limit=50 --region=us-central1

# Test with verbose output
curl -v -X POST https://us-central1-static-sites-257923.cloudfunctions.net/contact-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## Next Steps

1. **Choose email service** (SendGrid recommended)
2. **Configure secrets** with real SMTP credentials
3. **Test thoroughly** in staging environment
4. **Deploy to production** via CI/CD pipeline
5. **Monitor function** performance and logs
6. **Set up alerts** for errors and performance issues
