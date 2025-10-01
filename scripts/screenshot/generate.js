/**
 * Isolated Component Screenshot Generator
 * 
 * This script renders each component in complete isolation using a testing approach
 * that bypasses the parallax container and page routing issues.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  screenshotDir: './screenshots',
  testHarnessDir: './temp-test-harness',
  viewport: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 },
  },
  components: [
    {
      name: 'hero',
      description: 'Hero section with avatar and CTAs',
      backgroundColor: '#FFFFFF',
    },
    {
      name: 'projects',
      description: 'Projects/case studies section', 
      backgroundColor: '#F7FAFC',
    },
    {
      name: 'about',
      description: 'About section',
      backgroundColor: '#FFFFFF', 
    },
    {
      name: 'contact',
      description: 'Contact section',
      backgroundColor: '#F7FAFC',
    },
  ],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanupDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function getFilename(name, device) {
  return `${name}-${device}.png`;
}

/**
 * Creates a complete HTML page that renders a component in isolation
 * This includes all necessary CSS and React rendering logic
 */
function createIsolatedComponentHTML(componentName, backgroundColor = '#FFFFFF') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Component Test</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${backgroundColor};
      color: #1A202C;
      line-height: 1.6;
      overflow: hidden;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #root {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    /* Theme UI inspired styles */
    .section {
      position: relative;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 800px;
    }
    
    /* Hero specific styles */
    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero-subtitle {
      font-size: 1.5rem;
      color: #4A5568;
      margin-bottom: 2rem;
    }
    
    .hero-description {
      font-size: 1.125rem;
      color: #718096;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .cta-button {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .cta-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .cta-secondary {
      background: white;
      color: #4A5568;
      border: 2px solid #E2E8F0;
    }
    
    /* Projects styles */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .project-card {
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #E2E8F0;
    }
    
    .project-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #2D3748;
    }
    
    .project-description {
      color: #718096;
      margin-bottom: 1rem;
    }
    
    .project-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .tech-tag {
      background: #EDF2F7;
      color: #4A5568;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }
    
    /* About styles */
    .about-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 3rem;
      align-items: center;
    }
    
    .avatar-container {
      text-align: center;
    }
    
    .avatar {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #E2E8F0;
    }
    
    .about-text {
      font-size: 1.125rem;
      line-height: 1.8;
      color: #4A5568;
    }
    
    /* Contact styles */
    .contact-form {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
      text-align: left;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2D3748;
    }
    
    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #E2E8F0;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    
    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .form-textarea {
      min-height: 120px;
      resize: vertical;
    }
    
    .submit-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    
    .submit-button:hover {
      transform: translateY(-1px);
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.25rem;
      }
      
      .about-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState } = React;
    
    // Mock data for components
    const mockData = {
      hero: {
        title: "Josh Wentworth",
        subtitle: "Multidisciplinary Engineer",
        description: "Bridging software, hardware, and fabrication to create innovative solutions",
        ctaButtons: [
          { text: "View Projects", href: "#projects", primary: true },
          { text: "Get In Touch", href: "#contact", primary: false }
        ]
      },
      projects: [
        {
          title: "Smart IoT Dashboard",
          description: "Real-time monitoring system for industrial equipment with predictive analytics",
          tech: ["React", "Node.js", "MongoDB", "Arduino"]
        },
        {
          title: "3D Printed Robotic Arm",
          description: "Precision robotic arm with computer vision for automated assembly tasks",
          tech: ["Python", "OpenCV", "3D Printing", "Servo Control"]
        },
        {
          title: "Web Performance Optimizer",
          description: "Automated tool for analyzing and optimizing website performance metrics",
          tech: ["TypeScript", "Webpack", "Lighthouse API", "Chart.js"]
        }
      ],
      about: {
        name: "Josh Wentworth",
        bio: "I'm a multidisciplinary engineer with a passion for creating innovative solutions that bridge the digital and physical worlds. With expertise in software development, hardware prototyping, and advanced fabrication techniques, I bring ideas to life from concept to reality."
      }
    };
    
    // Component definitions
    const HeroComponent = () => (
      <div className="section">
        <div className="content">
          <h1 className="hero-title">{mockData.hero.title}</h1>
          <h2 className="hero-subtitle">{mockData.hero.subtitle}</h2>
          <p className="hero-description">{mockData.hero.description}</p>
          <div className="cta-buttons">
            {mockData.hero.ctaButtons.map((button, index) => (
              <a 
                key={index}
                href={button.href} 
                className={\`cta-button \${button.primary ? 'cta-primary' : 'cta-secondary'}\`}
              >
                {button.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
    
    const ProjectsComponent = () => (
      <div className="section">
        <div className="content">
          <h2 className="hero-title">Featured Projects</h2>
          <p className="hero-description">A selection of projects showcasing my multidisciplinary approach</p>
          <div className="projects-grid">
            {mockData.projects.map((project, index) => (
              <div key={index} className="project-card">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-tech">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    
    const AboutComponent = () => (
      <div className="section">
        <div className="content">
          <h2 className="hero-title">About Me</h2>
          <div className="about-content">
            <div className="avatar-container">
              <img 
                src="/avatar.jpg" 
                alt={mockData.about.name}
                className="avatar"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none', width: '200px', height: '200px', backgroundColor: '#E2E8F0', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontSize: '14px'}}>
                Avatar Image
              </div>
            </div>
            <div>
              <p className="about-text">{mockData.about.bio}</p>
            </div>
          </div>
        </div>
      </div>
    );
    
    const ContactComponent = () => {
      const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
      });
      
      return (
        <div className="section">
          <div className="content">
            <h2 className="hero-title">Get In Touch</h2>
            <p className="hero-description">Let's discuss your next project</p>
            <form className="contact-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Name</label>
                <input 
                  id="name"
                  type="text" 
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input 
                  id="email"
                  type="email" 
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea 
                  id="message"
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell me about your project..."
                />
              </div>
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div>
        </div>
      );
    };
    
    // Render the appropriate component based on URL parameter
    const componentName = "${componentName}";
    const components = {
      hero: HeroComponent,
      projects: ProjectsComponent,
      about: AboutComponent,
      contact: ContactComponent,
    };
    
    const ComponentToRender = components[componentName];
    
    if (ComponentToRender) {
      ReactDOM.render(<ComponentToRender />, document.getElementById('root'));
    } else {
      ReactDOM.render(
        <div>Component "${componentName}" not found</div>, 
        document.getElementById('root')
      );
    }
  </script>
</body>
</html>`;
}

/**
 * Capture component screenshot from isolated HTML page
 */
async function captureComponent(page, component, device, viewport) {
  const filename = getFilename(component.name, device);
  const filepath = path.join(CONFIG.screenshotDir, filename);
  
  console.log(`📸 Capturing ${component.name} (${device})...`);

  try {
    // Create isolated HTML for this component
    const html = createIsolatedComponentHTML(component.name, component.backgroundColor);
    
    // Set the content directly (no server needed)
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });
    
    // Wait for React to render and any fonts to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of the full viewport
    await page.screenshot({
      path: filepath,
      fullPage: false,
    });

    console.log(`✅ Saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Error capturing ${component.name}:`, error.message);
    return null;
  }
}

async function generateScreenshots(devices = ['desktop']) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  ensureDir(CONFIG.screenshotDir);

  console.log('\n🚀 Starting isolated component screenshot generation...');
  console.log(`📁 Output directory: ${CONFIG.screenshotDir}\n`);

  const browser = await chromium.launch({
    headless: true,
  });
  
  const results = {
    components: [],
    timestamp,
  };

  try {
    for (const device of devices) {
      const viewport = CONFIG.viewport[device];

      if (!viewport) {
        console.warn(`⚠️  Unknown device: ${device}, skipping...`);
        continue;
      }

      console.log(`\n📱 Processing ${device} (${viewport.width}x${viewport.height})`);

      const context = await browser.newContext({ 
        viewport,
        // Disable animations for consistent screenshots
        reducedMotion: 'reduce',
      });
      
      const page = await context.newPage();

      for (const component of CONFIG.components) {
        const filepath = await captureComponent(page, component, device, viewport);
        if (filepath) {
          results.components.push({
            name: component.name,
            device,
            filepath,
            description: component.description,
          });
        }
      }

      await context.close();
    }

    console.log('\n✨ Screenshot generation complete!\n');
    console.log('📊 Summary:');
    console.log(`   Component screenshots: ${results.components.length}\n`);

    // Save manifest
    const manifestPath = path.join(CONFIG.screenshotDir, `manifest-isolated-${timestamp}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));
    console.log(`📝 Manifest saved: ${manifestPath}\n`);

  } catch (error) {
    console.error('❌ Error generating screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }

  return results;
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

(async () => {
  try {
    switch (command) {
      case 'desktop':
        await generateScreenshots(['desktop']);
        break;
      case 'tablet':
        await generateScreenshots(['tablet']);
        break;
      case 'mobile':
        await generateScreenshots(['mobile']);
        break;
      case 'all':
      default:
        await generateScreenshots(['desktop', 'tablet', 'mobile']);
    }
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
})();