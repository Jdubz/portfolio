# JW Logo Kit (Final)

This package contains production-ready assets using your approved artwork.

## Structure
- `primary/gradient/` – Full JW logo (gradient, transparent background) in SVG-wrapper + PNG (1024, 512)
- `primary/monochrome/` – Black-only fallback (SVG-wrapper + PNG)
- `primary/darkmode/` – White-only fallback (SVG-wrapper + PNG)
- `favicon/flat/` – Navy rounded-square favicon + apple/maskable icons (PNG + multi-size .ico)
- `favicon/monochrome/` – Black-square/white-glyph variants (PNG)
- `favicon/darkmode/` – White-square/navy-glyph variants (PNG)
- `site.webmanifest` – PWA manifest referencing only flat navy icons

## HTML Snippet
<link rel="icon" href="/favicon/flat/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon/flat/favicon.ico">
<link rel="apple-touch-icon" href="/favicon/flat/apple-touch-icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0F172A">

