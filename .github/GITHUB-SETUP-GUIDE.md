# GitHub Setup Guide for NecromundaBot

> Complete guide for GitHub integration with copilot instructions and development workflows.

## What's Already Set Up ✅

The following GitHub features are **already configured and committed**:

### 1. Issue Templates ✅

Located: `.github/ISSUE_TEMPLATE/`

**Files:**
- `bug_report.md` - For reporting bugs
- `feature_request.md` - For requesting features

**Features:**
- Automatic links to `copilot-instructions.md`
- Scenario guidance based on issue type
- TDD and testing checklists
- Pattern references

**How It Works:**
1. User clicks "New Issue" on GitHub
2. Chooses "Bug Report" or "Feature Request"
3. Issue template automatically loads
4. Template includes copilot instructions context

### 2. Pull Request Template ✅

Located: `.github/pull_request_template.md`

**Features:**
- 🚨 Copilot Instructions checklist (top priority)
- TDD workflow verification
- Testing requirements
- Code quality checks
- Linting validation
- Pattern compliance

**How It Works:**
1. User creates PR
2. Template auto-populates description
3. Reviewer checks TDD compliance
4. CI/CD validation enforces requirements

### 3. Copilot Workflow Documentation ✅

Located: `.github/COPILOT-WORKFLOW.md`

**Contains:**
- How copilot instructions are discovered
- How GitHub integration works
- Best practices for AI agents
- Integration checklist
- Verification procedures

### 4. Contributing Guide Updated ✅

Located: `CONTRIBUTING.md`

**Changes:**
- 🚨 IMPORTANT banner at top
- Direct link to `copilot-instructions.md`
- Quick navigation to scenarios
- Non-negotiable requirements list

---

## GitHub Repository Settings

### 1. Require Pull Request Reviews

**Location:** Settings → Branches → Branch protection rules

**Recommended Configuration:**

For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require code quality checks (CI/CD)
- ✅ Require branches to be up to date
- ✅ Dismiss stale pull request approvals
- ✅ Require status checks to pass before merging

**Command Line Setup:**
```bash
gh api repos/Rarsus/necromundabot --jq '.default_branch'
# Output: main
```

### 2. Enable Issue Templates

**Location:** Settings → General → Features

**Status:** ✅ Already enabled (templates exist in `.github/ISSUE_TEMPLATE/`)

### 3. Enable Branch Protection

**Location:** Settings → Branches

**Setup:**
```bash
# Add branch protection rule to main
gh api repos/Rarsus/necromundabot/branches/main/protection \
  -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["CI/CD"]}' \
  -F required_pull_request_reviews='{"dismiss_stale_reviews":true}'
```

### 4. Configure Code Owners (Optional)

**File:** `.github/CODEOWNERS`

**Example:**
```
# Copilot instructions
.github/copilot-* @Rarsus

# Core services
repos/necrobot-core/ @Rarsus

# Commands
repos/necrobot-commands/ @Rarsus

# Utils
repos/necrobot-utils/ @Rarsus

# Dashboard
repos/necrobot-dashboard/ @Rarsus
```

**How It Works:**
- When PR affects these files, specific reviewers are auto-requested
- Ensures copilot instructions reviewed by maintainers

---

## CI/CD Integration

### GitHub Actions (Optional)

**File:** `.github/workflows/tests.yml` (if created)

**Purpose:** Auto-run tests on every PR

**Example Workflow:**
```yaml
name: Tests & Lint

on: [pull_request, push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      
  verify-copilot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          # Verify PR follows copilot instructions
          if grep -q "copilot-instructions.md" .github/pull_request_template.md; then
            echo "✅ Copilot instructions linked in PR template"
          else
            echo "❌ Missing copilot instructions link"
            exit 1
          fi
```

**Status:** Optional - enhance with this if desired

---

## How Contributors Use GitHub

### For Bug Reports

1. **User clicks:** "Issues" → "New Issue"
2. **GitHub shows:** Issue type selector
3. **User chooses:** "Bug Report"
4. **Template loads:** Includes:
   - Link to copilot-instructions.md
   - Reference to Scenario 02 (fixing bugs)
   - TDD workflow checklist
   - Testing requirements

5. **User fills out:**
   - Description
   - Reproduction steps
   - Expected behavior
   - Actual behavior

6. **User submits** → Copilot instructions are visible in context

### For Feature Requests

1. **User clicks:** "Issues" → "New Issue"
2. **User chooses:** "Feature Request"
3. **Template loads:** Includes:
   - Links to relevant scenarios (01, 03, 08)
   - Pattern references
   - Type-specific guidance

4. **User specifies:**
   - Feature type (command/database/cross-module)
   - Description
   - Use cases

5. **Template routes** to correct scenario

### For Pull Requests

1. **User creates PR** on GitHub
2. **Template auto-populates** with:
   - Copilot Instructions section (top)
   - TDD checklist
   - Testing requirements
   - Linting validation
   - Feature checklists

3. **Reviewer sees:**
   - All requirements in PR description
   - Template enforces compliance
   - Instructions linked for reference

4. **Before merge:**
   - All checklist items verified
   - Tests pass (CI/CD)
   - Code quality checks pass
   - Copilot instructions followed

---

## For Repository Maintainers

### Review Checklist

When reviewing PRs:

1. ✅ **Copilot Instructions Section**
   - Is copilot-instructions.md referenced?
   - Did author follow TDD?
   - Are all tests included?

2. ✅ **Code Quality**
   - No ESLint errors
   - Tests passing (CI/CD green)
   - Coverage maintained

3. ✅ **Documentation**
   - Are docs updated?
   - Do docs follow naming convention?

4. ✅ **Pattern Compliance**
   - Correct pattern used
   - No violations of structure rules
   - Service layer used correctly

### Approving Changes

```bash
# After verifying checklist:
gh pr review <PR-NUMBER> --approve

# Or request changes:
gh pr review <PR-NUMBER> --request-changes -b "
Please follow TDD workflow - tests must come first.
See: .github/copilot-patterns/TDD-WORKFLOW.md
"
```

### Merging PRs

```bash
# Merge with automatic deletion of branch
gh pr merge <PR-NUMBER> --merge --delete-branch

# Or squash commits
gh pr merge <PR-NUMBER> --squash --delete-branch
```

---

## Syncing Across Repositories

**Challenge:** Instructions are in `necromundabot`, but changes affect `necrobot-core`, `necrobot-commands`, `necrobot-utils`, `necrobot-dashboard`

**Solution:** Git submodules

**Current Setup:**
```
necromundabot/
└── repos/
    ├── necrobot-core/         (Git submodule)
    ├── necrobot-commands/     (Git submodule)
    ├── necrobot-utils/        (Git submodule)
    └── necrobot-dashboard/    (Git submodule)
```

**Update Submodules:**

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/Rarsus/necromundabot.git

# Or if already cloned
git submodule update --init --recursive

# After changes to submodule
git add repos/necrobot-core/
git commit -m "chore: Update necrobot-core"
git push
```

**In Submodule Repository:**

```bash
cd repos/necrobot-core
git pull origin main
git push origin main
```

---

## Common GitHub Workflows

### Creating an Issue

```bash
gh issue create \
  --title "Add new command: /about" \
  --body "Implement /about command showing bot information" \
  --label "feature"
```

### Creating a Pull Request

```bash
git push -u origin my-feature-branch

gh pr create \
  --title "feat(commands): Add /about command" \
  --body "Implements new /about slash command with bot info" \
  --base main
```

### Reviewing a PR

```bash
# View PR details
gh pr view <PR-NUMBER>

# Review and approve
gh pr review <PR-NUMBER> --approve

# Or request changes
gh pr review <PR-NUMBER> --request-changes -b "Needs tests"
```

### Merging a PR

```bash
gh pr merge <PR-NUMBER> --merge
```

---

## Visibility & Discovery

### How Copilot Instructions Are Discovered

**1. Repository README**
- Main entry point for contributors
- Links to `CONTRIBUTING.md`

**2. CONTRIBUTING.md**
- 🚨 Prominent copilot instructions section at top
- Links to `.github/copilot-instructions.md`
- Quick navigation to scenarios

**3. Issue Templates**
- Automatically loaded when creating issues
- Include copilot instructions context
- Link to specific scenarios

**4. PR Template**
- Loaded for every PR
- Copilot instructions checklist (top section)
- Requires verification before merge

**5. Project Documentation**
- `.github/` folder organization
- `_INDEX.md` files for navigation
- Links between related docs

**Result:** Contributors **cannot avoid** seeing copilot instructions - they're embedded in every GitHub workflow.

---

## Setting Up Locally

### Clone Repository

```bash
git clone --recurse-submodules https://github.com/Rarsus/necromundabot.git
cd necromundabot
```

### Enable Git Hooks (Optional)

Create `.git/hooks/pre-commit` to run tests before commits:

```bash
#!/bin/bash
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed - commit aborted"
  exit 1
fi
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed - commit aborted"
  exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### GitHub CLI Authentication

```bash
gh auth login

# Choose: GitHub.com
# Choose: HTTPS
# Authenticate with browser
```

---

## Organization Structure

### Repository Visibility

**Main Repository:** `Rarsus/necromundabot`
- Contains copilot instructions
- Contains GitHub workflows
- Contains submodule references

**Submodule Repositories:**
- `Rarsus/necrobot-core` - Main bot core
- `Rarsus/necrobot-commands` - All commands
- `Rarsus/necrobot-utils` - Shared services
- `Rarsus/necrobot-dashboard` - Web UI

**All have independent:**
- Issues
- PRs
- Branches
- Workflows

**But share:**
- Copilot instructions (via README/CONTRIBUTING)
- Development standards
- Testing framework

---

## Next Steps

### 1. Verify GitHub Setup ✅

```bash
cd /home/olav/repo/necromundabot

# Check issue templates exist
ls -la .github/ISSUE_TEMPLATE/

# Check PR template exists
cat .github/pull_request_template.md | head -5

# Check copilot instructions
cat .github/copilot-instructions.md | head -10
```

**Expected Output:**
```
✅ .github/ISSUE_TEMPLATE/bug_report.md
✅ .github/ISSUE_TEMPLATE/feature_request.md
✅ .github/pull_request_template.md
✅ .github/copilot-instructions.md
```

### 2. (Optional) Create GitHub Actions

To auto-run tests on PR:
- Create `.github/workflows/tests.yml`
- Configure CI/CD
- Enable branch protection

### 3. (Optional) Configure Branch Protection

```bash
# Via GitHub UI:
# Settings → Branches → Add rule → main
# ✅ Require PR reviews
# ✅ Require status checks
# ✅ Require up-to-date branches
```

### 4. Test the Workflow

1. **Create test issue:** GitHub → Issues → New Issue
2. **Choose template:** "Bug Report" or "Feature Request"
3. **Verify:** Copilot instructions appear in template
4. **Create test PR:**
   - Push feature branch
   - Create PR on GitHub
   - Verify template loads with checklist

---

## GitHub Best Practices

### ✅ DO:

- ✅ Use issue templates for all issues
- ✅ Link PRs to issues with "Closes #XXX"
- ✅ Follow TDD (tests before code)
- ✅ Verify linting passes before pushing
- ✅ Write clear commit messages
- ✅ Review PRs thoroughly
- ✅ Reference copilot instructions in comments

### ❌ DON'T:

- ❌ Merge PRs without verifying TDD workflow
- ❌ Ignore PR template checklist
- ❌ Create PRs directly to main (use branches)
- ❌ Skip issue templates
- ❌ Force-push to main
- ❌ Ignore linting errors

---

## Troubleshooting GitHub

### PR Template Not Showing

**Solution:** Ensure file is at `.github/pull_request_template.md` (exact path)

```bash
ls -la .github/pull_request_template.md
```

### Issue Templates Not Showing

**Solution:** Ensure directory is `.github/ISSUE_TEMPLATE/` (exact name)

```bash
ls -la .github/ISSUE_TEMPLATE/
```

### Submodules Not Updating

```bash
git submodule update --recursive --remote
git add repos/
git commit -m "chore: Update submodules"
git push
```

### Cannot Create PR

```bash
# Ensure you have permission to the repository
gh repo view Rarsus/necromundabot

# Ensure branch is pushed
git push -u origin my-branch

# Create PR
gh pr create --base main
```

---

## Getting Help

### In GitHub

- Read `README.md` (top of repo)
- Read `CONTRIBUTING.md`
- Check `.github/copilot-instructions.md`
- Open existing issues for examples

### In VS Code

- Open `.github/copilot-instructions.md`
- Browse `.github/copilot-scenarios/`
- Ask Copilot Chat: `Ctrl+Shift+I`

### With GitHub CLI

```bash
gh issue view <ISSUE-NUMBER>
gh pr view <PR-NUMBER>
gh repo view Rarsus/necromundabot
```

---

**Summary:** GitHub is fully set up with issue templates, PR templates, and copilot instructions integrated at every step. Contributors will see the instructions automatically! 🎉
