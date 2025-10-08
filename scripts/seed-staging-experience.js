#!/usr/bin/env node

/**
 * Seed Staging Firestore with Experience Data from LinkedIn
 *
 * Usage: node scripts/seed-staging-experience.js
 */

const admin = require("firebase-admin")

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccountPath) {
  console.error("❌ GOOGLE_APPLICATION_CREDENTIALS environment variable not set")
  console.error("   Set it to the path of your service account key JSON file")
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://static-sites-257923.firebaseio.com",
})

// Use the "portfolio" database
const db = admin.firestore()
db.settings({ databaseId: "portfolio" })
const collection = db.collection("experience-entries")

// Experience data from LinkedIn
const experienceData = [
  {
    title: "Fulfil",
    role: "Senior Software Engineer",
    body: `Design, build, and maintain cloud systems supporting robotic grocery automation

Scaled from stealth to 3 fully automated grocery stores. Doordash Dashmart, and Whole Foods

Angular, Node.js(Typescript), mysql, redis, mongoDB, BullMQ, PubSub, Kubernetes, GCP, LCK, Grafana, Elastic

Integrations included Doordash Marketplace, Doordash Drive, Twilio, Sendgrid, PagerDuty, Slack, Uber Eats, TaxJar, Stripe

**Skills:** Google Cloud Platform (GCP) · Firebase · Angular.JS · GitHub · Node.js`,
    startDate: "2021-12",
    endDate: "2025-03",
    notes: "Imported from LinkedIn - Full-time · Remote",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
  {
    title: "OPNA dev",
    role: "Co-Founder",
    body: `We are a collective of talented developers based in the bay area. You can hire one of us to embed with your existing team or several of us as a cohesive unit to help tackle large technical problems.

We set milestones with clients to keep process light and fit easily in with your organization. This keeps the project focused on the goals as they change and develop.

We typically work with businesses growing their teams but not wanting to slow down during the hiring process.`,
    startDate: "2017-06",
    endDate: "2023-02",
    notes: "Imported from LinkedIn - Oakland, CA · 5 yrs 9 mos",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
  {
    title: "Self employed",
    role: "Software Engineer Contractor",
    body: "",
    startDate: "2015-08",
    endDate: "2017-06",
    notes: "Imported from LinkedIn - San Francisco Bay Area · 1 yr 11 mos",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
  {
    title: "BriteLite Immersive",
    role: "Technical Director",
    body: "Design, program and maintain interactive multimedia display systems for events and permanent installations.",
    startDate: "2013-02",
    endDate: "2015-09",
    notes: "Imported from LinkedIn - 665 chestnut st, 2nd flr · 2 yrs 8 mos",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
  {
    title: "Madrone Studios",
    role: "Interactive Developer",
    body: "Lighting and Video technician",
    startDate: "2012-09",
    endDate: "2013-02",
    notes: "Imported from LinkedIn · 6 mos",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
  {
    title: "Wentworth precision machining",
    role: "CNC machinist",
    body: "CNC Mill operator",
    startDate: "2004-09",
    endDate: "2010-08",
    notes: "Imported from LinkedIn · 6 yrs",
    createdBy: "seed-script@joshwentworth.com",
    updatedBy: "seed-script@joshwentworth.com",
  },
]

async function seedExperience() {
  console.log("🌱 Seeding staging experience data...")
  console.log(`   Target: portfolio database, experience-entries collection`)

  try {
    // Check if data already exists
    const snapshot = await collection.get()
    if (!snapshot.empty) {
      console.log(`⚠️  Found ${snapshot.size} existing entries`)
      console.log("   Delete existing entries? (Ctrl+C to cancel, or wait 5 seconds)")
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Delete existing entries
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log("   Deleted existing entries")
    }

    // Insert experience data
    const timestamp = admin.firestore.Timestamp.now()
    let count = 0

    for (const entry of experienceData) {
      const docData = {
        ...entry,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      await collection.add(docData)
      count++
      console.log(`   ✓ Added: ${entry.title}${entry.role ? ` - ${entry.role}` : ""}`)
    }

    console.log(`\n✅ Successfully seeded ${count} experience entries to staging`)
    console.log("   View at: https://console.firebase.google.com/project/static-sites-257923/firestore")
  } catch (error) {
    console.error("❌ Error seeding experience data:", error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seedExperience()
