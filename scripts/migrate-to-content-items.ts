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
 * Map timeline items to EducationItem array
 */
function mapTimelineItems(timelineItems: any[], parentId: string, baseOrder: number): CreateContentItemData[] {
  return timelineItems.map((item, idx) => {
    const educationItem: CreateContentItemData = {
      type: "education",
      institution: item.title,
      degree: item.description,
      field: item.details,
      startDate: item.dateRange?.split('–')?.[0] || item.date,
      endDate: item.dateRange?.split('–')?.[1],
      notes: item.honors,
      parentId,
      order: baseOrder + idx,
      visibility: "published",
    }

    return educationItem
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
      // Create a single skill-group with subcategories
      const skillGroupItem: CreateContentItemData = {
        type: "skill-group",
        category: blurb.title,
        skills: [], // Empty main skills array
        subcategories: blurb.structuredData?.categories?.map((cat) => ({
          name: cat.category,
          skills: cat.skills || [],
        })),
        parentId: null,
        order,
        visibility: "published",
      }
      items.push(skillGroupItem)
      break
    }

    case "project-showcase": {
      // Keep as a single text-section with the markdown content
      // The old UI rendered this as a single card, not individual project items
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

    case "timeline": {
      // Create a parent text-section, then create education items from structured data
      const parentItem: CreateContentItemData = {
        type: "text-section",
        heading: blurb.title,
        content: blurb.content || "",
        format: "markdown",
        parentId: null,
        order,
        visibility: "published",
      }
      items.push(parentItem)

      // Mark this item so we can create children in second pass
      if (blurb.structuredData?.items && blurb.structuredData.items.length > 0) {
        items[items.length - 1].metadata = {
          ...items[items.length - 1].metadata,
          hasTimelineChildren: true,
          timelineItems: blurb.structuredData.items,
        }
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

      // Mark experience for later project creation (we'll use metadata to track this)
      if (experience.projects && experience.projects.length > 0) {
        itemsToCreate[itemsToCreate.length - 1].metadata = {
          ...itemsToCreate[itemsToCreate.length - 1].metadata!,
          hasProjects: true,
          originalExperience: experience,
        }
      }
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

    // Second pass: Create nested items (projects under companies, education under timelines)
    console.log("🔗 Creating nested items...")

    for (const [sourceId, parentDocId] of idMap.entries()) {
      // Find the original item that has this sourceId
      const originalItem = itemsToCreate.find(
        (item) => item.metadata?.sourceId === sourceId
      )

      // Handle projects under companies
      if (originalItem?.metadata?.hasProjects && originalItem?.metadata?.originalExperience) {
        const experience = originalItem.metadata.originalExperience as ExperienceEntry
        const projectItems = mapExperienceProjects(experience, parentDocId, 0)

        for (const projectItem of projectItems) {
          try {
            const projectData = removeUndefined({
              ...projectItem,
              createdAt: now,
              updatedAt: now,
              createdBy: migratedBy,
              updatedBy: migratedBy,
            })

            await db.collection("content-items").add(projectData)
            stats.contentItemsCreated++
            console.log(`   ✓ Created project: ${projectItem.name} (parent: ${experience.title})`)
          } catch (error) {
            console.error(`   ✗ Failed to create project:`, error)
            stats.errors++
          }
        }
      }

      // Handle education items under timeline sections
      if (originalItem?.metadata?.hasTimelineChildren && originalItem?.metadata?.timelineItems) {
        const timelineItems = originalItem.metadata.timelineItems
        const educationItems = mapTimelineItems(timelineItems, parentDocId, 0)

        for (const educationItem of educationItems) {
          try {
            const educationData = removeUndefined({
              ...educationItem,
              createdAt: now,
              updatedAt: now,
              createdBy: migratedBy,
              updatedBy: migratedBy,
            })

            await db.collection("content-items").add(educationData)
            stats.contentItemsCreated++
            console.log(`   ✓ Created education: ${educationItem.institution}`)
          } catch (error) {
            console.error(`   ✗ Failed to create education item:`, error)
            stats.errors++
          }
        }
      }
    }


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
