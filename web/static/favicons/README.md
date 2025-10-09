
# JW Favicon Pack

Transparent JW logomark in three styles:
- **primary**: brand gradient
- **dark**: white glyph (for dark UIs)
- **mono**: solid #0F172A glyph (for light UIs)

## Place
Copy the `favicons/` folder to your site root (in Gatsby, put it in `static/favicons`).

## Head tags
```html
<!-- Base -->
<link rel="icon" href="/favicons/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicons/favicon-primary.svg">

<!-- Light/Dark preference -->
<link rel="icon" href="/favicons/favicon-mono.svg" media="(prefers-color-scheme: light)">
<link rel="icon" href="/favicons/favicon-dark.svg" media="(prefers-color-scheme: dark)">

<!-- PNG fallbacks -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/primary-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicons/primary-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/favicons/primary-512.png">

<!-- Apple -->
<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-primary-180.png">

<!-- Safari pinned tab -->
<link rel="mask-icon" href="/favicons/favicon-mono.svg" color="#0EA5E9">

<!-- Manifest -->
<link rel="manifest" href="/favicons/site.webmanifest">
<meta name="theme-color" content="#0EA5E9">
```
