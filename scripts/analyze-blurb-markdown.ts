#!/usr/bin/env -S npx tsx

/**
 * Analyze markdown structure of all blurbs to identify rendering types
 */

import { Firestore } from "@google-cloud/firestore"

const PROJECT_ID = "static-sites-257923"

async function analyzeBlurbs() {
  // Connect to production
  const db = new Firestore({
    projectId: PROJECT_ID,
    databaseId: "portfolio",
  })

  const blurbsSnapshot = await db.collection("experience-blurbs").get()

  console.log("\n=== Analyzing Blurb Markdown Structures ===")
  console.log(`Total blurbs: ${blurbsSnapshot.size}\n`)

  blurbsSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    console.log(`\n${"=".repeat(80)}`)
    console.log(`Blurb: ${data.name}`)
    console.log(`Title: ${data.title}`)
    console.log(`Order: ${data.order}`)
    console.log(`Type: ${data.type || "(none)"}`)
    console.log(`${"=".repeat(80)}`)
    console.log(`\nContent:\n${data.content}`)
    console.log(`\n${"-".repeat(80)}`)

    // Analyze structure
    const content = data.content
    const hasHeaders = /^##\s/m.test(content)
    const hasBulletList = /^-\s/m.test(content)
    const hasNumberedList = /^\d+\.\s/m.test(content)
    const hasLinks = /\[.*?\]\(.*?\)/.test(content)
    const hasBold = /\*\*.*?\*\*/.test(content)
    const hasCodeBlocks = /```/.test(content)
    const paragraphCount = content.split("\n\n").filter((p) => p.trim().length > 0).length

    console.log("\nStructural Analysis:")
    console.log(`  Headers (##): ${hasHeaders}`)
    console.log(`  Bullet lists: ${hasBulletList}`)
    console.log(`  Numbered lists: ${hasNumberedList}`)
    console.log(`  Links: ${hasLinks}`)
    console.log(`  Bold text: ${hasBold}`)
    console.log(`  Code blocks: ${hasCodeBlocks}`)
    console.log(`  Paragraph count: ${paragraphCount}`)

    // Suggest type
    let suggestedType = "text"
    if (hasBulletList && hasHeaders) {
      suggestedType = "categorized-list"
    } else if (hasBulletList) {
      suggestedType = "list"
    } else if (hasHeaders && paragraphCount > 3) {
      suggestedType = "sectioned-text"
    }

    console.log(`  Suggested type: ${suggestedType}`)
  })

  // Also check experience entries
  console.log("\n\n" + "=".repeat(80))
  console.log("=== Analyzing Experience Entry Bodies ===")
  console.log("=".repeat(80))

  const entriesSnapshot = await db.collection("experience-entries").get()
  console.log(`\nTotal entries: ${entriesSnapshot.size}\n`)

  entriesSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    if (data.body) {
      console.log(`\n${"=".repeat(80)}`)
      console.log(`Entry: ${data.title} (${data.role || "no role"})`)
      console.log(`${"=".repeat(80)}`)
      console.log(`\nBody:\n${data.body}`)
      console.log(`\n${"-".repeat(80)}`)

      const content = data.body
      const hasHeaders = /^##\s/m.test(content)
      const hasBulletList = /^-\s/m.test(content)
      const hasNumberedList = /^\d+\.\s/m.test(content)
      const paragraphCount = content.split("\n\n").filter((p) => p.trim().length > 0).length

      console.log("\nStructural Analysis:")
      console.log(`  Headers (##): ${hasHeaders}`)
      console.log(`  Bullet lists: ${hasBulletList}`)
      console.log(`  Numbered lists: ${hasNumberedList}`)
      console.log(`  Paragraph count: ${paragraphCount}`)

      let suggestedType = "text"
      if (hasBulletList && hasHeaders) {
        suggestedType = "categorized-list"
      } else if (hasBulletList) {
        suggestedType = "list"
      }

      console.log(`  Suggested type: ${suggestedType}`)
    }
  })
}

analyzeBlurbs().catch(console.error)
