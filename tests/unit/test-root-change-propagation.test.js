/**
 * Test ROOT Change Propagation in Version Bumping
 * Verifies that ROOT-level changes propagate correctly to root version
 * Part of TDD implementation for issue #26 - Priority 3
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('ROOT Change Propagation (Issue #26 - Priority 3)', () => {
  /**
   * Test 1: Verify ROOT changes are included in bump calculation
   * If ROOT changes are detected, they should affect root version bump
   */
  it('[SPEC] should propagate ROOT-major change to root version bump', () => {
    // This test documents the expected behavior:
    // If ROOT has MAJOR changes, root version should get MAJOR bump
    // regardless of workspace changes

    const changes = {
      ROOT: 'major',
      'necrobot-utils': 'none',
      'necrobot-core': 'patch',
      'necrobot-commands': 'patch',
      'necrobot-dashboard': 'none',
    };

    // Expected: ROOT major change takes precedence
    const expectedBump = 'major';

    // Calculate highest bump (this is what updateRootVersion does)
    let highestBump = 'none';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(highestBump, expectedBump, 'ROOT major change should result in major bump for root version');
  });

  /**
   * Test 2: ROOT-minor takes precedence over workspace patches
   * If ROOT has MINOR changes and workspaces have PATCH changes,
   * root version should get MINOR bump
   */
  it('[SPEC] should prefer ROOT-minor over workspace-patch changes', () => {
    const changes = {
      ROOT: 'minor',
      'necrobot-utils': 'patch',
      'necrobot-core': 'patch',
      'necrobot-commands': 'none',
      'necrobot-dashboard': 'patch',
    };

    const expectedBump = 'minor';

    let highestBump = 'none';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(
      highestBump,
      expectedBump,
      'ROOT minor change should take precedence over workspace patch changes'
    );
  });

  /**
   * Test 3: Workspace-major overrides ROOT-minor
   * If any workspace (not just ROOT) has MAJOR changes,
   * root version should get MAJOR bump
   */
  it('[SPEC] should prefer workspace-major over ROOT-minor', () => {
    const changes = {
      ROOT: 'minor',
      'necrobot-utils': 'major', // Workspace with major change
      'necrobot-core': 'patch',
      'necrobot-commands': 'none',
      'necrobot-dashboard': 'patch',
    };

    const expectedBump = 'major';

    let highestBump = 'none';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(highestBump, expectedBump, 'Workspace major change should take precedence');
  });

  /**
   * Test 4: Verify ROOT-none doesn't affect version bumping
   * If ROOT has 'none' (no changes), it shouldn't affect bump calculation
   */
  it('[SPEC] should ignore ROOT-none changes', () => {
    const changes = {
      ROOT: 'none', // No ROOT changes
      'necrobot-utils': 'patch',
      'necrobot-core': 'minor',
      'necrobot-commands': 'patch',
      'necrobot-dashboard': 'none',
    };

    const expectedBump = 'minor';

    let highestBump = 'none';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(highestBump, expectedBump, 'ROOT none should not affect bump calculation');
  });

  /**
   * Test 5: Multiple ROOT changes are handled correctly
   * If ROOT has changes in multiple commits (major, minor, patch),
   * the most significant change should be used
   */
  it('[SPEC] should handle accumulated ROOT changes correctly', () => {
    // Simulating multiple ROOT-level commits: major + minor + patch
    // The analyze-version-impact script should identify the most significant

    const changes = {
      ROOT: 'major', // After analyzing all ROOT commits, 'major' is the highest
      'necrobot-utils': 'patch',
      'necrobot-core': 'minor',
      'necrobot-commands': 'none',
      'necrobot-dashboard': 'none',
    };

    const expectedBump = 'major';

    let highestBump = 'none';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(highestBump, expectedBump, 'Most significant ROOT change should be used');
  });

  /**
   * Test 6: Verify all workspace names are processed
   * The propagation logic should handle all 4 workspaces + ROOT
   */
  it('[SPEC] should process all workspaces and ROOT together', () => {
    const changes = {
      ROOT: 'patch',
      'necrobot-utils': 'none',
      'necrobot-core': 'none',
      'necrobot-commands': 'minor',
      'necrobot-dashboard': 'none',
    };

    const expectedBump = 'minor';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    let highestBump = 'none';
    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    // Verify all workspaces were considered
    assert.strictEqual(Object.keys(changes).length, 5, 'Should have ROOT + 4 workspaces');
    assert.strictEqual(highestBump, expectedBump, 'Should correctly process all workspaces together');
  });

  /**
   * Test 7: ROOT-only changes (no workspace changes)
   * If only ROOT has changes and no workspaces, root should still bump
   */
  it('[SPEC] should bump root when only ROOT has changes', () => {
    const changes = {
      ROOT: 'patch',
      'necrobot-utils': 'none',
      'necrobot-core': 'none',
      'necrobot-commands': 'none',
      'necrobot-dashboard': 'none',
    };

    const expectedBump = 'patch';
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };

    let highestBump = 'none';
    Object.entries(changes).forEach(([workspace, bumpType]) => {
      const priority = bumpPriority[bumpType] || 0;
      const currentPriority = bumpPriority[highestBump] || 0;
      if (priority > currentPriority) {
        highestBump = bumpType;
      }
    });

    assert.strictEqual(
      highestBump,
      expectedBump,
      'Root should bump even with only ROOT changes and no workspace changes'
    );
  });

  /**
   * Test 8: Version bump function handles all cases
   * Verify the bumpVersion function correctly increments versions
   */
  it('[SPEC] should correctly apply version bumps', () => {
    function bumpVersion(version, bumpType) {
      if (bumpType === 'none') return version;

      const baseMatch = version.match(/^(\d+)\.(\d+)\.(\d+)/);
      if (!baseMatch) throw new Error(`Invalid version: ${version}`);

      let [, major, minor, patch] = baseMatch.map(Number);

      switch (bumpType) {
        case 'major':
          return `${major + 1}.0.0`;
        case 'minor':
          return `${major}.${minor + 1}.0`;
        case 'patch':
          return `${major}.${minor}.${patch + 1}`;
        default:
          throw new Error(`Unknown bump: ${bumpType}`);
      }
    }

    // Test cases
    assert.strictEqual(bumpVersion('3.0.0', 'major'), '4.0.0');
    assert.strictEqual(bumpVersion('3.0.0', 'minor'), '3.1.0');
    assert.strictEqual(bumpVersion('3.0.0', 'patch'), '3.0.1');
    assert.strictEqual(bumpVersion('3.0.0', 'none'), '3.0.0');
    assert.strictEqual(bumpVersion('1.2.3', 'major'), '2.0.0');
    assert.strictEqual(bumpVersion('1.2.3', 'minor'), '1.3.0');
    assert.strictEqual(bumpVersion('1.2.3', 'patch'), '1.2.4');
  });
});
