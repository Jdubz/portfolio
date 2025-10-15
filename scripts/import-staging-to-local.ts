#!/usr/bin/env node
/**
 * Import staging database to local emulator
 *
 * Usage:
 *   npx tsx scripts/import-staging-to-local.ts
 */

import { Firestore } from "@google-cloud/firestore"

// Source: Staging database (never use emulator)
// Save current emulator host and clear it temporarily for source
const originalEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST
delete process.env.FIRESTORE_EMULATOR_HOST

const sourceDb = new Firestore({
  projectId: "static-sites-257923",
  databaseId: "portfolio-staging",
})

// Destination: Local emulator (restore emulator host)
if (originalEmulatorHost) {
  process.env.FIRESTORE_EMULATOR_HOST = originalEmulatorHost
} else {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
}

const destDb = new Firestore({
  projectId: "static-sites-257923",
  databaseId: "(default)",
})

async function getAllCollections(): Promise<string[]> {
  const collections = await sourceDb.listCollections()
  return collections.map((col) => col.id)
}

async function copyCollection(collectionName: string) {
  console.log(`\n📦 Copying collection: ${collectionName}`)

  try {
    const snapshot = await sourceDb.collection(collectionName).get()

    if (snapshot.empty) {
      console.log(`   ⚠️  Empty collection`)
      return 0
    }

    console.log(`   Found ${snapshot.size} document(s)`)

    let copied = 0
    for (const doc of snapshot.docs) {
      const data = doc.data()
      await destDb.collection(collectionName).doc(doc.id).set(data)
      console.log(`   ✓ Copied: ${doc.id}`)
      copied++
    }

    console.log(`   ✅ Copied ${copied} document(s)`)
    return copied
  } catch (error) {
    console.error(`   ❌ Error copying collection: ${error}`)
    return 0
  }
}

async function importStagingToLocal() {
  try {
    console.log("🔄 Importing entire staging database to local emulator...")
    console.log("")

    // Get all collections from staging
    console.log("📋 Discovering collections...")
    const collections = await getAllCollections()
    console.log(`   Found ${collections.length} collection(s): ${collections.join(", ")}`)

    let totalCopied = 0
    for (const collection of collections) {
      const count = await copyCollection(collection)
      totalCopied += count
    }

    console.log("")
    console.log(`✅ Successfully copied ${totalCopied} total document(s) across ${collections.length} collection(s) to local emulator!`)
  } catch (error) {
    console.error("❌ Error importing data:", error)
    process.exit(1)
  }
}

importStagingToLocal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
