#!/usr/bin/env node

/**
 * Generate Release Notes for GitHub Release
 * Creates formatted release notes with workspace-specific changes
 * Automatically published as GitHub Release description
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACES = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];

/**
 * Parse conventional commit
 */
function parseCommit(subject) {
  const match = subject.match(/^(\w+)(?:\((.+)\))?!?: (.+)/);
  if (!match) return null;

  const [, type, scope, message] = match;
  return { type, scope, message };
}

/**
 * Get commits for release
 */
function getReleaseCommits(fromTag = '') {
  try {
    let command = 'git log --oneline --format="%H|%s" -- repos/';
    if (fromTag) {
      command += ` ${fromTag}..HEAD`;
    }

    const output = execSync(command, { encoding: 'utf-8' });
    return output
      .trim()
      .split('\n')
      .filter((l) => l)
      .map((line) => {
        const [hash, subject] = line.split('|');
        const parsed = parseCommit(subject);
        return {
          hash: hash.substring(0, 7),
          subject,
          ...parsed,
        };
      });
  } catch {
    return [];
  }
}

/**
 * Group commits by workspace
 */
function groupByWorkspace(commits) {
  const grouped = {};

  WORKSPACES.forEach((ws) => (grouped[ws] = []));

  commits.forEach((commit) => {
    WORKSPACES.forEach((ws) => {
      // Try to detect which workspace from commit files
      if (commit.subject.includes(ws) || commit.subject.toLowerCase().includes(ws.split('-')[1])) {
        grouped[ws].push(commit);
      }
    });
  });

  return grouped;
}

/**
 * Generate release notes
 */
function generateReleaseNotes(version, commits, workspaceVersions) {
  let notes = `# Release ${version}\n\n`;

  // Summary
  notes += `## 📋 Release Summary\n\n`;
  notes += `**Total Changes**: ${commits.length} commits\n`;
  notes += `**Released**: ${new Date().toISOString().split('T')[0]}\n\n`;

  // Workspace versions
  notes += `### 📦 Package Versions\n\n`;
  Object.entries(workspaceVersions).forEach(([ws, ver]) => {
    notes += `- \`@rarsus/${ws}\`: \`${ver}\`\n`;
  });
  notes += '\n';

  // Group commits by workspace
  const grouped = groupByWorkspace(commits);

  // Features section
  const allFeatures = Object.values(grouped)
    .flat()
    .filter((c) => c.type === 'feat');

  if (allFeatures.length > 0) {
    notes += `## ✨ Features\n\n`;
    allFeatures.forEach((commit) => {
      notes += `- **${commit.message}** - ${commit.subject.substring(commit.subject.indexOf(':') + 2)}\n`;
    });
    notes += '\n';
  }

  // Bug fixes section
  const allFixes = Object.values(grouped)
    .flat()
    .filter((c) => c.type === 'fix');

  if (allFixes.length > 0) {
    notes += `## 🐛 Bug Fixes\n\n`;
    allFixes.forEach((commit) => {
      notes += `- **${commit.message}** - ${commit.subject.substring(commit.subject.indexOf(':') + 2)}\n`;
    });
    notes += '\n';
  }

  // Breaking changes
  const breaking = commits.filter((c) => c.subject.includes('BREAKING'));
  if (breaking.length > 0) {
    notes += `## ⚠️ BREAKING CHANGES\n\n`;
    breaking.forEach((commit) => {
      notes += `- **${commit.subject}**\n`;
    });
    notes += '\n';
  }

  // Workspace-specific changes
  notes += `## 📦 Changes by Workspace\n\n`;

  Object.entries(grouped).forEach(([ws, wsCommits]) => {
    if (wsCommits.length === 0) return;

    notes += `### ${ws}\n\n`;

    const features = wsCommits.filter((c) => c.type === 'feat');
    const fixes = wsCommits.filter((c) => c.type === 'fix');
    const other = wsCommits.filter((c) => !['feat', 'fix'].includes(c.type));

    if (features.length > 0) {
      notes += `**Features**:\n`;
      features.forEach((c) => (notes += `- ${c.message}\n`));
    }

    if (fixes.length > 0) {
      notes += `**Fixes**:\n`;
      fixes.forEach((c) => (notes += `- ${c.message}\n`));
    }

    if (other.length > 0) {
      notes += `**Other**:\n`;
      other.forEach((c) => (notes += `- ${c.type}: ${c.message}\n`));
    }

    notes += '\n';
  });

  // Installation instructions
  notes += `## 📥 Installation\n\n`;
  notes += '```bash\n';
  notes += 'npm install --workspace=repos/necrobot-utils\n';
  notes += 'npm install --workspace=repos/necrobot-core\n';
  notes += 'npm install --workspace=repos/necrobot-commands\n';
  notes += 'npm install --workspace=repos/necrobot-dashboard\n';
  notes += '```\n\n';

  // Upgrade guide
  notes += `## 🚀 Upgrade Guide\n\n`;
  if (breaking.length > 0) {
    notes += '**⚠️ This release contains breaking changes. Please review BREAKING CHANGES above.**\n\n';
  }
  notes += '1. Update dependencies\n';
  notes += '2. Review changelog for each workspace\n';
  notes += '3. Test in staging environment\n';
  notes += '4. Deploy to production\n\n';

  // Contributors note
  notes += `## 👥 Thanks to Contributors\n\n`;
  notes += 'View all commits: [GitHub Commits](https://github.com/Rarsus/necromundabot/commits)\n';

  return notes;
}

/**
 * Get workspace versions
 */
function getWorkspaceVersions() {
  const versions = {};
  WORKSPACES.forEach((ws) => {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, `../repos/${ws}/package.json`), 'utf-8'));
      versions[ws] = pkg.version;
    } catch {
      versions[ws] = 'unknown';
    }
  });
  return versions;
}

/**
 * Save release notes to file
 */
function saveReleaseNotes(notes, version) {
  const notesPath = path.join(__dirname, `../.github/release-notes-${version}.md`);
  fs.writeFileSync(notesPath, notes);
  console.log(`✅ Release notes saved to ${notesPath}`);
  console.log(`\n📝 Release Notes Preview:\n`);
  console.log(notes);
}

/**
 * Main function
 */
function main() {
  const version = process.env.RELEASE_VERSION || 'v' + new Date().toISOString().split('T')[0];
  const lastTag = process.env.LAST_TAG || '';

  console.log(`🔄 Generating release notes for ${version}...\n`);

  const commits = getReleaseCommits(lastTag);
  const versions = getWorkspaceVersions();
  const notes = generateReleaseNotes(version, commits, versions);

  saveReleaseNotes(notes, version);
  console.log(`\n✅ Release notes generation complete!`);
}

if (require.main === module) {
  main();
}

module.exports = {
  generateReleaseNotes,
  getReleaseCommits,
  groupByWorkspace,
  getWorkspaceVersions,
};
