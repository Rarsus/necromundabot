# Publishing Workflow Order Enforcement

> **Purpose:** Ensure packages are published in correct dependency order via GitHub Actions

**Last Updated:** January 28, 2026

## Overview

The GitHub Actions workflow (`.github/workflows/publish-packages.yml`) has been updated to enforce the correct dependency order when publishing packages to GitHub Packages. This prevents version mismatches and ensures all packages use compatible versions.

## Publishing Order (Mandatory)

```
1️⃣  necrobot-utils (foundation)
    └─ No dependencies
    └─ Published first

2️⃣  necrobot-core
    └─ Depends on: necrobot-utils
    └─ Waits for: publish-utils

3️⃣  necrobot-commands
    └─ Depends on: necrobot-core, necrobot-utils
    └─ Waits for: publish-core

4️⃣  necrobot-dashboard
    └─ Depends on: necrobot-utils
    └─ Waits for: publish-commands
```

## How It Works

### Job Dependencies

Each publishing job is configured with `needs:` to create a dependency chain:

```yaml
publish-utils:
  runs-on: ubuntu-latest
  # No dependencies - runs first

publish-core:
  needs: publish-utils
  # Waits for utils to complete

publish-commands:
  needs: publish-core
  # Waits for core to complete

publish-dashboard:
  needs: publish-commands
  # Waits for commands to complete
```

### Execution Timeline

When you push a version change to GitHub:

```
Time  →

T=0   └─ publish-utils starts
T=30s └─ publish-utils completes
      └─ publish-core starts (blocked until utils done)
T=60s └─ publish-core completes
      └─ publish-commands starts (blocked until core done)
T=90s └─ publish-commands completes
      └─ publish-dashboard starts (blocked until commands done)
T=120s└─ publish-dashboard completes
      └─ verify job runs
T=150s└─ All done! ✅
```

## Version Resolution Guarantee

Because packages are published in dependency order:

1. **necrobot-utils** published first
   - No dependencies affected
   - Base layer available for consumers

2. **necrobot-core** published second
   - Can now reference the published necrobot-utils
   - Version lock happens during publishing

3. **necrobot-commands** published third
   - Both utils and core are available in registry
   - Dependency chain is intact

4. **necrobot-dashboard** published fourth
   - All dependencies available
   - Clean, complete publication

## What This Prevents

### ❌ Before (Matrix Strategy)

```yaml
strategy:
  matrix:
    package:
      - necrobot-core # Published first? Second? Unknown!
      - necrobot-utils
      - necrobot-commands
      - necrobot-dashboard
  max-parallel: 1 # Serial but ORDER UNDEFINED
```

**Problems:**

- No guaranteed order
- Could publish core before utils
- Dependencies might be wrong
- Version mismatches possible

### ✅ After (Sequential Jobs)

```yaml
publish-utils: # 1st

publish-core: # 2nd (waits for utils)
  needs: publish-utils

publish-commands: # 3rd (waits for core)
  needs: publish-core

publish-dashboard: # 4th (waits for commands)
  needs: publish-commands
```

**Benefits:**

- Guaranteed order
- Dependencies always satisfied
- No version mismatches possible
- Clear, transparent workflow

## Triggering Publishes

### Automatic Publishing

Publishes trigger automatically when:

1. Code is pushed to `main` branch
2. Any `repos/*/package.json` file changes (version change)

```bash
# Make code changes
git add repos/necrobot-utils/src/
git commit -m "fix: Update database service"

# Update version
git add repos/necrobot-utils/package.json
git commit -m "chore: Bump necrobot-utils to 0.2.4"

# Push to GitHub
git push origin main
# → GitHub Actions detects version change
# → Workflow starts automatically
# → Executes in correct order ✅
```

### Manual Triggering

You can also manually trigger the workflow:

1. Go to: **Actions tab → Publish Packages to GitHub Packages**
2. Click: **Run workflow**
3. Click: **Run workflow** (confirm)

The workflow will execute in the correct order.

## Monitoring the Workflow

### View Workflow Status

```
GitHub → Actions tab → publish-packages.yml
```

You'll see:

```
✅ publish-utils (completed)
   └─ ✅ Published @rarsus/necrobot-utils@0.2.4

⏳ publish-core (running)
   └─ Waiting for publish-utils to complete...

⏭️  publish-commands (queued)
   └─ Waiting for publish-core...

⏭️  publish-dashboard (queued)
   └─ Waiting for publish-commands...

⏭️  verify (queued)
   └─ Waiting for all to complete...
```

### Real-Time Updates

Each job shows:

- Step-by-step progress
- Version numbers being published
- Success/skip status for each package
- Complete logs for debugging

## Skipping Already-Published Versions

The workflow automatically skips packages that are already published:

```bash
# Scenario: You update only necrobot-utils

Step 1: Check if 0.2.4 already published
  → YES: necrobot-utils already published
  → SKIP publishing

Step 2: publish-core starts
  → Check if 0.3.1 already published
  → YES: necrobot-core already published
  → SKIP publishing

Step 3: publish-commands starts
  → Check if 0.2.1 already published
  → YES: necrobot-commands already published
  → SKIP publishing

Step 4: publish-dashboard starts
  → Check if 0.2.1 already published
  → YES: necrobot-dashboard already published
  → SKIP publishing

Result: Only necrobot-utils@0.2.4 published
        All others skipped (already in registry)
```

## Updating Multiple Packages

### Scenario: Update Utils and Core

```bash
# Update utils first (foundation package)
cd repos/necrobot-utils
# ... make changes ...
# ... update version in package.json ...
git add .
git commit -m "chore: Bump necrobot-utils to 0.2.4"

# Update core second (depends on utils)
cd repos/necrobot-core
# ... make changes ...
# ... update version in package.json ...
git add .
git commit -m "chore: Bump necrobot-core to 0.3.2"

# Push both changes
git push origin main
```

**Workflow execution:**

```
1. publish-utils
   → Version 0.2.4 detected (changed)
   → Publish to registry ✅

2. publish-core
   → Version 0.3.2 detected (changed)
   → Publish to registry ✅
   → Uses new 0.2.4 utils (automatically resolved)

3. publish-commands
   → Version unchanged
   → Skip (already 0.2.1 in registry)

4. publish-dashboard
   → Version unchanged
   → Skip (already 0.2.1 in registry)
```

Result: Both published in correct order ✅

## Error Handling

### If a Job Fails

The workflow will stop at the first failure:

```
publish-utils: ✅ Success
publish-core: ❌ Failed (tests didn't pass)
publish-commands: ⏭️  Not started (blocked)
publish-dashboard: ⏭️  Not started (blocked)
verify: ⏭️  Not started (blocked)
```

**To fix:**

1. Fix the error in necrobot-core
2. Update version (or push with same version)
3. Push to GitHub
4. Workflow re-runs automatically

### Common Failures

**Test failure in publish-core:**

```
Error: npm test failed in necrobot-core
Fix: Debug tests, commit fix, push again
```

**Authentication failure:**

```
Error: 403 Forbidden when publishing
Fix: Verify .npmrc and GITHUB_TOKEN setup
```

**Package already exists:**

```
Error: Version 0.3.2 already published
Fix: Bump to new version (0.3.3), commit, push
```

## Workflow Configuration

The ordering is configured in `.github/workflows/publish-packages.yml`:

```yaml
publish-utils:
  runs-on: ubuntu-latest
  # No dependencies, runs first

publish-core:
  needs: publish-utils
  # Runs after utils

publish-commands:
  needs: publish-core
  # Runs after core

publish-dashboard:
  needs: publish-commands
  # Runs after commands (blocks to ensure all complete)

verify:
  needs: [publish-utils, publish-core, publish-commands, publish-dashboard]
  # Runs after ALL are done
```

## Best Practices

1. ✅ **Update in order during development**
   - Change utils → test → commit
   - Change core → test → commit
   - Change commands → test → commit
   - Then push all commits together

2. ✅ **Commit version bumps together with code**
   - `git add repos/necrobot-utils/package.json`
   - `git add repos/necrobot-utils/src/...`
   - `git commit -m "chore: Bump to 0.2.4 with fixes"`

3. ✅ **Test before pushing**
   - `npm test --workspaces` locally
   - Verify dependency tree: `npm ls --workspaces`
   - Only push when tests pass

4. ❌ **Don't** break the order
   - Update core before utils
   - Skip the dependency chain
   - Force publish without testing

## Verification

After workflow completes, verify packages are published:

```bash
# Check GitHub Packages registry
npm view @rarsus/necrobot-utils
npm view @rarsus/necrobot-core
npm view @rarsus/necrobot-commands
npm view @rarsus/necrobot-dashboard

# Or check latest versions
npm view @rarsus/necrobot-utils versions
```

## See Also

- [VERSION-MANAGEMENT-STRATEGY.md](./VERSION-MANAGEMENT-STRATEGY.md) - Complete version strategy
- [VERSION-MANAGEMENT-QUICK-REFERENCE.md](../QRC/VERSION-MANAGEMENT-QUICK-REFERENCE.md) - Quick reference
- `.github/workflows/publish-packages.yml` - Workflow configuration
