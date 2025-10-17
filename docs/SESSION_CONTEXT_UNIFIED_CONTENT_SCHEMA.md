# Session Context: Unified Content Schema

**Date:** 2025-10-16
**Branch:** `feature/unified-content-schema`
**Status:** Frontend implementation complete, ready for UI integration

## Overview

Complete refactor of experience data (experience-entries and experience-blurbs) into a unified `content-items` collection with flexible, type-safe schema supporting nested structures.

**Key Decision:** Backwards compatibility is NOT a concern - this is a clean slate implementation.

## What Was Completed

### 1. Backend Implementation ✅ (Previously Completed)

**Files Created/Modified:**
- `functions/src/types/content-item.types.ts` - 8 content types with discriminated unions
- `functions/src/services/content-item.service.ts` - Full CRUD + hierarchy operations
- `functions/src/content-items.ts` - HTTP Cloud Function with RESTful API
- `functions/src/index.ts` - Export manageContentItems function
- `functions/src/config/database.ts` - Add CONTENT_ITEMS_COLLECTION constant

**API Endpoints:**
```
GET    /content-items              - List items (filterable)
GET    /content-items/hierarchy    - Full tree structure
GET    /content-items/:id          - Single item
POST   /content-items              - Create (auth required)
PUT    /content-items/:id          - Update (auth required)
DELETE /content-items/:id          - Delete (auth required)
DELETE /content-items/:id/cascade  - Delete with children (auth required)
POST   /content-items/reorder      - Reorder items (auth required)
```

**Migration:**
- `scripts/migrate-to-content-items.ts` - Reads from production, writes to target env
- `scripts/clear-content-items.ts` - Helper to clear collection
- `scripts/verify-migration.ts` - Verify migrated data
- Successfully migrated 30 items (7 experiences + 6 blurbs → 30 content items)

**Testing:**
- API tested via emulator
- Health check: ✅
- List companies: 7 items ✅
- Hierarchy: 16 root items ✅
- All 211 tests passing ✅

### 2. Frontend Implementation ✅ (Just Completed)

**Files Created:**

```
web/src/types/content-item.ts              - Type definitions (264 lines)
web/src/api/content-item-client.ts         - API client (127 lines)
web/src/components/ContentItem.tsx         - Base component (213 lines)

web/src/components/content-types/
├── CompanyView.tsx          - View company items
├── CompanyEdit.tsx          - Edit company items
├── ProjectView.tsx          - View projects
├── ProjectEdit.tsx          - Edit projects
├── SkillGroupView.tsx       - View skill groups
├── SkillGroupEdit.tsx       - Edit skill groups
├── EducationView.tsx        - View education
├── EducationEdit.tsx        - Edit education
├── ProfileSectionView.tsx   - View profile sections
├── ProfileSectionEdit.tsx   - Edit profile sections
├── TextSectionView.tsx      - View text sections
├── TextSectionEdit.tsx      - Edit text sections
├── AccomplishmentView.tsx   - View accomplishments
├── AccomplishmentEdit.tsx   - Edit accomplishments
├── TimelineEventView.tsx    - View timeline events
└── TimelineEventEdit.tsx    - Edit timeline events
```

**Files Modified:**
- `web/src/api/index.ts` - Export contentItemClient

**Features:**
- Type-safe discriminated unions with proper type guards
- Complete CRUD operations via ContentItemClient
- View/Edit mode switching in base component
- Support for nested items (rendered with left border indentation)
- Dynamic form fields for links and subcategories
- Delete confirmation dialogs
- Consistent styling with theme-ui
- All TypeScript errors resolved (except pre-existing draggable list issues)

**TypeScript Fixes Applied:**
- Used type casting in edit components: `data as UpdateCompanyData`
- Changed `Text as="a"` to `Link` from theme-ui for proper sx prop support
- Fixed FormField label types: `idx === 0 ? "Label" : ""` instead of undefined

## Content Types (8 Total)

1. **CompanyItem** - Work experience at companies
2. **ProjectItem** - Individual projects (can be nested under companies)
3. **SkillGroupItem** - Categorized skill lists with optional subcategories
4. **EducationItem** - Educational background and certifications
5. **ProfileSectionItem** - Profile/bio sections with structured data
6. **TextSectionItem** - Generic markdown text sections
7. **AccomplishmentItem** - Individual achievements
8. **TimelineEventItem** - Timeline/event entries

## Schema Design Principles

- **Hierarchical:** Unlimited nesting via `parentId` field
- **Ordered:** All items have `order` field for consistent sorting
- **Visibility:** `published` | `draft` | `archived` states
- **AI-Ready:** `aiContext` field with hints for document generation
- **Audit Trail:** `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on all items
- **Tags:** Optional tagging for flexible categorization

## Next Steps (When Resuming)

### Option A: Build UI Page for Content Management
Create a new page to manage content-items:
1. Create `web/src/pages/content-items.tsx` (editor-only page)
2. Use ContentItem component for display
3. Add drag-and-drop reordering (similar to DraggableExperienceList)
4. Add "Create New" dialog with type selector
5. Test full CRUD workflow

### Option B: Integrate with Existing Experience Page
Update the experience page to use content-items:
1. Update `web/src/pages/experience.tsx` to fetch from content-items API
2. Replace ExperienceEntry/BlurbEntry components with ContentItem
3. Update hooks to use contentItemClient
4. Test migration path

### Option C: Update AI Generator Integration
Ensure content-items work with the resume generator:
1. Update `functions/src/services/generator.service.ts` to read from content-items
2. Test AI ingestion with new schema
3. Verify PDF generation still works

## Important Notes

### Migration Strategy
- **DO NOT** run migration on production until fully tested
- Migration reads from production, writes to target environment
- Use `--dry-run` flag first to preview changes
- Migration commands:
  ```bash
  # Dry run
  FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/migrate-to-content-items.ts --dry-run

  # Actual migration to emulator
  FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/migrate-to-content-items.ts --force

  # Verify
  FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/verify-migration.ts
  ```

### Pre-existing Issues
The following TypeScript errors exist but are NOT related to this work:
- `DraggableBlurbList.tsx:135` - UniqueIdentifier type mismatch
- `DraggableExperienceList.tsx:128` - UniqueIdentifier type mismatch
- `ReorderModal.tsx:209` - UniqueIdentifier type mismatch

These can be addressed separately if needed.

### Testing Checklist Before Merging
- [ ] Create UI page or integrate with existing page
- [ ] Test all CRUD operations via UI
- [ ] Test nested item creation and rendering
- [ ] Test reordering functionality
- [ ] Test with authenticated user (editor role)
- [ ] Verify AI generator still works with new schema
- [ ] Test migration on staging environment
- [ ] Create PR: feature/unified-content-schema → staging

## Git Status

**Current Branch:** `feature/unified-content-schema`
**Last Commit:** `fbbde7d` - "feat: implement frontend for unified content-items system"
**Remote:** Pushed to origin ✅
**Tests:** All 211 tests passing ✅

## Quick Commands

```bash
# Switch to feature branch
git checkout feature/unified-content-schema

# Start emulators with test data
make firebase-emulators
# In another terminal:
node scripts/copy-prod-to-local.js
FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/migrate-to-content-items.ts --force

# Build functions
npm run build:functions

# Start dev server
npm run dev

# Run tests
npm test

# Check linting
npm run lint:tsc
```

## API Usage Example

```typescript
import { contentItemClient } from '../api'

// List all companies
const companies = await contentItemClient.getItemsByType('company')

// Get hierarchy
const tree = await contentItemClient.getHierarchy()

// Create new project under company
const project = await contentItemClient.createItem({
  type: 'project',
  name: 'New Project',
  description: 'Project description',
  parentId: companyId,
  order: 0,
})

// Update item
await contentItemClient.updateItem(project.id, {
  name: 'Updated Project Name',
})

// Delete with children
const deletedCount = await contentItemClient.deleteWithChildren(companyId)
```

## File Locations Reference

```
Backend:
├── functions/src/types/content-item.types.ts
├── functions/src/services/content-item.service.ts
├── functions/src/content-items.ts
└── functions/src/index.ts

Frontend:
├── web/src/types/content-item.ts
├── web/src/api/content-item-client.ts
├── web/src/components/ContentItem.tsx
└── web/src/components/content-types/
    ├── [Type]View.tsx (8 files)
    └── [Type]Edit.tsx (8 files)

Scripts:
├── scripts/migrate-to-content-items.ts
├── scripts/clear-content-items.ts
└── scripts/verify-migration.ts
```

---

**Ready to resume:** All code is committed and pushed. Frontend implementation is complete. Next step is UI integration or testing.
