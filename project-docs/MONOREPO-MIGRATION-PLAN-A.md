# Monorepo Migration Plan (Approach A)

**Status:** 🚀 IN PROGRESS  
**Start Date:** January 29, 2026  
**Estimated Completion:** February 5-6, 2026 (40-60 hours over 5 days)  
**Constraint:** Directory structure maintained: `repos/necrobot-{core|utils|commands|dashboard}`

---

## Overview

This document describes the step-by-step process to convert NecromundaBot from a git submodule architecture to a single unified repository while:

✅ Preserving all git history for all 4 packages  
✅ Maintaining directory structure (repos/necrobot-*)  
✅ Keeping npm workspace structure functional  
✅ Updating all CI/CD pipelines  
✅ Zero breaking changes to published packages (version numbers preserved)  

**Total Effort:** 40-60 hours  
**Risk Level:** 🟡 HIGH (requires careful git operations)  
**Rollback:** Preserve backup branches during process

---

## Phase 1: Preparation & Backup (4 hours)

### Step 1.1: Create Comprehensive Backup Branches

```bash
# Backup main repo state
git checkout main
git pull origin main
git branch backup/main-pre-monorepo-migration

# Backup each submodule state
cd repos/necrobot-core
git branch backup/v0.3.2-pre-monorepo-migration
git checkout v0.3.2
cd ../../

cd repos/necrobot-utils
git branch backup/v0.2.4-pre-monorepo-migration
git checkout v0.2.4
cd ../../

cd repos/necrobot-commands
git branch backup/v0.2.2-pre-monorepo-migration
git checkout v0.2.2
cd ../../

cd repos/necrobot-dashboard
git branch backup/v0.2.2-pre-monorepo-migration
git checkout v0.2.2
cd ../../
```

### Step 1.2: Document Current State

Create file: `project-docs/MONOREPO-MIGRATION-CURRENT-STATE.md`

Contents:
- Submodule URLs and branches
- Current npm workspace configuration
- Current package versions
- Current CI/CD configuration
- Current publishing URLs

### Step 1.3: Verify Prerequisites

```bash
# Verify Node and npm versions
node --version    # Should be >=22.0.0
npm --version     # Should be >=10.0.0

# Verify git setup
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Verify all tests passing
npm test          # All 147 tests must pass

# Verify no uncommitted changes
git status        # Must be clean
```

### Step 1.4: Create Migration Branch

```bash
git checkout main
git checkout -b migration/approach-a-monorepo-consolidation
```

---

## Phase 2: Git Submodule Conversion (12 hours)

### Overview

Convert each submodule to a regular directory while preserving complete git history. This is the most critical phase.

### Step 2.1: Migrate necrobot-utils (Foundation)

**Why first:** All other packages depend on utils, so stable history is critical.

#### 2.1a: Remove submodule registration

```bash
cd /home/olav/repo/necromundabot

# Remove from .gitmodules
git config --file=.gitmodules --remove-section submodule.repos/necrobot-utils
git add .gitmodules
git commit -m "chore(migration): Remove necrobot-utils submodule reference from .gitmodules"

# Remove from git config
git config --remove-section submodule.repos/necrobot-utils
```

#### 2.1b: Remove from .git directory

```bash
# This step is automatic after removing from .gitmodules and staging area
# Git will handle the cleanup
```

#### 2.1c: Import git history into main repo

```bash
# Create a temporary remote for the full history import
cd /home/olav/repo/necromundabot
git remote add necrobot-utils https://github.com/Rarsus/necrobot-utils.git

# Fetch all history from the utils repository
git fetch necrobot-utils refs/heads/*:refs/remotes/necrobot-utils/*
git fetch necrobot-utils refs/tags/*:refs/tags/necrobot-utils/*

# Create a merge commit that preserves history
git merge -X theirs --allow-unrelated-histories -m "feat(migration): Merge necrobot-utils history into monorepo

- Consolidate necrobot-utils git history into main repository
- Preserves all commits and tags from v0.2.4 branch
- Directory: repos/necrobot-utils
- Referenced: 0.2.4 tag (2bb7196)" necrobot-utils/v0.2.4

# Remove temporary remote
git remote remove necrobot-utils
```

**Note:** The `git merge` will handle the directory structure because necrobot-utils is already in `repos/necrobot-utils/`.

#### 2.1d: Update package.json dependencies

In root `package.json`, necrobot-utils is now a local directory:
```json
{
  "workspaces": [
    "repos/necrobot-utils",
    "repos/necrobot-core",
    "repos/necrobot-commands",
    "repos/necrobot-dashboard"
  ]
}
```

Update `repos/necrobot-core/package.json`:
```json
{
  "dependencies": {
    "necrobot-utils": "workspace:*"
  }
}
```

### Step 2.2: Migrate necrobot-core (4 hours)

Follow same pattern as 2.1:

```bash
# Remove submodule
git config --file=.gitmodules --remove-section submodule.repos/necrobot-core
git add .gitmodules
git commit -m "chore(migration): Remove necrobot-core submodule reference from .gitmodules"
git config --remove-section submodule.repos/necrobot-core

# Import history
git remote add necrobot-core https://github.com/Rarsus/necrobot-core.git
git fetch necrobot-core refs/heads/*:refs/remotes/necrobot-core/*
git fetch necrobot-core refs/tags/*:refs/tags/necrobot-core/*

git merge -X theirs --allow-unrelated-histories -m "feat(migration): Merge necrobot-core history into monorepo

- Consolidate necrobot-core git history into main repository
- Preserves all commits and tags from v0.3.2 branch
- Directory: repos/necrobot-core
- Referenced: 0.3.2 tag (2a2f25b)" necrobot-core/v0.3.2

git remote remove necrobot-core
```

Update package.json files:
- `repos/necrobot-commands/package.json`: Change "necrobot-core": "*" → "necrobot-core": "workspace:*"

### Step 2.3: Migrate necrobot-commands (4 hours)

```bash
# Remove submodule
git config --file=.gitmodules --remove-section submodule.repos/necrobot-commands
git add .gitmodules
git commit -m "chore(migration): Remove necrobot-commands submodule reference from .gitmodules"
git config --remove-section submodule.repos/necrobot-commands

# Import history
git remote add necrobot-commands https://github.com/Rarsus/necrobot-commands.git
git fetch necrobot-commands refs/heads/*:refs/remotes/necrobot-commands/*
git fetch necrobot-commands refs/tags/*:refs/tags/necrobot-commands/*

git merge -X theirs --allow-unrelated-histories -m "feat(migration): Merge necrobot-commands history into monorepo

- Consolidate necrobot-commands git history into main repository
- Preserves all commits and tags from v0.2.2 branch
- Directory: repos/necrobot-commands
- Referenced: 0.2.2 tag (047cf67)" necrobot-commands/v0.2.2

git remote remove necrobot-commands
```

### Step 2.4: Migrate necrobot-dashboard (4 hours)

```bash
# Remove submodule
git config --file=.gitmodules --remove-section submodule.repos/necrobot-dashboard
git add .gitmodules
git commit -m "chore(migration): Remove necrobot-dashboard submodule reference from .gitmodules"
git config --remove-section submodule.repos/necrobot-dashboard

# Import history
git remote add necrobot-dashboard https://github.com/Rarsus/necrobot-dashboard.git
git fetch necrobot-dashboard refs/heads/*:refs/remotes/necrobot-dashboard/*
git fetch necrobot-dashboard refs/tags/*:refs/tags/necrobot-dashboard/*

git merge -X theirs --allow-unrelated-histories -m "feat(migration): Merge necrobot-dashboard history into monorepo

- Consolidate necrobot-dashboard git history into main repository
- Preserves all commits and tags from v0.2.2 branch
- Directory: repos/necrobot-dashboard
- Referenced: 0.2.2 tag (d430b40)" necrobot-dashboard/v0.2.2

git remote remove necrobot-dashboard
```

### Step 2.5: Clean Up .gitmodules

```bash
# .gitmodules should now be empty or removed entirely
rm .gitmodules
git add .gitmodules
git commit -m "chore(migration): Remove .gitmodules after submodule consolidation"
```

---

## Phase 3: Update Configuration & Dependencies (8 hours)

### Step 3.1: Verify npm Workspaces

Root `package.json` should have:
```json
{
  "workspaces": [
    "repos/necrobot-utils",
    "repos/necrobot-core",
    "repos/necrobot-commands",
    "repos/necrobot-dashboard"
  ]
}
```

### Step 3.2: Update All package.json Files

All cross-workspace dependencies should use `workspace:*` protocol:

**repos/necrobot-core/package.json:**
```json
{
  "dependencies": {
    "necrobot-utils": "workspace:*"
  }
}
```

**repos/necrobot-commands/package.json:**
```json
{
  "dependencies": {
    "necrobot-core": "workspace:*",
    "necrobot-utils": "workspace:*"
  }
}
```

**repos/necrobot-dashboard/package.json:**
```json
{
  "dependencies": {
    "necrobot-utils": "workspace:*"
  }
}
```

### Step 3.3: Reinstall Dependencies

```bash
rm -rf node_modules
rm -rf repos/*/node_modules
npm ci --workspaces

# Verify installation
npm list @rarsus/necrobot-*
```

### Step 3.4: Update Import Paths (if needed)

All imports should remain the same:
```javascript
const { DatabaseService } = require('necrobot-utils');
const CommandLoader = require('necrobot-core');
```

These should work via npm workspace resolution automatically.

### Step 3.5: Commit Configuration Changes

```bash
git add package.json package-lock.json repos/*/package.json
git commit -m "chore(migration): Update workspace configuration after monorepo consolidation

- Changed from submodule references to workspace:* protocol
- Reinstalled all dependencies
- npm workspaces fully functional"
```

---

## Phase 4: Update GitHub Actions Workflows (16 hours)

### Step 4.1: Update testing.yml

Key changes:
- No more submodule initialization (remove `submodules: recursive`)
- All workspace tests in single matrix
- Single publish job instead of per-package
- Update all workspace references

**File:** `.github/workflows/testing.yml`

Changes:
```yaml
- name: Checkout code
  uses: actions/checkout@v4
  # REMOVE: submodules: recursive
  # No longer needed - all code in single repo

- name: Run all workspace tests
  run: npm test -- --coverage

- name: Run all workspace linting
  run: npm run lint

- name: Build all packages
  run: npm run build -- --workspaces
```

### Step 4.2: Update pr-checks.yml

Remove submodule steps, streamline workflow.

### Step 4.3: Update security.yml

Remove submodule steps, ensure all workspaces scanned.

### Step 4.4: Update publish-packages.yml

Major changes:
- Single checkout (no submodule recursion)
- Per-workspace publishing with proper dependency order
- Updated version detection logic

### Step 4.5: Create publish-workspace.yml

New workflow for per-workspace publishing:

```yaml
name: Publish Workspace Package

on:
  push:
    paths:
      - 'repos/necrobot-${{ matrix.package }}/**'
      - 'package.json'
      - 'package-lock.json'

jobs:
  publish:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [utils, core, commands, dashboard]
        
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          scope: '@rarsus'
          
      - run: npm ci --workspaces
      - run: npm test --workspace=repos/necrobot-${{ matrix.package }}
      - run: npm publish --workspace=repos/necrobot-${{ matrix.package }}
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Phase 5: Create Root-Level Scripts (6 hours)

### Step 5.1: Add Utility Scripts

Update root `package.json` scripts section:

```json
{
  "scripts": {
    "test": "npm test --workspaces",
    "test:integration": "npm test --workspaces",
    "test:watch": "npm run test:watch --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    
    "format": "npm run format --workspaces",
    "format:check": "npm run format:check --workspaces",
    
    "build": "npm run build --workspaces",
    
    "validate:node": "node scripts/validate-node-version.js",
    "validate:workspaces": "node scripts/validate-workspaces.js",
    
    "workspaces:list": "npm list --workspaces --depth=0",
    "workspaces:status": "node scripts/workspaces-status.js",
    
    "prepare": "husky install"
  }
}
```

### Step 5.2: Create workspaces-status.js Script

Creates script to show status of all workspaces (version, branch, last commit).

### Step 5.3: Create validate-workspaces.js Script

Creates script to verify all workspaces are healthy (tests pass, linting passes, etc.).

---

## Phase 6: Documentation Updates (8 hours)

### Step 6.1: Create MONOREPO.md

New file: `docs/guides/MONOREPO.md`

Contents:
- Architecture overview (monorepo structure)
- How workspaces work
- Local development setup
- Running tests across workspaces
- Publishing process
- Troubleshooting common issues

### Step 6.2: Update CONTRIBUTING.md

Add sections:
- Monorepo development workflow
- Running tests for specific workspace
- Commit conventions (per-workspace prefix)
- Publishing guidelines

### Step 6.3: Update README.md

Add section:
- Directory structure explanation
- Repository status (now unified)
- Development setup (simplified)
- Quick links to workspaces

### Step 6.4: Create MONOREPO-FAQ.md

Common questions and answers:
- "Where is the X package code?" → "In repos/necrobot-X/"
- "How do I run tests for one package?" → "npm test --workspace=repos/necrobot-X"
- "What about separate versioning?" → "Each package.json maintains own version"
- "Can I still publish individually?" → "Yes, publishing is per-package"

---

## Phase 7: Testing & Verification (6 hours)

### Step 7.1: Local Testing

```bash
# Verify workspaces
npm workspaces list

# Run all tests
npm test

# Run linting
npm run lint

# Build all packages
npm run build

# Verify imports work
node -e "console.log(require('necrobot-utils'))"
```

### Step 7.2: Verify Git History

```bash
# Check total commits (should be ~300+)
git log --oneline | wc -l

# Verify each package history
git log --oneline --all -- repos/necrobot-utils | head -10
git log --oneline --all -- repos/necrobot-core | head -10
git log --oneline --all -- repos/necrobot-commands | head -10
git log --oneline --all -- repos/necrobot-dashboard | head -10

# Verify tags exist
git tag | grep -E "v[0-9]" | sort
```

### Step 7.3: Test in Clean Environment

```bash
# Clone in temp directory
cd /tmp
git clone /home/olav/repo/necromundabot necromundabot-test
cd necromundabot-test

# Run full test suite
npm ci --workspaces
npm test

# Verify Docker build
docker-compose up --build -d
docker logs necromundabot
docker-compose down
```

### Step 7.4: Verify Workflows

Commit to migration branch and verify GitHub Actions:
- testing.yml should pass
- pr-checks.yml should pass
- security.yml should pass
- All checks green ✅

---

## Phase 8: Final Steps (2 hours)

### Step 8.1: Create Final Migration Summary

Create file: `project-docs/MONOREPO-MIGRATION-SUMMARY.md`

Contents:
- Migration completion date
- Before/after statistics
- Breaking changes (none)
- Migration validation results
- Future improvements

### Step 8.2: Commit All Changes

```bash
git add -A
git commit -m "chore(migration): Complete monorepo consolidation (Approach A)

MIGRATION SUMMARY:
- Consolidated 4 git submodules into single repository
- Preserved all git history and commits
- Maintained directory structure (repos/necrobot-*)
- Updated all npm workspace configurations
- Updated all GitHub Actions workflows
- Zero breaking changes to published packages
- All 147 tests passing
- All workflow validation passing

STATISTICS:
- Total commits: ~350+ (preserved from all repos)
- Total lines of code: ~45,000
- Total test files: 10
- Total packages: 4
- Directory structure: Unchanged

FUTURE IMPROVEMENTS:
- Consider monorepo tool (Lerna, Turborepo, Nx) for further optimization
- Automated changelog generation per-package
- Per-package CI/CD optimization"
```

### Step 8.3: Create Pull Request

```bash
git push origin migration/approach-a-monorepo-consolidation
# Create PR on GitHub with comprehensive description
```

### Step 8.4: Merge to Main

```bash
# After review and all checks pass
git checkout main
git pull origin main
git merge migration/approach-a-monorepo-consolidation
git push origin main

# Tag release
git tag -a v0.4.0-monorepo -m "chore: Monorepo consolidation (Approach A)"
git push origin v0.4.0-monorepo
```

---

## Rollback Strategy

If issues arise at any point:

```bash
# Return to pre-migration state
git checkout backup/main-pre-monorepo-migration

# Or reset submodules
git submodule deinit -f repos/necrobot-core repos/necrobot-utils repos/necrobot-commands repos/necrobot-dashboard
git submodule update --init --recursive
```

---

## Effort Breakdown

| Phase | Task | Hours | Status |
|-------|------|-------|--------|
| 1 | Preparation & Backup | 4 | Not Started |
| 2 | Git Submodule Conversion | 12 | Not Started |
| 3 | Configuration Updates | 8 | Not Started |
| 4 | GitHub Actions Updates | 16 | Not Started |
| 5 | Utility Scripts | 6 | Not Started |
| 6 | Documentation | 8 | Not Started |
| 7 | Testing & Verification | 6 | Not Started |
| 8 | Final Steps | 2 | Not Started |
| **TOTAL** | | **62** | |

---

## Success Criteria

- ✅ All 4 submodules converted to directories
- ✅ All git history preserved (350+ commits)
- ✅ All npm workspaces functional
- ✅ All 147 tests passing
- ✅ All workflow validation passing
- ✅ Docker build successful
- ✅ Zero breaking changes
- ✅ Complete documentation
- ✅ Merged to main and tested in clean environment

