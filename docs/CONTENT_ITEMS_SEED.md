# Content Items Seeding

This document describes the unified content-items data structure and how to seed it across environments.

## Overview

The content-items collection replaces the legacy `experience-entries` and `experience-blurbs` collections with a unified, hierarchical schema that supports 8 content types:

- **company** - Work experience entries
- **project** - Projects nested under companies
- **skill-group** - Skills organized by categories
- **education** - Education and certifications (can be nested)
- **profile-section** - Profile header with structured data
- **text-section** - Markdown content sections
- **accomplishment** - Individual accomplishments (can be nested)
- **timeline-event** - Timeline events (can be nested)

## Seed File

The canonical seed data is stored in:
```
emulator-data/content-items-seed.json
```

This file contains production-ready content in the correct schema format with:
- **13 root items** (companies, text sections, profile section, skill group)
- **14 nested items** (11 projects + 3 education items)
- **Total: 27 items**

### Structure

Root items have `parentId: null` and may contain a `children` array for nested items. The seeder script automatically handles the parent-child relationships.

**Example:**
```json
{
  "type": "text-section",
  "heading": "Education & Certificates",
  "content": "...",
  "parentId": null,
  "order": 11,
  "visibility": "published",
  "children": [
    {
      "type": "education",
      "institution": "Google Cloud Professional Cloud Developer",
      "startDate": "2019",
      "endDate": "2021",
      "order": 0,
      "visibility": "published"
    }
  ]
}
```

## Seeding Environments

### Local Emulator

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/seed-content-items.ts --clear --force
```

### Staging

```bash
FIRESTORE_DATABASE_ID=portfolio-staging npx tsx scripts/seed-content-items.ts --clear --force
```

### Production

```bash
FIRESTORE_DATABASE_ID=portfolio npx tsx scripts/seed-content-items.ts --clear --force
```

## Script Options

- `--clear` - Clear existing content-items before seeding
- `--force` - Skip confirmation prompt

## Verification

After seeding, verify the data:

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx -e "
import { createFirestoreInstance } from './functions/src/config/firestore';

async function verify() {
  const db = createFirestoreInstance();
  const snapshot = await db.collection('content-items').get();

  const typeCounts = {};
  snapshot.docs.forEach(doc => {
    const type = doc.data().type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  console.log('Content Items:', snapshot.size);
  console.log('By Type:', typeCounts);
}

verify();
"
```

Expected output:
```
Content Items: 27
By Type: {
  company: 7,
  text-section: 4,
  project: 11,
  education: 3,
  skill-group: 1,
  profile-section: 1
}
```

## Updating the Seed File

To update the seed file with changes from production:

1. Export current production data:
```bash
npx tsx scripts/export-content-items.ts > emulator-data/content-items-export.json
```

2. Manually review and format the data
3. Update `emulator-data/content-items-seed.json`
4. Test with local emulator before seeding to staging/production

## Legacy Collections

The old `experience-entries` and `experience-blurbs` collections have been removed from the emulator. A backup exists at:
```
emulator-data/legacy-experience-backup.json
```

## Next Steps

- Deploy to staging and verify UI renders correctly
- Deploy to production once staging is validated
- Update API clients to use content-items endpoints
- Remove old experience/blurb API endpoints (after deprecation period)
