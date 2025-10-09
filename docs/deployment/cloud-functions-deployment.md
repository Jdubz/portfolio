# Cloud Functions Deployment Guide

## The Build Service Account Issue

When deploying Cloud Functions, there's a critical difference between using **Firebase CLI** (`firebase deploy`) and **gcloud CLI** (`gcloud functions deploy`):

### Problem

Firebase CLI does not support specifying a build service account. It defaults to using the Compute Engine default service account (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`), which lacks permissions to write to Artifact Registry.

This causes deployment failures with errors like:
```
Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/static-sites-257923/locations/us-central1/repositories/gcf-artifacts"
```

### Solution

Always use `gcloud functions deploy` with the `--build-service-account` flag for new function deployments.

## Deployment Methods

### Method 1: Using the deployment script (Recommended)

```bash
./scripts/deploy-function.sh <function-name>
```

Example:
```bash
./scripts/deploy-function.sh uploadResume
```

### Method 2: Using gcloud CLI directly

```bash
gcloud functions deploy <FUNCTION_NAME> \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=functions \
  --entry-point=<FUNCTION_NAME> \
  --trigger-http \
  --build-service-account=projects/static-sites-257923/serviceAccounts/cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
  --service-account=<RUNTIME_SERVICE_ACCOUNT> \
  --timeout=60s \
  --memory=512MB \
  --max-instances=<MAX_INSTANCES>
```

### Method 3: Using GitHub Actions (Automated)

The GitHub Actions workflow (`.github/workflows/deploy-cloud-functions.yml`) automatically uses the correct build service account. Simply push to `main` or `staging` branch with changes in the `functions/` directory.

## Service Accounts

### Build Service Account
- **Account**: `cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com`
- **Purpose**: Used during Cloud Build to create the function container image
- **Permissions**:
  - `roles/artifactregistry.writer` (repository level)
  - `roles/logging.logWriter` (project level)

### Runtime Service Accounts

Functions use different service accounts at runtime depending on their purpose:

- **cloud-functions-builder**: Admin functions (manageExperience, uploadResume)
- **contact-form-runtime**: Contact form function
- **789847666726-compute**: Default Compute Engine account (legacy)

## Why This Matters

1. **First deployment**: Must use gcloud with `--build-service-account`
2. **Updates**: Can use either Firebase CLI or gcloud
3. **CI/CD**: GitHub Actions already configured correctly

## Troubleshooting

### "Permission denied" errors during build
- Check that `cloud-functions-builder` has `artifactregistry.writer` role
- Wait 5-10 minutes for IAM permissions to propagate
- Use gcloud CLI instead of Firebase CLI for first deployment

### Function exists but doesn't work
```bash
# Delete the broken function
gcloud functions delete <FUNCTION_NAME> --gen2 --region=us-central1 --quiet

# Redeploy with correct build service account
./scripts/deploy-function.sh <FUNCTION_NAME>
```

## References

- [GitHub Actions Workflow](.github/workflows/deploy-cloud-functions.yml)
- [Deployment Script](../scripts/deploy-function.sh)
- [Service Account Setup](./workload-identity-setup.md)
