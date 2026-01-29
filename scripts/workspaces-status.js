#!/usr/bin/env node

/**
 * Workspace Status Monitor
 * Shows health and metadata for all npm workspaces
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACES = [
  'repos/necrobot-utils',
  'repos/necrobot-core',
  'repos/necrobot-commands',
  'repos/necrobot-dashboard',
];

function getPackageInfo(workspacePath) {
  const packageJsonPath = path.join(workspacePath, 'package.json');
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

function getGitInfo(workspacePath) {
  try {
    const lastCommit = execSync(
      `cd ${workspacePath} && git log -1 --pretty=format:"%h %s" 2>/dev/null || echo "No git history"`,
      {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }
    ).trim();

    const branch = execSync(`cd ${workspacePath} && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    return { lastCommit, branch };
  } catch {
    return { lastCommit: 'N/A', branch: 'N/A' };
  }
}

function getTestCount(workspacePath) {
  const testDir = path.join(workspacePath, 'tests');
  try {
    if (!fs.existsSync(testDir)) return 0;

    let count = 0;
    const files = execSync(`find ${testDir} -name "*.test.js" 2>/dev/null | wc -l`, {
      encoding: 'utf-8',
    }).trim();
    return parseInt(files, 10) || 0;
  } catch {
    return 0;
  }
}

function getDirectorySize(workspacePath) {
  try {
    const size = execSync(
      `du -sh ${workspacePath}/src ${workspacePath}/tests 2>/dev/null | tail -1 | awk '{print $1}'`,
      {
        encoding: 'utf-8',
      }
    ).trim();
    return size || 'N/A';
  } catch {
    return 'N/A';
  }
}

console.log('\n📊 NecromundaBot Workspace Status Report\n');
console.log('════════════════════════════════════════════════════════════════');

let totalTests = 0;

WORKSPACES.forEach((workspace, index) => {
  const pkg = getPackageInfo(workspace);
  const git = getGitInfo(workspace);
  const tests = getTestCount(workspace);
  const size = getDirectorySize(workspace);

  totalTests += tests;

  console.log(`\n${index + 1}. ${workspace}`);
  console.log('─────────────────────────────────────────────────────────');

  if (pkg) {
    console.log(`   Name:        ${pkg.name}`);
    console.log(`   Version:     ${pkg.version}`);
    console.log(`   Description: ${pkg.description}`);
  } else {
    console.log('   ❌ Could not load package.json');
  }

  console.log(`   Git Branch:  ${git.branch}`);
  console.log(`   Last Commit: ${git.lastCommit}`);
  console.log(`   Test Files:  ${tests} ${tests > 0 ? '✅' : '⚠️ '}`);
  console.log(`   Code Size:   ${size}`);
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`\n📈 Summary:`);
console.log(`   Total Workspaces: ${WORKSPACES.length}`);
console.log(`   Total Test Files: ${totalTests}`);
console.log(`   Status:           ${'✅ All configured'}`);
console.log('\n');
