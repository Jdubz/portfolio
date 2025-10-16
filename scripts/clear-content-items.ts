#!/usr/bin/env npx tsx

import { createFirestoreInstance } from "../functions/src/config/firestore"

async function clearCollection() {
  const db = createFirestoreInstance()
  const snapshot = await db.collection("content-items").get()

  console.log(`Found ${snapshot.size} items to delete`)

  for (const doc of snapshot.docs) {
    await doc.ref.delete()
  }

  console.log("✅ Deleted all content-items")
}

clearCollection().catch(console.error)
