# Workflow Parallelization Guide

**Status:** ✅ IMPLEMENTATION READY
**Date:** January 30, 2026
**Focus:** Optimizing GitHub Actions workflow job concurrency

---

## Overview

The NecromundaBot GitHub Actions workflows currently have opportunities for parallelization that can significantly reduce total pipeline execution time. This guide documents how to enable parallel execution of independent jobs.

---

## Current Workflow Structure

### Publish Pipeline (Current Sequential)

```
publish-utils (5 min)
    ↓ needs:
publish-core (5 min)
    ↓ needs:
publish-commands (3 min)
    ↓ needs:
publish-dashboard (2 min)
    ↓ needs:
build-bot-docker (5 min)
    ↓ needs:
verify (2 min)

Total: 22 minutes (SEQUENTIAL)
```

---

## Optimization Opportunity #1: Parallel Dashboard Publishing

### Current Dependency Issue

```
Dashboard UNNECESSARILY waits for Commands
├─ Dashboard depends on: necrobot-utils only
├─ Commands depends on: necrobot-core + utils
├─ Current needs: publish-commands ❌
├─ Should need: publish-utils ✅
└─ Impact: 3 extra minutes of delay
```

### Optimized Structure

```
publish-utils (5 min)
    ├─ needs: publish-utils ✅
    ├─ needs: publish-utils ✅
    └─ needs: publish-utils ✅
    ↓
    ├─ publish-core (5 min)      [SEQUENTIAL: needs utils]
    │   ↓
    │   └─ publish-commands (3 min) [needs core]
    │
    └─ publish-dashboard (2 min)   [PARALLEL: only needs utils]

Total: 13 minutes (38% faster!)
```

### Implementation

**Change in publish-packages.yml:**

```yaml
  # BEFORE: publish-dashboard needs commands
  publish-dashboard:
    needs: publish-commands  # ❌ Unnecessary dependency
    runs-on: ubuntu-latest
    ...

  # AFTER: publish-dashboard only needs utils
  publish-dashboard:
    needs: publish-utils  # ✅ Correct dependency
    runs-on: ubuntu-latest
    ...
```

**Why This Works:**

- Dashboard only depends on `necrobot-utils`
- Utils is published first (5 min)
- Dashboard can start publishing at 5 min mark
- Commands finishes at 13 min mark (5 + 5 + 3)
- Dashboard finishes at 7 min mark (5 + 2)
- Both finish before verify job runs

---

## Optimization Opportunity #2: Parallel Docker Builds

### Current Dependency Issue

```
build-bot-docker waits for publish-commands
    ↓
build-dashboard-docker starts

Problem:
- Bot image doesn't depend on dashboard package
- Dashboard image doesn't depend on bot package
- Both could build in parallel
```

### Optimized Structure

```
publish-commands (finishes at 13 min)
    ├─ build-bot-docker (5 min)      [PARALLEL]
    └─ build-dashboard-docker (3 min) [PARALLEL]

Both finish by 18 min (same end time)
```

### Implementation

**Change in publish-packages.yml:**

```yaml
  # NEW: Separate docker build jobs with independent needs

  build-bot-docker:
    name: 🐳 Build Bot Docker Image
    needs: [publish-utils, publish-core, publish-commands]  # All packages ready
    runs-on: ubuntu-latest
    ...

  build-dashboard-docker:
    name: 🎨 Build Dashboard Docker Image
    needs: [publish-utils, publish-dashboard]  # Dashboard package ready
    runs-on: ubuntu-latest
    ...

  verify:
    name: ✅ Verify Published Artifacts
    needs: [publish-utils, publish-core, publish-commands, publish-dashboard,
            build-bot-docker, build-dashboard-docker]
    runs-on: ubuntu-latest
    ...
```

---

## Combined Optimization: Full Pipeline

### Before Optimization

```
                  publish-utils (5 min)
                        ↓
                   publish-core (5 min)
                        ↓
                publish-commands (3 min)
                        ↓
              publish-dashboard (2 min)
                        ↓
              build-bot-docker (5 min)
                        ↓
           build-dashboard-docker (3 min)
                        ↓
                      verify (2 min)

Total: 25 minutes ⏱️
```

### After Optimization

```
                  publish-utils (5 min)
                   /              \
              (5 min)              (2 min)
              /                        \
        publish-core         publish-dashboard
             ↓                   (parallel)
        publish-commands
             ↓
        ✅ 13 min total for publishing
             /              \
        (5 min)              (3 min)
        /                        \
  build-bot-docker    build-dashboard-docker
    (parallel)              (parallel)
             \              /
              ✅ 5 min (both run together)
                   ↓
                 verify (2 min)

Total: 20 minutes 🚀
(20% faster than before!)
```

**Time Breakdown:**

| Phase            | Before     | After      | Savings         |
| ---------------- | ---------- | ---------- | --------------- |
| Publish packages | 17 min     | 13 min     | 4 min (24%)     |
| Docker builds    | 8 min      | 5 min      | 3 min (38%)     |
| Verify           | 2 min      | 2 min      | -               |
| **TOTAL**        | **27 min** | **20 min** | **7 min (26%)** |

---

## Implementation Checklist

### Phase 1: Understand Dependencies

- [ ] Read publish-packages.yml current state
- [ ] Map all job dependencies
- [ ] Identify parallel opportunities
- [ ] Verify no circular dependencies

### Phase 2: Update Workflow

- [ ] Change publish-dashboard to `needs: publish-utils`
- [ ] Separate docker build jobs if not already separate
- [ ] Ensure verify job lists all dependencies
- [ ] Add workflow visualization comments

### Phase 3: Test Changes

- [ ] Commit changes to feature branch
- [ ] Trigger workflow on test branch
- [ ] Monitor execution order in GitHub Actions
- [ ] Verify all packages publish correctly
- [ ] Confirm Docker images build successfully

### Phase 4: Deploy to Production

- [ ] Create pull request with changes
- [ ] Get team approval
- [ ] Merge to main
- [ ] Monitor first production run
- [ ] Document actual execution times

### Phase 5: Monitor & Optimize

- [ ] Track workflow execution times
- [ ] Compare against predictions
- [ ] Identify remaining bottlenecks
- [ ] Plan Phase 2 optimizations

---

## Advanced Optimization: Step-Level Parallelization

### Opportunity: npm ci in parallel jobs

Currently each job runs `npm ci` sequentially. These could theoretically run in parallel:

```yaml
# Current (sequential ci):
publish-utils:
  steps:
    - run: cd repos/necrobot-utils && npm ci  (1 min)
    - run: cd repos/necrobot-utils && npm publish (1 min)

publish-core:
  needs: publish-utils
  steps:
    - run: cd repos/necrobot-core && npm ci  (1 min)
    - run: cd repos/necrobot-core && npm publish (1 min)

# Optimized (could use caching):
# Add npm cache to each job to speed up ci:
- uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: 'repos/*/package-lock.json'
```

**Impact:** Each `npm ci` reduced from 1 min to 15-30 sec with caching

### Further Optimizations Not Implemented Yet

1. **npm Workspace Caching**
   - Cache shared node_modules across jobs
   - Could save 2-3 minutes per publish job

2. **Partial Publishing**
   - Only publish changed workspaces
   - Skip unchanged workspaces

3. **Docker Build Optimization**
   - Use Docker layer caching
   - Share layers between bot and dashboard
   - Could reduce build time 30-50%

---

## Decision Tree: When to Apply Each Optimization

```
Should we parallelize?
├─ Do jobs have independent dependencies?
│  ├─ YES → Can run in parallel ✅
│  └─ NO → Must run sequentially ❌
├─ Will this affect release consistency?
│  ├─ NO → Safe to parallelize ✅
│  └─ YES → Keep sequential for clarity
└─ Estimated time savings?
   ├─ >10 minutes → Worth implementing ✅
   └─ <5 minutes → Marginal benefit
```

---

## Workflow Visualization Tools

### GitHub Actions Native

1. Go to Actions tab in GitHub
2. Select the workflow
3. Click on a completed run
4. View the "Visualize" tab
5. See job execution graph

**Shows:**

- Job dependencies
- Execution order
- Timing information
- Success/failure status

### Local Validation

```bash
# Validate workflow syntax
act -l  # List all workflows
act --job publish-packages  # Check specific workflow

# View job dependency graph
cat .github/workflows/publish-packages.yml | grep "needs:"
```

---

## Risk Assessment

### Low Risk ✅

- Changing publish-dashboard dependencies from `publish-commands` to `publish-utils`
  - Dashboard truly only depends on utils
  - This is currently overly conservative
  - No functional change, just optimization

### Medium Risk ⚠️

- Running docker builds in parallel
  - Different resources needed
  - Disk space considerations
  - Could hit concurrent build limits

### High Risk 🔴

- Removing sequential ordering without validation
  - Could cause version mismatches
  - Semantic versioning coordination needed
  - Requires careful testing

---

## Success Metrics

### Quantitative

- ✅ Pipeline time reduced by 20%+
- ✅ Jobs execute in correct dependency order
- ✅ All packages published successfully
- ✅ Docker images built without conflicts
- ✅ Verify job confirms all artifacts available

### Qualitative

- ✅ Team understands workflow changes
- ✅ Clear documentation of optimization
- ✅ Easy to revert if needed
- ✅ Logs show expected parallelization

---

## Example GitHub Actions Output

### Before Optimization

```
2024-01-30T10:00:00Z: Starting workflow
2024-01-30T10:05:00Z: publish-utils complete ✅
2024-01-30T10:10:00Z: publish-core complete ✅
2024-01-30T10:13:00Z: publish-commands complete ✅
2024-01-30T10:15:00Z: publish-dashboard complete ✅
2024-01-30T10:20:00Z: build-bot-docker complete ✅
2024-01-30T10:23:00Z: build-dashboard-docker complete ✅
2024-01-30T10:25:00Z: verify complete ✅

Total time: 25 minutes
```

### After Optimization

```
2024-01-30T10:00:00Z: Starting workflow
2024-01-30T10:05:00Z: publish-utils complete ✅
2024-01-30T10:05:00Z: publish-core starts (depends: utils) →
2024-01-30T10:05:00Z: publish-dashboard starts (depends: utils) ✅ PARALLEL!
2024-01-30T10:07:00Z: publish-dashboard complete ✅
2024-01-30T10:10:00Z: publish-core complete ✅
2024-01-30T10:13:00Z: publish-commands complete ✅
2024-01-30T10:13:00Z: build-bot-docker starts →
2024-01-30T10:13:00Z: build-dashboard-docker starts ✅ PARALLEL!
2024-01-30T10:18:00Z: build-bot-docker complete ✅
2024-01-30T10:16:00Z: build-dashboard-docker complete ✅
2024-01-30T10:20:00Z: verify complete ✅

Total time: 20 minutes 🚀 (5 minutes saved!)
```

---

## Recommended Implementation Order

### Step 1: Fix publish-dashboard dependency (IMMEDIATE)

```yaml
publish-dashboard:
  needs: publish-utils # Change from: publish-commands
```

**Why:**

- Low risk change
- Correct dependency relationship
- Saves 3+ minutes

**Time to implement:** 5 minutes

### Step 2: Ensure docker builds can parallelize (PHASE 2)

```yaml
build-bot-docker:
  needs: [publish-utils, publish-core, publish-commands]

build-dashboard-docker:
  needs: [publish-utils, publish-dashboard]
```

**Why:**

- Saves another 3 minutes
- Both builds are independent
- Safe to do in parallel

**Time to implement:** 10 minutes
**Time to test:** 1 workflow run (20 minutes)

### Step 3: npm ci caching (PHASE 3)

Add to each job:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: 'repos/*/package-lock.json'
```

**Why:**

- Saves 30-60 seconds per job
- Uses GitHub's built-in caching
- No operational overhead

**Time to implement:** 5 minutes per job

---

## Troubleshooting Parallelization Issues

### Issue: Jobs run sequentially despite no dependency

**Cause:** Workflow runner concurrency limits
**Solution:** Check Actions settings in repository settings

### Issue: Package not found when building

**Cause:** Job started before dependency finished
**Solution:** Add explicit `needs:` clause

### Issue: Docker build fails with disk space

**Cause:** Multiple builds consuming disk
**Solution:** Implement caching, clean up old images

### Issue: Verify job sees stale package data

**Cause:** npm registry cache
**Solution:** Add `sleep 2` before checking availability

---

## Files to Modify

1. `.github/workflows/publish-packages.yml`
   - Update publish-dashboard needs
   - Separate docker build jobs (if not already)
   - Add optimization comments

2. `.github/workflows/release-workspace-independent.yml` (if it has similar structure)
   - Apply same optimizations

3. Documentation files:
   - Update timing predictions
   - Add parallelization diagrams
   - Document changes made

---

## Related Documentation

- [Publish Packages Workflow](../.github/workflows/publish-packages.yml)
- [Release Workflow](../.github/workflows/release-workspace-independent.yml)
- [Workspace Versioning System](./PHASE-04.0-WORKSPACE-INDEPENDENT-VERSIONING.md)
- [GitHub Actions Documentation](https://docs.github.com/actions)

---

## Approval Checklist

- [ ] Workflow changes reviewed by team
- [ ] Risk assessment accepted
- [ ] Time savings justified
- [ ] Test results verified
- [ ] Documentation updated
- [ ] Ready for production deployment

---

**Next Steps:** Implement Phase 1 (fix publish-dashboard dependency) immediately.

**Estimated Impact:** 26% faster CI/CD pipeline (20 minutes vs 27 minutes)
