# Tag Validation & Semver Strategy Integration

**Status:** ✅ COMPLETE  
**Date:** January 30, 2026  
**Component:** Workspace Versioning System  
**Focus:** Tag validation using Semantic Versioning strategy

---

## Overview

The tag validation system ensures all workspace and root tags follow **Semantic Versioning (SemVer)** strategy before and after creation. This is critical for maintaining version consistency across the monorepo and preventing invalid version progressions.

---

## What Was Implemented

### 1. **New Validation Script**

**File:** `scripts/validate-workspace-tags.js` (220+ lines)

**Purpose:** Validates git tags against SemVer rules before and after creation

**Features:**

- ✅ Validates SemVer format (MAJOR.MINOR.PATCH)
- ✅ Prevents version downgrades
- ✅ Checks all 4 workspace tags + root tag
- ✅ Supports multiple modes: pre-tagging, check-only, strict
- ✅ Detailed validation reports with clear output
- ✅ Graceful handling of first-time tagging

**Modes:**

- **Pre-tagging (default):** Validates before tag creation
- **Check-only (--check):** Validates existing tags
- **Strict (--strict):** Fails on any issues (not just critical ones)

### 2. **New npm Scripts**

**Added to package.json:**

```json
{
  "validate:tags": "node scripts/validate-workspace-tags.js",
  "validate:tags:strict": "node scripts/validate-workspace-tags.js --strict",
  "validate:tags:check": "node scripts/validate-workspace-tags.js --check"
}
```

**Usage:**

```bash
# Pre-tagging validation (checks before creating tags)
npm run validate:tags:strict

# Check existing tags only
npm run validate:tags:check

# Default validation
npm run validate:tags
```

### 3. **Updated Workflows**

#### **workspace-versioning.yml**

Added **3 new steps** to the tag creation process:

1. **Pre-validation step** (BEFORE tag creation)

   ```yaml
   - name: ✅ Validate tags against SemVer strategy
     run: npm run validate:tags:strict
   ```

2. **Tag creation step** (existing, unchanged)

   ```yaml
   - name: 🏷️ Create git tags for workspaces
     run: npm run version:tag:push
   ```

3. **Post-validation step** (AFTER tag creation)
   ```yaml
   - name: ✅ Verify all tags created successfully
     run: npm run validate:tags:check
   ```

**Result:** Tags are validated before creation AND verified after creation.

#### **release.yml**

Added **3 new steps** to the release workflow:

1. **Pre-validation step** (lines 268-271)
2. **Tag creation step** (lines 273-305, with new validation)
3. **Post-validation step** (lines 307-311)

**Result:** All release tags are validated according to SemVer strategy.

---

## Semantic Versioning Rules Being Enforced

### Format Validation

✅ **Valid formats:**

- `1.0.0` (MAJOR.MINOR.PATCH)
- `2.3.4`
- `0.1.0`

❌ **Invalid formats:**

- `1.0` (missing PATCH)
- `1` (incomplete)
- `1.0.0-alpha` (without additional semver configuration)
- `latest` (not a version)

### Version Progression Rules

✅ **Allowed:**

- `1.0.0` → `1.0.1` (PATCH bump - bug fixes)
- `1.0.0` → `1.1.0` (MINOR bump - new features)
- `1.0.0` → `2.0.0` (MAJOR bump - breaking changes)
- `1.0.0` → `1.0.0` (no change, existing tag)

❌ **Not allowed:**

- `1.0.0` → `0.9.0` (downgrade)
- `2.0.0` → `1.5.0` (downgrade)
- Invalid format → any format

### Workspace vs Root Versions

**Workspace Tags Format:** `{workspace-name}@{version}`

- Example: `necrobot-utils@1.0.0`
- Tracked independently per workspace
- Current: All at 1.0.0

**Root Tag Format:** `v{version}`

- Example: `v3.3.0`
- Tracks overall project version
- Current: At 3.3.0

---

## How It Works

### Step-by-Step Validation Flow

```
1. Version Bump Occurs
   ├─ package.json versions updated
   └─ Versions written to disk

2. PRE-VALIDATION (NEW)
   ├─ Read all package.json versions
   ├─ Check SemVer format for each
   ├─ Compare against existing tags
   ├─ Validate no downgrade
   └─ FAIL if invalid → Stop workflow

3. TAG CREATION
   ├─ Create workspace tags (necrobot-*@version)
   ├─ Create root tag (v{version})
   └─ Push all tags to GitHub

4. POST-VALIDATION (NEW)
   ├─ Verify all tags exist
   ├─ Confirm SemVer compliance
   └─ FAIL if verification fails → Alert team

5. Workflow Complete
   └─ All tags validated and pushed
```

### Validation Logic

For each workspace + root:

```javascript
// 1. Read version from package.json
const version = getPackageVersion('path/to/package.json');

// 2. Validate SemVer format
if (!semver.valid(version)) {
  FAIL('Invalid format');
}

// 3. Get latest existing tag
const latestTag = getExistingTags(pattern);

// 4. Validate no downgrade
if (semver.lt(version, latestTag)) {
  FAIL('Version downgrade');
}

// 5. Success
PASS('All validations passed');
```

---

## Test Results

### Current Status

```
🔍 Validation Summary:
   ✅ Passed: 5 (all workspaces + root)
   ⚠️  Warnings: 5 (versions unchanged)
   ❌ Failed: 0

✅ All tags are valid according to SemVer strategy!
```

### Test Scenarios Covered

✅ **Format validation:**

- Detects invalid versions
- Accepts valid X.Y.Z format

✅ **Progression validation:**

- Allows version bumps
- Prevents downgrades
- Handles first-time tagging

✅ **Multi-workspace:**

- Validates all 4 workspaces independently
- Validates root separately
- Consistent rules across all

✅ **Tag comparison:**

- Reads existing tags from git
- Compares using semver.compare()
- Detects unchanged versions

---

## Integration Points

### In workspace-versioning.yml

**Location:** Lines 206-225 (new lines added around original 207-212)

```yaml
# Step 1: Validate BEFORE creating tags
- name: ✅ Validate tags against SemVer strategy
  run: npm run validate:tags:strict

# Step 2: Create tags (original step)
- name: 🏷️ Create git tags for workspaces
  run: npm run version:tag:push

# Step 3: Verify AFTER creating tags
- name: ✅ Verify all tags created successfully
  run: npm run validate:tags:check
```

### In release.yml

**Location:** Lines 268-311 (new steps around original 267)

```yaml
# Step 1: Validate BEFORE creating tags
- name: ✅ Validate all tags against SemVer strategy
  run: npm run validate:tags:strict

# Step 2: Create tags (enhanced step)
- name: 🏷️ Create Release Tags (All Workspaces + Root)
  run: |
    # Tag creation logic...
    # Tags created in @{workspace}@version format

# Step 3: Verify AFTER creating tags
- name: ✅ Verify all tags created successfully
  run: npm run validate:tags:check
```

---

## Usage Examples

### Check Validation Before Release

```bash
# Pre-check tags before any workflow
npm run validate:tags:strict

# Output:
# 🔍 Pre-tagging mode: Validating tags before creation
# 📦 Workspace Tags:
# ✅ necrobot-utils: Version 1.0.0 (SemVer valid)
# ✅ necrobot-core: Version 1.0.0 (SemVer valid)
# ...
# ✅ All tags are valid according to SemVer strategy!
```

### Verify Existing Tags

```bash
# Check tags that were already created
npm run validate:tags:check

# Output:
# 🔍 Check-only mode: Validating existing tags
# ✅ All tags are valid!
```

### Strict Mode (Fail on Issues)

```bash
# Enforce strict validation (fail on any issue)
npm run validate:tags:strict

# Exit code 0 = All valid
# Exit code 1 = Any issue found (in strict mode)
```

---

## Benefits

### For Development

1. **Early Error Detection**
   - Validates BEFORE tag creation
   - Prevents invalid tags from being pushed
   - Clear error messages

2. **Consistency Guarantee**
   - All tags follow SemVer
   - No version downgrades possible
   - Predictable versioning behavior

3. **Workflow Safety**
   - Pre-validation catches issues early
   - Post-validation confirms success
   - Both workflows (versioning + release) protected

### For CI/CD

1. **Automated Enforcement**
   - No manual tag checking needed
   - Runs automatically in workflows
   - Strict mode prevents invalid releases

2. **Audit Trail**
   - Clear validation reports
   - Timestamp of validations
   - Success/failure documented

3. **Recovery Protection**
   - Can't accidentally downgrade versions
   - Can catch tag conflicts early
   - Easy rollback if needed

---

## Error Handling

### Invalid Format Example

```
❌ necrobot-utils: Invalid SemVer format: "1.0" (expected MAJOR.MINOR.PATCH)
```

**Solution:**

- Fix package.json to have valid format (e.g., `1.0.0`)
- Re-run validation

### Version Downgrade Example

```
❌ necrobot-core: Version downgrade not allowed: 1.0.0 → 0.9.0
```

**Solution:**

- Don't downgrade versions
- Use proper semver progression (1.0.0 → 1.0.1 for patches)

### No Tags Yet (First Time)

```
✅ necrobot-dashboard: First tag: necrobot-dashboard@1.0.0
```

**Behavior:**

- Allows creation of first tag
- No comparison against previous tag
- Expected for new packages

---

## Configuration

### semver Module

The validation uses the **semver npm package** (v7.7.3):

```javascript
const semver = require('semver');

// Validate format
semver.valid('1.0.0'); // true
semver.valid('1.0'); // null

// Compare versions
semver.compare('1.0.0', '1.0.1'); // -1 (first is less)
semver.lt('1.0.0', '1.0.1'); // true

// Check for downgrade
semver.lt(newVersion, oldVersion); // true = downgrade!
```

### Validation Rules (in script)

Can be customized in `scripts/validate-workspace-tags.js`:

- Workspace names: Lines 27-30
- Tag format: Line 28 (`tagFormat` property)
- Validation rules: Lines 130-160

---

## Next Steps

### Phase 1: ✅ COMPLETE

- ✅ Tag validation script created
- ✅ npm scripts added
- ✅ Both workflows updated
- ✅ Local testing passed

### Phase 2: Monitor (Ongoing)

- Monitor next workflow runs
- Verify pre-validation catches issues (if any)
- Verify post-validation confirms tags
- Collect team feedback

### Phase 3: Enhancement (Optional)

- Add pre-release support (alpha, beta, rc)
- Add version jump validation
- Add automated changelog generation
- Add tag-specific commit messages

---

## Key Files Modified

| File                                         | Changes                  | Lines |
| -------------------------------------------- | ------------------------ | ----- |
| `scripts/validate-workspace-tags.js`         | NEW                      | 220+  |
| `package.json`                               | Add 3 validation scripts | +3    |
| `.github/workflows/workspace-versioning.yml` | Add pre/post validation  | +15   |
| `.github/workflows/release.yml`              | Add pre/post validation  | +15   |

**Total Changes:** 4 files modified, 1 script created, ~50 lines of workflow additions

---

## Compliance

This implementation follows the established patterns in the NecromundaBot codebase:

✅ **Follows established semver rules** (from docs/guides/RELEASE-PROCESS.md)  
✅ **Consistent with other validation scripts** (see validate-node-version.js)  
✅ **Integrates cleanly into existing workflows**  
✅ **Non-breaking for existing processes**  
✅ **Improves automation and safety**

---

## Troubleshooting

### Validation Fails Locally

```bash
# Ensure semver is installed
npm ls semver

# Reinstall if needed
npm install semver

# Test validation
npm run validate:tags:check
```

### Tags Not Found

```bash
# List all tags
git tag -l

# Check git is initialized
git rev-parse --git-dir
```

### Workflow Fails in GitHub Actions

1. Check workflow logs: Actions → Workflow name → Failed job
2. Look for validation step output
3. Check error message and fix accordingly
4. Re-run workflow

---

## Documentation

- Main release process: [docs/guides/RELEASE-PROCESS.md](../docs/guides/RELEASE-PROCESS.md)
- Versioning system: [project-docs/WORKSPACE-VERSIONING-COMPLETE.md](../project-docs/WORKSPACE-VERSIONING-COMPLETE.md)
- SemVer specification: [semver.org](https://semver.org/)

---

**Last Updated:** January 30, 2026  
**Status:** ✅ Ready for production use  
**Next Review:** After first release with tag validation enabled
