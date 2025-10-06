# Contact Form Cloud Function

A serverless Cloud Function for handling contact form submissions on the portfolio website.

## Features

- ✅ Input validation with Joi schema
- ✅ Bot detection via honeypot field
- ✅ Email notifications via Mailgun
- ✅ Auto-reply emails to users
- ✅ Contact submission storage in Firestore
- ✅ Comprehensive logging and error handling
- ✅ CORS support for frontend integration
- ✅ TypeScript for type safety
- ✅ Secret management via GCP Secret Manager

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Email Service**: Mailgun
- **Database**: Google Cloud Firestore
- **Secrets**: GCP Secret Manager
- **Validation**: Joi
- **Framework**: Google Cloud Functions (Gen 2)

## Project Structure

```
functions/
├── src/
│   ├── index.ts                      # Main function handler
│   └── services/
│       ├── email.service.ts          # Mailgun email service
│       ├── firestore.service.ts      # Firestore database service
│       └── secret-manager.service.ts # GCP Secret Manager service
├── .env.local                        # Local environment variables (gitignored)
├── .env.example                      # Example environment variables
├── setup-secrets.sh                  # Script to create GCP secrets
├── package.json                      # Dependencies and scripts
└── tsconfig.json                     # TypeScript configuration
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Cloud SDK (for deployment)
- Mailgun account

### Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Mailgun credentials
   ```

3. Build TypeScript:
   ```bash
   npm run build
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The function will be available at: `http://localhost:8080`

### Testing Locally

Test with curl:

```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message."
  }'
```

### Running Tests

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Linting

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment

1. Set up GCP secrets:
   ```bash
   ./setup-secrets.sh
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

3. View logs:
   ```bash
   npm run logs
   ```

### Deployment Environments

- **Production**: `npm run deploy`
  - Function name: `handleContactForm`
  - Max instances: 10

- **Staging**: `npm run deploy:staging`
  - Function name: `handleContactForm-staging`
  - Max instances: 5

## Environment Variables

### Local Development (.env.local)

```bash
NODE_ENV=development
FUNCTIONS_EMULATOR=true
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
FROM_EMAIL=noreply@your-domain.com
TO_EMAIL=your-email@example.com
REPLY_TO_EMAIL=hello@your-domain.com
GCP_PROJECT=static-sites-257923
```

### Production (GCP Secret Manager)

All sensitive credentials are stored in GCP Secret Manager:
- `mailgun-api-key`
- `mailgun-domain`
- `from-email`
- `to-email`
- `reply-to-email`

## API Reference

### POST /

Submit a contact form.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to discuss a project."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "requestId": "req_1234567890_abc123"
}
```

**Error Response (400):**

```json
{
  "error": "Validation Error",
  "message": "\"email\" must be a valid email",
  "requestId": "req_1234567890_abc123"
}
```

**Error Response (500):**

```json
{
  "error": "Service Error",
  "message": "Failed to process your message. Please try again later.",
  "requestId": "req_1234567890_abc123"
}
```

## Firestore Schema

### Collection: `contact-submissions`

```typescript
{
  name: string
  email: string
  message: string
  metadata: {
    ip?: string
    userAgent?: string
    timestamp: string
    referrer?: string
  }
  requestId: string
  status: "new" | "read" | "replied" | "spam"
  createdAt: Date
  updatedAt: Date
}
```

## Email Templates

The function sends two types of emails:

1. **Notification Email**: Sent to `TO_EMAIL` with the contact form details
2. **Auto-Reply Email**: Sent to the user confirming receipt of their message

Both emails are sent in HTML and plain text formats.

## Security

- ✅ Input validation and sanitization
- ✅ Bot detection via honeypot field
- ✅ CORS restrictions to allowed origins
- ✅ Secrets managed via GCP Secret Manager
- ✅ XSS protection in email templates
- ✅ Rate limiting headers (informational)

### CORS Allowed Origins

- `https://joshwentworth.com`
- `https://staging.joshwentworth.com`
- `http://localhost:8000`
- `http://localhost:3000`

To add more origins, edit the `corsOptions` in [src/index.ts](./src/index.ts).

## Monitoring

View function logs in Google Cloud Console:
- [Cloud Functions Logs](https://console.cloud.google.com/functions)
- [Cloud Logging](https://console.cloud.google.com/logs)

Or via CLI:

```bash
npm run logs
```

## Troubleshooting

### Function returns 500 error

Check the logs:
```bash
npm run logs
```

Common issues:
- Mailgun API key is incorrect or expired
- Secrets not accessible by the service account
- Firestore not initialized
- CORS origin not in allowlist

### Emails not being sent

1. Verify Mailgun domain is verified
2. Check DNS records (SPF, DKIM)
3. Review function logs for Mailgun errors
4. Test Mailgun credentials directly via API

### Firestore errors

1. Ensure Firestore is initialized in Native Mode
2. Check IAM permissions for Cloud Functions service account
3. Verify network connectivity

## License

MIT
