# PHASE-03.2: Husky Pre-Commit Hooks & lint-staged Implementation

**Phase Status:** 🟢 READY TO PLAN & IMPLEMENT
**Start Date Target:** February 10, 2026
**Target Completion:** February 17, 2026
**Priority:** HIGH - Improves developer workflow and code quality
**Dependencies:** ✅ INDEPENDENT from Phase 03.1 (can run in parallel)

---

## Executive Summary

Phase 03.2 implements pre-commit hook automation across the monorepo using Husky and lint-staged. This phase enables:

- ✅ **Automatic code fixing** before commits (ESLint, Prettier, import ordering)
- ✅ **Local validation** prevents bad commits from reaching CI
- ✅ **Faster feedback loops** - issues caught immediately, not in GitHub Actions
- ✅ **Reduced CI load** - pre-commit fixes eliminate formatting failures
- ✅ **Team-wide consistency** - enforces patterns from copilot-instructions

**Total Effort:** ~12-15 hours
**Team:** 1 developer
**Success Criteria:** All developers can make commits with auto-fixes, zero pre-commit failures in subsequent PRs

---

## Why This Works Independently

Phase 03.2 **does NOT depend on Phase 03.1 completion:**

| Aspect                  | Phase 03.1            | Phase 03.2              | Dependency? |
| ----------------------- | --------------------- | ----------------------- | ----------- |
| **npm Vulnerabilities** | Fixes vulnerabilities | Configures pre-commit   | ❌ NO       |
| **Discord.js upgrade**  | Updates to v15        | Validates formatting    | ❌ NO       |
| **Test coverage**       | Runs full suite       | Lints staged files only | ❌ NO       |
| **Dependency updates**  | Updates packages      | Formats committed code  | ❌ NO       |

**Parallel Timeline:**

```
Phase 03.1 (Vulnerability fixes):  Feb 3 - Feb 8, 2026    ████████
Phase 03.2 (Husky setup):          Feb 10 - Feb 17, 2026    ████████
   (Can start immediately, no blocking)
```

---

## Part 1: Current State Analysis

### What Exists Today

```bash
# What's working:
✅ ESLint configured (.eslintrc.js)
✅ Prettier configured (individual .prettierrc files)
✅ npm scripts (lint, format)
✅ CI validates on push (GitHub Actions)

# What's missing:
❌ No Husky installation
❌ No pre-commit hooks
❌ No lint-staged configuration
❌ Developers can bypass validation
❌ Issues only caught in CI (slow feedback)
```

### Developer Pain Points

**Current workflow:**

```
1. Edit code
2. git add → No validation happens
3. git commit → No validation happens ❌ CAN COMMIT BAD CODE
4. git push → CI runs, fails
5. Fix locally, commit again, push again
6. Repeat until CI passes
```

**Desired workflow:**

```
1. Edit code
2. git add → Staged files marked
3. git commit → Pre-commit hook runs
            ├─ ESLint --fix (auto-fixes formatting)
            ├─ Prettier --write (auto-formats)
            ├─ Import ordering (auto-fixes)
            └─ Tests/validation (fails = abort commit)
4. git push → Code already validated ✅
5. CI passes immediately
```

---

## Part 2: Phase 03.2 Detailed Tasks

### Task 03.2.1: Install Husky & Lint-Staged

**Deliverable:** Package.json updated, .husky/ directory created
**Duration:** ~1 hour
**Effort:** LOW

#### 03.2.1.1 Main Repository Installation

```bash
cd /home/olav/repo/necromundabot

# Install dependencies
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Verify installation
ls -la .husky/
# Should show: _/, pre-commit (when created in 03.2.2)
```

**Verify:**

```bash
# Check package.json has new dependencies
npm ls husky lint-staged

# Expected output:
# ├── husky@8.x.x
# └── lint-staged@15.x.x
```

#### 03.2.1.2 Submodule Installation

Repeat for each submodule (necrobot-core, necrobot-utils, necrobot-commands, necrobot-dashboard):

```bash
cd repos/necrobot-core
npm install --save-dev husky lint-staged

cd repos/necrobot-utils
npm install --save-dev husky lint-staged

cd repos/necrobot-commands
npm install --save-dev husky lint-staged

cd repos/necrobot-dashboard
npm install --save-dev husky lint-staged
```

**Note:** Each submodule gets its own `package.json` dependency entry.

**Verification:**

```bash
# Each repo should have .husky support
npm ls husky --workspace=repos/necrobot-core
npm ls husky --workspace=repos/necrobot-utils
npm ls husky --workspace=repos/necrobot-commands
npm ls husky --workspace=repos/necrobot-dashboard
```

---

### Task 03.2.2: Create Pre-Commit Hooks

**Deliverable:** Fully functioning `.husky/pre-commit` script
**Duration:** ~1.5 hours
**Effort:** MEDIUM

#### 03.2.2.1 Create Main Pre-Commit Hook

**File:** `.husky/pre-commit`

```bash
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

# 3. Check test files exist for new code
echo -e "${YELLOW}→ Validating test coverage for changes...${NC}"
# (Optional: validate that new .js files have corresponding tests)

# Success
echo -e "${GREEN}✅ Pre-commit checks passed!${NC}"
echo -e "${GREEN}Your commit is ready to go.${NC}"

exit 0
```

**Make it executable:**

```bash
chmod +x .husky/pre-commit
```

#### 03.2.2.2 Create Optional Pre-Push Hook

**File:** `.husky/pre-push` (Optional - can skip initially)

```bash
#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🧪 Running pre-push validation...${NC}"

set -e

# Run full test suite before push
echo -e "${YELLOW}→ Running full test suite...${NC}"
npm test -- --bail --coverage

echo -e "${GREEN}✅ All tests passed - ready to push!${NC}"

exit 0
```

**Make it executable:**

```bash
chmod +x .husky/pre-push
```

**Note:** Pre-push can be strict (run full tests) or relaxed (skip for faster iteration). Recommend starting without pre-push, add it in Phase 03.3.

#### 03.2.2.3 Verify Hook Installation

```bash
# List all hooks
ls -la .husky/

# Test hook triggering
echo "test" > test-file.js
git add test-file.js
git commit -m "test: verify pre-commit hook" 2>&1 | grep -i "pre-commit\|lint"
# Should show: pre-commit hook running, lint-staged running

# Clean up
git reset HEAD test-file.js
rm test-file.js
```

---

### Task 03.2.3: Configure lint-staged

**Deliverable:** `package.json` with lint-staged config for all file types
**Duration:** ~1 hour
**Effort:** MEDIUM

#### 03.2.3.1 Main Repository lint-staged Config

**Add to `/package.json`:**

```json
{
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"],
    "*.{md,markdown}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

**What this does:**

- **JavaScript files (.js, .jsx):**
  1. Run ESLint with auto-fix (`--fix`)
  2. Run Prettier to format (`--write`)

- **JSON files:** Format with Prettier
- **Markdown files:** Format with Prettier
- **CSS/SCSS files:** Format with Prettier

#### 03.2.3.2 Submodule lint-staged Configs

Each submodule gets the same config in its `repos/[submodule]/package.json`:

**repos/necrobot-core/package.json:**

```json
{
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

**Repeat for:**

- repos/necrobot-utils/package.json
- repos/necrobot-commands/package.json
- repos/necrobot-dashboard/package.json

#### 03.2.3.3 Verify Configuration

```bash
# Check main repo config
cat package.json | jq '.["lint-staged"]'

# Check each submodule
cat repos/necrobot-core/package.json | jq '.["lint-staged"]'
cat repos/necrobot-utils/package.json | jq '.["lint-staged"]'

# Expected output:
# {
#   "*.{js,jsx}": [
#     "eslint --fix",
#     "prettier --write"
#   ],
#   ...
# }
```

---

### Task 03.2.4: Test Husky & lint-staged Setup

**Deliverable:** Verified working pre-commit hooks across all repos
**Duration:** ~2 hours
**Effort:** MEDIUM

#### 03.2.4.1 Test Auto-Fix in Main Repo

**Create intentionally bad code:**

```bash
cd /home/olav/repo/necromundabot

# Create badly formatted file
cat > test-bad-format.js << 'EOF'
// Bad formatting - no semi, mixed quotes, inconsistent spacing
const x='hello'
const y = "world"
function test(  ){return 42}
EOF

# Stage the file
git add test-bad-format.js

# Try to commit - should trigger pre-commit hook
git commit -m "test: verify pre-commit auto-fix"
# Expected: Hook runs, auto-fixes the file, commit succeeds

# Check that file was auto-fixed
cat test-bad-format.js
# Should now have proper formatting

# Clean up
git reset HEAD test-bad-format.js
rm test-bad-format.js
```

#### 03.2.4.2 Test Auto-Fix in Submodules

Repeat test for each submodule:

```bash
cd repos/necrobot-core
# (repeat 03.2.4.1 test steps)

cd repos/necrobot-utils
# (repeat 03.2.4.1 test steps)

cd repos/necrobot-commands
# (repeat 03.2.4.1 test steps)

cd repos/necrobot-dashboard
# (repeat 03.2.4.1 test steps)
```

#### 03.2.4.3 Test ESLint Violation Prevention

**Create code with ESLint error:**

```bash
cat > test-eslint-error.js << 'EOF'
// Unused variable - ESLint error
const unusedVar = 42;

// console.log line - might violate no-console
console.log("test");
EOF

git add test-eslint-error.js

# Try to commit
git commit -m "test: verify ESLint blocks bad code"
# Expected: Hook runs, detects ESLint violation, ABORTS COMMIT
```

#### 03.2.4.4 Test Bypass Prevention

**Verify developers can't bypass hooks:**

```bash
# Try to bypass with --no-verify
git commit --no-verify -m "test: try to bypass"
# ⚠️ This SUCCEEDS (git allows --no-verify)
# This is expected behavior - developer can override if needed

# Reset
git reset --soft HEAD~1
git reset HEAD test-eslint-error.js
rm test-eslint-error.js
```

**Documentation note:** Developers CAN use `git commit --no-verify` if absolutely necessary, but should be discouraged (use for emergencies only).

#### 03.2.4.5 Test Full Workflow

**End-to-end test with real changes:**

```bash
# Make a real code change
echo "console.log('test');" >> src/utils/helpers.js

# Stage it
git add src/utils/helpers.js

# Commit
git commit -m "test: add test helper"
# Expected: Pre-commit hook runs, fixes formatting, commit succeeds

# Verify file was formatted
git diff HEAD

# Clean up
git reset HEAD~1
git restore src/utils/helpers.js
```

---

### Task 03.2.5: Documentation & Team Enablement

**Deliverable:** Developer guide for using Husky, troubleshooting tips
**Duration:** ~1.5 hours
**Effort:** LOW

#### 03.2.5.1 Create PHASE-03.2-QUICK-START.md

See [PHASE-03.2-QUICK-START.md](./PHASE-03.2-QUICK-START.md) for step-by-step execution guide.

#### 03.2.5.2 Update Developer Documentation

Add to [docs/guides/](../docs/guides/):

- **pre-commit-hooks-guide.md** - How Husky works, common issues, workarounds
- **code-quality-workflow.md** - Full developer workflow with pre-commit hooks

#### 03.2.5.3 Create Troubleshooting Guide

Common issues & solutions:

- Hook not running after installation
- Commit failing due to ESLint
- Permission denied on hook script
- Hook running multiple times
- Disabling hooks (with warnings)

---

## Part 3: Success Criteria & Verification

### Acceptance Criteria

- ✅ Husky installed in main repo and all 4 submodules
- ✅ Pre-commit hook runs on every commit
- ✅ Lint-staged auto-fixes formatting on staged files
- ✅ ESLint violations prevent commits
- ✅ All team members can run hooks successfully
- ✅ Hook executes in <5 seconds (performance acceptable)
- ✅ Documentation complete and accessible

### Verification Checklist

**Before marking Phase 03.2 complete:**

```bash
# 1. Verify Husky installation
[ ] Husky in main package.json devDependencies
[ ] .husky/ directory exists with pre-commit hook
[ ] Hook script has execute permissions (755)

# 2. Verify lint-staged configuration
[ ] lint-staged in main package.json devDependencies
[ ] Lint-staged config in package.json
[ ] Config for .js, .json, .md files

# 3. Verify each submodule
[ ] necrobot-core: husky + lint-staged + .husky/ hook
[ ] necrobot-utils: husky + lint-staged + .husky/ hook
[ ] necrobot-commands: husky + lint-staged + .husky/ hook
[ ] necrobot-dashboard: husky + lint-staged + .husky/ hook

# 4. Functional tests
[ ] Pre-commit hook runs on intentional bad code
[ ] Auto-fixes are applied (formatting)
[ ] ESLint violations prevent commits
[ ] Clean code commits go through

# 5. Documentation
[ ] PHASE-03.2-QUICK-START.md created
[ ] Developer guide available
[ ] Troubleshooting guide available
```

---

## Part 4: Risk Assessment & Mitigation

### Potential Risks

| Risk                                      | Probability | Impact | Mitigation                                              |
| ----------------------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Hook doesn't run after git clone          | LOW         | HIGH   | Add setup step to CONTRIBUTING.md: `npx husky install`  |
| Developers frustrated by auto-fixes       | MEDIUM      | MEDIUM | Document why (consistency), educate team                |
| Performance: Hook takes too long          | LOW         | MEDIUM | Lint only staged files (lint-staged), monitor hook time |
| Hook breaks on Windows                    | MEDIUM      | MEDIUM | Use cross-platform bash scripts, test on Windows        |
| Developers try to bypass with --no-verify | LOW         | LOW    | Document policy: don't bypass unless emergency          |

### Mitigation Strategies

1. **First clone:** Update CONTRIBUTING.md to include `npx husky install`
2. **Team communication:** Explain benefits before rollout
3. **Quick iteration:** Start with soft hooks (no enforcement), hardening in Phase 03.3
4. **Windows support:** Use `husky` package (cross-platform compatible)
5. **Monitoring:** Track commits that bypass hooks

---

## Part 5: Timeline & Effort Breakdown

### Week of Feb 10, 2026

| Day          | Task                                | Duration     | Owner | Status  |
| ------------ | ----------------------------------- | ------------ | ----- | ------- |
| **Mon 2/10** | 03.2.1: Install Husky & lint-staged | 1 hour       | Dev   | 🔴 TODO |
| **Mon 2/10** | 03.2.2: Create pre-commit hooks     | 1.5 hours    | Dev   | 🔴 TODO |
| **Tue 2/11** | 03.2.3: Configure lint-staged       | 1 hour       | Dev   | 🔴 TODO |
| **Tue 2/11** | 03.2.4: Test setup (all repos)      | 2 hours      | Dev   | 🔴 TODO |
| **Wed 2/12** | 03.2.5: Documentation & guides      | 1.5 hours    | Dev   | 🔴 TODO |
| **Thu 2/13** | Review & verification               | 1 hour       | Dev   | 🔴 TODO |
| **Fri 2/14** | Buffer/polish/fixes                 | 1 hour       | Dev   | 🔴 TODO |
|              | **TOTAL**                           | **~9 hours** |       |         |

**Total Project Duration:** 2-3 days (consecutive work)
**Can run in parallel with Phase 03.1** ✅

---

## Part 6: Rollout Plan

### Phase A: Developer Setup (Day 1)

1. Merge all changes to main
2. Send team notification with PHASE-03.2-QUICK-START.md
3. Team members run `npx husky install` after pulling

### Phase B: Adaptation (Days 2-3)

1. Monitor for issues (e.g., hooks not working)
2. Provide support via Slack/Discord
3. Gather feedback on hook timing, false positives
4. Update documentation based on feedback

### Phase C: Hardening (Phase 03.3)

1. Add stricter hooks (pre-push with tests)
2. Add security checks (secret detection)
3. Add commit message validation
4. Integrate with GitHub workflows

---

## Part 7: Success Metrics

### Post-Phase 03.2 Metrics

**Track over 2 weeks after rollout:**

1. **Auto-fix adoption:** % of commits that had formatting auto-fixed
2. **Hook performance:** Average hook execution time per commit
3. **ESLint violations prevented:** # of commits that would have failed ESLint
4. **Developer satisfaction:** Feedback on hook speed/utility
5. **CI success rate:** % of PRs that pass first CI run (vs. needing fixes)

**Target goals:**

- ✅ 100% hook execution rate (all team members using)
- ✅ <3 second average hook time
- ✅ 30%+ of commits get auto-formatted (catches issues early)
- ✅ 90%+ developer satisfaction
- ✅ 95%+ first-run CI success rate

---

## Related Issues & Links

- **Epic:** [#10 - PHASE-3.2-EPIC] Implement Husky Pre-Commit Hooks & lint-staged
- **Umbrella:** [#7 - PHASE-03] GitHub Actions Workflow Robustness
- **Related:** Phase 03.1 (runs in parallel)
- **Follows:** Phase 03.0 (planning complete)
- **Precedes:** Phase 03.3 (workflow fixes), Phase 03.4 (submodule config)

---

## Next Steps

1. **Assign:** Assign to developer
2. **Start:** Begin with Task 03.2.1 (installation)
3. **Track:** Update daily on progress
4. **Review:** PR review after all tasks complete
5. **Deploy:** Merge to main and announce to team
6. **Support:** Be available for first week of rollout

---

**Phase 03.2 Ready to Start! 🚀**
