# Experience Page Authentication Setup

This document describes how to configure authorized editors for the experience page feature.

## Security Model

The experience page uses a **whitelist-based authorization** system:
- **Public Read Access**: Anyone can view experience entries
- **Restricted Write Access**: Only authorized email addresses can create/edit/delete entries
- **Email Verification Required**: Authorized emails must be verified in Firebase Auth

## Configuration

### Local Development

1. Copy the example environment file:
   ```bash
   cd functions
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add authorized editor emails:
   ```bash
   AUTHORIZED_EDITORS=your-email@gmail.com,colleague@company.com
   ```

3. The `.env.local` file is gitignored for security (never commit real emails!)

### Production (Firebase Functions)

For production deployments, use Firebase secrets instead of environment variables:

```bash
# Set the secret (interactive prompt)
firebase functions:secrets:set AUTHORIZED_EDITORS

# When prompted, enter comma-separated emails:
your-email@gmail.com,colleague@company.com
```

#### Verify Secret is Set

```bash
# List all secrets
firebase functions:secrets:access AUTHORIZED_EDITORS
```

#### Update Authorized Editors

```bash
# Delete old secret
firebase functions:secrets:destroy AUTHORIZED_EDITORS

# Set new secret
firebase functions:secrets:set AUTHORIZED_EDITORS
```

### Deployment Configuration

When deploying the `manageExperience` function, ensure the secret is included in the function configuration:

**functions/src/experience.ts:**
```typescript
export const manageExperience = https.onRequest(
  {
    region: "us-central1",
    secrets: ["AUTHORIZED_EDITORS"], // <-- Include secret here
    memory: "256MiB",
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  handler
)
```

## Email Format

- **Format**: Comma-separated list of email addresses
- **Example**: `email1@example.com,email2@example.com`
- **Whitespace**: Spaces around commas are trimmed automatically
- **Case Sensitive**: Email matching is case-sensitive

### Valid Examples

```bash
# Single email
AUTHORIZED_EDITORS=contact@joshwentworth.com

# Multiple emails (no spaces)
AUTHORIZED_EDITORS=email1@example.com,email2@example.com

# Multiple emails (with spaces - OK, they're trimmed)
AUTHORIZED_EDITORS=email1@example.com, email2@example.com, email3@example.com
```

## Security Best Practices

### ✅ DO

- **Use Firebase secrets for production** (`firebase functions:secrets:set`)
- **Use `.env.local` for local development** (gitignored)
- **Keep editor list minimal** (principle of least privilege)
- **Use verified email accounts** (Gmail, G Suite, etc.)
- **Review access regularly** and remove unnecessary editors

### ❌ DON'T

- **Never commit real emails to the repository** (security vulnerability)
- **Don't hardcode emails in source code**
- **Don't share `.env.local` files** (keep them local)
- **Don't use unverified email addresses**
- **Don't grant access to generic addresses** (e.g., `admin@`)

## Testing

The auth middleware uses **dummy emails** in tests for security:

**functions/src/__tests__/auth.middleware.test.ts:**
```typescript
// Test with dummy emails (NOT real emails)
const DUMMY_AUTHORIZED_EMAILS = ["editor1@example.com", "editor2@example.com"]
process.env.AUTHORIZED_EDITORS = DUMMY_AUTHORIZED_EMAILS.join(",")
```

This ensures:
- No real emails are exposed in the public repository
- Tests work independently of production configuration
- Security best practices are demonstrated

## Troubleshooting

### Issue: "Access denied - unauthorized email"

**Cause**: Your email is not in the `AUTHORIZED_EDITORS` list

**Solution**:
1. Verify your email is included in the configuration
2. Check for typos (case-sensitive)
3. Ensure email is verified in Firebase Auth
4. Restart the function after updating secrets

### Issue: "AUTHORIZED_EDITORS not set" warning

**Cause**: Environment variable or secret is missing

**Solution**:
1. **Local**: Create `.env.local` with `AUTHORIZED_EDITORS`
2. **Production**: Set secret with `firebase functions:secrets:set AUTHORIZED_EDITORS`
3. Redeploy the function

### Issue: Changes not taking effect

**Cause**: Function cached with old configuration

**Solution**:
```bash
# Redeploy the function
firebase deploy --only functions:manageExperience

# Or force refresh (delete + recreate)
firebase functions:delete manageExperience
firebase deploy --only functions:manageExperience
```

## Architecture

### Middleware Flow

```
1. Request arrives with Authorization: Bearer <firebase-token>
2. Extract token from header
3. Verify token with Firebase Admin SDK
4. Extract email from decoded token
5. Check if email_verified === true
6. Check if email in AUTHORIZED_EDITORS list
7. If all checks pass → attach user to req.user → call next()
8. If any check fails → return 401/403 error
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `EXP_AUTH_001` | 401 | Missing or invalid Authorization header |
| `EXP_AUTH_002` | 401 | Invalid Firebase token |
| `EXP_AUTH_003` | 401 | Expired Firebase token |
| `EXP_AUTH_004` | 403 | Email not in authorized list |
| `EXP_AUTH_005` | 403 | Email not verified |

## Related Documentation

- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Experience Page Feature Spec](../features/experience-page.md)

---

**Last Updated**: 2025-10-07
**Author**: Claude Code
