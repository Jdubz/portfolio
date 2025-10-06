# GitHub Actions Cloud Functions Deployment Analysis

## ✅ Security Improvements Completed (2025-10-06)

### Summary
**STATUS: FULLY UPGRADED** - The deployment pipeline now follows Google Cloud's 2025 best practices with Workload Identity Federation and dedicated service accounts with minimal permissions.

## What Was Changed

All security issues identified below have been **resolved**. See [SECURITY_IMPROVEMENTS_SUMMARY.md](./SECURITY_IMPROVEMENTS_SUMMARY.md) for details.

---

## Original Analysis (For Historical Reference)

### Previous Status

The original setup was **mostly correct** but had security and permission issues:

---

## ✅ What You're Doing Right

### 1. **Using `google-github-actions/auth@v2`**
- ✅ Using the official Google GitHub Actions authentication
- ✅ Properly setting up Cloud SDK with `setup-gcloud@v2`
- ✅ Setting project ID in the setup

### 2. **Using `gcloud functions deploy --gen2`**
- ✅ Deploying Gen2 functions (recommended over Gen1)
- ✅ Using manual `gcloud` commands instead of the `deploy-cloud-functions` action (better for Gen2)
- ✅ Specifying all required flags: runtime, region, entry-point, trigger-http

### 3. **Pre-building TypeScript**
- ✅ Building TypeScript in GitHub Actions before deployment
- ✅ Creating a clean deployment package
- ✅ Removing `gcp-build` script to skip Cloud Build compilation

### 4. **Secret Management**
- ✅ Using GCP Secret Manager with `--set-secrets` flag
- ✅ Not storing secrets in GitHub or code

### 5. **Testing and Validation**
- ✅ Running tests before deployment
- ✅ Testing deployed function after deployment
- ✅ Using separate staging and production environments

---

## ⚠️ Issues and Recommendations

### Issue 1: **Using Service Account Keys Instead of Workload Identity Federation**

**Current:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    credentials_json: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
```

**Problem:**
- Service account keys are long-lived credentials (security risk)
- Keys need manual rotation
- If compromised, attacker has permanent access until key is rotated
- Google recommends **against** this approach as of 2024+

**Recommended:**
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github'
    service_account: 'github-actions@static-sites-257923.iam.gserviceaccount.com'
```

**Benefits:**
- Short-lived tokens (expire after 1 hour)
- No secrets to rotate or store
- Fine-grained access control (can restrict to specific repos/branches)
- Significantly more secure

**Migration Steps:**
1. Create Workload Identity Pool
2. Create Workload Identity Provider for GitHub
3. Create service account with minimal permissions
4. Grant service account access to Workload Identity Pool
5. Update workflow to use `workload_identity_provider` instead of `credentials_json`

---

### Issue 2: **Missing Build Service Account Configuration**

**Current:** Not specifying `--build-service-account` flag

**Problem:**
- Your project was created in 2019 (before July 2024), so it uses the **legacy Cloud Build service account** by default
- The legacy account has the `roles/editor` role (extremely permissive)
- This is a security risk - Cloud Build has more permissions than it needs

**Recommended:**
```yaml
gcloud functions deploy ${{ env.FUNCTION_NAME }}-staging \
  --gen2 \
  --build-service-account=cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
  # ... other flags
```

**Create custom build service account with minimal permissions:**
```bash
# Create dedicated build service account
gcloud iam service-accounts create cloud-functions-builder \
  --display-name="Cloud Functions Build Service Account"

# Grant only required permissions
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/logging.logWriter"

# Grant Artifact Registry permissions (repository-level)
gcloud artifacts repositories add-iam-policy-binding gcf-artifacts \
  --location=us-central1 \
  --member="serviceAccount:cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

---

### Issue 3: **Missing Runtime Service Account Configuration**

**Current:** Not specifying `--service-account` flag

**Problem:**
- Functions run as the default Compute Engine service account
- Default account may have excessive permissions
- Best practice: each function should have its own service account with minimal permissions

**Recommended:**
```yaml
gcloud functions deploy ${{ env.FUNCTION_NAME }}-staging \
  --gen2 \
  --service-account=contact-form-runtime@static-sites-257923.iam.gserviceaccount.com \
  # ... other flags
```

**Create dedicated runtime service account:**
```bash
# Create runtime service account
gcloud iam service-accounts create contact-form-runtime \
  --display-name="Contact Form Runtime Service Account"

# Grant only permissions needed at runtime
# (Secret Manager access, Firestore access, etc.)
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:contact-form-runtime@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:contact-form-runtime@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

---

### Issue 4: **Artifact Registry Permissions on Default Service Account**

**Current Issue:**
- Granting `artifactregistry.writer` to the default Compute Engine service account
- This is a workaround, not a proper solution

**Why This Happened:**
- Your project uses the legacy Cloud Build service account behavior
- The default Compute Engine account is being used for builds
- We had to grant it Artifact Registry permissions as a workaround

**Proper Solution:**
- Create a custom build service account (see Issue 2)
- Grant permissions to the custom account, not the default Compute Engine account
- Remove permissions from the default account

---

### Issue 5: **Missing IAM Permission for Deployer**

**Potential Issue:** The GitHub Actions service account needs `iam.serviceAccounts.actAs` permission

**Check if needed:**
```bash
gcloud projects get-iam-policy static-sites-257923 \
  --flatten="bindings[].members" \
  --filter="bindings.members:firebase-admin@static-sites-257923.iam.gserviceaccount.com" \
  --format="table(bindings.role)"
```

**If missing, add:**
```bash
gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:firebase-admin@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.developer"

gcloud projects add-iam-policy-binding static-sites-257923 \
  --member="serviceAccount:firebase-admin@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## 📋 Recommended Action Plan

### Priority 1: Security Improvements (High Priority)

1. **Migrate to Workload Identity Federation**
   - Eliminates stored service account keys
   - Most important security improvement

2. **Create Custom Build Service Account**
   - Remove dependency on default Compute Engine account
   - Follow principle of least privilege

3. **Create Custom Runtime Service Account**
   - Isolate function runtime permissions
   - Easier to audit and manage

### Priority 2: Permission Cleanup (Medium Priority)

4. **Remove Artifact Registry Permissions from Default Account**
   - After custom build SA is created
   - Clean up temporary workaround

5. **Verify Deployer IAM Permissions**
   - Ensure GitHub Actions can deploy functions
   - Add `cloudfunctions.developer` and `iam.serviceAccountUser` if needed

### Priority 3: Documentation (Low Priority)

6. **Document Service Account Roles**
   - Create IAM documentation
   - Document what each service account does

---

## 🔐 Security Best Practices Checklist

- [ ] Use Workload Identity Federation instead of service account keys
- [ ] Create dedicated build service account with minimal permissions
- [ ] Create dedicated runtime service account for each function
- [ ] Use `--build-service-account` flag in deployment
- [ ] Use `--service-account` flag for runtime
- [ ] Grant only required IAM roles (principle of least privilege)
- [ ] Use GCP Secret Manager for sensitive values ✅ (already doing)
- [ ] Separate staging and production environments ✅ (already doing)
- [ ] Test functions after deployment ✅ (already doing)

---

## 📚 References

- [Workload Identity Federation Setup](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Custom Build Service Account](https://cloud.google.com/functions/docs/securing/build-custom-sa)
- [Function Identity Best Practices](https://cloud.google.com/functions/docs/securing/function-identity)
- [GitHub Actions Auth Action](https://github.com/google-github-actions/auth)
- [Cloud Build Service Account Changes (July 2024)](https://cloud.google.com/build/docs/cloud-build-service-account)

---

## Current Status (Updated 2025-10-06)

**Working:** ✅ Deployment pipeline fully operational with proper authentication

**Secure:** ✅ Follows Google Cloud 2025 best practices:

- Using Workload Identity Federation (no stored keys)
- Dedicated service accounts with minimal permissions
- Proper separation of deployment, build, and runtime concerns
- Repository-level access control

**Implementation Status:**

| Issue | Status | Solution |
|-------|--------|----------|
| Service Account Keys | ✅ Resolved | Migrated to Workload Identity Federation |
| Missing Build Service Account | ✅ Resolved | Created `cloud-functions-builder@` with minimal permissions |
| Missing Runtime Service Account | ✅ Resolved | Created `contact-form-runtime@` with minimal permissions |
| Artifact Registry Permissions | ✅ Resolved | Granted to custom build SA, removed from default account |
| Deployer IAM Permissions | ✅ Resolved | `github-actions-deployer@` has proper roles |

**See [SECURITY_IMPROVEMENTS_SUMMARY.md](./SECURITY_IMPROVEMENTS_SUMMARY.md) for complete details.**
