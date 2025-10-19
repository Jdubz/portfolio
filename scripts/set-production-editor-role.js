#!/usr/bin/env node

/**
 * Set 'editor' role for a user in Firebase Auth (Production)
 *
 * Security:
 * - Validates email format before lookup
 * - Validates UID format (alphanumeric, 20-28 chars)
 * - Requires explicit GOOGLE_APPLICATION_CREDENTIALS
 * - Only sets { role: 'editor' } claim (no arbitrary claims)
 * - Displays user info for confirmation before setting claims
 * - Production-only (never touches emulators)
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/credentials.json \
 *     node scripts/set-production-editor-role.js <email-or-uid>
 *
 * Examples:
 *   node scripts/set-production-editor-role.js contact@joshwentworth.com
 *   node scripts/set-production-editor-role.js s2V87QmjAsNdZfr2iGPt6uoswNY2
 */

const admin = require('firebase-admin')

const PROJECT_ID = 'static-sites-257923'

// Security: Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Security: Validate UID format (Firebase UIDs are 20-28 alphanumeric chars)
function isValidUID(uid) {
  const uidRegex = /^[a-zA-Z0-9]{20,28}$/
  return uidRegex.test(uid)
}

// Security: Sanitize input (prevent injection)
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return ''
  }
  // Remove any control characters or non-printable characters
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '')
}

async function main() {
  const rawInput = process.argv[2]

  // Security: Validate input exists
  if (!rawInput) {
    console.error('❌ Error: Email or UID required')
    console.error('')
    console.error('Usage: node scripts/set-production-editor-role.js <email-or-uid>')
    console.error('')
    console.error('Examples:')
    console.error('  node scripts/set-production-editor-role.js contact@joshwentworth.com')
    console.error('  node scripts/set-production-editor-role.js s2V87QmjAsNdZfr2iGPt6uoswNY2')
    process.exit(1)
  }

  // Security: Sanitize input
  const identifier = sanitizeInput(rawInput)

  if (identifier !== rawInput) {
    console.error('❌ Error: Invalid characters in input')
    console.error('Input contained non-printable or control characters')
    process.exit(1)
  }

  // Security: Validate format
  const isEmail = identifier.includes('@')
  if (isEmail && !isValidEmail(identifier)) {
    console.error('❌ Error: Invalid email format')
    console.error(`Provided: ${identifier}`)
    process.exit(1)
  }

  if (!isEmail && !isValidUID(identifier)) {
    console.error('❌ Error: Invalid UID format')
    console.error('UIDs must be 20-28 alphanumeric characters')
    console.error(`Provided: ${identifier}`)
    process.exit(1)
  }

  // Security: Require explicit credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set')
    console.error('')
    console.error('This is required for security - credentials must be explicit.')
    console.error('')
    console.error('Set it to your GCP credentials file:')
    console.error('  export GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/..._credentials.json')
    console.error('')
    console.error('Or run with:')
    console.error(`  GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/..._credentials.json \\`)
    console.error(`    node scripts/set-production-editor-role.js ${identifier}`)
    process.exit(1)
  }

  try {
    console.log(`🔍 Initializing Firebase Admin SDK for project: ${PROJECT_ID}`)
    console.log(`📁 Using credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`)
    console.log('')

    // Security: Initialize with explicit project ID (no emulators)
    admin.initializeApp({
      projectId: PROJECT_ID,
    })

    console.log(`🔍 Looking up user: ${identifier}`)
    console.log('')

    // Get user by email or UID
    let user
    try {
      if (isEmail) {
        user = await admin.auth().getUserByEmail(identifier)
      } else {
        user = await admin.auth().getUser(identifier)
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error('❌ User not found')
        console.error('')
        console.error('Make sure the user has signed in at least once.')
        console.error('Check Firebase Console: https://console.firebase.google.com/project/static-sites-257923/authentication/users')
        process.exit(1)
      }
      throw error
    }

    // Display user info for confirmation
    console.log(`✅ Found user:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   UID: ${user.uid}`)
    console.log(`   Email Verified: ${user.emailVerified}`)
    console.log(`   Provider: ${user.providerData.map((p) => p.providerId).join(', ')}`)

    if (user.customClaims) {
      console.log(`   Current Claims: ${JSON.stringify(user.customClaims)}`)
    } else {
      console.log(`   Current Claims: (none)`)
    }
    console.log('')

    // Security: Only set specific claim (no arbitrary claims)
    const newClaims = { role: 'editor' }

    console.log(`🔧 Setting editor role...`)
    console.log(`   New Claims: ${JSON.stringify(newClaims)}`)
    console.log('')

    await admin.auth().setCustomUserClaims(user.uid, newClaims)

    console.log(`✅ Successfully set 'editor' role for ${user.email}`)
    console.log('')
    console.log('📝 Next steps:')
    console.log('  1. User must sign out from the app')
    console.log('  2. User must sign in again')
    console.log('  3. New token will include role: "editor"')
    console.log('')
    console.log('🔍 Verify in browser console after re-login:')
    console.log('  Should see: isEditor: true, role: "editor"')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)

    if (error.code === 'app/invalid-credential') {
      console.error('')
      console.error('Invalid credentials. Check that GOOGLE_APPLICATION_CREDENTIALS points to a valid file.')
    } else if (error.code === 'auth/invalid-uid') {
      console.error('')
      console.error('Invalid UID format.')
    } else if (error.code === 'auth/invalid-email') {
      console.error('')
      console.error('Invalid email format.')
    }

    process.exit(1)
  }
}

main()
