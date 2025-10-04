const fs = require('fs').promises;
const path = require('path');
const playwright = require('playwright');
const { execSync } = require('child_process');

/**
 * Portfolio Screenshot Tool - Component & Full Page Capture
 * 
 * Generates responsive screenshots of portfolio components and full pages.
 * Uses Playwright for automated browser testing and screenshot generation,
 * with automatic Gatsby build and serve management.
 */

// Configuration
const BREAKPOINTS = ['480', '1280'];
const BREAKPOINT_LABELS = {
  '480': 'mobile',
  '1280': 'desktop'
};

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'screenshots', 'images');

// Global variables
let PORT;

/**
 * Utility functions
 */
function generateRandomPort() {
  return Math.floor(Math.random() * 1000) + 9000;
}

async function ensureOutputDirectory() {
  try {
    await fs.access(OUTPUT_DIR);
  } catch {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
  }
  console.log(`✓ Output directory ready: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
}

async function cleanupOldScreenshots() {
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const imageFiles = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    
    for (const file of imageFiles) {
      await fs.unlink(path.join(OUTPUT_DIR, file));
    }
    
    if (imageFiles.length > 0) {
      console.log(`✓ Cleaned up ${imageFiles.length} old screenshot(s)`);
    }
  } catch (error) {
    console.log('ℹ️  No previous screenshots to clean up');
  }
}

async function discoverComponents() {
  const componentDir = path.join(__dirname, '..', '..', 'web', 'src', '@lekoarts', 'gatsby-theme-cara');
  const components = new Set();
  
  // Check sections directory
  try {
    const sectionsDir = path.join(componentDir, 'sections');
    const sectionFiles = await fs.readdir(sectionsDir);
    sectionFiles.filter(file => file.endsWith('.tsx')).forEach(file => {
      const name = path.basename(file, '.tsx');
      components.add(name);
    });
  } catch (error) {
    // Sections directory might not exist
  }
  
  // Check components directory
  try {
    const componentsDir = path.join(componentDir, 'components');
    const componentFiles = await fs.readdir(componentsDir);
    componentFiles.filter(file => file.endsWith('.tsx')).forEach(file => {
      const name = path.basename(file, '.tsx');
      components.add(name);
    });
  } catch (error) {
    // Components directory might not exist
  }
  
  const componentList = Array.from(components).sort();
  console.log(`✓ Discovered components: ${componentList.join(', ')}`);
  return componentList;
}

function runGatsbyClean() {
  console.log('🔨 Running gatsby clean...');
  try {
    execSync('npx gatsby clean', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..', 'web')
    });
    console.log('✓ Gatsby clean completed');
  } catch (error) {
    throw new Error(`Gatsby clean failed: ${error.message}`);
  }
}

function runGatsbyBuild() {
  console.log('🔨 Running gatsby build...');
  try {
    execSync('npx gatsby build', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..', 'web')
    });
    console.log('✓ Gatsby build completed');
  } catch (error) {
    throw new Error(`Gatsby build failed: ${error.message}`);
  }
}

function startGatsbyServe() {
  console.log('🚀 Starting Gatsby serve...');
  PORT = generateRandomPort();
  console.log(`📡 Using port: ${PORT}`);
  
  try {
    const { spawn } = require('child_process');
    
    // Use shell: true for Windows compatibility
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'npx.cmd' : 'npx';
    
    const gatsbyProcess = spawn(command, ['gatsby', 'serve', '-p', PORT.toString()], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..', '..', 'web'),
      detached: false,
      shell: isWindows  // Enable shell on Windows
    });
    
    // Give server time to start
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (gatsbyProcess.killed) {
          reject(new Error('Gatsby serve failed to start'));
        } else {
          resolve(gatsbyProcess);
        }
      }, 5000);
    });
  } catch (error) {
    throw new Error(`Failed to start Gatsby serve: ${error.message}`);
  }
}

function stopGatsbyServe(gatsbyProcess) {
  console.log('🛑 Stopping Gatsby server...');
  if (gatsbyProcess && !gatsbyProcess.killed) {
    gatsbyProcess.kill('SIGTERM');
    
    setTimeout(() => {
      if (!gatsbyProcess.killed) {
        gatsbyProcess.kill('SIGKILL');
      }
    }, 3000);
  }
}

/**
 * Screenshot capture functions
 */
async function captureComponentScreenshot(browser, component, breakpoint, breakpointLabel, serverPort) {
  const context = await browser.newContext({
    viewport: { 
      width: parseInt(breakpoint), 
      height: 1080 // Use normal viewport height
    }
  });

  const page = await context.newPage();

  try {
    // Navigate to localhost (Gatsby serve should be running)
    const url = `http://localhost:${serverPort}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for content to be rendered (Gatsby is SPA)
    await page.waitForTimeout(3000);

    // Scroll through the page to ensure all sections are rendered and visible
    await page.evaluate(async () => {
      // Scroll to bottom to trigger any lazy loading/animations
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Wait a bit more for animations to settle
    await page.waitForTimeout(2000);

    // Debug: Check what sections exist
    const allSections = await page.$$eval('[data-screenshot-section]', elements => 
      elements.map(el => el.getAttribute('data-screenshot-section'))
    );
    console.log(`🔍 Found sections: ${allSections.join(', ')}`);

    // SIMPLIFIED APPROACH: Scroll to section position and take viewport screenshot
    // This parallax layout is too complex for full page cropping approach
    
    // Define scroll positions for each section based on the theme layout
    // Get parallax offsets from cara.tsx (Hero=0, Projects=1, About=3, Contact=4)
    const parallaxOffsets = {
      intro: 0,      // Hero offset={0}
      projects: 1.5, // Projects offset={1} + factor={2}, capture middle at offset 1.5
      about: 3,      // About offset={3}
      contact: 4     // Contact offset={4}
    };
    
    const targetOffset = parallaxOffsets[component];
    if (targetOffset === undefined) {
      throw new Error(`No parallax offset defined for component: ${component}`);
    }

    console.log(`🎯 Scrolling to ${component} at parallax offset ${targetOffset}`);
    
    // Use parallax scrollTo method instead of window.scrollTo
    const actualScrollResult = await page.evaluate(async (offset) => {
      // Calculate target position: offset * viewport height
      const targetPos = offset * window.innerHeight;
      
      // Try multiple approaches to find and scroll the parallax container
      
      // Approach 1: Look for overflow-y auto/scroll container (typical for parallax)
      const scrollContainers = document.querySelectorAll('[style*="overflow"], [style*="scroll"]');
      for (const container of scrollContainers) {
        const style = window.getComputedStyle(container);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          container.scrollTop = targetPos;
          await new Promise(resolve => setTimeout(resolve, 500));
          return { method: 'overflow-container', scrollPos: container.scrollTop, targetPos };
        }
      }
      
      // Approach 2: Look for the main content container with transform
      const parallaxContent = document.querySelector('[style*="transform"]');
      if (parallaxContent && parallaxContent.parentElement) {
        parallaxContent.parentElement.scrollTop = targetPos;
        await new Promise(resolve => setTimeout(resolve, 500));
        return { method: 'transform-parent', scrollPos: parallaxContent.parentElement.scrollTop, targetPos };
      }
      
      // Approach 3: Direct DOM manipulation - set transforms on parallax layers
      const parallaxLayers = document.querySelectorAll('[style*="transform"]');
      if (parallaxLayers.length > 0) {
        // Manually move each layer based on its parallax factor
        parallaxLayers.forEach((layer, index) => {
          const currentTransform = layer.style.transform || '';
          const translateY = -targetPos * (1 + index * 0.1); // Approximate parallax factors
          layer.style.transform = currentTransform.replace(/translateY\([^)]*\)/, '') + ` translateY(${translateY}px)`;
        });
        return { method: 'manual-transform', scrollPos: targetPos, targetPos };
      }
      
      // Approach 4: Try window scroll as fallback
      window.scrollTo({ top: targetPos, behavior: 'instant' });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { method: 'window-scroll', scrollPos: window.pageYOffset, targetPos };
      
    }, targetOffset);
    
    // Wait for parallax animations to settle
    await page.waitForTimeout(2000);
    
    console.log(`📍 Scrolled using ${actualScrollResult.method}: ${actualScrollResult.scrollPos}px (target: ${actualScrollResult.targetPos}px)`);
    
    // Wait for any lazy loading or animations to complete
    await page.waitForLoadState('networkidle');
    
    // Additional wait to ensure parallax layers have updated
    await page.waitForTimeout(1000);    // Take a screenshot of the current viewport
    const screenshot = await page.screenshot({
      fullPage: false, // Just capture what's visible
      animations: 'disabled'
    });
    
    const filename = `${component}-${breakpointLabel}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await fs.writeFile(filepath, screenshot);
    console.log(`✓ Generated: ${filename} (viewport screenshot @ ${breakpoint}px, offset: ${targetOffset})`);

    return { filename, filepath, scrollPosition: actualScrollResult.scrollPos, method: 'parallax-scroll' };

  } finally {
    await context.close();
  }
}

/**
 * Main execution function
 */
async function captureScreenshots(targetComponent = null) {
  let gatsbyProcess = null;
  
  try {
    console.log('🚀 Starting screenshot capture...');
    
    // Setup
    await ensureOutputDirectory();
    await cleanupOldScreenshots();
    const components = await discoverComponents();

    // For parallax layouts, we need to manually determine the full content height
    // The @react-spring/parallax component creates a custom scroll container with pages={5}
    
    // First, scroll through the entire page to trigger all content loading
    const { contentHeight, viewportHeight, parallaxHeight } = await page.evaluate(async () => {
      // Look for the parallax container which should contain the actual content
      const parallaxContainer = document.querySelector('[style*="scroll"]') || 
                                document.querySelector('[style*="overflow"]') ||
                                document.querySelector('div[style*="height"]');
      
      // Get various height measurements
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      // Check for react-spring parallax content area
      let reactSpringHeight = documentHeight;
      if (parallaxContainer) {
        const computedStyle = window.getComputedStyle(parallaxContainer);
        const containerHeight = parseInt(computedStyle.height) || documentHeight;
        if (containerHeight > documentHeight) {
          reactSpringHeight = containerHeight;
        }
      }
      
      // For Cara theme with pages={5}, each page should be viewport height
      // So total content should be approximately 5 * viewport height
      const expectedParallaxHeight = window.innerHeight * 5;
      
      // Scroll to bottom to ensure all content is loaded
      const maxScroll = Math.max(documentHeight, reactSpringHeight, expectedParallaxHeight);
      window.scrollTo(0, maxScroll);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        contentHeight: Math.max(documentHeight, reactSpringHeight, expectedParallaxHeight),
        viewportHeight: window.innerHeight,
        parallaxHeight: expectedParallaxHeight
      };
    });

    console.log(`📏 Content: ${contentHeight}px, Viewport: ${viewportHeight}px, Expected parallax: ${parallaxHeight}px for ${breakpointLabel}`);

    // Take full page screenshot - try fullPage first, if it doesn't capture the full height, use manual approach
    let screenshot;
    
    // First attempt with fullPage
    screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled'
    });
    
    // Check if we need to manually capture the full parallax height
    if (contentHeight > viewportHeight * 1.5 && parallaxHeight > viewportHeight * 1.5) {
      console.log(`� Content appears larger than captured, trying manual parallax capture for ${breakpointLabel}`);
      
      try {
        // For parallax layouts, manually scroll through and capture the full height
        // Set a temporary height to capture more content
        await page.setViewportSize({ 
          width: parseInt(breakpoint), 
          height: Math.min(parallaxHeight, 8000) // Cap at 8000px to avoid memory issues
        });
        
        // Scroll to bottom to ensure all content is loaded
        await page.evaluate((maxHeight) => {
          window.scrollTo(0, maxHeight);
        }, parallaxHeight);
        
        await page.waitForTimeout(1000);
        
        // Scroll back to top
        await page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        
        await page.waitForTimeout(500);
        
        // Take screenshot with extended height
        screenshot = await page.screenshot({
          fullPage: true,
          animations: 'disabled'
        });
        
        console.log(`✅ Manual parallax capture completed for ${breakpointLabel}`);
        
      } catch (manualError) {
        console.log(`⚠️  Manual parallax capture failed for ${breakpointLabel}: ${manualError.message}`);
        // Reset viewport and use standard screenshot
        await page.setViewportSize({ 
          width: parseInt(breakpoint), 
          height: 1080
        });
        screenshot = await page.screenshot({
          fullPage: true,
          animations: 'disabled'
        });
      }
    } else {
      console.log(`📸 Standard full page screenshot for ${breakpointLabel} - Content: ${Math.round(contentHeight/viewportHeight)}x viewport height`);
    }
    
    const filename = `full-${breakpointLabel}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await fs.writeFile(filepath, screenshot);
    console.log(`✓ Generated full page: ${filename} (${breakpoint}px viewport, content: ${contentHeight}px)`);

    return { filename, filepath };

  } finally {
    await context.close();
  }
}

/**
 * Main execution function
 */
async function captureScreenshots(targetComponent = null) {
  let gatsbyProcess = null;
  
  try {
    console.log('🚀 Starting screenshot capture...');
    
    // Setup
    await ensureOutputDirectory();
    await cleanupOldScreenshots();
    const components = await discoverComponents();
    
    // Build process
    runGatsbyClean();
    runGatsbyBuild();
    gatsbyProcess = await startGatsbyServe();
    
    // Launch browser
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    // Define which components have scroll positions
    const validComponents = ['intro', 'projects', 'about', 'contact'];
    
    const componentsToCapture = targetComponent 
      ? (validComponents.includes(targetComponent) ? [targetComponent] : [])
      : validComponents;

    if (targetComponent && !validComponents.includes(targetComponent)) {
      console.warn(`⚠️ Component '${targetComponent}' does not have a defined scroll position. Valid components are: ${validComponents.join(', ')}`);
    }

    let totalScreenshots = 0;

    // Capture component screenshots
    for (const component of componentsToCapture) {
      console.log(`📷 Processing component: ${component}`);
      
      for (const breakpoint of BREAKPOINTS) {
        const breakpointLabel = BREAKPOINT_LABELS[breakpoint];
        try {
          await captureComponentScreenshot(browser, component, breakpoint, breakpointLabel, PORT);
          totalScreenshots++;
        } catch (error) {
          console.error(`❌ Failed to capture ${component} at ${breakpoint}px: ${error.message}`);
        }
      }
    }

    await browser.close();
    
    console.log(`\n✅ Screenshot capture complete!`);
    console.log(`Generated ${totalScreenshots} screenshots in ${path.relative(process.cwd(), OUTPUT_DIR)}/`);
    
  } catch (error) {
    console.error(`❌ Screenshot capture failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (gatsbyProcess) {
      stopGatsbyServe(gatsbyProcess);
    }
  }
}

// CLI execution
if (require.main === module) {
  const targetComponent = process.env.COMPONENT || process.argv[2] || null;
  
  if (targetComponent) {
    console.log(`Generating component screenshots...`);
    console.log(`Target component: ${targetComponent}`);
  } else {
    console.log(`Generating component screenshots...`);
    console.log(`Generating screenshots for all components`);
  }
  
  captureScreenshots(targetComponent)
    .then(() => {
      console.log(`\n🎉 Success! Generated screenshot(s)`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n💥 Failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { captureScreenshots };
