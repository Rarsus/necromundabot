# Version Management Strategy for Necrobot Monorepo

> **Purpose:** Ensure correct versions are used across interdependent packages during development and publishing

**Last Updated:** January 28, 2026

## Table of Contents

- [Dependency Structure](#dependency-structure)
- [Version Resolution Strategy](#version-resolution-strategy)
- [Version Compatibility Rules](#version-compatibility-rules)
- [Version Management Workflow](#version-management-workflow)
- [Verification Methods](#verification-methods)
- [Common Pitfalls](#common-pitfalls)
- [Release Process](#release-process)

---

## Dependency Structure

### Monorepo Layout

```
necromundabot (root)
│
├── repos/necrobot-utils (v0.2.3)
│   └── No necrobot-* dependencies (foundation package)
│
├── repos/necrobot-core (v0.3.1)
│   └── depends on: necrobot-utils@*
│
├── repos/necrobot-commands (v0.2.1)
│   ├── depends on: necrobot-core@*
│   └── depends on: necrobot-utils@*
│
└── repos/necrobot-dashboard (v0.2.1)
    └── depends on: necrobot-utils@*
```

### Dependency Relationships

- **necrobot-utils** (v0.2.3)
  - No upstream dependencies
  - Used by: core, commands, dashboard
  - Role: Foundation layer

- **necrobot-core** (v0.3.1)
  - Depends on: necrobot-utils
  - Used by: commands
  - Role: Engine & services layer

- **necrobot-commands** (v0.2.1)
  - Depends on: necrobot-core, necrobot-utils
  - Role: Command implementations

- **necrobot-dashboard** (v0.2.1)
  - Depends on: necrobot-utils
  - Role: Web UI layer

---

## Version Resolution Strategy

### How It Works

npm monorepos use a special version resolution system:

1. **In package.json:** Dependencies specify `"*"` (wildcard)

   ```json
   {
     "dependencies": {
       "necrobot-utils": "*"
     }
   }
   ```

2. **During development:** npm workspaces resolve `*` to local version

   ```
   "necrobot-utils": "*" → resolves to: /repos/necrobot-utils/
   ```

3. **During publishing:** npm replaces `*` with actual version number
   ```json
   "necrobot-utils": "*" → becomes → "necrobot-utils": "0.2.3"
   ```

### Why Wildcard (`*`)?

- ✅ Changes available immediately in development (no re-publish needed)
- ✅ Uses local source code, not npm registry
- ✅ npm handles context-aware resolution
- ✅ Correct for both npm workspaces AND npm registry
- ✅ Simpler than semantic versioning for local development

### Development vs. Publishing

| Scenario        | Dependency Spec         | Resolution     | Result                              |
| --------------- | ----------------------- | -------------- | ----------------------------------- |
| **Local dev**   | `"necrobot-utils": "*"` | npm workspaces | Uses local `/repos/necrobot-utils`  |
| **npm install** | `"necrobot-utils": "*"` | npm registry   | Uses `@rarsus/necrobot-utils@0.2.3` |
| **Testing**     | `"necrobot-utils": "*"` | npm workspaces | Uses local version                  |
| **Publishing**  | `"necrobot-utils": "*"` | npm publishing | Replaces with exact version         |

---

## Version Compatibility Rules

### Rule 1: Foundation Package First

**necrobot-utils has NO upstream dependencies**

- Safe to update independently
- All consumers automatically use the latest local version
- No breaking change cascade
- Update frequency: As needed

**When updating necrobot-utils:**

```bash
1. Update version in repos/necrobot-utils/package.json
2. Run tests (npm test --workspaces)
3. Commit and push
4. GitHub Actions will publish if version changed
5. Consumers will automatically pick up the version
```

### Rule 2: Core Package Must Match Utils

**necrobot-core depends on necrobot-utils**

- Must use same local version of utils as consumers
- During dev: Always uses local utils (via `*`)
- When published: Version is pinned to the utils version that was current

**Version dependency:**

```
necrobot-core uses necrobot-utils@*
→ In dev: uses local version
→ When published: locked to necrobot-utils@0.2.3
```

### Rule 3: Consumer Packages Need Both Dependencies

**necrobot-commands depends on BOTH core and utils**

- Must resolve to consistent versions locally
- Cannot have core using utils@0.2.2 while commands uses utils@0.2.3
- Using `*` ensures both get the local version

**Dependency structure:**

```
necrobot-commands
├── depends on necrobot-core@* → gets local
└── depends on necrobot-utils@* → gets same local version as core
```

### Rule 4: Version Bump Order

**When updating versions, ALWAYS follow this order:**

1. Update foundation packages first (necrobot-utils)
2. Update consumer packages (core, commands, dashboard)
3. Test together before publishing
4. Commit and push

**Example:**

```bash
# CORRECT ORDER
1. Update necrobot-utils from 0.2.3 to 0.2.4
   └─ Test: npm test --workspaces
   └─ Commit and push

2. Update necrobot-core from 0.3.1 to 0.3.2 (if needed)
   └─ Uses new necrobot-utils@0.2.4 automatically
   └─ Test: npm test --workspaces
   └─ Commit and push

3. Update necrobot-commands from 0.2.1 to 0.2.2 (if needed)
   └─ Uses new versions automatically
   └─ Test: npm test --workspaces
   └─ Commit and push

# ❌ WRONG ORDER
# Don't update commands before core is updated
# Don't update core without updating utils first
```

---

## Version Management Workflow

### Updating a Single Package

**Scenario:** Only necrobot-utils has changes

```bash
# Step 1: Decide version bump
# 0.2.3 → 0.2.4 (patch - bug fix)
# 0.2.3 → 0.3.0 (minor - new feature)
# 0.2.3 → 1.0.0 (major - breaking change)

# Step 2: Update package.json
cd repos/necrobot-utils
# Edit package.json and change:
# "version": "0.2.4"

# Step 3: Verify dependencies
cd /path/to/necromundabot
npm ls --workspaces
# Should show no warnings or errors

# Step 4: Run tests
npm test --workspaces
# All tests should PASS ✅

# Step 5: Commit
git add repos/necrobot-utils/package.json
git commit -m "chore: Bump necrobot-utils to 0.2.4

- Updated version from 0.2.3 to 0.2.4
- Includes: [brief description of changes]"

# Step 6: Push
git push origin main
# GitHub Actions will:
# 1. Detect version change
# 2. Run tests
# 3. Publish to GitHub Packages
# 4. Verify publication
```

### Updating Multiple Packages

**Scenario:** Changes in both necrobot-utils and necrobot-core

```bash
# ✅ CORRECT: Update in dependency order

# FIRST: Update foundation (necrobot-utils)
cd repos/necrobot-utils
# Update version
npm test --workspaces
git add .
git commit -m "chore: Bump necrobot-utils to 0.2.4"
git push origin main

# Wait for GitHub Actions to publish

# SECOND: Update consumers (necrobot-core)
cd repos/necrobot-core
# Update version (will use new necrobot-utils automatically)
npm test --workspaces
git add .
git commit -m "chore: Bump necrobot-core to 0.3.2"
git push origin main

# GitHub Actions will publish new version
```

### Version Bump Commands

```bash
# Check current versions
grep '"version"' repos/necrobot-*/package.json

# Check what will be published
cd repos/necrobot-core && npm ls

# Test all packages together
npm test --workspaces

# Verify dependency tree
npm ls --workspaces
```

---

## Verification Methods

### Method 1: Check Local Workspace Resolution

```bash
npm ls --workspaces
```

Output shows:

- All packages and their versions
- Dependencies and their versions
- Which version each package resolves to

### Method 2: Verify Specific Dependency Tree

```bash
# See which packages depend on necrobot-utils
npm ls necrobot-utils --workspaces

# See which packages depend on necrobot-core
npm ls necrobot-core --workspaces
```

### Method 3: Dry-Run Publish Check

```bash
# See what will actually be published
cd repos/necrobot-core
npm ls

# Output shows published version numbers
# (not wildcards, but actual pinned versions)
```

### Method 4: Verify Source Imports

```bash
# Ensure imports use package names, not paths
grep -r "require.*necrobot" repos/necrobot-commands/src/

# Output should be:
# require('necrobot-utils')
# require('necrobot-core')

# ❌ BAD (relative paths):
# require('../necrobot-utils/src/index.js')
# require('file:../necrobot-utils')
```

### Method 5: Run Integration Tests

```bash
# Test all packages together
npm test --workspaces

# Ensures versions work together
# Catches incompatibilities early
```

### Method 6: Check GitHub Actions Workflow

```bash
# View publish workflow status
# Navigate to:
# https://github.com/YOUR_ORG/necromundabot/actions/workflows/publish-packages.yml

# Check:
# - Workflow runs after push
# - All jobs pass (build, test, publish, verify)
# - Published versions appear in GitHub Packages registry
```

---

## Common Pitfalls

### ❌ Pitfall 1: Hardcoding Version Numbers

```json
{
  "dependencies": {
    "necrobot-utils": "0.2.3"
  }
}
```

**Problem:**

- Breaks local development (doesn't use local version)
- Requires manual updates when utils version changes
- Defeats purpose of monorepo

**Solution:**

```json
{
  "dependencies": {
    "necrobot-utils": "*"
  }
}
```

### ❌ Pitfall 2: Using File Paths

```json
{
  "dependencies": {
    "necrobot-utils": "file:../necrobot-utils"
  }
}
```

**Problem:**

- Works locally but breaks when published to npm
- Cannot be installed from npm registry
- Confuses other developers

**Solution:**

```json
{
  "dependencies": {
    "necrobot-utils": "*"
  }
}
```

### ❌ Pitfall 3: Inconsistent Version Updates

```bash
# Wrong: Update commands without updating core
repos/necrobot-commands/package.json → version: "0.3.0"
repos/necrobot-core/package.json → version: "0.3.1" (not updated)
```

**Problem:**

- commands might depend on features in newer core
- Incompatible versions published together
- Breaks for external users

**Solution:**

- Always update in dependency order
- Update foundation packages first
- Test before publishing

### ❌ Pitfall 4: Not Testing Before Publishing

```bash
# Wrong: Update and push without testing
git commit -m "Update utils"
git push
# Later: Package breaks in production
```

**Problem:**

- Incompatible versions published
- No way to test locally
- Breaking changes slip through

**Solution:**

```bash
npm test --workspaces  # Always run before push
npm ls --workspaces   # Verify dependencies
git push origin main   # Only then push
```

### ❌ Pitfall 5: Forgetting to Commit Version Bumps

```bash
# Wrong: Only commit code, forget version
git add repos/necrobot-utils/src/
git commit -m "Fix bug"
# Version still 0.2.3, GitHub Actions doesn't publish
```

**Problem:**

- Workflow won't detect version change
- Package won't be published
- Code changes are lost in build

**Solution:**

```bash
# Always commit version change
git add repos/necrobot-utils/package.json
git add repos/necrobot-utils/src/
git commit -m "chore: Bump necrobot-utils to 0.2.4 with bug fix"
```

---

## Release Process

### Pre-Release Checklist

Before publishing any package:

- [ ] Code changes are complete and committed
- [ ] Version number updated in package.json
- [ ] All tests pass: `npm test --workspaces`
- [ ] No ESLint errors: `npm run lint`
- [ ] Dependency tree verified: `npm ls --workspaces`
- [ ] No warnings in `npm ls` output
- [ ] Commit message documents version bump
- [ ] Code is reviewed and approved
- [ ] GitHub Actions workflow is enabled

### Release Steps

1. **Prepare** - Make code changes, update version
2. **Verify** - Run tests, check dependencies
3. **Commit** - Commit version bump and code
4. **Push** - Push to origin/main
5. **Monitor** - Watch GitHub Actions workflow
6. **Validate** - Check GitHub Packages registry
7. **Document** - Update CHANGELOG if applicable

### Automated vs. Manual Publishing

**Automated (Recommended):**

- Push changes to main
- GitHub Actions detects version change
- Automatically publishes to GitHub Packages
- No manual steps needed

**Manual Publishing (if needed):**

```bash
cd repos/necrobot-utils
npm publish
# Publishes to GitHub Packages using .npmrc config
```

### Version Bump Suggestions

**Patch (0.2.3 → 0.2.4):**

- Bug fixes
- Minor improvements
- No API changes
- Backward compatible

**Minor (0.2.3 → 0.3.0):**

- New features
- New exports
- No breaking changes
- Backward compatible

**Major (0.2.3 → 1.0.0):**

- Breaking changes
- Removed features
- API changes
- Requires consumer updates

---

## FAQ

### Q: When should I update versions?

**A:** After code changes are made and tested:

- Bug fix → Patch bump (0.2.3 → 0.2.4)
- New feature → Minor bump (0.2.3 → 0.3.0)
- Breaking change → Major bump (0.2.3 → 1.0.0)

### Q: Do I need to update versions if I only change tests?

**A:** No. Only bump version when published package contents change.

### Q: What if I update code but forget to bump the version?

**A:** GitHub Actions won't publish (detects no version change). Push the version bump to publish.

### Q: Can I update multiple packages in one commit?

**A:** Not recommended. Update in dependency order across commits (allows sequential publishing).

### Q: How do I know if a version was published successfully?

**A:** Check GitHub Packages registry:

```
https://github.com/YOUR_ORG/necromundabot/packages
```

### Q: What if I want to skip publishing a change?

**A:** Don't commit a version bump. Changes stay local until versioned.

### Q: How do I rollback a published version?

**A:** Publish a new version with fixes. npm doesn't support unpublishing.

---

## See Also

- [PUBLISHING-WORKFLOW-ORDER.md](./PUBLISHING-WORKFLOW-ORDER.md) - How the workflow enforces dependency order
- [GITHUB-PACKAGES-PUBLISHING.md](./GITHUB-PACKAGES-PUBLISHING.md) - Publishing guide
- [DOCKER-TROUBLESHOOTING.md](./DOCKER-TROUBLESHOOTING.md) - Docker setup
- [../architecture/submodule-architecture.md](../architecture/submodule-architecture.md) - Monorepo structure
