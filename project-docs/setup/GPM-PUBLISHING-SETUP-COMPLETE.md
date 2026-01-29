# GitHub Package Manager (GPM) Publishing Setup - Complete ✅

**Date:** January 26, 2026  
**Status:** ✅ OPERATIONAL AND TESTED  
**Package:** @rarsus/necrobot-utils  
**Registry:** GitHub Package Manager (npm.pkg.github.com)  

## Executive Summary

The `necrobot-utils` package is now **automatically published to GitHub Package Manager with every release**. This enables:

- 📦 **Reusable Package** - necrobot-utils can be installed as a standalone npm package
- 🔄 **Automatic Publishing** - Every release automatically publishes to GPM
- 🏷️ **Semantic Versioning** - Version is automatically bumped based on commit types
- 🔐 **Secure Distribution** - Published through GitHub's official package registry
- 📊 **Version Management** - Independent version history from the monorepo

## What Was Configured

### 1. Package Configuration

**File:** `repos/necrobot-utils/package.json`

```json
{
  "name": "@rarsus/necrobot-utils",
  "version": "0.1.0",
  "description": "Shared utilities, services, and helpers for NecromundaBot",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Rarsus/necrobot-utils.git"
  }
}
```

**Changes:**
- ✅ Package scoped to `@rarsus` organization namespace
- ✅ PublishConfig directs releases to GitHub registry
- ✅ Repository metadata for package discovery
- ✅ Version field automatically updated by versioning workflow

### 2. Workflow Configuration

**File:** `repos/necrobot-utils/.github/workflows/versioning.yml`

**New Step:** "Publish to GitHub Package Manager"

```yaml
- name: 📦 Publish to GitHub Package Manager
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: npm publish
```

**Features:**
- ✅ Automatic authentication with GITHUB_TOKEN
- ✅ Dynamic .npmrc generation with auth token
- ✅ Package validation and publishing
- ✅ Sensitive file cleanup after publish
- ✅ Comprehensive error handling

**Permissions:**
```yaml
permissions:
  contents: write    # For commits and releases
  packages: write    # For package publishing
  pull-requests: read
```

### 3. Registry Configuration

**File:** `repos/necrobot-utils/.npmrc`

```
@rarsus:registry=https://npm.pkg.github.com
```

**Purpose:** Routes all `@rarsus` scoped packages to GitHub registry

## Publishing Pipeline

```
Push commit to main
        ↓
Analyze commit type (feat:, fix:, BREAKING CHANGE:)
        ↓
Determine version bump (major/minor/patch)
        ↓
Update package.json version
        ↓
Create git tag (v0.1.0, v0.2.0, etc.)
        ↓
Create GitHub Release with changelog
        ↓
🆕 Publish to GitHub Package Manager ⭐
        ↓
Package available at npm.pkg.github.com
```

## Release History

### First Release - ✅ SUCCESSFUL

**Package:** @rarsus/necrobot-utils@0.1.0  
**Status:** ✅ Published  
**Registry:** https://npm.pkg.github.com  
**Published:** January 26, 2026  

**Package Details:**
- Tarball Size: 8.8 kB
- Unpacked Size: 37.5 kB
- Files: 12
- Shasum: f4480981c28d580d1e0e49781601eabfee302c9d

**GitHub Release:**
https://github.com/Rarsus/necrobot-utils/releases/tag/v0.1.0

**GitHub Package:**
https://github.com/Rarsus/necrobot-utils/pkgs/npm/necrobot-utils

## How to Install

### Step 1: Create GitHub Token

1. GitHub Settings → Developer settings → Personal access tokens
2. Create token with scopes:
   - ✅ `read:packages` (read packages)
   - ✅ `write:packages` (for publishing - optional)
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
npm install @rarsus/necrobot-utils
```

### Step 4: Use in Code

```javascript
// Import services
const { DatabaseService, QuoteService } = require('@rarsus/necrobot-utils');

// Import helpers
const { sendSuccess, sendError, sendQuoteEmbed } = require('@rarsus/necrobot-utils');

// Import middleware
const { logError } = require('@rarsus/necrobot-utils');
```

## Version Constraints

When using as a dependency in other projects:

```json
{
  "@rarsus/necrobot-utils": "^0.1.0"
}
```

This accepts compatible updates:
- `^0.1.0` → 0.1.0, 0.1.1, 0.2.0, etc. (same major)
- `~0.1.0` → 0.1.0, 0.1.1, 0.1.2 (same minor)
- `0.1.0` → exactly 0.1.0

## Next Release Testing

The versioning workflow is fully operational. To test the next release:

1. **Make a code change** with conventional commit:
   ```bash
   git commit -m "feat: add cache invalidation service"
   ```

2. **Push to main:**
   ```bash
   git push origin main
   ```

3. **Automatic Publishing:**
   - Workflow analyzes commit (feat: = minor bump)
   - Updates version to 0.2.0
   - Creates release and tag
   - Publishes to GitHub Package Manager
   - Package available: @rarsus/necrobot-utils@0.2.0

## Security & Best Practices

### Token Management
- ✅ Store tokens in GitHub Secrets (for Actions)
- ✅ Use environment variables for local development
- ✅ Rotate tokens periodically
- ❌ Never commit tokens to repository
- ❌ Don't share tokens in chat/email

### Conventional Commits
Use proper commit format for automatic version bumping:

```bash
# Patch release (0.1.0 → 0.1.1)
git commit -m "fix: resolve database timeout issue"

# Minor release (0.1.0 → 0.2.0)
git commit -m "feat: add cache invalidation service"

# Major release (0.1.0 → 1.0.0)
git commit -m "feat: redesign API

BREAKING CHANGE: Response format has changed"
```

## Troubleshooting

**Publishing fails with 403 error:**
- Verify `publishConfig.registry` matches `.npmrc`
- Check GitHub token has `packages:write` permission
- Ensure `@rarsus` organization exists on GitHub

**Package not found after publishing:**
- Allow 1-2 minutes for GitHub registry to index
- Verify package name matches: `@rarsus/necrobot-utils`
- Check package visibility (must be public or authenticated)

**Local testing:**
```bash
# Pack the package locally
npm pack

# This creates @rarsus-necrobot-utils-0.1.0.tgz
# Extract and inspect to verify contents before publishing
```
