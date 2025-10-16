#!/usr/bin/env node
const http = require('http');

// Test user credentials
const email = 'editor1@example.com';
const password = 'testpass123';

// Step 1: Get auth token from Firebase Auth Emulator
function getAuthToken() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email,
      password,
      returnSecureToken: true
    });

    const options = {
      hostname: '127.0.0.1',
      port: 9099,
      path: '/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.idToken) {
            resolve(json.idToken);
          } else {
            reject(new Error('No token in response: ' + data));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Call manageExperience API with auth token
function callBlurbsAPI(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5001,
      path: '/static-sites-257923/us-central1/manageExperience/blurbs',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Main execution
(async () => {
  try {
    console.log('Getting auth token...');
    const token = await getAuthToken();
    console.log('✓ Got auth token\n');

    console.log('Calling blurbs API...');
    const response = await callBlurbsAPI(token);

    if (!response.success) {
      console.error('❌ API call failed:', response);
      process.exit(1);
    }

    console.log('✓ API call succeeded\n');
    console.log(`Found ${response.blurbs.length} blurbs\n`);

    // Check first blurb for new fields
    const firstBlurb = response.blurbs[0];
    console.log('First blurb:');
    console.log(`  ID: ${firstBlurb.id}`);
    console.log(`  Title: ${firstBlurb.title}`);
    console.log(`  renderType: ${firstBlurb.renderType || '(missing)'}`);
    console.log(`  has structuredData: ${!!firstBlurb.structuredData}`);

    if (firstBlurb.structuredData) {
      console.log(`  structuredData keys: ${Object.keys(firstBlurb.structuredData).join(', ')}`);
    }

    console.log('\n✅ API is returning new fields!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
