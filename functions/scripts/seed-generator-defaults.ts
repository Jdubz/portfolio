import { Firestore, Timestamp } from "@google-cloud/firestore"
import { DATABASE_ID, GENERATOR_COLLECTION } from "../src/config/database"

/**
 * Seed the generator/default document in Firestore
 *
 * Usage:
 *   npx tsx scripts/seed-generator-defaults.ts
 */
async function seedDefaults() {
  const db = new Firestore({
    databaseId: DATABASE_ID,
    projectId: "static-sites-257923",
  })

  const docRef = db.collection(GENERATOR_COLLECTION).doc("default")

  // Check if already exists
  const existing = await docRef.get()

  if (existing.exists) {
    console.log("✅ Default document already exists!")
    console.log("Current data:", existing.data())

    const shouldUpdate = process.argv.includes("--force")
    if (!shouldUpdate) {
      console.log("\nTo update, run: npx tsx scripts/seed-generator-defaults.ts --force")
      return
    }
    console.log("\n⚠️  Updating existing document (--force flag detected)")
  }

  const defaultsDoc = {
    id: "default",
    type: "defaults",
    name: "Josh Wentworth",
    email: "josh@joshwentworth.com",
    phone: "",
    location: "Portland, OR",
    website: "https://joshwentworth.com",
    github: "https://github.com/jdubz",
    linkedin: "https://linkedin.com/in/joshwentworth",
    avatar: "",
    logo: "",
    accentColor: "#3B82F6",
    defaultStyle: "modern" as const,
    createdAt: existing.exists ? existing.data()?.createdAt : Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await docRef.set(defaultsDoc)

  console.log("\n✅ Default settings seeded successfully!")
  console.log("\nDocument details:")
  console.log("  Collection:", GENERATOR_COLLECTION)
  console.log("  Document ID: default")
  console.log("  Database:", DATABASE_ID)
  console.log("\nSettings:")
  console.log("  Name:", defaultsDoc.name)
  console.log("  Email:", defaultsDoc.email)
  console.log("  Location:", defaultsDoc.location)
  console.log("  Accent Color:", defaultsDoc.accentColor)
  console.log("  Default Style:", defaultsDoc.defaultStyle)
}

seedDefaults()
  .then(() => {
    console.log("\n✨ Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Error seeding defaults:", error)
    process.exit(1)
  })
