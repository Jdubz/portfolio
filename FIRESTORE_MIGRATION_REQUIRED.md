# ⚠️ FIRESTORE MIGRATION REQUIRED BEFORE DEPLOYMENT

## Critical Action Required

Before deploying the recent code changes, you **MUST** migrate the Firestore document:

**Current Document**: `generator/default`
**New Document**: `generator/personal-info`

## Why This is Necessary

The codebase has been updated to use "personalInfo" terminology instead of "defaults". The backend service now looks for a document with ID `personal-info` instead of `default`.

If you deploy without migrating the document, **the generator will fail** with the error:
```
Personal info not found. Please seed the personal-info document.
```

## Migration Options

### Option A: Migration Script (Recommended - Automated)

A migration script has been created at `functions/scripts/migrate-personal-info.ts` that:
- ✅ Updates the document in place
- ✅ Handles all field updates automatically
- ✅ Includes dry-run mode to preview changes
- ✅ Provides detailed logging
- ✅ Verifies migration success

**Dry Run (Preview changes without applying):**
```bash
cd /home/jdubz/Development/portfolio/functions
DRY_RUN=true DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts
```

**Run Migration on Staging:**
```bash
DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts
```

**Run Migration on Production:**
```bash
DATABASE_ID=portfolio npx tsx scripts/migrate-personal-info.ts
```

The script will:
1. Check if the old `default` document exists
2. Create a new `personal-info` document with updated fields
3. Delete the old `default` document
4. Verify the migration succeeded

**What the script updates:**
- `id`: `"default"` → `"personal-info"`
- `type`: `"defaults"` → `"personal-info"`
- `updatedAt`: Set to current timestamp
- Adds `migratedFrom` and `migratedAt` tracking fields

### Option B: Firebase Console (Manual Fallback)

If the script doesn't work for any reason:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `static-sites-257923`
3. Navigate to **Firestore Database**
4. Select the correct database:
   - For production: `portfolio`
   - For staging: `portfolio-staging`
5. Find the `generator` collection
6. Click on the `default` document
7. Copy all field values
8. Create a new document with ID: `personal-info`
9. Paste all field values
10. **Important**: Update these fields in the new document:
    - `id`: Change to `"personal-info"`
    - `type`: Change to `"personal-info"`
11. Verify the new document exists
12. Delete the old `default` document

## Migration Checklist

- [ ] **Staging Environment**
  - [ ] Migrate `portfolio-staging` database
  - [ ] Verify new document exists
  - [ ] Delete old document
  - [ ] Deploy backend changes to staging
  - [ ] Test generation flow
  - [ ] Verify no errors

- [ ] **Production Environment**
  - [ ] Migrate `portfolio` database
  - [ ] Verify new document exists
  - [ ] Delete old document
  - [ ] Deploy backend changes to production
  - [ ] Test generation flow
  - [ ] Monitor for errors

## Verification Steps

After migration, verify:

1. **Document exists**: Check that `generator/personal-info` exists in Firestore
2. **Fields are correct**: Verify `id` and `type` fields are `"personal-info"`
3. **API works**: Test `GET /generator/personal-info` endpoint
4. **Generation works**: Generate a test document

## What if I Forget?

If you deploy without migrating:
- ✅ **Good news**: Legacy routes are still supported (`/generator/defaults`)
- ✅ **Good news**: Frontend has deprecated method aliases
- ❌ **Bad news**: Backend service will fail to find the document
- ❌ **Bad news**: Generation will fail until migration is complete

**To fix**: Simply run the migration using Option A or B above.

## Timeline

**Recommended order:**
1. Migrate staging database
2. Test on staging
3. Migrate production database
4. Deploy to production

**Do not skip staging testing!**

## Need Help?

If you encounter issues:
1. Check Firestore console - does the `personal-info` document exist?
2. Check the document fields - are `id` and `type` set correctly?
3. Check backend logs - what error is being reported?
4. Rollback option: Rename `personal-info` back to `default` temporarily

## Status

- [ ] Staging database migrated
- [ ] Staging deployment verified
- [ ] Production database migrated
- [ ] Production deployment verified

**Date migration completed**: _____________

**Completed by**: _____________
