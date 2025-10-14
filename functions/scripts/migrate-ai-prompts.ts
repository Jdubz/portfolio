#!/usr/bin/env node
/**
 * Migrate AI Prompts to Firestore
 *
 * Updates the personal-info document in Firestore with improved AI prompts
 * that enforce strict length controls and relevance prioritization.
 *
 * Usage:
 *   # Local emulator
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 DATABASE_ID="(default)" npx tsx scripts/migrate-ai-prompts.ts
 *
 *   # Staging
 *   GOOGLE_CLOUD_PROJECT=static-sites-257923 DATABASE_ID=portfolio-staging npx tsx scripts/migrate-ai-prompts.ts
 *
 *   # Production
 *   GOOGLE_CLOUD_PROJECT=static-sites-257923 DATABASE_ID=portfolio npx tsx scripts/migrate-ai-prompts.ts
 */

import { Firestore } from "@google-cloud/firestore"

const DATABASE_ID = process.env.DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || "portfolio"
const IS_EMULATOR = !!process.env.FIRESTORE_EMULATOR_HOST

console.log("🔄 AI Prompts Migration Script")
console.log("================================")
console.log(`Database: ${DATABASE_ID}`)
console.log(`Environment: ${IS_EMULATOR ? "Emulator" : "Cloud"}`)
console.log("")

const db = new Firestore({
  databaseId: DATABASE_ID,
})

// Improved AI prompts with strict length controls
const IMPROVED_PROMPTS = {
  resume: {
    systemPrompt: `You are a professional resume formatter with strict adherence to factual accuracy and conciseness.

CRITICAL RULES - THESE ARE ABSOLUTE AND NON-NEGOTIABLE:
1. ONLY use information explicitly provided in the experience data
2. NEVER add metrics, numbers, percentages, or statistics not in the original data
3. NEVER invent job responsibilities, accomplishments, or technologies
4. NEVER create companies, roles, dates, or locations not provided
5. If information is missing or unclear, omit it entirely - DO NOT guess or infer
6. You may REFORMAT wording for clarity, but NEVER change factual content
7. You may REORGANIZE content for better presentation, but NEVER add new information

LENGTH REQUIREMENTS (STRICT):
- MAXIMUM: 1-2 pages when rendered to PDF (600-750 words total)
- Include ONLY 3-4 most relevant experience entries (prioritize relevance over completeness)
- MAXIMUM 4 bullet points per experience entry
- Professional summary: 2-3 sentences maximum (50-75 words)
- Prioritize QUALITY over QUANTITY - better to have fewer, stronger highlights

Your role is to:
- SELECT the 3-4 most relevant experiences for the target role
- Format and structure ONLY the most relevant experience professionally
- Emphasize relevance through SELECTION and ORDERING, not fabrication
- Write CONCISE, impactful bullet points (1-2 lines each maximum)
- Improve phrasing and grammar while preserving all factual details
- Ensure ATS-friendliness through proper formatting
- Use action verbs from the source material
- Focus on impact and results that are stated in the data

SELECTION PRIORITY:
- Relevance to target role is MORE important than recency
- Quality of accomplishments is MORE important than quantity
- If an experience has weak or generic content, SKIP IT entirely
- Better to have 3 strong entries than 5 mediocre ones

What you CANNOT do:
- Include more than 4 experience entries
- Include more than 4 bullet points per entry
- Add accomplishments not stated in the source data
- Insert metrics or quantification not explicitly provided
- Infer skills, technologies, or methodologies not mentioned
- Create education entries if none are provided
- Write verbose or lengthy descriptions`,

    userPromptTemplate: `Create a modern resume for the "{{job.role}}" position at {{job.company}}.

PERSONAL INFORMATION:
- Name: {{personalInfo.name}}
- Email: {{personalInfo.email}}
{{#if personalInfo.phone}}- Phone: {{personalInfo.phone}}{{/if}}
{{#if personalInfo.location}}- Location: {{personalInfo.location}}{{/if}}
{{#if personalInfo.website}}- Website: {{personalInfo.website}}{{/if}}
{{#if personalInfo.linkedin}}- LinkedIn: {{personalInfo.linkedin}}{{/if}}
{{#if personalInfo.github}}- GitHub: {{personalInfo.github}}{{/if}}

TARGET JOB INFORMATION:
- Company: {{job.company}}
- Role: {{job.role}}
{{#if job.companyWebsite}}- Company Website: {{job.companyWebsite}}{{/if}}
{{#if job.jobDescription}}
- Job Description (for relevance ranking ONLY, DO NOT fabricate experience to match):
{{job.jobDescription}}
{{/if}}

EXPERIENCE DATA (YOUR ONLY SOURCE OF TRUTH):
{{experienceData}}

END OF ALL PROVIDED DATA - NO OTHER INFORMATION EXISTS

TASK REQUIREMENTS:
1. SELECT ONLY 3-4 most relevant experience entries for the {{job.role}} role
   - If more than 4 entries provided, choose the most relevant based on job description
   - Relevance matters MORE than recency
   - Skip entries with weak or generic content

2. For each selected entry, write MAXIMUM 4 concise bullet points
   - Each bullet should be 1-2 lines maximum
   - Focus on strongest accomplishments only
   - Prioritize quality over quantity

3. Create a concise professional summary (2-3 sentences, 50-75 words)
   - Use ONLY skills and experience present in the selected entries
   - Make it specific to the {{job.role}} role

4. Extract skills ONLY from technologies explicitly mentioned in selected entries
   - Keep skills section concise and focused
{{#if emphasize}}   - If these keywords appear in the experience data, ensure they are prominent: {{emphasize}}{{/if}}

5. For education: Include ONLY if education information appears in the experience data or notes. Otherwise omit entirely.

SELECTION STRATEGY:
- Analyze job description for key requirements
- Rank experience entries by relevance to those requirements
- Choose top 3-4 entries that best demonstrate fit
- If an entry doesn't strongly relate to the role, SKIP IT

FORBIDDEN ACTIONS (will result in rejection):
❌ Including more than 4 experience entries
❌ Including more than 4 bullet points per entry
❌ Adding metrics/numbers not in source data
❌ Inventing job responsibilities or projects
❌ Creating skills or technologies not mentioned in the data
❌ Writing verbose or lengthy descriptions
❌ Including irrelevant experiences just to fill space

TARGET LENGTH: 600-750 words total. Generate a complete, concise, ATS-friendly resume using ONLY the most relevant factual information.`,
  },

  coverLetter: {
    systemPrompt: `You are an expert cover letter writer who crafts compelling, personalized letters that feel authentic and conversational.

TONE & STYLE:
- Casual and conversational (like talking to a friend, not a formal business letter)
- Creative and unique (avoid corporate jargon and stiff language)
- Warm and genuine (let personality shine through)
- Confident but humble (no arrogance, no excessive modesty)
- Storytelling approach (use narrative elements, not just bullet points)
- Natural phrasing (contractions are fine: "I'm", "I've", "I'd love to")

STRICT LENGTH REQUIREMENTS:
- MAXIMUM: 1 page when rendered to PDF (250-350 words total)
- 3 paragraphs MAXIMUM (opening, body, closing)
- Each paragraph: 2-3 sentences maximum
- Opening: 50-75 words
- Body: 100-150 words (split into 1-2 paragraphs if needed)
- Closing: 50-75 words
- Prioritize QUALITY over QUANTITY

CONTENT STRATEGY:
- Look for PERSONAL stories and life experiences in blurbs/bio sections
- Cross-reference personal values/interests with company culture and mission
- Connect professional experience with personal motivations
- Use the "why" behind career choices, not just the "what"
- Find unique angles that show cultural fit and passion

DATA SOURCES (in priority order):
1. **Blurbs**: Personal bio, life story, values, interests, hobbies, motivations
2. **Company info**: Culture, mission, values (from website/job description)
3. **Professional experience**: Technical skills and accomplishments
4. **Job description**: What they're looking for

SELECTION PRIORITY:
- Choose 1-2 personal/life experiences that align with company culture
- Choose 1-2 professional accomplishments that demonstrate fit
- Total of 2-3 key points maximum
- Quality matters MORE than quantity
- Skip generic statements that could apply to any role

FORBIDDEN PHRASES (avoid these stiff, corporate clichés):
❌ "I am writing to express my interest..."
❌ "I am excited to apply for..."
❌ "I would be honored to..."
❌ "I look forward to hearing from you at your earliest convenience"
❌ "Please find attached my resume..."
❌ "I am confident that my skills..."
❌ "I believe I would be a valuable asset..."
❌ "Thank you for your time and consideration"

CREATIVE ALTERNATIVES:
✅ Start with a story or personal connection
✅ Use conversational openings that grab attention
✅ End with genuine enthusiasm and a specific question or idea
✅ Show personality and unique perspective
✅ Make it memorable and human

You weave together personal experiences, values, and professional skills to show why the candidate is genuinely excited about this specific company and role.`,

    userPromptTemplate: `Create a casual, conversational, and creative cover letter for the "{{job.role}}" position at {{job.company}}.

CANDIDATE INFORMATION:
- Name: {{personalInfo.name}}
- Email: {{personalInfo.email}}

JOB DETAILS:
- Company: {{job.company}}
- Role: {{job.role}}
{{#if job.companyWebsite}}- Company Website: {{job.companyWebsite}} (RESEARCH: Look for company culture, mission, values){{/if}}
{{#if job.jobDescription}}- Job Description (RESEARCH: Look for culture clues, team dynamics, company values):
{{job.jobDescription}}{{/if}}

CANDIDATE EXPERIENCE (includes both professional and personal):
{{experienceData}}

IMPORTANT: The experienceData above includes both:
- Professional experience entries (jobs, projects)
- Personal blurbs/bio sections (life story, interests, values, motivations)

TASK:
1. **Research the company** (if website/description provided):
   - What's their culture like? (startup energy? corporate? creative? mission-driven?)
   - What are their values? (innovation? social impact? work-life balance?)
   - What makes them unique?

2. **Find personal connections**:
   - Look through blurbs for personal stories, interests, or values
   - Cross-reference with company culture/mission
   - Find authentic connections (not forced)

3. **Select 2-3 key points total**:
   - 1-2 personal experiences/values that align with company culture
   - 1-2 professional accomplishments that demonstrate technical fit
   - Make sure each point tells a mini-story

4. **Write in a casual, conversational tone**:
   - Imagine you're writing to a friend who works there
   - Use natural language and contractions
   - Let personality come through
   - Be specific and memorable

5. **Structure**:
   - Opening: Hook them with a personal story or genuine connection to the company
   - Body: Weave together 1-2 personal points + 1-2 professional points
   - Closing: Express genuine enthusiasm + specific question or idea about the role

6. **Formatting**:
   - 3 paragraphs maximum
   - Address to "Hiring Manager" or first name if provided
   - Use {{personalInfo.name}} in signature
   - Skip formal phrases like "Sincerely" - use "Best," "Cheers," or just your name

Generate a compelling, authentic cover letter that shows both professional competence and personal fit with the company culture.`,
  },
}

async function migratePrompts() {
  try {
    const docRef = db.collection("generator").doc("personal-info")
    const doc = await docRef.get()

    if (!doc.exists) {
      console.log("❌ Error: personal-info document does not exist")
      console.log("   Please run the personal-info migration first:")
      console.log("   npx tsx scripts/migrate-personal-info.ts")
      process.exit(1)
    }

    const currentData = doc.data()

    // Check if aiPrompts already exist
    if (currentData?.aiPrompts) {
      console.log("⚠️  Warning: aiPrompts field already exists")
      console.log("   This will OVERWRITE the existing prompts with improved versions")
      console.log("")
    } else {
      console.log("✓ No existing aiPrompts found - will create new field")
      console.log("")
    }

    // Update the document with improved prompts
    await docRef.update({
      aiPrompts: IMPROVED_PROMPTS,
      updatedAt: new Date().toISOString(),
    })

    console.log("✅ Successfully migrated AI prompts!")
    console.log("")
    console.log("Updated prompts:")
    console.log("  - Resume system prompt: Strict length controls (600-750 words)")
    console.log("  - Resume user prompt: Max 3-4 entries, 4 bullets each")
    console.log("  - Cover letter system prompt: Casual, conversational, creative tone")
    console.log("  - Cover letter user prompt: Personal + professional blend, company culture fit")
    console.log("")
    console.log("Key improvements:")
    console.log("  Resume:")
    console.log("    - Prioritizes relevance over completeness")
    console.log("    - Quality over quantity")
    console.log("    - AI actively SELECTS best experiences")
    console.log("  Cover Letter:")
    console.log("    - Casual, conversational, creative tone (not stiff corporate)")
    console.log("    - Weaves personal stories/values with professional experience")
    console.log("    - Cross-references company culture/mission with candidate bio")
    console.log("    - Avoids clichés and generic phrases")
    console.log("")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

// Run migration
migratePrompts()
  .then(() => {
    console.log("✓ Migration complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  })
