#!/usr/bin/env node

/**
 * Copy Production Data to Staging
 *
 * Copies all documents from portfolio (production) database
 * to portfolio-staging database.
 */

const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

const PROJECT_ID = 'static-sites-257923';
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
  console.log('🔄 Copying data from production to staging...\n');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Collections: ${COLLECTIONS.join(', ')}\n`);

  // Initialize Firestore clients directly (bypasses Firebase Admin to allow multiple DBs)
  const productionDb = new Firestore({
    projectId: PROJECT_ID,
    databaseId: 'portfolio',
  });

  const stagingDb = new Firestore({
    projectId: PROJECT_ID,
    databaseId: 'portfolio-staging',
  });

  let totalCopied = 0;

  for (const collection of COLLECTIONS) {
    try {
      const count = await copyCollection(productionDb, stagingDb, collection);
      totalCopied += count;
    } catch (error) {
      console.error(`   ❌ Error copying ${collection}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`\n✅ Successfully copied ${totalCopied} total documents from production to staging`);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
