#!/usr/bin/env node

/**
 * Get Firebase Auth emulator ID token for testing
 * This works with the Firebase emulator without needing the UI
 */

const http = require('http');

const PROJECT_ID = 'static-sites-257923';
const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORT = 9099;
const EMAIL = process.argv[2] || 'contact@joshwentworth.com';

// Create a simple HTTP request helper
function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getToken() {
  console.log(`Getting ID token for: ${EMAIL}\n`);

  // Step 1: Get all users to find the one we want
  console.log('Finding user...');
  const usersResponse = await request({
    hostname: EMULATOR_HOST,
    port: EMULATOR_PORT,
    path: `/emulator/v1/projects/${PROJECT_ID}/accounts`,
    method: 'GET',
  });

  const user = usersResponse.users?.find(u => u.email === EMAIL);

  if (!user) {
    console.error(`Error: User not found with email: ${EMAIL}\n`);
    console.log('Available users:');
    usersResponse.users?.forEach(u => {
      console.log(`  - ${u.email} (${u.localId})`);
    });
    process.exit(1);
  }

  console.log(`Found user: ${user.email}`);
  console.log(`UID: ${user.localId}`);
  console.log(`Custom Claims: ${user.customAttributes || '{}'}\n`);

  // Step 2: Create a custom token (emulator doesn't require password)
  console.log('Generating custom token...');

  // For the emulator, we can use the REST API to get an ID token
  // We'll use the emulator's special endpoint to sign in without password
  const signInResponse = await request({
    hostname: EMULATOR_HOST,
    port: EMULATOR_PORT,
    path: `/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, {
    token: user.localId, // In emulator, we can use localId as custom token
    returnSecureToken: true,
  });

  if (signInResponse.idToken) {
    console.log('✓ Success!\n');
    console.log('==========================================');
    console.log('ID Token:');
    console.log('==========================================');
    console.log(signInResponse.idToken);
    console.log('\n==========================================\n');
    console.log('To test the Experience API, run:');
    console.log(`  ./test-experience-auth.sh '${signInResponse.idToken}'`);
    console.log('\nOr export it:');
    console.log(`  export AUTH_TOKEN='${signInResponse.idToken}'`);
    return;
  }

  // Alternative: Try sign in with email link (emulator)
  console.log('Trying alternative method...');
  const emailLinkResponse = await request({
    hostname: EMULATOR_HOST,
    port: EMULATOR_PORT,
    path: `/identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key=fake-api-key`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, {
    email: EMAIL,
    oobCode: 'emulator-code',
    returnSecureToken: true,
  });

  if (emailLinkResponse.idToken) {
    console.log('✓ Success!\n');
    console.log('==========================================');
    console.log('ID Token:');
    console.log('==========================================');
    console.log(emailLinkResponse.idToken);
    console.log('\n==========================================\n');
    console.log('To test the Experience API, run:');
    console.log(`  ./test-experience-auth.sh '${emailLinkResponse.idToken}'`);
    return;
  }

  console.error('Could not generate token using either method.');
  console.error('\nThe Firebase Auth emulator may require additional setup.');
  console.error('\nManual workaround:');
  console.error('1. Use Firebase Admin SDK to create a custom token');
  console.error('2. Or test directly with the deployed staging environment');
}

getToken().catch(console.error);
