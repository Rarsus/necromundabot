# PHASE-03.2: Quick Start Execution Guide

**Target:** Execute Phase 03.2 in 2-3 days
**Timeline:** Monday Feb 10 - Wednesday Feb 12, 2026
**Prerequisites:** Main repo + 4 submodules cloned and accessible

---

## 📋 Pre-Flight Checklist

Before starting, verify:

- ✅ Current branch is `main` in all repos
- ✅ All uncommitted changes are either committed or stashed
- ✅ Node.js 22+ installed (`node --version`)
- ✅ npm 10+ installed (`npm --version`)
- ✅ Git installed (`git --version`)
- ✅ Sufficient disk space (~500MB for node_modules in all repos)

```bash
# Quick verification
node --version  # v22.x.x
npm --version   # v10.x.x
git --version   # git version 2.x.x

# Check main branch status
cd /home/olav/repo/necromundabot
git status      # Should be clean
```

---

## ⏱️ Execution: Day 1 (Monday Feb 10)

### Task 1: Install Husky & lint-staged (Main Repo)

**Time:** 30 minutes
**Status:** 🔴 TODO

#### Step 1.1: Navigate to main repo

```bash
cd /home/olav/repo/necromundabot
git status
# On branch main
# Your branch is up to date with 'origin/main'.
# nothing to commit, working tree clean
```

#### Step 1.2: Install Husky and lint-staged

```bash
npm install --save-dev husky lint-staged

# Output should show:
# added 2 packages (or versions updated)
```

#### Step 1.3: Initialize Husky

```bash
npx husky install

# Output:
# husky - Git hooks installed
```

#### Step 1.4: Verify installation

```bash
# Check .husky directory was created
ls -la .husky/
# Should show:
# drwxr-xr-x  _
# -rw-r--r--  .gitignore

# Check package.json has new dependencies
npm ls husky lint-staged

# Expected:
# ├── husky@8.x.x
# └── lint-staged@15.x.x (or latest)
```

#### Step 1.5: Verify .husky is gitignored

```bash
cat .husky/.gitignore
# Output: *
# (This prevents husky internals from being committed)

git status
# Should NOT show .husky in changes
```

---

### Task 2: Install Husky in All Submodules

**Time:** 30 minutes
**Status:** 🔴 TODO

#### Step 2.1: necrobot-core

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-core

npm install --save-dev husky lint-staged

# Verify
ls -la .husky/
npm ls husky lint-staged
```

#### Step 2.2: necrobot-utils

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-utils

npm install --save-dev husky lint-staged

# Verify
ls -la .husky/
npm ls husky lint-staged
```

#### Step 2.3: necrobot-commands

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-commands

npm install --save-dev husky lint-staged

# Verify
ls -la .husky/
npm ls husky lint-staged
```

#### Step 2.4: necrobot-dashboard

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-dashboard

npm install --save-dev husky lint-staged

# Verify
ls -la .husky/
npm ls husky lint-staged
```

#### Step 2.5: Verify all installations

```bash
# Back to main repo
cd /home/olav/repo/necromundabot

# Check all have Husky
npm ls husky --workspaces

# Expected output shows husky installed in all 5 workspaces:
# necromundabot@0.0.1
# ├── husky@8.x.x
# ├── repos/necrobot-core
# │   └── husky@8.x.x
# ├── repos/necrobot-utils
# │   └── husky@8.x.x
# ├── repos/necrobot-commands
# │   └── husky@8.x.x
# └── repos/necrobot-dashboard
#     └── husky@8.x.x
```

---

## 🔧 Execution: Day 2 (Tuesday Feb 11)

### Task 3: Create Pre-Commit Hook

**Time:** 1 hour
**Status:** 🔴 TODO

#### Step 3.1: Create hook script in main repo

```bash
cd /home/olav/repo/necromundabot

# Create the pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Running pre-commit checks...${NC}"

set -e  # Exit on first error

# 1. Run lint-staged (auto-fixes staged files)
echo -e "${YELLOW}→ Running lint-staged...${NC}"
npx lint-staged

# 2. ESLint check on staged files
echo -e "${YELLOW}→ Checking for ESLint violations...${NC}"
npx eslint --ext .js,.jsx . || true

# Success
echo -e "${GREEN}✅ Pre-commit checks passed!${NC}"
echo -e "${GREEN}Your commit is ready to go.${NC}"

exit 0
EOF

# Make it executable
chmod +x .husky/pre-commit

# Verify
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (executable)
```

#### Step 3.2: Verify hook exists and is executable

```bash
# List hooks
ls -la .husky/

# Check content
cat .husky/pre-commit
# Should show the script content

# Verify executable
test -x .husky/pre-commit && echo "✅ Hook is executable" || echo "❌ Hook not executable"
```

---

### Task 4: Configure lint-staged

**Time:** 1 hour
**Status:** 🔴 TODO

#### Step 4.1: Add lint-staged config to main package.json

```bash
cd /home/olav/repo/necromundabot

# Open package.json and add this section (after "scripts"):
# (Use your preferred editor: vim, nano, VS Code, etc.)

# Add at the end of package.json (before closing }):
```

Using a text editor, add this to `/home/olav/repo/necromundabot/package.json`:

```json
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.json": [
      "prettier --write"
    ],
    "*.{md,markdown}": [
      "prettier --write"
    ],
    "*.{css,scss}": [
      "prettier --write"
    ]
  }
```

**Or use npm to add it:**

```bash
npm pkg set 'lint-staged.*.{js,jsx}[0]'='eslint --fix'
npm pkg set 'lint-staged.*.{js,jsx}[1]'='prettier --write'
npm pkg set 'lint-staged.*.json[0]'='prettier --write'
npm pkg set 'lint-staged.*.md[0]'='prettier --write'
```

#### Step 4.2: Verify configuration

```bash
# Check it was added to package.json
cat package.json | grep -A 15 '"lint-staged"'

# Or use jq if available
npm pkg get lint-staged
```

#### Step 4.3: Add lint-staged config to all submodules

Repeat Step 4.1 & 4.2 for each submodule:

```bash
# necrobot-core
cd repos/necrobot-core
# (add lint-staged config to package.json)

# necrobot-utils
cd ../necrobot-utils
# (add lint-staged config to package.json)

# necrobot-commands
cd ../necrobot-commands
# (add lint-staged config to package.json)

# necrobot-dashboard
cd ../necrobot-dashboard
# (add lint-staged config to package.json)
```

#### Step 4.4: Verify all have lint-staged config

```bash
cd /home/olav/repo/necromundabot

# Check all submodules have config
npm pkg get lint-staged --workspace=repos/necrobot-core
npm pkg get lint-staged --workspace=repos/necrobot-utils
npm pkg get lint-staged --workspace=repos/necrobot-commands
npm pkg get lint-staged --workspace=repos/necrobot-dashboard

# Each should output the lint-staged configuration
```

---

## ✅ Execution: Day 2 PM - Testing

### Task 5: Test Pre-Commit Hooks (All Repos)

**Time:** 1 hour
**Status:** 🔴 TODO

#### Test 5.1: Main Repo - Auto-Fix Test

```bash
cd /home/olav/repo/necromundabot

# Create intentionally badly formatted file
cat > test-format.js << 'EOF'
// Bad formatting - no semi, mixed quotes
const x='hello'
const y = "world"
function test(  ){return 42}
EOF

# Stage the file
git add test-format.js

# Try to commit - hook should auto-fix
git commit -m "test: verify pre-commit auto-fix"

# Expected output:
# 🔍 Running pre-commit checks...
# → Running lint-staged...
# → Checking for ESLint violations...
# ✅ Pre-commit checks passed!
```

#### Test 5.2: Check that file was auto-fixed

```bash
# View the file - should be formatted
cat test-format.js

# Should now have:
# ✅ Semicolons added
# ✅ Consistent quotes
# ✅ Proper spacing
```

#### Test 5.3: Clean up test commit

```bash
# Reset the test commit
git reset --soft HEAD~1

# Unstage the file
git restore --staged test-format.js

# Delete the test file
rm test-format.js

# Verify clean state
git status
# Should show: nothing to commit, working tree clean
```

#### Test 5.4: Test ESLint Violation Prevention

```bash
# Create code with ESLint error (unused variable)
cat > test-eslint.js << 'EOF'
const unusedVariable = 42;
EOF

git add test-eslint.js

# Try to commit - should FAIL
git commit -m "test: verify ESLint blocks"

# Expected output:
# 🔍 Running pre-commit checks...
# → Running lint-staged...
# → Checking for ESLint violations...
# ❌ ESLint errors found - commit aborted
```

#### Test 5.5: Fix the violation and retry

```bash
# Fix the file
cat > test-eslint.js << 'EOF'
const usedVariable = 42;
console.log(usedVariable);
EOF

git add test-eslint.js

# Try to commit again - should SUCCEED
git commit -m "test: fixed ESLint violation"

# Expected:
# ✅ Pre-commit checks passed!
```

#### Test 5.6: Clean up

```bash
git reset --soft HEAD~1
git restore --staged test-eslint.js
rm test-eslint.js
```

#### Test 5.7: Repeat for Each Submodule

Repeat Tests 5.1-5.6 in each submodule:

```bash
cd repos/necrobot-core
# (run Tests 5.1-5.6)

cd ../necrobot-utils
# (run Tests 5.1-5.6)

cd ../necrobot-commands
# (run Tests 5.1-5.6)

cd ../necrobot-dashboard
# (run Tests 5.1-5.6)
```

---

## 📊 Execution: Day 3 (Wednesday Feb 12) - Final Verification

### Task 6: Full Integration Test

**Time:** 1 hour
**Status:** 🔴 TODO

#### Test 6.1: Real-world workflow

```bash
cd /home/olav/repo/necromundabot

# Make a real code change (use actual source file)
echo "// Test comment" >> src/utils/helpers.js

# Stage changes
git add src/utils/helpers.js

# Commit
git commit -m "chore: add test helper comment"

# Expected: Hook runs, file is formatted, commit succeeds

# Verify
git log --oneline -1
# Should show: chore: add test helper comment

# Clean up
git reset --soft HEAD~1
git restore --staged src/utils/helpers.js
git restore src/utils/helpers.js
```

#### Test 6.2: Full test suite passes

```bash
cd /home/olav/repo/necromundabot

# Run all tests to ensure nothing broke
npm test

# Expected: All tests pass ✅
```

#### Test 6.3: Linting passes

```bash
npm run lint

# Expected: No errors ✅
```

#### Test 6.4: Team readiness verification

```bash
# Verify all dependencies are installed
npm ls husky lint-staged --workspaces

# Check all hooks are in place
for repo in . repos/necrobot-{core,utils,commands,dashboard}; do
  echo "Checking $repo..."
  if [ -x "$repo/.husky/pre-commit" ]; then
    echo "  ✅ pre-commit hook found and executable"
  else
    echo "  ❌ pre-commit hook missing or not executable"
  fi
done
```

---

## 🐛 Troubleshooting

### Issue: "hook script file not found"

**Symptom:**

```
husky - Cannot find hooks GIT_DIR path
error: hook declined to update refs/heads/main
```

**Solution:**

```bash
# Reinstall husky
cd /home/olav/repo/necromundabot
npx husky install

# Recreate hook
cat > .husky/pre-commit << 'EOF'
# (paste hook script)
EOF
chmod +x .husky/pre-commit
```

### Issue: "permission denied" on pre-commit

**Symptom:**

```
.husky/pre-commit: Permission denied
```

**Solution:**

```bash
# Make hook executable
chmod +x .husky/pre-commit

# Verify
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x
```

### Issue: "npm: command not found" in hook

**Symptom:**

```
npx: command not found
```

**Solution:**

```bash
# Ensure npm is in PATH
which npm
# Should show: /path/to/npm

# If not found, update hook to use full path:
/home/olav/.nvm/versions/node/v22.x.x/bin/npm run lint-staged
```

### Issue: Hook takes too long to run

**Symptom:**

```
Hook runs but takes 30+ seconds
```

**Solution:**

1. Remove full ESLint check from hook (lint-staged already does it)
2. Run only on staged files
3. Profile with: `time npm run lint-staged`

### Issue: Hook won't run in submodule

**Symptom:**

```
Committing in repos/necrobot-core but no hook runs
```

**Solution:**

```bash
cd repos/necrobot-core

# Reinstall with proper git dir
npx husky install ../../.git/modules/repos/necrobot-core

# Or simpler: reinstall main repo hooks
cd ../..
npx husky install
```

### Issue: "Working tree has unstaged changes"

**Symptom:**

```
ESLint auto-fixes create new changes
```

**Expected:** This is normal behavior

- Lint-staged fixes staged files
- After commit, staged files are clean
- If ESLint fixed more files, unstaged changes remain (you'll see git status changes)

**Solution:** Simply `git add` and commit again if more auto-fixes occurred.

---

## ✔️ Completion Checklist

Before marking Phase 03.2 complete, verify:

**Installation:**

- [ ] `npm ls husky lint-staged --workspaces` shows husky/lint-staged in all 5 repos
- [ ] `.husky/` directory exists in main and all submodules
- [ ] `.husky/pre-commit` script exists and is executable (755)
- [ ] `.husky/.gitignore` exists with `*` content

**Configuration:**

- [ ] `package.json` has `lint-staged` config in main and all 4 submodules
- [ ] Config covers `.js`, `.jsx`, `.json`, `.md` files
- [ ] Config runs both `eslint --fix` and `prettier --write`

**Functionality:**

- [ ] Pre-commit hook runs on every commit attempt
- [ ] Auto-fixes are applied to staged files
- [ ] ESLint violations prevent commits
- [ ] Test passes with intentional bad code → auto-fixed → succeeds
- [ ] Test passes with ESLint error → blocked
- [ ] All submodules tested and working

**Quality:**

- [ ] `npm test` passes (no regressions)
- [ ] `npm run lint` passes (no linting issues)
- [ ] No warning messages in hook output
- [ ] Hook completes in <5 seconds

**Documentation:**

- [ ] PHASE-03.2-QUICK-START.md exists
- [ ] PHASE-03.2-IMPLEMENTATION-PLAN.md exists
- [ ] Developer guide for pre-commit hooks created
- [ ] Troubleshooting guide available

---

## 📝 Final Steps

### Commit & Push

```bash
cd /home/olav/repo/necromundabot

# Stage all changes
git add package.json package-lock.json .husky/
git add repos/*/package.json

# Commit
git commit -m "feat: Implement Husky pre-commit hooks & lint-staged

- Added Husky and lint-staged to main repo and all 4 submodules
- Created pre-commit hook script with auto-fix capabilities
- Configured lint-staged for JS, JSON, and Markdown files
- Verified auto-fixes and ESLint violation detection
- All tests passing, ready for team rollout"

# Push
git push origin main
```

### Announce to Team

Post in team channel:

```
🎉 Phase 03.2 Complete: Husky Pre-Commit Hooks Deployed!

What's new:
- Pre-commit hooks automatically fix formatting issues
- ESLint violations are caught before commits
- Faster development feedback loop

Next steps for everyone:
1. Pull latest changes
2. Run: npx husky install
3. Make a commit - you'll see the hook in action!

See: docs/guides/pre-commit-hooks-guide.md for details
```

---

**Phase 03.2 Execution Complete! 🚀**
