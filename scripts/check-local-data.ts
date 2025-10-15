#!/usr/bin/env -S npx tsx

/**
 * Check what data is actually in the local emulator
 */

import { Firestore } from "@google-cloud/firestore"

async function checkLocalData() {
  const db = new Firestore({
    projectId: "demo-portfolio",
    databaseId: "(default)",
    host: "localhost:8080",
    ssl: false,
  })

  console.log("\n=== BLURBS ===")
  const blurbsSnapshot = await db.collection("experience-blurbs").orderBy("order", "asc").get()
  blurbsSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    console.log(`\n${doc.id}:`)
    console.log(`  title: ${data.title}`)
    console.log(`  renderType: ${data.renderType || "(none)"}`)
    console.log(`  has structuredData: ${!!data.structuredData}`)
    console.log(`  has content: ${!!data.content}`)
    if (data.structuredData) {
      console.log(`  structuredData keys: ${Object.keys(data.structuredData).join(", ")}`)
    }
  })

  console.log("\n\n=== ENTRIES ===")
  const entriesSnapshot = await db.collection("experience-entries").orderBy("order", "asc").get()
  entriesSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    console.log(`\n${doc.id}:`)
    console.log(`  title: ${data.title}`)
    console.log(`  renderType: ${data.renderType || "(none)"}`)
    console.log(`  has accomplishments: ${!!data.accomplishments}`)
    console.log(`  has technologies: ${!!data.technologies}`)
    console.log(`  has projects: ${!!data.projects}`)
    console.log(`  has body: ${!!data.body}`)
  })
}

checkLocalData().catch(console.error)
