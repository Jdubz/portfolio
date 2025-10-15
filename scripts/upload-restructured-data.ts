#!/usr/bin/env -S npx tsx

/**
 * Upload restructured data to Firestore
 *
 * This script uploads the manually restructured blurbs and entries
 * to Firestore, preserving all original data while adding new structured fields.
 *
 * Usage:
 *   npm run migrate:restructure:local    # Local emulator
 *   npm run migrate:restructure:staging  # Staging database
 *   npm run migrate:restructure:prod     # Production database
 */

import { Firestore } from "@google-cloud/firestore"
import { readFileSync } from "fs"

const ENVIRONMENT = process.env.FIRESTORE_ENV || "local"

// Environment configuration
const CONFIG = {
  local: {
    projectId: "static-sites-257923",
    databaseId: "(default)",
    emulator: true,
  },
  staging: {
    projectId: "static-sites-257923",
    databaseId: "portfolio-staging",
    emulator: false,
  },
  prod: {
    projectId: "static-sites-257923",
    databaseId: "portfolio",
    emulator: false,
  },
}

interface RestructuredBlurb {
  id: string
  name: string
  title: string
  order: number
  type: string
  renderType?: string
  structuredData?: unknown
  content: string
  parentEntryId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

interface RestructuredEntry {
  id: string
  title: string
  role?: string
  location?: string
  startDate: string
  endDate?: string
  notes?: string
  order: number
  renderType?: string
  summary?: string
  accomplishments?: string[]
  technologies?: string[]
  projects?: Array<{
    name: string
    description: string
    technologies?: string[]
    challenges?: string[]
  }>
  body: string
  relatedBlurbIds: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

async function uploadRestructuredData() {
  const config = CONFIG[ENVIRONMENT as keyof typeof CONFIG]
  if (!config) {
    throw new Error(`Invalid environment: ${ENVIRONMENT}. Use local, staging, or prod.`)
  }

  console.log(`\n🚀 Uploading restructured data to ${ENVIRONMENT}...`)
  console.log(`   Project: ${config.projectId}`)
  console.log(`   Database: ${config.databaseId}`)

  // Connect to Firestore
  const db = new Firestore({
    projectId: config.projectId,
    databaseId: config.databaseId,
    ...(config.emulator && {
      host: "localhost:8080",
      ssl: false,
    }),
  })

  // Load restructured data
  console.log("\n📂 Loading restructured data files...")
  const blurbsData = JSON.parse(
    readFileSync("scripts/data/restructured-blurbs.json", "utf-8")
  ) as RestructuredBlurb[]
  const entriesData = JSON.parse(
    readFileSync("scripts/data/restructured-entries.json", "utf-8")
  ) as RestructuredEntry[]

  console.log(`   Found ${blurbsData.length} blurbs`)
  console.log(`   Found ${entriesData.length} entries`)

  // Upload blurbs
  console.log("\n📝 Uploading blurbs...")
  let blurbsUpdated = 0
  for (const blurb of blurbsData) {
    const docRef = db.collection("experience-blurbs").doc(blurb.id)

    // Prepare update data - only add new fields, preserve existing
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: "restructure-script@joshwentworth.com",
    }

    // Add renderType if present
    if (blurb.renderType) {
      updateData.renderType = blurb.renderType
    }

    // Add structuredData if present
    if (blurb.structuredData) {
      updateData.structuredData = blurb.structuredData
    }

    await docRef.update(updateData)
    blurbsUpdated++
    console.log(`   ✓ Updated blurb: ${blurb.name} (renderType: ${blurb.renderType || "none"})`)
  }

  // Upload entries
  console.log("\n📝 Uploading entries...")
  let entriesUpdated = 0
  for (const entry of entriesData) {
    const docRef = db.collection("experience-entries").doc(entry.id)

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy: "restructure-script@joshwentworth.com",
    }

    // Add renderType if present
    if (entry.renderType) {
      updateData.renderType = entry.renderType
    }

    // Add structured fields if present
    if (entry.summary) {
      updateData.summary = entry.summary
    }
    if (entry.accomplishments) {
      updateData.accomplishments = entry.accomplishments
    }
    if (entry.technologies) {
      updateData.technologies = entry.technologies
    }
    if (entry.projects) {
      updateData.projects = entry.projects
    }

    await docRef.update(updateData)
    entriesUpdated++
    console.log(
      `   ✓ Updated entry: ${entry.title} (renderType: ${entry.renderType || "none"})`
    )
  }

  // Validation
  console.log("\n✅ Upload complete!")
  console.log(`   Blurbs updated: ${blurbsUpdated}/${blurbsData.length}`)
  console.log(`   Entries updated: ${entriesUpdated}/${entriesData.length}`)

  // Verify data integrity
  console.log("\n🔍 Verifying data integrity...")

  const blurbsSnapshot = await db.collection("experience-blurbs").get()
  const entriesSnapshot = await db.collection("experience-entries").get()

  console.log(`   Total blurbs in database: ${blurbsSnapshot.size}`)
  console.log(`   Total entries in database: ${entriesSnapshot.size}`)

  // Check that all documents have required fields
  let blurbsWithRenderType = 0
  let blurbsWithStructuredData = 0
  blurbsSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    if (data.renderType) blurbsWithRenderType++
    if (data.structuredData) blurbsWithStructuredData++
    if (!data.content) {
      console.warn(`   ⚠️  Blurb ${doc.id} missing content field`)
    }
  })

  let entriesWithRenderType = 0
  let entriesWithStructuredFields = 0
  entriesSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    if (data.renderType) entriesWithRenderType++
    if (data.accomplishments || data.technologies || data.projects) {
      entriesWithStructuredFields++
    }
    if (!data.body) {
      console.warn(`   ⚠️  Entry ${doc.id} missing body field`)
    }
  })

  console.log(`   Blurbs with renderType: ${blurbsWithRenderType}`)
  console.log(`   Blurbs with structuredData: ${blurbsWithStructuredData}`)
  console.log(`   Entries with renderType: ${entriesWithRenderType}`)
  console.log(`   Entries with structured fields: ${entriesWithStructuredFields}`)

  console.log("\n✨ Migration complete!")
}

uploadRestructuredData().catch((error) => {
  console.error("\n❌ Migration failed:", error)
  process.exit(1)
})
