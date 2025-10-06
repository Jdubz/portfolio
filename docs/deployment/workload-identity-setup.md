# Workload Identity Federation Setup

This document describes the Workload Identity Federation configuration for secure GitHub Actions deployments.

## Overview

We use **Workload Identity Federation** instead of service account keys to authenticate GitHub Actions with Google Cloud. This provides:

- ✅ Short-lived tokens (expire after 1 hour)
- ✅ No secrets to store or rotate
- ✅ Fine-grained access control
- ✅ Better security posture

## Architecture

### Service Accounts

We use three dedicated service accounts with minimal permissions:

#### 1. **github-actions-deployer** (Deployment)
- **Purpose**: Used by GitHub Actions to deploy Cloud Functions
- **Authentication**: Via Workload Identity Federation
- **Permissions**:
  - `roles/cloudfunctions.developer` - Deploy and manage Cloud Functions
  - `roles/iam.serviceAccountUser` - Impersonate other service accounts during deployment
- **Access**: Restricted to `Jdubz/portfolio` repository only

#### 2. **cloud-functions-builder** (Build Time)
- **Purpose**: Used by Cloud Build to create container images
- **Permissions**:
  - `roles/logging.logWriter` - Write build logs
  - `roles/artifactregistry.writer` (on gcf-artifacts repo) - Push container images
- **Access**: Can be used by `github-actions-deployer` via `--build-service-account` flag

#### 3. **contact-form-runtime** (Runtime)
- **Purpose**: Used by the contact form function during execution
- **Permissions**:
  - `roles/secretmanager.secretAccessor` - Access Mailgun credentials
  - `roles/datastore.user` - Read/write Firestore data
- **Access**: Can be used by `github-actions-deployer` via `--service-account` flag

### Workload Identity Pool

- **Pool**: `github-actions`
- **Provider**: `github` (OIDC)
- **Attribute Mapping**:
  - `google.subject` → GitHub workflow identity
  - `attribute.actor` → GitHub user/bot
  - `attribute.repository` → Repository name
  - `attribute.repository_owner` → Repository owner
- **Attribute Condition**: `assertion.repository_owner == 'Jdubz'`
  - Only workflows from repositories owned by `Jdubz` can authenticate

## Configuration

### Workload Identity Pool Details

```
projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github
```

### GitHub Actions Workflow

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/789847666726/locations/global/workloadIdentityPools/github-actions/providers/github'
    service_account: 'github-actions-deployer@static-sites-257923.iam.gserviceaccount.com'
```

### Cloud Functions Deployment

```bash
gcloud functions deploy contact-form \
  --gen2 \
  --service-account=contact-form-runtime@static-sites-257923.iam.gserviceaccount.com \
  --build-service-account=projects/static-sites-257923/serviceAccounts/cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
  # ... other flags
```

## Security Benefits

### Before (Service Account Keys)

```
GitHub Secrets
  └── Service Account JSON Key (long-lived)
       └── Permissions: Editor role (overly permissive)
            └── Risk: If leaked, permanent access until rotated
```

### After (Workload Identity Federation)

```
GitHub Actions (OIDC token)
  └── Workload Identity Pool (validates repository)
       └── github-actions-deployer SA (minimal permissions)
            └── Can impersonate:
                 ├── cloud-functions-builder SA (build only)
                 └── contact-form-runtime SA (runtime only)
```

**Key Improvements:**
- No stored secrets
- Tokens expire after 1 hour
- Separate permissions for deployment, build, and runtime
- Repository-level access control

## IAM Bindings Summary

### Project-Level

```bash
# github-actions-deployer
- roles/cloudfunctions.developer
- roles/iam.serviceAccountUser

# cloud-functions-builder
- roles/logging.logWriter

# contact-form-runtime
- roles/secretmanager.secretAccessor
- roles/datastore.user
```

### Artifact Registry (gcf-artifacts)

```bash
# cloud-functions-builder
- roles/artifactregistry.writer
```

### Service Account Impersonation

```bash
# github-actions-deployer can impersonate:
- cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com
- contact-form-runtime@static-sites-257923.iam.gserviceaccount.com

# Workload Identity Pool can impersonate:
- github-actions-deployer@static-sites-257923.iam.gserviceaccount.com
  (only from Jdubz/portfolio repository)
```

## Setup Commands (For Reference)

These commands have already been run, but are documented here for reference:

```bash
# 1. Create Workload Identity Pool
gcloud iam workload-identity-pools create github-actions \
  --project=static-sites-257923 \
  --location=global \
  --display-name="GitHub Actions Pool"

# 2. Create OIDC Provider
gcloud iam workload-identity-pools providers create-oidc github \
  --project=static-sites-257923 \
  --location=global \
  --workload-identity-pool=github-actions \
  --display-name="GitHub OIDC Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'Jdubz'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 3. Create Service Accounts
gcloud iam service-accounts create github-actions-deployer \
  --project=static-sites-257923 \
  --display-name="GitHub Actions Deployer"

gcloud iam service-accounts create cloud-functions-builder \
  --project=static-sites-257923 \
  --display-name="Cloud Functions Build Service Account"

gcloud iam service-accounts create contact-form-runtime \
  --project=static-sites-257923 \
  --display-name="Contact Form Runtime Service Account"

# 4. Grant Workload Identity Pool access to deployer SA
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@static-sites-257923.iam.gserviceaccount.com \
  --project=static-sites-257923 \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/789847666726/locations/global/workloadIdentityPools/github-actions/attribute.repository/Jdubz/portfolio"

# 5. Grant deployer permissions to use other SAs
gcloud iam service-accounts add-iam-policy-binding \
  cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
  --project=static-sites-257923 \
  --member="serviceAccount:github-actions-deployer@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts add-iam-policy-binding \
  contact-form-runtime@static-sites-257923.iam.gserviceaccount.com \
  --project=static-sites-257923 \
  --member="serviceAccount:github-actions-deployer@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 6. Grant project-level permissions (see IAM Bindings Summary above)

# 7. Grant Artifact Registry permissions
gcloud artifacts repositories add-iam-policy-binding gcf-artifacts \
  --location=us-central1 \
  --project=static-sites-257923 \
  --member="serviceAccount:cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

## Troubleshooting

### Authentication Fails

**Error**: `Failed to generate access token`

**Solution**: Verify Workload Identity Pool configuration:
```bash
gcloud iam workload-identity-pools providers describe github \
  --project=static-sites-257923 \
  --location=global \
  --workload-identity-pool=github-actions
```

### Deployment Fails with Permission Error

**Error**: `Permission denied on service account`

**Solution**: Verify github-actions-deployer can impersonate the required SAs:
```bash
gcloud iam service-accounts get-iam-policy \
  cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com
```

### Build Fails with Artifact Registry Error

**Error**: `Permission denied: artifactregistry.repositories.uploadArtifacts`

**Solution**: Verify cloud-functions-builder has Artifact Registry writer role:
```bash
gcloud artifacts repositories get-iam-policy gcf-artifacts \
  --location=us-central1 \
  --project=static-sites-257923
```

## References

- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions Auth](https://github.com/google-github-actions/auth)
- [Cloud Functions Service Accounts](https://cloud.google.com/functions/docs/securing/function-identity)
- [Custom Build Service Accounts](https://cloud.google.com/functions/docs/securing/build-custom-sa)
