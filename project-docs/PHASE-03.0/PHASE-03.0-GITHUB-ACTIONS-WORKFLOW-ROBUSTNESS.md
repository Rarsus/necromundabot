# PHASE-03.0: GitHub Actions Workflow Robustness & Pre-Commit Hook Automation

**Phase Status:** 🔴 PLANNING  
**Start Date:** January 27, 2026  
**Target Completion:** February 28, 2026  
**Priority:** HIGH - Blocks robust development workflow

---

## Executive Summary

### Current State (as of Jan 27, 2026)

**Workflow Issues Identified:**

- ❌ **7 npm vulnerabilities** (4 moderate, 3 high) failing security checks
- ❌ **PR Checks failing** due to dependency audit level checks
- ❌ **Release workflow failing** due to npm audit failures
- ❌ **No pre-commit hooks** - no automated validation before commits
- ❌ **No Husky integration** - developers can bypass CI checks locally
- ❌ **No lint-staged** - can't auto-fix issues before staging

**Impact:**

- Developers commit code that fails CI
- No automated code quality enforcement before push
- Workflow blockage on every PR due to npm vulnerabilities
- Manual intervention required for every release

### Objectives

1. ✅ **Reduce npm vulnerabilities** from 7 to 0 (or acceptable risk level)
2. ✅ **Implement Husky** for pre-commit hook automation
3. ✅ **Add lint-staged** for selective file linting
4. ✅ **Fix PR Checks workflow** to properly handle audit levels
5. ✅ **Create robust CI/CD pipeline** that catches issues early
6. ✅ **Automate code quality fixes** before they reach CI

---

## Part 1: Identified Issues & Root Causes

### Issue 1: npm Vulnerabilities (CRITICAL)

**Current Status:**

```
7 vulnerabilities found:
- glob: HIGH (command injection via -c/--cmd)
- undici: MODERATE (unbounded decompression chain)
```

**Affected Packages:**

1. **glob** (via @next/eslint-plugin-next in necrobot-dashboard)
   - Severity: HIGH
   - Status: Fix available (requires eslint-config-next upgrade to v16.1.4)
   - Breaking: YES

2. **undici** (via discord.js dependencies)
   - Severity: MODERATE
   - Status: Fix available (requires discord.js v13.17.1)
   - Breaking: YES

**Root Cause:**

- npm audit fails when audit-level threshold exceeded
- Workflow treats failures as hard blocks
- Transitive dependencies have vulnerabilities

**Solution:**

1. Update discord.js to latest stable (handle breaking changes)
2. Update @next/eslint-plugin-next (if needed)
3. Run `npm audit fix --force` with proper testing
4. Document breaking changes and required updates

**Implementation Steps:**

- [ ] Review discord.js v15 breaking changes
- [ ] Test compatibility with necrobot-core
- [ ] Update package.json in all repos
- [ ] Run full test suite
- [ ] Update workflows to handle managed risk

---

### Issue 2: PR Checks Workflow Failing

**Current Failure:**

- Job: "Dependency Audit" → failure
- Job: "Check Summary" → failure

**Root Cause:**

```yaml
# Current: Too strict
npm audit --audit-level=moderate --json > audit.json
```

The workflow fails if ANY moderate-level vulnerabilities exist, blocking all PRs.

**Problem:**

- Can't merge any PR until vulnerabilities fixed
- Circular dependency: fix requires npm audit to pass
- Blocks development completely

**Solution:**

1. Change audit to continue-on-error for known vulnerabilities
2. Create vulnerability baseline/exceptions
3. Only fail on NEW critical vulnerabilities
4. Add exemption mechanism for known issues

---

### Issue 3: Release Workflow Failing

**Current Failure:**

- Job: "Semantic Release & Versioning" → failure

**Root Cause:**

- Release workflow runs `npm audit` as prerequisite
- Fails before reaching semantic-release step
- npm vulnerabilities block version bumping

**Solution:**

- Same as Issue 1 & 2
- Add vulnerability baseline to release workflow
- Continue-on-error if vulnerabilities are known/exempted

---

### Issue 4: No Pre-Commit Hooks

**Current State:**

- ❌ Husky NOT installed
- ❌ No pre-push validation
- ❌ No pre-commit linting
- ❌ Developers can commit invalid code

**Developer Workflow (Currently):**

```
Edit file → git add → git commit → git push → CI FAILS ❌
        (No validation here)
```

**Desired Workflow:**

```
Edit file → git add → git commit → pre-commit hooks → git push
                           ↓
                    (auto lint-fix)
                    (auto format)
                    (validate)
                        ✅ or ❌
```

**Benefits:**

- Catch issues before CI runs
- Auto-fix common mistakes (formatting, imports)
- Reduce CI run time
- Faster feedback loop

---

## Part 2: Implementation Plan

### Phase 3.1: Fix npm Vulnerabilities (Week 1)

#### Task 3.1.1: Vulnerability Analysis & Update Plan

- [ ] Create detailed breaking changes document for discord.js v15
- [ ] Test discord.js v15 with necrobot-core event handlers
- [ ] Identify all impacted code
- [ ] Create compatibility layer if needed

**Deliverable:**

- Discord.js v15 compatibility report
- Code changes required document

#### Task 3.1.2: Update Dependencies

- [ ] Update main necromundabot package.json
  - discord.js → v15.x
  - @discordjs/\* → latest compatible
- [ ] Update necrobot-core package.json
- [ ] Update necrobot-dashboard package.json
- [ ] Run `npm audit fix --force` in test environment

**Deliverable:**

- Updated package-lock.json files
- npm audit report showing 0 vulnerabilities

#### Task 3.1.3: Test Updated Dependencies

- [ ] Run full test suite: `npm test`
- [ ] Run Docker build: `docker-compose up --build`
- [ ] Manual Discord bot test
- [ ] Verify all commands work

**Deliverable:**

- Test results report
- All tests passing
- Docker image builds successfully

#### Task 3.1.4: Commit & Release

- [ ] Commit: "chore(deps): Update discord.js to v15 and fix npm vulnerabilities"
- [ ] Tag new version
- [ ] Create GitHub Release with breaking changes notes

**Deliverable:**

- New releases with 0 vulnerabilities

---

### Phase 3.2: Implement Husky Pre-Commit Hooks (Week 1-2)

#### Task 3.2.1: Install Husky & Lint-Staged

**Main Repository:**

```bash
npm install husky lint-staged --save-dev
npx husky install
```

**Submodules** (necrobot-core, necrobot-utils, necrobot-commands, necrobot-dashboard):

```bash
cd repos/[submodule]
npm install husky lint-staged --save-dev
npx husky install ../../
```

**Deliverable:**

- [x] `.husky/` directory created
- [x] Pre-commit hooks configured

#### Task 3.2.2: Create Pre-Commit Hooks

**Create `.husky/pre-commit` script:**

```bash
#!/bin/bash
set -e

echo "🔍 Running pre-commit checks..."

# 1. Lint staged files
npx lint-staged

# 2. Check formatting
echo "✓ Code linted and formatted"
echo "✅ Pre-commit checks passed"
```

**Create `.husky/pre-push` script (optional):**

```bash
#!/bin/bash
set -e

echo "🧪 Running pre-push checks..."

# Run full test suite
npm test -- --bail

echo "✅ All tests passed - ready to push"
```

**Deliverable:**

- Pre-commit hooks working
- Auto-fixes staged files
- Prevents commits with lint errors

#### Task 3.2.3: Configure lint-staged

**Add to `package.json`:**

```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.jsx": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

**Deliverable:**

- Lint-staged properly configured
- Auto-fixes on commit

#### Task 3.2.4: Test Husky Setup

- [ ] Create intentionally bad code (mixed quotes, no semicolon)
- [ ] Try to commit → should auto-fix
- [ ] Verify file was corrected
- [ ] Verify commit succeeded

**Deliverable:**

- Working Husky setup
- Documented workflow

---

### Phase 3.3: Fix GitHub Actions Workflows (Week 2)

#### Task 3.3.1: Update PR Checks Workflow

**File:** `.github/workflows/pr-checks.yml`

**Changes:**

- Add vulnerability baseline (allow known issues during fix period)
- Change audit to `continue-on-error: true`
- Only fail on NEW high/critical vulnerabilities
- Add exemption mechanism

**Pseudo-code:**

```yaml
- name: Dependency Audit
  continue-on-error: true
  run: |
    npm audit --json > audit.json || true

    # Compare against baseline
    BASELINE="./.github/audit-baseline.json"
    if [ -f "$BASELINE" ]; then
      # Only fail if NEW vulnerabilities
      DIFF=$(npm audit --json | jq '.metadata.vulnerabilities.total - $BASELINE.total')
      if [ "$DIFF" -gt 0 ]; then
        echo "❌ New vulnerabilities found!"
        exit 1
      fi
    fi
```

**Deliverable:**

- Updated workflow file
- `.github/audit-baseline.json` for tracking

#### Task 3.3.2: Update Security Workflow

**File:** `.github/workflows/security.yml`

**Changes:**

- Same vulnerability baseline approach
- Use continue-on-error during transition
- Add comment to PRs showing audit delta

**Deliverable:**

- Updated security workflow

#### Task 3.3.3: Update Release Workflow

**File:** `.github/workflows/release.yml`

**Changes:**

- Add vulnerability check but don't block release
- Document known issues
- Option to force release with manual approval

**Deliverable:**

- Release workflow can proceed with known vulnerabilities

#### Task 3.3.4: Create Vulnerability Baseline

**File:** `.github/audit-baseline.json`

```json
{
  "version": "0.1.0",
  "date": "2026-01-27",
  "total": 0,
  "description": "Track known vulnerabilities during remediation",
  "notes": ["All known vulnerabilities fixed as of v0.2.6"]
}
```

**Deliverable:**

- Baseline file created
- Documented in git

---

### Phase 3.4: Update All Submodules with Husky (Week 2)

#### Task 3.4.1: Install Husky in Each Submodule

For each submodule:

- [ ] necrobot-core
- [ ] necrobot-utils
- [ ] necrobot-commands
- [ ] necrobot-dashboard

**Steps:**

```bash
cd repos/[submodule]
npm install husky lint-staged --save-dev
npx husky install ../../  # Use main repo's .husky
```

**Deliverable:**

- Husky installed in all submodules
- Shared `.husky` from main repo

#### Task 3.4.2: Configure lint-staged for Each Submodule

**Update each `package.json` with lint-staged config**

**Deliverable:**

- All submodules have lint-staged config

---

### Phase 3.5: Documentation & Training (Week 3)

#### Task 3.5.1: Create Developer Guide

**File:** `docs/guides/LOCAL-DEVELOPMENT-WITH-HUSKY.md`

**Content:**

- How pre-commit hooks work
- What happens if lint fails
- How to bypass hooks (and why not to)
- Troubleshooting

**Deliverable:**

- Developer guide created

#### Task 3.5.2: Create CI/CD Documentation

**File:** `docs/guides/CI-CD-WORKFLOW-OVERVIEW.md`

**Content:**

- What each workflow does
- When workflows run
- How to read workflow logs
- Troubleshooting CI failures

**Deliverable:**

- CI/CD guide created

#### Task 3.5.3: Update CONTRIBUTING.md

- Link to new guides
- Add pre-commit hook setup instructions
- Document commit message standards

**Deliverable:**

- Updated CONTRIBUTING.md

---

## Part 3: Implementation Details

### Deliverables Checklist

#### Phase 3.1: Vulnerability Fixes

- [ ] Discord.js v15 compatibility report
- [ ] All npm vulnerabilities fixed (0 remaining)
- [ ] All tests passing
- [ ] New releases published

#### Phase 3.2: Husky Installation

- [ ] Main repo: Husky installed and configured
- [ ] All submodules: Husky configured
- [ ] Pre-commit hooks working
- [ ] lint-staged auto-fixing files
- [ ] Commit bypassing prevented

#### Phase 3.3: Workflow Fixes

- [ ] PR Checks workflow updated
- [ ] Security workflow updated
- [ ] Release workflow updated
- [ ] Vulnerability baseline established
- [ ] All workflows passing

#### Phase 3.4: Documentation

- [ ] Developer guide written
- [ ] CI/CD guide written
- [ ] CONTRIBUTING.md updated
- [ ] All guides linked in README

### Success Criteria

- ✅ Zero npm vulnerabilities
- ✅ Pre-commit hooks auto-fix 100% of linting issues
- ✅ All CI workflows passing on main branch
- ✅ PR workflow blocks only new vulnerabilities
- ✅ Developers can't accidentally commit bad code
- ✅ CI run time reduced by 20%+ (local pre-checks)

### Effort Estimation

| Phase     | Task                   | Est. Hours | Complexity |
| --------- | ---------------------- | ---------- | ---------- |
| 3.1       | Vulnerability analysis | 4          | Medium     |
| 3.1       | Update dependencies    | 6          | Medium     |
| 3.1       | Test & release         | 4          | Medium     |
| 3.2       | Husky installation     | 2          | Low        |
| 3.2       | Hook scripts           | 3          | Low        |
| 3.2       | lint-staged config     | 2          | Low        |
| 3.2       | Testing                | 2          | Low        |
| 3.3       | Workflow fixes         | 6          | Medium     |
| 3.4       | Submodule setup        | 4          | Low        |
| 3.5       | Documentation          | 6          | Low        |
| **TOTAL** |                        | **39**     |            |

---

## Part 4: Husky Pre-Commit Hook Strategy

### Hook Architecture

```
.git/hooks/
├── pre-commit (auto-generated by Husky)
│   └── calls .husky/pre-commit script
├── commit-msg (optional, for conventional commits)
└── pre-push (optional, for test validation)

.husky/ (committed to repo)
├── pre-commit (lint & format check)
├── commit-msg (validate commit message)
└── pre-push (optional: run tests)
```

### Pre-Commit Hook Flow

```
Developer: git commit
    ↓
Husky: pre-commit hook triggered
    ↓
lint-staged: Get staged files
    ↓
Check file types:
  - .js files → eslint --fix + prettier --write
  - .json files → prettier --write
  - .md files → prettier --write
    ↓
Auto-fixes and stages fixes
    ↓
If linting fails: ❌ Abort commit
If linting passes: ✅ Allow commit
```

### Common Mistakes Pre-Commit Hooks Will Fix

1. **Missing Semicolons**
   - Before: `const x = 5`
   - After: `const x = 5;` (prettier auto-fix)

2. **Mixed Quote Styles**
   - Before: `const msg = "hello" + 'world'`
   - After: `const msg = 'hello' + 'world'` (eslint --fix)

3. **Inconsistent Indentation**
   - Before: Tabs and spaces mixed
   - After: 2-space indentation (prettier)

4. **Trailing Whitespace**
   - Before: `const x = 5;    `
   - After: `const x = 5;` (prettier)

5. **Unused Variables** (detected but not auto-fixed)
   - Detected: `eslint --fix`
   - Action: Prevent commit, show error

6. **Import Ordering**
   - Before: Random order
   - After: Alphabetical (with eslint-plugin-import)

7. **Missing License Headers** (if configured)
   - Added by: Custom ESLint rule

8. **Formatting Issues in JSON**
   - Before: Unformatted JSON
   - After: Properly formatted (prettier)

---

## Part 5: Recommended Hook Configuration Files

### `.husky/pre-commit`

```bash
#!/bin/bash
set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Run lint-staged (ESLint + Prettier)
npx lint-staged

# Optional: Type checking (if TypeScript used)
# npm run type-check

echo ""
echo "✅ Pre-commit checks passed!"
```

### `.husky/commit-msg` (Optional)

```bash
#!/bin/bash

# Validate conventional commit format
npx commitlint --edit "$1"
```

### `.husky/pre-push` (Optional)

```bash
#!/bin/bash
set -e

echo "🧪 Running tests before push..."

# Run tests with bail on first failure
npm test -- --bail --coverage

echo "✅ All checks passed - pushing..."
```

### `package.json` scripts for local development

```json
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write \"src/**/*.{js,jsx} tests/**/*.js\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx} tests/**/*.js\""
  }
}
```

---

## Part 6: Rollout Plan

### Phase 1: Implement (Weeks 1-2)

1. Fix vulnerabilities first (blocking issue)
2. Install Husky in main + all submodules
3. Update workflows
4. Test everything locally

### Phase 2: Deploy (Week 2)

1. Push main repo with Husky + vulnerability fixes
2. Update each submodule
3. All CI should pass

### Phase 3: Verify (Week 3)

1. Monitor workflow runs
2. Ensure no regressions
3. Collect developer feedback

### Phase 4: Document (Week 3)

1. Write guides
2. Create troubleshooting docs
3. Update CONTRIBUTING.md

---

## Part 7: Known Risks & Mitigations

### Risk 1: Developers Bypass Hooks

**Mitigation:**

- Branch protection rules prevent force-push
- CI still validates everything
- Document why hooks exist

### Risk 2: Hook Performance Issues

**Mitigation:**

- lint-staged only runs on staged files (fast)
- ESLint cache enabled
- Monitor hook execution time

### Risk 3: False Positives in Lint Rules

**Mitigation:**

- ESLint exemptions for specific files
- `// eslint-disable-next-line` comments
- Regular review of lint rules

### Risk 4: Discord.js v15 Breaking Changes

**Mitigation:**

- Create compatibility layer
- Comprehensive testing before merge
- Easy rollback if needed

---

## Acceptance Criteria

- ✅ No npm vulnerabilities in any repository
- ✅ Pre-commit hooks prevent invalid commits 100%
- ✅ All GitHub workflows passing on main branch
- ✅ PR Checks workflow allows PRs with no NEW vulnerabilities
- ✅ Developers report smooth local development experience
- ✅ CI run time improved by 20%+ due to local validation
- ✅ Zero commits reaching CI with lint errors
- ✅ All guides completed and linked

---

## Next Steps

1. **Immediately (Today):** Create action items for Phase 3.1
2. **This Week:** Fix vulnerabilities and implement Husky
3. **Next Week:** Update workflows and test everything
4. **Following Week:** Documentation and monitoring

---

## References

- [Husky Official Docs](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Discord.js Migration Guide](https://discordjs.guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)
