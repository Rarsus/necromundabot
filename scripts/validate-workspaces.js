#!/usr/bin/env node

/**
 * Workspace Validation Script
 * Validates the monorepo structure and all workspace configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACES = [
  'repos/necrobot-utils',
  'repos/necrobot-core',
  'repos/necrobot-commands',
  'repos/necrobot-dashboard',
];

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(type, message) {
  const icons = {
    pass: '✅',
    fail: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ ',
  };
  console.log(`${icons[type]} ${message}`);
  checks[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : type === 'warn' ? 'warnings' : 'warnings']++;
}

function checkWorkspaceExists(workspace) {
  if (!fs.existsSync(workspace)) {
    log('fail', `Workspace directory missing: ${workspace}`);
    return false;
  }
  return true;
}

function checkPackageJson(workspace) {
  const packageJsonPath = path.join(workspace, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('fail', `  Missing package.json in ${workspace}`);
    return false;
  }

  try {
    const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    if (!content.name) {
      log('fail', `  Invalid package.json in ${workspace}: missing name field`);
      return false;
    }
    log('pass', `  Valid package.json: ${content.name}@${content.version}`);
    return true;
  } catch (err) {
    log('fail', `  Invalid JSON in ${workspace}/package.json: ${err.message}`);
    return false;
  }
}

function checkDependencies(workspace) {
  const packageJsonPath = path.join(workspace, 'package.json');
  try {
    const content = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = { ...content.dependencies, ...content.devDependencies };

    // Check for necrobot cross-references
    const necrobotRefs = Object.entries(allDeps)
      .filter(([key]) => key.startsWith('necrobot-'))
      .map(([key, version]) => `${key}@${version}`);

    if (necrobotRefs.length > 0) {
      log('info', `  Cross-workspace dependencies: ${necrobotRefs.join(', ')}`);
    }

    return true;
  } catch (err) {
    log('fail', `  Error reading dependencies: ${err.message}`);
    return false;
  }
}

function checkTestDirectory(workspace) {
  const testDir = path.join(workspace, 'tests');
  if (!fs.existsSync(testDir)) {
    log('warn', `  No tests/ directory found in ${workspace}`);
    return true;
  }

  try {
    const testFiles = execSync(`find ${testDir} -name "*.test.js" 2>/dev/null | wc -l`, {
      encoding: 'utf-8',
    }).trim();
    const count = parseInt(testFiles, 10) || 0;
    if (count > 0) {
      log('pass', `  Found ${count} test files in ${workspace}`);
    } else {
      log('warn', `  tests/ directory exists but no *.test.js files found`);
    }
    return true;
  } catch {
    log('warn', `  Could not scan test directory`);
    return true;
  }
}

function checkNodeModules() {
  if (!fs.existsSync('node_modules')) {
    log('fail', 'Root node_modules not found. Run: npm ci --workspaces');
    return false;
  }
  log('pass', 'Root node_modules exists');

  // Check each workspace node_modules
  let allPresent = true;
  WORKSPACES.forEach((workspace) => {
    const nmPath = path.join(workspace, 'node_modules');
    if (!fs.existsSync(nmPath)) {
      log('warn', `  node_modules missing in ${workspace}`);
      allPresent = false;
    }
  });

  if (allPresent) {
    log('pass', 'All workspace node_modules are present');
  }

  return true;
}

function checkWorkspaceResolution() {
  try {
    const output = execSync('npm list --workspaces --depth=0 2>&1', {
      encoding: 'utf-8',
    });

    if (output.includes('npm ERR!')) {
      log('fail', 'Workspace dependency resolution failed');
      console.log(output.split('\n').slice(0, 5).join('\n'));
      return false;
    }

    log('pass', 'Workspace dependency resolution successful');
    return true;
  } catch (err) {
    log('fail', `Workspace validation error: ${err.message}`);
    return false;
  }
}

function checkGitIgnore() {
  const gitignorePath = '.gitignore';
  if (!fs.existsSync(gitignorePath)) {
    log('warn', '.gitignore file not found');
    return true;
  }

  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  const requiredPatterns = ['node_modules', '.DS_Store', 'dist', 'build'];

  const missing = requiredPatterns.filter((pattern) => !gitignore.includes(pattern));

  if (missing.length > 0) {
    log('warn', `.gitignore missing patterns: ${missing.join(', ')}`);
  } else {
    log('pass', '.gitignore has all required patterns');
  }

  return true;
}

console.log('\n🔍 Workspace Validation Report\n');
console.log('════════════════════════════════════════════════════════════════\n');

// Check root package.json
console.log('📦 Root Configuration');
console.log('─────────────────────────────────────────────────────────');
try {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (rootPkg.workspaces && Array.isArray(rootPkg.workspaces)) {
    log('pass', `Root package.json configured with ${rootPkg.workspaces.length} workspaces`);
  } else {
    log('fail', 'Root package.json missing workspaces configuration');
  }
} catch (err) {
  log('fail', `Error reading root package.json: ${err.message}`);
}

// Check each workspace
console.log('\n📁 Workspace Configuration');
console.log('─────────────────────────────────────────────────────────');
WORKSPACES.forEach((workspace) => {
  if (checkWorkspaceExists(workspace)) {
    checkPackageJson(workspace);
    checkDependencies(workspace);
    checkTestDirectory(workspace);
  }
});

// Global checks
console.log('\n🌍 Global Configuration');
console.log('─────────────────────────────────────────────────────────');
checkNodeModules();
checkWorkspaceResolution();
checkGitIgnore();

// Summary
console.log('\n════════════════════════════════════════════════════════════════');
console.log(`\n📊 Validation Summary:`);
console.log(`   Passed:  ${checks.passed}`);
console.log(`   Warnings: ${checks.warnings}`);
console.log(`   Failed:  ${checks.failed}`);

if (checks.failed === 0) {
  console.log(`\n   ✅ All validation checks passed!`);
  process.exit(0);
} else {
  console.log(`\n   ⚠️  ${checks.failed} validation error(s) found. See above for details.`);
  process.exit(1);
}
