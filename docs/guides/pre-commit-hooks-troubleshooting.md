# Pre-Commit Hooks Troubleshooting Guide

> **Purpose:** Solve common pre-commit hook issues quickly
> **Status:** Active (January 28, 2026)

## Quick Reference

| Problem             | Quick Fix                      | Details                        |
| ------------------- | ------------------------------ | ------------------------------ |
| Hook doesn't run    | `chmod +x .husky/pre-commit`   | [Jump](#hook-doesnt-run)       |
| "Command not found" | `npm install`                  | [Jump](#command-not-found)     |
| Formatting fails    | Check syntax error on line     | [Jump](#hook-fails-with-error) |
| Slow commits        | Normal, commit smaller batches | [Jump](#commits-are-slow)      |
| Code reverted       | Git stash has it               | [Jump](#code-was-reverted)     |

---

## Issue 1: Hook Doesn't Run

### Problem Description

```
You run: git commit -m "message"
Expected: 🔍 Running pre-commit checks...
Actual: [main abc1234] message
        (Hook never ran)
```

### Diagnosis

```bash
# Check if hook file exists
ls -la .husky/pre-commit

# Expected output:
# -rwxr-xr-x 1 user group 280 Jan 28 10:30 .husky/pre-commit
```

### Solution

**If file doesn't exist:**

```bash
cd /home/olav/repo/necromundabot
git pull origin main
# Pulls the .husky directory with pre-commit file
```

**If file exists but isn't executable:**

```bash
chmod +x .husky/pre-commit

# Verify it's now executable
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (notice 'x' for execute)
```

**If still doesn't work:**

```bash
# Reinstall Husky
npm install husky --save-dev --workspace=.

# Then try committing again
git add .
git commit -m "test: Verify hook works"
```

### Verification

After fixing:

```bash
# Make a small change
echo "// test" >> test.js
git add test.js

# Commit should show hook output
git commit -m "test: Verify hook"

# Expected: 🔍 Running pre-commit checks... ✅
```

---

## Issue 2: "Command not found: npm"

### Problem Description

```
🔍 Running pre-commit checks...
❌ Error: Command not found: npm
```

### Root Cause

Node.js or npm not installed/not in PATH

### Solution

**Check if Node is installed:**

```bash
node --version
npm --version

# If command not found:
```

**Install Node.js:**

For Mac:

```bash
brew install node@22
```

For Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install nodejs npm
```

For Windows:
Download from https://nodejs.org/ and install

**Verify installation:**

```bash
node --version      # Should show v22.x.x
npm --version       # Should show 10.x.x
```

**Then try committing again:**

```bash
git commit -m "test: Verify npm works"
```

---

## Issue 3: "Hook Failed" - Prettier Syntax Error

### Problem Description

```
🔍 Running pre-commit checks...
✔ Running tasks for staged files...
❌ Prettier failed

Error: Unexpected token } at line 42, column 5
```

### Root Cause

Syntax error in your JavaScript code that Prettier can't parse

### Solution

**Locate the error:**

```bash
# Error says: "Unexpected token } at line 42"
# File: src/commands/my-command.js

# Open the file and check line 42
vim src/commands/my-command.js +42
```

**Common syntax errors:**

1. **Missing closing brace:**

```javascript
// ❌ WRONG
function test() {
  console.log('test');
// Missing }

// ✅ FIXED
function test() {
  console.log('test');
}
```

2. **Missing comma:**

```javascript
// ❌ WRONG
const obj = {
  a: 1
  b: 2
};

// ✅ FIXED
const obj = {
  a: 1,
  b: 2
};
```

3. **Mismatched parentheses:**

```javascript
// ❌ WRONG
if (x > 5 {
  console.log('test');
}

// ✅ FIXED
if (x > 5) {
  console.log('test');
}
```

**Fix the error:**

```bash
# Edit the file
nano src/commands/my-command.js

# Or your preferred editor
vim src/commands/my-command.js
```

**Verify it's valid JavaScript:**

```bash
# Use Node to check syntax
node -c src/commands/my-command.js

# If no output = syntax is valid ✅
# If error = still invalid, keep fixing
```

**Retry the commit:**

```bash
git add src/commands/my-command.js
git commit -m "feat: Fixed syntax error"
```

---

## Issue 4: "Hook Failed" - Other Prettier Error

### Problem Description

```
❌ Prettier couldn't parse the file
   (Some cryptic error message)
```

### Solution

**Try formatting manually to get better error:**

```bash
npx prettier --write src/commands/my-command.js
```

This often shows a clearer error message.

**Check file encoding:**

```bash
# Some files might have wrong encoding
file src/commands/my-command.js

# Should show: ASCII text or UTF-8 Unicode text
# NOT: binary or something else
```

**If encoding is wrong:**

```bash
# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 src/commands/my-command.js > temp.js
mv temp.js src/commands/my-command.js
```

**Try committing again:**

```bash
git add src/commands/my-command.js
git commit -m "fix: Corrected file encoding"
```

---

## Issue 5: Code Was Reverted / Changes Lost

### Problem Description

```
❌ Hook failed with error

Now when I look at my file, it's reverted to the previous version!
```

### Don't Panic ✅

Your changes are **NOT lost**. Git stashed them automatically.

### Recovery

**Find your changes in git stash:**

```bash
# List all stashes
git stash list

# Output example:
# stash@{0}: WIP on main: abc1234 Previous commit message
# stash@{1}: WIP on main: def5678 Another commit

# The most recent (stash@{0}) has your changes
```

**Restore your changes:**

```bash
# Apply the most recent stash
git stash pop

# Or if you want to keep it in stash
git stash apply

# Your changes are now back in your working directory
```

**See what was stashed:**

```bash
git stash show -p stash@{0}

# Shows all the changes that were stashed
```

**Fix the error and retry:**

```bash
# Now fix the issue that made the hook fail
# (e.g., syntax error)

git add .
git commit -m "feat: Fixed error and retrying"
```

---

## Issue 6: Commits Are Slow

### Problem Description

```
git commit -m "message"

(Long pause - 5+ seconds before seeing output)
```

### Root Cause

Prettier is processing many or large files

### Solution

**This is normal for:**

- Many files (100+) staged at once
- Very large files (500KB+)
- First-time processing on a slower machine

**To speed up in the future:**

1. **Commit smaller batches:**

```bash
# ✅ GOOD - Commit small, focused changes
git add src/file1.js
git commit -m "feat: Feature 1"

git add src/file2.js
git commit -m "feat: Feature 2"

# ❌ SLOW - Committing everything at once
git add .
git commit -m "Multiple features"
```

2. **Avoid staging test outputs:**

```bash
# ✅ GOOD
git add src/*.js tests/*.js

# ❌ SLOW - Test artifacts
git add src/*.js tests/*.js coverage/**/* dist/**/*
```

3. **Use `.gitignore` properly:**

```bash
# Should already exclude these:
cat .gitignore | grep -E "node_modules|dist|coverage|\.env"
```

### Performance Check

To see actual timing:

```bash
# Verbose mode shows timing
GIT_TRACE=1 git commit -m "message" 2>&1 | grep -i time

# Or use time command
time git commit -m "message"
```

If taking longer than 5 seconds on typical changes, file an issue.

---

## Issue 7: Hook Works Locally But CI Fails

### Problem Description

```
✅ Commit succeeds locally
✅ Code is formatted
✅ Push succeeds
❌ GitHub Actions fails with: "Code doesn't match formatting rules"
```

### Root Cause

Different Node/npm versions between your machine and CI

### Solution

**Verify your versions:**

```bash
node --version
npm --version

# Compare with .github/workflows/[filename].yml
# Look for: node-version: 22.x
```

**Ensure you're using correct versions:**

```bash
# Use Node version manager (recommended)
nvm install 22
nvm use 22

# Verify switch worked
node --version  # Should show v22.x.x
```

**Reinstall and retry:**

```bash
npm ci --workspace=.
git add .
git commit -m "chore: Use Node 22 for consistency"
```

---

## Issue 8: ESLint Errors (If Re-enabled)

### Problem Description

```
❌ ESLint couldn't find eslint.config.(js|mjs|cjs) file
```

### Current Status

**ESLint is DISABLED in pre-commit hooks** (as of Jan 28, 2026)

- Prettier handles formatting
- ESLint integration deferred to Phase 03.3

### If You're Seeing This Error

You may have ESLint re-enabled in lint-staged config.

**To fix:**

1. **Check your package.json:**

```bash
grep -A 10 '"lint-staged"' package.json
```

2. **Look for:**

```json
"lint-staged": {
  "*.{js,jsx}": [
    "eslint --fix",  // ← Remove this line
    "prettier --write"
  ]
}
```

3. **If found, remove ESLint:**

```bash
# Edit package.json and remove "eslint --fix"
nano package.json

# Or:
vim package.json
```

4. **Commit the fix:**

```bash
git add package.json
git commit -m "fix(lint-staged): Remove ESLint until v9 migration"
```

---

## Issue 9: Windows-Specific Issues

### Problem: "Hook not executable on Windows"

Windows Git might not preserve executable permissions.

**Solution:**

```bash
# Configure Git for Windows
git config core.filemode false

# Then fix hooks
chmod +x .husky/pre-commit

# Or reinstall
npm install husky --save-dev
npx husky install
```

### Problem: "CRLF vs LF line endings"

Windows uses CRLF, Unix uses LF. Can cause formatting issues.

**Solution:**

```bash
# Configure Git to auto-convert
git config --global core.autocrlf true

# Re-apply formatting
git add .
git commit -m "style: Normalize line endings"
```

---

## Issue 10: Hooks in Submodules

### Problem: Hook doesn't run in submodule

```
cd repos/necrobot-commands
git commit -m "message"
# Hook doesn't run
```

### Solution

**Verify submodule is linked:**

```bash
ls -la repos/necrobot-commands/.husky

# Should show:
# .husky -> ../../.husky  (symlink)
```

**If not a symlink:**

```bash
# Remove incorrect .husky
rm -rf repos/necrobot-commands/.husky

# Re-setup from main
cd /home/olav/repo/necromundabot
npx husky install

# Verify link
ls -la repos/necrobot-commands/.husky
# Should now show: .husky -> ../../.husky
```

---

## General Debugging

### Enable verbose logging:

```bash
# See what the hook is doing
GIT_TRACE=1 git commit -m "message"

# See npm operations
npm ci --verbose
```

### Check lint-staged configuration:

```bash
# See current config in all repos
npm pkg get lint-staged --workspace=.
npm pkg get lint-staged --workspace=repos/necrobot-core
npm pkg get lint-staged --workspace=repos/necrobot-utils
npm pkg get lint-staged --workspace=repos/necrobot-commands
npm pkg get lint-staged --workspace=repos/necrobot-dashboard
```

### Test prettier directly:

```bash
# Format a file and see what it does
npx prettier --write src/test.js

# See what would change
npx prettier --check src/test.js

# With debug info
npx prettier --write --log-level debug src/test.js
```

---

## Getting Help

### Checklist before asking for help:

- [ ] Ran `git pull origin main` to get latest hooks
- [ ] Confirmed Node 22+ and npm 10+ installed
- [ ] Tried committing a simple test file
- [ ] Checked `.husky/pre-commit` is executable (`ls -la .husky/`)
- [ ] Reviewed your code for syntax errors
- [ ] Tried `npm install` and `npx husky install`

### If still stuck:

1. **Check GitHub Issues:** Search for Phase 03.2 Epic (#10)
2. **Post Error Output:** Full error message + file content + OS
3. **Provide Context:** Which file, what changes, what error?

### Files to share if reporting issue:

```bash
# Your package.json lint-staged config
npm pkg get lint-staged

# Your Node/npm versions
node --version && npm --version

# The error output
git commit -m "test" 2>&1
```

---

## Prevention Tips

1. **Use version control for Node versions:**

```bash
echo "22" > .nvmrc
nvm use
```

2. **Keep dependencies updated:**

```bash
npm update
npm audit fix
```

3. **Test with full commits:**

```bash
# Before pushing, verify commit succeeds
git commit --dry-run  # If available
# Or just try committing something small
```

4. **Communication with team:**

- Tell team if you disable hooks (don't!)
- Share these docs with new team members
- Report issues in #dev-support or GitHub

---

**Last Updated:** January 28, 2026
**Related:** [Pre-Commit Hooks Guide](../user-guides/pre-commit-hooks-guide.md)
**Phase:** Phase 03.2 Task 3.2.5 (Issue #17)
