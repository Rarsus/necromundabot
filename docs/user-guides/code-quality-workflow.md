# Code Quality Workflow Guide

> **Purpose:** Understand how pre-commit hooks fit into your development workflow  
> **Audience:** Developers using NecromundaBot  
> **Status:** ✅ Active (as of January 28, 2026)

## The Development Workflow

### Before (Without Pre-Commit Hooks)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Write code                                           │
│    ✏️  You're responsible for formatting               │
│    😞 Easy to miss issues                              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Commit code                                          │
│    😅 Maybe formatted, maybe not                       │
│    🤔 Inconsistent with team standards                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Push to GitHub                                       │
│    📤 Sends code to remote                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. GitHub Actions CI/CD runs                           │
│    ❌ Fails: "Code doesn't match formatting rules"    │
│    ⏱️  Wait for feedback: 2-5 minutes                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Fix formatting locally                              │
│    🔧 Apply fixes manually or with formatter           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Commit fixes                                         │
│    📝 "style: Fix formatting"                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 7. Push again                                           │
│    📤 Finally succeeds                                 │
│    ⏱️  Total time: 10+ minutes                        │
└─────────────────────────────────────────────────────────┘
```

### After (With Pre-Commit Hooks) ✨

```
┌─────────────────────────────────────────────────────────┐
│ 1. Write code                                           │
│    ✏️  You focus on logic, not formatting              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Stage changes                                        │
│    git add src/my-feature.js                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Commit (PRE-COMMIT HOOK RUNS) 🪝                    │
│    🔍 Runs: npx lint-staged                            │
│    ✨ Auto-formats your code                           │
│    ✅ Updates staged files                            │
│    💾 Commits fixed code                               │
│    ⏱️  Time: <1 second                                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Push to GitHub                                       │
│    📤 Code is already formatted correctly              │
│    ✅ GitHub Actions: PASSES immediately              │
│    ⏱️  Time: 30 seconds total                         │
└─────────────────────────────────────────────────────────┘
```

**Savings: 10+ minutes per commit 🚀**

---

## Your Daily Workflow

### Step 1: Make Changes

```bash
# Edit your code
vim src/commands/my-command.js

# View what changed
git diff src/commands/my-command.js
```

### Step 2: Stage Changes

```bash
# Stage the specific file
git add src/commands/my-command.js

# Or stage multiple files
git add src/commands/*.js

# Or stage everything
git add .

# View staged changes
git diff --cached
```

### Step 3: Commit (Hook Runs Automatically)

```bash
git commit -m "feat(commands): Add awesome new feature"
```

**Output:**

```
🔍 Running pre-commit checks...
✔ Backed up original state in git stash
✔ Running tasks for staged files...
✔ prettier --write src/commands/my-command.js
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
✅ Pre-commit checks passed!
[main abc1234] feat(commands): Add awesome new feature
```

### Step 4: Push to Remote

```bash
git push origin main

# Or your feature branch
git push origin feature/my-feature
```

### Step 5: GitHub Actions Runs (Fast!)

```
✅ Linting passed
✅ Tests passed
✅ Formatting passed
✅ All checks passed
```

**Total time: Minutes instead of hours 🎉**

---

## Integration with Copilot Instructions

The pre-commit hook enforces patterns from our [copilot-instructions.md](../../.github/copilot-instructions.md):

### What Gets Enforced

| Rule               | Enforced By     | Your Action       |
| ------------------ | --------------- | ----------------- |
| Consistent quotes  | Prettier (hook) | None - auto-fixed |
| Consistent spacing | Prettier (hook) | None - auto-fixed |
| Line length        | Prettier (hook) | None - auto-fixed |
| Trailing commas    | Prettier (hook) | None - auto-fixed |
| Code structure     | Code review     | Manual review     |
| Test coverage      | CI/CD           | Write tests       |
| Documentation      | Manual          | Write docs        |

**Prettier handles formatting. You handle logic and structure.**

---

## Workflow for Different Scenarios

### Scenario A: Small Bug Fix

```bash
# Fix a bug
git add src/utils/bugfix.js
git commit -m "fix(utils): Prevent infinite loop in parse function"

# Hook auto-formats, commit succeeds
# Push and you're done!
git push origin main
```

### Scenario B: Feature Development

```bash
# Work on feature for 30 minutes
git add src/commands/feature.js src/utils/helper.js
git commit -m "feat(commands): Add new command with helpers"

# Hook auto-formats both files
# Commit succeeds
git push origin feature/new-feature
```

### Scenario C: Large Refactoring

```bash
# Change many files
git add repos/necrobot-commands/src/*.js
git commit -m "refactor(commands): Reorganize command structure"

# Hook formats all files (takes ~1 second)
# Commit succeeds
git push origin feature/refactor
```

### Scenario D: Documentation Update

```bash
# Update docs
git add docs/guides/my-guide.md
git commit -m "docs: Add new developer guide"

# Hook formats markdown
# Commit succeeds
git push origin main
```

---

## Working with Teams

### Pulling Team's Changes

```bash
# Get latest code from team
git pull origin main

# Everyone's code is formatted consistently
# Your hooks are the same across all machines
```

### Code Review Consistency

**Before:** Reviewers focus on formatting issues

```
"Can you fix the spacing here?"
"This needs quotes changed"
"Inconsistent indentation"
```

**After:** Reviewers focus on logic

```
"Good approach to the problem"
"Consider edge case: ..."
"This needs a test case for ..."
```

### Different Team Members

```
Developer A (Windows)  ✅ Consistent formatting
Developer B (Mac)      ✅ Consistent formatting
Developer C (Linux)    ✅ Consistent formatting
                       All code looks the same!
```

---

## Performance Impact

### Commit Speed

| Scenario             | Time            |
| -------------------- | --------------- |
| Small file (1-5KB)   | ~100ms          |
| Medium file (5-50KB) | ~200-500ms      |
| Large file (50KB+)   | ~500ms-1s       |
| Multiple files (5+)  | Scales linearly |

**Result:** Imperceptible to user (less than 1 second)

### Push Speed

No change - hook runs before push, so push is same speed as before.

### Overall Workflow

| Before Hooks          | After Hooks                |
| --------------------- | -------------------------- |
| Write + Format: 2 min | Write + Auto-format: 1 min |
| Commit: 10 sec        | Commit: 10 sec             |
| Push: 30 sec          | Push: 30 sec               |
| CI fails: 2-5 min     | CI passes: 30 sec          |
| Fix format: 2 min     | (N/A - already fixed)      |
| Commit fix: 10 sec    | (N/A)                      |
| Push fix: 30 sec      | (N/A)                      |
| **Total: ~8 minutes** | **Total: ~2 minutes**      |

**Savings: 6+ minutes per commit 🚀**

---

## What Prettier Fixes

### Quotes

```javascript
// Before
const x = 'hello';
const y = 'world';

// After (Prettier fixes)
const x = 'hello';
const y = 'world';
```

### Spacing

```javascript
// Before
const obj = { a: 1, b: 2 };
function test() {
  return 42;
}

// After (Prettier fixes)
const obj = { a: 1, b: 2 };
function test() {
  return 42;
}
```

### Line Breaks

```javascript
// Before
if (true) {
  console.log('test');
  process.exit(0);
}

// After (Prettier fixes)
if (true) {
  console.log('test');
  process.exit(0);
}
```

### Indentation

```javascript
// Before
function test() {
  let x = 1;
  return x;
}

// After (Prettier fixes)
function test() {
  let x = 1;
  return x;
}
```

---

## What Prettier Does NOT Fix

| Issue                | How to Handle         |
| -------------------- | --------------------- |
| Missing semicolons   | Prettier adds them    |
| Incorrect logic      | You fix it            |
| Incomplete code      | You complete it       |
| Wrong variable names | You fix it            |
| Missing imports      | You add them          |
| Syntax errors        | You fix, hook rejects |
| Test gaps            | You write tests       |
| Documentation        | You write it          |
| Code organization    | You refactor          |

**Prettier = Formatting only. Logic is your responsibility.**

---

## Tips for Smooth Workflow

### Tip 1: Commit Frequently

```bash
# Good: Logical, focused commits
git add src/feature-part-1.js
git commit -m "feat: Part 1"

git add src/feature-part-2.js
git commit -m "feat: Part 2"

# Easier to review, easier to rollback if needed
```

### Tip 2: Review Before Pushing

```bash
# See what Prettier fixed
git show HEAD

# Or see since last push
git log origin/main..HEAD
```

### Tip 3: Stage Carefully

```bash
# Stage only related changes
git add src/my-feature.js

# NOT everything
# git add .

# Keeps commits focused
```

### Tip 4: Use Meaningful Messages

```bash
# Good
git commit -m "feat(commands): Add help command with examples"

# Not great
git commit -m "Changes"
```

### Tip 5: Keep Working Directory Clean

```bash
# Commit as you go
git status  # Should be clean

# Before switching branches
git stash  # If needed
```

---

## Integration with IDE/Editor

### VS Code

The hook is **Git-native**, works with any editor:

```bash
# No special setup needed
# Hook runs on: git commit
# Works with: VS Code, Vim, Nano, any editor
```

### GitHub Desktop

```bash
# Works with GitHub Desktop
# Commit normally through GUI
# Hook runs in background
# You see output in terminal
```

### Command Line

```bash
# Works best here
git commit -m "message"
# Hook output visible
```

---

## Troubleshooting

### I didn't mean to let the hook fix my code

**Don't worry!** Your original changes are safe:

```bash
# Check what changed
git show HEAD

# If you want to undo
git reset --soft HEAD~1
git stash  # Save the formatted version

# Your original code is in git history if needed
```

### The hook is "too slow"

Hooks complete in <1 second typically. If slower:

```bash
# You likely staged very large files
# This is normal - Prettier is processing them

# To speed up: commit smaller batches
```

### I want to skip the hook (emergency only!)

```bash
# ONLY in actual emergencies
git commit --no-verify -m "Emergency fix"

# Then fix formatting immediately
git add .
git commit -m "style: Apply formatting"
```

---

## Next Steps

1. **Make a commit:** See the hook in action
2. **Review changes:** Notice what Prettier fixed
3. **Try different scenarios:** Large files, multiple files, etc.
4. **Get comfortable:** It becomes automatic

## Need Help?

See [pre-commit-hooks-troubleshooting.md](../guides/pre-commit-hooks-troubleshooting.md) for detailed troubleshooting.

---

**Last Updated:** January 28, 2026  
**Related Guides:** [Pre-Commit Hooks Guide](./pre-commit-hooks-guide.md)  
**Phase:** Phase 03.2 Task 3.2.5 (Issue #17)
