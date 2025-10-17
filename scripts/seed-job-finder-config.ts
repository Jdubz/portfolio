#!/usr/bin/env tsx
/**
 * Seed Job Finder Configuration
 *
 * Initializes Firestore collections and documents for job-finder queue system.
 *
 * Usage:
 *   # Local emulator
 *   FIRESTORE_DATABASE_ID=(default) npx tsx scripts/seed-job-finder-config.ts
 *
 *   # Staging
 *   FIRESTORE_DATABASE_ID=portfolio-staging npx tsx scripts/seed-job-finder-config.ts
 *
 *   # Production
 *   FIRESTORE_DATABASE_ID=portfolio npx tsx scripts/seed-job-finder-config.ts
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./service-account-key.json"

  initializeApp({
    credential: cert(serviceAccountPath),
  })
}

const db = getFirestore()

// Use specified database or default
const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)"
if (databaseId !== "(default)") {
  db.settings({ databaseId })
}

console.log(`\n🔧 Seeding job-finder configuration to database: ${databaseId}\n`)

/**
 * Stop List Configuration
 */
const stopListData = {
  excludedCompanies: [
    "Example Excluded Company",
    // Add more excluded companies here
  ],
  excludedKeywords: [
    "commission only",
    "pay to play",
    "unpaid internship",
    "no salary",
    "volunteer position",
    // Add more excluded keywords here
  ],
  excludedDomains: [
    "spam-site.com",
    "scam-jobs.net",
    // Add more excluded domains here
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Queue Settings
 */
const queueSettingsData = {
  maxRetries: 3,
  retryDelaySeconds: 60,
  processingTimeout: 300, // 5 minutes
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * AI Settings
 */
const aiSettingsData = {
  provider: "claude",
  model: "claude-3-haiku-20240307",
  minMatchScore: 70,
  costBudgetDaily: 50.0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

async function seedJobFinderConfig() {
  try {
    const configCollection = db.collection("job-finder-config")

    // 1. Create stop-list document
    console.log("📝 Creating stop-list document...")
    await configCollection.doc("stop-list").set(stopListData)
    console.log("✅ Stop list created with:")
    console.log(`   - ${stopListData.excludedCompanies.length} excluded companies`)
    console.log(`   - ${stopListData.excludedKeywords.length} excluded keywords`)
    console.log(`   - ${stopListData.excludedDomains.length} excluded domains`)

    // 2. Create queue-settings document
    console.log("\n📝 Creating queue-settings document...")
    await configCollection.doc("queue-settings").set(queueSettingsData)
    console.log("✅ Queue settings created:")
    console.log(`   - Max retries: ${queueSettingsData.maxRetries}`)
    console.log(`   - Retry delay: ${queueSettingsData.retryDelaySeconds}s`)
    console.log(`   - Processing timeout: ${queueSettingsData.processingTimeout}s`)

    // 3. Create ai-settings document
    console.log("\n📝 Creating ai-settings document...")
    await configCollection.doc("ai-settings").set(aiSettingsData)
    console.log("✅ AI settings created:")
    console.log(`   - Provider: ${aiSettingsData.provider}`)
    console.log(`   - Model: ${aiSettingsData.model}`)
    console.log(`   - Min match score: ${aiSettingsData.minMatchScore}`)
    console.log(`   - Daily cost budget: $${aiSettingsData.costBudgetDaily}`)

    console.log("\n✨ Job finder configuration seeded successfully!\n")
    console.log("📚 Collections created:")
    console.log("   - job-finder-config/stop-list")
    console.log("   - job-finder-config/queue-settings")
    console.log("   - job-finder-config/ai-settings")
    console.log("\n📝 Note: The following collections will be created automatically when used:")
    console.log("   - job-queue (created when jobs are submitted)")
    console.log("   - job-matches (created when jobs are analyzed)")
  } catch (error) {
    console.error("\n❌ Error seeding job finder configuration:", error)
    process.exit(1)
  }
}

// Run the seed script
seedJobFinderConfig()
  .then(() => {
    console.log("✅ Seeding complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  })
