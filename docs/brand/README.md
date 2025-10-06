# Josh Wentworth — General Brand Guide

> A concise, media-agnostic guide for consistent, professional–playful branding across web, print, and social.  
> This intentionally excludes implementation details (no CSS tokens, no framework notes). Use it as direction for any designer or developer.

---

## 1) Brand Essence
- **Positioning:** Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication.
- **Personality:** Calm, precise, curious; playful details used sparingly.
- **Keywords:** engineered, modern, human, inventive, trustworthy.

---

## 2) Logo System
**Primary mark:** Custom “JW” script with a rounded terminal and a cool-cyan accent dot.

### Variants
- **Primary (Gradient):** Dark JW with a cool cyan gradient dot. Use for signature moments (hero images, covers, avatars).
- **Mono Dark:** JW in near‑black for light backgrounds.
- **Mono Light:** JW in white for dark backgrounds.
- **Glyph / App Icon:** JW reversed in a rounded square.

### Use & Protection
- **Clear space:** At least the height of the “J” curl on all sides.
- **Minimum size:** 24px (glyph) / 40px (full JW).
- **Do not:** distort, add effects, recolor the accent, place over busy imagery, or reduce contrast.

> Place final logo files in `/assets/logo/` for projects. Include SVG for vector uses and PNG at multiple sizes for raster uses.

---

## 3) Color System
- **Ink (primary text):** #0F172A  
- **Ink-2 (secondary text):** #384155  
- **Surface (base):** #FFFFFF  
- **Surface-2 (alt panels):** #F7F8FB  
- **Accent (links/CTAs/details):** #0EA5E9  
- **Gradient:** #1B1F2B → #00C9A7

**Usage ratio:** ~70% surfaces, 20% ink range, 10% accent/gradient.  
**Contrast:** Maintain WCAG AA—normal text ≥ 4.5:1, large text ≥ 3:1.

Included assets:
- `/assets/brand-palette.png` — quick swatch sheet
- `/assets/brand-gradient-sample.png` — sample gradient for reference

---

## 4) Typography
- **Headings:** Poppins (600/700). Alternatives: Montserrat, Nunito Sans.
- **Body/UI:** Inter (400/500). Alternatives: Source Sans 3, IBM Plex Sans.

**Recommended sizes (adapt as needed)**
- H1: 48–56 px (desktop) / 32–36 px (mobile)
- H2: 36–40 px
- H3: 28–32 px
- Body: 16 px (line-height ~1.6–1.65)
- Small: 14 px

**Tone:** Minimal tracking; crisp, modern rhythm.

---

## 5) Iconography
### Foreground Icons (in UI, diagrams)
- Stroke‑based, 2 px line, solid near‑black; no fills unless necessary.
- Sizes: 28 px near titles; 16–20 px in chips and buttons.
- Keep shapes friendly (rounded caps/joins) and technically clear.

### Background Icons (ambient/illustrative)
- Stroke‑only outlines; subtle opacity; never behind essential text.
- Use asymmetry, gentle size variety, and sparse placement to suggest engineering themes without visual noise.

---

## 6) Imagery & Illustration
- **Portraits:** Natural light, confident expression, uncluttered backgrounds. If framing, use a thin gradient ring with soft shadow.
- **Project photos:** Prioritize clarity and craft; show wiring neatness, enclosures, and final outcomes.
- **Abstract shapes:** Soft gradient washes and geometric hints can be used to create depth behind content.

---

## 7) Layout & Spacing
- **Content width:** Design to a comfortable reading width; avoid edge‑to‑edge for long text.
- **Vertical rhythm:** Generous spacing between sections; allow elements to breathe.
- **Radii & elevation:** Friendly radii (cards ~16 px). Shadows should feel soft and premium—used to separate, not decorate.
- **Safe zones:** Keep ample padding around logos, headlines, and calls‑to‑action.

---

## 8) Motion & Personality
- **Character:** Subtle, purposeful motion that communicates depth and system feedback; never gimmicky.
- **Usage:** Light parallax or fade/translate on entrances; micro‑interactions that feel responsive (hover, press, focus).
- **Accessibility:** Always provide a reduced‑motion option and avoid motion that hinders legibility.

---

## 9) Accessibility Principles
- Respect color contrast minimums (WCAG AA) and ensure text legibility over gradients.
- Provide visible focus states and clear control targets across all media.
- Never convey meaning by color alone; pair with labels or icons when possible.

---

## 10) Voice & Copy Direction
- **Voice:** Plain‑spoken, confident, generous with specifics.
- **Style:** Short sentences. Active voice. Avoid hype.
- **Taglines/examples:** “Software × Hardware × Fabrication.” “End‑to‑end problem solving.”

---

## 11) Asset Delivery & Naming
Use clear, self‑describing names and include vector + raster formats where appropriate.

```
/assets
  /logo
    jw-primary-gradient.svg
    jw-mono-dark.svg
    jw-mono-light.svg
    jw-glyph-tile.svg
  /icons
    foreground-*.svg   # solid, 2px stroke
    background-*.svg   # outline, reduced opacity when placed
  /typography
    Poppins-license.txt
    Inter-license.txt
  /photography
    headshot-original.ext
    project-*.ext
```

> Version and date your asset packs when handing off to vendors or collaborators.

---

## 12) Brand Examples (apply across media)
- **Web:** Light surfaces with soft gradient washes; ambient background icons in negative space; decisive CTAs.
- **Print:** High‑contrast layouts; logo with generous clear space; avoid heavy drop shadows.
- **Social:** Branded cover templates with the JW mark, gradient accent, and a consistent type hierarchy (H1 + kicker).
- **Slides:** Clean title covers with logo and gradient; internal slides use foreground icons, not background outlines.

---

## 13) Do / Don’t (at a glance)
**Do**
- Use generous whitespace and clear hierarchy.
- Keep icons consistent in stroke and personality.
- Maintain consistent color balance and contrast.

**Don’t**
- Overuse gradients or shadows.
- Place logos over detailed photography without a neutral buffer.
- Crowd layouts or let playful elements overpower content.

---

## 14) North Star
**Premium calm with a playful undercurrent.**  
The mark is the signature; gradients and icons add character; every detail reflects careful engineering and human warmth.
