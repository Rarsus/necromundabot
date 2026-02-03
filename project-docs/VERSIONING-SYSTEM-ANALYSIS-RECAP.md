# Versioning System Analysis: Recap & Missing Step 1b

**Date:** February 3, 2026  
**Status:** ⚠️ INCOMPLETE - Step 1b Not Executed in Workflow  
**Priority:** HIGH

---

## Your Original Requirement

You specified an 8-step versioning workflow:

```
1. Determine changes in workspaces (respecting dependencies)
   1.a. Determine level of change (major/minor/patch/none)
   1.b. 🔴 UPDATE THE SEMVER OF RESPECTIVE WORKSPACE ← NOT EXECUTED
   1.c. Test the dependencies
2. Aggregate changes of all workspaces
3. Determine impacting changes in main repo
   3.a. Determine level of change
   3.b. Determine highest change
4. Update version according to results
5. Update package.json files
6. Update package-lock.json
7. Create git tags for workspaces
8. Create git tag for root
```

---

## Current Workflow Analysis

### What IS Working ✅

**Step 1.a - Determine level of change:**

- ✅ Analyze changes since last tag
- ✅ Detect which workspaces changed
- ✅ Determine bump type (major/minor/patch/none) per workspace
- ✅ Function: `scripts/detect-workspace-changes.js`

**Step 1.b - Update workspace versions:**

- ✅ Code EXISTS: `scripts/bump-workspace-versions.js`
- ✅ Function `updateWorkspaceVersions()` writes to each workspace package.json
- ✅ Properly bumps based on change type
- ❌ **BUT NOT BEING CALLED IN THE WORKFLOW** ← THE ISSUE

**Step 2 - Aggregate changes:**

- ✅ All changes aggregated in analyze step

**Step 3-4 - Root version update:**

- ✅ Root version bumped based on highest workspace change
- ✅ Function: `updateRootVersion()` in `bump-workspace-versions.js`

**Step 5 - Update package.json:**

- ✅ Workspace package.json files updated (if step 1b executes)
- ✅ Root package.json updated

**Step 7-8 - Create git tags:**

- ✅ Tags created for workspaces: `necrobot-*@version`
- ✅ Tag created for root: `vX.X.X`
- ✅ Tags validated against SemVer

### What is MISSING ❌

**Step 1.c - Test dependencies:**

- ❌ No testing of workspace dependencies after version bump
- ❌ No verification that bumped workspaces still work together

**Step 6 - Update package-lock.json:**

- ❌ Package-lock.json not being regenerated
- ❌ Dependency versions not locked after workspace version change

---

## The Core Issue: Step 1b Not in Workflow

### Current Workflow Path

```
┌─────────────────────────────────────────────────┐
│ analyze-changes job                             │
│ - Analyzes git commits                          │
│ - Detects workspace changes                     │
│ - Determines bump types ✅                      │
│ - Outputs: utils-bump, core-bump, etc.          │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│ apply-bumps job                                 │
│ - Calls sync-package-versions.js ✅             │
│ - SHOULD update workspace versions (step 1.b)  │
│ - SHOULD update root version ✅                 │
│ - Creates tags ✅                               │
└─────────────────────────────────────────────────┘
```

### What Actually Happens

Let me trace through `sync-package-versions.js`:

1. ✅ Takes commit range
2. ✅ Gets git diff and logs
3. ✅ Calls `detectWorkspaceChanges()` → Returns bump types
4. ✅ Calls `updateWorkspaceVersions()` → **This should update workspace package.json files**
5. ✅ Calls `updateRootVersion()` → Updates root version

**The code path exists, but let me verify it's actually being executed in the workflow...**

---

## Verification: Is Step 1.b Actually Executing?

### The Workflow Step

```yaml
- name: 🔄 Apply version bumps to workspaces
  id: bump
  env:
    GIT_TAG: ${{ needs.analyze-changes.outputs.root-version }}
  run: |
    # ... get commit range ...
    node scripts/sync-package-versions.js "$COMMIT_RANGE"
    NEW_VERSION=$(jq -r '.version' package.json)
    echo "version=${NEW_VERSION}" >> $GITHUB_OUTPUT
```

### What This Does

✅ **Calls** `sync-package-versions.js`
✅ **Reads** the new root version from package.json
❓ **But does it actually update workspace package.json files?**

### Let me check the actual behavior

Looking at `bump-workspace-versions.js` lines 104-132:

```javascript
for (const workspace of workspaces) {
    const bumpType = changes[workspace.name];

    if (!bumpType || bumpType === 'none') {
      continue; // Skip workspaces without changes
    }

    const pkgPath = path.join(workspace.path, 'package.json');

    try {
      const pkg = readPackageJson(pkgPath);
      const oldVersion = pkg.version;
      const newVersion = bumpVersion(oldVersion, bumpType);

      pkg.version = newVersion;
      writePackageJson(pkgPath, pkg);  // ✅ WRITES TO FILE

      results[workspace.name] = {
        oldVersion,
        newVersion,
        bumpType,
        // ...
      };
    }
}
```

**This code DOES write to workspace package.json files!**

### So Step 1b IS implemented, but...

The issue is: **How are the bump types passed to updateWorkspaceVersions()?**

Looking at sync-package-versions.js:

```javascript
// Step 3: Detect workspace changes
const changes = detectWorkspaceChanges(diffOutput, commits); // ← Returns bump types

// ...

// Step 5: Apply version updates to workspaces
const wsResults = updateWorkspaceVersions(
  changes, // ← PASSED HERE
  workspaces.map((w) => w.replace('repos/', ''))
);
```

**This should work! But let me check if there's an issue with how changes are detected...**

---

## Potential Issues

### Issue 1: Changes Not Detected Correctly

The `detectWorkspaceChanges()` function needs to:

1. ✅ Read git diff output
2. ✅ Parse commit messages for type (feat, fix, etc.)
3. ✅ Map to workspace
4. ✅ Determine bump level

**Possible problem:** If commits don't have workspace paths, changes might not be detected.

### Issue 2: Workspace Paths Not Recognized

The script looks for file changes in:

- `repos/necrobot-utils/`
- `repos/necrobot-core/`
- `repos/necrobot-commands/`
- `repos/necrobot-dashboard/`

**If changes are made elsewhere, they won't be detected.**

### Issue 3: Root Repository Changes Not Triggering Workspace Bumps

**Your requirement:** Changes in main repo (not in workspaces) should trigger root version bump.

**Current implementation:** Only workspace changes trigger bumps.

**Missing:** Detection and handling of root-level changes.

---

## The Real Issue: Root Changes Not Considered

Looking back at your requirement:

> 3. determine if there are any impacting changes in the main repository (not in workspaces)
>    3.a. determine the level of the change
>    3.b. determine the highest change of main and 1.a.

**This is the missing piece!**

The workflow currently:

- ✅ Detects workspace changes
- ❌ Does NOT detect root/main changes
- ❌ Does NOT determine if root changes need version bump

### Current Logic Flow

```javascript
// Get changes from git diff
const changes = detectWorkspaceChanges(diffOutput, commits);

// changes = {
//   'necrobot-utils': 'patch',
//   'necrobot-core': 'none',
//   'necrobot-commands': 'none',
//   'necrobot-dashboard': 'none'
// }

// Bump workspace versions based on THEIR changes
updateWorkspaceVersions(changes, workspaces);

// Bump root based on HIGHEST workspace change
updateRootVersion(changes); // ← Uses workspace changes, not root changes
```

### What's Missing

```javascript
// MISSING: Detect changes in root files
const rootChanges = detectRootChanges(diffOutput, commits); // ← NOT IMPLEMENTED

// MISSING: Determine root impact
const rootBumpType = determineRootBump(rootChanges); // ← NOT IMPLEMENTED

// MISSING: Compare workspace changes + root changes
const aggregatedChanges = {
  ...changes,
  ROOT: rootBumpType,
};

// Then determine highest
const highestBump = Math.max(bumpLevel(changes), bumpLevel(rootBumpType));
```

---

## Summary: What's Actually Missing

| Step    | Status             | Issue                                         |
| ------- | ------------------ | --------------------------------------------- |
| 1.a     | ✅ DONE            | Detect workspace changes                      |
| **1.b** | ⚠️ **CODE EXISTS** | Called by `sync-package-versions.js` but...   |
| 1.c     | ❌ MISSING         | No testing after version bump                 |
| 2       | ✅ DONE            | Aggregated in detection                       |
| 3.a     | ❌ **MISSING**     | Root changes not detected                     |
| 3.b     | ❌ **MISSING**     | Highest change not properly aggregated        |
| 4       | ⚠️ PARTIAL         | Root updated but not considering root changes |
| 5       | ✅ DONE            | Package.json files updated                    |
| 6       | ❌ MISSING         | package-lock.json not regenerated             |
| 7       | ✅ DONE            | Workspace tags created                        |
| 8       | ✅ DONE            | Root tag created                              |

---

## The Gap: Step 3 (Root Changes) is Completely Missing

**Your specification:**

> determine if there are any impacting changes in the main repository (not in workspaces)

**Current implementation:**

- Only looks at workspace changes
- Ignores changes to root-level files like:
  - `package.json` dependencies
  - `.github/workflows/` changes
  - Documentation in root
  - Configuration files in root
  - Scripts in root `scripts/` directory

### Example Scenario

```
Changes:
├── repos/necrobot-utils/src/service.js    (MINOR bump for utils)
├── .github/workflows/release.yml          (Major workflow change - ignored!)
└── package.json                           (Major dependency upgrade - ignored!)

Current behavior:
  → Root bumped to MINOR (from utils change)

Expected behavior:
  → Root bumped to MAJOR (from workflow + dependency changes)
```

---

## Recommended Solution

### Option A: Complete Implementation (Recommended)

Implement proper root change detection:

1. ✅ Keep workspace change detection (working)
2. ✅ Keep workspace version bumping (working)
3. ❌ → ✅ **ADD root change detection** (missing)
4. ❌ → ✅ **Aggregate workspace + root changes** (missing)
5. ❌ → ✅ **Regenerate package-lock.json** (missing)
6. ❌ → ✅ **Test dependencies after bump** (missing)

### Option B: Simplified (Current behavior documented)

Keep current system but:

- Document that root changes are ignored
- Root version always follows highest workspace change
- Only workspace changes trigger bumps

---

## Current Workspace Versions

```
necromundabot (root):     3.3.0
├── necrobot-utils:       1.0.0
├── necrobot-core:        1.0.0
├── necrobot-commands:    1.0.0
└── necrobot-dashboard:   1.0.0
```

**Status:** All workspaces at same version (1.0.0) because no workspace-specific changes detected yet.

---

## Recommendation

**Would you like me to:**

1. ✅ **Implement root change detection** - Properly handle main repo changes
2. ✅ **Add package-lock.json regeneration** - Lock versions after bump
3. ✅ **Add dependency testing** - Ensure bumped versions work together
4. 📝 **Document current behavior** - If simplified approach is preferred

**Which path?**
