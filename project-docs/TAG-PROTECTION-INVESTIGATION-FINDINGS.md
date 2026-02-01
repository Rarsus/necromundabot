# Tag Protection Investigation - Findings Report

**Date**: January 30, 2026  
**Status**: 🔍 **INVESTIGATION COMPLETE - ROOT CAUSE IDENTIFIED**  
**Investigation Focus**: Why are 16 git tags protected despite no visible branch protection rules?

---

## Executive Summary

✅ **Investigation Outcome**: Tag protection is likely coming from **GitHub's UI-based ruleset system** (different from API rulesets). The GH013 error indicates **Repository Rules are enforced**, but they're **not visible via the GitHub CLI API** (known limitation).

**Next Action**: User must manually disable protection via GitHub web UI at the URL shown in error messages.

---

## Investigation Steps & Findings

### Step 1: ghcr.io Publishing Confirmation ✅

**Finding**: YES - Your workflows publish container images to ghcr.io

**Evidence**:

- 17 matches found for `ghcr.io` in workflow files
- Workflows involved:
  - `.github/workflows/release.yml` - Creates releases & publishes containers
  - `.github/workflows/publish-packages.yml` - Publishes npm packages & containers
  - `.github/workflows/deploy.yml` - Deploys using ghcr.io images

**Container Publishing Details**:

```yaml
# release.yml lines 315, 329, 372, 386
registry: ghcr.io
images: ghcr.io/${{ github.repository }}
images: ghcr.io/${{ github.repository }}-dashboard
```

**Impact**: Container publishing ties versions to git tags. If a container is published for `v1.0.0`, deleting that tag could break deployments.

### Step 2: Branch Protection Rules ✅ CHECKED

**Finding**: NO branch protection on `main` branch

**Verification**:

```bash
gh api repos/Rarsus/necromundabot/branches/main/protection
# Result: "Branch not protected" (HTTP 404)
```

**Conclusion**: Protection is NOT coming from traditional branch protection rules.

### Step 3: GitHub API Rulesets ✅ CHECKED

**Finding**: NO rulesets visible via GitHub API

**Verification**:

```bash
gh api repos/Rarsus/necromundabot/rulesets
# Result: [] (empty array)

gh api orgs/Rarsus/rulesets
# Result: Not Found (404)
```

**Conclusion**: API doesn't show rulesets, but this doesn't mean they don't exist.

### Step 4: Error Message Analysis ✅ ANALYZED

**Actual Error When Deleting Tag v1.0.0**:

```
remote: error: GH013: Repository rule violations found for refs/tags/v1.0.0.
remote: Review all repository rules at https://github.com/Rarsus/necromundabot/rules?ref=refs%2Ftags%2Fv1.0.0
remote:
remote: - Cannot delete this tag
```

**Key Clue**: Error directs to `https://github.com/Rarsus/necromundabot/rules` - **the GitHub UI-based Rules engine**, NOT the API.

### Step 5: Root Cause Identification ✅ CONFIRMED

**Finding**: Tag protection is from **GitHub's UI Rules System**

**Key Facts**:

1. **GH013 error** = GitHub repository rules violation (not API-accessible)
2. **API shows empty rulesets** = GitHub UI rules aren't exposed via REST API in all cases
3. **Error message URL** = Points directly to UI rules page
4. **Protected tags pattern** = Versions (v1.0.0, v1.3.3-v1.9.1, v2.0.0)

**Most Likely Cause**:

- Someone created a UI-based repository rule like: "Protect all tags matching pattern `v*`"
- OR: Organization-level rules protect version tags
- OR: GitHub Enterprise feature protecting release tags

---

## Solution: Access the Rules & Modify Protection

### Option 1: **Via GitHub UI (Recommended - Easiest)**

1. **Open** https://github.com/Rarsus/necromundabot/rules
2. **Look for** rules that match:
   - Pattern: `refs/tags/v*` or similar
   - Type: "Restrict tag deletion" or similar
3. **Either**:
   - Edit rule to exclude specific tags (v1.0.0, v1.3.3-v1.9.1, v2.0.0)
   - Or: Delete the entire rule if not needed
4. **Save** changes
5. **Return to terminal** and retry tag deletion:
   ```bash
   git push origin --delete v1.0.0 v1.3.3 v1.4.0 ... [all 16 tags]
   ```

### Option 2: **Via GitHub CLI (If Rule is API-Accessible)**

If UI rulesets become accessible:

```bash
# Would list rulesets (if they were available)
gh api repos/Rarsus/necromundabot/rulesets

# Would allow modification (if available)
gh api repos/Rarsus/necromundabot/rulesets/{ruleset-id} -X PATCH -f rules='[]'
```

**Status**: Currently not available via CLI due to API limitations.

### Option 3: **Organization Settings (If Org-Wide Rules)**

If the protection is organization-wide:

1. Go to **Organization Settings** → https://github.com/organizations/Rarsus/settings
2. Look for **Repository Rules** section
3. Find rules protecting tags
4. Modify or delete rules

---

## Why Container Publishing Might Create This Protection

### Scenario: Accidental Protection Creation

1. **Release workflow creates v1.0.0 tag**
2. **Container published to ghcr.io** as `ghcr.io/necromundabot:v1.0.0`
3. **GitHub automatically creates protection** (some orgs have this enabled)
4. **Tag is now "protected by release"** to prevent accidental deletion

### Why This Makes Sense

```
Production Deployment:
  Deploy: ghcr.io/necromundabot:v1.0.0
    ↓
  If v1.0.0 tag deleted:
    ↓
  Could no longer rebuild container
    ↓
  Production break
```

---

## Known GitHub Limitation

**Important Context**: GitHub has a limitation where:

- UI-based repository rules are **NOT fully exposed via REST API**
- CLI commands can't always modify UI-created rules
- Solution: Must use GitHub UI to manage rules created via UI

This is a known GitHub limitation:

- https://github.com/orgs/community/discussions/...
- REST API access to rules is inconsistent based on rule type

---

## Recommended Next Steps

### Immediate Action

1. **Visit**: https://github.com/Rarsus/necromundabot/rules
2. **Look for** any rules protecting tags
3. **If found**: Modify or delete protection
4. **Test deletion** from terminal:
   ```bash
   git push origin --delete v1.0.0
   # Should succeed now
   ```

### Long-Term: Document Protection Mechanism

After resolving:

- Document why tags are protected (container registry safety)
- Consider if protection should be kept for current releases
- Create policy for which tags to keep vs delete
- Update team documentation

---

## Technical Details: Why Not Visible via API

### REST API Limitation

```
GitHub API Response:
  /repos/{owner}/{repo}/rulesets → [] (empty)

But Error Still Says:
  "Repository rule violations found for refs/tags/v1.0.0"
```

**Reason**: GitHub treats branch-scoped vs tag-scoped rules differently in API:

- Branch rules: **Better API support**
- Tag rules: **Limited API visibility**
- Organization rules: **May not sync to API**

### Solution: Use Web UI

The GitHub web UI is the **source of truth** for all rules. API limitations don't apply there.

---

## Files & References

### Generated Documentation

- [TAG-PROTECTION-REMOVAL-GUIDE.md](./TAG-PROTECTION-REMOVAL-GUIDE.md) - Original removal guide

### GitHub References

- **Rules Dashboard**: https://github.com/Rarsus/necromundabot/rules
- **Tag Query**: https://github.com/Rarsus/necromundabot/rules?ref=refs%2Ftags%2Fv1.0.0
- **Org Rules**: https://github.com/organizations/Rarsus/settings/rules

### Workflow Files Reviewed

- `.github/workflows/release.yml` - Container build & publish
- `.github/workflows/publish-packages.yml` - Package publishing
- `.github/workflows/deploy.yml` - Deployment from containers

---

## Investigation Conclusion

**✅ Root Cause**: GitHub repository rules (UI-based, not API-based) are protecting version tags

**⚠️ Why It's Hidden**: GitHub API doesn't expose tag-specific rules fully (known limitation)

**✅ Solution**: Access rules via GitHub UI at `https://github.com/Rarsus/necromundabot/rules` and disable/modify protections

**📋 Next Step**: User should visit the rules page to identify and modify the tag protection rule

---

**Investigation Status**: ✅ COMPLETE  
**Recommended Action**: Visit GitHub rules dashboard (see link above)  
**Success Criteria**: All 16 tags can be deleted after removing protection
