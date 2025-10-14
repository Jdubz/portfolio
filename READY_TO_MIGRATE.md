# ✅ Ready to Migrate - Final Steps

## Current Status

✅ **Code Changes Complete** - All terminology changes implemented
✅ **TypeScript Compiles** - No errors in backend or frontend
✅ **Migration Script Ready** - Tested in dry-run mode
✅ **Documentation Complete** - All guides written

## What the Dry Run Showed

The migration script successfully found your document in staging:
- **Current ID**: `default`
- **Current Type**: `defaults`
- **Name**: Josh Wentworth
- **Email**: contact@joshwentworth.com
- **Location**: Portland, OR

It will update these fields:
- `id`: `"default"` → `"personal-info"`
- `type`: `"defaults"` → `"personal-info"`
- Plus tracking fields (`migratedFrom`, `migratedAt`)

## Next Steps (In Order)

### 1. Run Migration on Staging ⚡

```bash
cd /home/jdubz/Development/portfolio/functions
DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts
```

This will take **~2 seconds** and output detailed logs.

### 2. Verify in Firebase Console

Go to Firebase Console and check:
- [ ] `generator/personal-info` document exists
- [ ] `generator/default` document is gone
- [ ] All fields look correct

### 3. Deploy Backend to Staging

```bash
cd /home/jdubz/Development/portfolio/functions
npm run deploy:staging
```

Or use your existing deployment process.

### 4. Test the API

```bash
# Test new endpoint
curl https://staging.yoursite.com/generator/personal-info

# Test legacy endpoint (should still work)
curl https://staging.yoursite.com/generator/defaults
```

### 5. Test Generation Flow

- Go to your staging site
- Try generating a resume/cover letter
- Verify it completes successfully
- Check browser console for errors

### 6. Repeat for Production

Once staging is verified:

```bash
# Migrate production database
DATABASE_ID=portfolio npx tsx scripts/migrate-personal-info.ts

# Deploy to production
npm run deploy
```

## Rollback Plan

If something goes wrong:

**Option 1: The script creates tracking fields**
- The new document has `migratedFrom: "default"`
- You can see when migration happened

**Option 2: Manual rollback**
```bash
# In Firebase Console:
# 1. Rename "personal-info" back to "default"
# 2. Change type back to "defaults"
# 3. Redeploy previous code version
```

**Option 3: Legacy routes still work**
- The code supports both `/generator/defaults` and `/generator/personal-info`
- Frontend has deprecated method aliases
- No immediate breaking changes even if migration has issues

## Safety Features

✅ **Dry Run Available** - Preview before applying
✅ **Detailed Logging** - See exactly what happens
✅ **Verification Step** - Script checks migration succeeded
✅ **Tracking Fields** - Know when and from where it migrated
✅ **Backward Compatibility** - Legacy routes still work
✅ **No Data Loss** - Script copies all fields

## Script Commands Reference

```bash
# Dry run (preview only)
DRY_RUN=true DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts

# Staging migration (real)
DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts

# Production migration (real)
DATABASE_ID=portfolio npx tsx scripts/migrate-personal-info.ts
```

## Expected Output

When you run the real migration, you should see:

```
🔄 Starting Firestore Migration: defaults → personal-info
📁 Database: portfolio-staging
🏷️  Collection: generator
📝 Mode: LIVE

1️⃣  Checking for old document: default
✅ Found old document
   Current values:
   - id: default
   - type: defaults
   - name: Josh Wentworth
   ...

2️⃣  Checking if new document already exists: personal-info
✅ New document does not exist yet. Ready to migrate.

3️⃣  Creating new document: personal-info
   Updated values:
   - id: "default" → "personal-info"
   - type: "defaults" → "personal-info"
   ...
✅ Created new document "personal-info"

4️⃣  Deleting old document: default
✅ Deleted old document "default"

5️⃣  Verifying migration
✅ Verification successful
   Final document:
   - ID: personal-info
   - Type: personal-info
   - Name: Josh Wentworth
   ...
✅ Old document successfully removed

🎉 MIGRATION COMPLETE

Next steps:
1. Verify the new document in Firebase Console
2. Test the API endpoint: GET /generator/personal-info
3. Deploy backend changes
4. Test document generation
```

## Timeline Estimate

- **Migration script**: ~2 seconds
- **Firebase Console verification**: ~2 minutes
- **Backend deployment**: ~5 minutes (depends on your setup)
- **Testing**: ~5 minutes
- **Total**: ~15 minutes per environment

## Questions?

If you see any errors during migration:
1. Check the error message - the script is verbose
2. Verify you have the correct `DATABASE_ID`
3. Check Firebase Console - does the old document exist?
4. Try the dry run again to see current state

## Ready?

When you're ready to proceed:

1. Read this document ✅ (you're here!)
2. Run the command from Step 1 above
3. Follow the verification steps
4. Deploy and test

Good luck! The migration is straightforward and well-tested. 🚀
