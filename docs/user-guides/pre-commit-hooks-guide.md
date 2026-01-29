# Pre-Commit Hooks Guide

> **What:** Automatic code formatting and validation before commits  
> **When:** Every time you run `git commit`  
> **Why:** Catch formatting issues early, maintain consistency across the team  
> **Status:** ✅ Active (installed and configured)

## Quick Start

### 1. Your First Commit (With Pre-Commit Hooks)

```bash
# Make changes to your code
echo "const x = 'hello';" > src/index.js

# Stage your changes
git add src/index.js

# Commit (pre-commit hook runs automatically!)
git commit -m "feat: Add greeting function"
```

**What happens:**

```
🔍 Running pre-commit checks...
✔ Backed up original state in git stash
✔ Running tasks for staged files...
✔ prettier --write src/index.js
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
✅ Pre-commit checks passed!
[main abc1234] feat: Add greeting function
```

The hook automatically:

- ✅ Formats your code with Prettier
- ✅ Fixes spacing, quotes, indentation
- ✅ Updates your staged files
- ✅ Commits the corrected code

### 2. What Gets Formatted?

The pre-commit hook formats all staged files matching these patterns:

| Pattern            | Handler  | Examples            |
| ------------------ | -------- | ------------------- |
| `*.js, *.jsx`      | Prettier | JavaScript files    |
| `*.json`           | Prettier | Configuration files |
| `*.md, *.markdown` | Prettier | Documentation       |
| `*.css, *.scss`    | Prettier | Stylesheets         |

### 3. If Formatting Fails

If the hook can't format your code, it will:

1. Show a clear error message
2. Restore your original files (from stash)
3. Block the commit
4. Let you fix the issue

**Example:**

```
❌ lint-staged checks failed
Error: Unexpected token } at line 42

Your changes are safe - stored in git stash
Fix the error and try again
```

---

## How It Works

### The Hook Pipeline

```
You run: git commit
         ↓
Pre-commit hook activates (from .husky/)
         ↓
Runs: npx lint-staged
         ↓
Processes staged files matching patterns
         ↓
Runs Prettier on each matched file
         ↓
Updates staged files with fixed formatting
         ↓
Commit succeeds ✅ OR fails with clear error ❌
```

### Where Files Live

```
/home/olav/repo/necromundabot/
├── .husky/
│   └── pre-commit          ← This runs on every commit
└── package.json            ← Configuration lives here
    └── "lint-staged": { ... }
```

### What's Configured

Main repository: `/home/olav/repo/necromundabot/package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx}": ["prettier --write"],
    "*.json": ["prettier --write"],
    "*.{md,markdown}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

All 4 submodules have identical configuration.

---

## Common Scenarios

### Scenario 1: Code Gets Auto-Fixed

**You write:**

```javascript
const x = 'hello';
const obj = { a: 1, b: 2 };
if (true) {
  console.log('test');
}
```

**Hook fixes to:**

```javascript
const x = 'hello';
const obj = { a: 1, b: 2 };
if (true) {
  console.log('test');
}
```

**Result:** ✅ Commit succeeds with formatted code

### Scenario 2: Commit Large File

**You have:**

- `src/index.js` (modified) - 5KB
- `src/utils.js` (modified) - 50KB

**You commit only index.js:**

```bash
git add src/index.js
git commit -m "feat: Update index"
```

**Hook processes:** Only `src/index.js` (not `src/utils.js`)  
**Result:** ✅ Fast commit, only staged files processed

### Scenario 3: Multiple File Types

**You stage:**

- `src/app.js` → Prettier formats
- `config.json` → Prettier formats
- `README.md` → Prettier formats
- `styles.css` → Prettier formats

**Hook processes:** All of them (matches patterns)  
**Result:** ✅ All files formatted, commit succeeds

### Scenario 4: Syntax Error

**You write:**

```javascript
const x = {
  a: 1
  b: 2  // Missing comma
};
```

**Hook runs Prettier:**

```
❌ Prettier couldn't parse the file
  Missing comma on line 3
```

**What happens:**

- ❌ Commit is blocked
- Your original code is safe (restored from stash)
- You fix the syntax error
- Retry the commit

---

## Working with Submodules

All 4 submodules share the same pre-commit hook from the main repository:

```
Main repo: /home/olav/repo/necromundabot/.husky/pre-commit
           ↓ (symlinked to)
repos/necrobot-core/.husky → ../../.husky
repos/necrobot-utils/.husky → ../../.husky
repos/necrobot-commands/.husky → ../../.husky
repos/necrobot-dashboard/.husky → ../../.husky
```

**When you commit in a submodule:**

```bash
cd repos/necrobot-commands
git add src/commands/my-command.js
git commit -m "feat: Add new command"
```

The hook:

1. ✅ Runs from main repo's `.husky/pre-commit`
2. ✅ Processes files in the submodule
3. ✅ Formats using submodule's lint-staged config
4. ✅ Updates staged files in submodule

---

## Best Practices

### ✅ DO

- **Stage only relevant files** - Keeps commits focused

  ```bash
  git add src/specific-file.js
  git commit -m "feat: Specific change"
  ```

- **Commit frequently** - Easier to fix if something breaks

  ```bash
  git add features/feature-a.js
  git commit -m "feat: Feature A - part 1"

  git add features/feature-b.js
  git commit -m "feat: Feature B - part 1"
  ```

- **Review changes after formatting** - Prettier sometimes surprises!
  ```bash
  git diff  # See what changed before committing
  git add .
  git commit -m "refactor: Apply formatting"
  ```

### ❌ DON'T

- **Don't bypass the hook** - No, seriously

  ```bash
  # ❌ WRONG
  git commit --no-verify

  # ✅ RIGHT
  git commit  # Let the hook run
  ```

- **Don't mix unrelated changes** - Hard to review

  ```bash
  # ❌ WRONG - Multiple unrelated changes
  git add .
  git commit -m "Various fixes"

  # ✅ RIGHT - Logical, focused commits
  git add src/specific-fix.js
  git commit -m "fix: Specific issue"
  ```

---

## Troubleshooting

### Hook Doesn't Run

**Problem:** You commit but hook doesn't execute

**Diagnosis:**

```bash
# Check if hook file exists
ls -la .husky/pre-commit

# Check if it's executable
test -x .husky/pre-commit && echo "✅ Executable" || echo "❌ Not executable"
```

**Solution:**

```bash
# Make it executable
chmod +x .husky/pre-commit

# Retry commit
git commit -m "Your message"
```

### "Hook failed" Error

**Problem:** Commit blocked with error message

**Message Example:**

```
❌ Prettier couldn't parse the file
   Unexpected token } at line 42
```

**Solution:**

1. Check the file mentioned in the error
2. Look at the specific line number
3. Fix the syntax error
4. Try committing again

### Large Commit Takes Long

**Problem:** Hook is slow, formatting takes time

**Why:** Processing many files at once

**Solution:**

```bash
# Commit smaller batches
git add src/file1.js src/file2.js
git commit -m "feat: Small batch"

git add src/file3.js src/file4.js
git commit -m "feat: Another batch"
```

### Different Formatting on Different Machines

**Problem:** Prettier formats differently on Mac vs Windows vs Linux

**Why:** Prettier should be consistent, but line endings might differ

**Solution:**

```bash
# Ensure consistent git configuration
git config --global core.autocrlf true  # Windows
git config --global core.autocrlf input # Mac/Linux

# Re-apply formatting after setting
git add .
git commit -m "style: Normalize line endings"
```

---

## Team Coordination

### When Pulling Remote Changes

```bash
# Pull latest changes
git pull origin main

# Your pre-commit hooks are now up-to-date
# They will run on your next commit
```

### When Someone Bypassed the Hook

If you see inconsistently formatted code:

```bash
# Re-run formatting locally
git add .
git commit -m "style: Apply pre-commit formatting"

# This ensures consistency
```

### Disabling Hooks Temporarily

If you absolutely must skip the hook (rare!):

```bash
# Only in emergencies!
git commit --no-verify -m "Emergency fix"

# Then fix formatting immediately after
git add .
git commit -m "style: Apply formatting"
```

---

## Understanding Prettier Configuration

The hook uses Prettier with default settings (no custom config). This means:

- **Quotes:** Single quotes (JavaScript), double quotes (JSON)
- **Spacing:** 2 spaces for indentation
- **Line Width:** 80 characters
- **Semicolons:** Always required
- **Trailing Commas:** Only in JS/TS (es5+)

**To see Prettier settings:**

```bash
npx prettier --write --log-level debug src/index.js
```

---

## Next Steps

1. **Try it:** Make a small change and commit
2. **Watch it:** Observe the hook in action
3. **Review:** See how Prettier formatted your code
4. **Repeat:** This happens on every commit

## Getting Help

See [pre-commit-hooks-troubleshooting.md](../guides/pre-commit-hooks-troubleshooting.md) for detailed troubleshooting.

---

**Last Updated:** January 28, 2026  
**Related:** [Code Quality Workflow Guide](./code-quality-workflow.md)  
**Issues:** Phase 03.2 Epic (#10) → Task 3.2.5 (#17)
