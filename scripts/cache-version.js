#!/usr/bin/env node

/**
 * Cache Version Generator
 *
 * Generates a cache version string based on:
 * 1. Package version
 * 2. CACHE_BUST flag in changesets (forces new version)
 * 3. Git commit hash (for non-production builds)
 *
 * This allows marking specific changesets to trigger hard refreshes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

function getPackageVersion() {
  const packagePath = path.join(__dirname, '../web/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function getGitCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'dev';
  }
}

function checkCacheBustFlag() {
  const changesetDir = path.join(__dirname, '../.changeset');

  if (!fs.existsSync(changesetDir)) {
    return false;
  }

  const files = fs.readdirSync(changesetDir);
  const changesetFiles = files.filter(
    file => file.endsWith('.md') && file !== 'README.md'
  );

  for (const file of changesetFiles) {
    const content = fs.readFileSync(path.join(changesetDir, file), 'utf8');

    // Check for CACHE_BUST flag in changeset
    if (content.includes('CACHE_BUST') || content.includes('cache-bust')) {
      return true;
    }
  }

  return false;
}

function getCacheVersionFromFile() {
  const versionFile = path.join(__dirname, '../.cache-version');

  if (fs.existsSync(versionFile)) {
    return fs.readFileSync(versionFile, 'utf8').trim();
  }

  return null;
}

function saveCacheVersion(version) {
  const versionFile = path.join(__dirname, '../.cache-version');
  fs.writeFileSync(versionFile, version, 'utf8');
}

function generateCacheVersion() {
  const packageVersion = getPackageVersion();
  const hasCacheBust = checkCacheBustFlag();
  const isProduction = process.env.NODE_ENV === 'production' || process.env.GATSBY_ENV === 'production';

  let cacheVersion;

  if (hasCacheBust) {
    // Generate a unique cache bust version
    const timestamp = Date.now();
    const hash = crypto.randomBytes(4).toString('hex');
    cacheVersion = `${packageVersion}-bust-${hash}`;

    console.log('🔥 CACHE_BUST flag detected - forcing cache invalidation');
    console.log(`   Cache version: ${cacheVersion}`);
  } else if (isProduction) {
    // Production: use package version only
    cacheVersion = packageVersion;
  } else {
    // Development: use package version + git hash
    const gitHash = getGitCommitHash();
    cacheVersion = `${packageVersion}-${gitHash}`;
  }

  // Save to file
  saveCacheVersion(cacheVersion);

  return cacheVersion;
}

function main() {
  const cacheVersion = generateCacheVersion();

  // Output for use in environment variables
  console.log(`GATSBY_CACHE_VERSION=${cacheVersion}`);

  // Write to env file for Gatsby
  const envFile = path.join(__dirname, '../web/.env.cache');
  fs.writeFileSync(envFile, `GATSBY_CACHE_VERSION=${cacheVersion}\n`, 'utf8');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateCacheVersion,
  checkCacheBustFlag,
};
