# Hero Component — Design & Implementation Requirements

This package contains breakpoint mockups (`png/`) and a concise checklist to implement the hero in your Gatsby + Theme UI (LekoArts Cara) repository.

---

## Breakpoints & Layout

- **Desktop (≥1024px):** two-column layout. Text left (max-width 46–52ch), avatar right (~256px), aligned vertically with headline block.
- **Tablet (~768×1024):** two-column layout. Text max-width ~52ch, avatar ~232px.
- **Mobile (≤700px):** stacked layout. Avatar above text (~200–220px), then kicker → H1 → sub → proof → CTAs → micro-cred.

**Container**
- Max width: **1200px**, centered.
- Side padding: **16 / 24 / 40px** (sm / md / lg).
- Vertical padding: **64–88px** (mobile–desktop).

---

## Avatar Treatment

- Sizes: **256 / 232 / 200–220px** (desktop / tablet / mobile).
- Shape: **16px radius**, **1px border** using theme `border` color.
- Shadow: **long & soft** (`0 24px 60px rgba(2,6,23,.10)`).
- Subtle gradient ring behind (violet→cyan) with ~0.30 opacity blur.
- Provide descriptive `alt`.

---

## Typography

- H1: weight 900, letter-spacing −0.02em; responsive with:
  ```
  font-size: ["clamp(32px, 6vw, 40px)", "clamp(40px, 5vw, 56px)", "clamp(48px, 4vw, 64px)"];
  line-height: [1.12, 1.08, 1.04];
  ```
- Body text: **16–18px**, line-height ~**1.55**, max-width **720–740px**.
- Kicker: weight 700; Micro-cred: **14–16px**, muted color.

---

## Buttons (Accessibility & Affordance)

- Variants: **primary** (brand blue, white text) and **secondary** (white with 1px border).
- Shape: **16px radius**; min tap height **≥44px**; horizontal padding **≥22px**.
- Keyboard focus: visible ring  
  `box-shadow: 0 0 0 4px rgba(14,165,233,.35)`.

---

## Background Icons (Decoration)

- Keep opacity low: **~0.06 desktop / 0.08 mobile**.
- Prevent collisions: add a mask behind the text area, e.g.  
  `mask-image: radial-gradient(220px 140px at 24% 46%, transparent 0, black 60%);`
- Avoid heavy `backdrop-filter` or parallax that harms mobile performance.

---

## Accessibility

- Exactly **one `<h1>`** on the page.
- All interactive elements reachable by keyboard with visible focus.
- Color contrast meets **WCAG AA** (check buttons and text).
- Provide `alt` text for images; minimize motion or respect `prefers-reduced-motion`.

---

## Performance

- Place `avatar.jpg` in `/static/` (Gatsby will optimize).
- Source image ~**1200×1200** at **80–85%** JPEG quality.
- Avoid large blur/filters on big layers; use a single soft shadow.
- Run `npm run clean` after shadowing to ensure updated sections render.

---

## Implementation Notes for Your Repo

**Files to touch (shadowed paths):**
- `src/@lekoarts/gatsby-theme-cara/sections/intro.mdx` — layout, masking layer, and component composition.
- `src/@lekoarts/gatsby-theme-cara/components/AvatarFrame.tsx` — ring/border/shadow.
- `src/gatsby-plugin-theme-ui/index.(ts|js)` — tokens:
  - `colors.ring`, `colors.border`, `colors.accentStart/accentEnd`
  - `shadows.ring`, `shadows.softLg`
  - `text.heroTitle`, `text.heroSub`, `text.heroProof`, `text.micro`
  - `buttons.primary`, `buttons.secondary`

**Suggested tokens:**
```ts
colors: {
  ring: "rgba(14,165,233,.35)",
  border: "rgba(15,23,42,.12)",
  accentStart: "#7C3AED",
  accentEnd: "#06B6D4",
},
shadows: {
  softLg: "0 24px 60px rgba(2,6,23,.10)",
  ring: "0 0 0 4px var(--theme-ui-colors-ring)",
}
```

---

## Files Included

- `png/hero-mock-desktop.png`
- `png/hero-mock-tablet.png`
- `png/hero-mock-mobile.png`

These are visual guides; proportions and spacing are annotated in the sections above.
