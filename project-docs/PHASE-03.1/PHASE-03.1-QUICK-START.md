# PHASE-3.1 QUICK START GUIDE

**Status:** 🟡 READY TO IMPLEMENT  
**Date:** January 27, 2026  
**Objective:** Fix npm vulnerabilities and upgrade discord.js to v15

---

## 🎯 What We're Doing

Fixing 7 npm vulnerabilities by upgrading:

- **discord.js**: v14.14.0 → v15.x (fixes undici vulnerability)
- **eslint-config-next**: v14.2.35 → v16.1.4 (fixes glob vulnerability)

**Result:** npm audit will show 0 vulnerabilities ✅

---

## 📊 Current State

### Vulnerabilities (7 total)

```
✗ HIGH: glob (via @next/eslint-plugin-next) → in necrobot-dashboard
✗ MODERATE: undici (via discord.js) → in necromundabot, necrobot-core
✗ MODERATE: @discordjs/rest (via undici) → via discord.js
✗ MODERATE: @discordjs/ws (via @discordjs/rest) → via discord.js
```

### Repositories Affected

- ✗ necromundabot (main)
- ✗ necrobot-core
- ✗ necrobot-dashboard
- ✓ necrobot-utils (clean)
- ✓ necrobot-commands (clean)

---

## 🚀 Implementation Steps

### STEP 1: Check Current Versions (Verification Only)

```bash
cd /home/olav/repo/necromundabot

# Check current discord.js version
npm list discord.js

# Check current eslint-config-next version
npm list eslint-config-next

# Verify vulnerabilities
npm audit
```

**Expected Current Output:**

```
discord.js@14.14.0 (or similar v14.x)
eslint-config-next@14.2.35 (or similar v14.x)
7 vulnerabilities (4 moderate, 3 high)
```

---

### STEP 2: Create Test Branch

```bash
cd /home/olav/repo/necromundabot

# Create feature branch
git checkout -b feature/discord-js-v15

# Verify you're on new branch
git branch
# Output should show: * feature/discord-js-v15
```

---

### STEP 3: Update discord.js in necromundabot (Main)

```bash
cd /home/olav/repo/necromundabot

# Update discord.js to latest v14 (temporary, to see what breaks)
npm install discord.js@latest

# This will install discord.js v15.x.x
# The npm audit will likely still fail because of transitive deps
```

---

### STEP 4: Update necrobot-core

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-core

# Update discord.js in workspace
npm install discord.js@latest

# Check what version was installed
npm list discord.js
```

---

### STEP 5: Update necrobot-dashboard (Fix glob)

```bash
cd /home/olav/repo/necromundabot/repos/necrobot-dashboard

# Update eslint-config-next to v16.1.4+
npm install eslint-config-next@latest

# This should be v16.1.4 or higher
npm list eslint-config-next
```

---

### STEP 6: Update All Workspaces Together

```bash
cd /home/olav/repo/necromundabot

# Install/update dependencies in all workspaces
npm install -ws

# Verify all workspaces
npm list --depth=0 -ws
```

---

### STEP 7: Check Audit Results

```bash
cd /home/olav/repo/necromundabot

# Run audit across all workspaces
npm audit --workspaces

# EXPECTED OUTPUT: 0 vulnerabilities (or very few)
```

If vulnerabilities remain:

```bash
# Try fixing automatically
npm audit fix --workspaces --force

# Run audit again
npm audit --workspaces
```

---

### STEP 8: Run Tests to Identify Breaking Changes

```bash
cd /home/olav/repo/necromundabot

# Run tests to see what breaks
npm test 2>&1 | tee test-results.log

# This will show failing tests
# Save output to test-results.log for analysis
```

**Expected:** Some tests may fail due to discord.js v15 breaking changes

---

### STEP 9: Analyze Test Failures

Open `test-results.log` and look for:

1. **Module import errors**
   - "Cannot find module..."
   - "Module deprecated..."
   - "API changed..."

2. **Runtime errors**
   - "Property X is not a function..."
   - "Property X doesn't exist..."
   - "Event Y is not emitted..."

3. **API changes**
   - Look for discord.js related error messages
   - Note which files are failing
   - Save specific error messages

---

### STEP 10: Document Findings

Create file: `DISCORD-JS-V15-BREAKING-CHANGES.md` with:

```markdown
# discord.js v14 → v15 Breaking Changes Found

## Test Failures (X total)

### Failure 1: [Error Name]

- File: [src/path/to/file.js]
- Line: [X]
- Error: [exact error message]
- Root Cause: [why it failed]
- Fix: [how to fix it]

### Failure 2: ...
```

---

### STEP 11: Fix the Code

Based on test failures:

1. Update event handlers (if discord.js changed event names/behavior)
2. Update command handlers (if interaction API changed)
3. Update utilities (if helper methods changed)
4. Fix imports (if module structure changed)

**For each failure:**

1. Read the error message
2. Check discord.js v15 migration guide
3. Update the code
4. Rerun tests
5. Repeat until all pass

---

### STEP 12: Run Full Test Suite

```bash
cd /home/olav/repo/necromundabot

# Run full test suite
npm test -- --coverage

# Expected output:
# Test Suites: X passed, 0 failed
# Tests: Y passed, 0 failed
# Coverage: 90%+ lines
```

---

### STEP 13: Verify Docker Build

```bash
cd /home/olav/repo/necromundabot

# Clean docker
docker-compose down
docker system prune -f

# Build fresh
docker-compose up --build -d

# Watch logs
docker logs necromundabot -f --tail 50

# Expected output:
# ✅ Bot logged in as NecromundaBot#XXXX
# ✅ Loaded X command(s) from Y categor(y/ies)
```

---

### STEP 14: Test Bot in Discord

If Docker build succeeds:

1. Open your Discord test server
2. Run `/ping` → should see response
3. Run `/help` → should list commands
4. Run `/info` → should show bot info
5. Try a quote command → should work

**Expected:** All commands work correctly

---

### STEP 15: Verify npm Audit is Clean

```bash
cd /home/olav/repo/necromundabot

# Final verification
npm audit --workspaces

# EXPECTED: ✓ 0 vulnerabilities
```

---

### STEP 16: Commit & Push

```bash
cd /home/olav/repo/necromundabot

# Check status
git status

# Add all changes
git add -A

# Commit with message
git commit -m "chore(deps): Update discord.js to v15 and fix npm vulnerabilities

- Updated discord.js from v14.14.0 to v15.x (latest stable)
- Updated @discordjs packages for v15 compatibility
- Updated eslint-config-next to v16.1.4 (fixes glob vulnerability)
- Fixed undici vulnerability (transitive from discord.js)
- All tests pass: npm test ✅
- Docker build successful ✅
- Manual Discord testing completed ✅
- npm audit: 0 vulnerabilities ✅"

# Push branch
git push origin feature/discord-js-v15
```

---

### STEP 17: Create GitHub Release

```bash
cd /home/olav/repo/necromundabot

# Analyze what changed
node scripts/analyze-version-impact.js v0.2.6

# Create release
scripts/create-release.sh 1.0.0
```

This will:

1. Update package.json to v1.0.0 (major version bump)
2. Create commit: "chore: release version 1.0.0"
3. Create git tag: v1.0.0
4. Show next steps

---

### STEP 18: Push Release & Create GitHub Release

```bash
cd /home/olav/repo/necromundabot

# Push commit and tag
git push origin main --tags

# Go to: https://github.com/Rarsus/necromundabot/releases
# Create release from v1.0.0 tag
# Add breaking changes documentation
```

---

## ⚠️ Troubleshooting

### Issue: npm install fails

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm install --workspaces
```

### Issue: Tests fail due to missing module

**Solution:**

1. Check error message for module name
2. Verify it's installed: `npm list [module-name]`
3. Check discord.js v15 migration guide for renaming

### Issue: Docker build fails

**Solution:**

```bash
# Rebuild from scratch
docker-compose down
docker system prune -f
docker-compose up --build -d

# Check logs for errors
docker logs necromundabot
```

### Issue: npm audit still shows vulnerabilities

**Solution:**

```bash
# Run audit to see details
npm audit --json | jq '.vulnerabilities'

# Force fix if safe
npm audit fix --force

# Run audit again
npm audit
```

---

## 📋 Checklist: When to Move to Phase 3.2

✅ **Done with Phase 3.1 when:**

- [ ] npm audit shows 0 vulnerabilities (all workspaces)
- [ ] All tests pass: `npm test`
- [ ] All linting passes: `npm run lint`
- [ ] Docker build successful
- [ ] Bot starts without errors
- [ ] All commands load
- [ ] At least 3 commands work in Discord
- [ ] v1.0.0 released in all repositories
- [ ] GitHub releases created with breaking changes documented

---

## 🎓 Reference Links

- [discord.js Official Docs](https://discord.js.org/)
- [discord.js GitHub v15 Release](https://github.com/discordjs/discord.js/releases/tag/v15.0.0)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [PHASE-03.1 Implementation Analysis](./PHASE-03.1-IMPLEMENTATION-ANALYSIS.md)

---

## 🚦 Current Progress

**Status:** Ready to execute  
**Time Estimate:** 10-15 hours  
**Effort:** Medium-High (due to testing and potential code changes)

**Start Phase 3.1 now by following Step 1 above!**
