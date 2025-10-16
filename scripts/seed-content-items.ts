#!/usr/bin/env npx tsx

/**
 * Seed Content Items
 *
 * Loads content items from the seed file into Firestore.
 * This script can be used for any environment (local, staging, production).
 *
 * Usage:
 *   # Load to local emulator
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/seed-content-items.ts
 *
 *   # Load to staging
 *   FIRESTORE_DATABASE_ID=portfolio-staging npx tsx scripts/seed-content-items.ts
 *
 *   # Load to production
 *   FIRESTORE_DATABASE_ID=portfolio npx tsx scripts/seed-content-items.ts
 *
 * Options:
 *   --clear    Clear existing content-items before seeding
 *   --force    Skip confirmation prompt
 */

import { createFirestoreInstance } from "../functions/src/config/firestore"
import { DATABASE_ID } from "../functions/src/config/database"
import { Timestamp } from "@google-cloud/firestore"
import * as fs from "fs"
import * as readline from "readline"

// Parse command line args
const args = process.argv.slice(2)
const shouldClear = args.includes("--clear")
const isForce = args.includes("--force")

const db = createFirestoreInstance()

interface SeedContentItem {
  type: string
  parentId?: string | null
  order: number
  visibility: string
  children?: SeedContentItem[]
  [key: string]: any
}

interface SeedData {
  contentItems: SeedContentItem[]
}

/**
 * Confirm action with user
 */
async function confirm(message: string): Promise<boolean> {
  if (isForce) {
    return true
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

/**
 * Clear existing content-items collection
 */
async function clearCollection(): Promise<void> {
  console.log("🗑️  Clearing existing content-items...")

  const snapshot = await db.collection("content-items").get()
  console.log(`   Found ${snapshot.size} items to delete`)

  if (snapshot.size > 0) {
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()
    console.log("   ✓ Cleared content-items collection")
  }
}

/**
 * Create content item and its children
 */
async function createItem(
  item: SeedContentItem,
  parentId: string | null = null,
  now: Timestamp,
  createdBy: string
): Promise<string> {
  const { children, ...itemData } = item

  // Remove undefined values
  const cleanData: Record<string, any> = {}
  for (const [key, value] of Object.entries(itemData)) {
    if (value !== undefined) {
      cleanData[key] = value
    }
  }

  // Set parentId
  cleanData.parentId = parentId

  // Add timestamps
  cleanData.createdAt = now
  cleanData.updatedAt = now
  cleanData.createdBy = createdBy
  cleanData.updatedBy = createdBy

  // Create the item
  const docRef = await db.collection("content-items").add(cleanData)

  // Create children if they exist
  if (children && children.length > 0) {
    for (const child of children) {
      await createItem(child, docRef.id, now, createdBy)
    }
  }

  return docRef.id
}

/**
 * Main seed function
 */
async function seed() {
  console.log("🌱 Content Items Seeder")
  console.log("======================")
  console.log(`Database: ${DATABASE_ID}`)
  console.log(`Clear existing: ${shouldClear}`)
  console.log()

  // Read seed file
  const seedPath = "./emulator-data/content-items-seed.json"
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ Seed file not found: ${seedPath}`)
    process.exit(1)
  }

  const seedData: SeedData = JSON.parse(fs.readFileSync(seedPath, "utf8"))
  console.log(`📖 Loaded ${seedData.contentItems.length} root items from seed file`)

  // Count total items (including children)
  let totalItems = 0
  const countItems = (items: SeedContentItem[]) => {
    for (const item of items) {
      totalItems++
      if (item.children) {
        countItems(item.children)
      }
    }
  }
  countItems(seedData.contentItems)
  console.log(`   Total items (including children): ${totalItems}`)
  console.log()

  // Clear if requested
  if (shouldClear) {
    await clearCollection()
    console.log()
  }

  // Confirm
  const confirmed = await confirm("⚠️  Seed content items to database?")
  if (!confirmed) {
    console.log("❌ Seeding cancelled.")
    return
  }

  // Seed items
  console.log("💾 Seeding content items...")
  const now = Timestamp.now()
  const createdBy = "seed-script@joshwentworth.com"

  let itemsCreated = 0
  for (const item of seedData.contentItems) {
    await createItem(item, null, now, createdBy)
    itemsCreated++

    // Count children
    if (item.children) {
      itemsCreated += item.children.length
    }

    console.log(`   ✓ Created ${item.type}: ${item.heading || item.company || item.category || item.name}`)
  }

  console.log()
  console.log("✅ Seeding complete!")
  console.log(`   - Items created: ${itemsCreated}`)
}

// Run seeder
seed()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  })
