#!/usr/bin/env node

/**
 * Validate Node.js Version for Testing
 *
 * Ensures that the current Node.js version meets the project requirements
 * defined in package.json (>=22.0.0)
 *
 * Usage: node scripts/validate-node-version.js
 * Or: npm run validate:node
 *
 * Exit codes:
 * - 0: Node version is acceptable
 * - 1: Node version does not meet requirements
 */

const semver = require('semver');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json to get required Node version
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const requiredNodeVersion = packageJson.engines.node;
const requiredNpmVersion = packageJson.engines.npm;

const currentNodeVersion = process.version.slice(1); // Remove 'v' prefix

// Get npm version from command
let currentNpmVersion;
try {
  currentNpmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
} catch (e) {
  currentNpmVersion = 'unknown';
}

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateVersion(current, required, name) {
  const isValid = semver.satisfies(current, required);
  const status = isValid ? '✅' : '❌';
  const color = isValid ? 'green' : 'red';

  log(`${status} ${name}:`, color);
  log(`   Required: ${required}`, 'cyan');
  log(`   Current:  v${current}`, isValid ? 'green' : 'red');

  return isValid;
}

// Main validation
log('\n🔍 Validating test environment...', 'bright');
log('═'.repeat(60), 'cyan');

const nodeValid = validateVersion(currentNodeVersion, requiredNodeVersion, 'Node.js');
const npmValid = validateVersion(currentNpmVersion, requiredNpmVersion, 'npm');

log('═'.repeat(60), 'cyan');

if (nodeValid && npmValid) {
  log('\n✅ Environment is ready for testing!', 'green');
  log(`\n📝 Summary:`, 'cyan');
  log(`   • Node.js v${currentNodeVersion} meets requirement ${requiredNodeVersion}`);
  log(`   • npm v${currentNpmVersion} meets requirement ${requiredNpmVersion}`);
  log('');
  process.exit(0);
} else {
  log('\n❌ Environment validation failed!', 'red');
  log(`\n📝 Summary:`, 'cyan');

  if (!nodeValid) {
    log(`   • Node.js v${currentNodeVersion} does NOT meet requirement ${requiredNodeVersion}`, 'red');
    log(`   • To fix: Install Node.js ${requiredNodeVersion}`, 'yellow');
  }

  if (!npmValid) {
    log(`   • npm v${currentNpmVersion} does NOT meet requirement ${requiredNpmVersion}`, 'red');
    log(`   • To fix: npm install -g npm@${requiredNpmVersion}`, 'yellow');
  }

  log('\n💡 Tip: Use nvm or nodeenv to manage Node versions', 'yellow');
  log('   $ nvm install 22\n', 'cyan');
  process.exit(1);
}
