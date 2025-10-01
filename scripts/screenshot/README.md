# Screenshot Tools

Automated screenshot generation for portfolio components using Playwright.

## Overview

These tools render each component in complete isolation, bypassing parallax interference and routing issues that plagued the previous approach.

## Quick Start

```bash
# Generate all screenshots and verify them
make screenshots

# Quick desktop-only test
make screenshots-test

# Verify existing screenshots
make screenshots-verify
```

## Tools

### `generate.js` - Main Screenshot Generator

Renders components in isolation using React with mock data.

**Features:**

- ✅ No parallax interference
- ✅ No routing dependencies  
- ✅ Self-contained HTML with embedded React
- ✅ Responsive capture (desktop, tablet, mobile)
- ✅ Theme-consistent styling

**Usage:**

```bashbash
node scripts/screenshot/generate.js [device]
```

**Options:**

- `desktop` - Desktop only (1920x1080)
- `tablet` - Tablet only (768x1024)  
- `mobile` - Mobile only (375x812)
- No args - All devices

### `verify.js` - Screenshot Validator

Checks that generated screenshots are valid images (not 404 pages).

**Usage:**

```bash
node scripts/screenshot/verify.js
```

### `test.js` - Quick Test

Generates desktop screenshots only for rapid testing.

**Usage:**

```bash
node scripts/screenshot/test.js
```

### `workflow.js` - Complete Workflow

Runs the full generate → verify workflow.

**Usage:**

```bash
node scripts/screenshot/workflow.js
```

## Output

Screenshots are saved to `./screenshots/` with the naming pattern:

```text
{component}-{device}.png
```

Examples:

- `hero-desktop.png`
- `projects-mobile.png`
- `about-tablet.png`

## Component Configuration

Edit `generate.js` to modify components:

```javascript
components: [
  {
    name: 'hero',
    description: 'Hero section with avatar and CTAs',
    backgroundColor: '#FFFFFF',
  },
  // Add more components...
]
```

## Architecture

### Isolation Method

1. **Self-contained HTML**: Each component gets its own complete HTML page
2. **Embedded React**: React and Babel loaded via CDN for component rendering
3. **Mock data**: Realistic sample content for consistent screenshots
4. **Theme CSS**: Complete styling that matches the portfolio design
5. **No external dependencies**: No Gatsby, routing, or development server needed

### Benefits

- **Reliable**: No more 404 pages or navigation issues
- **Fast**: No development server startup time
- **Consistent**: Same styling approach every time
- **Debuggable**: Self-contained HTML makes issues easy to trace
- **Portable**: Works independently of the main application

## Troubleshooting

### Invalid Screenshots

Run `make screenshots-verify` to check for problems. Issues are usually:

- Very small file sizes (< 1KB) indicate rendering failures
- Missing components in the configuration
- CSS styling problems

### Slow Generation

Normal! Playwright needs time to:

- Load and render React components
- Apply fonts and styling
- Capture high-quality screenshots

Typical timing: ~10-15 seconds for all devices.

### Development

To modify component rendering:

1. Edit the component definitions in `generate.js`
2. Update mock data as needed
3. Test with `make screenshots-test`
4. Verify with `make screenshots-verify`
