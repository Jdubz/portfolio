# GitHub Actions CI/CD Pipeline

## Overview

The portfolio uses GitHub Actions for automated deployment to Firebase Hosting and Google Cloud Functions. The pipeline follows Google Cloud's 2025 security best practices with Workload Identity Federation and dedicated service accounts.

## Workflows

### 1. Main Deployment (`deploy.yml`)

**Triggers:** Push to `main` or `staging` branches

**Jobs:**
- Install dependencies
- Build Gatsby site
- Deploy to Firebase Hosting (production or staging target)

**Authentication:** Uses `FIREBASE_SERVICE_ACCOUNT` secret for Firebase Hosting deployment

**Environment Variables:**
- `main` branch → `production` environment (`.env.production`)
- `staging` branch → `staging` environment (`.env.staging`)

### 2. Cloud Functions Deployment (`deploy-contact-function.yml`)

**Triggers:** Push to `main` or `staging` branches when `functions/**` files change

**Jobs:**
1. **Test** - Run linting, tests, and build TypeScript
2. **Deploy-Staging** - Deploy to `contact-form-staging` function
3. **Deploy-Production** - Deploy to `contact-form` function

**Authentication:** Workload Identity Federation (no stored keys)

## Security Architecture

### Workload Identity Federation

Instead of storing service account keys, we use OIDC tokens from GitHub:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github'
    service_account: 'github-actions-deployer@static-sites-257923.iam.gserviceaccount.com'
```

**Benefits:**
- ✅ Short-lived tokens (expire after 1 hour)
- ✅ No secrets to store or rotate
- ✅ Repository-level access control
- ✅ Automatic token refresh

### Service Accounts

Three dedicated service accounts with minimal permissions:

#### 1. github-actions-deployer
- **Purpose:** GitHub Actions deployment orchestration
- **Permissions:**
  - `roles/cloudfunctions.developer` - Deploy Cloud Functions
  - `roles/iam.serviceAccountUser` - Impersonate build and runtime accounts
- **Authentication:** Via Workload Identity Federation (restricted to `Jdubz/portfolio`)

#### 2. cloud-functions-builder
- **Purpose:** Build container images during Cloud Functions deployment
- **Permissions:**
  - `roles/logging.logWriter` - Write build logs
  - `artifactregistry.writer` on `gcf-artifacts` repository only
- **Usage:** Specified with `--build-service-account` flag in deployment

#### 3. contact-form-runtime
- **Purpose:** Execute the contact form Cloud Function
- **Permissions:**
  - `roles/secretmanager.secretAccessor` - Access Mailgun secrets
  - `roles/datastore.user` - Write to Firestore
- **Usage:** Specified with `--service-account` flag in deployment

## Deployment Process

### Staging Deployment

1. **Trigger:** Push to `staging` branch
2. **Build:** Compile TypeScript in GitHub Actions
3. **Package:** Create deployment directory with compiled JavaScript
4. **Deploy:**
   ```bash
   gcloud functions deploy contact-form-staging \
     --gen2 \
     --runtime=nodejs20 \
     --region=us-central1 \
     --source=functions/deploy \
     --entry-point=handleContactForm \
     --service-account=contact-form-runtime@... \
     --build-service-account=projects/.../cloud-functions-builder@... \
     --memory=256Mi \
     --max-instances=10
   ```
5. **Test:** Send test request to deployed function

### Production Deployment

Same as staging, but:
- Function name: `contact-form` (no suffix)
- Higher limits: `512Mi` memory, `50` max instances
- Only triggered by `main` branch

## Environment Configuration

### Firebase Hosting

Targets are defined in `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "production",
      "site": "joshwentworth",
      "public": "web/public"
    },
    {
      "target": "staging",
      "site": "jw-portfolio-staging",
      "public": "web/public"
    }
  ]
}
```

### Cloud Functions

Environment variables and secrets:

**Environment Variables:**
- `NODE_ENV` - `production` or `staging`
- `ENVIRONMENT` - Same as NODE_ENV

**Secrets (from Secret Manager):**
- `MAILGUN_API_KEY` - Mailgun API key
- `MAILGUN_DOMAIN` - Email sending domain
- `FROM_EMAIL` - Sender email address
- `TO_EMAIL` - Recipient email address
- `REPLY_TO_EMAIL` - Reply-to address

## Monitoring & Debugging

### View Deployment Status

GitHub Actions: https://github.com/Jdubz/portfolio/actions

### View Function Logs

```bash
# Staging
gcloud functions logs read contact-form-staging --region=us-central1 --limit=50

# Production
gcloud functions logs read contact-form --region=us-central1 --limit=50
```

### Check Function Status

```bash
# Staging
gcloud functions describe contact-form-staging --region=us-central1 --gen2

# Production
gcloud functions describe contact-form --region=us-central1 --gen2
```

### Test Function Endpoint

```bash
# Staging
curl -X POST "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'

# Production
curl -X POST "https://us-central1-static-sites-257923.cloudfunctions.net/contact-form" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## Troubleshooting

### Deployment Fails: "Permission Denied"

**Check service account permissions:**
```bash
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-deployer@" \
  --format="table(bindings.role)"
```

**Expected roles:**
- `roles/cloudfunctions.developer`
- `roles/iam.serviceAccountUser`

### Deployment Fails: "Cannot access Artifact Registry"

**Check builder account permissions:**
```bash
gcloud artifacts repositories get-iam-policy gcf-artifacts \
  --location=us-central1 \
  --format=json | jq '.bindings'
```

**Expected:** `cloud-functions-builder@` should have `artifactregistry.writer` role

### Function Fails: "Cannot access secrets"

**Check runtime account permissions:**
```bash
gcloud secrets get-iam-policy mailgun-api-key \
  --format=json | jq '.bindings'
```

**Expected:** `contact-form-runtime@` should have `secretmanager.secretAccessor` role

### Workload Identity Authentication Fails

**Verify binding:**
```bash
gcloud iam service-accounts get-iam-policy \
  github-actions-deployer@static-sites-257923.iam.gserviceaccount.com \
  --format=json | jq '.bindings[] | select(.role == "roles/iam.workloadIdentityUser")'
```

**Expected output should include:** `principalSet://...Jdubz/portfolio`

## Related Documentation

- [Workload Identity Setup](./workload-identity-setup.md) - Detailed setup guide
- [Functions Deployment](./functions-deployment.md) - Manual deployment instructions
- [Security Improvements](../audit/security-improvements.md) - Security migration details

## External Resources

- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions Auth](https://github.com/google-github-actions/auth)
- [Cloud Functions Best Practices](https://cloud.google.com/functions/docs/bestpractices)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Last Updated:** 2025-10-06
**Status:** ✅ Fully operational with security best practices
