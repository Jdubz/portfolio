/**
 * Complete Screenshot Workflow
 * 
 * Generates component screenshots and verifies they are valid
 */

const { exec } = require('child_process');
const path = require('path');

async function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(stderr);
      }
      
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function runWorkflow() {
  try {
    console.log('🚀 Starting complete screenshot workflow...\n');
    
    // Step 1: Generate screenshots
    console.log('📸 Step 1: Generating component screenshots...');
    await runCommand('node scripts/screenshot/generate.js');
    
    console.log('\n📋 Step 2: Verifying screenshots...');
    await runCommand('node scripts/screenshot/verify.js');
    
    console.log('\n✨ Screenshot workflow complete!');
    console.log('🎉 All components captured successfully without 404 errors!');
    
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
    process.exit(1);
  }
}

runWorkflow();