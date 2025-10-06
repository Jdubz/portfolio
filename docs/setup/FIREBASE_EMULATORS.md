# Firebase Emulators Guide

This guide covers local development and testing using Firebase Emulators.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase login: `make firebase-login` or `firebase login`

## Available Emulators

The project is configured with the following emulators:

- **Hosting** (port 5000): Serves the static website
- **Functions** (port 5001): Runs Cloud Functions locally
- **Emulator UI** (port 4000): Web dashboard for all emulators

## Quick Start

### Start All Emulators

```bash
make firebase-emulators
```

This will:
1. Build the Functions TypeScript code
2. Start all emulators (Hosting, Functions, UI)
3. Display URLs for each service

**Emulator URLs:**
- Website: http://localhost:5000
- Functions: http://localhost:5001
- UI Dashboard: http://localhost:4000

### Start Emulators with UI Dashboard

```bash
make firebase-emulators-ui
```

Opens the emulator UI automatically in your browser at http://localhost:4000

### Hosting Only (No Functions)

```bash
make firebase-serve
```

Serves just the static website at http://localhost:5000

## Testing the Contact Form

### Method 1: Using the Makefile (Recommended)

```bash
# Terminal 1: Start emulators
make firebase-emulators

# Terminal 2: Test the contact form
make test-contact-form
```

### Method 2: Manual cURL

```bash
curl -X POST http://localhost:5001/static-sites-257923/us-central1/handleContactForm \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "requestId": "req_..."
}
```

### Method 3: Interactive Functions Shell

```bash
make firebase-functions-shell
```

In the shell:
```javascript
handleContactForm({
  data: {
    name: "Test User",
    email: "test@example.com",
    message: "Test message"
  }
})
```

### Method 4: Frontend Integration

1. Start the emulators: `make firebase-emulators`
2. Start Gatsby dev server: `make dev`
3. Update `.env.development`:
   ```bash
   GATSBY_CONTACT_FUNCTION_URL=http://localhost:5001/static-sites-257923/us-central1/handleContactForm
   ```
4. Visit http://localhost:8000 and use the contact form

## Environment Variables

### Functions (.env.local)

The emulator uses `/functions/.env.local` for environment variables:

```bash
NODE_ENV=development
FUNCTIONS_EMULATOR=true
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=joshwentworth.com
FROM_EMAIL=noreply@joshwentworth.com
TO_EMAIL=contact-form@joshwentworth.com
REPLY_TO_EMAIL=hello@joshwentworth.com
GCP_PROJECT=static-sites-257923
```

### Frontend (.env.development)

The Gatsby dev server uses `/web/.env.development`:

```bash
GATSBY_CONTACT_FUNCTION_URL=http://localhost:5001/static-sites-257923/us-central1/handleContactForm
```

## Emulator UI Dashboard

The Emulator UI (http://localhost:4000) provides:

- **Functions**: View function logs, invocations, and performance
- **Firestore**: Browse and edit Firestore data in real-time
- **Logs**: Centralized logging for all emulators

## Firestore Emulator

While the Firestore emulator isn't explicitly configured in `firebase.json`, it will auto-start when Functions need it.

**Default Port**: Auto-assigned (check UI dashboard for actual port)

**Viewing Data**:
- Open http://localhost:4000
- Click "Firestore" tab
- Browse the `contact-submissions` collection

## Common Issues

### Functions Not Loading

**Issue**: `Error: Cannot find module 'dist/index.js'`

**Solution**: Build the functions first
```bash
cd functions && npm run build
```

### Port Already in Use

**Issue**: `Error: Port 5000 is already in use`

**Solution**: Kill all running servers
```bash
make kill
```

### Secrets Not Available

**Issue**: Functions can't access Secret Manager secrets in emulator

**Solution**: Use `.env.local` instead of secrets for local development. The functions are configured to read from environment variables when `FUNCTIONS_EMULATOR=true`.

### CORS Errors

**Issue**: Frontend can't reach the emulated function

**Solution**: The Functions CORS config already includes `http://localhost:8000`. Make sure:
1. Emulators are running: `make firebase-emulators`
2. Gatsby is using the emulator URL in `.env.development`

## Stopping Emulators

### Graceful Shutdown

Press `Ctrl+C` in the terminal running the emulators

### Force Kill All Servers

```bash
make kill
```

This kills all dev servers and emulators on ports 4000, 5000, 5001, 8000, 8080, 9000, 9099.

## Deployment

After testing locally, deploy to Firebase:

### Staging
```bash
make deploy-staging
```

### Production
```bash
make deploy-prod
```

## Additional Resources

- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Cloud Functions Emulator](https://firebase.google.com/docs/emulator-suite/connect_functions)
- [Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore)
