#!/usr/bin/env -S npx tsx

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

async function inspectData() {
  if (getApps().length === 0) {
    initializeApp({ projectId: 'demo-project' });
  }

  const db = getFirestore();
  const entriesSnapshot = await db.collection('experience-entries').limit(3).get();

  console.log('\n=== Sample Experience Entries ===');
  console.log(`Total found: ${entriesSnapshot.size}\n`);

  entriesSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Entry ID: ${doc.id}`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Role: ${data.role || '(none)'}`);
    console.log(`  Body length: ${data.body ? data.body.length : 0} chars`);
    console.log(`  Body preview: ${data.body ? data.body.substring(0, 150).replace(/\n/g, ' ') + '...' : '(none)'}`);
    console.log(`  Order: ${data.order}`);
    console.log(`  RelatedBlurbIds: ${JSON.stringify(data.relatedBlurbIds || [])}`);
    console.log('');
  });
}

inspectData().catch(console.error);
