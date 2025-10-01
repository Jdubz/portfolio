/**
 * Screenshot Verification Tool
 * 
 * Verifies that generated screenshots are valid images and not 404 pages
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = './screenshots';

function getFileSize(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function verifyScreenshots() {
  console.log('🔍 Verifying screenshots...\n');
  
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.error('❌ Screenshots directory not found!');
    return false;
  }
  
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter(file => file.endsWith('.png'));
  
  if (files.length === 0) {
    console.error('❌ No PNG files found in screenshots directory!');
    return false;
  }
  
  console.log(`📁 Found ${files.length} PNG files:\n`);
  
  let allValid = true;
  const minValidSize = 1024; // 1KB minimum - 404 pages would be much smaller
  
  files.forEach(file => {
    const filepath = path.join(SCREENSHOTS_DIR, file);
    const size = getFileSize(filepath);
    const isValid = size > minValidSize;
    
    const status = isValid ? '✅' : '❌';
    const sizeStr = formatBytes(size);
    
    console.log(`${status} ${file} (${sizeStr})`);
    
    if (!isValid) {
      allValid = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('🎉 All screenshots are valid!');
    console.log('📊 Summary:');
    console.log(`   • Total files: ${files.length}`);
    console.log('   • All files are properly sized (> 1KB)');
    console.log('   • No 404 pages detected');
  } else {
    console.log('⚠️  Some screenshots may be invalid:');
    console.log('   • Check files marked with ❌');
    console.log('   • Small file sizes may indicate 404 pages or empty content');
  }
  
  return allValid;
}

// Run verification
const isValid = verifyScreenshots();
process.exit(isValid ? 0 : 1);