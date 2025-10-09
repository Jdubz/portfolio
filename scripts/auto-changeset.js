#!/usr/bin/env node

/**
 * Auto-Changeset Generator
 *
 * Automatically creates a changeset when important files are modified.
 * Prompts for version type and summary to build good habits.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
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

    return staged;
  } catch (error) {
    return [];
  }
}

function hasExistingChangeset() {
  const changesetDir = path.join(process.cwd(), '.changeset');

  if (!fs.existsSync(changesetDir)) {
    return false;
  }

  const files = fs.readdirSync(changesetDir);
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

  for (const file of changedFiles) {
    if (shouldIgnoreFile(file)) {
      ignoredChanges.push(file);
    } else if (isImportantFile(file)) {
      importantChanges.push(file);
    }
  }

  return { importantChanges, ignoredChanges };
}

function detectPackages(files) {
  const packages = new Set();

  for (const file of files) {
    if (file.startsWith('web/')) {
      packages.add('josh-wentworth-portfolio');
    }
    if (file.startsWith('functions/')) {
      packages.add('contact-form-function');
    }
  }

  return Array.from(packages);
}

function detectChangeType(files) {
  // Simple heuristics based on commit message or file patterns
  const commitMsg = getCommitMessage();

  if (commitMsg) {
    if (commitMsg.match(/^feat[(!:]|BREAKING/i)) {
      return commitMsg.includes('!') || commitMsg.includes('BREAKING') ? 'major' : 'minor';
    }
    if (commitMsg.match(/^fix[(!:]|^perf[(!:]/i)) {
      return 'patch';
    }
  }

  // Default to patch for safety
  return 'patch';
}

function getCommitMessage() {
  try {
    // Try to get the commit message being prepared
    const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf8' }).trim();
    const commitMsgFile = path.join(gitDir, 'COMMIT_EDITMSG');

    if (fs.existsSync(commitMsgFile)) {
      return fs.readFileSync(commitMsgFile, 'utf8').split('\n')[0];
    }
  } catch (error) {
    // Ignore
  }
  return '';
}

function generateChangesetContent(packages, changeType, summary, cacheBust = false) {
  const packageEntries = packages.map(pkg => `"${pkg}": ${changeType}`).join('\n');

  const content = `---
${packageEntries}
---

${summary}${cacheBust ? '\n\nCACHE_BUST: true' : ''}
`;

  return content;
}

function generateChangesetFilename() {
  const adjectives = ['quick', 'happy', 'brave', 'calm', 'wise', 'kind', 'bold'];
  const animals = ['fox', 'bear', 'wolf', 'eagle', 'lion', 'tiger', 'panda'];
  const verbs = ['jumps', 'runs', 'flies', 'swims', 'climbs', 'roars', 'plays'];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];

  return `${adj}-${animal}-${verb}.md`;
}

function createChangeset(packages, changeType, summary, cacheBust = false) {
  const changesetDir = path.join(process.cwd(), '.changeset');

  if (!fs.existsSync(changesetDir)) {
    fs.mkdirSync(changesetDir, { recursive: true });
  }

  const filename = generateChangesetFilename();
  const filepath = path.join(changesetDir, filename);
  const content = generateChangesetContent(packages, changeType, summary, cacheBust);

  fs.writeFileSync(filepath, content, 'utf8');

  // Stage the changeset file
  execSync(`git add ${filepath}`, { stdio: 'inherit' });

  return filename;
}

async function prompt(question, yesNo = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();

      if (yesNo) {
        const normalized = answer.trim().toLowerCase();
        resolve(normalized === 'y' || normalized === 'yes' || normalized === '');
      } else {
        resolve(answer.trim());
      }
    });
  });
}

async function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    // No staged changes
    return;
  }

  const hasChangeset = hasExistingChangeset();

  if (hasChangeset) {
    // Changeset already exists
    console.log(`${colors.green}✓${colors.reset} Changeset already exists`);
    return;
  }

  const { importantChanges } = analyzeChanges(changedFiles);

  if (importantChanges.length === 0) {
    // Only documentation or config changes
    return;
  }

  // Detect affected packages
  const packages = detectPackages(importantChanges);

  if (packages.length === 0) {
    // No packages affected
    return;
  }

  console.log('');
  console.log(`${colors.cyan}${colors.bright}📝 Auto-Changeset${colors.reset}`);
  console.log('');
  console.log(`Detected ${importantChanges.length} important file(s) changed:`);
  console.log('');

  importantChanges.slice(0, 5).forEach(file => {
    console.log(`  ${colors.blue}•${colors.reset} ${file}`);
  });

  if (importantChanges.length > 5) {
    console.log(`  ${colors.blue}•${colors.reset} ... and ${importantChanges.length - 5} more`);
  }

  console.log('');
  console.log(`Affected packages: ${colors.bright}${packages.join(', ')}${colors.reset}`);
  console.log('');

  // Detect change type from commit message
  const detectedType = detectChangeType(importantChanges);
  console.log(`${colors.yellow}Detected change type: ${detectedType}${colors.reset}`);
  console.log('');

  // Prompt for change type
  const changeTypeInput = await prompt(
    `Change type? (patch/minor/major) [${detectedType}]: `
  );
  const changeType = changeTypeInput || detectedType;

  if (!['patch', 'minor', 'major'].includes(changeType)) {
    console.log(`${colors.red}Invalid change type. Using 'patch'.${colors.reset}`);
  }

  // Prompt for summary
  const commitMsg = getCommitMessage();
  const defaultSummary = commitMsg ? commitMsg.replace(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: /, '') : '';

  console.log('');
  const summary = await prompt(
    `Summary of changes${defaultSummary ? ` [${defaultSummary}]` : ''}: `
  );

  const finalSummary = summary || defaultSummary || 'Updates';

  // Prompt for cache bust
  console.log('');
  console.log(`${colors.yellow}⚠️  Does this change require users to hard refresh?${colors.reset}`);
  console.log('   (Service worker changes, critical CSS/JS updates, etc.)');
  console.log('');
  const cacheBust = await prompt('Force cache invalidation? (y/N) [N]: ', true);

  // Create changeset
  const filename = createChangeset(packages, changeType, finalSummary, cacheBust);

  console.log('');
  console.log(`${colors.green}✓${colors.reset} Created changeset: ${colors.bright}.changeset/${filename}${colors.reset}`);
  console.log(`${colors.green}✓${colors.reset} Staged changeset file`);
  if (cacheBust) {
    console.log(`${colors.yellow}🔥${colors.reset} Cache bust enabled - users will get a hard refresh`);
  }
  console.log('');
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});
