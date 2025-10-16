#!/usr/bin/env node

/**
 * Copy Production Data to Local Emulator
 *
 * Copies all documents from portfolio (production) database
 * to local Firestore emulator.
 *
 * IMPORTANT: Start the Firebase emulator before running this script:
 *   npm run firebase:serve
 */

const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

const PROJECT_ID = 'static-sites-257923';
const EMULATOR_HOST = 'localhost:8080';
const COLLECTIONS = ['experience-entries', 'experience-blurbs'];

async function copyCollection(sourceDb, targetDb, collectionName) {
  console.log(`\n📋 Copying collection: ${collectionName}`);

  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);

  const snapshot = await sourceCollection.get();

  console.log(`   Found ${snapshot.size} documents`);

  let copied = 0;
  for (const doc of snapshot.docs) {
    await targetCollection.doc(doc.id).set(doc.data());
    copied++;
    if (copied % 10 === 0) {
      console.log(`   Copied ${copied}/${snapshot.size}...`);
    }
  }

  console.log(`   ✅ Copied ${copied} documents`);
  return copied;
}

async function main() {
  console.log('🔄 Copying data from production to local emulator...\n');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Emulator: ${EMULATOR_HOST}`);
  console.log(`Collections: ${COLLECTIONS.join(', ')}\n`);

  // Initialize production Firestore client
  const productionDb = new Firestore({
    projectId: PROJECT_ID,
    databaseId: 'portfolio',
  });

  // Initialize local emulator Firestore client
  process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_HOST;
  const emulatorDb = new Firestore({
    projectId: PROJECT_ID,
    databaseId: '(default)',
  });

  let totalCopied = 0;

  for (const collection of COLLECTIONS) {
    try {
      const count = await copyCollection(productionDb, emulatorDb, collection);
      totalCopied += count;
    } catch (error) {
      console.error(`   ❌ Error copying ${collection}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ Successfully copied ${totalCopied} total documents from production to local emulator`);
  console.log(`\n💡 Tip: You can now run the migration script to add new fields:\n   node scripts/migrate-experience-structure.js`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
