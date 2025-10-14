import { Firestore } from "@google-cloud/firestore"

const DATABASE_ID = process.env.DATABASE_ID || "portfolio-staging"
const db = new Firestore({ databaseId: DATABASE_ID })

async function verify() {
  console.log(`Verifying AI prompts in database: ${DATABASE_ID}`)
  console.log("")
  
  const doc = await db.collection("generator").doc("personal-info").get()
  const data = doc.data()
  
  if (!doc.exists) {
    console.log("❌ personal-info document does not exist")
    return
  }
  
  console.log("✓ Document exists")
  
  if (!data?.aiPrompts) {
    console.log("❌ aiPrompts field not found")
    return
  }
  
  console.log("✓ aiPrompts field exists")
  console.log("")
  console.log("AI Prompts Data:")
  console.log("  Resume system prompt:", data.aiPrompts.resume?.systemPrompt?.length || 0, "characters")
  console.log("  Resume user prompt:", data.aiPrompts.resume?.userPromptTemplate?.length || 0, "characters")
  console.log("  Cover letter system prompt:", data.aiPrompts.coverLetter?.systemPrompt?.length || 0, "characters")
  console.log("  Cover letter user prompt:", data.aiPrompts.coverLetter?.userPromptTemplate?.length || 0, "characters")
  console.log("")
  console.log("✅ AI prompts verified successfully!")
}

verify().then(() => process.exit(0)).catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})
