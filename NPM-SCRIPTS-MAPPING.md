# npm Scripts Mapping & Recommendations

**Date:** January 29, 2026  
**Purpose:** Complete mapping of scripts/ folder scripts to npm scripts

---

## Current npm Scripts Status

### Currently Mapped ✅ (11 scripts)

```json
{
  "test": "npm test --workspaces",
  "test:integration": "npm test --workspaces",
  "test:watch": "npm run test:watch --workspaces",
  "test:coverage": "npm run test:coverage --workspaces",
  "test:quick": "npm test --workspaces -- --bail",
  "test:security": "(npm audit --json > audit.json || true) && echo '✅ Security check passed'",
  "test:smoke": "npm run build && npm test --workspaces -- --testNamePattern='smoke'",
  "lint": "npm run lint --workspaces",
  "lint:fix": "npm run lint:fix --workspaces",
  "format": "npm run format --workspaces",
  "format:check": "npm run format:check --workspaces",
  "build": "npm run build --workspaces 2>/dev/null || true",
  "coverage:report": "npm run test:coverage --workspaces -- --coverage",
  "validate:node": "node scripts/validate-node-version.js",
  "validate:workspaces": "node scripts/validate-workspaces.js",
  "validate:docs": "npm run validate:docs --workspaces || true",
  "validate:docs:strict": "npm run validate:docs --workspaces",
  "validate:links": "node scripts/validate-links.js",
  "workspaces:list": "npm list --workspaces --depth=0",
  "workspaces:status": "node scripts/workspaces-status.js",
  "workspaces:validate": "node scripts/validate-workspaces.js",
  "version:sync": "node scripts/sync-package-versions.js",
  "version:sync:set": "node scripts/sync-package-versions.js",
  "prepare": "husky install"
}
```

**Count:** 23 npm scripts currently defined

---

## Missing npm Script Mappings ❌

### Scripts Without npm Equivalents

| Script File                       | Missing npm Script | Recommended Command    | Priority  |
| --------------------------------- | ------------------ | ---------------------- | --------- |
| analyze-version-impact.js         | ❌                 | `analyze:version`      | 🔴 HIGH   |
| verify-package-versions.js        | ❌                 | `verify:packages`      | 🔴 HIGH   |
| sync-vulnerability-baseline.js    | ❌                 | `sync:vulnerabilities` | 🟡 MEDIUM |
| compare-audit-against-baseline.sh | ❌                 | `audit:compare`        | 🟡 MEDIUM |
| create-release.sh                 | ❌                 | `release`              | 🔴 HIGH   |

---

## Recommended npm Script Additions

### Complete Updated package.json Scripts

```json
{
  "scripts": {
    "test": "npm test --workspaces",
    "test:integration": "npm test --workspaces",
    "test:watch": "npm run test:watch --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    "test:quick": "npm test --workspaces -- --bail",
    "test:security": "(npm audit --json > audit.json || true) && echo '✅ Security check passed'",
    "test:smoke": "npm run build && npm test --workspaces -- --testNamePattern='smoke'",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "format": "npm run format --workspaces",
    "format:check": "npm run format:check --workspaces",
    "build": "npm run build --workspaces 2>/dev/null || true",
    "coverage:report": "npm run test:coverage --workspaces -- --coverage",
    "validate:node": "node scripts/validate-node-version.js",
    "validate:workspaces": "node scripts/validate-workspaces.js",
    "validate:docs": "npm run validate:docs --workspaces || true",
    "validate:docs:strict": "npm run validate:docs --workspaces",
    "validate:links": "node scripts/validate-links.js",
    "workspaces:list": "npm list --workspaces --depth=0",
    "workspaces:status": "node scripts/workspaces-status.js",
    "workspaces:validate": "node scripts/validate-workspaces.js",
    "version:sync": "node scripts/sync-package-versions.js",
    "version:sync:set": "node scripts/sync-package-versions.js",
    "analyze:version": "node scripts/analyze-version-impact.js",
    "verify:packages": "node scripts/verify-package-versions.js",
    "sync:vulnerabilities": "node scripts/sync-vulnerability-baseline.js",
    "audit:compare": "bash scripts/compare-audit-against-baseline.sh",
    "audit:compare:strict": "bash scripts/compare-audit-against-baseline.sh --fail-on-new",
    "audit:compare:json": "bash scripts/compare-audit-against-baseline.sh --json",
    "release": "bash scripts/create-release.sh",
    "prepare": "husky install"
  }
}
```

**New Scripts to Add:** 8
**Total Scripts Will Be:** 31

---

## Detailed Mapping by Script

### 1. analyze-version-impact.js

**Current Status:** ❌ NO npm SCRIPT

**What It Does:**

- Analyzes git commits since last release
- Determines semantic version bump
- Categorizes commits (feat, fix, breaking, etc.)
- Recommends version increment

**Recommended npm Scripts:**

```json
{
  "scripts": {
    "analyze:version": "node scripts/analyze-version-impact.js",
    "analyze:version:from": "node scripts/analyze-version-impact.js"
  }
}
```

**Usage Examples:**

```bash
# Analyze from last git tag
npm run analyze:version

# Analyze from specific tag
npm run analyze:version -- v0.2.0

# Show recommended version bump
npm run analyze:version | grep "Recommended"

# Use in CI/CD
VERSION=$(npm run analyze:version --silent | grep "Recommended" | awk '{print $NF}')
echo "New version: $VERSION"
```

**Integration Points:**

- Used by create-release.sh for auto-analysis
- Should run before version:sync
- Part of release workflow

---

### 2. verify-package-versions.js

**Current Status:** ❌ NO npm SCRIPT

**What It Does:**

- Verifies published package versions on GitHub Packages
- Compares local vs published versions
- Supports strict mode for CI/CD
- Returns exit codes for automation

**Recommended npm Scripts:**

```json
{
  "scripts": {
    "verify:packages": "node scripts/verify-package-versions.js",
    "verify:packages:strict": "node scripts/verify-package-versions.js --strict"
  }
}
```

**Usage Examples:**

```bash
# Check if packages are published correctly
npm run verify:packages

# Strict mode (fails if any mismatch)
npm run verify:packages:strict

# Use in release workflow
npm run verify:packages:strict || exit 1
```

**Integration Points:**

- Post-release validation
- CI/CD pipeline verification
- Publishing workflow

---

### 3. sync-vulnerability-baseline.js

**Current Status:** ❌ NO npm SCRIPT

**What It Does:**

- Synchronizes vulnerability baseline with acceptance log
- Generates markdown documentation
- Tracks exemption expiration
- Updates VULNERABILITY-ACCEPTANCE-LOG.md

**Recommended npm Scripts:**

```json
{
  "scripts": {
    "sync:vulnerabilities": "node scripts/sync-vulnerability-baseline.js"
  }
}
```

**Usage Examples:**

```bash
# Regenerate vulnerability acceptance log
npm run sync:vulnerabilities

# Use when baseline changes
npm run sync:vulnerabilities && git add .github/

# Validate before commit
npm run sync:vulnerabilities || exit 1
```

**Integration Points:**

- Post-audit-baseline updates
- Documentation generation
- Pre-commit hook validation

---

### 4. compare-audit-against-baseline.sh

**Current Status:** ❌ NO npm SCRIPT  
**Requires:** bash, jq (dependency!)

**What It Does:**

- Compares current npm audit vs baseline
- Detects new vulnerabilities
- Supports JSON output
- Returns appropriate exit codes

**Recommended npm Scripts:**

```json
{
  "scripts": {
    "audit:compare": "bash scripts/compare-audit-against-baseline.sh",
    "audit:compare:strict": "bash scripts/compare-audit-against-baseline.sh --fail-on-new",
    "audit:compare:json": "bash scripts/compare-audit-against-baseline.sh --json"
  }
}
```

**Usage Examples:**

```bash
# Check vulnerability status
npm run audit:compare

# Fail if new vulnerabilities found
npm run audit:compare:strict || echo "New vulnerabilities detected"

# Get JSON output for parsing
npm run audit:compare:json | jq '.newPackages'

# Use in GitHub Actions
npm run audit:compare:json > audit-report.json
```

**Dependency Verification:**

```bash
# Check if jq is available
which jq || {
  echo "jq not installed. Install with:"
  echo "  Ubuntu/Debian: sudo apt-get install jq"
  echo "  macOS: brew install jq"
  exit 1
}
```

**Integration Points:**

- GitHub Actions security workflows
- Pre-commit hooks
- CI/CD baseline validation

---

### 5. create-release.sh

**Current Status:** ❌ NO npm SCRIPT  
**Requires:** bash, git  
**Issues:** Platform compatibility (see SCRIPTS-ANALYSIS-REPORT.md)

**What It Does:**

- Creates versioned releases
- Updates package.json versions
- Creates git commits and tags
- Provides release summary

**Recommended npm Scripts:**

```json
{
  "scripts": {
    "release": "bash scripts/create-release.sh",
    "release:dry": "bash scripts/create-release.sh --dry-run"
  }
}
```

**Usage Examples:**

```bash
# Create release with specific version
npm run release -- 0.3.0

# Auto-detect version from commits
npm run release

# Dry-run to preview changes (when --dry-run is implemented)
npm run release:dry -- 0.3.0

# Check what would be released
npm run release:dry | head -30
```

**Integration Points:**

- Manual release process
- CI/CD release pipeline
- Semantic versioning workflow

**Safety Checklist Before Use:**

```bash
# 1. Clean working directory
git status  # Should be clean

# 2. Up-to-date with remote
git pull origin main

# 3. No uncommitted changes
git diff --exit-code

# 4. Verify current version
npm run version:info

# 5. Check last tag
git tag | tail -5
```

---

## Grouped npm Script Organization

### By Category

#### Testing & Quality

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:quick       # Fast test (bail on first failure)
npm run lint             # Lint all code
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code
npm run format:check     # Check formatting without changes
```

#### Validation & Verification

```bash
npm run validate:node      # Check Node.js version
npm run validate:links     # Verify documentation links
npm run validate:docs      # Validate docs (lenient)
npm run validate:docs:strict  # Validate docs (strict)
npm run validate:workspaces   # Validate monorepo structure

npm run verify:packages    # Verify published package versions
npm run audit:compare      # Compare vulnerabilities vs baseline
npm run audit:compare:strict  # Fail if new vulnerabilities
```

#### Workspace Management

```bash
npm run workspaces:list    # List all workspaces
npm run workspaces:status  # Show workspace status
npm run workspaces:validate # Validate workspace setup
npm run version:sync       # Sync all package versions
npm run analyze:version    # Analyze commit history for version
npm run sync:vulnerabilities # Update vulnerability acceptance log
```

#### Release & Deployment

```bash
npm run release            # Create a release
npm run release:dry        # Preview release (when implemented)
npm run build              # Build all packages
npm run coverage:report    # Generate coverage report
```

---

## Migration Strategy

### Phase 1: Immediate (This Week)

1. **Add npm script mappings** to package.json

   ```bash
   npm set-script analyze:version "node scripts/analyze-version-impact.js"
   npm set-script verify:packages "node scripts/verify-package-versions.js"
   npm set-script sync:vulnerabilities "node scripts/sync-vulnerability-baseline.js"
   npm set-script audit:compare "bash scripts/compare-audit-against-baseline.sh"
   npm set-script release "bash scripts/create-release.sh"
   ```

2. **Make bash scripts executable**

   ```bash
   chmod +x scripts/*.sh
   ```

3. **Test each new script**
   ```bash
   npm run analyze:version
   npm run verify:packages
   npm run sync:vulnerabilities
   npm run audit:compare
   npm run release --help  # Should show help
   ```

### Phase 2: Validation (Week 2)

1. **Check platform compatibility**
   - Test on Linux
   - Test on macOS
   - Test on Windows (WSL)

2. **Add dependency checks**

   ```bash
   # Add to scripts/validate-dependencies.sh
   which jq || echo "Missing: jq"
   ```

3. **Document in README**
   - List all npm scripts
   - Provide usage examples
   - Link to detailed guides

### Phase 3: Integration (Week 3)

1. **Update GitHub Actions workflows**
   - Use `npm run analyze:version` instead of direct script
   - Use `npm run audit:compare` in CI/CD

2. **Update developer documentation**
   - Script usage guide
   - Troubleshooting guide
   - Common tasks

3. **Add pre-commit validation**
   ```bash
   # .husky/pre-commit
   npm run validate:workspaces || exit 1
   npm run validate:links || exit 1
   ```

---

## npm Script Groups by Frequency

### Daily Scripts (Developers)

```bash
npm run lint:fix           # Fix lint issues
npm run format             # Format code
npm run test               # Run tests
npm run test:watch        # Watch tests
```

### Weekly Scripts (Code Maintenance)

```bash
npm run validate:workspaces    # Check structure
npm run workspaces:status      # Check health
npm run audit:compare          # Check vulnerabilities
```

### Monthly Scripts (Releases)

```bash
npm run analyze:version        # Determine version
npm run release                # Create release
npm run verify:packages        # Verify published
```

### As-Needed Scripts

```bash
npm run validate:docs:strict   # Before documentation review
npm run coverage:report        # For metrics
npm run sync:vulnerabilities   # When vulnerabilities change
```

---

## Shell Script Execution via npm

### Why Use npm Scripts for Shell Scripts?

1. **Discoverability:** `npm run` lists all available scripts
2. **Cross-platform:** npm handles path separators
3. **Environment:** Consistent environment across developers
4. **CI/CD:** Same scripts run locally and in pipelines

### Example: npm run vs Direct Execution

```bash
# ❌ Direct execution (not discoverable)
./scripts/create-release.sh 0.3.0

# ✅ npm script (discoverable)
npm run release -- 0.3.0

# ✅ With options
npm run release:dry -- 0.3.0
```

### Important: Arguments with npm run

When passing arguments to npm scripts, use `--` separator:

```bash
# ✅ Correct
npm run analyze:version -- v0.2.0

# ❌ Wrong (argument goes to npm, not script)
npm run analyze:version v0.2.0

# ✅ Arguments after --
npm run audit:compare -- --fail-on-new --json
```

---

## Quick Reference: All npm Scripts

### Complete List (Current + Recommended)

```bash
# Testing
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
npm run test:quick             # Fast test (bail)
npm run test:integration       # Integration tests
npm run test:smoke             # Smoke tests
npm run test:security          # Security audit

# Code Quality
npm run lint                    # Lint all code
npm run lint:fix               # Auto-fix linting
npm run format                 # Format code
npm run format:check           # Check formatting

# Validation
npm run validate:node          # Check Node.js version
npm run validate:workspaces    # Validate monorepo
npm run validate:docs          # Validate docs
npm run validate:docs:strict   # Strict validation
npm run validate:links         # Check links

# Workspace Management
npm run workspaces:list        # List workspaces
npm run workspaces:status      # Show status
npm run workspaces:validate    # Validate setup

# Version Management
npm run version:sync           # Sync versions
npm run analyze:version        # Analyze commits
npm run verify:packages        # Verify published

# Security & Vulnerabilities
npm run audit:compare          # Compare audit
npm run audit:compare:strict   # Fail if new vulns
npm run audit:compare:json     # JSON output
npm run sync:vulnerabilities   # Update log

# Build & Release
npm run build                  # Build all
npm run coverage:report        # Coverage report
npm run release                # Create release
npm run release:dry            # Preview release

# System
npm run prepare                # Husky install (auto)
```

**Total:** 31 npm scripts (23 current + 8 new)

---

## Script Interaction Diagram

```
npm run analyze:version
         ↓
    Analyzes commits
         ↓
    Suggests version bump
         ↓
npm run version:sync → Updates all package.json
         ↓
npm run release → Creates commit & tag
         ↓
npm run verify:packages → Confirms published
         ↓
npm run sync:vulnerabilities → Updates logs
```

---

## Troubleshooting npm Scripts

### Script Not Found

```bash
# Check if script exists
npm run | grep script-name

# List all scripts
npm run

# Check package.json syntax
npm run --list
```

### Permission Denied on bash scripts

```bash
# Make executable
chmod +x scripts/*.sh

# Verify
ls -la scripts/*.sh
# Should show: -rwxr-xr-x
```

### Wrong Working Directory

```bash
# Scripts run from repository root, not script directory
# If you need to work in a subdirectory, use:
"release": "cd scripts && bash create-release.sh"
```

### Arguments Not Passing

```bash
# ❌ Wrong
npm run release 0.3.0

# ✅ Correct
npm run release -- 0.3.0

# Multiple args
npm run audit:compare -- --fail-on-new --json
```

---

## Summary of Changes

### Changes to Make to package.json

**Add these 8 new scripts:**

```json
"analyze:version": "node scripts/analyze-version-impact.js",
"verify:packages": "node scripts/verify-package-versions.js",
"sync:vulnerabilities": "node scripts/sync-vulnerability-baseline.js",
"audit:compare": "bash scripts/compare-audit-against-baseline.sh",
"audit:compare:strict": "bash scripts/compare-audit-against-baseline.sh --fail-on-new",
"audit:compare:json": "bash scripts/compare-audit-against-baseline.sh --json",
"release": "bash scripts/create-release.sh",
"release:dry": "bash scripts/create-release.sh --dry-run"
```

**Total new scripts:** 8  
**Total scripts after update:** 31

---

**Document Version:** 1.0  
**Date:** January 29, 2026  
**Status:** Ready for Implementation
