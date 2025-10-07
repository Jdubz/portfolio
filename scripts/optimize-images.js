#!/usr/bin/env node

/**
 * Optimize images by converting PNGs to WebP format
 * This significantly reduces file sizes while maintaining quality
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const images = [
  {
    input: path.join(projectRoot, 'web/static/android-chrome-512x512.png'),
    outputs: [
      { path: path.join(projectRoot, 'web/static/android-chrome-512x512.webp'), width: 512, quality: 90 },
    ]
  },
  {
    input: path.join(projectRoot, 'web/static/android-chrome-192x192.png'),
    outputs: [
      { path: path.join(projectRoot, 'web/static/android-chrome-192x192.webp'), width: 192, quality: 90 },
    ]
  },
  {
    input: path.join(projectRoot, 'web/static/apple-touch-icon.png'),
    outputs: [
      { path: path.join(projectRoot, 'web/static/apple-touch-icon.webp'), width: 180, quality: 90 },
    ]
  },
  {
    input: path.join(projectRoot, 'web/static/bucketmount.png'),
    outputs: [
      { path: path.join(projectRoot, 'web/static/bucketmount.webp'), width: null, quality: 85 },
      { path: path.join(projectRoot, 'web/static/bucketmount@2x.webp'), width: 1200, quality: 85 },
      { path: path.join(projectRoot, 'web/static/bucketmount.png'), width: 600, quality: 85 }, // Keep smaller PNG fallback
    ]
  },
  {
    input: path.join(projectRoot, 'web/static/testcode.png'),
    outputs: [
      { path: path.join(projectRoot, 'web/static/testcode.webp'), width: null, quality: 85 },
      { path: path.join(projectRoot, 'web/static/testcode@2x.webp'), width: 1200, quality: 85 },
      { path: path.join(projectRoot, 'web/static/testcode.png'), width: 600, quality: 85 }, // Keep smaller PNG fallback
    ]
  },
];

async function optimizeImage(input, output) {
  const { path: outputPath, width, quality } = output;

  console.log(`Processing ${input} -> ${outputPath} (width: ${width || 'original'}, quality: ${quality})`);

  try {
    const inputStats = fs.statSync(input);
    let pipeline = sharp(input);

    if (width) {
      pipeline = pipeline.resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    const ext = path.extname(outputPath);
    const isSameFile = path.resolve(input) === path.resolve(outputPath);

    if (ext === '.webp') {
      pipeline = pipeline.webp({ quality });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    }

    // If input and output are the same file, use a temp file
    const finalOutputPath = isSameFile ? outputPath + '.tmp' : outputPath;

    await pipeline.toFile(finalOutputPath);

    if (isSameFile) {
      fs.renameSync(finalOutputPath, outputPath);
    }

    const outputStats = fs.statSync(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`  ✓ ${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)} (${savings}% reduction)`);
  } catch (error) {
    console.error(`  ✗ Error processing ${input}: ${error.message}`);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function main() {
  console.log('Starting image optimization...\n');

  for (const imageConfig of images) {
    if (!fs.existsSync(imageConfig.input)) {
      console.log(`Skipping ${imageConfig.input} (not found)`);
      continue;
    }

    for (const output of imageConfig.outputs) {
      await optimizeImage(imageConfig.input, output);
    }
    console.log('');
  }

  console.log('Image optimization complete!');
}

main().catch(console.error);
