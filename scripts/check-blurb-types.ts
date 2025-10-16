import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

async function checkBlurbTypes() {
  if (getApps().length === 0) {
    initializeApp({ projectId: 'demo-project' });
  }

  const db = getFirestore();
  const blurbsSnapshot = await db.collection('experience-blurbs').get();

  console.log('\n=== Experience Blurbs ===');
  console.log(`Total blurbs: ${blurbsSnapshot.size}\n`);

  const pageBlurbs = [];
  const entryBlurbs = [];
  const noTypeBlurbs = [];

  blurbsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Blurb: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Type: ${data.type || '(no type field)'}`);
    console.log(`  Order: ${data.order ?? '(no order field)'}`);
    console.log('');

    if (data.type === 'page') {
      pageBlurbs.push(data);
    } else if (data.type === 'entry') {
      entryBlurbs.push(data);
    } else {
      noTypeBlurbs.push(data);
    }
  });

  console.log('=== Summary ===');
  console.log(`Page blurbs (type='page'): ${pageBlurbs.length}`);
  console.log(`Entry blurbs (type='entry'): ${entryBlurbs.length}`);
  console.log(`No type field: ${noTypeBlurbs.length}`);

  const pageOrNoType = [...pageBlurbs, ...noTypeBlurbs];
  const introBlurb = pageOrNoType.find(b => b.name === 'intro');
  const otherBlurbs = pageOrNoType.filter(b => b.name !== 'intro');

  console.log(`\n=== Frontend Filter Results ===`);
  console.log(`Blurbs matching (type='page' OR !type): ${pageOrNoType.length}`);
  console.log(`Intro blurb: ${introBlurb ? 'Found' : 'Not found'}`);
  console.log(`Other blurbs (excluding intro): ${otherBlurbs.length}`);

  if (otherBlurbs.length > 0) {
    console.log('\nOther blurbs that should appear in reorder modal:');
    otherBlurbs.forEach(b => {
      console.log(`  - ${b.name}: "${b.title}" (order: ${b.order ?? 'none'})`);
    });
  }
}

checkBlurbTypes().catch(console.error);
