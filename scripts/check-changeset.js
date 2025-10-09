#!/usr/bin/env node

/**
 * Changeset Checker
 *
 * Checks if a changeset is needed based on file changes.
 * This is a gentle reminder, not a blocker.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  green: '\x1b[32m',
};

// Files/patterns that don't require a changeset
const IGNORED_PATTERNS = [
  /^\.changeset\//,
  /^\.github\//,
  /^\.husky\//,
  /^docs\//,
  /^scripts\//,
  /^\.eslintrc/,
  /^\.prettierrc/,
  /^\.gitignore/,
  /^README\.md$/,
  /^CHANGELOG\.md$/,
  /^LICENSE$/,
  /package-lock\.json$/,
  /\.md$/, // Documentation files
  /\.test\.(ts|tsx|js|jsx)$/, // Test files
  /\.spec\.(ts|tsx|js|jsx)$/, // Spec files
  /\.(jpg|jpeg|png|gif|svg|webp)$/, // Image files
];

// Files/patterns that definitely need a changeset
const IMPORTANT_PATTERNS = [
  /^web\/src\//,
  /^functions\/src\//,
  /^web\/gatsby-/,
  /package\.json$/,
];

function getChangedFiles() {
  try {
    // Get staged files
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    // Get unstaged files
    const unstaged = execSync('git diff --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    return [...new Set([...staged, ...unstaged])];
  } catch (error) {
    // If git commands fail, we're probably not in a git repo
    return [];
  }
}

function hasExistingChangeset() {
  const changesetDir = path.join(process.cwd(), '.changeset');

  if (!fs.existsSync(changesetDir)) {
    return false;
  }

  const files = fs.readdirSync(changesetDir);

  // Check for changeset files (excluding README.md and config.json)
  const changesetFiles = files.filter(
    file => file.endsWith('.md') && file !== 'README.md'
  );

  return changesetFiles.length > 0;
}

function shouldIgnoreFile(file) {
  return IGNORED_PATTERNS.some(pattern => pattern.test(file));
}

function isImportantFile(file) {
  return IMPORTANT_PATTERNS.some(pattern => pattern.test(file));
}

function analyzeChanges(changedFiles) {
  const importantChanges = [];
  const ignoredChanges = [];
  const otherChanges = [];

  for (const file of changedFiles) {
    if (shouldIgnoreFile(file)) {
      ignoredChanges.push(file);
    } else if (isImportantFile(file)) {
      importantChanges.push(file);
    } else {
      otherChanges.push(file);
    }
  }

  return { importantChanges, ignoredChanges, otherChanges };
}

function printReminder(importantChanges) {
  console.log('');
  console.log(`${colors.yellow}${colors.bright}📝 Changeset Reminder${colors.reset}`);
  console.log('');
  console.log(`You've modified ${importantChanges.length} file(s) that may need a changeset:`);
  console.log('');

  importantChanges.slice(0, 5).forEach(file => {
    console.log(`  ${colors.blue}•${colors.reset} ${file}`);
  });

  if (importantChanges.length > 5) {
    console.log(`  ${colors.blue}•${colors.reset} ... and ${importantChanges.length - 5} more`);
  }

  console.log('');
  console.log(`${colors.green}To create a changeset, run:${colors.reset}`);
  console.log(`  ${colors.bright}npm run changeset${colors.reset}`);
  console.log('');
  console.log('This helps track changes for release notes and versioning.');
  console.log(`${colors.yellow}(This is just a reminder - you can proceed without one)${colors.reset}`);
  console.log('');
}

function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    // No changes, nothing to check
    return;
  }

  const hasChangeset = hasExistingChangeset();

  if (hasChangeset) {
    // Changeset already exists, all good!
    console.log(`${colors.green}✓${colors.reset} Changeset detected - ready to go!`);
    return;
  }

  const { importantChanges, ignoredChanges } = analyzeChanges(changedFiles);

  if (importantChanges.length === 0) {
    // Only documentation or config changes, no changeset needed
    return;
  }

  // Show reminder for important changes without a changeset
  printReminder(importantChanges);
}

main();
