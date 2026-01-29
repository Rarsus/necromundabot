# Scripts Execution Validation Guide

**Date:** January 29, 2026  
**Purpose:** Validate and test each script in the scripts/ folder

---

## Part 1: Quick Validation Commands

### Check File Completeness

```bash
# Count lines in each script
wc -l scripts/*.js scripts/*.sh

# Expected output format:
#   297 scripts/analyze-version-impact.js
#   156 scripts/verify-package-versions.js
#   244 scripts/sync-vulnerability-baseline.js
#   etc.
```

### Check File Permissions

```bash
# Check bash scripts are executable
ls -la scripts/*.sh

# Make executable if needed
chmod +x scripts/*.sh

# Verify:
-rwxr-xr-x ... scripts/compare-audit-against-baseline.sh
-rwxr-xr-x ... scripts/create-release.sh
```

### Check Dependencies

```bash
# Check Node.js version
node --version  # Should be >= 22.0.0

# Check npm version
npm --version   # Should be >= 10.0.0

# Check required Node modules
npm list --depth=0  # Should include semver
```

---

## Part 2: Individual Script Validation

### 1. validate-node-version.js

**Purpose:** Verify Node.js/npm versions meet requirements

**Execution:**

```bash
# Via npm script
npm run validate:node

# Direct
node scripts/validate-node-version.js
```

**Expected Output:**

```
🔍 Validating test environment...
════════════════════════════════════════════════════════════
✅ Node.js:
   Required: >=22.0.0
   Current:  v22.x.x
✅ npm:
   Required: >=10.0.0
   Current:  v10.x.x
════════════════════════════════════════════════════════════

✅ Environment is ready for testing!
```

**Exit Code:** 0 (success) or 1 (failure)

**Validation:** ✅ PASS

---

### 2. validate-workspaces.js

**Purpose:** Validate monorepo workspace structure

**Execution:**

```bash
# Via npm script (primary)
npm run validate:workspaces

# Via npm script (alias)
npm run workspaces:validate

# Direct
node scripts/validate-workspaces.js
```

**Expected Output:**

```
✅ Workspace directory exists: repos/necrobot-utils
✅ Valid package.json: @rarsus/necrobot-utils@0.6.0
✅ Found 20 test files in repos/necrobot-utils
...
✅ All workspaces validated successfully
```

**Exit Code:** 0 (success) or 1 (failure)

**Validation:** ✅ PASS

---

### 3. workspaces-status.js

**Purpose:** Display workspace health and metadata

**Execution:**

```bash
npm run workspaces:status

# Direct
node scripts/workspaces-status.js
```

**Expected Output:**

```
📊 NecromundaBot Workspace Status Report

════════════════════════════════════════════════════════════

1. repos/necrobot-utils
─────────────────────────────────────────────────────────
   Name:        @rarsus/necrobot-utils
   Version:     0.6.0
   Description: NecroBot shared utilities...
   Branch:      main
   Last Commit: abcdef1 feat: update database schema
   Tests:       25 test files
   Code Size:   X.XM
```

**Exit Code:** 0 (always succeeds, informational)

**Validation:** ✅ PASS

---

### 4. validate-links.js

**Purpose:** Check for broken documentation links

**Execution:**

```bash
npm run validate:links

# Direct
node scripts/validate-links.js
```

**Expected Output:**

```
✅ All links validated successfully
```

**Exit Code:** 0 (success) or 1 (broken links found)

**Validation:** ✅ PASS

---

### 5. sync-package-versions.js

**Purpose:** Synchronize all package versions to root version

**Execution:**

```bash
# Sync all to root version
npm run version:sync

# Sync to specific version
node scripts/sync-package-versions.js 0.6.0

# Direct
node scripts/sync-package-versions.js
```

**Expected Output:**

```
📦 Syncing all packages to version: 0.6.0

✅ @rarsus/necrobot-utils@0.6.0 (was 0.5.0)
✅ @rarsus/necrobot-core@0.6.0 (was 0.5.0)
✅ @rarsus/necrobot-commands@0.6.0 (was 0.5.0)
✅ @rarsus/necrobot-dashboard@0.6.0 (was 0.5.0)

📊 Summary: 4 packages checked, 4 updated
✅ All packages synced successfully!
```

**Exit Code:** 0 (always success)

**Validation:** ✅ PASS

---

### 6. validate-links.js

**Purpose:** Verify all markdown links are valid

**Execution:**

```bash
npm run validate:links
```

**Expected Output:**

```
✅ All links validated successfully
```

**Exit Code:** 0 (success) or 1 (broken links)

**Validation:** ✅ PASS

---

### 7. compare-audit-against-baseline.sh

**Purpose:** Compare npm vulnerabilities against baseline

**Execution:**

```bash
# Check if bash script is executable
ls -la scripts/compare-audit-against-baseline.sh
# Should show: -rwxr-xr-x

# Run directly
./scripts/compare-audit-against-baseline.sh

# With options
./scripts/compare-audit-against-baseline.sh --fail-on-new
./scripts/compare-audit-against-baseline.sh --json
```

**Expected Output (Human Readable):**

```
📊 Vulnerability Audit Comparison
==================================
Baseline File: .github/audit-baseline.json
Baseline Total: 0 (HIGH: 0, MODERATE: 0)
Current Total: 0 (HIGH: 0, MODERATE: 0)

Status: ✅ PASS
```

**Expected Output (JSON):**

```json
{
  "status": "✅ PASS",
  "baseline": {
    "total": 0,
    "high": 0,
    "moderate": 0
  },
  "current": {
    "total": 0,
    "high": 0,
    "moderate": 0
  },
  "newPackages": [],
  "acceptable": true
}
```

**Exit Code:** 0 (acceptable) or 1 (new vulnerabilities)

**Dependencies Required:**

- bash (not sh)
- jq (JSON query tool)

**Validation Check:**

```bash
# Check if bash available
which bash
# Output: /bin/bash

# Check if jq available
which jq
# Output: /usr/bin/jq
# If not: sudo apt-get install jq (Linux) or brew install jq (macOS)
```

**Validation:** ⚠️ REQUIRES DEPENDENCIES

---

### 8. create-release.sh

**Purpose:** Create versioned releases with git tags

**Execution:**

```bash
# Make executable first
chmod +x scripts/create-release.sh

# Run with version
./scripts/create-release.sh 0.3.0

# Run for auto-analysis (incomplete)
./scripts/create-release.sh
```

**Expected Output:**

```
════════════════════════════════════════════════════════════
                   Creating Release
════════════════════════════════════════════════════════════

Current Version: 0.2.0
Last Tag: v0.2.0

✅ Creating release for version 0.3.0

1. Updating package.json...
   ✓ Version updated to 0.3.0

2. Creating release commit...
   ✓ Commit created

3. Creating version tag...
   ✓ Tag created: v0.3.0

════════════════════════════════════════════════════════════
                  Release Ready!
════════════════════════════════════════════════════════════

📦 Release Summary:
  Version:  0.3.0
  Tag:      v0.3.0
  Commit:   abc123def45

📋 Next Steps:
  1. Review changes: git log -1
  2. Push to origin: git push origin main --tags
  3. Publish to NPM: npm publish
```

**Exit Code:** 0 (success) or 1 (failure)

**Issues:**

- sed -i syntax incompatible with macOS
- Hardcoded main branch
- No safety checks for dirty working directory

**Validation:** ⚠️ PLATFORM COMPATIBILITY ISSUES

---

### 9. analyze-version-impact.js

**Purpose:** Analyze commits to determine version bump

**Execution:**

```bash
# With specific tag
node scripts/analyze-version-impact.js v0.2.0

# Without tag (analyzes all commits)
node scripts/analyze-version-impact.js
```

**Expected Output:**

```
📊 Version Impact Analysis
═════════════════════════════════════════════════════════

Analyzing commits since: v0.2.0

📈 Commit Summary:
  • feat: 3 commits (Minor version bump)
  • fix: 2 commits (Patch version bump)
  • BREAKING: 0 commits (Major version bump)

🎯 Recommended Bump: MINOR (v0.2.0 → v0.3.0)

Breaking Changes: 0
Features: 3
Fixes: 2
Documentation: 1
Refactoring: 0
Tests: 0

📁 File Changes:
  • src/ : +245 -18
  • tests/ : +85 -5
  • docs/ : +120 -10
  • other/ : +5 -2
```

**Exit Code:** 0 (analysis complete) or 1 (git error)

**Status:** 🔴 FILE INCOMPLETE (100/297 lines)

**Validation:** ❌ INCOMPLETE - Cannot test

---

### 10. verify-package-versions.js

**Purpose:** Verify published package versions on GitHub Packages

**Execution:**

```bash
# Basic check
node scripts/verify-package-versions.js

# Strict mode
node scripts/verify-package-versions.js --strict
```

**Expected Output:**

```
═══════════════════════════════════════════════════════════════════════════════
📦 PACKAGE VERSION VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

Checking published versions on GitHub Packages...

✅ @rarsus/necrobot-utils@0.6.0 - ALIGNED
✅ @rarsus/necrobot-core@0.6.0 - ALIGNED
✅ @rarsus/necrobot-commands@0.6.0 - ALIGNED
✅ @rarsus/necrobot-dashboard@0.6.0 - ALIGNED

═══════════════════════════════════════════════════════════════════════════════
✅ ALL PACKAGES ALIGNED
═══════════════════════════════════════════════════════════════════════════════
```

**Exit Code:**

- 0 = All versions aligned
- 1 = Version mismatch
- 2 = Error during verification

**Dependencies:**

- Access to GitHub Packages registry (may require auth)
- npm authentication token (in ~/.npmrc)

**Status:** ⚠️ FILE INCOMPLETE (100/156 lines)

**Validation:** ❌ INCOMPLETE - Cannot test

---

### 11. sync-vulnerability-baseline.js

**Purpose:** Synchronize vulnerability baseline with acceptance log

**Execution:**

```bash
node scripts/sync-vulnerability-baseline.js
```

**Expected Output:**

```
📝 Synchronizing vulnerability baseline...

✅ Reading baseline: .github/audit-baseline.json
✅ Generating markdown: .github/VULNERABILITY-ACCEPTANCE-LOG.md
✅ Created 12 vulnerability acceptance entries
✅ Expiration tracking updated

📊 Summary:
  • Total accepted: 12
  • Critical: 2
  • High: 5
  • Moderate: 5
  • Days until expiration: 87

✅ Baseline synchronized successfully!
```

**Exit Code:** 0 (success) or 1 (failure)

**Dependencies:**

- .github/audit-baseline.json must exist

**Status:** ⚠️ FILE INCOMPLETE (100/244 lines)

**Validation:** ❌ INCOMPLETE - Cannot test

---

## Part 3: Validation Test Plan

### Pre-Test Checklist

```bash
# 1. Check environment
node --version          # >= 22.0.0
npm --version          # >= 10.0.0
bash --version         # >= 4.0
which jq               # For audit comparison script

# 2. Check file permissions
ls -la scripts/*.sh    # Should all have x permission

# 3. Check git setup
git status             # Working tree clean
git log -1             # Has commit history
git tag                # Has version tags

# 4. Check node_modules
npm list --depth=0     # Dependencies installed

# 5. Check workspace structure
ls -la repos/*/package.json  # All present
```

### Test Sequence

```bash
# Step 1: Test basic validation scripts
npm run validate:node           # Should pass
npm run validate:workspaces     # Should pass
npm run validate:links          # Should pass
npm run workspaces:status       # Should show status

# Step 2: Test version management
npm run version:sync            # Should sync or report already synced

# Step 3: Test audit comparison (if jq installed)
./scripts/compare-audit-against-baseline.sh  # Should show status
./scripts/compare-audit-against-baseline.sh --json  # Should output JSON

# Step 4: Test release script (NO-OP, don't actually release)
# Review only, don't execute:
cat scripts/create-release.sh | grep -A 5 "git push"

# Step 5: Check npm script mappings
npm run                 # List all available scripts
grep "npm run" SCRIPTS-ANALYSIS-REPORT.md  # Review recommendations
```

---

## Part 4: Known Issues & Workarounds

### Issue: sed -i Incompatibility

**Problem:** create-release.sh uses `sed -i.bak` which fails on macOS

**Workaround:**

```bash
# Instead of:
sed -i.bak "s/old/new/" file

# Use:
sed -i .bak "s/old/new/" file  # macOS requires space
# Or use perl (cross-platform):
perl -i.bak -pe 's/old/new/' file
```

**Fix Location:** scripts/create-release.sh, line 49

---

### Issue: jq Dependency Not Checked

**Problem:** compare-audit-against-baseline.sh requires jq but doesn't validate

**Workaround:**

```bash
# Check if jq is installed
which jq || echo "jq not found. Install: apt-get install jq"

# Install if missing
sudo apt-get install jq          # Linux
# or
brew install jq                  # macOS
```

**Fix:** Add dependency check script

---

### Issue: Incomplete File Implementations

**Problem:** Three scripts are truncated in the repository

**Files Affected:**

- analyze-version-impact.js (100/297 lines)
- verify-package-versions.js (100/156 lines)
- sync-vulnerability-baseline.js (100/244 lines)

**Workaround:**

```bash
# Verify files exist and check size
wc -l scripts/analyze-version-impact.js

# Check git history
git log -p scripts/analyze-version-impact.js | head -20

# Restore from backup or re-download
git checkout HEAD -- scripts/analyze-version-impact.js
```

---

### Issue: No npm Script Mappings

**Problem:** Some scripts have no npm equivalents

**Workaround:**

```bash
# Use direct execution instead of npm run
node scripts/analyze-version-impact.js
./scripts/create-release.sh 0.3.0

# Or add npm scripts manually (see SCRIPTS-ANALYSIS-REPORT.md)
```

---

## Part 5: Automated Testing Script

### Run All Validations

```bash
#!/bin/bash

echo "🧪 Running script validation tests...\n"

PASSED=0
FAILED=0

# Test 1: validate-node-version
echo "Test 1: npm run validate:node"
if npm run validate:node > /dev/null 2>&1; then
  echo "✅ PASS\n"
  ((PASSED++))
else
  echo "❌ FAIL\n"
  ((FAILED++))
fi

# Test 2: validate-workspaces
echo "Test 2: npm run validate:workspaces"
if npm run validate:workspaces > /dev/null 2>&1; then
  echo "✅ PASS\n"
  ((PASSED++))
else
  echo "❌ FAIL\n"
  ((FAILED++))
fi

# Test 3: workspaces-status
echo "Test 3: npm run workspaces:status"
if npm run workspaces:status > /dev/null 2>&1; then
  echo "✅ PASS\n"
  ((PASSED++))
else
  echo "❌ FAIL\n"
  ((FAILED++))
fi

# Test 4: validate-links
echo "Test 4: npm run validate:links"
if npm run validate:links > /dev/null 2>&1; then
  echo "✅ PASS\n"
  ((PASSED++))
else
  echo "❌ FAIL\n"
  ((FAILED++))
fi

# Test 5: sync-package-versions (dry run)
echo "Test 5: node scripts/sync-package-versions.js"
if node scripts/sync-package-versions.js > /dev/null 2>&1; then
  echo "✅ PASS\n"
  ((PASSED++))
else
  echo "❌ FAIL\n"
  ((FAILED++))
fi

# Summary
echo "════════════════════════════════════════════════════════════"
echo "Test Results: $PASSED passed, $FAILED failed"
echo "════════════════════════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed"
  exit 1
fi
```

**Save as:** `scripts/test-all-scripts.sh`

**Run:**

```bash
chmod +x scripts/test-all-scripts.sh
./scripts/test-all-scripts.sh
```

---

## Part 6: Recommended Actions

### Immediate (Today)

- [ ] Run `npm run validate:node` - check environment
- [ ] Run `npm run validate:workspaces` - check structure
- [ ] Run `npm run workspaces:status` - check health
- [ ] Check bash script permissions: `chmod +x scripts/*.sh`
- [ ] Check for jq: `which jq`

### This Week

- [ ] Verify truncated files are complete in repository
- [ ] Add missing npm script mappings
- [ ] Fix create-release.sh cross-platform issues
- [ ] Add jq dependency check

### This Month

- [ ] Document all scripts in README
- [ ] Create script validation tests
- [ ] Automate validation in CI/CD
- [ ] Train team on script usage

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026
