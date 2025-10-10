# Firestore Database Management

## Overview

This project uses environment-specific Firestore databases to ensure proper separation between production, staging, and development environments.

## Database Architecture

### Databases

| Environment | Database ID | Location | Delete Protection | Purpose |
|-------------|-------------|----------|-------------------|---------|
| Production | `portfolio` | nam5 | ENABLED | Live production data |
| Staging | `portfolio-staging` | nam5 | DISABLED | Testing and staging |
| Development | `(default)` | emulator | N/A | Local development |

### Environment Variable Configuration

The database selection is controlled by environment variables in the following priority order:

1. **FIRESTORE_DATABASE_ID** - Explicit override (use with caution)
2. **Emulator Detection** - Automatically uses `(default)` when emulators are running
3. **ENVIRONMENT** - Primary environment selector (`staging` or `production`)
4. **NODE_ENV** - Fallback environment indicator
5. **Default** - Falls back to `portfolio` (production) if no env vars are set

## Infrastructure as Code (IAC)

### Terraform Management

Database infrastructure is defined in `infrastructure/terraform/firestore.tf`.

**Key Features:**
- **Delete Protection**: Production database cannot be accidentally deleted
- **Lifecycle Prevention**: `prevent_destroy = true` on production database
- **Version Control**: All configuration changes tracked in Git
- **Reproducibility**: Infrastructure can be recreated from code

**Initialize Terraform:**
```bash
cd infrastructure/terraform
terraform init
```

**View Current State:**
```bash
terraform plan
```

**Import Existing Databases:**
```bash
# Production
terraform import google_firestore_database.portfolio_production \
  projects/static-sites-257923/databases/portfolio

# Staging
terraform import google_firestore_database.portfolio_staging \
  projects/static-sites-257923/databases/portfolio-staging
```

## Cloud Function Configuration

### Setting Environment Variables

**Production (manageExperience):**
```bash
gcloud functions deploy manageExperience \
  --gen2 \
  --region=us-central1 \
  --set-env-vars=ENVIRONMENT=production,NODE_ENV=production
```

**Staging (manageExperience-staging):**
```bash
gcloud functions deploy manageExperience-staging \
  --gen2 \
  --region=us-central1 \
  --set-env-vars=ENVIRONMENT=staging,NODE_ENV=staging
```

### Verifying Configuration

Check which database a deployed function is using:

```bash
# Check environment variables
gcloud functions describe manageExperience \
  --gen2 \
  --region=us-central1 \
  --format="value(serviceConfig.environmentVariables)"

# Check logs for database confirmation
gcloud logging read "resource.labels.function_name=manageExperience" \
  --limit=10 \
  --format="value(textPayload)" | grep "Database Config"
```

## Safety Mechanisms

### 1. Delete Protection

Production database has delete protection enabled at the GCP level:

```bash
# Verify delete protection status
gcloud firestore databases describe portfolio \
  --format="value(deleteProtectionState)"
```

### 2. Terraform Lifecycle Rules

Production database has `prevent_destroy = true` in Terraform:
```hcl
lifecycle {
  prevent_destroy = true
}
```

This prevents accidental destruction via Terraform.

### 3. Environment Validation

The database configuration validates at module load time:

```typescript
if (!DATABASE_ID || DATABASE_ID === "") {
  throw new Error("DATABASE_ID must be set. Check environment configuration.")
}
```

### 4. Logging (Non-Production Only)

Database selection is logged in non-production environments:
```
[Database Config] Using database: portfolio-staging
[Database Config] Environment: staging
```

## Data Migration

### Exporting Data

**From Production:**
```bash
gcloud firestore export gs://static-sites-257923-backups/$(date +%Y%m%d) \
  --database=portfolio \
  --project=static-sites-257923
```

**From Staging:**
```bash
gcloud firestore export gs://static-sites-257923-backups/staging-$(date +%Y%m%d) \
  --database=portfolio-staging \
  --project=static-sites-257923
```

### Importing Data

**To Staging:**
```bash
gcloud firestore import gs://static-sites-257923-backups/BACKUP_FOLDER \
  --database=portfolio-staging \
  --project=static-sites-257923
```

**To Production (USE WITH EXTREME CAUTION):**
```bash
# This will OVERWRITE production data!
gcloud firestore import gs://static-sites-257923-backups/BACKUP_FOLDER \
  --database=portfolio \
  --project=static-sites-257923
```

### Copying Data Between Databases

To copy specific collections from production to staging:

```bash
# Export from production
gcloud firestore export gs://static-sites-257923-backups/migration \
  --database=portfolio \
  --collection-ids=experience-entries,experience-blurbs \
  --project=static-sites-257923

# Import to staging
gcloud firestore import gs://static-sites-257923-backups/migration \
  --database=portfolio-staging \
  --project=static-sites-257923
```

## Troubleshooting

### Issue: Function using wrong database

**Symptoms:**
- Data not found errors
- Collections missing
- Unexpected behavior

**Solution:**
1. Check environment variables:
   ```bash
   gcloud functions describe FUNCTION_NAME \
     --gen2 \
     --region=us-central1 \
     --format="value(serviceConfig.environmentVariables)"
   ```

2. Check logs for database selection:
   ```bash
   gcloud logging read "resource.labels.function_name=FUNCTION_NAME" \
     --limit=20 | grep "Database Config"
   ```

3. Redeploy with correct environment variables:
   ```bash
   firebase deploy --only functions:FUNCTION_NAME
   ```

### Issue: Database doesn't exist

**Symptoms:**
- `5 NOT_FOUND` errors
- "database not found" messages

**Solution:**
1. Verify database exists:
   ```bash
   gcloud firestore databases list --project=static-sites-257923
   ```

2. Create missing database (if needed):
   ```bash
   # Via Terraform (recommended)
   cd infrastructure/terraform
   terraform apply

   # Or via gcloud
   gcloud firestore databases create \
     --database=DATABASE_NAME \
     --location=nam5 \
     --type=firestore-native
   ```

### Issue: Permission denied

**Symptoms:**
- IAM permission errors
- "Insufficient permissions" messages

**Solution:**
1. Check service account permissions:
   ```bash
   gcloud projects get-iam-policy static-sites-257923 \
     --flatten="bindings[].members" \
     --filter="bindings.members:SERVICE_ACCOUNT_EMAIL"
   ```

2. Grant necessary roles:
   ```bash
   gcloud projects add-iam-policy-binding static-sites-257923 \
     --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
     --role="roles/datastore.user"
   ```

## Best Practices

1. **Never hardcode database names** - Always use environment variables
2. **Test in staging first** - Validate all changes before production deployment
3. **Regular backups** - Export production data weekly (automated via Cloud Scheduler)
4. **Monitor database usage** - Set up alerts for quota limits
5. **Use IAC** - Manage all infrastructure changes through Terraform
6. **Document changes** - Update this file when making infrastructure changes
7. **Validate deployments** - Check logs after deployment to confirm correct database

## Emergency Procedures

### Accidentally deployed to wrong database

1. **Immediately redeploy** with correct environment variables:
   ```bash
   firebase deploy --only functions:FUNCTION_NAME
   ```

2. **Verify** the fix:
   ```bash
   curl -s https://FUNCTION_URL/health | jq '.database'
   ```

3. **Check for data corruption** in both databases

4. **Restore from backup** if necessary

### Database deleted accidentally

1. **Check if Terraform state exists**:
   ```bash
   cd infrastructure/terraform
   terraform show
   ```

2. **Restore via Terraform**:
   ```bash
   terraform apply
   ```

3. **Import latest backup**:
   ```bash
   gcloud firestore import gs://static-sites-257923-backups/LATEST_BACKUP \
     --database=DATABASE_NAME
   ```

## Monitoring

### Set up alerts for:
- Database quota usage (>80%)
- Read/write operations (unusual spikes)
- Error rates from Firestore operations
- Failed backup jobs

### Key Metrics:
- Document count per collection
- Read/write operations per minute
- Storage usage
- Index usage

## Compliance

- **Data Residency**: All data stored in North America (nam5)
- **Encryption**: Data encrypted at rest and in transit (GCP default)
- **Access Control**: IAM-based access control
- **Audit Logging**: All operations logged to Cloud Logging
- **Backup Retention**: 30-day retention for production backups

---

**Last Updated**: 2025-10-10
**Maintained By**: Infrastructure Team
**Review Cadence**: Quarterly
