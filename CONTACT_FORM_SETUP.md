# Contact Form - Complete Setup Guide

## 🎉 What's Been Completed

The contact form is **fully integrated** with:
- ✅ Mailgun email service (notifications + auto-replies)
- ✅ Firestore database (persistent storage)
- ✅ Firebase Functions v2 (serverless backend)
- ✅ Complete local testing environment

## 📁 Key Files

### Backend (Cloud Function)
- [functions/src/index.ts](functions/src/index.ts) - Main function handler
- [functions/src/services/email.service.ts](functions/src/services/email.service.ts) - Mailgun integration
- [functions/src/services/firestore.service.ts](functions/src/services/firestore.service.ts) - Database service
- [functions/src/services/secret-manager.service.ts](functions/src/services/secret-manager.service.ts) - Secrets management

### Frontend
- [web/src/components/ContactForm.tsx](web/src/components/ContactForm.tsx) - Contact form UI
- [web/.env.development](web/.env.development) - Local dev config (gitignored)

### Documentation
- [FIREBASE_EMULATORS.md](FIREBASE_EMULATORS.md) - Local testing guide
- [functions/DEPLOYMENT.md](functions/DEPLOYMENT.md) - Deployment instructions
- [functions/README.md](functions/README.md) - Function documentation

### Testing
- [test-contact-form.sh](test-contact-form.sh) - Comprehensive test suite
- [Makefile](Makefile) - Development commands

## 🚀 Local Development

### Quick Start

```bash
# Terminal 1: Start Firebase emulators
make firebase-emulators

# Terminal 2: Test the contact form
make test-contact-form-all
```

### All Available Commands

```bash
# Firebase Emulators
make firebase-emulators         # Start all emulators (hosting, functions, UI)
make firebase-emulators-ui      # Start with UI dashboard
make firebase-functions-shell   # Interactive testing shell

# Testing
make test-contact-form          # Quick single test
make test-contact-form-all      # Full test suite (4 scenarios)

# Development
make dev                        # Start Gatsby dev server
make dev-functions             # Start functions dev server
make kill                      # Stop all servers

# Deployment
make deploy-staging            # Deploy to staging
make deploy-prod              # Deploy to production
```

## 🔧 Configuration

### Secrets (GCP Secret Manager)

The following secrets are already created in GCP:

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `mailgun-api-key` | `[your-mailgun-api-key]` | Mailgun API authentication |
| `mailgun-domain` | `joshwentworth.com` | Email sending domain |
| `from-email` | `noreply@joshwentworth.com` | Sender email address |
| `to-email` | `contact-form@joshwentworth.com` | Notification recipient |
| `reply-to-email` | `hello@joshwentworth.com` | Reply-to address |

### Local Environment

For local testing, create `functions/.env.local`:

```bash
NODE_ENV=development
FUNCTIONS_EMULATOR=true
MAILGUN_API_KEY=[your-mailgun-api-key]
MAILGUN_DOMAIN=joshwentworth.com
FROM_EMAIL=noreply@joshwentworth.com
TO_EMAIL=contact-form@joshwentworth.com
REPLY_TO_EMAIL=hello@joshwentworth.com
GCP_PROJECT=static-sites-257923
```

This file is already created and gitignored.

### Frontend Environment

For local frontend testing, create `web/.env.development`:

```bash
GATSBY_CONTACT_FUNCTION_URL=http://localhost:5001/static-sites-257923/us-central1/handleContactForm
```

For production builds, set in your CI/CD:

```bash
GATSBY_CONTACT_FUNCTION_URL=https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm
```

## 📊 Firestore Schema

Contact submissions are stored in the `contact-submissions` collection:

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

## 🧪 Testing

### Test Suite Coverage

The test script (`test-contact-form.sh`) validates:

1. ✅ **Valid Submission** (200 OK)
   - Name, email, message all valid
   - Saves to Firestore
   - Sends email notification

2. ✅ **Invalid Email** (400 Bad Request)
   - Email fails validation
   - Returns error message

3. ✅ **Missing Required Field** (400 Bad Request)
   - Missing message field
   - Returns validation error

4. ✅ **Honeypot Bot Detection** (200 OK)
   - Honeypot field filled (bot detected)
   - Returns success to hide detection
   - No email sent, not saved to DB

### Manual Testing

```bash
# Test against emulator
./test-contact-form.sh emulator

# Test against staging
./test-contact-form.sh staging

# Test against production
./test-contact-form.sh production
```

## 🚢 Deployment Status

### Current State

The function is **fully coded and tested**, but deployment is blocked by a Cloud Build issue.

### Deployment Options

**Option 1: Force Deploy with Firebase CLI**
```bash
cd /home/jdubz/Development/portfolio
firebase deploy --only functions --force
```

**Option 2: Manual Console Deployment**
1. Go to [Cloud Functions Console](https://console.cloud.google.com/functions?project=static-sites-257923)
2. Create/edit `handleContactForm` function
3. Upload source from `functions/dist`
4. Configure secrets in UI

### After Deployment

Once deployed, the function will be at:
```
https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm
```

Update production builds with:
```bash
GATSBY_CONTACT_FUNCTION_URL=https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm
```

## 🔐 Security Features

- ✅ Input validation (Joi schema)
- ✅ Bot detection (honeypot field)
- ✅ CORS restrictions (allowed origins only)
- ✅ Secrets in Secret Manager (not in code)
- ✅ XSS protection in email templates
- ✅ Rate limiting headers

### CORS Allowed Origins

- `https://joshwentworth.com`
- `https://staging.joshwentworth.com`
- `http://localhost:8000`
- `http://localhost:3000`

## 📝 Email Templates

### Notification Email (to you)
- Subject: "New Contact Form Submission from {name}"
- Includes: name, email, message, metadata
- Reply-To: User's email address

### Auto-Reply Email (to user)
- Subject: "Thank you for contacting Josh Wentworth"
- Confirms receipt of message
- Professional acknowledgment

## 🐛 Troubleshooting

### Emulators Won't Start
```bash
make kill                    # Kill all running servers
cd functions && npm run build   # Rebuild functions
make firebase-emulators      # Try again
```

### Secrets Not Working Locally
- Check `functions/.env.local` exists
- Verify `FUNCTIONS_EMULATOR=true` is set
- Secrets are only used in production

### CORS Errors
- Verify emulators are running
- Check frontend `.env.development` has correct URL
- Confirm origin is in CORS allowlist

### Email Not Sending
- Verify Mailgun credentials in `.env.local`
- Check Mailgun domain is verified
- Review function logs in emulator UI

## 📚 Additional Resources

- [Firebase Emulators Guide](FIREBASE_EMULATORS.md)
- [Deployment Guide](functions/DEPLOYMENT.md)
- [Function README](functions/README.md)
- [Firebase Emulator Docs](https://firebase.google.com/docs/emulator-suite)

## 🎯 Next Steps

1. **Deploy the function** using one of the deployment options above
2. **Update production env vars** with the deployed function URL
3. **Test in production** using `./test-contact-form.sh production`
4. **Monitor logs** via [Cloud Console](https://console.cloud.google.com/functions) or `make logs`
