#!/usr/bin/env node

/**
 * Release script for Quiqr Desktop
 *
 * Automates the release workflow:
 * 1. Validates CHANGELOG has content under "## Next Release"
 * 2. Verifies git working directory is clean
 * 3. Prompts for version bump (patch/minor/major)
 * 4. Updates CHANGELOG.md, package.json, package-lock.json
 * 5. Creates git commit and tag
 * 6. Pushes to remote
 * 7. Creates GitHub release via gh CLI
 *
 * Usage:
 *   npm run release           # Normal release
 *   npm run release -- --dry-run  # Preview without changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { select, confirm, input } = require('@inquirer/prompts');
const semver = require('semver');

// Constants
const ROOT_DIR = path.resolve(__dirname, '..');
const CHANGELOG_PATH = path.join(ROOT_DIR, 'CHANGELOG.md');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const PACKAGE_LOCK_PATH = path.join(ROOT_DIR, 'package-lock.json');

// Parse CLI flags
const DRY_RUN = process.argv.includes('--dry-run');

// Utility functions
function log(message) {
  console.log(message);
}

function logStep(message) {
  console.log(`\n=> ${message}`);
}

function logDryRun(message) {
  console.log(`   [dry-run] ${message}`);
}

function exec(cmd, options = {}) {
  return execSync(cmd, { encoding: 'utf-8', cwd: ROOT_DIR, ...options }).trim();
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    logDryRun(`Would write to ${path.relative(ROOT_DIR, filePath)}`);
    return;
  }
  fs.writeFileSync(filePath, content);
}

// Validation functions
function checkGhCli() {
  logStep('Checking gh CLI...');

  try {
    exec('gh --version');
  } catch {
    console.error('Error: gh CLI is not installed.');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }

  try {
    exec('gh auth status');
    log('   gh CLI is authenticated');
  } catch {
    console.error('Error: gh CLI is not authenticated.');
    console.error('Run: gh auth login');
    process.exit(1);
  }
}

function checkGitClean() {
  logStep('Checking git status...');

  const status = exec('git status --porcelain');
  if (status) {
    console.error('Error: Working directory is not clean.');
    console.error('Please commit or stash your changes first.');
    console.error('\nUncommitted changes:');
    console.error(status);
    process.exit(1);
  }
  log('   Working directory is clean');
}

function checkChangelogHasContent() {
  logStep('Checking CHANGELOG.md...');

  const changelog = readFile(CHANGELOG_PATH);
  const match = changelog.match(/## Next Release\n([\s\S]*?)(?=\n## \d|$)/);
  const content = match?.[1]?.trim();

  if (!content) {
    console.error('Error: No content under "## Next Release" in CHANGELOG.md');
    console.error('Please add release notes before releasing.');
    process.exit(1);
  }

  log(`   Found release notes (${content.split('\n').length} lines)`);
  return content;
}

// Version functions
function getCurrentVersion() {
  const pkg = JSON.parse(readFile(PACKAGE_JSON_PATH));
  return pkg.version;
}

async function selectVersion(currentVersion) {
  logStep(`Current version: ${currentVersion}`);

  const patch = semver.inc(currentVersion, 'patch');
  const minor = semver.inc(currentVersion, 'minor');
  const major = semver.inc(currentVersion, 'major');

  const newVersion = await select({
    message: 'Select new version:',
    choices: [
      { name: `${patch} (patch)`, value: patch },
      { name: `${minor} (minor)`, value: minor },
      { name: `${major} (major)`, value: major },
    ],
  });

  return newVersion;
}

// File update functions
function updateChangelog(version) {
  logStep('Updating CHANGELOG.md...');

  const changelog = readFile(CHANGELOG_PATH);
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const updatedChangelog = changelog.replace(
    '## Next Release\n',
    `## Next Release\n\n## ${version} (${date})\n`
  );

  writeFile(CHANGELOG_PATH, updatedChangelog);
  log(`   Added version header: ## ${version} (${date})`);
}

function updatePackageJson(version) {
  logStep('Updating package.json...');

  const pkg = JSON.parse(readFile(PACKAGE_JSON_PATH));
  pkg.version = version;

  writeFile(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + '\n');
  log(`   Updated version to ${version}`);
}

function updatePackageLock(version) {
  logStep('Updating package-lock.json...');

  const lock = JSON.parse(readFile(PACKAGE_LOCK_PATH));
  lock.version = version;

  if (lock.packages && lock.packages['']) {
    lock.packages[''].version = version;
  }

  writeFile(PACKAGE_LOCK_PATH, JSON.stringify(lock, null, 2) + '\n');
  log(`   Updated version to ${version}`);
}

// Git functions
function commitRelease(version) {
  logStep('Creating git commit...');

  const commitMessage = `Release ${version}`;

  if (DRY_RUN) {
    logDryRun(`git add CHANGELOG.md package.json package-lock.json`);
    logDryRun(`git commit -m "${commitMessage}"`);
    return;
  }

  exec('git add CHANGELOG.md package.json package-lock.json');
  exec(`git commit -m "${commitMessage}"`);
  log(`   Created commit: ${commitMessage}`);
}

function tagRelease(version) {
  logStep('Creating git tag...');

  const tag = `v${version}`;

  if (DRY_RUN) {
    logDryRun(`git tag ${tag}`);
    return;
  }

  exec(`git tag ${tag}`);
  log(`   Created tag: ${tag}`);
}

function pushRelease() {
  logStep('Pushing to remote...');

  if (DRY_RUN) {
    logDryRun('git push');
    logDryRun('git push --tags');
    return;
  }

  exec('git push');
  exec('git push --tags');
  log('   Pushed commits and tags');
}

// GitHub release functions
function extractReleaseNotes(version) {
  const changelog = readFile(CHANGELOG_PATH);
  const date = new Date().toISOString().split('T')[0];
  const versionHeader = `## ${version} (${date})`;

  // Find the content between this version header and the next version header
  const regex = new RegExp(
    `## ${version.replace(/\./g, '\\.')} \\(${date}\\)\n([\\s\\S]*?)(?=\n## \\d|$)`
  );
  const match = changelog.match(regex);

  return match?.[1]?.trim() || '';
}

async function createGitHubRelease(version, notes) {
  logStep('Creating GitHub release...');

  const tag = `v${version}`;

  const isPrerelease = await confirm({
    message: 'Is this a pre-release?',
    default: false,
  });

  const useDefaultTitle = await confirm({
    message: `Use default title "${tag}"?`,
    default: true,
  });

  let title = tag;
  if (!useDefaultTitle) {
    title = await input({
      message: 'Enter release title:',
      default: tag,
    });
  }

  // Escape notes for shell
  const escapedNotes = notes.replace(/"/g, '\\"').replace(/\$/g, '\\$');

  const prereleaseFlag = isPrerelease ? '--prerelease' : '--latest';
  const cmd = `gh release create ${tag} --title "${title}" --notes "${escapedNotes}" ${prereleaseFlag}`;

  if (DRY_RUN) {
    logDryRun(cmd);
    return;
  }

  exec(cmd);
  log(`   Created GitHub release: ${title}`);

  // Get release URL
  const releaseUrl = exec(`gh release view ${tag} --json url --jq .url`);
  log(`   URL: ${releaseUrl}`);
}

// Main function
async function main() {
  console.log('='.repeat(50));
  console.log('Quiqr Desktop Release Script');
  if (DRY_RUN) {
    console.log('MODE: DRY RUN (no changes will be made)');
  }
  console.log('='.repeat(50));

  // Pre-flight checks
  checkGhCli();
  checkGitClean();
  const releaseNotes = checkChangelogHasContent();

  // Version selection
  const currentVersion = getCurrentVersion();
  const newVersion = await selectVersion(currentVersion);

  log(`\nWill release: ${currentVersion} -> ${newVersion}`);

  const proceed = await confirm({
    message: 'Proceed with release?',
    default: true,
  });

  if (!proceed) {
    log('Release cancelled.');
    process.exit(0);
  }

  // Update files
  updateChangelog(newVersion);
  updatePackageJson(newVersion);
  updatePackageLock(newVersion);

  // Git operations
  commitRelease(newVersion);
  tagRelease(newVersion);
  pushRelease();

  // GitHub release
  // Re-extract notes after changelog update
  const finalNotes = DRY_RUN ? releaseNotes : extractReleaseNotes(newVersion);
  await createGitHubRelease(newVersion, finalNotes);

  // Done
  console.log('\n' + '='.repeat(50));
  console.log(`Release ${newVersion} complete!`);
  console.log('='.repeat(50));
}

// Run
main().catch((error) => {
  console.error('Release failed:', error.message);
  process.exit(1);
});
