import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

async function checkBlurbs() {
  if (getApps().length === 0) {
    initializeApp({ projectId: 'demo-project' });
  }

  const db = getFirestore();
  const blurbsSnapshot = await db.collection('blurbs').get();

  console.log('\n=== All Blurbs ===');
  console.log('Total blurbs:', blurbsSnapshot.size);

  blurbsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log('\nBlurb:', doc.id);
    console.log('  Name:', data.name);
    console.log('  Title:', data.title);
    console.log('  Type:', data.type || '(no type field)');
    console.log('  Order:', data.order ?? '(no order field)');
  });

  // Also check what would be filtered as "page blurbs"
  const pageBlurbs = blurbsSnapshot.docs
    .map(doc => doc.data())
    .filter(blurb => blurb.type === 'page' || !blurb.type);

  console.log('\n=== Page Blurbs (type="page" or no type) ===');
  console.log('Total page blurbs:', pageBlurbs.length);

  const introBlurb = pageBlurbs.find(b => b.name === 'intro');
  const otherBlurbs = pageBlurbs.filter(b => b.name !== 'intro');

  console.log('\n=== Other Blurbs (excluding intro) ===');
  console.log('Total other blurbs:', otherBlurbs.length);
  otherBlurbs.forEach(blurb => {
    console.log(`  - ${blurb.name}: ${blurb.title} (order: ${blurb.order ?? 'none'})`);
  });
}

checkBlurbs().catch(console.error);
