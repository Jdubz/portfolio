# Infrastructure as Code - Terraform Configuration

This directory contains Terraform configurations for managing infrastructure resources.

## Firestore Databases

The `firestore.tf` file defines two Firestore databases:

### Production (`portfolio`)
- **Location**: nam5 (North America)
- **Delete Protection**: ENABLED
- **Lifecycle**: `prevent_destroy = true`
- **Purpose**: Production data storage

### Staging (`portfolio-staging`)
- **Location**: nam5 (North America)
- **Delete Protection**: DISABLED
- **Purpose**: Staging/testing environment

## Usage

### Prerequisites
```bash
# Install Terraform
brew install terraform  # macOS
# or
sudo apt-get install terraform  # Linux

# Authenticate with GCP
gcloud auth application-default login
```

### Initialize Terraform
```bash
cd infrastructure/terraform
terraform init
```

### Plan Changes
```bash
terraform plan
```

### Apply Changes
```bash
terraform apply
```

### Import Existing Resources
If databases already exist, import them:
```bash
# Import production database
terraform import google_firestore_database.portfolio_production projects/static-sites-257923/databases/portfolio

# Import staging database
terraform import google_firestore_database.portfolio_staging projects/static-sites-257923/databases/portfolio-staging
```

## State Management

**IMPORTANT**: Terraform state contains sensitive information and should be stored securely.

### Remote State (Recommended)
Configure GCS backend for team collaboration:

```hcl
terraform {
  backend "gcs" {
    bucket = "static-sites-257923-terraform-state"
    prefix = "firestore"
  }
}
```

### Local State (Current)
State is currently stored locally in `terraform.tfstate`. This file should be:
- Added to `.gitignore`
- Backed up regularly
- Never committed to version control

## Safety Features

1. **Delete Protection**: Production database has delete protection enabled
2. **Lifecycle Prevention**: Production database has `prevent_destroy = true`
3. **Environment Separation**: Separate databases for production and staging
4. **Configuration as Code**: All changes tracked in version control

## Troubleshooting

### Error: Resource already exists
If you see "resource already exists" errors:
```bash
terraform import google_firestore_database.portfolio_production projects/static-sites-257923/databases/portfolio
```

### Error: Insufficient permissions
Ensure your GCP account has the following roles:
- Cloud Datastore Owner
- Cloud Functions Admin
- Service Account User
