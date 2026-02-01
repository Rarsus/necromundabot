# Semver Versioning Issue - Root Cause Analysis

**Date**: February 1, 2026  
**Issue**: Docs commits are incorrectly triggering version bumps  
**Severity**: MEDIUM - Versions are being incremented when they shouldn't be

---

## Problem Summary

Recent commits show incorrect version bumps:

| Commit    | Type                 | Expected Bump | Actual Bump                   | Issue                             |
| --------- | -------------------- | ------------- | ----------------------------- | --------------------------------- |
| `6f27886` | `fix(tests):`        | PATCH ✅      | v1.2.0 → v1.3.0               | ❌ WRONG (MINOR instead of PATCH) |
| `27ad8bf` | `docs:`              | NONE ✅       | v1.3.0 (no bump commit shown) | ❌ Triggered v1.3.0 bump          |
| `60ded67` | `chore(versioning):` | PATCH ✅      | v1.3.0 → v1.4.0               | ❌ WRONG (MINOR instead of PATCH) |

---

## Root Cause Identified

### The Semver Detection Function ✅ CORRECT

```javascript
function determineSemverBump(commitMessage) {
  const type = match[1]; // e.g., 'fix', 'docs', 'feat'

  switch (type) {
    case 'fix':
      return 'patch'; // ✅ CORRECT
    case 'docs':
      return 'none'; // ✅ CORRECT - Don't bump for docs
    // ...
  }
}
```

**Verification**: Testing shows this function works correctly:

```
fix(tests):... => patch  ✅
docs: ...      => none   ✅
chore:...      => patch  ✅
```

### The Workspace Detection Function ❌ PROBLEMATIC

**File**: `scripts/detect-workspace-changes.js` (lines 150-185)

**Problem**: The `detectWorkspaceChanges` function uses a "distribution" algorithm that assigns commits to workspaces based on commit order, not actual file changes:

```javascript
// Lines 165-172: THIS IS THE BUG
const commitsPerWorkspace = commits.length / Object.keys(workspaceFileMap).length;
const workspaceIndex = Object.keys(workspaceFileMap).indexOf(workspace);
const commitIndex = commits.indexOf(commit);
const isDistributed =
  commitIndex >= workspaceIndex * commitsPerWorkspace && commitIndex < (workspaceIndex + 1) * commitsPerWorkspace;

if (isRelevant || isDistributed) {  // ← Processes commit even if it's not relevant
  const bump = determineSemverBump(commit.message);
```

**What This Does**:

1. Divides the total commit count by number of workspaces
2. Assigns commits to workspaces based on position in the list
3. Processes commits that DON'T actually touch those workspaces

**Example**:

- If we have 3 commits and 1 workspace (ROOT)
- ALL 3 commits are considered "relevant" by distribution logic
- Even the `docs:` commit gets evaluated for that workspace
- Even though `docs:` returns 'none', the logic still processes it

---

## Why Versions Still Bumped

### Scenario: The v1.2.0 → v1.3.0 bump

**Commits analyzed**:

1. `6f27886` - `fix(tests): ...` (touches ROOT files)
2. `27ad8bf` - `docs: ...` (touches ROOT files)
3. Versioning bump commit (automatic)

**What happened**:

1. Both files changed in ROOT level
2. Both mapped to `ROOT` workspace
3. Commit 1: `fix(tests)` → `determineSemverBump` returns `'patch'` → ROOT bump = PATCH ✅
4. Commit 2: `docs:` → `determineSemverBump` returns `'none'` → Should NOT bump
5. **BUT** there's a logic flaw in how 'none' bumps are handled

---

## The Logic Flaw

**In `detectWorkspaceChanges` (lines 173-181)**:

```javascript
const bump = determineSemverBump(commit.message);

if (bump === 'major') {
  highestBump = 'major';
} else if (bump === 'minor' && highestBump !== 'major') {
  highestBump = 'minor';
} else if (bump === 'patch' && highestBump === 'none') {
  highestBump = 'patch'; // ← Only sets if highestBump is 'none'
}
// ❌ MISSING: else if (bump === 'none') - doesn't explicitly skip 'none' bumps
```

When `determineSemverBump` returns `'none'`:

- The if/else chain doesn't handle it
- `highestBump` remains at its previous value
- So if a previous commit set it to 'patch', it stays 'patch'

**But wait** - that's not the issue here. The real issue is:

---

## The Real Issue: Commits > Workspaces

Looking at the release workflow trigger, it appears commits are being analyzed across ALL workspaces, and the distribution algorithm is causing problems.

**The distribution logic assumes**:

- If workspace files changed, distribute commits across workspaces
- But with only ROOT files changing, ALL commits go to ROOT
- Even `docs:` commits shouldn't trigger ROOT workspace bumps

**The bug**: There's no filtering to exclude files that don't match the workspace pattern. The ROOT workspace is too broad - it includes everything not in repos/.

---

## Solution: Fix the Workspace Detection

### Option 1: Exclude Docs-Only Changes from ROOT Workspace

Modify `mapFilesToWorkspaces` to NOT include certain file patterns:

```javascript
function mapFilesToWorkspaces(files) {
  // ... existing workspace mapping code ...

  // For ROOT: exclude documentation-only changes
  if (!mapping['ROOT']) mapping['ROOT'] = [];
  for (const file of docOnlyFiles) {
    // Don't include docs, project-docs, etc. in workspace changes
    if (!file.startsWith('docs/') && !file.startsWith('project-docs/') && !file.match(/\.md$/)) {
      mapping['ROOT'].push(file);
    }
  }
}
```

### Option 2: Don't Bump Root Version for Docs-Only Changes

Check if ALL files in ROOT workspace are documentation:

```javascript
function isSignificantChange(files) {
  return files.some((f) => !f.startsWith('docs/') && !f.startsWith('project-docs/') && !f.endsWith('.md'));
}
```

### Option 3: Return 'none' Bump for Docs Commits (Current Expected Behavior)

The `determineSemverBump` already returns 'none' for docs commits. The issue is that the version bump still happened. This suggests the issue is in the **workflow/release process**, not the script itself.

---

## Verification Needed

1. **What was the commit range analyzed?**
   - Was it `v1.2.0..HEAD`?
   - Or something else?

2. **Did `detectWorkspaceChanges` actually return `'none'` for ROOT?**
   - Or did it return `'patch'` or `'minor'`?

3. **Is the bump-workspace-versions script respecting 'none' bumps?**
   - Or does it still bump the version?

---

## Recommended Fix

Based on the code review, the recommended fix is:

**Modify the `detectWorkspaceChanges` function to:**

1. **Explicitly handle 'none' bumps** - if determineSemverBump returns 'none', skip adding that commit's bump
2. **Exclude docs-only changes from ROOT workspace** - separate documentation changes from code changes
3. **Add tests** - verify that docs commits don't bump any workspace versions

---

## Test Case

```javascript
describe('detectWorkspaceChanges - docs commits', () => {
  it('should not bump any workspace for docs-only commits', () => {
    const diffOutput = 'M\tTAG-PROTECTION-REMOVAL-GUIDE.md\nM\tproject-docs/TAG-PROTECTION-INVESTIGATION-FINDINGS.md';
    const commits = [
      {
        hash: '27ad8bf',
        message: 'docs: Add tag protection investigation findings and quick fix guide',
      },
    ];

    const changes = detectWorkspaceChanges(diffOutput, commits);

    // Should return empty object (no bumps)
    assert.deepStrictEqual(changes, {});
  });
});
```

---

## Files to Review

1. **`scripts/detect-workspace-changes.js`** - Fix workspace detection logic
2. **`scripts/bump-workspace-versions.js`** - Ensure 'none' bumps are respected
3. **`.github/workflows/release.yml`** - Check how changes are applied
4. **`tests/unit/scripts/test-detect-workspace-changes.test.js`** - Add test for docs-only commits

---

## Investigation Findings

### CONFIRMED: semver Detection Works Correctly ✅

Testing shows:

```
fix(tests):...    → determineSemverBump returns 'patch'  ✅
docs: ...         → determineSemverBump returns 'none'   ✅
chore:...         → determineSemverBump returns 'patch'  ✅
```

### CONFIRMED: Workspace Detection Works Correctly ✅

For docs-only commits:

```
detectWorkspaceChanges() with docs: commit → {} (empty, no bumps)  ✅
```

### ACTUAL ISSUE FOUND ❌

Between v1.2.0 (commit 89a32e8) and v1.3.0 (commit 8e0d582):

**Commits analyzed:**

1. `6f27886` - `fix(tests):` - changes repos/necrobot-core/tests/
2. `8e0d582` - `chore(versioning):` - auto-generated version bump

**What detectWorkspaceChanges reports:**

```
{
  "ROOT": "patch",
  "necrobot-core": "patch"
}
```

**What should happen:**

- Root: PATCH (1.2.0 → 1.2.1)
- necrobot-core: PATCH (1.0.0 → 1.0.1)

**What actually happened:**

- Root: MINOR (1.2.0 → 1.3.0) ❌ WRONG LEVEL

### SUSPECTED ROOT CAUSE

The version jumped from 1.2.0 to 1.3.0 (MINOR) instead of 1.2.1 (PATCH).

This indicates either:

1. The release workflow is passing MINOR bump type to bump-workspace-versions
2. There's logic somewhere that overrides PATCH to MINOR
3. The analyze-version-impact script is reporting MINOR instead of PATCH

### NEXT INVESTIGATION STEPS

1. **Check analyze-version-impact output** during the release
2. **Look for any logic** that forces MINOR bumps for certain conditions
3. **Review dependency propagation** - does it affect the ROOT bump type?
4. **Check if there's a default bump level** set somewhere

## Recommended Fix

Until root cause is found:

1. **Add stricter semver validation** to reject MINOR bumps when only PATCH-level changes exist
2. **Log all version bump decisions** in the release workflow for debugging
3. **Add regression tests** that verify:
   - docs: commits don't trigger version bumps
   - fix: commits only trigger PATCH bumps
   - feat: commits only trigger MINOR bumps

## Next Steps

1. Enable debug logging in the next release workflow run
2. Capture the exact values returned by analyze-version-impact.js
3. Compare with expected semver rules
4. Identify where MINOR bump is being set incorrectly
5. Fix and add tests
