#!/usr/bin/env -S npx tsx

/**
 * Migrate Experience Structure
 *
 * Adds new fields to experience-entries and experience-blurbs collections:
 * - order: For sorting
 * - type: For blurbs (page vs entry)
 * - parentEntryId: For entry-specific blurbs
 * - relatedBlurbIds: For entries
 *
 * IMPORTANT: Run this on local emulator first, then staging, then production
 *
 * Usage:
 *   npm run migrate:experience:local
 *   npm run migrate:experience:staging
 *   npm run migrate:experience:prod
 */

import { Firestore } from "@google-cloud/firestore"

const PROJECT_ID = "static-sites-257923"

// Get environment from command line arg
const env = process.argv[2] || "local"

// Predefined blurb order (from WorkExperienceTab.tsx)
const BLURB_ORDER_MAP: Record<string, number> = {
  intro: 1,
  "selected-projects": 2,
  skills: 3,
  "education-certificates": 4,
  biography: 5,
  "closing-notes": 6,
}

interface ExperienceEntry {
  id: string
  title: string
  role?: string
  location?: string
  body?: string
  startDate: string
  endDate?: string | null
  notes?: string
  order?: number
  relatedBlurbIds?: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

interface ExperienceBlurb {
  id: string
  name: string
  title: string
  content: string
  order?: number
  type?: "page" | "entry"
  parentEntryId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

async function getFirestoreDb(): Promise<{ db: Firestore; dbName: string }> {
  if (env === "local") {
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
    const db = new Firestore({
      projectId: PROJECT_ID,
      databaseId: "(default)",
    })
    return { db, dbName: "local emulator" }
  } else if (env === "staging") {
    const db = new Firestore({
      projectId: PROJECT_ID,
      databaseId: "portfolio-staging",
    })
    return { db, dbName: "portfolio-staging" }
  } else if (env === "prod" || env === "production") {
    const db = new Firestore({
      projectId: PROJECT_ID,
      databaseId: "portfolio",
    })
    return { db, dbName: "portfolio (production)" }
  } else {
    throw new Error(`Invalid environment: ${env}. Use: local, staging, or prod`)
  }
}

async function migrateEntries(db: Firestore): Promise<number> {
  console.log("\n📋 Migrating experience-entries...")

  const collection = db.collection("experience-entries")
  const snapshot = await collection.get()

  console.log(`   Found ${snapshot.size} documents`)

  if (snapshot.empty) {
    console.log("   ⚠️  No documents to migrate")
    return 0
  }

  // Parse all entries and sort by startDate (most recent first)
  const entries: ExperienceEntry[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ExperienceEntry, "id">),
  }))

  entries.sort((a, b) => {
    // Sort by startDate descending (most recent first)
    const dateA = new Date(a.startDate + "-01")
    const dateB = new Date(b.startDate + "-01")
    return dateB.getTime() - dateA.getTime()
  })

  // Update each entry with order and relatedBlurbIds
  let migrated = 0
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    // Skip if already migrated (has order field)
    if (entry.order !== undefined) {
      console.log(`   ⏭️  Skipping ${entry.id} (already migrated)`)
      continue
    }

    const updates: Partial<ExperienceEntry> = {
      order: i + 1, // 1-based ordering
      relatedBlurbIds: [], // Empty array, will be populated manually later
      updatedAt: new Date().toISOString(),
    }

    await collection.doc(entry.id).update(updates)
    migrated++

    if (migrated % 5 === 0) {
      console.log(`   Migrated ${migrated}/${entries.length}...`)
    }
  }

  console.log(`   ✅ Migrated ${migrated} documents`)
  return migrated
}

async function migrateBlurbs(db: Firestore): Promise<number> {
  console.log("\n📋 Migrating experience-blurbs...")

  const blurbsCollection = db.collection("experience-blurbs")
  const entriesCollection = db.collection("experience-entries")

  const blurbsSnapshot = await blurbsCollection.get()
  const entriesSnapshot = await entriesCollection.get()

  console.log(`   Found ${blurbsSnapshot.size} blurb documents`)

  if (blurbsSnapshot.empty) {
    console.log("   ⚠️  No documents to migrate")
    return 0
  }

  // Get all entry IDs for matching
  const entryIds = new Set(entriesSnapshot.docs.map((doc) => doc.id))

  // Migrate each blurb
  let migrated = 0
  for (const doc of blurbsSnapshot.docs) {
    const blurb = doc.data() as ExperienceBlurb

    // Skip if already migrated (has type field)
    if (blurb.type !== undefined) {
      console.log(`   ⏭️  Skipping ${doc.id} (already migrated)`)
      continue
    }

    // Determine if this is a page-level blurb or entry-specific
    const isPageBlurb = blurb.name in BLURB_ORDER_MAP
    const isEntryBlurb = entryIds.has(blurb.name)

    const updates: Partial<ExperienceBlurb> = {
      type: isPageBlurb ? "page" : "entry",
      order: isPageBlurb ? BLURB_ORDER_MAP[blurb.name] : 999, // Default high order for entry blurbs
      updatedAt: new Date().toISOString(),
    }

    // If entry-specific, add parentEntryId
    if (isEntryBlurb) {
      updates.parentEntryId = blurb.name
    }

    await blurbsCollection.doc(doc.id).update(updates)
    migrated++

    if (migrated % 5 === 0) {
      console.log(`   Migrated ${migrated}/${blurbsSnapshot.size}...`)
    }
  }

  console.log(`   ✅ Migrated ${migrated} documents`)
  return migrated
}

async function validateMigration(db: Firestore): Promise<void> {
  console.log("\n🔍 Validating migration...")

  const entriesSnapshot = await db.collection("experience-entries").get()
  const blurbsSnapshot = await db.collection("experience-blurbs").get()

  // Check entries
  let entriesWithOrder = 0
  let entriesWithRelatedBlurbIds = 0
  for (const doc of entriesSnapshot.docs) {
    const entry = doc.data() as ExperienceEntry
    if (entry.order !== undefined) {
      entriesWithOrder++
    }
    if (entry.relatedBlurbIds !== undefined) {
      entriesWithRelatedBlurbIds++
    }
  }

  console.log(`\n   Entries:`)
  console.log(`   - Total: ${entriesSnapshot.size}`)
  console.log(`   - With order field: ${entriesWithOrder}`)
  console.log(`   - With relatedBlurbIds field: ${entriesWithRelatedBlurbIds}`)

  // Check blurbs
  let blurbsWithType = 0
  let blurbsWithOrder = 0
  let pageBlurbs = 0
  let entryBlurbs = 0
  let blurbsWithParentId = 0
  for (const doc of blurbsSnapshot.docs) {
    const blurb = doc.data() as ExperienceBlurb
    if (blurb.type !== undefined) {
      blurbsWithType++
      if (blurb.type === "page") {
        pageBlurbs++
      } else if (blurb.type === "entry") {
        entryBlurbs++
      }
    }
    if (blurb.order !== undefined) {
      blurbsWithOrder++
    }
    if (blurb.parentEntryId !== undefined) {
      blurbsWithParentId++
    }
  }

  console.log(`\n   Blurbs:`)
  console.log(`   - Total: ${blurbsSnapshot.size}`)
  console.log(`   - With type field: ${blurbsWithType}`)
  console.log(`   - With order field: ${blurbsWithOrder}`)
  console.log(`   - Page-level blurbs: ${pageBlurbs}`)
  console.log(`   - Entry-specific blurbs: ${entryBlurbs}`)
  console.log(`   - With parentEntryId field: ${blurbsWithParentId}`)

  const allEntriesMigrated = entriesWithOrder === entriesSnapshot.size && entriesWithRelatedBlurbIds === entriesSnapshot.size
  const allBlurbsMigrated = blurbsWithType === blurbsSnapshot.size && blurbsWithOrder === blurbsSnapshot.size

  if (allEntriesMigrated && allBlurbsMigrated) {
    console.log(`\n   ✅ All documents successfully migrated!`)
  } else {
    console.log(`\n   ⚠️  Some documents may not be fully migrated`)
  }
}

async function main() {
  console.log("🚀 Experience Structure Migration")
  console.log("=" .repeat(50))

  const { db, dbName } = await getFirestoreDb()

  console.log(`\n📦 Target Database: ${dbName}`)
  console.log(`📅 Migration Date: ${new Date().toISOString()}`)

  if (env === "prod" || env === "production") {
    console.log("\n⚠️  WARNING: You are about to migrate PRODUCTION data!")
    console.log("   Make sure you have:")
    console.log("   1. Tested migration on local emulator")
    console.log("   2. Tested migration on staging")
    console.log("   3. Verified backups are available")
    console.log("\n   Press Ctrl+C to cancel, or wait 10 seconds to continue...")
    await new Promise((resolve) => setTimeout(resolve, 10000))
  }

  try {
    const entriesMigrated = await migrateEntries(db)
    const blurbsMigrated = await migrateBlurbs(db)

    await validateMigration(db)

    console.log("\n" + "=".repeat(50))
    console.log(`✅ Migration completed successfully!`)
    console.log(`   - Entries migrated: ${entriesMigrated}`)
    console.log(`   - Blurbs migrated: ${blurbsMigrated}`)
    console.log("=" .repeat(50))
  } catch (error) {
    console.error("\n❌ Migration failed:", error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
