#!/usr/bin/env tsx
/**
 * Firestore Migration Script: defaults → personal-info
 *
 * This script migrates the generator defaults document to use the new
 * "personal-info" terminology.
 *
 * What it does:
 * 1. Finds the old "default" document
 * 2. Updates it in place with new ID and type
 * 3. Renames the document ID from "default" to "personal-info"
 *
 * Usage:
 *   # Staging
 *   DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts
 *
 *   # Production
 *   DATABASE_ID=portfolio npx tsx scripts/migrate-personal-info.ts
 *
 *   # Dry run (preview changes without applying)
 *   DRY_RUN=true DATABASE_ID=portfolio-staging npx tsx scripts/migrate-personal-info.ts
 */

import { Firestore, FieldValue } from '@google-cloud/firestore'

const DATABASE_ID = process.env.DATABASE_ID || 'portfolio-staging'
const DRY_RUN = process.env.DRY_RUN === 'true'
const COLLECTION_NAME = 'generator'
const OLD_DOC_ID = 'default'
const NEW_DOC_ID = 'personal-info'

async function migratePersonalInfo() {
  console.log('\n🔄 Starting Firestore Migration: defaults → personal-info')
  console.log(`📁 Database: ${DATABASE_ID}`)
  console.log(`🏷️  Collection: ${COLLECTION_NAME}`)
  console.log(`📝 Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE'}`)
  console.log('─'.repeat(60))

  // Initialize Firestore
  const db = new Firestore({ databaseId: DATABASE_ID })

  try {
    // Step 1: Check if old document exists
    console.log(`\n1️⃣  Checking for old document: ${OLD_DOC_ID}`)
    const oldDocRef = db.collection(COLLECTION_NAME).doc(OLD_DOC_ID)
    const oldDoc = await oldDocRef.get()

    if (!oldDoc.exists) {
      console.log(`❌ Old document "${OLD_DOC_ID}" not found.`)
      console.log(`   This could mean:`)
      console.log(`   - Migration already completed`)
      console.log(`   - Document never existed`)
      console.log(`   - Wrong database selected`)

      // Check if new document exists
      const newDocRef = db.collection(COLLECTION_NAME).doc(NEW_DOC_ID)
      const newDoc = await newDocRef.get()

      if (newDoc.exists) {
        console.log(`\n✅ New document "${NEW_DOC_ID}" already exists. Migration appears complete!`)
        const data = newDoc.data()
        console.log(`   Document details:`)
        console.log(`   - ID: ${data?.id}`)
        console.log(`   - Type: ${data?.type}`)
        console.log(`   - Name: ${data?.name}`)
        console.log(`   - Email: ${data?.email}`)
        return
      }

      console.log(`\n⚠️  Neither old nor new document found. Please check:`)
      console.log(`   - Is DATABASE_ID correct? (${DATABASE_ID})`)
      console.log(`   - Does the collection "${COLLECTION_NAME}" exist?`)
      console.log(`   - Has the document been created yet?`)
      process.exit(1)
    }

    const oldData = oldDoc.data()!
    console.log(`✅ Found old document`)
    console.log(`   Current values:`)
    console.log(`   - id: ${oldData.id}`)
    console.log(`   - type: ${oldData.type}`)
    console.log(`   - name: ${oldData.name}`)
    console.log(`   - email: ${oldData.email}`)

    // Step 2: Check if new document already exists
    console.log(`\n2️⃣  Checking if new document already exists: ${NEW_DOC_ID}`)
    const newDocRef = db.collection(COLLECTION_NAME).doc(NEW_DOC_ID)
    const newDoc = await newDocRef.get()

    if (newDoc.exists) {
      console.log(`⚠️  New document "${NEW_DOC_ID}" already exists!`)
      console.log(`   This means either:`)
      console.log(`   - Migration was partially completed`)
      console.log(`   - Someone created the new document manually`)
      console.log(`\n   Recommendation: Delete the old "${OLD_DOC_ID}" document manually if you're sure the new one is correct.`)
      process.exit(1)
    }

    console.log(`✅ New document does not exist yet. Ready to migrate.`)

    // Step 3: Create new document with updated fields
    console.log(`\n3️⃣  Creating new document: ${NEW_DOC_ID}`)

    const updatedData = {
      ...oldData,
      id: NEW_DOC_ID,
      type: 'personal-info',
      updatedAt: FieldValue.serverTimestamp(),
      migratedFrom: OLD_DOC_ID,
      migratedAt: FieldValue.serverTimestamp(),
    }

    console.log(`   Updated values:`)
    console.log(`   - id: "${OLD_DOC_ID}" → "${NEW_DOC_ID}"`)
    console.log(`   - type: "${oldData.type}" → "personal-info"`)
    console.log(`   - updatedAt: <server timestamp>`)
    console.log(`   - migratedFrom: "${OLD_DOC_ID}" (tracking field)`)
    console.log(`   - migratedAt: <server timestamp>`)

    if (DRY_RUN) {
      console.log(`\n💡 DRY RUN: Would create new document here`)
      console.log(`   Full document would be:`)
      console.log(JSON.stringify({ ...updatedData, updatedAt: '<timestamp>', migratedAt: '<timestamp>' }, null, 2))
    } else {
      await newDocRef.set(updatedData)
      console.log(`✅ Created new document "${NEW_DOC_ID}"`)
    }

    // Step 4: Delete old document
    console.log(`\n4️⃣  Deleting old document: ${OLD_DOC_ID}`)

    if (DRY_RUN) {
      console.log(`💡 DRY RUN: Would delete old document here`)
    } else {
      await oldDocRef.delete()
      console.log(`✅ Deleted old document "${OLD_DOC_ID}"`)
    }

    // Step 5: Verify migration
    console.log(`\n5️⃣  Verifying migration`)

    if (!DRY_RUN) {
      const verifyDoc = await newDocRef.get()
      if (!verifyDoc.exists) {
        console.log(`❌ ERROR: New document does not exist after migration!`)
        process.exit(1)
      }

      const verifyData = verifyDoc.data()!
      console.log(`✅ Verification successful`)
      console.log(`   Final document:`)
      console.log(`   - ID: ${verifyData.id}`)
      console.log(`   - Type: ${verifyData.type}`)
      console.log(`   - Name: ${verifyData.name}`)
      console.log(`   - Email: ${verifyData.email}`)

      const oldCheck = await oldDocRef.get()
      if (oldCheck.exists) {
        console.log(`⚠️  WARNING: Old document still exists! Manual cleanup needed.`)
      } else {
        console.log(`✅ Old document successfully removed`)
      }
    }

    console.log('\n' + '─'.repeat(60))
    console.log(`${DRY_RUN ? '💡 DRY RUN COMPLETE' : '🎉 MIGRATION COMPLETE'}`)
    console.log('─'.repeat(60))

    if (DRY_RUN) {
      console.log(`\n💡 This was a dry run. No changes were made.`)
      console.log(`   To apply changes, run without DRY_RUN:`)
      console.log(`   DATABASE_ID=${DATABASE_ID} npx tsx scripts/migrate-personal-info.ts`)
    } else {
      console.log(`\n✅ Successfully migrated document from "${OLD_DOC_ID}" to "${NEW_DOC_ID}"`)
      console.log(`\nNext steps:`)
      console.log(`1. Verify the new document in Firebase Console`)
      console.log(`2. Test the API endpoint: GET /generator/personal-info`)
      console.log(`3. Deploy backend changes`)
      console.log(`4. Test document generation`)
    }

  } catch (error) {
    console.error('\n❌ Migration failed with error:')
    console.error(error)
    process.exit(1)
  }
}

// Run migration
migratePersonalInfo()
