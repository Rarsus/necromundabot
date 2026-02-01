# Removing Protected Git Tags - Step-by-Step Guide

## Problem
The following remote tags are protected by GitHub repository rules and cannot be deleted:
- v1.0.0
- v1.3.3 through v1.9.1
- v2.0.0

These tags are **locally deleted** but remain on the remote repository.

## Solution: Find and Disable Tag Protection

### Step 1: Locate the Protection Settings

**GitHub Repository Settings → Branch Protection / Legacy Protection:**

1. Open: https://github.com/Rarsus/necromundabot/settings/branches
2. Look for any of these protection rules:
   - Rules protecting `main` branch
   - Rules protecting `refs/tags/*`
   - Rules with pattern matching `v*` or similar
   - Any rule that prevents tag deletion

**Alternative Location - Organization Rules (if applicable):**

1. If repository is in an organization, check: https://github.com/organizations/Rarsus/settings/rules
2. Look for rules protecting tags or all refs

### Step 2: Check What's Protecting Tags

The error message `GH013: Repository rule violations found` indicates:
- **Legacy Branch Protection Rules** (older GitHub feature)
- OR **Organization-level policies**
- OR **Ref-specific protections** on individual tags

### Step 3: Disable/Remove the Protection

#### Option A: Temporarily Disable Protection (Recommended)
1. Go to the protection rule
2. Click **Edit** button
3. Uncheck: "Include administrators" or "Restrict who can push"
4. Click **Save changes**
5. Return to terminal and run deletion command (see below)
6. Re-enable the protection

#### Option B: Modify the Rule
1. Edit the protection rule
2. Exclude tag patterns: Change from `*` or `v*` to exclude these versions
3. Save
4. Delete the tags
5. Restore the pattern

#### Option C: Delete the Rule Entirely
1. Go to the protection rule
2. Click **Delete** button
3. Confirm deletion
4. Run deletion command (see below)
5. Optionally create new rules if needed

### Step 4: Delete the Protected Tags (After Disabling Protection)

Once protection is disabled, run:

```bash
cd /home/olav/repo/necromundabot

# Delete all protected remote tags
git push origin --delete v1.0.0 v1.3.3 v1.3.4 v1.3.5 v1.3.6 v1.3.7 v1.3.8 v1.3.9 v1.4.0 v1.5.0 v1.6.0 v1.7.0 v1.8.0 v1.9.0 v1.9.1 v2.0.0

# Verify deletion
echo "=== Remaining remote tags ===" && git ls-remote --tags origin | grep -v '\^{}' | awk '{print $2}' | sed 's|refs/tags/||'
```

### Step 5: Current Status After Deletion

**Expected result:**
```
Local tags:
  v1.2.0 ✅

Remote tags:
  v1.2.0 ✅
```

### Step 6: Re-enable Protection (If Desired)

If you disabled/deleted protection rules:
1. Go back to Settings → Branches
2. Re-enable the protection rule
3. Save changes

## Troubleshooting

### If deletion still fails after disabling protection:
- Clear git's authentication cache: `git credential reject`
- Try pushing with fresh credentials
- Check if you have admin access to the repository

### If you can't find the protection rule:
- It might be at the **organization level** instead of repository level
- Contact the repository owner/organization admin

### If you accidentally delete an important protection:
- You can recreate it: Settings → Branches → Add rule
- Specify the same pattern and settings

## Important Notes

⚠️ **You need:**
- **Repository Admin** access OR
- **Organization Owner** access (if org-level rules)

⚠️ **Why these tags are protected:**
- Common practice for release tags (v1.0.0, v1.3.x, etc.)
- Prevents accidental deletion of important versions
- Enforces history integrity

✅ **After cleanup:**
- Only v1.2.0 will remain (current package.json version)
- Future releases should create new tags matching package version
- Old tags won't clutter repository history

## Commands to Run

```bash
# After disabling protection, paste this in terminal:
cd /home/olav/repo/necromundabot && \
git push origin --delete v1.0.0 v1.3.3 v1.3.4 v1.3.5 v1.3.6 v1.3.7 v1.3.8 v1.3.9 v1.4.0 v1.5.0 v1.6.0 v1.7.0 v1.8.0 v1.9.0 v1.9.1 v2.0.0 && \
echo "✅ Tags deleted successfully!" && \
git ls-remote --tags origin | grep -v '\^{}' | awk '{print $2}' | sed 's|refs/tags/||'
```

---

## Next Steps

1. ✅ Go to https://github.com/Rarsus/necromundabot/settings/branches
2. ✅ Find and disable the tag protection rule
3. ✅ Run the deletion command above
4. ✅ Verify only v1.2.0 remains
5. ✅ Re-enable protection if desired

