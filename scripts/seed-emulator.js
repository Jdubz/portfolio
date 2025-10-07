#!/usr/bin/env node

/**
 * Seed Firebase emulators with test data
 * Run this after starting emulators to set up test users and data
 */

const admin = require('firebase-admin');

// Point to emulators
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'static-sites-257923',
});

const auth = admin.auth();
const db = admin.firestore();

async function seedAuth() {
  console.log('🔐 Seeding Auth emulator...\n');

  const testUsers = [
    {
      uid: 'test-editor-1',
      email: 'contact@joshwentworth.com',
      emailVerified: true,
      displayName: 'Josh Wentworth',
      customClaims: { role: 'editor' },
    },
    {
      uid: 'test-editor-2',
      email: 'jwentwor@gmail.com',
      emailVerified: true,
      displayName: 'Josh W',
      customClaims: { role: 'editor' },
    },
    {
      uid: 'test-user-1',
      email: 'user@example.com',
      emailVerified: true,
      displayName: 'Regular User',
      customClaims: {}, // No editor role
    },
  ];

  for (const userData of testUsers) {
    try {
      // Try to get existing user
      let user;
      try {
        user = await auth.getUser(userData.uid);
        console.log(`  ✓ User exists: ${userData.email}`);
      } catch (e) {
        // Create user
        user = await auth.createUser({
          uid: userData.uid,
          email: userData.email,
          emailVerified: userData.emailVerified,
          displayName: userData.displayName,
          password: 'testpass123', // For emulator testing
        });
        console.log(`  ✓ Created user: ${userData.email}`);
      }

      // Set custom claims
      await auth.setCustomUserClaims(userData.uid, userData.customClaims);
      console.log(`    Claims: ${JSON.stringify(userData.customClaims)}`);
    } catch (error) {
      console.error(`  ✗ Error with ${userData.email}:`, error.message);
    }
  }

  console.log('\n✅ Auth seeding complete!\n');
}

async function seedFirestore() {
  console.log('📦 Seeding Firestore emulator...\n');

  // Create sample experience entries
  const experienceEntries = [
    {
      id: 'sample-entry-1',
      title: 'Senior Full-Stack Developer',
      startDate: '2023-01',
      endDate: '2024-12',
      body: 'Built and maintained scalable web applications using React, Node.js, and Firebase.',
      notes: 'Remote position, promoted twice',
      createdBy: 'contact@joshwentworth.com',
      updatedBy: 'contact@joshwentworth.com',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
    {
      id: 'sample-entry-2',
      title: 'Frontend Developer',
      startDate: '2021-06',
      endDate: '2022-12',
      body: 'Specialized in React and TypeScript development.',
      notes: '',
      createdBy: 'contact@joshwentworth.com',
      updatedBy: 'contact@joshwentworth.com',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    },
  ];

  const experienceRef = db.collection('experience');

  for (const entry of experienceEntries) {
    try {
      await experienceRef.doc(entry.id).set(entry);
      console.log(`  ✓ Created experience: ${entry.title}`);
    } catch (error) {
      console.error(`  ✗ Error creating ${entry.title}:`, error.message);
    }
  }

  console.log('\n✅ Firestore seeding complete!\n');
}

async function generateTestToken() {
  console.log('🎟️  Generating test token...\n');

  const uid = 'test-editor-1';
  const customToken = await auth.createCustomToken(uid);

  // Exchange for ID token
  const fetch = require('node-fetch');
  const response = await fetch(
    'http://127.0.0.1:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=fake-api-key',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    }
  );

  const data = await response.json();

  if (data.idToken) {
    console.log('✅ Test token generated!\n');
    console.log('==========================================');
    console.log('ID Token for contact@joshwentworth.com:');
    console.log('==========================================');
    console.log(data.idToken);
    console.log('\n==========================================\n');
    console.log('To test the Experience API:');
    console.log(`  ./test-experience-auth.sh '${data.idToken}'`);
    console.log('\nOr save it:');
    console.log(`  export AUTH_TOKEN='${data.idToken}'`);
    console.log('');
  } else {
    console.error('Error generating token:', data);
  }
}

async function main() {
  console.log('==========================================');
  console.log('🌱 Seeding Firebase Emulators');
  console.log('==========================================\n');

  try {
    await seedAuth();
    await seedFirestore();
    await generateTestToken();

    console.log('==========================================');
    console.log('✅ All seeding complete!');
    console.log('==========================================\n');

    console.log('Next steps:');
    console.log('  1. Use the token above to test the API');
    console.log('  2. View data at http://127.0.0.1:4000');
    console.log('  3. When done, stop emulators (data will be saved to ./emulator-data)');
    console.log('  4. Next time, data will be auto-imported on startup\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
