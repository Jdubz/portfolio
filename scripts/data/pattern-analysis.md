# Markdown Pattern Analysis

## Identified Repeating Patterns

### 1. **Technology Stacks** ⭐ HIGH PRIORITY
**Current Format (Markdown):**
- `**Stack**: Tech1, Tech2, Tech3`
- `**Skills**: Tech1, Tech2, Tech3`
- `Stack: Docker, React, Styled Components`
- Plain list: `Python, GLSL, Touch Designer, Javascript`

**Found In:**
- selected-projects blurb: "**Stack**: React • Gatsby • Theme UI..."
- Meow Wolf: "Stack: Docker, React, Styled Components, Bootstrap, MaterialUI, Pub/Sub"
- Fulfil: "**Skills**: Angular, Node.js (TypeScript), MySQL, Redis..."
- BriteLite: "Python, GLSL, Touch Designer, Javascript"
- Madrone: "Python, GLSL, Touch Designer"
- OPNA (multiple): "**Skills**: Vanilla JS, unit testing" etc.

**Proposed Structure:**
```json
{
  "technologies": ["React", "Gatsby", "Theme UI", "Node.js", "Express", "Firebase"]
}
```

---

### 2. **Project/Client Subsections** ⭐ HIGH PRIORITY
**Current Format:**
```markdown
## Clients

## Intuit
Description...
**Skills**: tech1, tech2

## Google Partner Program
Description...

**Dialogflow & JLL**
Sub-project description
**Skills**: tech1, tech2
```

**Found In:**
- Fulfil: "## Projects" → "### Amazon Fresh / Whole Foods", "### Order Management Web Apps", "### Marketplace Support"
- OPNA: "## Clients" → "## Intuit", "## Google Partner Program" (with nested sub-projects)
- BriteLite: "## Instagram Instastop / Twitter Golden Screen"
- Contractor: "## Digital Promise"

**Proposed Structure:**
```json
{
  "projects": [
    {
      "name": "Amazon Fresh / Whole Foods",
      "description": "I was on the team engaged on a year-long project...",
      "technologies": ["GCP", "Node.js", "Kubernetes"]
    }
  ]
}
```

---

### 3. **Key Responsibilities/Accomplishments**
**Current Format:**
```markdown
- First responsibility/achievement
- Second responsibility/achievement
- Third responsibility/achievement
```

**Found In:** Nearly all entries as top-level bullet lists

**Proposed Structure:**
```json
{
  "accomplishments": [
    "Scaled the platform from stealth to powering three automated grocery stores",
    "Integrated partners (Amazon, DoorDash, Uber Eats...)",
    "Architected & delivered APIs and automation..."
  ]
}
```

---

### 4. **Challenges**
**Current Format:**
```markdown
**challenges**
- challenge 1
- challenge 2
- challenge 3
```

**Found In:** BriteLite entry only (rare pattern, but could be useful)

**Proposed Structure:**
```json
{
  "challenges": [
    "live on the air - no mistakes",
    "calibrating color temperature for the cameras",
    "the touch screens were IR grids..."
  ]
}
```

---

### 5. **Categorized Skills List** ⭐ HIGH PRIORITY
**Current Format:**
```markdown
- **Frontend** - Angular, React, Mobx, Sentry...
- **Backend** — nodejs, express, apollo, python...
- **Platform** — GCP, Linux, Docker
```

**Found In:** skills blurb

**Proposed Structure:**
```json
{
  "skillCategories": [
    {
      "category": "Frontend",
      "skills": ["Angular", "React", "Mobx", "Sentry", "tailwind", "shadcn"]
    },
    {
      "category": "Backend",
      "skills": ["nodejs", "express", "apollo", "python", "Flask", "C++"]
    }
  ]
}
```

---

### 6. **Education/Certification Items**
**Current Format:**
```markdown
### **Title** (dates)
description
**Detail** - detail text
```

**Found In:** education-certificates blurb

**Proposed Structure:**
```json
{
  "items": [
    {
      "title": "Google Cloud Professional Cloud Developer",
      "dateRange": "2019–2021",
      "type": "certification"
    },
    {
      "title": "UCSC — B.A. in Classical Western Music",
      "date": "May 2009",
      "details": "minors in Electronic Music & Jazz",
      "honors": "Regents scholar - top 1% of incoming freshmen...",
      "type": "degree"
    }
  ]
}
```

---

### 7. **Project Showcase Items** ⭐
**Current Format:**
```markdown
## Project Name
Description
**Stack**: tech1 • tech2 • tech3
[Source Code](URL)
```

**Found In:** selected-projects blurb

**Proposed Structure:**
```json
{
  "projects": [
    {
      "name": "Profile website",
      "description": "This website is a full stack application...",
      "technologies": ["React", "Gatsby", "Theme UI", "Node.js", "Express", "Firebase"],
      "links": [
        { "label": "Source Code", "url": "https://github.com/Jdubz/portfolio" }
      ]
    }
  ]
}
```

---

### 8. **Profile Header** (Intro Blurb)
**Current Format:**
```markdown
## Role Title
Description paragraph

**Primary stack**: tech • tech • tech

**Quick links**: [Link1](url) • [Link2](url)

*Tagline*
```

**Proposed Structure:**
```json
{
  "role": "Senior Full-Stack & Platform Engineer",
  "summary": "I design and ship production systems...",
  "primaryStack": ["TypeScript/React", "Node.js", "Python", "Postgres/MySQL/Redis"],
  "links": [
    { "label": "GitHub", "url": "https://github.com/Jdubz" },
    { "label": "LinkedIn", "url": "https://www.linkedin.com/in/joshwentworth/" }
  ],
  "tagline": "I build user-facing features on top of solid platforms..."
}
```

---

## Rendering Type Categorization

Based on patterns, here are the render types:

1. **`profile-header`** - intro blurb
2. **`project-showcase`** - selected-projects blurb
3. **`categorized-list`** - skills blurb
4. **`timeline`** - education-certificates blurb
5. **`text`** - biography, closing-notes blurbs
6. **`structured-entry`** - Most experience entries (accomplishments + projects + technologies)
7. **`simple-entry`** - Basic entries (Meow Wolf, Wentworth)

---

## Recommended New Schema

### For Experience Entries:
```typescript
interface ExperienceEntry {
  // Existing fields
  id: string
  title: string
  role?: string
  location?: string
  startDate: string
  endDate?: string | null
  notes?: string
  order?: number

  // NEW STRUCTURED FIELDS
  summary?: string  // Free-form overview
  accomplishments?: string[]  // Key achievements/responsibilities
  technologies?: string[]  // Tech stack
  projects?: Array<{  // Sub-projects/clients
    name: string
    description: string
    technologies?: string[]
    challenges?: string[]
  }>

  // Deprecated (keep for backward compatibility during migration)
  body?: string
  relatedBlurbIds?: string[]

  // Metadata
  renderType?: 'structured' | 'simple' | 'text'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
```

### For Blurbs:
```typescript
interface BlurbEntry {
  // Existing
  id: string
  name: string
  title: string
  order?: number
  type?: "page" | "entry"
  parentEntryId?: string

  // NEW: Structured data based on renderType
  renderType?: 'profile-header' | 'project-showcase' | 'categorized-list' | 'timeline' | 'text'

  // Structured fields (populated based on renderType)
  structuredData?: {
    // For profile-header
    role?: string
    summary?: string
    primaryStack?: string[]
    links?: Array<{ label: string; url: string }>
    tagline?: string

    // For project-showcase
    projects?: Array<{
      name: string
      description: string
      technologies?: string[]
      links?: Array<{ label: string; url: string }>
    }>

    // For categorized-list
    categories?: Array<{
      category: string
      items?: string[]
      skills?: string[]
    }>

    // For timeline
    items?: Array<{
      title: string
      date?: string
      dateRange?: string
      description?: string
      details?: string
      type?: string
    }>
  }

  // Deprecated (keep for backward compatibility)
  content?: string

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
```
