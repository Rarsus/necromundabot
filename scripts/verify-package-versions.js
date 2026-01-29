#!/usr/bin/env node

/**
 * Package Version Verification Script
 *
 * Verifies that published GitHub package versions match local repository versions.
 * Ensures alignment between:
 * - Local package.json versions
 * - Published @Rarsus/* packages on GitHub Packages registry
 *
 * Usage: node scripts/verify-package-versions.js [--strict]
 *
 * Exit codes:
 *   0 - All versions aligned
 *   1 - Version mismatch detected
 *   2 - Error during verification
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PACKAGES = ['necrobot-core', 'necrobot-utils', 'necrobot-commands', 'necrobot-dashboard'];

const GITHUB_REGISTRY = 'https://npm.pkg.github.com';
const SCOPE = '@Rarsus';

/**
 * Read version from local package.json
 */
function getLocalVersion(packageName) {
  const repoPath = path.join(__dirname, '..', 'repos', packageName, 'package.json');
  if (!fs.existsSync(repoPath)) {
    throw new Error(`Package not found: ${repoPath}`);
  }

  const pkg = JSON.parse(fs.readFileSync(repoPath, 'utf-8'));
  return pkg.version;
}

/**
 * Get published version from GitHub Packages
 */
async function getPublishedVersion(packageName) {
  try {
    // Use npm view to fetch package metadata
    const scoped = `${SCOPE}/${packageName}`;
    const cmd = `npm view ${scoped} version --registry ${GITHUB_REGISTRY}`;

    const version = execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    return version;
  } catch (error) {
    // Package might not be published yet
    return null;
  }
}

/**
 * Compare versions
 */
function compareVersions(local, published) {
  if (!published) {
    return { status: 'NOT_PUBLISHED', match: false };
  }

  if (local === published) {
    return { status: 'ALIGNED', match: true };
  }

  return { status: 'MISMATCH', match: false, local, published };
}

/**
 * Main verification
 */
async function verifyVersions() {
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('📦 PACKAGE VERSION VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  let allAligned = true;
  const results = [];

  for (const pkg of PACKAGES) {
    try {
      const localVersion = getLocalVersion(pkg);
      const publishedVersion = await getPublishedVersion(pkg);
      const comparison = compareVersions(localVersion, publishedVersion);

      results.push({
        package: pkg,
        localVersion,
        publishedVersion,
        ...comparison,
      });

      if (!comparison.match) {
        allAligned = false;
      }
    } catch (error) {
      console.error(`❌ Error checking ${pkg}: ${error.message}`);
      allAligned = false;
    }
  }

  // Display results
  console.log('VERIFICATION RESULTS:\n');

  for (const result of results) {
    const icon = result.match ? '✅' : '⚠️ ';

    if (result.status === 'ALIGNED') {
      console.log(`${icon} ${result.package}`);
      console.log(`   Local:     ${result.localVersion}`);
      console.log(`   Published: ${result.publishedVersion}`);
      console.log(`   Status:    ALIGNED\n`);
    } else if (result.status === 'MISMATCH') {
      console.log(`${icon} ${result.package}`);
      console.log(`   Local:     ${result.localVersion}`);
      console.log(`   Published: ${result.publishedVersion}`);
      console.log(`   Status:    MISMATCH - Update required\n`);
    } else if (result.status === 'NOT_PUBLISHED') {
      console.log(`${icon} ${result.package}`);
      console.log(`   Local:     ${result.localVersion}`);
      console.log(`   Published: Not found on GitHub Packages`);
      console.log(`   Status:    NOT_PUBLISHED - First publication needed\n`);
    }
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('\n📋 GitHub Actions Publishing Workflow:');
  console.log('   - Workflows: .github/workflows/publish-packages.yml');
  console.log('   - Triggers: Push to main with package.json changes');
  console.log('   - Status: Automatic publishing enabled');
  console.log('   - Guide: docs/guides/GITHUB-PACKAGES-PUBLISHING.md\n');

  if (allAligned) {
    console.log('✅ All packages verified and aligned\n');
    process.exit(0);
  } else {
    console.log('❌ Version mismatches detected - Review results above');
    console.log('💡 Tip: Publish packages via GitHub Actions workflow or follow publishing guide\n');
    process.exit(1);
  }
}

// Run verification
verifyVersions().catch((error) => {
  console.error(`❌ Verification failed: ${error.message}`);
  process.exit(2);
});
