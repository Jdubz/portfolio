# Security Improvements Summary

## What We Did

We upgraded the GitHub Actions deployment pipeline from service account keys to **Workload Identity Federation** with dedicated service accounts following the principle of least privilege.

## Changes Made

### 1. ✅ Workload Identity Federation Setup

**Created:**
- Workload Identity Pool: `github-actions`
- OIDC Provider: `github` (configured for GitHub Actions)
- Restricted to `Jdubz/portfolio` repository only

**Benefits:**
- No more long-lived service account keys stored in GitHub Secrets
- Short-lived tokens that expire after 1 hour
- Repository-level access control

### 2. ✅ Dedicated Service Accounts

**Created three specialized service accounts:**

#### github-actions-deployer
- **Purpose**: GitHub Actions deployment
- **Permissions**: Cloud Functions developer, can impersonate other SAs
- **Authentication**: Via Workload Identity Federation

#### cloud-functions-builder
- **Purpose**: Build container images during deployment
- **Permissions**: Logging writer, Artifact Registry writer (gcf-artifacts only)
- **Used by**: Specified with `--build-service-account` flag

#### contact-form-runtime
- **Purpose**: Execute contact form function
- **Permissions**: Secret Manager accessor, Firestore user
- **Used by**: Specified with `--service-account` flag

### 3. ✅ Workflow Updates

**Updated `.github/workflows/deploy-contact-function.yml`:**

**Before:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
```

**After:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github'
    service_account: 'github-actions-deployer@static-sites-257923.iam.gserviceaccount.com'
```

**Added to deployment commands:**
```bash
gcloud functions deploy contact-form \
  --service-account=contact-form-runtime@static-sites-257923.iam.gserviceaccount.com \
  --build-service-account=projects/static-sites-257923/serviceAccounts/cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
  # ... other flags
```

### 4. ✅ Cleanup

**Removed temporary workarounds:**
- Removed Artifact Registry permissions from default Compute Engine service account
- No longer relying on overly-permissive default accounts

## Security Comparison

### Before

```
GitHub Secrets (FIREBASE_SERVICE_ACCOUNT)
  └── Long-lived service account key
       └── firebase-admin@... (firebase.admin role - very permissive)
            └── Deploys using default Compute Engine account
                 └── Default accounts have broad permissions
```

**Issues:**
- ❌ Service account key stored in GitHub (security risk if leaked)
- ❌ Keys are long-lived (permanent access until rotated)
- ❌ Using default service accounts with excessive permissions
- ❌ No separation between deployment, build, and runtime permissions

### After

```
GitHub Actions (OIDC token from GitHub)
  └── Workload Identity Pool (validates repository)
       └── github-actions-deployer@ (minimal deployment permissions)
            ├── Build: cloud-functions-builder@ (logging + artifact registry only)
            └── Runtime: contact-form-runtime@ (secrets + firestore only)
```

**Benefits:**
- ✅ No stored secrets (keyless authentication)
- ✅ Short-lived tokens (expire after 1 hour)
- ✅ Repository-restricted (only `Jdubz/portfolio` can authenticate)
- ✅ Separate permissions for each stage (deployment, build, runtime)
- ✅ Minimal permissions per service account (principle of least privilege)
- ✅ Easier to audit and manage

## Files Changed

```
modified:   .github/workflows/deploy-contact-function.yml
new file:   docs/GITHUB_ACTIONS_ANALYSIS.md
new file:   docs/WORKLOAD_IDENTITY_SETUP.md
new file:   docs/SECURITY_IMPROVEMENTS_SUMMARY.md
```

## Next Steps

### Before First Deployment

**IMPORTANT**: After committing these changes, the workflow will no longer use `FIREBASE_SERVICE_ACCOUNT` secret. You can optionally:

1. **Delete the GitHub Secret** (optional but recommended):
   - Go to: Settings → Secrets and variables → Actions
   - Delete `FIREBASE_SERVICE_ACCOUNT` secret
   - This ensures the old key is no longer accessible

2. **Test the deployment** on staging branch first:
   - Push to `staging` branch
   - Verify deployment succeeds with new authentication
   - Check that the function works correctly

### Migration Checklist

- [x] Create Workload Identity Pool and Provider
- [x] Create dedicated service accounts
- [x] Grant minimal permissions to each service account
- [x] Update GitHub Actions workflow
- [x] Remove temporary permissions from default accounts
- [x] Document the new setup
- [ ] Test deployment on staging
- [ ] Delete old `FIREBASE_SERVICE_ACCOUNT` secret (optional)
- [ ] Test deployment on production

## Documentation

- **[github-actions-analysis.md](../deployment/github-actions-analysis.md)** - Analysis of current setup vs best practices
- **[workload-identity-setup.md](../deployment/workload-identity-setup.md)** - Detailed setup documentation and troubleshooting

## Troubleshooting

If deployment fails, check:

1. **Authentication Error**: Verify Workload Identity Pool is configured correctly
2. **Permission Error**: Verify service account IAM bindings
3. **Artifact Registry Error**: Verify cloud-functions-builder has writer role on gcf-artifacts

See [workload-identity-setup.md](../deployment/workload-identity-setup.md#troubleshooting) for detailed troubleshooting steps.

## Compliance & Best Practices

This setup follows Google Cloud's recommended security practices:

- ✅ **Keyless Authentication**: No service account keys stored
- ✅ **Principle of Least Privilege**: Minimal permissions per service account
- ✅ **Separation of Concerns**: Different SAs for deployment, build, and runtime
- ✅ **Short-Lived Credentials**: Tokens expire after 1 hour
- ✅ **Repository-Level Access Control**: Only specific repos can authenticate
- ✅ **Audit Trail**: All actions are logged with specific service account identities

## References

- [Workload Identity Federation Best Practices](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Custom Build Service Accounts](https://cloud.google.com/functions/docs/securing/build-custom-sa)
- [Cloud Functions Security](https://cloud.google.com/functions/docs/securing/function-identity)
