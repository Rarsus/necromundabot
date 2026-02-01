# 🎯 Quick Action Plan - Remove Tag Protection

**Your Task**: Remove protection from 16 tags so they can be deleted

## Step 1: Open GitHub Rules Dashboard

**Visit this URL in your browser:**

```
https://github.com/Rarsus/necromundabot/rules
```

**Look for rules that protect tags** (likely pattern: `v*` or `refs/tags/*`)

---

## Step 2: Find the Protection Rule

You should see a rule like one of these:

```
✋ Rule: "Restrict tag deletion"
   Pattern: refs/tags/v*
   Status: ACTIVE
   Protected: All version tags

OR

🔒 Rule: "Protect release tags"
   Pattern: Any
   Type: Tag restriction
   Status: ACTIVE
```

---

## Step 3: Disable or Modify the Rule

### Option A: DELETE the entire rule (if you don't need it)

1. Click on the rule
2. Click **Delete rule**
3. Confirm deletion

### Option B: MODIFY the rule (to exclude old versions)

1. Click on the rule
2. Click **Edit**
3. Modify pattern to exclude old tags:
   - Instead of: `refs/tags/v*`
   - Change to: `refs/tags/v1.2.*` (only protect current version)
4. **Save** changes

### Option C: DISABLE the rule temporarily

1. Click on the rule
2. Click **Disable**
3. Complete deletion work
4. Re-enable rule after cleanup

---

## Step 4: Delete the Tags from Terminal

After modifying/disabling protection, run:

```bash
cd /home/olav/repo/necromundabot

# Try deleting one tag to verify protection is gone
git push origin --delete v1.0.0

# If successful, delete all 16 remaining protected tags:
git push origin --delete \
  v1.0.0 \
  v1.3.3 v1.3.4 v1.3.5 v1.3.6 v1.3.7 v1.3.8 v1.3.9 \
  v1.4.0 v1.4.1 v1.4.2 v1.5.0 v1.5.1 \
  v1.9.1 v2.0.0
```

---

## Step 5: Verify Success

```bash
# Check local tags
git tag -l

# Check remote tags
git ls-remote --tags origin

# Should only show v1.2.0 remaining
```

---

## What's Protected?

**Currently Protected Tags** (16 total):

- v1.0.0
- v1.3.3 through v1.3.9 (7 tags)
- v1.4.0 through v1.4.2 (3 tags)
- v1.5.0, v1.5.1 (2 tags)
- v1.9.1
- v2.0.0

**Why?** Likely protected because they're associated with container images published to ghcr.io

**Safe to Delete?** YES - You've already deleted the local copies, and v1.2.0 is the latest

---

## Troubleshooting

**If you still get "Cannot delete this tag" error:**

1. ✅ Refresh the GitHub rules page - did the change save?
2. ✅ Wait 30 seconds for GitHub to sync the change
3. ✅ Try again from terminal
4. ✅ If still blocked, check if there's an **Organization-level rule** protecting ALL tags:
   - Visit: https://github.com/organizations/Rarsus/settings/rules
   - Look for rules affecting your repository

**If you can't find a rule:**

1. Organization rules might be hidden (Admin-only)
2. Rule might be enforced at GitHub Enterprise level
3. Contact repository admin if you don't have full access

---

## Timeline

- **Step 1-3**: ~5 minutes (find and modify/delete rule)
- **Step 4**: ~30 seconds (delete all 16 tags)
- **Step 5**: ~30 seconds (verify)

**Total Time**: ~6 minutes

---

## Rollback / Safety

If you accidentally delete the wrong rule:

1. **The rule can be re-created** in the GitHub UI
2. **Deleted tags can be restored** (GitHub keeps tag history for 30 days)
3. **Container images on ghcr.io are NOT deleted** (independent storage)

So it's safe to proceed! ✅

---

**Ready?** Visit: https://github.com/Rarsus/necromundabot/rules

Let me know if you find the rule and need help interpreting it! 🚀
