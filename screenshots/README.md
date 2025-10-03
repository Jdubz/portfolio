# Screenshot Tool Requirements

## Command

`make screenshot <component>`

## Specification

### Breakpoints

Screenshots will be generated at the following breakpoints (from theme configuration):

- 480px (mobile)
- 768px (tablet)
- 1024px (desktop-small)
- 1280px (desktop)
- 1440px (desktop-large)

### Components

Valid component names (from `src/@lekoarts/gatsby-theme-cara/sections/`):

- intro
- projects
- about
- contact

### Behavior

- **No argument**: Generates screenshots for all components at all breakpoints
- **With component name**: Generates screenshots for specified component only at all breakpoints
- **Build process**: Automatically runs `gatsby clean` then `gatsby build` for completely fresh build
- **Rendering approach**: Render full page (includes all CSS automatically), crop to component sections
- **Output format**: PNG with decent quality
- **Naming convention**: `{component}-{breakpoint}.png` (e.g., `intro-480px.png`)
- **Output directory**: `/screenshots/images/` (git ignored subfolder, auto-created)

### Styling & Rendering

- Screenshots must reflect exact styles from the production site
- Full page rendering includes all CSS automatically in the built bundle
- Motion and parallax effects disabled globally only if they interfere with component positioning
- No mock data needed - components render with their existing props in full page context
- Component-agnostic approach: render full page, crop to component sections using `data-screenshot-section` attributes
- Use exact breakpoint pixel values from theme config for viewport width (480px, 768px, 1024px, 1280px, 1440px)
- Height auto-adjusts based on content for all breakpoints
- Component identification via `data-screenshot-section="intro"` attributes (requires adding to each component)

### Cleanup & Error Handling

- Delete all old images before generating new screenshots
- Auto-create `/screenshots/images/` directory if it doesn't exist
- Add images folder to .gitignore automatically
- Component validation without maintenance overhead (dynamic discovery preferred)
- No manifest files generated
- On any error (build failure, component not found, etc.): abort completely and surface failure reason

## Implementation Tasks

### Phase 1: Setup & Infrastructure

- [ ] Add Makefile command `make screenshot` with optional component argument
- [ ] Create script entry point at `scripts/screenshot/capture.js`
- [ ] Verify Playwright is installed and configured
- [ ] Auto-create `/screenshots/images/` directory for output
- [ ] Add images folder to .gitignore automatically
- [ ] Create cleanup utility to delete old screenshots

### Phase 2: Component Preparation & Build Process

- [ ] Add `data-screenshot-section="intro"` attributes to each component in `/src/@lekoarts/gatsby-theme-cara/sections/`
- [ ] Implement `gatsby clean` followed by `gatsby build` execution
- [ ] Add comprehensive error handling for build failures with detailed messages
- [ ] Implement dynamic component discovery from section files
- [ ] Validate component argument against discovered components

### Phase 3: Full Page Rendering & Component Identification

- [ ] Implement Playwright to render full production page from `public/` directory
- [ ] Implement DOM selection using `data-screenshot-section` attributes
- [ ] Calculate component section boundaries (position and dimensions)
- [ ] Test component section identification accuracy across all components
- [ ] Verify full page rendering includes all styles automatically

### Phase 4: Screenshot Capture & Cropping

- [ ] Implement Playwright browser initialization with exact breakpoint widths
- [ ] Create screenshot function for full page at single breakpoint
- [ ] Implement component section cropping based on `data-screenshot-section` boundaries
- [ ] Preserve surrounding context during cropping
- [ ] Generate proper filenames using `{component}-{breakpoint}.png` convention
- [ ] Save cropped screenshots to `/screenshots/images/` directory

### Phase 5: Orchestration & Error Handling

- [ ] Implement component argument parsing with dynamic validation
- [ ] Create loop for all discovered components (when no argument provided)
- [ ] Create loop for all breakpoints per component (exact pixel widths from theme)
- [ ] Add global motion/parallax disabling if positioning issues arise
- [ ] Implement abort-on-failure logic for any error with detailed surface messaging
- [ ] Add progress logging for user feedback

### Phase 6: Validation & Documentation

- [ ] Test with no arguments (all components)
- [ ] Test with each individual component argument
- [ ] Test error scenarios (build failures, component not found, invalid arguments)
- [ ] Verify cleanup works in all scenarios
- [ ] Verify screenshot quality and accuracy vs live production site
- [ ] Verify component section identification and cropping accuracy
