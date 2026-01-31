#!/usr/bin/env node

/**
 * Generate CHANGELOG.md per workspace
 * Reads git history, extracts conventional commits, generates per-workspace changelogs
 * Includes dependency information and cross-references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACES = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];
const WORKSPACE_DEPENDENCIES = {
  'necrobot-utils': [],
  'necrobot-core': ['necrobot-utils'],
  'necrobot-commands': ['necrobot-core', 'necrobot-utils'],
  'necrobot-dashboard': ['necrobot-utils'],
};

const COMMIT_TYPES = {
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance Improvements',
  docs: 'Documentation',
  style: 'Code Style',
  refactor: 'Refactoring',
  test: 'Tests',
  chore: 'Chores',
  ci: 'CI/CD',
};

/**
 * Parse conventional commit message
 */
function parseCommit(message) {
  const match = message.match(/^(\w+)(?:\((.+)\))?!?: (.+)/);
  if (!match) return null;

  const [, type, scope, subject] = match;
  const isBreaking = message.includes('BREAKING CHANGE');

  return {
    type,
    scope,
    subject,
    isBreaking,
    fullMessage: message,
  };
}

/**
 * Get commits for a specific workspace since last tag
 */
function getWorkspaceCommits(workspace, lastTag = '') {
  try {
    const workspace_path = `repos/${workspace}`;

    // Get commits that touched this workspace
    let command = `git log --oneline --format="%H|%s|%b" -- ${workspace_path}`;
    if (lastTag) {
      command += ` ${lastTag}..HEAD`;
    }

    const output = execSync(command, { encoding: 'utf-8' });
    const lines = output
      .trim()
      .split('\n')
      .filter((l) => l);

    const commits = lines
      .map((line) => {
        const [hash, subject, body] = line.split('|');
        const parsed = parseCommit(subject);
        if (!parsed) return null;

        return {
          hash: hash.substring(0, 7),
          subject: parsed.subject,
          type: parsed.type,
          scope: parsed.scope,
          isBreaking: parsed.isBreaking,
          body: body || '',
          fullMessage: subject,
        };
      })
      .filter((c) => c);

    return commits;
  } catch (err) {
    return [];
  }
}

/**
 * Get current version from workspace package.json
 */
function getWorkspaceVersion(workspace) {
  try {
    const pkgPath = path.join(__dirname, `../repos/${workspace}/package.json`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

/**
 * Get dependency versions for a workspace
 */
function getDependencyVersions(workspace) {
  try {
    const pkgPath = path.join(__dirname, `../repos/${workspace}/package.json`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    const deps = {};
    WORKSPACE_DEPENDENCIES[workspace].forEach((dep) => {
      deps[dep] = pkg.dependencies?.[dep] || 'N/A';
    });
    return deps;
  } catch {
    return {};
  }
}

/**
 * Format commits by type
 */
function formatCommitsByType(commits) {
  const grouped = {};

  commits.forEach((commit) => {
    const typeLabel = COMMIT_TYPES[commit.type] || commit.type;
    if (!grouped[typeLabel]) {
      grouped[typeLabel] = [];
    }
    grouped[typeLabel].push(commit);
  });

  return grouped;
}

/**
 * Generate changelog entry
 */
function generateChangelogEntry(workspace, version, commits, timestamp) {
  let content = `## [${version}] - ${timestamp}\n\n`;

  if (commits.length === 0) {
    content += '_No changes_\n\n';
    return content;
  }

  // Check for breaking changes
  const breaking = commits.filter((c) => c.isBreaking);
  if (breaking.length > 0) {
    content += '### ⚠️ BREAKING CHANGES\n\n';
    breaking.forEach((commit) => {
      content += `- **${commit.subject}** (${commit.hash})\n`;
    });
    content += '\n';
  }

  // Group by type
  const grouped = formatCommitsByType(commits);

  Object.entries(grouped).forEach(([type, typeCommits]) => {
    content += `### ${type}\n\n`;
    typeCommits.forEach((commit) => {
      const scope = commit.scope ? `**${commit.scope}**: ` : '';
      content += `- ${scope}${commit.subject} ([${commit.hash}](https://github.com/Rarsus/necromundabot/commit/${commit.hash}))\n`;
    });
    content += '\n';
  });

  return content;
}

/**
 * Generate full changelog for workspace
 */
function generateWorkspaceChangelog(workspace) {
  const version = getWorkspaceVersion(workspace);
  const lastTag = getLastTag(workspace);
  const commits = getWorkspaceCommits(workspace, lastTag);

  const dependencies = getDependencyVersions(workspace);
  const timestamp = new Date().toISOString().split('T')[0];

  let header = `# Changelog - ${workspace}\n\n`;
  header += `**Workspace**: \`${workspace}\`\n`;
  header += `**Current Version**: \`${version}\`\n\n`;

  if (Object.keys(dependencies).length > 0) {
    header += `### Dependencies\n\n`;
    Object.entries(dependencies).forEach(([dep, ver]) => {
      header += `- \`${dep}\`: ${ver}\n`;
    });
    header += '\n';
  }

  header += `---\n\n`;

  const entry = generateChangelogEntry(workspace, version, commits, timestamp);

  return { header, entry, commits };
}

/**
 * Get last tag for workspace
 */
function getLastTag(workspace) {
  try {
    const output = execSync(`git tag -l "${workspace}-v*" --sort=-version:refname | head -1`, {
      encoding: 'utf-8',
    }).trim();
    return output || '';
  } catch {
    return '';
  }
}

/**
 * Write changelog file
 */
function writeChangelog(workspace, content) {
  const changelogPath = path.join(__dirname, `../repos/${workspace}/CHANGELOG.md`);

  try {
    let existing = '';
    if (fs.existsSync(changelogPath)) {
      existing = fs.readFileSync(changelogPath, 'utf-8');
    }

    // Prepend new content to existing (keep history)
    const full = content + existing;
    fs.writeFileSync(changelogPath, full);
    console.log(`✅ Generated CHANGELOG.md for ${workspace}`);
  } catch (err) {
    console.error(`❌ Failed to write changelog for ${workspace}:`, err.message);
  }
}

/**
 * Generate changelogs for all workspaces
 */
function main() {
  console.log('🔄 Generating changelogs for all workspaces...\n');

  WORKSPACES.forEach((workspace) => {
    try {
      console.log(`📝 Processing ${workspace}...`);
      const { header, entry } = generateWorkspaceChangelog(workspace);
      const content = header + entry;
      writeChangelog(workspace, content);
    } catch (err) {
      console.error(`❌ Error processing ${workspace}:`, err.message);
    }
  });

  console.log('\n✅ Changelog generation complete!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  generateWorkspaceChangelog,
  getWorkspaceCommits,
  parseCommit,
  formatCommitsByType,
};
