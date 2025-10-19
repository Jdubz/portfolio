#!/usr/bin/env node

/**
 * Firebase Auth Editor Role Management Script
 *
 * Manages editor custom claims for portfolio administration.
 *
 * Usage:
 *   node scripts/manage-editor-role.js add user@example.com
 *   node scripts/manage-editor-role.js remove user@example.com
 *   node scripts/manage-editor-role.js list
 *   node scripts/manage-editor-role.js check user@example.com
 *
 * Via Makefile:
 *   make editor-add EMAIL=user@example.com
 *   make editor-remove EMAIL=user@example.com
 *   make editor-list
 *   make editor-check EMAIL=user@example.com
 */

const admin = require("firebase-admin")

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: "static-sites-257923",
  })
}

const auth = admin.auth()

/**
 * Grant editor role to a user
 */
async function addEditor(email) {
  try {
    const user = await auth.getUserByEmail(email)

    // Get current custom claims
    const currentClaims = user.customClaims || {}

    // Check if already an editor
    if (currentClaims.editor === true) {
      console.log(`✓ ${email} already has editor role`)
      return
    }

    // Set editor custom claim
    await auth.setCustomUserClaims(user.uid, {
      ...currentClaims,
      editor: true,
    })

    console.log(`✓ Editor role granted to: ${email}`)
    console.log(`  UID: ${user.uid}`)
    console.log(`  Display Name: ${user.displayName || "(not set)"}`)
    console.log(`\n⚠️  User must sign out and sign back in for role to take effect`)
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`✗ User not found: ${email}`)
      console.error(`  User must sign in at least once before role can be granted`)
      process.exit(1)
    }
    throw error
  }
}

/**
 * Revoke editor role from a user
 */
async function removeEditor(email) {
  try {
    const user = await auth.getUserByEmail(email)

    // Get current custom claims
    const currentClaims = user.customClaims || {}

    // Check if not an editor
    if (!currentClaims.editor) {
      console.log(`✓ ${email} does not have editor role`)
      return
    }

    // Remove editor custom claim
    const { editor, ...remainingClaims } = currentClaims
    await auth.setCustomUserClaims(user.uid, remainingClaims)

    console.log(`✓ Editor role revoked from: ${email}`)
    console.log(`  UID: ${user.uid}`)
    console.log(`\n⚠️  User must sign out and sign back in for role change to take effect`)
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`✗ User not found: ${email}`)
      process.exit(1)
    }
    throw error
  }
}

/**
 * List all users with editor role
 */
async function listEditors() {
  try {
    const editors = []
    let nextPageToken

    // Paginate through all users
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken)

      for (const userRecord of listUsersResult.users) {
        const customClaims = userRecord.customClaims || {}
        if (customClaims.editor === true) {
          editors.push({
            email: userRecord.email,
            uid: userRecord.uid,
            displayName: userRecord.displayName,
            createdAt: userRecord.metadata.creationTime,
          })
        }
      }

      nextPageToken = listUsersResult.pageToken
    } while (nextPageToken)

    if (editors.length === 0) {
      console.log("No users with editor role found")
      return
    }

    console.log(`Found ${editors.length} editor(s):\n`)
    editors.forEach((editor, index) => {
      console.log(`${index + 1}. ${editor.email}`)
      console.log(`   UID: ${editor.uid}`)
      console.log(`   Display Name: ${editor.displayName || "(not set)"}`)
      console.log(`   Created: ${editor.createdAt}`)
      console.log("")
    })
  } catch (error) {
    console.error("Error listing editors:", error.message)
    process.exit(1)
  }
}

/**
 * Check if a user has editor role
 */
async function checkEditor(email) {
  try {
    const user = await auth.getUserByEmail(email)
    const customClaims = user.customClaims || {}
    const isEditor = customClaims.editor === true

    console.log(`User: ${email}`)
    console.log(`  UID: ${user.uid}`)
    console.log(`  Display Name: ${user.displayName || "(not set)"}`)
    console.log(`  Editor Role: ${isEditor ? "✓ YES" : "✗ NO"}`)

    if (Object.keys(customClaims).length > 0) {
      console.log(`  Custom Claims: ${JSON.stringify(customClaims)}`)
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      console.error(`✗ User not found: ${email}`)
      process.exit(1)
    }
    throw error
  }
}

/**
 * Main entry point
 */
async function main() {
  const [, , command, email] = process.argv

  if (!command) {
    console.error("Usage:")
    console.error("  node scripts/manage-editor-role.js add <email>")
    console.error("  node scripts/manage-editor-role.js remove <email>")
    console.error("  node scripts/manage-editor-role.js list")
    console.error("  node scripts/manage-editor-role.js check <email>")
    process.exit(1)
  }

  try {
    switch (command) {
      case "add":
        if (!email) {
          console.error("Error: Email required for 'add' command")
          process.exit(1)
        }
        await addEditor(email)
        break

      case "remove":
        if (!email) {
          console.error("Error: Email required for 'remove' command")
          process.exit(1)
        }
        await removeEditor(email)
        break

      case "list":
        await listEditors()
        break

      case "check":
        if (!email) {
          console.error("Error: Email required for 'check' command")
          process.exit(1)
        }
        await checkEditor(email)
        break

      default:
        console.error(`Unknown command: ${command}`)
        process.exit(1)
    }

    process.exit(0)
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

main()
