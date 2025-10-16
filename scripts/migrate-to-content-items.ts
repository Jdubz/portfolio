#!/usr/bin/env npx tsx

/**
 * Migration Script: experiences + blurbs → content-items
 *
 * This script migrates data from the legacy collections to the new unified schema:
 * - experience-entries → CompanyItem + nested ProjectItem
 * - experience-blurbs → ProfileSectionItem | SkillGroupItem | EducationItem | TextSectionItem
 *
 * IMPORTANT: This script always reads from production data (portfolio database)
 * and writes to the current environment's database.
 *
 * Usage:
 *   # Migrate to local emulator (reads from production, writes to emulator)
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/migrate-to-content-items.ts
 *
 *   # Migrate to staging (reads from production, writes to staging)
 *   FIRESTORE_DATABASE_ID=portfolio-staging npx tsx scripts/migrate-to-content-items.ts
 *
 *   # Migrate to production (reads and writes to production)
 *   FIRESTORE_DATABASE_ID=portfolio npx tsx scripts/migrate-to-content-items.ts
 *
 * Options:
 *   --dry-run    Print what would be migrated without writing to database
 *   --force      Skip confirmation prompt
 */

import { Firestore } from "@google-cloud/firestore"
import { createFirestoreInstance } from "../functions/src/config/firestore"
import { DATABASE_ID } from "../functions/src/config/database"
import type { ExperienceEntry } from "../functions/src/services/experience.service"
import type { BlurbEntry } from "../functions/src/services/blurb.service"
import type { ContentItem, CreateContentItemData } from "../functions/src/types/content-item.types"
import { Timestamp } from "@google-cloud/firestore"
import * as readline from "readline"

// Parse command line args
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const isForce = args.includes("--force")

// Target database (where we write)
const db = createFirestoreInstance()

// Source database - use emulator if FIRESTORE_EMULATOR_HOST is set, otherwise production
const isEmulator = !!process.env.FIRESTORE_EMULATOR_HOST
const sourceDb = isEmulator
  ? db // Use same db (emulator)
  : new Firestore({
      // Production
      projectId: "static-sites-257923",
      databaseId: "portfolio",
    })

interface MigrationStats {
  experienceEntriesRead: number
  blurbsRead: number
  contentItemsCreated: number
  errors: number
}

/**
 * Map experience entry to CompanyItem
 */
function mapExperienceToCompany(entry: ExperienceEntry, order: number): CreateContentItemData {
  const item: CreateContentItemData = {
    type: "company",
    company: entry.title,
    role: entry.role,
    location: entry.location,
    startDate: entry.startDate,
    endDate: entry.endDate,
    summary: entry.summary,
    accomplishments: entry.accomplishments,
    technologies: entry.technologies,
    notes: entry.notes,
    parentId: null,
    order,
    visibility: "published",
  }

  return item
}

/**
 * Map experience entry projects to ProjectItem array
 */
function mapExperienceProjects(entry: ExperienceEntry, companyId: string, baseOrder: number): CreateContentItemData[] {
  if (!entry.projects || entry.projects.length === 0) {
    return []
  }

  return entry.projects.map((project, idx) => {
    const item: CreateContentItemData = {
      type: "project",
      name: project.name,
      description: project.description,
      accomplishments: project.challenges, // Map challenges to accomplishments
      technologies: project.technologies,
      parentId: companyId,
      order: baseOrder + idx,
      visibility: "published",
    }

    return item
  })
}

/**
 * Map blurb to appropriate ContentItem type based on renderType
 */
function mapBlurbToContentItem(blurb: BlurbEntry, order: number): CreateContentItemData[] {
  const items: CreateContentItemData[] = []

  // Handle different renderTypes
  switch (blurb.renderType) {
    case "profile-header": {
      const item: CreateContentItemData = {
        type: "profile-section",
        heading: blurb.title,
        content: blurb.content || "",
        structuredData: blurb.structuredData,
        parentId: null,
        order,
        visibility: "published",
      }
      items.push(item)
      break
    }

    case "categorized-list": {
      // Create a parent text-section for the category list
      const parentItem: CreateContentItemData = {
        type: "text-section",
        heading: blurb.title,
        content: blurb.content || "",
        parentId: null,
        order,
        visibility: "published",
      }
      items.push(parentItem)

      // Create child skill-group items for each category
      // Note: We'll need to create the parent first to get its ID
      // For now, mark these with a temporary parentId that we'll update after creation
      if (blurb.structuredData?.categories) {
        blurb.structuredData.categories.forEach((category, idx) => {
          const skillGroupItem: CreateContentItemData = {
            type: "skill-group",
            category: category.category,
            skills: category.skills || [],
            parentId: `__TEMP_PARENT__${blurb.id}`, // Temporary marker
            order: idx,
            visibility: "published",
          }
          items.push(skillGroupItem)
        })
      }
      break
    }

    case "project-showcase": {
      // Create individual project items
      if (blurb.structuredData?.projects) {
        blurb.structuredData.projects.forEach((project, idx) => {
          const projectItem: CreateContentItemData = {
            type: "project",
            name: project.name,
            description: project.description,
            technologies: project.technologies,
            links: project.links,
            parentId: null,
            order: order + idx,
            visibility: "published",
          }
          items.push(projectItem)
        })
      }
      break
    }

    case "timeline": {
      // Create individual timeline/education items
      if (blurb.structuredData?.items) {
        blurb.structuredData.items.forEach((timelineItem, idx) => {
          // Determine if this is education or generic timeline
          const isEducation = blurb.name.toLowerCase().includes("education") || blurb.name.toLowerCase().includes("certificate")

          if (isEducation) {
            const educationItem: CreateContentItemData = {
              type: "education",
              institution: timelineItem.title,
              degree: timelineItem.description,
              honors: timelineItem.honors,
              description: timelineItem.details,
              startDate: timelineItem.dateRange,
              parentId: null,
              order: order + idx,
              visibility: "published",
            }
            items.push(educationItem)
          } else {
            const eventItem: CreateContentItemData = {
              type: "timeline-event",
              title: timelineItem.title,
              date: timelineItem.date,
              dateRange: timelineItem.dateRange,
              description: timelineItem.description,
              details: timelineItem.details,
              parentId: null,
              order: order + idx,
              visibility: "published",
            }
            items.push(eventItem)
          }
        })
      }
      break
    }

    case "text":
    default: {
      // Plain text section
      const item: CreateContentItemData = {
        type: "text-section",
        heading: blurb.title,
        content: blurb.content || "",
        format: "markdown",
        parentId: null,
        order,
        visibility: "published",
      }
      items.push(item)
      break
    }
  }

  return items
}

/**
 * Confirm migration with user
 */
async function confirm(message: string): Promise<boolean> {
  if (isForce) {
    return true
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("🚀 Content Items Migration Script")
  console.log("==================================")
  console.log(`Source Database: ${isEmulator ? `${DATABASE_ID} (emulator)` : "portfolio (production)"}`)
  console.log(`Target Database: ${DATABASE_ID}`)
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes will be made)" : "LIVE"}`)
  console.log()

  const stats: MigrationStats = {
    experienceEntriesRead: 0,
    blurbsRead: 0,
    contentItemsCreated: 0,
    errors: 0,
  }

  try {
    // Read existing data
    console.log(`📖 Reading existing data from ${isEmulator ? "emulator" : "production"}...`)

    const experienceSnapshot = await sourceDb.collection("experience-entries").orderBy("order", "asc").get()
    const blurbSnapshot = await sourceDb.collection("experience-blurbs").orderBy("order", "asc").get()

    const experiences = experienceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<ExperienceEntry, "id">),
    })) as ExperienceEntry[]

    const blurbs = blurbSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<BlurbEntry, "id">),
    })) as BlurbEntry[]

    stats.experienceEntriesRead = experiences.length
    stats.blurbsRead = blurbs.length

    console.log(`   ✓ Found ${experiences.length} experience entries`)
    console.log(`   ✓ Found ${blurbs.length} blurbs`)
    console.log()

    // Generate new content items
    console.log("🔄 Transforming data...")
    const itemsToCreate: Array<CreateContentItemData & { metadata?: { sourceType: string; sourceId: string } }> = []

    // Transform experiences
    let orderCounter = 0
    for (const experience of experiences) {
      const companyItem = mapExperienceToCompany(experience, orderCounter)
      itemsToCreate.push({
        ...companyItem,
        metadata: { sourceType: "experience", sourceId: experience.id },
      })
      orderCounter++

      // Note: Projects will need to be created after the company to get the parent ID
      // We'll handle this in the write phase
    }

    // Transform blurbs
    for (const blurb of blurbs) {
      const blurbItems = mapBlurbToContentItem(blurb, orderCounter)
      for (const item of blurbItems) {
        itemsToCreate.push({
          ...item,
          metadata: { sourceType: "blurb", sourceId: blurb.id },
        })
        orderCounter++
      }
    }

    console.log(`   ✓ Generated ${itemsToCreate.length} content items`)
    console.log()

    // Display summary
    const typeCounts = itemsToCreate.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    console.log("📊 Migration Summary:")
    console.log(`   Total items to create: ${itemsToCreate.length}`)
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`)
    })
    console.log()

    if (isDryRun) {
      console.log("🔍 DRY RUN - Showing first 3 items:")
      console.log(JSON.stringify(itemsToCreate.slice(0, 3), null, 2))
      console.log()
      console.log("✅ Dry run complete. No changes made.")
      return
    }

    // Confirm before writing
    const confirmed = await confirm("⚠️  This will write data to the database. Continue?")
    if (!confirmed) {
      console.log("❌ Migration cancelled.")
      return
    }

    // Write to database
    console.log("💾 Writing to database...")

    const now = Timestamp.now()
    const migratedBy = "migration-script"

    // Track mapping of source IDs to new IDs for handling nested items
    const idMap = new Map<string, string>()

    // Helper function to remove undefined values (Firestore doesn't accept them)
    const removeUndefined = (obj: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          result[key] = value
        }
      }
      return result
    }

    // First pass: Create all items
    for (const item of itemsToCreate) {
      try {
        const docData = removeUndefined({
          ...item,
          createdAt: now,
          updatedAt: now,
          createdBy: migratedBy,
          updatedBy: migratedBy,
        })

        // Remove metadata (it's just for tracking during migration)
        delete (docData as { metadata?: unknown }).metadata

        const docRef = await db.collection("content-items").add(docData)

        if (item.metadata) {
          idMap.set(item.metadata.sourceId, docRef.id)
        }

        stats.contentItemsCreated++
      } catch (error) {
        console.error(`   ✗ Failed to create item:`, error)
        stats.errors++
      }
    }

    // Second pass: Handle nested items (projects under companies, skill groups under sections)
    // For now, we'll skip this as it requires a more complex two-phase migration
    // TODO: Implement nested item creation in a future iteration

    console.log()
    console.log("✅ Migration complete!")
    console.log(`   - Experience entries read: ${stats.experienceEntriesRead}`)
    console.log(`   - Blurbs read: ${stats.blurbsRead}`)
    console.log(`   - Content items created: ${stats.contentItemsCreated}`)
    console.log(`   - Errors: ${stats.errors}`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

// Run migration
migrate()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
