#!/usr/bin/env node
/**
 * Set 'editor' role for a user in Firebase Auth (Production)
 * Usage: node scripts/set-production-editor-role.js <email-or-uid>
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS environment variable
 *
 * Example:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \
 *     node scripts/set-production-editor-role.js contact@joshwentworth.com
 */

const admin = require('firebase-admin');

const PROJECT_ID = 'static-sites-257923';

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error('❌ Error: Email or UID required');
    console.error('');
    console.error('Usage: node scripts/set-production-editor-role.js <email-or-uid>');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/set-production-editor-role.js contact@joshwentworth.com');
    console.error('  node scripts/set-production-editor-role.js s2V87QmjAsNdZfr2iGPt6uoswNY2');
    console.error('');
    console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set:');
    console.error('  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json');
    process.exit(1);
  }

  // Check for credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
    console.error('');
    console.error('Set it to your GCP credentials file:');
    console.error('  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json');
    console.error('');
    console.error('Or run with:');
    console.error(`  GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/application_default_credentials.json \\`);
    console.error(`    node scripts/set-production-editor-role.js ${identifier}`);
    process.exit(1);
  }

  try {
    console.log(`🔍 Initializing Firebase Admin SDK for project: ${PROJECT_ID}`);
    console.log(`📁 Using credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    console.log('');

    // Initialize Firebase Admin
    admin.initializeApp({
      projectId: PROJECT_ID,
    });

    console.log(`🔍 Looking up user: ${identifier}`);

    // Get user by email or UID
    let user;
    if (identifier.includes('@')) {
      user = await admin.auth().getUserByEmail(identifier);
    } else {
      user = await admin.auth().getUser(identifier);
    }

    console.log(`✅ Found user:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email Verified: ${user.emailVerified}`);

    if (user.customClaims) {
      console.log(`   Current Claims: ${JSON.stringify(user.customClaims)}`);
    } else {
      console.log(`   Current Claims: (none)`);
    }
    console.log('');

    // Set custom claims
    console.log(`🔧 Setting 'editor' role...`);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'editor' });

    console.log(`✅ Successfully set 'editor' role for ${user.email}`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. User must sign out from the app');
    console.log('  2. User must sign in again');
    console.log('  3. New token will include role: "editor"');
    console.log('');
    console.log('🔍 Verify in browser console after re-login:');
    console.log('  Should see: isEditor: true, role: "editor"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'auth/user-not-found') {
      console.error('');
      console.error('User not found. Make sure they have signed in at least once.');
    } else if (error.code === 'app/invalid-credential') {
      console.error('');
      console.error('Invalid credentials. Make sure GOOGLE_APPLICATION_CREDENTIALS points to a valid file.');
    }

    process.exit(1);
  }
}

main();
