#!/usr/bin/env node

/**
 * Workspace-Independent Version Synchronization
 *
 * This script uses the new workspace-independent versioning system to apply
 * version updates. It detects changes across workspaces and bumps each
 * workspace independently based on its own changes.
 *
 * Dependencies are maintained:
 *   - necrobot-utils (no dependencies)
 *   - necrobot-core (depends on necrobot-utils)
 *   - necrobot-commands (depends on necrobot-core and necrobot-utils)
 *   - necrobot-dashboard (depends on necrobot-utils)
 *
 * Usage: node scripts/sync-package-versions.js <commit-range> [--force]
 *   - commit-range: Git range to analyze (e.g., "origin/main..HEAD")
 *   - --force: Force sync without confirmation (optional)
 *
 * REPLACED: Old behavior (syncing all packages to same version) is now replaced
 * with workspace-independent versioning based on actual changes.
 */

const { execSync } = require('child_process');
const path = require('path');

const { detectWorkspaceChanges } = require('./detect-workspace-changes');
const { updateWorkspaceVersions, updateRootVersion } = require('./bump-workspace-versions');

function executeCommand(cmd, description) {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.error(`❌ Failed to ${description}: ${error.message}`);
    throw error;
  }
}

function main() {
  const commitRange = process.argv[2];
  const force = process.argv[3] === '--force';

  if (!commitRange) {
    console.error('❌ Usage: sync-package-versions.js <commit-range> [--force]');
    console.error('   Example: sync-package-versions.js origin/main..HEAD');
    process.exit(1);
  }

  console.log('🔍 Workspace-Independent Version Synchronization');
  console.log(`📋 Analyzing changes in: ${commitRange}\n`);

  try {
    // Step 1: Get git diff
    const diffOutput = executeCommand(`git diff --name-status ${commitRange}`, 'get git diff');

    // Step 2: Get commit messages
    const logOutput = executeCommand(
      `git log ${commitRange} --pretty=format:"%H%n%s%n%b%n---END---"`,
      'get commit log'
    );
    const commits = [];

    if (logOutput) {
      const commitBlocks = logOutput.split('---END---').filter((b) => b.trim());

      for (const block of commitBlocks) {
        const lines = block.trim().split('\n');
        if (lines.length >= 2) {
          const hash = lines[0];
          const subject = lines[1];
          const body = lines.slice(2).join('\n');
          commits.push({
            hash,
            message: (subject + '\n' + body).trim(),
          });
        }
      }
    }

    // Step 3: Detect workspace changes
    const changes = detectWorkspaceChanges(diffOutput, commits);

    if (Object.keys(changes).length === 0) {
      console.log('ℹ️  No changes detected. No version updates needed.');
      process.exit(0);
    }

    console.log('📈 Detected version bumps:');
    Object.entries(changes).forEach(([workspace, bump]) => {
      if (bump !== 'none') {
        console.log(`   • ${workspace}: ${bump.toUpperCase()}`);
      }
    });
    console.log('');

    // Step 4: Get workspaces from root package.json
    const rootPackage = require(path.join(__dirname, '..', 'package.json'));
    const workspaces = rootPackage.workspaces || [];

    // Step 5: Apply version updates to workspaces
    console.log('📝 Applying version updates...');
    const wsResults = updateWorkspaceVersions(
      changes,
      workspaces.map((w) => w.replace('repos/', ''))
    );

    // Separate successful and failed updates
    const wsUpdated = [];
    const wsFailed = [];

    for (const [workspace, result] of Object.entries(wsResults)) {
      if (result.error) {
        wsFailed.push({ workspace, reason: result.error });
      } else {
        wsUpdated.push({
          workspace,
          oldVersion: result.oldVersion,
          newVersion: result.newVersion,
          bumpType: result.bumpType,
        });
      }
    }

    if (wsFailed.length === 0) {
      if (wsUpdated.length > 0) {
        console.log('✅ All workspace versions updated successfully\n');
        wsUpdated.forEach((w) => {
          console.log(`   • ${w.workspace}: ${w.oldVersion} → ${w.newVersion} (${w.bumpType})`);
        });
        console.log('');
      }

      // Step 6: Update root version
      console.log('🔗 Updating root version...');
      const rootResults = updateRootVersion(changes);

      if (rootResults.bumped) {
        console.log(`✅ Root version updated: ${rootResults.oldVersion} → ${rootResults.newVersion}\n`);
      } else {
        console.log(`ℹ️  Root version unchanged: ${rootResults.oldVersion}\n`);
      }

      // Summary
      console.log('📊 Summary:');
      console.log(`   Workspace updates: ${wsUpdated.length} successful, ${wsFailed.length} failed`);
      console.log(`   Root version: ${rootResults.oldVersion} → ${rootResults.newVersion}`);
      console.log(`   Timestamp: ${rootResults.timestamp}\n`);
      console.log('✅ Version synchronization complete!\n');
      process.exit(0);
    } else {
      console.error(`❌ ${wsFailed.length} workspace updates failed`);
      wsFailed.forEach((f) => {
        console.error(`   • ${f.workspace}: ${f.reason}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Version synchronization failed: ${error.message}`);
    process.exit(1);
  }
}

main();
