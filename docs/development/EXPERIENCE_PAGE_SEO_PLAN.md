# Experience Page SEO & Static Generation Plan

> **Status:** Planning / Not Implemented
>
> **Last Updated:** October 13, 2025
>
> **Priority:** Medium - Improves SEO and page performance

## Problem Statement

**Current Issues:**
- Experience page data is fetched client-side from Firestore
- JavaScript renders content after page load
- Search engines see empty page (poor SEO)
- Slow time-to-content for users
- No static HTML for crawlers/bots
- Content not searchable without loading JavaScript

**Impact:**
- ❌ Poor SEO ranking
- ❌ Bots/crawlers can't index content
- ❌ Slow perceived performance
- ❌ No search functionality

---

## Recommended Solution: Hybrid Static + Client Hydration

Generate static HTML at build time for SEO and instant loading, while maintaining live Firestore updates for editors.

### Why This Approach?

1. **Perfect SEO** - Static HTML at build time means all bots see content
2. **Instant Loading** - No Firestore calls for public viewers
3. **Live Editing** - Editors still get real-time Firestore data
4. **Searchable** - All content in static HTML, can add search index
5. **Cost Effective** - Firestore calls only for editors (not per page view)
6. **Best of Both Worlds** - Static for public, dynamic for editors

---

## Implementation Phases

### Phase 1: Add Gatsby Source Plugin for Firestore

**Install plugin:**
```bash
npm install gatsby-source-firestore
```

**Configure in gatsby-config.ts:**
```typescript
{
  resolve: 'gatsby-source-firestore',
  options: {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    types: [
      {
        type: 'ExperienceEntry',
        collection: 'experience-entries',
        map: doc => ({
          ...doc,
          // Convert Firestore timestamps to strings for GraphQL
          startDate: doc.startDate?.toDate?.() || doc.startDate,
          endDate: doc.endDate?.toDate?.() || doc.endDate,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt,
        }),
      },
      {
        type: 'ExperienceBlurb',
        collection: 'experience-blurbs',
        map: doc => ({
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt,
        }),
      },
    ],
  },
}
```

**Environment Variables:**
Add to `.env.development`, `.env.staging`, `.env.production`:
```bash
FIREBASE_PROJECT_ID=static-sites-257923
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@static-sites-257923.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

### Phase 2: Create GraphQL Queries

**Update experience.tsx with GraphQL:**
```typescript
// src/pages/experience.tsx
import { graphql } from 'gatsby'

export const query = graphql`
  query ExperiencePage {
    allExperienceEntry(
      sort: { startDate: DESC }
      filter: { visibility: { eq: "public" } }
    ) {
      nodes {
        id
        title
        role
        company
        location
        startDate
        endDate
        body
        notes
        skills
        visibility
        tags
        createdAt
        updatedAt
      }
    }
    allExperienceBlurb {
      nodes {
        id
        name
        content
        tags
        createdAt
        updatedAt
      }
    }
  }
`

interface ExperiencePageProps {
  data: {
    allExperienceEntry: {
      nodes: ExperienceEntry[]
    }
    allExperienceBlurb: {
      nodes: BlurbEntry[]
    }
  }
}
```

---

### Phase 3: Update Page Component (Hybrid Approach)

**Modify experience page to use static data for public, live for editors:**

```typescript
const ExperiencePage: React.FC<ExperiencePageProps> = ({ data }) => {
  const { user, isEditor } = useAuth()
  const [liveData, setLiveData] = useState<{
    entries: ExperienceEntry[]
    blurbs: BlurbEntry[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch live data ONLY for editors
  useEffect(() => {
    if (isEditor) {
      setLoading(true)
      Promise.all([
        experienceClient.getEntries(),
        blurbClient.getBlurbs(),
      ])
        .then(([entries, blurbs]) => {
          setLiveData({ entries, blurbs })
        })
        .catch((error) => {
          logger.error('Failed to load live experience data', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isEditor])

  // Use live data for editors, static GraphQL data for public
  const entries = liveData?.entries || data.allExperienceEntry.nodes
  const blurbs = liveData?.blurbs || data.allExperienceBlurb.nodes

  return (
    <Box>
      {loading && isEditor && <Spinner />}
      <ExperienceContent
        entries={entries}
        blurbs={blurbs}
        isEditor={isEditor}
      />
    </Box>
  )
}

export default ExperiencePage
```

**Benefits:**
- Public viewers get instant static content (no Firestore calls)
- Editors get live data for real-time editing
- SEO crawlers see full static HTML
- No JavaScript required for content visibility

---

### Phase 4: Add Client-Side Search

**Install search library:**
```bash
npm install flexsearch
```

**Generate search index at build time:**
```typescript
// gatsby-node.ts
exports.onPostBuild = async ({ graphql }) => {
  const { data } = await graphql(`
    query SearchIndex {
      allExperienceEntry {
        nodes {
          id
          title
          role
          company
          body
          skills
        }
      }
    }
  `)

  // Create FlexSearch index
  const index = new Index({
    tokenize: 'forward',
    resolution: 9,
  })

  const documents = {}
  data.allExperienceEntry.nodes.forEach((entry, idx) => {
    const searchText = [
      entry.title,
      entry.role,
      entry.company,
      entry.body,
      entry.skills?.join(' '),
    ].filter(Boolean).join(' ')

    index.add(idx, searchText)
    documents[idx] = entry
  })

  // Export index
  fs.writeFileSync(
    path.join('public', 'search-index.json'),
    JSON.stringify({
      index: index.export(),
      documents,
    })
  )
}
```

**Add search component:**
```typescript
import { Index } from 'flexsearch'
import searchData from '../../../public/search-index.json'

const ExperienceSearch: React.FC<{ onResults: (ids: string[]) => void }> = ({ onResults }) => {
  const [query, setQuery] = useState('')
  const indexRef = useRef<Index>()

  useEffect(() => {
    // Initialize search index
    indexRef.current = new Index()
    indexRef.current.import(searchData.index)
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      onResults([])
      return
    }

    const results = indexRef.current?.search(searchQuery) || []
    const matchedIds = results.map(idx => searchData.documents[idx].id)
    onResults(matchedIds)
  }

  return (
    <Input
      placeholder="Search experience..."
      value={query}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}
```

---

### Phase 5: Trigger Rebuilds on Firestore Changes

**Option A: Manual Webhook (Simple)**

Add a "Publish" button in the editor UI that triggers a build:

```typescript
const publishChanges = async () => {
  await fetch(process.env.GATSBY_BUILD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trigger: 'experience-update' }),
  })
}
```

**Option B: Automatic Firestore Trigger (Advanced)**

Create Cloud Function to auto-trigger builds:

```typescript
// functions/src/triggers/gatsby-build.ts
import { onDocumentWritten } from 'firebase-functions/v2/firestore'

export const triggerGatsbyBuild = onDocumentWritten(
  'experience-{collection}/{id}',
  async (event) => {
    const isStaging = process.env.ENVIRONMENT === 'staging'
    const webhookUrl = isStaging
      ? process.env.GATSBY_BUILD_WEBHOOK_STAGING
      : process.env.GATSBY_BUILD_WEBHOOK_PROD

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: 'firestore-update',
          collection: event.params.collection,
          documentId: event.params.id,
        }),
      })

      logger.info('Triggered Gatsby build', {
        collection: event.params.collection,
        documentId: event.params.id,
      })
    } catch (error) {
      logger.error('Failed to trigger Gatsby build', error)
    }
  }
)
```

**Webhook URLs:**
- Gatsby Cloud: Provides webhook URL in project settings
- Netlify: Settings → Build & deploy → Build hooks
- Vercel: Settings → Git → Deploy hooks

---

## Alternative Solutions (For Reference)

### Option A: Full SSR (Server-Side Rendering)

**Pros:**
- Always fresh data
- Good SEO

**Cons:**
- Slower (Firestore query per request)
- Higher costs
- More complex

### Option B: Incremental Static Regeneration (ISR)

**Pros:**
- Good balance of fresh + fast
- Automatic revalidation

**Cons:**
- Requires Gatsby Cloud or Netlify
- Potential cost
- Slight update delay

### Option C: JSON API + Static Shell

**Pros:**
- Simple implementation
- Fast loading

**Cons:**
- Still requires rebuild
- Not as good SEO as full SSG

---

## Migration Steps

1. **Phase 1 (Week 1):**
   - Install and configure gatsby-source-firestore
   - Test GraphQL queries locally
   - Verify data sourcing works

2. **Phase 2 (Week 1):**
   - Update experience page to use GraphQL
   - Test static generation
   - Verify SEO with crawler tools

3. **Phase 3 (Week 2):**
   - Implement hybrid approach (static + live for editors)
   - Test editor experience
   - Ensure no regressions

4. **Phase 4 (Week 2):**
   - Add search functionality
   - Generate search index
   - Test search performance

5. **Phase 5 (Week 3):**
   - Set up build webhook
   - Configure automatic or manual triggers
   - Test end-to-end workflow

---

## Testing Checklist

- [ ] Static HTML contains all experience data
- [ ] Google Search Console sees content
- [ ] Lighthouse SEO score improves
- [ ] Page loads instantly (no spinner)
- [ ] Editors can still edit live
- [ ] Search works without JavaScript
- [ ] Build times are acceptable
- [ ] Webhook triggers work

---

## Potential Issues & Solutions

**Issue 1: Build Times**
- **Problem:** Firestore queries at build time could slow builds
- **Solution:** Cache Firestore credentials, use connection pooling

**Issue 2: Stale Data**
- **Problem:** Static site shows old data until rebuild
- **Solution:**
  - Manual: Add "Publish" button for editors
  - Auto: Set up Firestore triggers to auto-build

**Issue 3: Private Data**
- **Problem:** Don't want private entries in static build
- **Solution:** Filter by `visibility: "public"` in GraphQL query

**Issue 4: Large Data Sets**
- **Problem:** Too many entries could bloat bundle
- **Solution:**
  - Paginate entries (show 20 per page)
  - Use Gatsby pagination API
  - Load more on demand

---

## Performance Metrics

**Current (Client-Side Fetch):**
- Time to First Contentful Paint: ~2-3s
- SEO Score: 60-70
- Bot indexing: ❌ None

**Expected (Static Generation):**
- Time to First Contentful Paint: ~0.2-0.5s
- SEO Score: 95-100
- Bot indexing: ✅ Full content

---

## Cost Analysis

**Current:**
- Firestore reads per page view: ~2 (entries + blurbs)
- Monthly reads (1000 views): ~2,000 reads

**After SSG:**
- Firestore reads per page view: 0 (static)
- Firestore reads per build: ~2
- Monthly reads (daily builds): ~60 reads

**Savings:** 97% reduction in Firestore reads

---

## Related Documentation

- [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/)
- [gatsby-source-firestore](https://www.gatsbyjs.com/plugins/gatsby-source-firestore/)
- [Gatsby Build Hooks](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/webhook-build-trigger/)

---

## Questions to Resolve

1. Which hosting platform for build webhooks? (Gatsby Cloud, Netlify, Vercel)
2. Manual or automatic rebuild triggers?
3. How often should we rebuild? (on every change, daily, weekly)
4. Do we need preview builds for editors before publishing?
