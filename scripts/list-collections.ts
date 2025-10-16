import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

async function listCollections() {
  if (getApps().length === 0) {
    initializeApp({ projectId: 'demo-project' });
  }

  const db = getFirestore();
  const collections = await db.listCollections();

  console.log('\n=== All Collections ===');
  console.log(`Total collections: ${collections.length}`);

  for (const collection of collections) {
    const snapshot = await collection.count().get();
    console.log(`\n${collection.id}: ${snapshot.data().count} documents`);

    // Show first few document IDs
    const docs = await collection.limit(5).get();
    if (!docs.empty) {
      console.log('  Sample IDs:', docs.docs.map(d => d.id).join(', '));
    }
  }
}

listCollections().catch(console.error);
