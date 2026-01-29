#!/usr/bin/env node

/**
 * Sync all package.json versions to root package.json version
 *
 * This script ensures all submodule packages use the same version as the
 * main repository (monorepo generic versioning approach).
 *
 * Usage: node scripts/sync-package-versions.js [version]
 *   - With version arg: Set all packages to specified version
 *   - Without arg: Sync all packages to root version
 */

const fs = require('fs');
const path = require('path');

const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
const packages = ['repos/necrobot-utils', 'repos/necrobot-core', 'repos/necrobot-commands', 'repos/necrobot-dashboard'];

function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function main() {
  // Get target version
  const targetVersion = process.argv[2];

  // Read root package.json
  const rootPackage = readJsonFile(rootPackageJsonPath);
  const versionToUse = targetVersion || rootPackage.version;

  console.log(`📦 Syncing all packages to version: ${versionToUse}\n`);

  let synced = 0;
  let changed = 0;

  // Sync each submodule package
  packages.forEach((pkgPath) => {
    const packageJsonPath = path.join(__dirname, '..', pkgPath, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`⚠️  Missing: ${pkgPath}/package.json`);
      return;
    }

    const pkg = readJsonFile(packageJsonPath);
    const oldVersion = pkg.version;

    if (oldVersion !== versionToUse) {
      pkg.version = versionToUse;
      writeJsonFile(packageJsonPath, pkg);
      console.log(`✅ ${pkg.name}@${versionToUse} (was ${oldVersion})`);
      changed++;
    } else {
      console.log(`✓  ${pkg.name}@${versionToUse} (already synced)`);
    }

    synced++;
  });

  console.log(`\n📊 Summary: ${synced} packages checked, ${changed} updated`);

  if (changed > 0) {
    console.log('✅ All packages synced successfully!\n');
    process.exit(0);
  } else {
    console.log('ℹ️  All packages already in sync.\n');
    process.exit(0);
  }
}

main();
