#!/usr/bin/env node
/**
 * Copy job-matches collection from staging to local emulator
 *
 * Usage:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/copy-job-matches-to-emulator.ts
 */

import { Firestore } from "@google-cloud/firestore"

// Source: Staging database
const sourceDb = new Firestore({
  projectId: "static-sites-257923",
  databaseId: "portfolio-staging",
})

// Destination: Local emulator
const destDb = new Firestore({
  projectId: "static-sites-257923",
  databaseId: "(default)",
})

async function copyJobMatches() {
  try {
    console.log("🔄 Copying job-matches from staging to local emulator...")
    console.log("")

    // Get all job-matches from staging
    const snapshot = await sourceDb.collection("job-matches").get()

    if (snapshot.empty) {
      console.log("⚠️  No job-matches found in staging")
      return
    }

    console.log(`Found ${snapshot.size} job-match(es) in staging`)
    console.log("")

    // Copy each document to local emulator
    let copied = 0
    for (const doc of snapshot.docs) {
      const data = doc.data()
      await destDb.collection("job-matches").doc(doc.id).set(data)
      console.log(`✓ Copied: ${data.company || "Unknown"} - ${data.role || "Unknown"}`)
      copied++
    }

    console.log("")
    console.log(`✅ Successfully copied ${copied} job-match(es) to local emulator!`)
  } catch (error) {
    console.error("❌ Error copying job-matches:", error)
    process.exit(1)
  }
}

copyJobMatches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
