# Quick Reference: Workspace Versioning Fix

**Date**: January 31, 2026  
**Commits**: 3e0c9d5 (fixes) + a7ed5ef (docs)  
**Status**: ✅ DEPLOYED

---

## The Problem (Simple Version)

**Before**: ALL packages got the same version as root, even with no changes.  
**After**: Each package versions independently based on its own changes.

---

## What Changed

| Aspect                   | Before                         | After                      |
| ------------------------ | ------------------------------ | -------------------------- |
| **Workspace Versioning** | All forced to root version     | Independent per workspace  |
| **Release Workflow**     | Synced all package.json        | Root only                  |
| **Rollback Workflow**    | Invalid git syntax             | Valid syntax + permissions |
| **Publishing**           | Republished unchanged packages | Skipped unchanged packages |

---

## Files Modified

1. `.github/workflows/release.yml`
   - Removed lines 123-147 (workspace sync loop)
   - Updated `git add` to exclude workspace files

2. `.github/workflows/rollback-release.yml`
   - Fixed `git push origin --delete-tags` → `git push origin :refs/tags/`
   - Added `permissions` and `submodules: recursive`

---

## Example: How It Works Now

**Scenario**: Only necrobot-core has changes

```
Input:  necrobot-core modified, others unchanged
        ↓
Release workflow:
  - Semantic-release detects change in core only
  - necrobot-core version: 1.0.0 → 1.0.1
  - necrobot-utils: 1.0.0 (unchanged)
  - necrobot-commands: 1.0.0 (unchanged)
  - necrobot-dashboard: 1.0.0 (unchanged)
        ↓
Output: Only necrobot-core publishes v1.0.1 ✅
        Others stay on v1.0.0 ✅
```

---

## Documentation

Full details: [WORKSPACE-VERSIONING-INDEPENDENCE-FIX.md](./WORKSPACE-VERSIONING-INDEPENDENCE-FIX.md)

---

## No Action Required

This fix is automatic and transparent. Just continue development normally.
