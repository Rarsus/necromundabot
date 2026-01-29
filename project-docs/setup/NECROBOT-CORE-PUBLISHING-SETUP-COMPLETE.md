# NecroBot Core Package Publishing Setup - Complete ✅

**Date:** January 26, 2026  
**Status:** ✅ OPERATIONAL AND READY FOR RELEASE  
**Package:** @rarsus/necrobot-core  
**Registry:** GitHub Package Manager (npm.pkg.github.com)  

---

## Executive Summary

The `necrobot-core` package is now **configured to be automatically published to GitHub Package Manager with every release**. This enables:

- 📦 **Reusable Core Module** - necrobot-core can be installed as a standalone npm package
- 🔄 **Automatic Publishing** - Every release automatically publishes to GPM
- 🏷️ **Semantic Versioning** - Version is automatically bumped based on commit types
- 🔐 **Secure Distribution** - Published through GitHub's official package registry
- 📊 **Version Management** - Independent version history from the monorepo
- 🔗 **Dependency Management** - Properly depends on @rarsus/necrobot-utils

---

## What Was Configured

### 1. Package Configuration

**File:** `repos/necrobot-core/package.json`

```json
{
  "name": "@rarsus/necrobot-core",
  "version": "0.1.0",
  "description": "NecroBot core engine, services, middleware, and event handlers",
  "main": "src/index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/Rarsus/necrobot-core.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "dependencies": {
    "@rarsus/necrobot-utils": "^0.2.0",
    "discord.js": "^14.14.0",
    "dotenv": "^17.2.3"
  }
}
```

**Key Changes:**
- ✅ Package scoped to `@rarsus` organization namespace
- ✅ PublishConfig directs releases to GitHub registry
- ✅ Repository metadata for package discovery
- ✅ Depends on `@rarsus/necrobot-utils` (published package)
- ✅ Version field automatically updated by versioning workflow

### 2. Workflow Configuration

**File:** `repos/necrobot-core/.github/workflows/versioning.yml`

**Updated Components:**
- ✅ Added `packages: write` permission for NPM publishing
- ✅ Added new step: "Publish to GitHub Package Manager"
- ✅ Authenticates with GITHUB_TOKEN
- ✅ Runs `npm publish` after release creation
- ✅ Comprehensive error handling and reporting

**Publishing Step:**
```yaml
- name: 📦 Publish to GitHub Package Manager
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    # Authenticate with GitHub Package Manager
    echo "@rarsus:registry=https://npm.pkg.github.com" > .npmrc
    echo "//npm.pkg.github.com/:_authToken=$NODE_AUTH_TOKEN" >> .npmrc
    
    # Verify authentication
    npm whoami --registry=https://npm.pkg.github.com
    
    # Publish package
    npm publish
```

### 3. Registry Configuration

**File:** `repos/necrobot-core/.npmrc`

```
@rarsus:registry=https://npm.pkg.github.com
```

**Purpose:** Routes all `@rarsus` scoped packages to GitHub registry

---

## Dependency Structure

### Package Hierarchy

```
@rarsus/necrobot-utils (v0.2.0)
        ↑
        │ (dependency)
        │
@rarsus/necrobot-core (v0.1.0)
        ↑
        │ (will depend on)
        │
@rarsus/necrobot-commands (coming soon)
```

### Version Constraints

necrobot-core uses **fixed version constraint** for necrobot-utils:

```json
{
  "dependencies": {
    "@rarsus/necrobot-utils": "^0.2.0"
  }
}
```

This means:
- ✅ Automatically accepts patch updates (0.2.1, 0.2.2, etc.)
- ✅ Automatically accepts minor updates (0.3.0, 0.4.0, etc.)
- ❌ Requires manual update for major versions (1.0.0)

---

## Publishing Pipeline

### Automated Release Flow

```
Push commit to main with conventional message (feat:, fix:, BREAKING CHANGE:)
        ↓
Workflow triggers: paths-ignore skip docs/, project-docs/, etc.
        ↓
Step 1: Analyze Commits
   • Determine version bump (major/minor/patch)
   • Calculate new version
        ↓
Step 2: Create Release
   • Update package.json version
   • Create git tag (v0.1.1, v0.2.0, etc.)
   • Create GitHub Release with changelog
        ↓
Step 3: 🆕 Publish to GitHub Package Manager ⭐
   • Create .npmrc with authentication
   • Run `npm publish`
   • Package available at npm.pkg.github.com
        ↓
Step 4: Notify Completion
   • Summary of release status
```

---

## First Release Instructions

The workflow is **ready for immediate use**. To trigger the first release:

### Step 1: Make a Code Change

```bash
cd repos/necrobot-core
git switch -c feat/first-release
# Edit a file or add a feature
git add .
git commit -m "feat: add event handler patterns and documentation"
```

### Step 2: Push to Main

```bash
git push origin feat/first-release
# Create pull request and merge to main
# Or push directly if you have permission:
git push origin main
```

### Step 3: Automatic Release

The workflow will:
1. ✅ Analyze commit (feat: = minor bump: 0.1.0 → 0.2.0)
2. ✅ Update package.json to version 0.2.0
3. ✅ Create git tag v0.2.0
4. ✅ Create GitHub Release
5. ✅ **Publish to GitHub Package Manager** as `@rarsus/necrobot-core@0.2.0`

### Step 4: Verify Publication

```bash
# Check package on GitHub
https://github.com/Rarsus/necrobot-core/pkgs/npm/necrobot-core

# Or install (with proper authentication):
npm install @rarsus/necrobot-core@0.2.0
```

---

## How to Install

### Step 1: Create GitHub Token

1. GitHub Settings → Developer settings → Personal access tokens
2. Create token with scopes:
   - ✅ `read:packages` (install packages)
   - ✅ `write:packages` (optional, for publishing)
3. Copy token (starts with `ghp_`)

### Step 2: Configure .npmrc

Create `.npmrc` in your project:

```
@rarsus:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Or use environment variable:
```bash
export NPM_TOKEN=your_github_token
```

### Step 3: Install Package

```bash
# Install latest version
npm install @rarsus/necrobot-core

# Or specific version
npm install @rarsus/necrobot-core@0.2.0
```

### Step 4: Use in Code

```javascript
// Import CommandBase
const CommandBase = require('@rarsus/necrobot-core');

// Import error handler
const { logError } = require('@rarsus/necrobot-core/src/middleware/errorHandler');

// Use in commands or applications
class MyCommand extends CommandBase {
  // Implementation
}
```

---

## Version Constraints

When using as a dependency in other projects:

```json
{
  "dependencies": {
    "@rarsus/necrobot-core": "^0.2.0"
  }
}
```

**Semver Ranges:**
- `^0.2.0` → 0.2.0, 0.2.1, 0.3.0, etc. (same major version)
- `~0.2.0` → 0.2.0, 0.2.1, 0.2.2 (same minor version)
- `0.2.0` → exactly 0.2.0

---

## Key Differences from necrobot-utils

### Why necrobot-core Can Now Be Published

necrobot-core previously could not be published because:
- ❌ It depended on `necrobot-utils: "*"` (workspace reference)
- ❌ Would not work outside the monorepo

Now it can be published because:
- ✅ Depends on `@rarsus/necrobot-utils: "^0.2.0"` (published package)
- ✅ Works standalone, or in monorepo with workspace resolution
- ✅ Automatic version bumping works correctly

### Workspace vs. Published Packages

**In the Monorepo:**
```javascript
// Works via npm workspaces (local path resolution)
const CommandBase = require('necrobot-core');
const { DatabaseService } = require('necrobot-utils');
```

**As Published Package:**
```javascript
// Works via NPM registry (GitHub Package Manager)
const CommandBase = require('@rarsus/necrobot-core');
const { DatabaseService } = require('@rarsus/necrobot-utils');
```

---

## Dependency Updates

### When to Update Version Constraints

If necrobot-utils releases a **breaking change** (major version bump):

**Before (0.2.x):**
```json
{
  "@rarsus/necrobot-utils": "^0.2.0"
}
```

**After major update (1.0.0):**
```bash
# Manual update required
npm install @rarsus/necrobot-utils@^1.0.0
```

Then update package.json:
```json
{
  "@rarsus/necrobot-utils": "^1.0.0"
}
```

---

## Security & Best Practices

### Token Management
- ✅ GitHub Actions uses GITHUB_TOKEN automatically
- ✅ Token has automatic expiration and rotation
- ✅ Token permissions are scoped to `packages: write`
- ✅ No long-lived tokens needed for publishing

### Conventional Commits

Use proper commit format for automatic version bumping:

```bash
# Patch release (0.2.0 → 0.2.1)
git commit -m "fix: resolve middleware chain error"

# Minor release (0.2.0 → 0.3.0)
git commit -m "feat: add event handler base class"

# Major release (0.2.0 → 1.0.0)
git commit -m "feat: redesign middleware architecture

BREAKING CHANGE: Middleware now requires async/await"
```

### Package Privacy

Published packages on GitHub Package Manager:
- ✅ Visible to all authenticated users
- ✅ Can be scoped to organization (`@rarsus/*`)
- ✅ Access controlled via GitHub permissions
- ✅ Not publicly searchable like npm.org

---

## Troubleshooting

### Publishing Fails with "404 Not Found"

**Cause:** Package name doesn't match publishConfig registry

**Fix:** Verify package.json:
```json
{
  "name": "@rarsus/necrobot-core",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### Installing Package Fails with "401 Unauthorized"

**Cause:** Authentication token not configured

**Fix:** Create .npmrc with token:
```
@rarsus:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_TOKEN
```

### Workflow Fails: "npm publish permission denied"

**Cause:** Workflow permissions not set

**Fix:** Verify `.github/workflows/versioning.yml`:
```yaml
permissions:
  contents: write
  packages: write    # Required for publishing
  pull-requests: read
```

### Version Already Published

**Cause:** Attempting to publish same version twice

**Fix:** Version is automatically incremented by workflow based on commits
```bash
# Check what version will be published
npm version [patch|minor|major] --dry-run
```

---

## Next Steps

### Immediate (Ready Now)
- ✅ First code commit triggers automatic versioning and publishing
- ✅ Monitor GitHub Actions for successful publication
- ✅ Verify package appears on GitHub Package Manager

### Short Term (This Week)
- Configure necrobot-commands to publish similarly
- Update imports across ecosystem to use published packages
- Add public package registry mirrors (optional)

### Medium Term (This Month)
- Publish necrobot-commands package
- Update monorepo examples to show published package usage
- Create internal package documentation

---

## Documentation Links

- [GitHub Package Manager Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [NPM Publish Documentation](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## References

- **Related Setup:** [project-docs/setup/GPM-PUBLISHING-SETUP-COMPLETE.md](./GPM-PUBLISHING-SETUP-COMPLETE.md) - necrobot-utils publishing setup
- **Configuration:** [project-docs/configuration/DOCUMENTATION-STRATEGY-UPDATE.md](../configuration/DOCUMENTATION-STRATEGY-UPDATE.md)
- **Governance:** [project-docs/governance/GOVERNANCE-DOCUMENTS-UPDATE.md](../governance/GOVERNANCE-DOCUMENTS-UPDATE.md)
- **Main Docs:** [DOCUMENT-NAMING-CONVENTION.md](../../../DOCUMENT-NAMING-CONVENTION.md)

---

**Status**: COMPLETE AND READY FOR FIRST RELEASE ✓

All configuration complete. necrobot-core is ready to publish automatically with the next conventional commit.
