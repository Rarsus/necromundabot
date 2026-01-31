#!/usr/bin/env node

/**
 * Validate Package Versions Script
 * Checks that all packages in the registry have the correct versions
 * Useful for debugging publishing issues and version conflicts
 *
 * Usage:
 *   node scripts/validate-package-versions.js
 *
 * Output:
 *   - Console report with version status for each package
 *   - Process exit code 0 if all valid, 1 if mismatches found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCOPE = '@rarsus';
const PACKAGES = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];

const REGISTRY = 'https://npm.pkg.github.com';

console.log('\n📋 Package Version Validation\n');
console.log('═'.repeat(60));

const results = {
  valid: [],
  mismatch: [],
  missing: [],
  errors: [],
};

for (const pkg of PACKAGES) {
  const workspacePath = path.join(__dirname, '..', 'repos', pkg);

  try {
    // Read local version
    const packageJsonPath = path.join(workspacePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`\n❌ ${pkg}`);
      console.log(`   Error: package.json not found at ${packageJsonPath}`);
      results.errors.push(pkg);
      continue;
    }

    const localPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const localVersion = localPkg.version;

    // Check registry version
    try {
      const registryInfo = execSync(`npm view ${SCOPE}/${pkg} --registry ${REGISTRY} --json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const registryData = JSON.parse(registryInfo);
      const registryVersion = registryData.version;

      console.log(`\n✅ ${pkg}`);
      console.log(`   Local:    ${localVersion}`);
      console.log(`   Registry: ${registryVersion}`);

      if (localVersion === registryVersion) {
        console.log(`   Status:   ✓ Versions match`);
        results.valid.push({ pkg, version: localVersion });
      } else {
        console.log(`   Status:   ⚠️  Version mismatch!`);
        results.mismatch.push({ pkg, local: localVersion, registry: registryVersion });
      }
    } catch (err) {
      // Package not in registry
      console.log(`\n⚠️  ${pkg}`);
      console.log(`   Local:    ${localVersion}`);
      console.log(`   Registry: NOT FOUND`);
      console.log(`   Status:   ⏭️  Not yet published`);
      results.missing.push({ pkg, version: localVersion });
    }
  } catch (err) {
    console.log(`\n❌ ${pkg}`);
    console.log(`   Error: ${err.message}`);
    results.errors.push(pkg);
  }
}

console.log('\n' + '═'.repeat(60));
console.log('\n📊 Summary\n');
console.log(`✅ Valid (match):     ${results.valid.length}/${PACKAGES.length}`);
console.log(`⏭️  Not published:     ${results.missing.length}/${PACKAGES.length}`);
console.log(`⚠️  Mismatches:       ${results.mismatch.length}/${PACKAGES.length}`);
console.log(`❌ Errors:           ${results.errors.length}/${PACKAGES.length}`);

if (results.mismatch.length > 0) {
  console.log('\n⚠️  Version Mismatches:');
  for (const item of results.mismatch) {
    console.log(`   - ${item.pkg}: local=${item.local}, registry=${item.registry}`);
  }
}

if (results.missing.length > 0) {
  console.log('\n⏭️  Not Published:');
  for (const item of results.missing) {
    console.log(`   - ${item.pkg}: version=${item.version}`);
  }
}

if (results.errors.length > 0) {
  console.log('\n❌ Errors:');
  for (const pkg of results.errors) {
    console.log(`   - ${pkg}`);
  }
}

console.log('\n' + '═'.repeat(60) + '\n');

// Exit with error if any mismatches or errors
const hasIssues = results.mismatch.length > 0 || results.errors.length > 0;
process.exit(hasIssues ? 1 : 0);
