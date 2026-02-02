# Versioning System Recap & Analysis

**Status:** ⚠️ **PARTIAL IMPLEMENTATION** - Workspace-independent versioning mostly working, but ROOT-level changes not properly handled

**Last Updated:** February 2, 2026

---

## Current Implementation vs. Expected Workflow

### YOUR EXPECTED WORKFLOW

```
1. Determine changes in EACH WORKSPACE (respect dependencies)
   1.a. Determine change level (major/minor/patch/none)
   1.b. Update the semver of the respective workspace
   1.c. Test the dependencies

2. Aggregate changes of ALL workspaces
   → Select HIGHEST change level across all workspaces

3. Determine impacting changes in MAIN REPOSITORY (root level)
   3.a. Determine the change level of root changes
   3.b. Determine HIGHEST change between root changes and workspace changes

4. Update root version according to result of 3.b

5. Update ALL package.json files
   5.a. For necrobot-*: Use workspace-specific semver
   5.b. For necromundabot: Use result from step 4

6. Update package-lock.json

7. Create git tags
   7.a. vX.X.X-* for each necrobot-* workspace (workspace semver)
   7.b. vX.X.X for necromundabot (root semver)
```

---

## ACTUAL CURRENT IMPLEMENTATION

### What's Working ✅

```
1. ✅ Workspace change detection per workspace
   1.a. ✅ Determines change level (major/minor/patch/none)
   1.b. ✅ Maps files to workspaces via repos/necrobot-*/
   1.c. ✅ Test dependencies defined in dependencies object

2. ✅ Aggregates workspace changes
   → Selects HIGHEST change across workspaces

3. ❌ ROOT-level changes IGNORED (CRITICAL ISSUE)
   3.a. ❌ Detected but NOT categorized properly
   3.b. ❌ Root changes not used to determine final root bump
   
4. ❌ Root version NOT respecting root-level changes
   → Root version only reflects highest workspace bump
   → Changes to main repo scripts DO NOT trigger root version bump

5. ✅ Updates workspace package.json files correctly
   ❌ Root package.json version only reflects workspace changes

6. ⚠️ package-lock.json updated during `npm ci --workspaces` but not explicitly tagged

7. ❌ Git tags NOT created for versioned releases
   → No vX.X.X-utils, vX.X.X-core tags
   → No vX.X.X root tag
```

---

## The Critical Issue: ROOT-LEVEL CHANGES IGNORED

### Current Code (detect-workspace-changes.js, lines 40-60):

```javascript
// Map file paths to their workspaces
function mapFilesToWorkspaces(files) {
  const mapping = {};

  for (const file of files) {
    if (file.startsWith('repos/necrobot-utils/')) {
      mapping['necrobot-utils'].push(file);
    } else if (file.startsWith('repos/necrobot-core/')) {
      mapping['necrobot-core'].push(file);
    } else if (file.startsWith('repos/necrobot-commands/')) {
      mapping['necrobot-commands'].push(file);
    } else if (file.startsWith('repos/necrobot-dashboard/')) {
      mapping['necrobot-dashboard'].push(file);
    } else if (!file.startsWith('.github/')) {
      // ⚠️ EVERYTHING ELSE (including root changes) goes to 'ROOT'
      if (!mapping['ROOT']) mapping['ROOT'] = [];
      mapping['ROOT'].push(file);  // ← Files ARE detected
    }
  }
  return mapping;
}
```

### The Problem:

1. **Files ARE detected** - Root changes are mapped to a 'ROOT' key
2. **Files are NOT processed** - The ROOT key is never evaluated for semver bump
3. **Result:** Root-level changes exist in the mapping but are never acted upon

### Evidence from analyze-version-impact.js (line 225):

```javascript
// Output structured data for workflow parsing (first set all to NONE)
const workspaces = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];
workspaces.forEach((workspace) => {
  const bumpType = propagated[workspace] || 'none';
  console.log(`${workspace}: ${bumpType.toUpperCase()}`);
});

// ❌ NOTE: 'ROOT' is never output or processed
// The root version bump is calculated separately but only based on workspace changes
```

---

## What Breaks When You Make Root Changes

### Scenario: You commit a fix to `scripts/analyze-version-impact.js`

```bash
git commit -m "fix: correct ROOT_BUMP grep pattern"
# This is a fix: commit (PATCH level)
```

**Current behavior:**
- ✅ File is detected as changed: `scripts/analyze-version-impact.js`
- ✅ File is mapped to 'ROOT' key
- ❌ 'ROOT' key is never evaluated
- ❌ Version stays at current level (no bump)
- ❌ No PATCH bump to root version

**Expected behavior (your workflow):**
- ✅ File is detected as changed
- ✅ File is categorized as ROOT level
- ✅ Commit message parsed: `fix:` = PATCH
- ✅ Root version bumped by PATCH (e.g., 3.0.0 → 3.0.1)
- ✅ Root tag created: v3.0.1
- ✅ Workspace versions stay unchanged

---

## Differences Between Current and Expected

| Aspect | Expected | Current | Status |
|--------|----------|---------|--------|
| **Workspace change detection** | Per workspace | Per workspace | ✅ Working |
| **Workspace semver bump** | Independent per workspace | Independent per workspace | ✅ Working |
| **Root change detection** | Detect changes in main repo | Detect changes in main repo | ✅ Partial |
| **Root semver bump** | Based on highest of (root changes, workspace changes) | Based only on workspace changes | ❌ BROKEN |
| **Root version reflects** | Changes to root + workspace impact | Only workspace impact | ❌ WRONG |
| **Git tags for workspaces** | vX.X.X-utils, vX.X.X-core, etc. | Not created | ❌ Missing |
| **Git tags for root** | vX.X.X | Not created | ❌ Missing |
| **Package.json updates** | Root + all workspaces | Root + all workspaces | ✅ Working |
| **Package-lock.json** | Updated and committed | Updated during install | ⚠️ Partial |

---

## Why ROOT Changes Don't Trigger Updates

### Code Flow Analysis:

**Step 1: File Detection** (detect-workspace-changes.js)
```javascript
// ✅ Detects root files into 'ROOT' key
mapping['ROOT'] = ['scripts/analyze-version-impact.js']
```

**Step 2: Workspace Iteration** (analyze-version-impact.js:225)
```javascript
const workspaces = [
  'necrobot-utils',
  'necrobot-core',
  'necrobot-commands',
  'necrobot-dashboard'
  // ❌ NOTE: 'ROOT' is NOT in this array
];
workspaces.forEach((workspace) => {
  console.log(`${workspace}: ${bump}`);
});
```

**Step 3: Root Version Calculation** (analyze-version-impact.js:242)
```javascript
// Root version bump is determined by HIGHEST workspace bump
let highestBump = 'none';
Object.values(propagated).forEach((bumpType) => {
  // ❌ This iterates over workspace bumps ONLY
  // ❌ 'ROOT' key from detect-workspace-changes is never used
  if ((bumpPriority[bumpType] || 0) > (bumpPriority[highestBump] || 0)) {
    highestBump = bumpType;
  }
});
```

**Result:** 
- Root changes are detected but never processed
- Root version only reflects workspace changes
- 🎯 **This is the core bug**

---

## Best Versioning System Recommendation

### Recommended: Independent Workspace + Root-Aware Versioning

This combines the best of both approaches:

```
WORKSPACE VERSIONING:
├─ Each workspace has independent semver (vX.Y.Z-utils, vX.Y.Z-core)
├─ Bumped based on changes in repos/necrobot-*/
└─ Dependency-aware (if utils changes, core/commands/dashboard might need bump)

ROOT VERSIONING:
├─ Tracks changes to main repository (scripts/, docs/, config, etc.)
├─ Bumped based on HIGHEST of (root changes, max workspace changes)
├─ Independent from workspace versions
└─ Reflects overall project maturity

REASONING:
✅ Users can update individual necrobot-* packages without root bump
✅ Root version communicates project-wide changes
✅ Semantic versioning principles respected for all levels
✅ Clear distinction between package changes and project changes
✅ Easy to track which parts of the system changed
```

### Example Scenario:

**Repository changes:**
```
- fix: correct grep pattern in release.yml → ROOT: PATCH bump
- feat: add new utility function → necrobot-utils: MINOR bump
- no changes → necrobot-core: NO bump
```

**Result:**
```
Old versions:  3.0.0 (root), 1.1.0 (utils), 1.2.0 (core), 2.1.0 (commands), 1.0.0 (dashboard)
Changes:      ↓ (PATCH)      ↓ (MINOR)      — (none)      — (inherit?)           — (none)
New versions:  3.0.1 (root), 1.2.0 (utils), 1.2.0 (core), 2.1.0 (commands), 1.0.0 (dashboard)

Tags created:
  - v3.0.1 (root release)
  - v1.2.0-utils (workspace release)
  - v1.2.0-core (workspace release - bumped due to utils dependency)
```

---

## What Needs to Be Fixed

### Priority 1: Fix ROOT Version Detection (CRITICAL)

**File:** `scripts/analyze-version-impact.js`

**Change Required:**
```javascript
// BEFORE: Only processes workspaces
const workspaces = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];

// AFTER: Also process ROOT if it exists
const workspaces = ['necrobot-utils', 'necrobot-core', 'necrobot-commands', 'necrobot-dashboard'];
if (changes['ROOT']) {
  workspaces.push('ROOT');
}
```

### Priority 2: Use ROOT bump in Root Version Calculation

**File:** `scripts/analyze-version-impact.js`

**Change Required:**
```javascript
// Include ROOT changes when determining highest bump
let highestBump = 'none';
Object.values(changes).forEach((bumpType) => {
  // Now includes ROOT if it exists
  if ((bumpPriority[bumpType] || 0) > (bumpPriority[highestBump] || 0)) {
    highestBump = bumpType;
  }
});
```

### Priority 3: Add Git Tag Creation

**File:** `.github/workflows/release.yml`

**Add new step in apply-version-bumps job:**
```yaml
- name: 🏷️ Create workspace and root git tags
  run: |
    # Create workspace tags
    git tag "v$(jq -r '.version' repos/necrobot-utils/package.json)-utils" || true
    git tag "v$(jq -r '.version' repos/necrobot-core/package.json)-core" || true
    git tag "v$(jq -r '.version' repos/necrobot-commands/package.json)-commands" || true
    git tag "v$(jq -r '.version' repos/necrobot-dashboard/package.json)-dashboard" || true
    
    # Create root tag
    git tag "v$(jq -r '.version' package.json)" || true
    
    # Push all tags
    git push origin --tags || true
```

---

## Summary

| Item | Status | Impact | Fix Difficulty |
|------|--------|--------|-----------------|
| Workspace change detection | ✅ Working | Low (no impact) | N/A |
| Workspace versioning | ✅ Working | Low (no impact) | N/A |
| **ROOT change detection** | ❌ Ignored | 🔴 CRITICAL | Easy |
| **ROOT versioning** | ❌ Broken | 🔴 CRITICAL | Easy |
| **Git tag creation** | ❌ Missing | 🟡 HIGH | Easy |
| **Package-lock.json** | ⚠️ Partial | 🟡 MEDIUM | Medium |

**Time to Fix:** ~30-45 minutes
**Complexity:** Low-Medium
**Risk:** Low (clear test coverage exists)

---

## Conclusion

**Your expected workflow is CORRECT and SUPERIOR to the current implementation.** 

The current system only does half the job—it detects root changes but doesn't use them for versioning. This means developers can't signal changes to the main codebase through version numbers.

**Recommendation:** Implement the fixes above to complete the workspace-independent + root-aware versioning system. This will give you full semantic versioning across the entire monorepo.
