#!/usr/bin/env node

/**
 * Grant editor role by UID
 *
 * Usage: node scripts/add-editor-by-uid.js <uid>
 */

const admin = require("firebase-admin")

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: "static-sites-257923",
  })
}

const auth = admin.auth()

async function addEditorByUid(uid) {
  try {
    // Get user by UID
    const user = await auth.getUser(uid)

    // Get current custom claims
    const currentClaims = user.customClaims || {}

    // Check if already an editor
    if (currentClaims.editor === true) {
      console.log(`✓ User already has editor role`)
      console.log(`  Email: ${user.email}`)
      console.log(`  UID: ${user.uid}`)
      return
    }

    // Set editor custom claim
    await auth.setCustomUserClaims(user.uid, {
      ...currentClaims,
      editor: true,
    })

    console.log(`✓ Editor role granted successfully!`)
    console.log(`  Email: ${user.email}`)
    console.log(`  UID: ${user.uid}`)
    console.log(`  Display Name: ${user.displayName || "(not set)"}`)
    console.log(`\n⚠️  User must sign out and sign back in for role to take effect`)

    process.exit(0)
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`✗ User not found with UID: ${uid}`)
      console.error(`  User must sign in at least once before role can be granted`)
      process.exit(1)
    }
    console.error("Error:", error.message)
    process.exit(1)
  }
}

const [, , uid] = process.argv

if (!uid) {
  console.error("Usage: node scripts/add-editor-by-uid.js <uid>")
  process.exit(1)
}

addEditorByUid(uid)
