#!/usr/bin/env node
/**
 * Setup Auth Emulator with test users
 *
 * This script adds test users to the Firebase Auth Emulator
 * with the necessary custom claims for local development.
 *
 * Usage:
 *   node scripts/setup-emulator-auth.js
 *
 * Prerequisites:
 *   - Firebase emulators must be running (make firebase-emulators)
 *   - Emulator auth should be accessible at localhost:9099
 */

const admin = require("firebase-admin")

// Emulator configuration
const EMULATOR_HOST = process.env.GATSBY_EMULATOR_HOST || "localhost"
const AUTH_EMULATOR_URL = `http://${EMULATOR_HOST}:9099`

// Test users to create
const TEST_USERS = [
  {
    email: "contact@joshwentworth.com",
    password: "testpassword123",
    displayName: "Josh Wentworth (Editor)",
    emailVerified: true,
    customClaims: { role: "editor" },
  },
  {
    email: "test@example.com",
    password: "testpassword123",
    displayName: "Test User (Viewer)",
    emailVerified: true,
    customClaims: {},
  },
]

async function setupAuthEmulator() {
  console.log("🔧 Setting up Firebase Auth Emulator...")
  console.log(`   Emulator URL: ${AUTH_EMULATOR_URL}`)

  try {
    // Initialize Firebase Admin SDK pointing to emulator
    // Use FIREBASE_AUTH_EMULATOR_HOST env var to point admin to emulator
    process.env.FIREBASE_AUTH_EMULATOR_HOST = `${EMULATOR_HOST}:9099`

    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: "static-sites-257923",
      })
    }

    const auth = admin.auth()

    console.log("\n📝 Creating test users...")

    for (const userData of TEST_USERS) {
      try {
        // Check if user already exists
        let user
        try {
          user = await auth.getUserByEmail(userData.email)
          console.log(`   ✓ User already exists: ${userData.email}`)
        } catch (error) {
          // User doesn't exist, create them
          user = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            emailVerified: userData.emailVerified,
          })
          console.log(`   ✓ Created user: ${userData.email}`)
        }

        // Set custom claims
        await auth.setCustomUserClaims(user.uid, userData.customClaims)
        console.log(`      Claims: ${JSON.stringify(userData.customClaims)}`)
        console.log(`      UID: ${user.uid}`)
        console.log(`      Password: ${userData.password}`)
      } catch (error) {
        console.error(`   ✗ Failed to create user ${userData.email}:`, error.message)
      }
    }

    console.log("\n✅ Auth emulator setup complete!")
    console.log("\n📖 To sign in locally:")
    console.log("   1. Go to http://localhost:8000/experience")
    console.log("   2. Click 'Sign in with Google'")
    console.log("   3. Use one of the test accounts above")
    console.log("\n💡 Note: The emulator auth will show a sign-in page where you can select your test account.")
    console.log("   If using production OAuth won't work in development - you must use emulator auth!")

    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error setting up auth emulator:", error.message)
    console.error("\n💡 Make sure the emulator is running:")
    console.error("   make firebase-emulators")
    process.exit(1)
  }
}

setupAuthEmulator()
