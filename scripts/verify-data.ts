#!/usr/bin/env npx tsx

import { createFirestoreInstance } from "../functions/src/config/firestore"

async function verify() {
  const db = createFirestoreInstance()

  console.log("📊 Final Verification\n")

  const snapshot = await db.collection("content-items").get()
  console.log(`Total items: ${snapshot.size}\n`)

  const typeCounts: Record<string, number> = {}
  const rootItems: Array<{ id: string; type: string; name: string; content?: string }> = []
  const childMap = new Map<string, Array<{ id: string; type: string; name: string }>>()

  snapshot.docs.forEach((doc) => {
    const data = doc.data()
    typeCounts[data.type] = (typeCounts[data.type] || 0) + 1

    if (data.parentId === null) {
      rootItems.push({
        id: doc.id,
        type: data.type,
        name: data.company || data.heading || data.category,
        content: data.content,
      })
    } else {
      if (!childMap.has(data.parentId)) {
        childMap.set(data.parentId, [])
      }
      childMap.get(data.parentId)!.push({
        id: doc.id,
        type: data.type,
        name: data.name || data.institution,
      })
    }
  })

  console.log("By Type:")
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`)
  })

  console.log(`\nStructure: ${rootItems.length} root + ${snapshot.size - rootItems.length} children`)

  // Check container items
  const eduSection = rootItems.find((r) => r.name === "Education & Certificates")
  const projectsSection = rootItems.find((r) => r.name === "Selected Projects")

  console.log(`\n📚 Education & Certificates:`)
  console.log(`  Content: ${eduSection?.content?.length || 0} chars (should be 0)`)
  const eduChildren = childMap.get(eduSection?.id || "") || []
  console.log(`  Children: ${eduChildren.length}`)
  eduChildren.forEach((c) => console.log(`    - ${c.name}`))

  console.log(`\n🚀 Selected Projects:`)
  console.log(`  Content: ${projectsSection?.content?.length || 0} chars (should be 0)`)
  const projChildren = childMap.get(projectsSection?.id || "") || []
  console.log(`  Children: ${projChildren.length}`)
  projChildren.forEach((c) => console.log(`    - ${c.name}`))

  // Check companies
  const companies = rootItems.filter((r) => r.type === "company")
  console.log(`\n🏢 Companies with Projects:`)
  companies.forEach((company) => {
    const projects = childMap.get(company.id) || []
    if (projects.length > 0) {
      console.log(`  ${company.name}: ${projects.length} projects`)
      projects.forEach((p) => console.log(`    - ${p.name}`))
    }
  })
}

verify().catch(console.error)
