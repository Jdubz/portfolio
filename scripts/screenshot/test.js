/**
 * Quick Component Screenshot Test
 * 
 * Generates screenshots for desktop only to quickly test component isolation
 */

const { exec } = require('child_process');

console.log('🚀 Running quick component screenshot test (desktop only)...\n');

exec('node scripts/screenshot/generate.js desktop', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`⚠️  Stderr: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('✨ Quick test complete! Check the screenshots directory for results.');
});