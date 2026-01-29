# Release Process & Versioning Guide

This document describes the release process and versioning strategy for NecromundaBot and its submodules.

## Overview

The NecromundaBot project uses:
- **Semantic Versioning (SemVer)** for version numbering: `MAJOR.MINOR.PATCH`
- **Conventional Commits** for commit messages that drive version bumps
- **Automated Analysis** scripts to determine appropriate version bumps based on changes
- **Git Tags** to mark releases (`vX.Y.Z`)

## Semantic Versioning (SemVer) Rules

Version format: `MAJOR.MINOR.PATCH`

| Situation | Version Bump | Example |
|-----------|-------------|---------|
| **Breaking changes** | MAJOR | `1.0.0` → `2.0.0` |
| **New features** (backward compatible) | MINOR | `1.0.0` → `1.1.0` |
| **Bug fixes & refactors** | PATCH | `1.0.0` → `1.0.1` |
| **Docs, chores, tests only** | No bump | Stay at current version |

### Special Cases

- **New source files** (not tests) = MINOR bump
- **Test-only additions** = PATCH bump
- **Configuration/refactoring** = PATCH bump

## Conventional Commits

Use these commit message formats to help version determination:

```bash
# Feature (triggers MINOR bump if multiple source files added)
git commit -m "feat(scope): Description"

# Bug fix (triggers PATCH bump)
git commit -m "fix(scope): Description"

# Breaking change (triggers MAJOR bump)
git commit -m "feat(scope)!: Description"
# OR include in body:
git commit -m "feat(scope): Description

BREAKING CHANGE: Explain what changed"

# Refactor (triggers PATCH bump)
git commit -m "refactor(scope): Description"

# Documentation (no version bump)
git commit -m "docs: Description"

# Tests (triggers PATCH bump if new tests)
git commit -m "test: Description"

# Chores (no version bump)
git commit -m "chore: Description"
```

### Scope Examples

Common scopes:
- `core` - Core bot functionality
- `utils` - Utility services and helpers
- `commands` - Command-related changes
- `dashboard` - Web UI changes
- `db` - Database changes
- `deps` - Dependencies

## Release Workflow

### Step 1: Analyze Changes

Before creating a release, analyze what changed since the last version:

```bash
cd repos/necrobot-core
node ../../scripts/analyze-version-impact.js v0.2.1
```

This shows:
- Commit breakdown (feat, fix, breaking, refactor, etc.)
- File changes (added, deleted, modified)
- Recommended version bump with reasoning

### Step 2: Determine Version

Based on the analysis:
- Check the **Recommended Version Bump** in the report
- Verify it matches the expected impact of changes
- If changes warrant a different bump, manual override is possible

### Step 3: Create Release

Use the automated release script:

```bash
cd repos/necrobot-core

# Auto-detect version from analysis
./../../scripts/create-release.sh

# OR specify version manually
./../../scripts/create-release.sh 0.3.0
```

The script will:
1. ✅ Show analysis report of changes
2. ✅ Update `package.json` version
3. ✅ Create release commit: `chore: release version X.Y.Z`
4. ✅ Create git tag: `vX.Y.Z`

### Step 4: Push to GitHub

Push the release to the remote repository:

```bash
git push origin main --tags
```

This pushes both the release commit and the version tag.

### Step 5: Publish to NPM (if applicable)

For public packages, publish to NPM:

```bash
npm publish
```

For GitHub Packages (private registry), ensure `publishConfig` is set in `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Then publish:

```bash
npm publish
```

## Repository Release Schedule

| Repository | Package | Frequency | Notes |
|-----------|---------|-----------|-------|
| necrobot-core | `necrobot-core` | As needed | Core bot engine |
| necrobot-utils | `necrobot-utils` | As needed | Shared utilities |
| necrobot-commands | `necrobot-commands` | As needed | Discord commands (Phase 2.5) |
| necrobot-dashboard | `necrobot-dashboard` | As needed | Web UI |

## Current Versions (as of Jan 27, 2026)

| Repository | Latest Version | Latest Tag | Released |
|-----------|-----------------|-----------|----------|
| necrobot-core | 0.3.0 | v0.3.0 | Jan 27, 2026 |
| necrobot-utils | 0.2.2 | v0.2.2 | Jan 27, 2026 |
| necrobot-commands | 0.1.0 | v0.1.0 | — |
| necrobot-dashboard | 0.1.3 | v0.1.3 | Jan 27, 2026 |

## Rollback / Undo a Release

If you need to undo a release before pushing:

```bash
# Undo last commit and tag
git reset --soft HEAD~1
git tag -d v0.3.0
git checkout -- package.json

# Make corrections
# Then re-run the release process
```

If you already pushed, you'll need to:

```bash
# Delete remote tag
git push origin :refs/tags/v0.3.0

# Reset branch
git reset --soft HEAD~1
git push origin main --force-with-lease

# Make corrections and re-release
```

## Automated Version Analysis Details

The `analyze-version-impact.js` script:

1. **Compares commits** between last tag and HEAD
2. **Parses conventional commits** to extract type and scope
3. **Analyzes file changes** to detect code additions
4. **Determines SemVer impact**:
   - Breaking changes → MAJOR
   - New source files → MINOR
   - Tests/fixes/refactors → PATCH
   - Docs/chores only → NO BUMP
5. **Generates report** with detailed breakdown

### Usage

```bash
node scripts/analyze-version-impact.js [lastTag]

# Examples:
node scripts/analyze-version-impact.js v0.2.1    # Analyze since v0.2.1
node scripts/analyze-version-impact.js            # Analyze since last tag
```

Output includes:
- Current version and comparison range
- Commit breakdown by type
- File changes by category (src, tests, docs, other)
- Recommended version bump with reasoning
- Detailed commit list with icons

## Best Practices

### For Developers

1. **Use conventional commits** - Helps version determination
2. **Make focused commits** - One feature/fix per commit
3. **Write clear messages** - Others will understand the change
4. **Update tests** - Tests should be committed with code
5. **Test before committing** - Ensure all tests pass

```bash
# Before committing:
npm test
npm run lint
npm run format
```

### For Release Manager

1. **Review changes** - Read commit messages and understand impact
2. **Run analysis** - Check recommended version bump
3. **Verify package** - Ensure package.json is correct
4. **Test build** - Make sure package builds correctly
5. **Tag accurately** - Use semantic version tags only
6. **Document changes** - Keep changelog or release notes updated

### Commit Message Examples

```bash
# Good: Clear, conventional format
git commit -m "feat(core): Add CommandLoader for dynamic command loading"
git commit -m "fix(utils): Correct database connection pool initialization"
git commit -m "refactor(dashboard): Extract component into smaller modules"
git commit -m "chore: release version 0.3.0"

# Bad: Unclear, non-standard format
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "Phase 25.0: Implement stuff"  # ← Triggers 'other' category
```

## Tools & Scripts

### analyze-version-impact.js

**Location**: `scripts/analyze-version-impact.js`

**Purpose**: Analyzes commits since last tag and determines SemVer impact

**Usage**:
```bash
node scripts/analyze-version-impact.js [lastTag]
```

**Output**:
- Formatted report with commit breakdown
- File change statistics
- Recommended version bump
- Detailed commit list

### create-release.sh

**Location**: `scripts/create-release.sh`

**Purpose**: Creates a release with proper versioning, commit, and tag

**Usage**:
```bash
./scripts/create-release.sh [version]
```

**Steps**:
1. Shows analysis report (if version not specified)
2. Updates `package.json` version
3. Creates release commit
4. Creates git tag
5. Shows next steps (push, publish, etc.)

## Troubleshooting

### "Version X.Y.Z already released"

The tag `vX.Y.Z` already exists. Either:
- Use a different version number
- Delete the tag if it was created by mistake: `git tag -d vX.Y.Z`

### "Recommended Version Bump: none"

Only docs/chore/test changes were made. Choose:
- Don't release (no new functionality)
- Create PATCH release if you prefer to mark the release

### Wrong version bump recommended

Check:
1. Are commit messages following conventional format?
2. Were new source files added/deleted?
3. Were breaking changes introduced?

If analysis is wrong, you can manually override:
```bash
./scripts/create-release.sh 0.4.0  # Specify version directly
```

## FAQ

**Q: Do I need to update the version in package.json before creating a release?**
A: No, the release script handles that automatically.

**Q: Can I release without a git tag?**
A: Not recommended. Tags mark releases and make them traceable. Always use tags.

**Q: What if I want to skip a version number?**
A: You can manually specify: `./scripts/create-release.sh 1.0.0`

**Q: Should I release every time I commit?**
A: No, batch related changes and release once they're ready.

**Q: Can I release from a feature branch?**
A: Releases should be from `main` branch only. Merge feature branches first.

**Q: What about pre-releases (alpha, beta, rc)?**
A: SemVer supports: `1.0.0-alpha`, `1.0.0-beta.1`, `1.0.0-rc.1`
Use: `./scripts/create-release.sh 1.0.0-beta.1`

## Related Documentation

- [DEFINITION-OF-DONE.md](../../DEFINITION-OF-DONE.md) - Release checklist
- [docs/testing/](../testing/) - Testing requirements before release
- [package.json](../../package.json) - Workspace configuration
- [.github/workflows/](../../.github/workflows/) - CI/CD automation

## Questions?

Refer to:
- [Semantic Versioning Spec](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules)
