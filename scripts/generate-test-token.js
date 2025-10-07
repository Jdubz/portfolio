#!/usr/bin/env node

/**
 * Generate a Firebase Auth custom token for testing with the emulator
 * Uses Firebase Admin SDK
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'static-sites-257923',
});

const uid = process.argv[2] || '6nR98AIut9QHSYKE99qyXBUbLM2'; // UID from your screenshot
const email = process.argv[3] || 'contact@joshwentworth.com';

async function generateToken() {
  try {
    console.log(`Generating custom token for UID: ${uid}\n`);

    // Create a custom token with the editor role claim
    const customToken = await admin.auth().createCustomToken(uid, {
      role: 'editor',
      email: email,
    });

    console.log('✓ Custom token created!\n');
    console.log('Step 1: Exchange custom token for ID token');
    console.log('==========================================');
    console.log(customToken);
    console.log('\n==========================================\n');

    console.log('Step 2: Exchange for ID token using:');
    console.log('');
    console.log(`curl -X POST "http://127.0.0.1:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=fake-api-key" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"token":"${customToken}","returnSecureToken":true}' \\`);
    console.log(`  | python3 -c "import sys,json; print(json.load(sys.stdin)['idToken'])"`);
    console.log('');

    // Actually do the exchange
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
      console.log('\n✓ ID Token generated successfully!\n');
      console.log('==========================================');
      console.log('ID Token:');
      console.log('==========================================');
      console.log(data.idToken);
      console.log('\n==========================================\n');
      console.log('To test the Experience API:');
      console.log(`  ./test-experience-auth.sh '${data.idToken}'`);
      console.log('');
      console.log('Or save it:');
      console.log(`  export AUTH_TOKEN='${data.idToken}'`);
    } else {
      console.error('Error getting ID token:', data);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generateToken();
