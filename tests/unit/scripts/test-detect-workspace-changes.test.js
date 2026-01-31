/**
 * Test: Detect Workspace Changes
 * Detects which workspaces have changed between commits
 * Maps file paths to workspaces and determines semver bump types
 */

const assert = require('assert');
const {
  parseCommitDiff,
  mapFilesToWorkspaces,
  determineSemverBump,
  detectWorkspaceChanges,
} = require('../../../scripts/detect-workspace-changes');

describe('detectWorkspaceChanges - TDD Tests', () => {
  describe('parseCommitDiff()', () => {
    it('should parse git diff output and return file changes', () => {
      const diffOutput = `
M	package.json
A	repos/necrobot-utils/src/index.js
M	repos/necrobot-core/package.json
D	repos/necrobot-commands/old-file.js
M	docs/README.md
      `.trim();

      const files = parseCommitDiff(diffOutput);

      assert.strictEqual(files.length, 5);
      assert.ok(files.includes('package.json'));
      assert.ok(files.includes('repos/necrobot-utils/src/index.js'));
      assert.ok(files.includes('repos/necrobot-core/package.json'));
    });

    it('should handle empty diff output', () => {
      const files = parseCommitDiff('');
      assert.deepStrictEqual(files, []);
    });

    it('should ignore whitespace variations', () => {
      const diffOutput = `M  	package.json
A	repos/necrobot-utils/src/index.js`;

      const files = parseCommitDiff(diffOutput);
      assert.strictEqual(files.length, 2);
    });
  });

  describe('mapFilesToWorkspaces()', () => {
    it('should map repos/necrobot-utils files to necrobot-utils workspace', () => {
      const files = ['repos/necrobot-utils/src/index.js', 'repos/necrobot-utils/package.json'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['necrobot-utils']);
      assert.strictEqual(mapping['necrobot-utils'].length, 2);
    });

    it('should map repos/necrobot-core files to necrobot-core workspace', () => {
      const files = ['repos/necrobot-core/src/bot.js'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['necrobot-core']);
      assert.strictEqual(mapping['necrobot-core'].length, 1);
    });

    it('should map repos/necrobot-commands files to necrobot-commands workspace', () => {
      const files = ['repos/necrobot-commands/src/commands/misc/ping.js'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['necrobot-commands']);
    });

    it('should map repos/necrobot-dashboard files to necrobot-dashboard workspace', () => {
      const files = ['repos/necrobot-dashboard/src/pages/index.tsx'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['necrobot-dashboard']);
    });

    it('should map root package.json to ROOT workspace', () => {
      const files = ['package.json', 'package-lock.json'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['ROOT']);
      assert.strictEqual(mapping['ROOT'].length, 2);
    });

    it('should map docs and config files to ROOT workspace', () => {
      const files = ['docs/guides/testing-guide.md', 'eslint.config.js', 'jest.config.js'];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['ROOT']);
      assert.strictEqual(mapping['ROOT'].length, 3);
    });

    it('should handle multiple workspaces in single file list', () => {
      const files = [
        'package.json',
        'repos/necrobot-utils/src/index.js',
        'repos/necrobot-core/src/bot.js',
        'docs/README.md',
      ];

      const mapping = mapFilesToWorkspaces(files);

      assert.ok(mapping['ROOT']);
      assert.ok(mapping['necrobot-utils']);
      assert.ok(mapping['necrobot-core']);
      assert.strictEqual(Object.keys(mapping).length, 3);
    });

    it('should return empty object for unrelated files', () => {
      const files = ['.github/workflows/test.yml'];

      const mapping = mapFilesToWorkspaces(files);

      // GitHub workflows don't change workspace versions
      assert.deepStrictEqual(mapping, {});
    });
  });

  describe('determineSemverBump()', () => {
    it('should detect MAJOR bump for breaking changes (BREAKING CHANGE:)', () => {
      const commitMessage = `refactor: Change API signature

BREAKING CHANGE: Old API is no longer supported`;

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'major');
    });

    it('should detect MINOR bump for feature commits (feat:)', () => {
      const commitMessage = 'feat: Add new command handler';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'minor');
    });

    it('should detect PATCH bump for fix commits (fix:)', () => {
      const commitMessage = 'fix: Resolve database timeout issue';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'patch');
    });

    it('should detect PATCH bump for bugfix: prefix', () => {
      const commitMessage = 'bugfix: Correct permission check';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'patch');
    });

    it('should not bump for docs: commits', () => {
      const commitMessage = 'docs: Update API documentation';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'none');
    });

    it('should not bump for style: commits', () => {
      const commitMessage = 'style: Fix code formatting';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'none');
    });

    it('should not bump for test: commits', () => {
      const commitMessage = 'test: Add unit tests for service';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'none');
    });

    it('should detect MAJOR if BREAKING CHANGE even with docs/style prefix', () => {
      const commitMessage = `docs: Update README

BREAKING CHANGE: Configuration format changed`;

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'major');
    });

    it('should return patch for unknown prefix', () => {
      const commitMessage = 'update: Something happened';

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'patch');
    });

    it('should handle multi-line commit messages', () => {
      const commitMessage = `feat: Add new feature

This is a longer description
explaining the feature in detail`;

      const bump = determineSemverBump(commitMessage);

      assert.strictEqual(bump, 'minor');
    });
  });

  describe('detectWorkspaceChanges()', () => {
    it('should return workspace→bump mapping from git diff and commits', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/index.js
M	repos/necrobot-core/src/bot.js
M	package.json
      `.trim();

      const commits = [
        { hash: 'abc123', message: 'feat: Add new utility function' },
        { hash: 'def456', message: 'fix: Resolve bot startup issue' },
        { hash: 'ghi789', message: 'chore: Update dependencies' },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      assert.ok(changes['necrobot-utils']);
      assert.ok(changes['necrobot-core']);
      assert.ok(changes['ROOT']);
    });

    it('should prioritize highest semver bump per workspace', () => {
      // If a workspace has both feat and fix commits, use minor (feat/minor > fix/patch)
      const diffOutput = `
M	repos/necrobot-utils/src/index.js
M	repos/necrobot-utils/test/index.test.js
      `.trim();

      const commits = [
        { hash: 'abc123', message: 'feat: Add new utility' }, // minor
        { hash: 'def456', message: 'fix: Bug fix' }, // patch
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      // Should use 'minor' since that's the higher bump
      assert.strictEqual(changes['necrobot-utils'], 'minor');
    });

    it('should detect multiple workspaces with different bumps', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/index.js
M	repos/necrobot-core/src/bot.js
M	repos/necrobot-commands/src/commands/ping.js
M	repos/necrobot-dashboard/src/pages/index.tsx
      `.trim();

      const commits = [
        { hash: 'abc123', message: 'feat: New utils function' }, // utils: minor
        { hash: 'def456', message: 'fix: Core bug' }, // core: patch
        { hash: 'ghi789', message: 'feat: New command' }, // commands: minor
        { hash: 'jkl012', message: 'fix: Dashboard issue' }, // dashboard: patch
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      assert.strictEqual(changes['necrobot-utils'], 'minor');
      assert.strictEqual(changes['necrobot-core'], 'patch');
      assert.strictEqual(changes['necrobot-commands'], 'minor');
      assert.strictEqual(changes['necrobot-dashboard'], 'patch');
    });

    it('should handle BREAKING CHANGE in commit message', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/index.js
      `.trim();

      const commits = [
        {
          hash: 'abc123',
          message: `refactor: Change API

BREAKING CHANGE: Old API removed`,
        },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      assert.strictEqual(changes['necrobot-utils'], 'major');
    });

    it('should return empty object if no relevant changes', () => {
      const diffOutput = `
M	.github/workflows/test.yml
M	docs/README.md
      `.trim();

      const commits = [{ hash: 'abc123', message: 'docs: Update README' }];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      // docs: doesn't bump versions
      assert.deepStrictEqual(changes, {});
    });
  });

  describe('Integration: Full Change Detection Flow', () => {
    it('should detect workspace changes from realistic commit history', () => {
      const diffOutput = `
M	repos/necrobot-utils/src/services/DatabaseService.js
A	repos/necrobot-core/src/handlers/message.js
M	repos/necrobot-commands/src/commands/misc/ping.js
M	package.json
D	docs/old-guide.md
      `.trim();

      const commits = [
        { hash: 'abc123', message: 'feat(utils): Add timeout parameter to DatabaseService' },
        { hash: 'def456', message: 'feat(core): Add message event handler' },
        { hash: 'ghi789', message: 'fix(commands): Resolve latency calculation in ping' },
        { hash: 'jkl012', message: 'chore: Update dependencies' },
        { hash: 'mno345', message: 'docs: Remove outdated guide' },
      ];

      const changes = detectWorkspaceChanges(diffOutput, commits);

      // Should detect:
      // - necrobot-utils: minor (feat)
      // - necrobot-core: minor (feat)
      // - necrobot-commands: patch (fix)
      // - ROOT: patch (chore)
      assert.strictEqual(changes['necrobot-utils'], 'minor');
      assert.strictEqual(changes['necrobot-core'], 'minor');
      assert.strictEqual(changes['necrobot-commands'], 'patch');
      assert.strictEqual(changes['ROOT'], 'patch');
    });
  });
});
