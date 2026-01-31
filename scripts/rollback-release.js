#!/usr/bin/env node

/**
 * Rollback Release
 * Reverts failed releases by:
 * - Removing git tags
 * - Reverting commits
 * - Documenting rollback reason
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACES = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];

/**
 * Find release tag
 */
function findReleaseTag(version) {
  try {
    // Try different tag formats
    const patterns = [`v${version}`, version, `release-${version}`, `v${version}*`];

    for (const pattern of patterns) {
      try {
        const output = execSync(`git tag -l "${pattern}" | head -1`, { encoding: 'utf-8' }).trim();
        if (output) {
          console.log(`✅ Found tag: ${output}`);
          return output;
        }
      } catch {
        continue;
      }
    }

    throw new Error(`No tag found for version ${version}`);
  } catch (err) {
    console.error(`❌ Error finding tag:`, err.message);
    throw err;
  }
}

/**
 * Get commits in release
 */
function getReleaseCommits(tag) {
  try {
    // Get previous tag
    const prevTag = execSync(`git tag -l --sort=-version:refname | grep -v ${tag} | head -1`, {
      encoding: 'utf-8',
    }).trim();

    const range = prevTag ? `${prevTag}..${tag}` : tag;
    const output = execSync(`git log --oneline ${range}`, { encoding: 'utf-8' });

    const commits = output
      .trim()
      .split('\n')
      .filter((l) => l)
      .map((line) => {
        const [hash, ...msg] = line.split(' ');
        return { hash, message: msg.join(' ') };
      });

    console.log(`\n📋 Commits to rollback (${commits.length}):`);
    commits.forEach((c) => console.log(`   - ${c.hash} ${c.message}`));

    return { commits, range: prevTag };
  } catch (err) {
    console.error(`❌ Error getting commits:`, err.message);
    throw err;
  }
}

/**
 * Revert tag
 */
function revertTag(tag) {
  try {
    console.log(`\n🔙 Reverting tag ${tag}...`);
    execSync(`git tag -d ${tag}`);
    execSync(`git push origin :refs/tags/${tag}`);
    console.log(`✅ Tag ${tag} deleted locally and remotely`);
  } catch (err) {
    console.error(`❌ Error reverting tag:`, err.message);
    throw err;
  }
}

/**
 * Create revert commit
 */
function createRevertCommit(tag, reason) {
  try {
    console.log(`\n🔄 Creating revert commit...`);

    const message = `revert: Rollback release ${tag}\n\nReason: ${reason}\n\nThis commit reverts all changes from release ${tag}`;

    execSync(`git revert ${tag} --no-edit -m 1 2>/dev/null || true`);
    execSync(`git commit --amend -m "${message.replace(/"/g, '\\"')}" 2>/dev/null || true`);

    console.log(`✅ Revert commit created`);
  } catch (err) {
    console.warn(`⚠️ Could not create revert commit (might be manual):`, err.message);
  }
}

/**
 * Unpublish packages from npm
 */
function unpublishPackages() {
  try {
    console.log(`\n🗑️ Attempting to unpublish packages...`);

    WORKSPACES.forEach((ws) => {
      try {
        // Get current version
        const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, `../repos/${ws}/package.json`), 'utf-8'));
        const version = pkg.version;

        console.log(`   Unpublishing @rarsus/${ws}@${version}...`);
        execSync(`npm unpublish @rarsus/${ws}@${version} --force 2>/dev/null || true`);
      } catch (err) {
        console.warn(`   ⚠️ Could not unpublish ${ws}:`, err.message);
      }
    });

    console.log(`✅ Package unpublish attempt complete (some may have failed)`);
  } catch (err) {
    console.warn(`⚠️ Package unpublish failed:`, err.message);
  }
}

/**
 * Document rollback
 */
function documentRollback(tag, reason) {
  try {
    const rollbackPath = path.join(__dirname, '../.github/ROLLBACK-LOG.md');

    let content = '';
    if (fs.existsSync(rollbackPath)) {
      content = fs.readFileSync(rollbackPath, 'utf-8');
    }

    const entry = `## Rollback: ${tag}
**Date**: ${new Date().toISOString()}
**Reason**: ${reason}

---

`;

    content = entry + content;
    fs.writeFileSync(rollbackPath, content);
    console.log(`\n📝 Rollback documented in .github/ROLLBACK-LOG.md`);
  } catch (err) {
    console.error(`❌ Error documenting rollback:`, err.message);
  }
}

/**
 * Reset to previous state
 */
function resetToPreviousState(previousTag) {
  try {
    console.log(`\n🔄 Resetting to previous state (${previousTag || 'main'})...`);

    if (previousTag) {
      execSync(`git reset --hard ${previousTag}`);
    } else {
      execSync(`git reset --hard origin/main`);
    }

    console.log(`✅ Reset complete`);
  } catch (err) {
    console.error(`❌ Error resetting:`, err.message);
    console.error(`   ⚠️ Manual reset may be required`);
  }
}

/**
 * Main rollback function
 */
function main() {
  const version = process.argv[2] || process.env.ROLLBACK_VERSION;
  const reason = process.argv[3] || process.env.ROLLBACK_REASON || 'Manual rollback request';

  if (!version) {
    console.error('❌ Version required: node scripts/rollback-release.js <version> [reason]');
    process.exit(1);
  }

  console.log(`╔════════════════════════════════════════════════════════════╗`);
  console.log(`║                    🔙 RELEASE ROLLBACK                     ║`);
  console.log(`║                                                            ║`);
  console.log(`║  Version: ${version.padEnd(55).substring(0, 55)}║`);
  console.log(`║  Reason: ${reason.padEnd(57).substring(0, 57)}║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);

  try {
    // Step 1: Find and verify tag
    const tag = findReleaseTag(version);

    // Step 2: Get commits info
    const { commits, range } = getReleaseCommits(tag);

    // Step 3: Confirm rollback
    console.log(`\n⚠️ WARNING: This will:`);
    console.log(`   1. Delete tag: ${tag}`);
    console.log(`   2. Revert ${commits.length} commits`);
    console.log(`   3. Attempt to unpublish packages`);
    console.log(`   4. Document the rollback`);

    // Proceed (in CI this would be env var)
    const proceed = process.env.ROLLBACK_CONFIRM === 'true' || process.argv[4] === '--confirm';
    if (!proceed && process.env.ROLLBACK_CONFIRM !== 'true') {
      console.log(`\n❌ Rollback cancelled. Use --confirm flag or set ROLLBACK_CONFIRM=true to proceed.`);
      process.exit(0);
    }

    // Step 4: Execute rollback
    console.log(`\n✅ Proceeding with rollback...\n`);

    revertTag(tag);
    unpublishPackages();
    createRevertCommit(tag, reason);
    documentRollback(tag, reason);

    // Step 5: Push revert
    try {
      execSync('git push origin main');
      console.log(`\n✅ Revert commit pushed to main`);
    } catch (err) {
      console.warn(`\n⚠️ Could not push revert:`, err.message);
      console.warn(`   Manual git push may be required`);
    }

    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║                  ✅ ROLLBACK COMPLETE                      ║`);
    console.log(`║                                                            ║`);
    console.log(`║  The release has been reverted. Next steps:               ║`);
    console.log(`║  1. Investigate the rollback reason                       ║`);
    console.log(`║  2. Fix issues and create new commits                    ║`);
    console.log(`║  3. Push to main to trigger new release                  ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
  } catch (err) {
    console.error(`\n❌ Rollback failed:`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  findReleaseTag,
  getReleaseCommits,
  revertTag,
  unpublishPackages,
  documentRollback,
};
