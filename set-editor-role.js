#!/usr/bin/env node
/**
 * Set 'editor' role for a user in Firebase Auth Emulator
 * Usage: node set-editor-role.js <email>
 * Example: node set-editor-role.js contact@joshwentworth.com
 */

const http = require("http")

const PROJECT_ID = "static-sites-257923"
const EMULATOR_HOST = "localhost:9099"

async function getUsers() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 9099,
      path: `/emulator/v1/projects/${PROJECT_ID}/accounts`,
      method: "GET",
    }

    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on("error", reject)
    req.end()
  })
}

async function setCustomClaims(localId, customAttributes) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      localId,
      customAttributes,
    })

    const options = {
      hostname: "localhost",
      port: 9099,
      path: `/emulator/v1/projects/${PROJECT_ID}/accounts:update`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    }

    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on("error", reject)
    req.write(payload)
    req.end()
  })
}

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error("Usage: node set-editor-role.js <email>")
    console.error("Example: node set-editor-role.js contact@joshwentworth.com")
    process.exit(1)
  }

  try {
    console.log(`🔍 Looking for user: ${email}`)

    const { users } = await getUsers()

    if (!users || users.length === 0) {
      console.error("❌ No users found in emulator")
      console.error("💡 Sign in to the app first to create your user account")
      process.exit(1)
    }

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      console.error(`\nAvailable users:`)
      users.forEach((u) => console.error(`  - ${u.email} (${u.localId})`))
      console.error("\n💡 Sign in to the app first to create your user account")
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (${user.localId})`)
    console.log(`🔧 Setting 'editor' role...`)

    await setCustomClaims(user.localId, JSON.stringify({ role: "editor" }))

    console.log(`✅ Successfully set 'editor' role for ${user.email}`)
    console.log(`\n📝 Next steps:`)
    console.log(`  1. Sign out and sign in again in the app`)
    console.log(`  2. The "+ New Section" button should now appear`)
    console.log(`\n🔍 You can verify in Auth Emulator UI:`)
    console.log(`  http://localhost:4000/auth`)
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
}

main()
