# Cloud Function Security Setup Guide

## Overview

This guide explains how to complete the security setup for the contact form Cloud Function using Firebase App Check and rate limiting.

## Security Layers Implemented

1. **Firebase App Check** - Verifies requests come from legitimate app instances
2. **Rate Limiting** - Prevents abuse by limiting requests per IP
3. **CORS** - Restricts which domains can call the function
4. **Honeypot** - Bot detection field
5. **Input Validation** - Schema validation with Joi

## Current Status

✅ Code implemented
⚠️ Configuration needed (one-time setup)

## Required Setup Steps

### Step 1: Register Web App with Firebase

You need to register your web app with Firebase and get the App ID.

```bash
# Using Firebase CLI
firebase apps:create WEB "Josh Wentworth Portfolio"
```

This will output an App ID like: `1:789847666726:web:abcd1234efgh5678`

### Step 2: Enable reCAPTCHA v3 for App Check

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `static-sites-257923`
3. Navigate to: **Build → App Check**
4. Click **Get Started** (if first time)
5. Click on your web app
6. Select **reCAPTCHA v3** as the provider
7. Register your domains:
   - `joshwentworth.com`
   - `staging.joshwentworth.com`
   - `localhost` (for development)
8. Copy the **reCAPTCHA v3 site key**

### Step 3: Update Environment Variables

Add the following to your environment files:

**`.env.development`**:
```bash
GATSBY_RECAPTCHA_V3_SITE_KEY=your-recaptcha-site-key-here
```

**`.env.staging`**:
```bash
GATSBY_RECAPTCHA_V3_SITE_KEY=your-recaptcha-site-key-here
```

**`.env.production`**:
```bash
GATSBY_RECAPTCHA_V3_SITE_KEY=your-recaptcha-site-key-here
```

### Step 4: Update Firebase Config in Web App

Edit `web/src/utils/firebase-app-check.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBpO5zlIHmvdwvNtOZgVT8R8rPWXOZr1YQ",
  authDomain: "static-sites-257923.firebaseapp.com",
  projectId: "static-sites-257923",
  storageBucket: "static-sites-257923.firebasestorage.app",
  messagingSenderId: "789847666726",
  appId: "1:789847666726:web:YOUR_ACTUAL_APP_ID", // ← Replace this
}
```

Replace `YOUR_ACTUAL_APP_ID` with the App ID from Step 1.

### Step 5: Grant Service Account Permissions

The Cloud Functions runtime service account needs the App Check role:

```bash
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:contact-form-runtime@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/firebaseappcheck.tokenVerifier"
```

### Step 6: Test Locally

1. **Start Firebase emulators**:
   ```bash
   make firebase-emulators
   ```

2. **Start Gatsby dev server**:
   ```bash
   cd web && npm run develop
   ```

3. **Test the contact form**:
   - Navigate to `http://localhost:8000/contact`
   - Fill out and submit the form
   - Check browser console for App Check logs
   - Check function logs for verification messages

### Step 7: Deploy to Staging

```bash
git add -A
git commit -m "feat: add Firebase App Check and rate limiting security"
git push origin staging
```

Monitor the deployment and test on staging:
- Visit `https://staging.joshwentworth.com/contact`
- Submit the form
- Verify it works without errors

### Step 8: Deploy to Production

Once staging works:

```bash
git checkout main
git merge staging
git push origin main
```

## How It Works

### Firebase App Check Flow

```
1. User loads webpage
   └── App Check initialized with reCAPTCHA v3
       └── reCAPTCHA v3 runs silently in background

2. User submits contact form
   └── App Check generates attestation token
       └── Token sent in X-Firebase-AppCheck header
           └── Cloud Function verifies token
               ├── Valid → Process request
               └── Invalid → Reject with 401
```

### Rate Limiting Flow

```
1. Request arrives at Cloud Function
   └── Extract client IP from headers
       └── Check request count for this IP
           ├── Under limit (5/15min) → Allow
           └── Over limit → Reject with 429
```

### Defense in Depth

All security layers work together:

```
Request → CORS Check → Rate Limit → App Check → Input Validation → Process
   ↓           ↓            ↓            ↓             ↓              ↓
 Block      Slow down    Verify app   Validate     Honeypot      Success
non-origin  abusers     authenticity   data        check
```

## Configuration Details

### Rate Limits

**Production**:
- 5 requests per 15 minutes per IP
- 1 request per hour for suspicious activity (honeypot triggers)

**Development/Staging**:
- 10 requests per 15 minutes per IP
- Allows more testing flexibility

### Environment Behavior

**Production** (`NODE_ENV=production`):
- Strictly enforces App Check
- Rejects requests without valid tokens
- Conservative rate limiting

**Development** (`NODE_ENV=development` or emulator):
- Allows requests without App Check for easier testing
- Logs warnings instead of blocking
- More permissive rate limits

**Test** (`NODE_ENV=test`):
- Skips all security middleware
- Allows unit tests to run without mocking

## Monitoring & Alerts

### Cloud Function Logs

Monitor security events in Cloud Logging:

```bash
# View App Check verifications
gcloud functions logs read contact-form-staging --filter="AppCheck"

# View rate limit events
gcloud functions logs read contact-form-staging --filter="RateLimit"

# View security rejections
gcloud functions logs read contact-form-staging --filter="UNAUTHORIZED OR RATE_LIMIT_EXCEEDED"
```

### Error Codes

Security-related error codes:

| Code | Meaning | Action |
|------|---------|--------|
| `CF_SEC_001` | Missing App Check token | App Check not initialized |
| `CF_SEC_002` | Invalid App Check token | Token verification failed |
| `CF_SEC_003` | Rate limit exceeded | Too many requests from IP |
| `CF_SEC_004` | Suspicious activity detected | Honeypot triggered |

## Troubleshooting

### App Check Token Missing in Production

**Problem**: `CF_SEC_001` errors in production

**Solution**:
1. Verify reCAPTCHA v3 site key is correct in `.env.production`
2. Check domain is registered in Firebase Console → App Check
3. Check browser console for App Check initialization errors
4. Verify `X-Firebase-AppCheck` header is being sent (check Network tab)

### Rate Limit Too Restrictive

**Problem**: Legitimate users hitting rate limits

**Solution**:
1. Adjust limits in `functions/src/middleware/rate-limit.middleware.ts`
2. Consider increasing `windowMs` or `max` values
3. Monitor logs to understand usage patterns

### App Check Works Locally but Fails in Production

**Problem**: Works in development but not deployed

**Solution**:
1. Verify service account has `firebaseappcheck.tokenVerifier` role
2. Check Firebase Console → App Check → Metrics for verification failures
3. Ensure production domain is registered in App Check settings

### reCAPTCHA v3 Score Too Low

**Problem**: Legitimate users getting blocked by reCAPTCHA

**Solution**:
1. App Check uses reCAPTCHA v3 which doesn't block users
2. Low scores don't prevent form submission
3. Monitor Firebase Console → App Check → Metrics for score distribution
4. Consider using debug tokens for testing

## Debug Tokens (Development)

For local development without reCAPTCHA:

1. Go to Firebase Console → App Check
2. Click on your web app
3. Add a debug token
4. Set in local environment:
   ```bash
   export FIREBASE_APPCHECK_DEBUG_TOKEN="your-debug-token"
   ```

This bypasses reCAPTCHA during development.

## Cost Considerations

### Firebase App Check
- **Free tier**: 100,000 verifications/month
- **Paid**: $0.50 per 10,000 verifications
- For contact form: ~100-1000 submissions/month = FREE

### reCAPTCHA v3
- **Free**: Up to 1 million assessments/month
- For contact form: Well within free tier

### Cloud Functions
- Rate limiting is in-memory (no additional cost)
- App Check adds minimal latency (~50-100ms)

## Security Best Practices

1. ✅ **Never disable App Check in production** - Keep development bypass only for local/emulator
2. ✅ **Monitor rate limit hits** - Adjust if seeing too many false positives
3. ✅ **Review App Check metrics** - Weekly check in Firebase Console
4. ✅ **Update reCAPTCHA keys regularly** - Rotate every 6-12 months
5. ✅ **Test after deployment** - Always verify security works after changes

## Additional Security Considerations

### Future Enhancements

Consider adding:

1. **Cloud Armor** - DDoS protection at Google Cloud level
2. **IP Allowlists** - Restrict to specific countries/regions
3. **Content filtering** - Block spam keywords in messages
4. **Email verification** - Confirm email before processing
5. **CAPTCHA fallback** - Show visible CAPTCHA for suspicious requests

### Compliance

Current implementation provides:

- ✅ Bot prevention (App Check + honeypot)
- ✅ Rate limiting (abuse prevention)
- ✅ Request validation (input sanitization)
- ✅ Audit logging (Cloud Logging)
- ✅ CORS protection (origin restrictions)

## Support

For issues or questions:
1. Check Firebase Console → App Check → Metrics
2. Review Cloud Function logs
3. See [workload-identity-setup.md](../deployment/workload-identity-setup.md) for IAM issues

## References

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Cloud Functions Security](https://cloud.google.com/functions/docs/securing)
