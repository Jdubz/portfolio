# Development Scripts

Organized scripts for portfolio development, build, and maintenance tasks.

## Structure

```text
scripts/
├── screenshot/          # Screenshot generation tools
│   ├── generate.js      # Main screenshot generator  
│   ├── verify.js        # Screenshot validator
│   ├── test.js          # Quick test tool
│   ├── workflow.js      # Complete workflow
│   └── README.md        # Screenshot tools documentation
├── dev/                 # Development utilities (future)
├── build/               # Build utilities (future)  
└── README.md           # This file
```

## Quick Start

Use the Makefile for all operations:

```bash
# Generate and verify screenshots
make screenshots

# Quick screenshot test
make screenshots-test

# Development server
make dev

# Build production
make build
```

## Available Commands

### Screenshot Generation

- `make screenshots` - Generate all component screenshots and verify them
- `make screenshots-test` - Quick desktop-only test
- `make screenshots-verify` - Verify existing screenshots are valid

See `screenshot/README.md` for detailed documentation.

### Development

- `make dev` - Start Gatsby development server
- `make build` - Build for production
- `make serve` - Serve production build
- `make clean` - Clean Gatsby cache

### Utilities

- `make kill` - Kill processes on dev ports
- `make status` - Check what's running on ports
- `make help` - Show all available commands

## Philosophy

**Makefile over npm scripts**: We use Make as the primary interface for development tasks because:

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Self-documenting**: `make help` shows all available commands
- **Composable**: Easy to chain and combine operations
- **Dependency management**: Built-in dependency resolution
- **No node_modules bloat**: Keeps package.json focused on actual dependencies

**Organized by purpose**: Scripts are grouped by their function rather than scattered in the root.

## Adding New Scripts

1. **Choose the right directory**:
   - `screenshot/` - Screenshot and visual testing tools
   - `dev/` - Development utilities, linting, testing
   - `build/` - Build optimization, bundling, deployment prep

2. **Add to Makefile**: Create a corresponding Make target

3. **Document**: Update relevant README files

## Migration Notes

All screenshot-related npm scripts have been moved to Make targets:

- `npm run screenshot:*` → `make screenshots*`
- Scripts moved from `scripts/*.js` → `scripts/screenshot/*.js`
- Simplified naming: `screenshot-isolated-components.js` → `generate.js`

## Output

All screenshots are saved to `./screenshots/` with the following naming convention:

```text
{component-name}-{device}.png
```

Examples:

- `hero-desktop.png`
- `hero-mobile.png`
- `projects-tablet.png`

### Manifest File

A JSON manifest is generated with each run:

```json
{
  "components": [
    {
      "name": "hero",
      "device": "desktop",
      "filepath": "screenshots/hero-desktop.png",
      "description": "Hero section with avatar and CTAs"
    }
  ],
  "timestamp": "2025-10-01T18-10-40"
}
```

## Configuration

Edit `scripts/screenshot-isolated-components.js` to customize:

### Component List

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

### Viewport Sizes

```javascript
viewport: {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
}
```

## Architecture

### Component Isolation Method

The new approach renders components in complete isolation using:

1. **Self-contained HTML**: Each component gets its own HTML page with embedded React
2. **Mock data**: Components use realistic mock data for consistent screenshots
3. **Theme styles**: CSS that matches the actual portfolio design
4. **No external dependencies**: No need for Gatsby, routing, or a development server

### Component Structure

Each component is rendered with:

- Proper styling and theming
- Mock data that represents real content
- Responsive design for different viewports
- Consistent typography and spacing

## Troubleshooting

### Common Issues

**404 Pages**: The old approach was trying to navigate to non-existent test pages. The new isolated approach eliminates this issue.

**Parallax Interference**: Components are now rendered without the parallax container, so no scrolling or animation interference.

**Styling Issues**: Each component includes its own complete CSS, ensuring consistent appearance.

### Debugging

To debug component rendering:

1. Check the generated HTML in the script
2. Modify the `waitForTimeout` if components need more time to render
3. Adjust viewport sizes if needed
4. Add console logs to the component rendering logic

Or set environment variable:

```bash
SITE_URL=https://joshwentworth.com npm run screenshot
```

## Requirements

- Dev server must be running (`npm run develop`) or
- Set `SITE_URL` to deployed site URL

## Examples

### Quick Component Preview

```bash
# Start dev server
npm run develop

# In another terminal
npm run screenshot:components
```

### Production Screenshots

```bash
# After deploying to staging
SITE_URL=https://staging.joshwentworth.com npm run screenshot
```

### Mobile-Only Testing

```bash
npm run screenshot:mobile
```

## Legacy Troubleshooting

### "Failed to connect to localhost:8000"

Make sure your dev server is running:

```bash
npm run develop
```

### Component Not Found

Check that the selector in the config matches your component's HTML. Use browser DevTools to inspect elements and verify the selector.

### Slow Screenshot Generation

This is normal! Playwright waits for:

- Page load
- Network idle
- Animations to complete

Desktop + tablet + mobile screenshots can take 30-60 seconds.

## Tips

- Run screenshots after major UI changes
- Commit screenshots to track visual changes over time
- Use screenshots in documentation and README files
- Compare screenshots before/after refactoring
