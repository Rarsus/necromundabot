#!/usr/bin/env node
/**
 * bump-workspace-versions.js
 * Updates individual workspace versions and root version based on detected changes
 */

const fs = require('fs');
const path = require('path');

/**
 * Read package.json file
 * @param {string} filePath - Path to package.json
 * @returns {Object} Parsed package.json
 */
function readPackageJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Write package.json file with proper formatting
 * @param {string} filePath - Path to package.json
 * @param {Object} pkg - Package object to write
 */
function writePackageJson(filePath, pkg) {
  const content = JSON.stringify(pkg, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Bump a semantic version
 * @param {string} version - Current version (e.g., "1.2.3")
 * @param {string} bumpType - Type of bump: 'major', 'minor', 'patch', or 'none'
 * @returns {string} New version
 */
function bumpVersion(version, bumpType) {
  if (bumpType === 'none') {
    return version;
  }

  // Extract base version (handle pre-releases)
  const baseMatch = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!baseMatch) {
    throw new Error(`Invalid version format: ${version}`);
  }

  let major = parseInt(baseMatch[1], 10);
  let minor = parseInt(baseMatch[2], 10);
  let patch = parseInt(baseMatch[3], 10);

  switch (bumpType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
    default:
      throw new Error(`Unknown bump type: ${bumpType}`);
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Get workspace configurations
 * @returns {Array} Array of workspace configs with {name, path}
 */
function getWorkspaces() {
  const rootPkg = readPackageJson('./package.json');
  const workspacePaths = rootPkg.workspaces || [];

  return workspacePaths.map((pattern) => {
    // Remove trailing slash and wildcard
    const cleanPath = pattern.replace(/\/\*$/, '');
    const dirName = path.basename(cleanPath);

    return {
      name: dirName,
      path: cleanPath,
    };
  });
}

/**
 * Update workspace versions based on detected changes
 * @param {Object} changes - Object with workspace names as keys, bump types as values
 * @param {Array} workspaces - Array of workspace configs (optional, auto-detected if not provided)
 * @returns {Object} Report of version changes
 */
function updateWorkspaceVersions(changes, workspaces) {
  if (!workspaces) {
    workspaces = getWorkspaces();
  }

  const results = {};

  for (const workspace of workspaces) {
    const bumpType = changes[workspace.name];

    if (!bumpType || bumpType === 'none') {
      continue; // Skip workspaces without changes
    }

    const pkgPath = path.join(workspace.path, 'package.json');

    try {
      const pkg = readPackageJson(pkgPath);
      const oldVersion = pkg.version;
      const newVersion = bumpVersion(oldVersion, bumpType);

      pkg.version = newVersion;
      writePackageJson(pkgPath, pkg);

      results[workspace.name] = {
        oldVersion,
        newVersion,
        bumpType,
        timestamp: new Date().toISOString(),
        path: pkgPath,
      };
    } catch (error) {
      results[workspace.name] = {
        error: error.message,
        bumpType,
      };
    }
  }

  return results;
}

/**
 * Update root version based on workspace changes
 * The root version represents the overall monorepo state
 * It gets bumped if any workspace is bumped
 * @param {Object} changes - Object with workspace names as keys, bump types as values
 * @returns {Object} Report of root version change
 */
function updateRootVersion(changes) {
  const rootPkgPath = './package.json';

  try {
    const rootPkg = readPackageJson(rootPkgPath);
    const oldVersion = rootPkg.version;

    // Determine the highest bump type from all workspaces
    let highestBump = 'none';

    for (const [workspace, bumpType] of Object.entries(changes)) {
      if (workspace === 'ROOT') {
        // ROOT changes are already accounted for
        if (bumpType === 'major') {
          highestBump = 'major';
        } else if (bumpType === 'minor' && highestBump !== 'major') {
          highestBump = 'minor';
        } else if (bumpType === 'patch' && highestBump === 'none') {
          highestBump = 'patch';
        }
      } else {
        // Regular workspace changes
        if (bumpType === 'major') {
          highestBump = 'major';
        } else if (bumpType === 'minor' && highestBump !== 'major') {
          highestBump = 'minor';
        } else if (bumpType === 'patch' && highestBump === 'none') {
          highestBump = 'patch';
        }
      }
    }

    if (highestBump === 'none') {
      return {
        bumped: false,
        oldVersion,
        newVersion: oldVersion,
        reason: 'No workspace changes detected',
      };
    }

    const newVersion = bumpVersion(oldVersion, highestBump);
    rootPkg.version = newVersion;
    writePackageJson(rootPkgPath, rootPkg);

    const workspacesChanged = Object.keys(changes).filter((w) => changes[w] !== 'none');

    return {
      bumped: true,
      oldVersion,
      newVersion,
      bumpType: highestBump,
      timestamp: new Date().toISOString(),
      reason: `Workspace changes detected: ${workspacesChanged.join(', ')}`,
      path: rootPkgPath,
    };
  } catch (error) {
    return {
      bumped: false,
      error: error.message,
    };
  }
}

// Export for testing
module.exports = {
  readPackageJson,
  writePackageJson,
  bumpVersion,
  getWorkspaces,
  updateWorkspaceVersions,
  updateRootVersion,
};

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: bump-workspace-versions.js <json-changes>');
    console.error(
      'Example: bump-workspace-versions.js \'{"necrobot-utils":"patch","necrobot-core":"minor","ROOT":"patch"}\''
    );
    process.exit(1);
  }

  try {
    const changesJson = args[0];
    const changes = JSON.parse(changesJson);

    const workspaceResults = updateWorkspaceVersions(changes);
    const rootResult = updateRootVersion(changes);

    console.log(
      JSON.stringify(
        {
          workspaces: workspaceResults,
          root: rootResult,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
