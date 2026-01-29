# necrobot-utils Package Publishing Guide

**Status:** ✅ Operational  
**Last Updated:** January 26, 2026  
**Package:** @rarsus/necrobot-utils  
**Registry:** GitHub Package Manager (npm.pkg.github.com)  

## Overview

The `necrobot-utils` package is automatically published to GitHub Package Manager (GPM) with every release. This guide explains how the publishing works and how to use the published package.

## How Publishing Works

### Automatic Publishing Pipeline

Every time a commit is pushed to the `main` branch:

1. **Commit Analysis** → Analyzes conventional commit messages
2. **Version Update** → Updates package.json with new version
3. **GitHub Release** → Creates release with changelog
4. **GPM Publishing** → Publishes to GitHub Package Manager

### Trigger Conditions

- ✅ Commits with `feat:` → Publishes **minor** version bump
- ✅ Commits with `fix:` → Publishes **patch** version bump  
- ✅ Commits with `BREAKING CHANGE:` → Publishes **major** version bump
- ✅ Manual workflow with specified release type

Skipped if only docs/workflows changed.

## Package Configuration

### package.json

```json
{
  "name": "@rarsus/necrobot-utils",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/Rarsus/necrobot-utils.git"
  }
}
```

### .npmrc

```
@rarsus:registry=https://npm.pkg.github.com
```

## Installation

### Prerequisites

- GitHub token with `read:packages` permission

### Setup

1. Create `.npmrc`:
```
@rarsus:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

2. Install:
```bash
npm install @rarsus/necrobot-utils
```

3. Use in code:
```javascript
const { DatabaseService, sendSuccess } = require('@rarsus/necrobot-utils');
```

## Workflow Permissions

```yaml
permissions:
  contents: write    # For commits and releases
  packages: write    # For publishing to GPM
```

## Latest Release

Visit: https://github.com/Rarsus/necrobot-utils/releases

Current version: **0.1.0** ✅ Published

## Best Practices

### Commit Messages

```bash
# Patch (0.1.0 → 0.1.1)
git commit -m "fix: resolve database timeout"

# Minor (0.1.0 → 0.2.0)  
git commit -m "feat: add cache service"

# Major (0.1.0 → 1.0.0)
git commit -m "feat: redesign API

BREAKING CHANGE: Response format changed"
```

### Version Constraints

```json
{
  "@rarsus/necrobot-utils": "^0.1.0"
}
```

## Troubleshooting

### "Cannot publish over existing version"

This is expected - each version publishes once. Make sure commits use conventional format for proper version bumping.

### "404 Not found"

Verify:
- Token has `read:packages` permission
- .npmrc has correct registry
- Token is not expired

### "EAUTH - Unauthorized"

Regenerate GitHub token and update .npmrc.

## References

- [GitHub Package Manager Docs](https://docs.github.com/en/packages)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
