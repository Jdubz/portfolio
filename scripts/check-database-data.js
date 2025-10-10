#!/usr/bin/env node

/**
 * Database Data Checker
 *
 * Checks which database contains the experience data
 */

const { Firestore } = require('@google-cloud/firestore');

const PROJECT_ID = 'static-sites-257923';
const DATABASES = ['(default)', 'portfolio', 'portfolio-staging'];
const COLLECTIONS = ['experience-entries', 'experience-blurbs'];

async function checkDatabase(databaseId) {
  console.log(`\n🔍 Checking database: ${databaseId}`);

  try {
    const firestore = new Firestore({
      projectId: PROJECT_ID,
      databaseId,
    });

    for (const collectionName of COLLECTIONS) {
      try {
        const snapshot = await firestore.collection(collectionName).limit(1).get();
        const count = snapshot.size;

        if (count > 0) {
          console.log(`  ✅ ${collectionName}: ${count} documents found (showing first doc)`);
          const firstDoc = snapshot.docs[0];
          console.log(`     Doc ID: ${firstDoc.id}`);
          console.log(`     Fields: ${Object.keys(firstDoc.data()).join(', ')}`);
        } else {
          console.log(`  ⚠️  ${collectionName}: exists but empty`);
        }
      } catch (error) {
        if (error.code === 5) {
          console.log(`  ❌ ${collectionName}: does not exist`);
        } else {
          console.log(`  ❌ ${collectionName}: error - ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.log(`  ❌ Database error: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Checking for experience data across all databases...\n');
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Collections: ${COLLECTIONS.join(', ')}`);

  for (const db of DATABASES) {
    await checkDatabase(db);
  }

  console.log('\n✅ Database check complete');
}

main().catch(console.error);
