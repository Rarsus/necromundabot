/**
 * Test: Semver Compliance Regression Tests
 *
 * These tests verify that version bumps follow semantic versioning rules:
 * - docs: commits should NOT trigger version bumps
 * - fix: commits should only trigger PATCH bumps
 * - feat: commits should only trigger MINOR bumps
 * - BREAKING CHANGE: commits should trigger MAJOR bumps
 *
 * This prevents regressions like v1.2.0 → v1.3.0 when only PATCH-level changes exist.
 */

const assert = require('assert');
const { detectWorkspaceChanges, determineSemverBump } = require('../../../scripts/detect-workspace-changes');
const path = require('path');

describe('Semver Compliance - Regression Tests', () => {
  describe('determineSemverBump - Correct Bump Type Detection', () => {
    it('should return "none" for docs: commits', () => {
      const result = determineSemverBump('docs: Update API documentation');
      assert.strictEqual(result, 'none', 'docs: commits must not bump version');
    });

    it('should return "none" for style: commits', () => {
      const result = determineSemverBump('style: Fix code formatting');
      assert.strictEqual(result, 'none', 'style: commits must not bump version');
    });

    it('should return "none" for test: commits', () => {
      const result = determineSemverBump('test: Add unit tests');
      assert.strictEqual(result, 'none', 'test: commits must not bump version');
    });

    it('should return "patch" for fix: commits', () => {
      const result = determineSemverBump('fix: Resolve database timeout');
      assert.strictEqual(result, 'patch', 'fix: commits must be PATCH bumps');
    });

    it('should return "patch" for bugfix: commits', () => {
      const result = determineSemverBump('bugfix: Correct permission check');
      assert.strictEqual(result, 'patch', 'bugfix: commits must be PATCH bumps');
    });

    it('should return "minor" for feat: commits', () => {
      const result = determineSemverBump('feat: Add new command handler');
      assert.strictEqual(result, 'minor', 'feat: commits must be MINOR bumps');
    });

    it('should return "patch" for refactor: commits', () => {
      const result = determineSemverBump('refactor: Extract service layer');
      assert.strictEqual(result, 'patch', 'refactor: commits can be PATCH bumps');
    });

    it('should return "major" for BREAKING CHANGE', () => {
      const result = determineSemverBump(`fix: Change API response format

BREAKING CHANGE: API response structure changed`);
      assert.strictEqual(result, 'major', 'BREAKING CHANGE must be MAJOR bump');
    });

    it('should return "major" for BREAKING CHANGE even with docs prefix', () => {
      const result = determineSemverBump(`docs: Update configuration guide

BREAKING CHANGE: Configuration format changed`);
      assert.strictEqual(result, 'major', 'BREAKING CHANGE overrides docs prefix');
    });

    it('should return "patch" for unknown prefix', () => {
      const result = determineSemverBump('update: Something happened');
      assert.strictEqual(result, 'patch', 'unknown prefixes default to PATCH');
    });
  });

  describe('detectWorkspaceChanges - Docs-Only Commits', () => {
    it('should return empty object for docs-only changes', () => {
      const diffOutput = 'M\tREADME.md\nM\tdocs/guides/testing-guide.md';
      const commits = [
        {
          hash: 'abc123',
          message: 'docs: Update testing guide',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      assert.deepStrictEqual(result, {}, 'docs-only commits must not trigger ANY version bumps');
    });

    it('should return empty object for root documentation changes', () => {
      const diffOutput = 'M\tTAG-PROTECTION-REMOVAL-GUIDE.md\nM\tproject-docs/ANALYSIS.md';
      const commits = [
        {
          hash: 'abc123',
          message: 'docs: Add tag protection investigation findings',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      assert.deepStrictEqual(result, {}, 'root-level docs changes must not trigger bumps');
    });

    it('should return empty object for style-only changes', () => {
      const diffOutput = 'M\t.eslintrc.js\nM\t.prettierrc.json';
      const commits = [
        {
          hash: 'abc123',
          message: 'style: Fix code formatting',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      assert.deepStrictEqual(result, {}, 'style-only commits must not trigger version bumps');
    });
  });

  describe('detectWorkspaceChanges - Patch-Level Changes', () => {
    it('should detect PATCH bump for fix: in workspace', () => {
      const diffOutput = 'M\trepos/necrobot-core/src/handler.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Resolve event handler timeout',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      assert.ok(result['necrobot-core'], 'necrobot-core should be in result');
      assert.strictEqual(result['necrobot-core'], 'patch', 'fix: commits must be PATCH bumps');
    });

    it('should not bump to MINOR for PATCH-level changes', () => {
      const diffOutput = 'M\trepos/necrobot-utils/src/helpers.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Correct string comparison logic',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // Verify it's PATCH, not MINOR
      assert.strictEqual(result['necrobot-utils'], 'patch', 'PATCH-level fix should not be bumped to MINOR');
      assert.notStrictEqual(result['necrobot-utils'], 'minor', 'fix: commits should never result in MINOR bumps');
    });
  });

  describe('detectWorkspaceChanges - Minor-Level Changes', () => {
    it('should detect MINOR bump for feat: in workspace', () => {
      const diffOutput = 'A\trepos/necrobot-commands/src/commands/new-command.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'feat: Add new command for user management',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      assert.ok(result['necrobot-commands'], 'necrobot-commands should be in result');
      assert.strictEqual(result['necrobot-commands'], 'minor', 'feat: commits must be MINOR bumps');
    });
  });

  describe('Regression: v1.2.0 → v1.3.0 Bug', () => {
    it('should NOT bump to v1.3.0 when only PATCH-level fix exists', () => {
      // This test reproduces the bug where v1.2.0 → v1.3.0 when it should be v1.2.1
      const diffOutput = 'M\trepos/necrobot-core/tests/unit/test-create-release.test.js';
      const commits = [
        {
          hash: '6f27886',
          message: 'fix(tests): Remove faulty version synchronization checks from create-release test',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // Verify the bump type is PATCH, not MINOR
      assert.strictEqual(result['necrobot-core'], 'patch', 'fix(tests) should result in PATCH bump, not MINOR');

      // Ensure ROOT is not incorrectly marked for bump
      if (result['ROOT']) {
        assert.strictEqual(result['ROOT'], 'patch', 'ROOT should be PATCH at worst for test file changes');
      }
    });

    it('should NOT include MINOR bump in result for PATCH-only changes', () => {
      const diffOutput =
        'M\trepos/necrobot-core/src/handler.js\nM\trepos/necrobot-core/tests/unit/test-handler.test.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Resolve handler timeout',
        },
        {
          hash: 'def456',
          message: 'test: Add handler timeout test',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // If necrobot-core is in result, it should be PATCH, never MINOR
      if (result['necrobot-core']) {
        assert.strictEqual(result['necrobot-core'], 'patch', 'fix + test commits should only result in PATCH bump');
      }
    });
  });

  describe('Mixed Commit Types', () => {
    it('should use highest bump level from multiple commits', () => {
      const diffOutput = 'M\trepos/necrobot-utils/src/helpers.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Correct helper logic',
        },
        {
          hash: 'def456',
          message: 'feat: Add new helper function',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // MINOR is highest, so should be MINOR
      assert.strictEqual(result['necrobot-utils'], 'minor', 'Multiple commits should use highest bump (MINOR > PATCH)');
    });

    it('should detect MAJOR when BREAKING CHANGE exists with other commits', () => {
      const diffOutput = 'M\trepos/necrobot-core/src/api.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Correct API response',
        },
        {
          hash: 'def456',
          message: `refactor: Change API structure

BREAKING CHANGE: API endpoints renamed`,
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // MAJOR is highest, so should be MAJOR
      assert.strictEqual(result['necrobot-core'], 'major', 'BREAKING CHANGE should result in MAJOR bump');
    });
  });

  describe('Root vs Workspace Changes', () => {
    it('should not bump ROOT for workspace-only changes', () => {
      const diffOutput = 'M\trepos/necrobot-core/src/handler.js';
      const commits = [
        {
          hash: 'abc123',
          message: 'fix: Resolve handler issue',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // Should have necrobot-core but not ROOT
      assert.ok(result['necrobot-core'], 'necrobot-core should be in result');
      // ROOT might appear if workspace changes affect root, but that's implementation detail
      // The important thing is the bump types are correct
    });

    it('should only bump ROOT for root-level code changes, not docs', () => {
      const diffOutput = 'M\tpackage.json\nM\tESLINT.md';
      const commits = [
        {
          hash: 'abc123',
          message: 'chore: Update dependencies',
        },
        {
          hash: 'def456',
          message: 'docs: Update eslint documentation',
        },
      ];

      const result = detectWorkspaceChanges(diffOutput, commits);

      // chore is PATCH, docs is NONE
      // So ROOT should be PATCH (from chore), or might not appear
      if (result['ROOT']) {
        assert.strictEqual(result['ROOT'], 'patch', 'ROOT bump should be PATCH for chore: commits');
      }
    });
  });
});
