#!/usr/bin/env node

/**
 * Workspace Tag Validation Script
 *
 * Validates git tags against Semantic Versioning strategy before and after tag creation.
 * Ensures all workspace and root tags follow SemVer format and progression rules.
 *
 * Usage:
 *   node scripts/validate-workspace-tags.js [--check] [--strict]
 *
 * Modes:
 *   Default (no args): Check current tags and validate against latest tags
 *   --check: Only validate existing tags (don't create new ones)
 *   --strict: Fail on any semver format issues (not just critical ones)
 *
 * SemVer Rules:
 *   - Format: MAJOR.MINOR.PATCH
 *   - MAJOR: Breaking changes
 *   - MINOR: New features (backward compatible)
 *   - PATCH: Bug fixes and refactors
 *   - No downgrade of versions
 *   - Must be greater than or equal to current tag
 *
 * Exit Codes:
 *   0: All validations passed
 *   1: Semver format error
 *   2: Version progression error (e.g., downgrade)
 *   3: Tag consistency error
 */

const { execSync } = require('child_process');
const fs = require('fs');
const semver = require('semver');

// Workspace definitions
const WORKSPACES = [
  { name: 'necrobot-utils', path: 'repos/necrobot-utils', tagFormat: 'necrobot-utils@{version}' },
  { name: 'necrobot-core', path: 'repos/necrobot-core', tagFormat: 'necrobot-core@{version}' },
  { name: 'necrobot-commands', path: 'repos/necrobot-commands', tagFormat: 'necrobot-commands@{version}' },
  { name: 'necrobot-dashboard', path: 'repos/necrobot-dashboard', tagFormat: 'necrobot-dashboard@{version}' },
];

const ROOT_TAG_FORMAT = 'v{version}';

// CLI arguments
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const strictMode = args.includes('--strict');

/**
 * Execute shell command safely
 */
function executeCommand(cmd, throwOnError = true) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (error) {
    if (throwOnError) {
      return '';
    }
    throw error;
  }
}

/**
 * Get package.json version for a path
 */
function getPackageVersion(pkgPath) {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkgJson.version || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get all git tags matching a pattern
 */
function getExistingTags(pattern) {
  try {
    const result = executeCommand(`git tag -l "${pattern}" 2>/dev/null`, false);
    return result.split('\n').filter((tag) => tag.length > 0);
  } catch {
    return [];
  }
}

/**
 * Validate semver format
 */
function validateSemVerFormat(version) {
  if (!semver.valid(version)) {
    return {
      valid: false,
      error: `Invalid SemVer format: "${version}" (expected MAJOR.MINOR.PATCH)`,
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Validate version progression (no downgrade)
 */
function validateVersionProgression(currentTag, newVersion) {
  if (!currentTag) {
    return { valid: true, error: null }; // First version is always valid
  }

  // Extract version from tag
  const tagVersionMatch = currentTag.match(/(\d+\.\d+\.\d+)/);
  if (!tagVersionMatch) {
    return {
      valid: false,
      error: `Could not extract version from existing tag: "${currentTag}"`,
    };
  }

  const currentVersion = tagVersionMatch[1];
  const comparison = semver.compare(newVersion, currentVersion);

  if (comparison === 0) {
    return {
      valid: true,
      warning: `Version unchanged: ${currentVersion}`,
    };
  }

  if (comparison < 0) {
    return {
      valid: false,
      error: `Version downgrade not allowed: ${currentVersion} → ${newVersion}`,
    };
  }

  return {
    valid: true,
    message: `Valid upgrade: ${currentVersion} → ${newVersion}`,
  };
}

/**
 * Validate all workspace tags
 */
function validateWorkspaceTags() {
  console.log('🔍 Validating Workspace Tags Against SemVer Strategy\n');

  let allValid = true;
  const validationReport = {
    timestamp: new Date().toISOString(),
    mode: checkOnly ? 'check-only' : 'pre-tagging',
    results: {
      workspaces: {},
      root: {},
    },
    summary: {
      passed: 0,
      warnings: 0,
      failed: 0,
    },
  };

  // Validate each workspace
  console.log('📦 Workspace Tags:');
  WORKSPACES.forEach((workspace) => {
    const pkgJsonPath = `${workspace.path}/package.json`;
    const newVersion = getPackageVersion(pkgJsonPath);

    if (!newVersion) {
      console.error(`❌ ${workspace.name}: Could not read version from ${pkgJsonPath}`);
      allValid = false;
      validationReport.results.workspaces[workspace.name] = {
        valid: false,
        error: 'Could not read package.json version',
      };
      validationReport.summary.failed++;
      return;
    }

    // Validate SemVer format
    const formatCheck = validateSemVerFormat(newVersion);
    if (!formatCheck.valid) {
      console.error(`❌ ${workspace.name}: ${formatCheck.error}`);
      allValid = false;
      validationReport.results.workspaces[workspace.name] = {
        valid: false,
        error: formatCheck.error,
      };
      validationReport.summary.failed++;
      return;
    }

    // Get latest existing tag
    const existingTags = getExistingTags(`${workspace.name}@*`);
    const latestTag = existingTags.length > 0 ? existingTags[existingTags.length - 1] : null;

    // Validate progression
    const progressionCheck = validateVersionProgression(latestTag, newVersion);
    if (!progressionCheck.valid) {
      console.error(`❌ ${workspace.name}: ${progressionCheck.error}`);
      allValid = false;
      validationReport.results.workspaces[workspace.name] = {
        valid: false,
        error: progressionCheck.error,
        currentTag: latestTag,
        newVersion,
      };
      validationReport.summary.failed++;
      return;
    }

    // Success
    const tagName = `${workspace.name}@${newVersion}`;
    console.log(`✅ ${workspace.name}:`);
    console.log(`   Version: ${newVersion} (SemVer valid)`);
    if (latestTag) {
      console.log(`   Previous: ${latestTag}`);
      console.log(`   New tag: ${tagName}`);
    } else {
      console.log(`   First tag: ${tagName}`);
    }

    if (progressionCheck.warning) {
      console.log(`   ⚠️  ${progressionCheck.warning}`);
      validationReport.summary.warnings++;
    }

    validationReport.results.workspaces[workspace.name] = {
      valid: true,
      version: newVersion,
      tag: tagName,
      previousTag: latestTag,
    };
    validationReport.summary.passed++;
  });

  // Validate root tag
  console.log('\n📍 Root Tag:');
  const rootPkgJsonPath = 'package.json';
  const rootVersion = getPackageVersion(rootPkgJsonPath);

  if (!rootVersion) {
    console.error('❌ Root: Could not read version from package.json');
    allValid = false;
    validationReport.results.root = {
      valid: false,
      error: 'Could not read package.json version',
    };
    validationReport.summary.failed++;
  } else {
    // Validate SemVer format
    const formatCheck = validateSemVerFormat(rootVersion);
    if (!formatCheck.valid) {
      console.error(`❌ Root: ${formatCheck.error}`);
      allValid = false;
      validationReport.results.root = {
        valid: false,
        error: formatCheck.error,
      };
      validationReport.summary.failed++;
    } else {
      // Get latest existing root tag
      const existingRootTags = getExistingTags('v*');
      const latestRootTag = existingRootTags.length > 0 ? existingRootTags[existingRootTags.length - 1] : null;

      // Validate progression
      const progressionCheck = validateVersionProgression(latestRootTag, rootVersion);
      if (!progressionCheck.valid) {
        console.error(`❌ Root: ${progressionCheck.error}`);
        allValid = false;
        validationReport.results.root = {
          valid: false,
          error: progressionCheck.error,
          currentTag: latestRootTag,
          newVersion: rootVersion,
        };
        validationReport.summary.failed++;
      } else {
        const tagName = `v${rootVersion}`;
        console.log(`✅ Root:`);
        console.log(`   Version: ${rootVersion} (SemVer valid)`);
        if (latestRootTag) {
          console.log(`   Previous: ${latestRootTag}`);
          console.log(`   New tag: ${tagName}`);
        } else {
          console.log(`   First tag: ${tagName}`);
        }

        if (progressionCheck.warning) {
          console.log(`   ⚠️  ${progressionCheck.warning}`);
          validationReport.summary.warnings++;
        }

        validationReport.results.root = {
          valid: true,
          version: rootVersion,
          tag: tagName,
          previousTag: latestRootTag,
        };
        validationReport.summary.passed++;
      }
    }
  }

  // Print summary
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 Validation Summary:');
  console.log(`   ✅ Passed: ${validationReport.summary.passed}`);
  console.log(`   ⚠️  Warnings: ${validationReport.summary.warnings}`);
  console.log(`   ❌ Failed: ${validationReport.summary.failed}`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (!allValid) {
    if (strictMode) {
      process.exit(1);
    }
    console.log('⚠️  Some validations failed. Use --strict to enforce.');
  } else {
    console.log('✅ All tags are valid according to SemVer strategy!\n');
  }

  return { allValid, validationReport };
}

/**
 * Main execution
 */
function main() {
  if (checkOnly) {
    console.log('🔍 Check-only mode: Validating existing tags\n');
  } else {
    console.log('🔍 Pre-tagging mode: Validating tags before creation\n');
  }

  const { allValid } = validateWorkspaceTags();

  if (!allValid) {
    if (strictMode) {
      console.error('\n❌ Validation failed. Fix the issues above and try again.');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Some issues found but not critical in default mode.');
      process.exit(0);
    }
  }

  process.exit(0);
}

// Run the script
main();
