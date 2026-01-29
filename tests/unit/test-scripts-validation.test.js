#!/usr/bin/env node

/**
 * Test: Scripts Validation
 *
 * Validates that:
 * 1. All script files exist and are not truncated
 * 2. Bash scripts are executable
 * 3. npm scripts are properly mapped
 * 4. Scripts can be discovered via npm run
 *
 * Run: node tests/unit/test-scripts-validation.test.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const ROOT_DIR = path.join(__dirname, '../../');
const PACKAGE_JSON_PATH = path.join(__dirname, '../../package.json');

// Expected minimum file sizes (in lines)
const EXPECTED_FILE_SIZES = {
  'analyze-version-impact.js': 250, // 297 lines
  'compare-audit-against-baseline.sh': 100, // ~150 lines
  'create-release.sh': 100, // ~150 lines
  'sync-package-versions.js': 50, // ~60 lines
  'sync-vulnerability-baseline.js': 200, // 244 lines
  'validate-links.js': 50, // ~80 lines
  'validate-node-version.js': 70, // 98 lines
  'validate-workspaces.js': 150, // 225 lines
  'verify-package-versions.js': 100, // 156 lines
  'workspaces-status.js': 80, // 115 lines
};

// Expected npm script mappings
const EXPECTED_NPM_SCRIPTS = {
  'validate:node': 'node scripts/validate-node-version.js',
  'validate:workspaces': 'node scripts/validate-workspaces.js',
  'validate:links': 'node scripts/validate-links.js',
  'workspaces:status': 'node scripts/workspaces-status.js',
  'version:sync': 'node scripts/sync-package-versions.js',
  // These are MISSING and need to be added:
  'analyze:version': 'node scripts/analyze-version-impact.js',
  'verify:packages': 'node scripts/verify-package-versions.js',
  'sync:vulnerabilities': 'node scripts/sync-vulnerability-baseline.js',
  'audit:compare': 'bash scripts/compare-audit-against-baseline.sh',
  release: 'bash scripts/create-release.sh',
};

const BASH_SCRIPTS = ['compare-audit-against-baseline.sh', 'create-release.sh'];

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

console.log('\n🧪 Scripts Validation Tests\n');
console.log('═'.repeat(70));

// Test 1: All script files exist
console.log('\n📝 Test Suite 1: File Existence\n');

Object.entries(EXPECTED_FILE_SIZES).forEach(([scriptName, minLines]) => {
  test(`Script file exists: ${scriptName}`, () => {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`File not found: ${scriptPath}`);
    }
  });
});

// Test 2: Script files are not truncated
console.log('\n📝 Test Suite 2: File Completeness\n');

Object.entries(EXPECTED_FILE_SIZES).forEach(([scriptName, minLines]) => {
  test(`Script file has minimum lines: ${scriptName} (>= ${minLines})`, () => {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    const content = fs.readFileSync(scriptPath, 'utf-8');
    const lineCount = content.split('\n').length;

    if (lineCount < minLines) {
      throw new Error(`File too short: ${lineCount} lines (expected >= ${minLines})`);
    }
  });
});

// Test 3: Bash scripts are executable
console.log('\n📝 Test Suite 3: Bash Script Permissions\n');

BASH_SCRIPTS.forEach((scriptName) => {
  test(`Bash script is executable: ${scriptName}`, () => {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    const stats = fs.statSync(scriptPath);

    // Check if executable by owner (0o100 = 64 in decimal)
    if (!(stats.mode & 0o100)) {
      throw new Error(`File not executable: ${scriptPath} (mode: ${stats.mode.toString(8)})`);
    }
  });
});

// Test 4: npm scripts are defined in package.json
console.log('\n📝 Test Suite 4: npm Script Mappings\n');

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
const currentScripts = packageJson.scripts || {};

Object.entries(EXPECTED_NPM_SCRIPTS).forEach(([scriptName, expectedCommand]) => {
  test(`npm script defined: npm run ${scriptName}`, () => {
    if (!(scriptName in currentScripts)) {
      throw new Error(`npm script not found: ${scriptName}`);
    }

    const actual = currentScripts[scriptName];
    if (actual !== expectedCommand) {
      throw new Error(`npm script mismatch: got "${actual}", expected "${expectedCommand}"`);
    }
  });
});

// Test 5: npm run lists all scripts
console.log('\n📝 Test Suite 5: npm Script Discoverability\n');

test('npm run lists available scripts', () => {
  try {
    const output = execSync('npm run 2>&1', { encoding: 'utf-8' });

    // Check that key scripts appear in output
    const requiredScripts = ['validate:node', 'test', 'lint', 'format'];
    requiredScripts.forEach((script) => {
      if (!output.includes(script)) {
        throw new Error(`Script not listed in npm run output: ${script}`);
      }
    });
  } catch (error) {
    throw new Error(`Failed to run npm run: ${error.message}`);
  }
});

// Test 6: Scripts can be validated without side effects
console.log('\n📝 Test Suite 6: Script Validation\n');

test('validate:node script can run', () => {
  try {
    execSync('npm run validate:node 2>&1', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch (error) {
    if (!error.message.includes('Node version')) {
      throw new Error(`validate:node failed: ${error.message}`);
    }
  }
});

test('validate:workspaces script can run', () => {
  try {
    execSync('npm run validate:workspaces 2>&1', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error(`validate:workspaces failed: ${error.message}`);
  }
});

test('workspaces:status script can run', () => {
  try {
    execSync('npm run workspaces:status 2>&1', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error(`workspaces:status failed: ${error.message}`);
  }
});

// Test 7: Bash scripts have correct shebang
console.log('\n📝 Test Suite 7: Bash Script Headers\n');

BASH_SCRIPTS.forEach((scriptName) => {
  test(`Bash script has correct shebang: ${scriptName}`, () => {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    const content = fs.readFileSync(scriptPath, 'utf-8');
    const firstLine = content.split('\n')[0];

    if (!firstLine.includes('#!/') || !firstLine.includes('bash')) {
      throw new Error(`Invalid shebang: ${firstLine}`);
    }
  });
});

// Test 8: Create-release.sh doesn't use macOS-incompatible sed
console.log('\n📝 Test Suite 8: Platform Compatibility\n');

test('create-release.sh uses compatible sed syntax', () => {
  const scriptPath = path.join(SCRIPTS_DIR, 'create-release.sh');
  const content = fs.readFileSync(scriptPath, 'utf-8');

  // Look for sed -i without space (macOS incompatible)
  if (content.includes('sed -i"') || content.includes('sed -i.')) {
    throw new Error('Detected macOS-incompatible sed syntax: sed -i.');
  }

  // Check if it uses sed -i <space> or sed -i ' ' (compatible)
  if (content.includes('sed -i ') || content.includes('sed -i.bak')) {
    // This is acceptable if it's sed -i .bak (with space)
    return;
  }

  throw new Error('Could not verify sed syntax compatibility');
});

// Summary
console.log('\n' + '═'.repeat(70));
console.log('\n📊 Test Summary\n');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + failed}\n`);

if (failed === 0) {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test(s) failed. See above for details.\n`);
  process.exit(1);
}
