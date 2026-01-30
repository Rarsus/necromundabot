# Workflow Fixes - Quick Reference

**Commit:** `47b4f64`  
**Date:** January 30, 2026  
**Status:** ✅ DEPLOYED

---

## 🚨 Issues Fixed

### Issue 1: Reusable Workflow Error

```
❌ workflow is not reusable as it is missing a `on.workflow_call` trigger
```

**Fix:** Added `on.workflow_call:` section to testing.yml  
**Files:** `.github/workflows/testing.yml`

### Issue 2: npm 401 Unauthorized

```
❌ npm error 401 Unauthorized - GET/PUT https://npm.pkg.github.com/@rarsus%2fnecrobot-utils
```

**Fix:**

- Added `scope: '@rarsus'` to setup-node
- Added `NODE_AUTH_TOKEN` env var
- Fixed token assignment syntax  
  **Files:** `.github/workflows/publish-packages.yml` (5 jobs)

### Issue 3: Token Not Injected

```
❌ Token not available to npm publish commands
```

**Fix:** Proper NODE_AUTH_TOKEN env variable configuration  
**Files:** `.github/workflows/publish-packages.yml`

---

## ✅ What Changed

### testing.yml (Lines 1-15)

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:
  workflow_call: # ← ADDED
    outputs:
      test-result:
        description: 'Overall test result'
        value: ${{ jobs.test-summary.outputs.result }}
```

### publish-packages.yml (5 locations)

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    registry-url: 'https://npm.pkg.github.com'
    scope: '@rarsus' # ← ADDED

- name: Configure npm for GitHub Packages
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # ← ADDED
  run: |
    npm config set @rarsus:registry https://npm.pkg.github.com
    npm config set //npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}
    #                                             ↑ No space
```

**Applied to:**

- ✅ publish-utils
- ✅ publish-core
- ✅ publish-commands
- ✅ publish-dashboard
- ✅ verify

---

## 🎯 Impact

| Before                                    | After                                         |
| ----------------------------------------- | --------------------------------------------- |
| ❌ release.yml errors calling testing.yml | ✅ release.yml successfully calls testing.yml |
| ❌ deploy.yml errors calling testing.yml  | ✅ deploy.yml successfully calls testing.yml  |
| ❌ npm publish 401 errors                 | ✅ npm packages authenticate & publish        |
| ❌ Token not injected                     | ✅ GITHUB_TOKEN properly configured           |

---

## 🔄 How the Pipeline Now Works

```
1. Code push to main
    ↓
2. release.yml triggers
    ├─ run-tests: Calls testing.yml (now reusable) ✅
    ├─ pre-release-check: Security audit
    ├─ release: Create version tags
    └─ publish-artifacts: Dispatch publish-packages.yml
        ↓
3. publish-packages.yml triggers
    ├─ publish-utils: Authenticate (scope + TOKEN) ✅ → Publish
    ├─ publish-core: Authenticate ✅ → Publish
    ├─ publish-commands: Authenticate ✅ → Publish
    ├─ publish-dashboard: Authenticate ✅ → Publish
    └─ verify: Confirm all 4 packages in registry
        ↓
4. deploy.yml triggers
    ├─ testing: Reusable test validation ✅
    ├─ pre-deploy-validation: Security audit
    ├─ build-and-push-docker: Docker image
    └─ deploy: Production release
```

---

## 📋 Verification Commands

```bash
# Validate workflow syntax
npm run lint .github/workflows/testing.yml
npm run lint .github/workflows/publish-packages.yml
npm run lint .github/workflows/release.yml
npm run lint .github/workflows/deploy.yml

# Check for workflow_call trigger
grep -A 5 "workflow_call:" .github/workflows/testing.yml

# Check for NODE_AUTH_TOKEN env var
grep -B 2 "NODE_AUTH_TOKEN" .github/workflows/publish-packages.yml

# Check scope parameter
grep "scope:" .github/workflows/publish-packages.yml
```

---

## ⚡ What Works Now

✅ Reusable workflows - testing.yml can be called by other workflows  
✅ Authentication - GITHUB_TOKEN injected for npm registry  
✅ Scoping - @rarsus scope properly configured  
✅ Token injection - NODE_AUTH_TOKEN env var set  
✅ Publishing - All 4 packages can publish to GitHub Packages  
✅ Verification - Registry confirms published packages

---

## 📚 More Details

See [WORKFLOW-FIXES-JAN-30-2026.md](./WORKFLOW-FIXES-JAN-30-2026.md) for comprehensive documentation.
