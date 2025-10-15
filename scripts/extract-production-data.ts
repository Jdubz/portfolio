#!/usr/bin/env -S npx tsx

/**
 * Extract all blurbs and experience entries from production for analysis
 */

import { Firestore } from "@google-cloud/firestore"
import { writeFileSync } from "fs"

const PROJECT_ID = "static-sites-257923"

async function extractProductionData() {
  console.log("Connecting to production database...")
  const db = new Firestore({
    projectId: PROJECT_ID,
    databaseId: "portfolio",
  })

  // Extract blurbs
  console.log("Extracting blurbs...")
  const blurbsSnapshot = await db.collection("experience-blurbs").orderBy("order", "asc").get()

  const blurbs = blurbsSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      title: data.title,
      content: data.content,
      order: data.order,
      type: data.type,
      parentEntryId: data.parentEntryId,
      createdAt: data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : data.createdAt,
      updatedAt: data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000).toISOString() : data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    }
  })

  console.log(`Extracted ${blurbs.length} blurbs`)

  // Extract experience entries
  console.log("Extracting experience entries...")
  const entriesSnapshot = await db.collection("experience-entries").orderBy("order", "asc").get()

  const entries = entriesSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      role: data.role,
      location: data.location,
      body: data.body,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      order: data.order,
      relatedBlurbIds: data.relatedBlurbIds || [],
      createdAt: data.createdAt?._seconds ? new Date(data.createdAt._seconds * 1000).toISOString() : data.createdAt,
      updatedAt: data.updatedAt?._seconds ? new Date(data.updatedAt._seconds * 1000).toISOString() : data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    }
  })

  console.log(`Extracted ${entries.length} entries`)

  // Save to JSON files
  const blurbsFile = "scripts/data/production-blurbs.json"
  const entriesFile = "scripts/data/production-entries.json"

  writeFileSync(blurbsFile, JSON.stringify(blurbs, null, 2))
  writeFileSync(entriesFile, JSON.stringify(entries, null, 2))

  console.log(`\n✅ Data extracted successfully!`)
  console.log(`   Blurbs: ${blurbsFile}`)
  console.log(`   Entries: ${entriesFile}`)
}

extractProductionData().catch(console.error)
