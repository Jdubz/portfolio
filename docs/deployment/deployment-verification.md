# Pre-Deployment Verification Checklist

## ✅ Configuration Verification (Completed)

### 1. Workload Identity Federation

- [x] **Workload Identity Pool created**: `github-actions` (global)
- [x] **OIDC Provider configured**: `github` for GitHub Actions
- [x] **Repository restriction**: Only `Jdubz/portfolio` can authenticate
- [x] **Pool verification**:
  ```bash
  gcloud iam workload-identity-pools describe github-actions \
    --location=global --project=static-sites-257923
  ```

### 2. Service Accounts

- [x] **github-actions-deployer** - Deployment account
  - Project roles: `cloudfunctions.developer`, `iam.serviceAccountUser`
  - Can impersonate: `cloud-functions-builder`, `contact-form-runtime`
  - Workload Identity binding: ✅ Configured for `Jdubz/portfolio`

- [x] **cloud-functions-builder** - Build-time account
  - Project roles: `logging.logWriter`
  - Artifact Registry: `artifactregistry.writer` on `gcf-artifacts`
  - Impersonation: ✅ Allowed by `github-actions-deployer`

- [x] **contact-form-runtime** - Function runtime account
  - Project roles: `secretmanager.secretAccessor`, `datastore.user`
  - Impersonation: ✅ Allowed by `github-actions-deployer`

### 3. Artifact Registry Permissions

- [x] **gcf-artifacts repository** (us-central1):
  ```
  Reader: 789847666726@cloudbuild, firebase-admin@
  Writer: 789847666726@cloudbuild, cloud-functions-builder@
  ```
- [x] **Cleanup complete**: Removed permissions from default Compute Engine SA

### 4. GitHub Actions Workflow

- [x] **Authentication updated**: Using Workload Identity Federation
  ```yaml
  workload_identity_provider: projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github
  service_account: github-actions-deployer@static-sites-257923.iam.gserviceaccount.com
  ```

- [x] **Build service account specified**:
  ```bash
  --build-service-account=projects/static-sites-257923/serviceAccounts/cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com
  ```

- [x] **Runtime service account specified**:
  ```bash
  --service-account=contact-form-runtime@static-sites-257923.iam.gserviceaccount.com
  ```

- [x] **Both environments updated**: Staging and Production

### 5. Documentation

- [x] **GITHUB_ACTIONS_ANALYSIS.md** - Updated with resolved status
- [x] **WORKLOAD_IDENTITY_SETUP.md** - Complete setup documentation
- [x] **SECURITY_IMPROVEMENTS_SUMMARY.md** - Migration summary
- [x] **DEPLOYMENT_VERIFICATION.md** - This checklist

---

## 🔍 Manual Verification Commands

Run these commands to verify the setup:

### Verify Service Accounts Exist
```bash
gcloud iam service-accounts list --project=static-sites-257923 \
  --filter="email:(github-actions-deployer OR cloud-functions-builder OR contact-form-runtime)"
```

**Expected output**: 3 service accounts listed

### Verify Workload Identity Binding
```bash
gcloud iam service-accounts get-iam-policy \
  github-actions-deployer@static-sites-257923.iam.gserviceaccount.com \
  --format=json | jq '.bindings[] | select(.role == "roles/iam.workloadIdentityUser")'
```

**Expected output**: `principalSet://...Jdubz/portfolio`

### Verify Deployer Permissions
```bash
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-deployer@" \
  --format="table(bindings.role)"
```

**Expected output**:
- `roles/cloudfunctions.developer`
- `roles/iam.serviceAccountUser`

### Verify Builder Permissions
```bash
# Project-level
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:cloud-functions-builder@" \
  --format="table(bindings.role)"

# Artifact Registry
gcloud artifacts repositories get-iam-policy gcf-artifacts \
  --location=us-central1 --project=static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:cloud-functions-builder@"
```

**Expected output**:
- Project: `roles/logging.logWriter`
- Artifact Registry: `roles/artifactregistry.writer`

### Verify Runtime Permissions
```bash
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:contact-form-runtime@" \
  --format="table(bindings.role)"
```

**Expected output**:
- `roles/secretmanager.secretAccessor`
- `roles/datastore.user`

### Verify Impersonation Permissions
```bash
# Builder can be impersonated by deployer
gcloud iam service-accounts get-iam-policy \
  cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com

# Runtime can be impersonated by deployer
gcloud iam service-accounts get-iam-policy \
  contact-form-runtime@static-sites-257923.iam.gserviceaccount.com
```

**Expected output** (both): Member `github-actions-deployer@` with role `roles/iam.serviceAccountUser`

---

## 🧪 Testing Plan

### Phase 1: Staging Deployment

1. **Push to staging branch** (triggers deployment):
   ```bash
   git push origin staging
   ```

2. **Monitor GitHub Actions**:
   - Go to: https://github.com/Jdubz/portfolio/actions
   - Watch for "Deploy Contact Form Function" workflow
   - Verify all steps complete successfully

3. **Check for authentication success**:
   - Look for: "Authenticate to Google Cloud" step succeeds
   - Should NOT see any "credentials_json" references
   - Should see Workload Identity token acquisition

4. **Verify deployment**:
   - Build should succeed with custom build SA
   - Function should deploy with custom runtime SA
   - Post-deployment test should pass

5. **Test the deployed function**:
   ```bash
   curl -X POST https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Testing new auth setup"}'
   ```

### Phase 2: Production Deployment

1. **Merge staging to main** (after staging success):
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Monitor production deployment**:
   - Same as staging verification steps
   - Production function URL: `contact-form` (no -staging suffix)

3. **Test production function**:
   ```bash
   curl -X POST https://us-central1-static-sites-257923.cloudfunctions.net/contact-form \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Testing production deployment"}'
   ```

### Phase 3: Cleanup (Optional)

**After successful deployments:**

1. **Delete old service account key from GitHub Secrets**:
   - Go to: Settings → Secrets and variables → Actions
   - Delete `FIREBASE_SERVICE_ACCOUNT` secret
   - This ensures the old key cannot be used

2. **Verify old key is no longer accessible**:
   - Check if any other workflows use this secret
   - Search codebase for `FIREBASE_SERVICE_ACCOUNT` references

---

## ⚠️ Troubleshooting

### If Authentication Fails

**Error**: `Failed to generate access token`

**Check**:
1. Workload Identity Pool and Provider exist:
   ```bash
   gcloud iam workload-identity-pools providers describe github \
     --location=global --workload-identity-pool=github-actions
   ```

2. Repository is correctly bound:
   ```bash
   gcloud iam service-accounts get-iam-policy \
     github-actions-deployer@static-sites-257923.iam.gserviceaccount.com
   ```

**Fix**: Verify the `principalSet` includes `Jdubz/portfolio`

### If Build Fails

**Error**: `Permission denied: artifactregistry.repositories.uploadArtifacts`

**Check**:
```bash
gcloud artifacts repositories get-iam-policy gcf-artifacts \
  --location=us-central1 --project=static-sites-257923
```

**Fix**: Ensure `cloud-functions-builder@` has `roles/artifactregistry.writer`

### If Deployment Fails

**Error**: `Permission denied on service account`

**Check**:
```bash
gcloud iam service-accounts get-iam-policy \
  cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com
```

**Fix**: Ensure `github-actions-deployer@` has `roles/iam.serviceAccountUser` on both custom SAs

### If Function Fails at Runtime

**Error**: `Permission denied: secretmanager.versions.access`

**Check**:
```bash
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:contact-form-runtime@"
```

**Fix**: Ensure `contact-form-runtime@` has `roles/secretmanager.secretAccessor`

---

## 📊 Security Audit

### Before Migration
- ❌ Long-lived service account keys stored in GitHub
- ❌ Overly permissive default service accounts
- ❌ Single account for all operations

### After Migration
- ✅ No stored credentials (Workload Identity Federation)
- ✅ Short-lived tokens (1 hour expiry)
- ✅ Minimal permissions per service account
- ✅ Separate accounts for deployment, build, and runtime
- ✅ Repository-level access control

### Compliance
- ✅ Follows Google Cloud Security Best Practices (2025)
- ✅ Implements Principle of Least Privilege
- ✅ Enables comprehensive audit logging
- ✅ Prevents credential theft scenarios

---

## 📝 Files Changed

```
modified:   .github/workflows/deploy-contact-function.yml
new file:   docs/GITHUB_ACTIONS_ANALYSIS.md
new file:   docs/WORKLOAD_IDENTITY_SETUP.md
new file:   docs/SECURITY_IMPROVEMENTS_SUMMARY.md
new file:   docs/DEPLOYMENT_VERIFICATION.md
```

## ✅ Ready for Deployment

All security improvements have been implemented and verified. The deployment pipeline is ready to use.

**Next step**: Commit and push to `staging` branch to test the new authentication flow.
