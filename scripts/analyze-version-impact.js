#!/usr/bin/env node

/**
 * Analyze Version Impact (Workspace-Independent)
 *
 * This script analyzes git commits and determines workspace-independent version bumps.
 * Each workspace versions based on its own changes, maintaining dependencies:
 *   - necrobot-utils (no dependencies)
 *   - necrobot-core (depends on necrobot-utils)
 *   - necrobot-commands (depends on necrobot-core and necrobot-utils)
 *   - necrobot-dashboard (depends on necrobot-utils)
 *
 * Usage: node scripts/analyze-version-impact.js [lastTag]
 * Example: node scripts/analyze-version-impact.js v0.2.1
 *
 * REPLACED: Old monorepo versioning logic is now replaced with workspace-independent system.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const detectWorkspaceChangesModule = require('./detect-workspace-changes');
const { detectWorkspaceChanges } = detectWorkspaceChangesModule;

class VersionImpactAnalyzer {
  constructor(lastTag) {
    this.lastTag = lastTag;
    this.commits = [];
    this.workspaceChanges = {};
    this.dependencies = {
      'necrobot-utils': [],
      'necrobot-core': ['necrobot-utils'],
      'necrobot-commands': ['necrobot-core', 'necrobot-utils'],
      'necrobot-dashboard': ['necrobot-utils'],
    };
  }

  /**
   * Run git command and return output
   */
  execGit(cmd) {
    try {
      return execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (error) {
      console.error(`Git command failed: ${cmd}`);
      return '';
    }
  }

  /**
   * Get all commits since last tag
   */
  getCommits() {
    const range = this.lastTag ? `${this.lastTag}..HEAD` : 'HEAD';
    const output = this.execGit(`git log ${range} --pretty=format:"%H|%s|%b"`);

    if (!output) return [];

    return output
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.split('|');
        const hash = (parts[0] || '').trim();
        const subject = (parts[1] || '').trim();
        const body = (parts[2] || '').trim();
        return { hash, subject, body };
      });
  }

  /**
   * Parse conventional commit format
   */
  parseCommit(commit) {
    const match = commit.subject.match(/^(\w+)(\(.+\))?!?:\s(.+)/);

    if (!match) {
      return { type: 'other', scope: null, breaking: false, description: commit.subject };
    }

    const [, type, scope, description] = match;
    const breaking = commit.subject.includes('!:') || commit.body.includes('BREAKING CHANGE:');

    return {
      type: type.toLowerCase(),
      scope: scope ? scope.slice(1, -1) : null,
      breaking,
      description,
    };
  }

  /**
   * Analyze workspace changes using new system
   */
  analyzeWorkspaceChanges() {
    // Determine git range to analyze
    let range;
    if (!this.lastTag) {
      // No tag provided, use origin/main..HEAD (local uncommitted)
      range = 'origin/main..HEAD';
    } else if (this.lastTag.includes('..')) {
      // User provided a range directly (e.g., HEAD~3..HEAD)
      range = this.lastTag;
    } else {
      // User provided a tag name (e.g., v0.2.1)
      range = `${this.lastTag}..HEAD`;
    }

    // Get git diff
    let diffOutput = this.execGit(`git diff --name-status ${range}`);

    // If no diff found (probably no commits), return empty
    if (!diffOutput) {
      console.log('ℹ️  No changes detected');
      return {};
    }

    // Get commit messages in the format expected by detectWorkspaceChanges
    let logOutput = this.execGit(`git log ${range} --pretty=format:"%H%n%s%n%b%n---END---"`);
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

    // Use new workspace detection system
    this.workspaceChanges = detectWorkspaceChanges(diffOutput, commits);
    return this.workspaceChanges;
  }

  /**
   * Apply dependency propagation: if a workspace changes, dependents should be aware
   */
  propagateDependencies() {
    const propagated = {};

    Object.assign(propagated, this.workspaceChanges);

    // If a workspace changed, mark its dependents with at least a patch bump
    for (const [workspace, bumpType] of Object.entries(this.workspaceChanges)) {
      if (bumpType !== 'none') {
        // Find all workspaces that depend on this one
        for (const [dependent, deps] of Object.entries(this.dependencies)) {
          if (deps.includes(workspace) && propagated[dependent] === undefined) {
            // Mark dependent for patch bump (dependency changed)
            propagated[dependent] = 'patch';
          }
        }
      }
    }

    return propagated;
  }

  /**
   * Generate workspace-aware analysis report
   */
  generateReport(currentVersion) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     Workspace-Independent Version Impact Analysis           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Root Version: ${currentVersion}`);
    console.log(`📍 Analyzing from: ${this.lastTag || 'initial commit'}\n`);

    // Analyze changes
    const changes = this.analyzeWorkspaceChanges();

    if (!changes || Object.keys(changes).length === 0) {
      console.log('⏭️  No changes detected - no version bumps needed\n');
      return null;
    }

    // Apply dependency propagation
    const propagated = this.propagateDependencies();

    // Report workspace changes
    console.log('📦 Workspace Version Bumps:');
    Object.entries(propagated).forEach(([workspace, bumpType]) => {
      if (bumpType !== 'none') {
        const deps = this.dependencies[workspace] || [];
        const depsStr = deps.length > 0 ? ` (depends on: ${deps.join(', ')})` : '';
        console.log(`  • ${workspace}: ${bumpType.toUpperCase()}${depsStr}`);
      }
    });
    console.log('');

    // Determine highest bump for root version
    const bumpPriority = { major: 3, minor: 2, patch: 1, none: 0 };
    let highestBump = 'none';

    Object.values(propagated).forEach((bumpType) => {
      if ((bumpPriority[bumpType] || 0) > (bumpPriority[highestBump] || 0)) {
        highestBump = bumpType;
      }
    });

    if (highestBump !== 'none') {
      // Calculate new root version
      const [major, minor, patch] = currentVersion.split('.').map(Number);
      let newVersion;

      if (highestBump === 'major') {
        newVersion = `${major + 1}.0.0`;
      } else if (highestBump === 'minor') {
        newVersion = `${major}.${minor + 1}.0`;
      } else if (highestBump === 'patch') {
        newVersion = `${major}.${minor}.${patch + 1}`;
      }

      console.log(`✅ Root Version Bump: ${currentVersion} → ${newVersion}`);
      console.log(`   Trigger: Highest workspace bump is ${highestBump.toUpperCase()}\n`);

      // Suggest command for applying bumps
      const rangeArg = this.lastTag || 'origin/main..HEAD';
      console.log(`📌 To apply version bumps, run:`);
      console.log(`   node scripts/sync-package-versions.js "${rangeArg}"\n`);

      return newVersion;
    } else {
      console.log('⏭️  Root version bump not needed (only docs/chore changes)\n');
      return null;
    }
  }

  /**
   * Run full analysis
   */
  analyze(currentVersion) {
    return this.generateReport(currentVersion);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const lastTag = args[0] || null;

  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const currentVersion = packageJson.version;

    const analyzer = new VersionImpactAnalyzer(lastTag);
    const recommendation = analyzer.analyze(currentVersion);

    if (recommendation) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(2);
  }
}

module.exports = VersionImpactAnalyzer;
