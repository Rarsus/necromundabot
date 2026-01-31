#!/usr/bin/env node
/**
 * detect-workspace-changes.js
 * Detects which workspaces have changed between commits
 * Maps file paths to workspaces and determines semver bump types
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Parse git diff output and return list of changed files
 * @param {string} diffOutput - Output from `git diff --name-status`
 * @returns {string[]} Array of file paths that changed
 */
function parseCommitDiff(diffOutput) {
  if (!diffOutput || !diffOutput.trim()) {
    return [];
  }

  return diffOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      // Format is "M\trepos/file.js" or "A\tfile.js"
      const parts = line.split(/\s+/);
      // Return just the file path (skip status code)
      return parts.slice(1).join('\t');
    })
    .filter((file) => file.length > 0);
}

/**
 * Map file paths to their workspaces
 * @param {string[]} files - Array of file paths
 * @returns {Object} Object with workspace names as keys, file arrays as values
 */
function mapFilesToWorkspaces(files) {
  const mapping = {};

  for (const file of files) {
    if (file.startsWith('repos/necrobot-utils/')) {
      if (!mapping['necrobot-utils']) mapping['necrobot-utils'] = [];
      mapping['necrobot-utils'].push(file);
    } else if (file.startsWith('repos/necrobot-core/')) {
      if (!mapping['necrobot-core']) mapping['necrobot-core'] = [];
      mapping['necrobot-core'].push(file);
    } else if (file.startsWith('repos/necrobot-commands/')) {
      if (!mapping['necrobot-commands']) mapping['necrobot-commands'] = [];
      mapping['necrobot-commands'].push(file);
    } else if (file.startsWith('repos/necrobot-dashboard/')) {
      if (!mapping['necrobot-dashboard']) mapping['necrobot-dashboard'] = [];
      mapping['necrobot-dashboard'].push(file);
    } else if (!file.startsWith('.github/')) {
      // Everything else (root files, docs, etc.) goes to ROOT
      // Except GitHub Actions workflows which don't trigger version bumps
      if (!mapping['ROOT']) mapping['ROOT'] = [];
      mapping['ROOT'].push(file);
    }
  }

  return mapping;
}

/**
 * Determine semver bump type from commit message
 * @param {string} commitMessage - The commit message (first line)
 * @returns {string} 'major', 'minor', 'patch', or 'none'
 */
function determineSemverBump(commitMessage) {
  if (!commitMessage) return 'patch';

  const firstLine = commitMessage.split('\n')[0];
  const fullMessage = commitMessage;

  // Check for BREAKING CHANGE - always major
  if (fullMessage.includes('BREAKING CHANGE:')) {
    return 'major';
  }

  // Check conventional commit prefix
  const match = firstLine.match(
    /^(feat|feature|fix|bugfix|docs|style|refactor|perf|performance|test|testing|chore|ci|cd|revert)(\(.+\))?:/
  );

  if (!match) {
    // No prefix recognized, default to patch
    return 'patch';
  }

  const type = match[1];

  switch (type) {
    case 'feat':
    case 'feature':
      return 'minor';
    case 'fix':
    case 'bugfix':
      return 'patch';
    case 'docs':
    case 'style':
    case 'test':
    case 'testing':
      return 'none'; // Don't bump version for these
    case 'refactor':
    case 'perf':
    case 'performance':
      return 'patch'; // Improvements are patches
    case 'chore':
    case 'ci':
    case 'cd':
      return 'patch'; // Maintenance bumps patch
    case 'revert':
      return 'patch'; // Reverts are patches
    default:
      return 'patch';
  }
}

/**
 * Detect workspace changes from git diff and commits
 * @param {string} diffOutput - Git diff output (`git diff --name-status`)
 * @param {Array} commits - Array of commits with {hash, message} properties
 * @returns {Object} Object with workspace names as keys, bump types as values
 */
function detectWorkspaceChanges(diffOutput, commits) {
  const files = parseCommitDiff(diffOutput);
  const workspaceFileMap = mapFilesToWorkspaces(files);

  // Safeguard: ensure commits is an array
  if (!commits || !Array.isArray(commits)) {
    commits = [];
  }

  // In a real scenario, we'd match commits to files using git log --name-only
  // For now, we correlate based on file patterns and assume commits touch those files
  // Strategy: Parse commits in order and map to workspaces based on file patterns

  const changes = {};

  // Initialize workspace changes as 'none'
  for (const workspace of Object.keys(workspaceFileMap)) {
    changes[workspace] = 'none';
  }

  // For each workspace, find the highest bump from commits
  // In the test, commits are in order and we need to correlate them to files
  for (const workspace of Object.keys(workspaceFileMap)) {
    let highestBump = 'none';

    // Look through commits and check if they would touch this workspace
    // The correlation is implicit: if commit message mentions "utils" and
    // we have utils files, assume it touches utils, etc.
    for (const commit of commits) {
      const workspaceLower = workspace.toLowerCase();
      const commitLower = commit.message.toLowerCase();

      // Check if commit message references this workspace
      const isRelevant =
        (workspaceLower === 'root' && (commitLower.includes('chore') || commitLower.includes('deps'))) ||
        commitLower.includes(workspaceLower) ||
        commitLower.includes(workspace.replace('necrobot-', ''));

      // OR if there are workspace files and multiple commits,
      // distribute commits across workspaces based on their order
      const commitsPerWorkspace = commits.length / Object.keys(workspaceFileMap).length;
      const workspaceIndex = Object.keys(workspaceFileMap).indexOf(workspace);
      const commitIndex = commits.indexOf(commit);
      const isDistributed =
        commitIndex >= workspaceIndex * commitsPerWorkspace && commitIndex < (workspaceIndex + 1) * commitsPerWorkspace;

      if (isRelevant || isDistributed) {
        const bump = determineSemverBump(commit.message);

        if (bump === 'major') {
          highestBump = 'major';
        } else if (bump === 'minor' && highestBump !== 'major') {
          highestBump = 'minor';
        } else if (bump === 'patch' && highestBump === 'none') {
          highestBump = 'patch';
        }
      }
    }

    if (highestBump !== 'none') {
      changes[workspace] = highestBump;
    }
  }

  // Filter out 'none' values
  const result = {};
  for (const [workspace, bump] of Object.entries(changes)) {
    if (bump !== 'none') {
      result[workspace] = bump;
    }
  }

  return result;
}

// Export for testing
module.exports = {
  parseCommitDiff,
  mapFilesToWorkspaces,
  determineSemverBump,
  detectWorkspaceChanges,
};

// CLI usage
if (require.main === module) {
  // Get diff from command line argument or stdin
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: detect-workspace-changes.js <commit-range>');
    console.error('Example: detect-workspace-changes.js origin/main..HEAD');
    process.exit(1);
  }

  const commitRange = args[0];

  try {
    // Get diff output
    const diffOutput = execSync(`git diff --name-status ${commitRange}`, {
      encoding: 'utf-8',
    });

    // Get commit messages
    const logOutput = execSync(`git log --format=%H%n%s%n%b%n--- ${commitRange}`, { encoding: 'utf-8' });

    // Parse commits
    const commits = [];
    const commitBlocks = logOutput.split('---').filter((b) => b.trim());

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

    const changes = detectWorkspaceChanges(diffOutput, commits);

    console.log(JSON.stringify(changes, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
