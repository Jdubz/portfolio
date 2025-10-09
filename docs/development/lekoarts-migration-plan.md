# Migration Plan: Remove @lekoarts/gatsby-theme-cara

## Executive Summary

**Goal:** Remove the `@lekoarts/gatsby-theme-cara` dependency and fully own all code while maintaining 100% identical functionality and styling.

**Why:** Better control over Open Graph/social media previews, eliminate dependency on external theme, full code ownership.

**Effort:** Medium - Most components are already shadowed, but we need to extract theme infrastructure.

**Risk:** Low - We control all visible code already, just need to refactor imports and move files.

## Current State Analysis

### Theme Usage

The theme currently provides:

1. **Gatsby Plugins** (via `gatsby-config.ts`)
   - `gatsby-plugin-mdx` - MDX support
   - `gatsby-plugin-theme-ui` - Theme-UI integration
   - `gatsby-source-filesystem` - File system sourcing
   - Tailwind preset for Theme-UI

2. **Components** (via import from theme)
   - `Seo` - SEO/metadata component (shadowed but imports hook from theme)
   - Hook: `useSiteMetadata` - GraphQL query for site metadata

3. **Infrastructure**
   - Theme-UI configuration base
   - MDX processing pipeline
   - Parallel page creation logic (minimal)

### Files We Already Shadow (Own)

All visible components are shadowed in `src/@lekoarts/gatsby-theme-cara/`:

```
✅ components/
   - about.tsx
   - AvatarFrame.tsx
   - contact.tsx
   - footer.tsx
   - hero.tsx
   - layout.tsx
   - nav-button.tsx
   - project-card.tsx
   - projects.tsx
   - scroll-button.tsx
   - seo.tsx (imports one hook from theme)
   - svg.tsx

✅ elements/
   - content.tsx
   - divider.tsx
   - inner.tsx

✅ styles/
   - animations.tsx

✅ templates/
   - cara.tsx (imports Seo from theme)

✅ sections/
   - intro.mdx
   - projects.mdx
   - about.mdx
   - contact.mdx

✅ gatsby-ssr.tsx
```

### Files Imported From Theme

Only 2 imports from the theme:

1. **`Seo` component** in `cara.tsx` - Can be replaced with our shadowed version
2. **`useSiteMetadata` hook** in `seo.tsx` - Simple GraphQL query we can copy

## Migration Strategy

### Phase 1: Extract Theme Infrastructure

#### Step 1.1: Create useSiteMetadata Hook

**Create:** `web/src/hooks/useSiteMetadata.ts`

```typescript
import { graphql, useStaticQuery } from "gatsby"

interface SiteMetadata {
  siteTitle: string
  siteTitleAlt: string
  siteHeadline: string
  siteUrl: string
  siteDescription: string
  siteImage: string
  siteLanguage: string
  author: string
}

const useSiteMetadata = (): SiteMetadata => {
  const data = useStaticQuery<{ site: { siteMetadata: SiteMetadata } }>(graphql`
    query {
      site {
        siteMetadata {
          siteTitle
          siteTitleAlt
          siteHeadline
          siteUrl
          siteDescription
          siteImage
          siteLanguage
          author
        }
      }
    }
  `)

  return data.site.siteMetadata
}

export default useSiteMetadata
```

#### Step 1.2: Update SEO Component

**Update:** `web/src/@lekoarts/gatsby-theme-cara/components/seo.tsx`

```diff
- import useSiteMetadata from "@lekoarts/gatsby-theme-cara/src/hooks/use-site-metadata"
+ import useSiteMetadata from "../../../hooks/useSiteMetadata"
```

#### Step 1.3: Update Cara Template

**Update:** `web/src/@lekoarts/gatsby-theme-cara/templates/cara.tsx`

```diff
- import Seo from "@lekoarts/gatsby-theme-cara/src/components/seo"
+ import Seo from "../components/seo"
```

### Phase 2: Move Shadowed Files to Proper Locations

Move all files from `src/@lekoarts/gatsby-theme-cara/` to standard locations:

```
src/@lekoarts/gatsby-theme-cara/components/* → src/components/*
src/@lekoarts/gatsby-theme-cara/elements/* → src/components/elements/*
src/@lekoarts/gatsby-theme-cara/styles/* → src/styles/*
src/@lekoarts/gatsby-theme-cara/templates/* → src/templates/*
src/@lekoarts/gatsby-theme-cara/sections/* → src/content/* (or src/sections/)
```

**Reasoning:** Standard Gatsby structure, easier to understand, no theme namespace pollution.

### Phase 3: Update gatsby-config.ts

Replace theme with direct plugin configuration:

```typescript
// Before
plugins: [
  {
    resolve: `@lekoarts/gatsby-theme-cara`,
    options: {},
  },
  // ...
]

// After
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `sections`,
      path: `${__dirname}/src/content/sections`,
    },
  },
  {
    resolve: `gatsby-plugin-mdx`,
    options: {
      extensions: [`.mdx`, `.md`],
      gatsbyRemarkPlugins: [],
    },
  },
  `gatsby-plugin-theme-ui`,
  // ...
]
```

### Phase 4: Update All Imports

Update imports throughout the codebase:

```diff
# In all files that import shadowed components:

- import Component from "../@lekoarts/gatsby-theme-cara/components/component"
+ import Component from "../components/component"

- import Element from "../@lekoarts/gatsby-theme-cara/elements/element"
+ import Element from "../components/elements/element"

- import Template from "../@lekoarts/gatsby-theme-cara/templates/template"
+ import Template from "../templates/template"
```

### Phase 5: Update package.json

Remove theme dependency and add required plugins:

```diff
"dependencies": {
- "@lekoarts/gatsby-theme-cara": "^5.1.7",
+ "gatsby-plugin-mdx": "^5.14.0",
+ "gatsby-plugin-theme-ui": "^0.16.8",
+ "gatsby-source-filesystem": "^5.14.0",
}
```

**Note:** `@mdx-js/react`, `@react-spring/parallax`, `@theme-ui/mdx`, `theme-ui` already in dependencies.

### Phase 6: Clean Up Theme-UI Configuration

Our `src/gatsby-plugin-theme-ui/index.ts` already fully overrides the theme. No changes needed.

### Phase 7: Test & Verify

1. ✅ Build succeeds: `npm run build`
2. ✅ Development works: `npm run develop`
3. ✅ All pages load correctly
4. ✅ Styling remains identical
5. ✅ Parallax effects work
6. ✅ MDX sections render
7. ✅ SEO meta tags present
8. ✅ Tests pass: `npm test`
9. ✅ E2E tests pass: `npm run test:e2e`

## Detailed File Migration Map

### Components to Move

```
FROM: src/@lekoarts/gatsby-theme-cara/components/
TO: src/components/homepage/

Files:
✅ about.tsx → About.tsx
✅ contact.tsx → Contact.tsx
✅ footer.tsx → Footer.tsx
✅ hero.tsx → Hero.tsx
✅ layout.tsx → Layout.tsx
✅ nav-button.tsx → NavButton.tsx
✅ project-card.tsx → ProjectCard.tsx
✅ projects.tsx → Projects.tsx
✅ scroll-button.tsx → ScrollButton.tsx
✅ seo.tsx → Seo.tsx (update hook import)
✅ svg.tsx → Svg.tsx
✅ AvatarFrame.tsx → AvatarFrame.tsx
```

### Elements to Move

```
FROM: src/@lekoarts/gatsby-theme-cara/elements/
TO: src/components/elements/

Files:
✅ content.tsx → Content.tsx
✅ divider.tsx → Divider.tsx
✅ inner.tsx → Inner.tsx
```

### Styles to Move

```
FROM: src/@lekoarts/gatsby-theme-cara/styles/
TO: src/styles/

Files:
✅ animations.tsx → animations.tsx
```

### Templates to Move

```
FROM: src/@lekoarts/gatsby-theme-cara/templates/
TO: src/templates/

Files:
✅ cara.tsx → home.tsx (rename for clarity)
```

### Sections/Content to Move

```
FROM: src/@lekoarts/gatsby-theme-cara/sections/
TO: src/content/sections/

Files:
✅ intro.mdx → intro.mdx
✅ about.mdx → about.mdx
✅ projects.mdx → projects.mdx
✅ contact.mdx → contact.mdx
```

### gatsby-ssr to Update

```
FROM: src/@lekoarts/gatsby-theme-cara/gatsby-ssr.tsx
TO: web/gatsby-ssr.js (merge into existing)
```

## Import Updates Required

### Files Importing Shadowed Components

**Pages:**

- `src/pages/404.tsx`
- `src/pages/contact.tsx`
- `src/pages/experience.tsx`
- `src/pages/privacy.tsx`
- `src/pages/terms.tsx`

**Tests:**

- `src/__tests__/components/About.test.tsx`
- `src/__tests__/components/Contact.test.tsx`
- `src/__tests__/components/Hero.test.tsx`
- `src/__tests__/components/Projects.test.tsx`

### Import Path Changes

```typescript
// Old
import Layout from "../@lekoarts/gatsby-theme-cara/components/layout"
import Seo from "../@lekoarts/gatsby-theme-cara/components/seo"

// New
import Layout from "../components/homepage/Layout"
import Seo from "../components/homepage/Seo"
```

## Gatsby Configuration Changes

### Current gatsby-config.ts

```typescript
plugins: [
  {
    resolve: `@lekoarts/gatsby-theme-cara`,
    options: {},
  },
  // ...
]
```

### New gatsby-config.ts

```typescript
plugins: [
  // MDX support for content sections
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `sections`,
      path: `${__dirname}/src/content/sections`,
    },
  },
  {
    resolve: `gatsby-plugin-mdx`,
    options: {
      extensions: [`.mdx`, `.md`],
      gatsbyRemarkPlugins: [],
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [],
      },
    },
  },

  // Theme-UI for styling
  {
    resolve: `gatsby-plugin-theme-ui`,
    options: {
      // Our custom theme in src/gatsby-plugin-theme-ui/index.ts
    },
  },

  // ... rest of plugins
]
```

## Page Creation Logic

The theme creates one page (`/`) using the `cara.tsx` template. We need to replicate this.

### Create gatsby-node.ts

**New file:** `web/gatsby-node.ts`

```typescript
import type { GatsbyNode } from "gatsby"
import * as path from "path"

export const createPages: GatsbyNode["createPages"] = async ({ actions }) => {
  const { createPage } = actions

  // Create homepage using our template
  createPage({
    path: `/`,
    component: path.resolve(`./src/templates/home.tsx`),
    context: {},
  })
}
```

**Note:** This may not be necessary if Gatsby auto-creates pages from templates, but it's safer to be explicit.

## Social Media Preview Fix

**The main goal:** Update Open Graph metadata in `Seo.tsx`.

### Current Issue

The preview shows "Gatsby Themes by www.lekoarts.de" image because the theme sets default `siteImage`.

### Solution

Update `gatsby-config.ts` siteMetadata:

```typescript
siteMetadata: {
  siteTitle: `Josh Wentworth`,
  siteTitleAlt: `Josh Wentworth - Software × Hardware × Fabrication`,
  siteHeadline: `Josh Wentworth - Multidisciplinary Engineer`,
  siteUrl: `https://joshwentworth.com`,
  siteDescription: `Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication. End-to-end problem solving.`,
  siteImage: `/og-image.jpg`, // ← Update this
  siteLanguage: `en`,
  author: `Josh Wentworth`,
}
```

**Create custom Open Graph image:**

- `web/static/og-image.jpg` (1200x630px recommended)
- Or use existing banner: `/banner.jpg`

## Dependencies Analysis

### Keep (Already in package.json)

✅ `@emotion/react` - Used by Theme-UI
✅ `@mdx-js/react` - MDX support
✅ `@react-spring/parallax` - Parallax scrolling
✅ `@theme-ui/mdx` - Theme-UI MDX components
✅ `theme-ui` - Styling system

### Add

✅ `gatsby-plugin-mdx` - MDX processing (was provided by theme)
✅ `gatsby-plugin-theme-ui` - Theme-UI integration (was provided by theme)
✅ `gatsby-source-filesystem` - File sourcing (was provided by theme)

### Remove

❌ `@lekoarts/gatsby-theme-cara` - The theme itself

### Version Updates

Check for compatible versions (theme uses older versions):

```json
{
  "gatsby-plugin-mdx": "^5.14.0", // Latest for Gatsby 5
  "gatsby-plugin-theme-ui": "^0.16.8", // Match theme-ui version
  "gatsby-source-filesystem": "^5.14.0" // Latest for Gatsby 5
}
```

## Risk Mitigation

### Low Risk

- All UI code already shadowed
- Theme provides minimal functionality
- Clear migration path

### Potential Issues

1. **MDX Processing** - May need to configure gatsby-plugin-mdx correctly
   - Solution: Copy MDX config from theme's gatsby-config

2. **Page Creation** - Homepage may not auto-create
   - Solution: Add gatsby-node.ts with explicit createPage

3. **Import Errors** - Many files import from old locations
   - Solution: Systematic find/replace with testing

4. **Build Errors** - Missing dependencies
   - Solution: Add plugins one-by-one, test builds

### Testing Strategy

1. **Before migration:** Take screenshots of all pages
2. **After each phase:** Build and visual comparison
3. **Final check:** Full E2E test suite
4. **Lighthouse:** Verify performance unchanged

## Timeline

### Phase 1: Setup (1 hour)

- Create useSiteMetadata hook
- Update SEO component imports
- Test build

### Phase 2: File Migration (2 hours)

- Move all shadowed files to new locations
- Systematic rename
- Update internal imports within moved files

### Phase 3: Import Updates (2 hours)

- Find all imports of shadowed files
- Update to new paths
- Test build after each section

### Phase 4: Config Update (1 hour)

- Update gatsby-config.ts
- Add required plugins
- Update package.json

### Phase 5: Testing (2 hours)

- Visual comparison
- Run all tests
- E2E testing
- Lighthouse audit

### Phase 6: Cleanup (30 min)

- Remove @lekoarts theme directory
- Remove from package.json
- Clean node_modules
- Final build

**Total Estimated Time: 8.5 hours**

## Benefits

✅ **Full Code Ownership** - No external theme dependency
✅ **Better SEO Control** - Customize Open Graph previews
✅ **Simpler Imports** - Standard Gatsby structure
✅ **Easier Debugging** - All code in one place
✅ **Bundle Size** - Remove unused theme code
✅ **Maintenance** - No waiting for theme updates
✅ **Customization** - Modify anything without shadowing
✅ **Performance** - Optimize without theme constraints

## Rollback Plan

If migration fails:

1. Revert git changes
2. Reinstall @lekoarts/gatsby-theme-cara
3. Build should work immediately

**Safety:** Work in a branch, test thoroughly before merging.

## Success Criteria

✅ Build succeeds without theme
✅ All pages render identically
✅ All styles identical
✅ Parallax effects work
✅ MDX sections render
✅ SEO tags correct
✅ Tests pass
✅ E2E tests pass
✅ Lighthouse scores unchanged
✅ Open Graph preview shows custom image

## Next Steps

1. Create feature branch: `git checkout -b remove-lekoarts-theme`
2. Follow phase-by-phase plan
3. Test after each phase
4. Document any deviations
5. Create PR with before/after screenshots
6. Merge after approval

## Questions to Answer

1. **Do we need gatsby-node.ts?** - Test if homepage auto-creates
2. **MDX config?** - What options does theme use?
3. **Theme-UI preset?** - Theme uses Tailwind preset, do we need it?
4. **Custom Open Graph image?** - Create new or use existing banner?

## Reference Links

- [Gatsby Theme Shadowing](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/shadowing/)
- [Gatsby MDX Plugin](https://www.gatsbyjs.com/plugins/gatsby-plugin-mdx/)
- [Theme-UI Gatsby Plugin](https://theme-ui.com/packages/gatsby-plugin)
- [@lekoarts/gatsby-theme-cara Source](https://github.com/LekoArts/gatsby-themes/tree/main/themes/gatsby-theme-cara)
