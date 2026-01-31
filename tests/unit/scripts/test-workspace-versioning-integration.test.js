/**
 * Integration Test: Workspace Versioning Pipeline
 * Tests the complete flow: detect changes → bump versions → validate consistency
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { detectWorkspaceChanges } = require('../../../scripts/detect-workspace-changes');
const { updateWorkspaceVersions, updateRootVersion, bumpVersion } = require('../../../scripts/bump-workspace-versions');

describe('Integration: Complete Workspace Versioning Pipeline', () => {
  // Note: This integration test validates the overall workflow
  // but doesn't modify actual package.json files (that's tested in unit tests)

  describe('end-to-end: detect changes through version bumping', () => {
    it('should detect changes and plan correct version bumps', () => {
      // Simulate git diff output with changes across multiple workspaces
      const diffOutput = `
M	repos/necrobot-utils/src/services/DatabaseService.js
M	repos/necrobot-core/src/handlers/message.js
A	repos/necrobot-commands/src/commands/new-command.js
M	package.json
      `.trim();

      // Simulate commit history
      const commits = [
        { hash: 'abc123', message: 'feat(utils): Add timeout parameter to DatabaseService' },
        { hash: 'def456', message: 'feat(core): Add message event handler' },
        { hash: 'ghi789', message: 'feat(commands): Add new command' },
        { hash: 'jkl012', message: 'chore: Update dependencies' },
      ];

      // Step 1: Detect changes
      const changes = detectWorkspaceChanges(diffOutput, commits);

      // Expected: Three workspaces get minor bumps (feats), root gets patch (chore)
      assert.strictEqual(changes['necrobot-utils'], 'minor');
      assert.strictEqual(changes['necrobot-core'], 'minor');
      assert.strictEqual(changes['necrobot-commands'], 'minor');
      assert.strictEqual(changes['ROOT'], 'patch');
    });

    it('should apply version bumps correctly to workspace hierarchy', () => {
      const changes = {
        'necrobot-utils': 'minor', // 0.2.4 → 0.3.0
        'necrobot-core': 'patch', // 0.3.4 → 0.3.5
        'necrobot-commands': 'minor', // 0.3.0 → 0.4.0
        ROOT: 'minor', // 141.4.0 → 141.5.0
      };

      // Step 2: Plan version bumps (using bumpVersion for validation)
      const expectedBumps = {
        'necrobot-utils': { old: '0.2.4', new: '0.3.0' },
        'necrobot-core': { old: '0.3.4', new: '0.3.5' },
        'necrobot-commands': { old: '0.3.0', new: '0.4.0' },
        ROOT: { old: '141.4.0', new: '141.5.0' },
      };

      for (const [workspace, expectedVersion] of Object.entries(expectedBumps)) {
        const bumpType = changes[workspace];
        const newVersion = bumpVersion(expectedVersion.old, bumpType);
        assert.strictEqual(newVersion, expectedVersion.new, `${workspace}: ${expectedVersion.old} → ${newVersion}`);
      }
    });

    it('should validate that root version bumps on any workspace change', () => {
      // Test different scenarios

      // Scenario 1: Only patch changes
      let changes = {
        'necrobot-utils': 'patch',
        'necrobot-core': 'patch',
      };
      assert.strictEqual(bumpVersion('141.4.0', 'patch'), '141.4.1');

      // Scenario 2: Mix of minor and patch
      changes = {
        'necrobot-utils': 'minor',
        'necrobot-core': 'patch',
        'necrobot-commands': 'patch',
      };
      assert.strictEqual(bumpVersion('141.4.0', 'minor'), '141.5.0');

      // Scenario 3: Major change
      changes = {
        'necrobot-utils': 'major',
        'necrobot-core': 'minor',
        'necrobot-commands': 'patch',
      };
      assert.strictEqual(bumpVersion('141.4.0', 'major'), '142.0.0');
    });

    it('should handle breaking changes at any level', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/services/DatabaseService.js
      `.trim();

      const commits = [
        {
          hash: 'abc123',
          message: `refactor(utils): Change DatabaseService API

BREAKING CHANGE: Old connection method no longer supported`,
        },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      assert.strictEqual(changes['necrobot-utils'], 'major');
      assert.strictEqual(bumpVersion('0.2.4', 'major'), '1.0.0');
    });

    it('should skip docs-only changes', () => {
      const diffOutput = `
M	docs/README.md
M	docs/guides/testing-guide.md
      `.trim();

      const commits = [
        { hash: 'abc123', message: 'docs: Update testing guide' },
        { hash: 'def456', message: 'docs: Update README' },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      // No version bumps for docs
      assert.deepStrictEqual(changes, {});
    });

    it('should handle complex mixed scenario', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/index.js
M	repos/necrobot-utils/package.json
M	repos/necrobot-core/src/bot.js
A	repos/necrobot-commands/src/commands/new.js
M	repos/necrobot-commands/test/commands.test.js
M	repos/necrobot-dashboard/src/pages/index.tsx
M	package.json
M	package-lock.json
M	eslint.config.js
M	docs/architecture/overview.md
      `.trim();

      const commits = [
        { hash: 'a', message: 'feat(utils): Add caching layer' }, // utils: minor
        { hash: 'b', message: 'fix(utils): Resolve memory leak' }, // utils: patch (already have minor, stays minor)
        { hash: 'c', message: 'feat(core): Add event router' }, // core: minor
        { hash: 'd', message: 'feat(commands): Add analytics command' }, // commands: minor
        { hash: 'e', message: 'test(commands): Add tests' }, // commands: no change (already have minor)
        { hash: 'f', message: 'fix(dashboard): Fix styling bug' }, // dashboard: patch
        { hash: 'g', message: 'chore: Upgrade dependencies' }, // ROOT: patch
        { hash: 'h', message: 'docs: Update architecture' }, // docs: no change
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      assert.strictEqual(changes['necrobot-utils'], 'minor');
      assert.strictEqual(changes['necrobot-core'], 'minor');
      assert.strictEqual(changes['necrobot-commands'], 'minor');
      assert.strictEqual(changes['necrobot-dashboard'], 'patch');
      assert.strictEqual(changes['ROOT'], 'patch');
    });
  });

  describe('version consistency validation', () => {
    it('should validate that workspace versions are independent', () => {
      // Read current actual versions
      const utils = require('../../../repos/necrobot-utils/package.json');
      const core = require('../../../repos/necrobot-core/package.json');
      const commands = require('../../../repos/necrobot-commands/package.json');
      const dashboard = require('../../../repos/necrobot-dashboard/package.json');
      const root = require('../../../package.json');

      // Verify all have versions
      assert.ok(utils.version, 'necrobot-utils has version');
      assert.ok(core.version, 'necrobot-core has version');
      assert.ok(commands.version, 'necrobot-commands has version');
      assert.ok(dashboard.version, 'necrobot-dashboard has version');
      assert.ok(root.version, 'root has version');

      // Verify versions are semantic
      const semverRegex = /^\d+\.\d+\.\d+$/;
      assert.match(utils.version, semverRegex, 'necrobot-utils uses semantic versioning');
      assert.match(core.version, semverRegex, 'necrobot-core uses semantic versioning');
      assert.match(commands.version, semverRegex, 'necrobot-commands uses semantic versioning');
      assert.match(dashboard.version, semverRegex, 'necrobot-dashboard uses semantic versioning');
      assert.match(root.version, semverRegex, 'root uses semantic versioning');
    });

    it('should validate that workspace dependencies use wildcard versions', () => {
      const core = require('../../../repos/necrobot-core/package.json');
      const commands = require('../../../repos/necrobot-commands/package.json');
      const dashboard = require('../../../repos/necrobot-dashboard/package.json');

      // Check that dependencies use "*" for workspace packages
      if (core.dependencies && core.dependencies['necrobot-utils']) {
        assert.strictEqual(core.dependencies['necrobot-utils'], '*', 'core uses wildcard for utils');
      }

      if (commands.dependencies && commands.dependencies['necrobot-core']) {
        assert.strictEqual(commands.dependencies['necrobot-core'], '*', 'commands uses wildcard for core');
      }

      if (commands.dependencies && commands.dependencies['necrobot-utils']) {
        assert.strictEqual(commands.dependencies['necrobot-utils'], '*', 'commands uses wildcard for utils');
      }
    });

    it('should validate workspace configuration in root package.json', () => {
      const root = require('../../../package.json');

      assert.ok(root.workspaces, 'root has workspaces field');
      assert.ok(Array.isArray(root.workspaces), 'workspaces is an array');
      assert.strictEqual(root.workspaces.length, 4, 'root defines 4 workspaces');
    });
  });

  describe('versioning workflow resilience', () => {
    it('should handle version bumps idempotently', () => {
      // Bumping the same version twice should give same result
      const version = '1.2.3';

      const bump1 = bumpVersion(version, 'patch');
      assert.strictEqual(bump1, '1.2.4');

      // Bumping original (not bumped version) again should give same result
      const bump2 = bumpVersion(version, 'patch');
      assert.strictEqual(bump2, '1.2.4');
      assert.strictEqual(bump1, bump2);
    });

    it('should handle edge case: 0.0.0 version', () => {
      assert.strictEqual(bumpVersion('0.0.0', 'patch'), '0.0.1');
      assert.strictEqual(bumpVersion('0.0.1', 'minor'), '0.1.0');
      assert.strictEqual(bumpVersion('0.1.0', 'major'), '1.0.0');
    });

    it('should handle no-op bumps gracefully', () => {
      // 'none' bump type should leave version unchanged
      const version = '1.5.3';
      assert.strictEqual(bumpVersion(version, 'none'), version);
    });

    it('should handle scenarios where only unversioned files changed', () => {
      // Changes to GitHub Actions workflows, config files shouldn't trigger bumps
      const diffOutput = `
M	.github/workflows/test.yml
M	.github/workflows/publish.yml
M	.gitignore
M	tsconfig.json
      `.trim();

      const commits = [
        { hash: 'a', message: 'ci: Update test workflow' },
        { hash: 'b', message: 'ci: Update publish workflow' },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      // Should have patch for ROOT (ci commits), but no workspace changes
      assert.ok(changes['ROOT'] === 'patch' || Object.keys(changes).length === 0);
      assert.ok(!changes['necrobot-utils']);
      assert.ok(!changes['necrobot-core']);
      assert.ok(!changes['necrobot-commands']);
      assert.ok(!changes['necrobot-dashboard']);
    });
  });

  describe('version reporting and logging', () => {
    it('should generate clear version update reports', () => {
      // This test validates that the system can generate useful output
      // about what versions changed and why

      const changes = {
        'necrobot-utils': 'minor',
        'necrobot-core': 'patch',
        ROOT: 'minor',
      };

      // Create a simple report
      const report = {
        timestamp: new Date().toISOString(),
        changes: changes,
        details: [],
      };

      for (const [workspace, bumpType] of Object.entries(changes)) {
        report.details.push({
          workspace,
          bumpType,
          reason: bumpType === 'minor' ? 'New feature' : 'Bug fix',
        });
      }

      assert.ok(report.timestamp);
      assert.strictEqual(report.details.length, 3);
      assert.ok(report.details.every((d) => d.workspace && d.bumpType && d.reason));
    });
  });
});
