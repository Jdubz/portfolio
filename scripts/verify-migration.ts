#!/usr/bin/env npx tsx

import { createFirestoreInstance } from "../functions/src/config/firestore"

async function verifyMigration() {
  const db = createFirestoreInstance()
  const snapshot = await db.collection("content-items").orderBy("order", "asc").get()

  console.log(`✅ Total items migrated: ${snapshot.size}\n`)

  const itemsByType: Record<string, unknown[]> = {}

  snapshot.docs.forEach((doc) => {
    const data = doc.data()
    if (!itemsByType[data.type]) itemsByType[data.type] = []
    itemsByType[data.type].push({ id: doc.id, ...data })
  })

  console.log("📊 Items by type:")
  Object.entries(itemsByType).forEach(([type, items]) => {
    console.log(`   - ${type}: ${items.length}`)
  })

  console.log("\n📋 First 5 items:")
  snapshot.docs.slice(0, 5).forEach((doc) => {
    const data = doc.data()
    const name =
      data.company || data.name || data.heading || data.institution || data.title || data.category
    console.log(`   - [${data.type}] ${name} (order: ${data.order})`)
  })

  console.log("\n🔍 Sample company item:")
  const company = itemsByType.company?.[0] as Record<string, unknown>
  if (company) {
    console.log(JSON.stringify(company, null, 2))
  }
}

verifyMigration().catch(console.error)
