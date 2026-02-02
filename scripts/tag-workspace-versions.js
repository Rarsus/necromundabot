#!/usr/bin/env node

/**
 * Workspace Version Tagging Script
 *
 * Creates git tags for each workspace based on their package.json versions.
 * Tags follow the pattern: {workspace-name}@{version}
 *
 * Usage:
 *   node scripts/tag-workspace-versions.js [--push] [--force]
 *
 * Options:
 *   --push    Push tags to origin (required for remote tagging)
 *   --force   Force recreate tags if they already exist
 *
 * Tags created:
 *   - necrobot-utils@{version}
 *   - necrobot-core@{version}
 *   - necrobot-commands@{version}
 *   - necrobot-dashboard@{version}
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const WORKSPACES = [
  { name: 'necrobot-utils', path: 'repos/necrobot-utils' },
  { name: 'necrobot-core', path: 'repos/necrobot-core' },
  { name: 'necrobot-commands', path: 'repos/necrobot-commands' },
  { name: 'necrobot-dashboard', path: 'repos/necrobot-dashboard' },
];

const args = process.argv.slice(2);
const shouldPush = args.includes('--push');
const shouldForce = args.includes('--force');

function executeCommand(cmd, description, throwOnError = true) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (error) {
    if (throwOnError) {
      console.error(`❌ ${description}: ${error.message}`);
      throw error;
    }
    return '';
  }
}

function tagWorkspace(workspace) {
  const packageJsonPath = path.join(__dirname, '..', workspace.path, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ ${workspace.name}: package.json not found at ${packageJsonPath}`);
    return { success: false, reason: 'package.json not found' };
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    if (!version) {
      console.error(`❌ ${workspace.name}: No version found in package.json`);
      return { success: false, reason: 'No version in package.json' };
    }

    const tag = `${workspace.name}@${version}`;
    const commitMessage = `Release ${workspace.name} v${version}`;

    // Check if tag exists
    const tagExists = executeCommand(
      `git rev-list -n 1 "${tag}" 2>/dev/null || echo ""`,
      `Check if tag ${tag} exists`,
      false
    );

    if (tagExists && !shouldForce) {
      console.log(`⏭️  ${workspace.name}: Tag ${tag} already exists, skipping`);
      return { success: true, skipped: true, tag, version };
    }

    if (tagExists && shouldForce) {
      console.log(`🔄 ${workspace.name}: Removing existing tag ${tag} (--force)`);
      executeCommand(`git tag -d "${tag}"`, `Delete local tag ${tag}`, false);
      if (shouldPush) {
        executeCommand(`git push origin :refs/tags/"${tag}" 2>/dev/null || true`, `Delete remote tag ${tag}`, false);
      }
    }

    // Create the tag
    console.log(`📝 ${workspace.name}: Creating tag ${tag}...`);
    executeCommand(`git tag -a "${tag}" -m "${commitMessage}"`, `Create tag ${tag}`);

    let pushStatus = '';
    if (shouldPush) {
      console.log(`📤 ${workspace.name}: Pushing tag ${tag} to origin...`);
      executeCommand(`git push origin "${tag}"`, `Push tag ${tag} to origin`);
      pushStatus = ' (pushed)';
    }

    console.log(`✅ ${workspace.name}: Tag ${tag} created${pushStatus}`);
    return { success: true, skipped: false, tag, version };
  } catch (error) {
    console.error(`❌ ${workspace.name}: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

function main() {
  console.log('🏷️  Workspace Version Tagging');
  console.log(`${'═'.repeat(50)}\n`);

  // Verify we're in a git repository
  try {
    executeCommand('git rev-parse --git-dir', 'Verify git repository', true);
  } catch {
    console.error('❌ Not in a git repository. Run this from the repository root.');
    process.exit(1);
  }

  // Configure git if needed (for CI environments)
  try {
    const userName = executeCommand('git config user.name', 'Get git user name', false);
    if (!userName) {
      console.log('🔧 Configuring git user for CI environment...');
      executeCommand('git config user.name "github-actions[bot]"', 'Set git user name');
      executeCommand('git config user.email "github-actions[bot]@users.noreply.github.com"', 'Set git user email');
    }
  } catch {
    // Ignore errors in git config check
  }

  const results = {
    created: [],
    skipped: [],
    failed: [],
  };

  console.log('Processing workspaces:\n');

  for (const workspace of WORKSPACES) {
    const result = tagWorkspace(workspace);

    if (result.success) {
      if (result.skipped) {
        results.skipped.push(result);
      } else {
        results.created.push(result);
      }
    } else {
      results.failed.push({ ...result, workspace: workspace.name });
    }
  }

  // Print summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log('📊 Summary');
  console.log(`${'═'.repeat(50)}\n`);

  if (results.created.length > 0) {
    console.log(`✅ Created: ${results.created.length}`);
    results.created.forEach((r) => {
      console.log(`   • ${r.tag}${r.pushed ? ' (pushed)' : ''}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    results.skipped.forEach((r) => {
      console.log(`   • ${r.tag}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length}`);
    results.failed.forEach((r) => {
      console.log(`   • ${r.workspace}: ${r.reason}`);
    });
  }

  console.log(
    `\nTotal: ${results.created.length + results.skipped.length} successful, ${results.failed.length} failed`
  );

  if (shouldPush && results.created.length > 0) {
    console.log('\n✅ All tags pushed to origin');
  } else if (results.created.length > 0) {
    console.log('\n⚠️  Tags created locally. Use --push to push to origin.');
  }

  console.log('');

  // Exit with error if any failed
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main();
