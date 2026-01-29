# PHASE-03.3: Fix GitHub Actions Workflows - Implementation Plan

**Status:** 🟡 PLANNING → 🔴 IN PROGRESS
**Start Date:** January 28, 2026
**Target Completion:** February 10, 2026
**Dependencies:** Phase 03.2 Complete ✅ (Pre-Commit Hooks)
**Blocks:** Phase 03.4 (Submodule Configuration), Phase 03.1 Implementation

---

## 📋 Overview

Phase 03.3 implements a vulnerability acceptance strategy that allows CI/CD pipelines to proceed despite known (accepted) vulnerabilities while still catching NEW vulnerabilities. This unblocks development and releases while maintaining security posture.

**Key Principle:** Accept 7 known discord.js v14.x vulnerabilities, block 0 NEW vulnerabilities, enable all pipelines.

---

## 🎯 Objectives

1. ✅ Create audit baseline file (`.github/audit-baseline.json`)
2. ✅ Document vulnerability acceptance strategy
3. ✅ Create helper scripts for baseline comparison
4. 🔴 Update security.yml workflow
5. 🔴 Update pr-checks.yml workflow
6. 🔴 Update release.yml workflow
7. 🔴 Create monitoring dashboard/status page
8. 🔴 Document workflow behavior for team

---

## 📊 Current State (as of Jan 28, 2026)

### Vulnerabilities to Accept: 7

| Package          | Severity | Count | Affected                     | Reason                              |
| ---------------- | -------- | ----- | ---------------------------- | ----------------------------------- |
| glob             | HIGH     | 1     | necrobot-dashboard           | dashboard-only, fix available, 1-2h |
| undici           | MODERATE | 4     | necromundabot, necrobot-core | discord.js v14 chain, fix via v15   |
| Other discord.js | MODERATE | 2     | necromundabot, necrobot-core | discord.js v14 chain, fix via v15   |

**All vulnerabilities:**

- ✅ Have identified fixes
- ✅ Have target remediation dates (by Feb 28)
- ✅ Have risk assessments
- ✅ Are in transitive dependencies
- ✅ Are documented in `.github/audit-baseline.json`

### Workflow Status

| Workflow         | File                | Current    | Needed                   |
| ---------------- | ------------------- | ---------- | ------------------------ |
| Security Checks  | security.yml        | ❌ Broken  | ✅ Fix baseline checking |
| PR Checks        | pr-checks.yml       | ❌ Blocked | ✅ Allow with baseline   |
| Release Pipeline | release.yml         | ❌ Blocked | ✅ Allow with baseline   |
| Markdown Lint    | markdown.yml        | ✅ Working | Keep as-is               |
| Tests            | tests.yml           | ✅ Working | Keep as-is               |
| Document Naming  | document-naming.yml | ✅ Working | Keep as-is               |
| Versioning       | versioning.yml      | ✅ Working | Keep as-is               |

---

## 📁 Phase 03.3 Deliverables (COMPLETED ✅)

### 1. Audit Baseline File ✅

**File:** `.github/audit-baseline.json`
**Status:** ✅ CREATED
**Size:** 400+ lines
**Content:**

- Version 1.0.0
- Baseline: 7 vulnerabilities documented
- Acceptance criteria and policy
- Audit rules for workflow behavior
- Escalation policies
- Change log

**Key Features:**

- Clear acceptance reasons for each vulnerability
- Target remediation dates and phases
- Expiration date (2026-04-30 for quarterly review)
- Links to remediation plans

---

### 2. Vulnerability Acceptance Strategy ✅

**File:** `.github/VULNERABILITY-ACCEPTANCE-STRATEGY.md`
**Status:** ✅ CREATED
**Size:** 600+ lines
**Content:**

- Acceptance criteria and principles
- Risk assessments for each vulnerability
- Workflow behavior changes
- Communication & transparency strategy
- Remediation timeline
- Monitoring & alerting
- Review and update process
- Success metrics

**Key Sections:**

- Criteria for what vulnerabilities can be accepted
- Current accepted vulnerabilities (7 total)
- How each workflow will behave with baseline
- PR audit comment template
- Escalation procedures
- Team communication plan

---

### 3. Helper Script ✅

**File:** `scripts/compare-audit-against-baseline.sh`
**Status:** ✅ CREATED
**Capabilities:**

- Compare current npm audit against baseline
- Detect NEW vulnerabilities (not in baseline)
- Output human-readable or JSON format
- Optional `--fail-on-new` for CI integration
- Optional `--json` for programmatic use

**Usage:**

```bash
# Human-readable comparison
./scripts/compare-audit-against-baseline.sh

# Fail if any new vulnerabilities
./scripts/compare-audit-against-baseline.sh --fail-on-new

# JSON output for workflow parsing
./scripts/compare-audit-against-baseline.sh --json
```

---

## 🔄 Tasks Remaining (IN PROGRESS)

### Task 03.3.1: Update Security Workflow ⏳

**File:** `.github/workflows/security.yml`
**Current Status:** ❌ BROKEN (blocks PRs)
**Change Required:** Add baseline comparison logic

**Changes:**

1. Run `npm audit --json`
2. Compare against `.github/audit-baseline.json`
3. If vulnerabilities ≤ baseline: ✅ PASS (continue-on-error)
4. If NEW vulnerabilities: ❌ FAIL
5. Comment on PR with audit summary
6. Report audit in workflow summary

**Expected Time:** 1-2 hours
**Complexity:** MEDIUM

---

### Task 03.3.2: Update PR Checks Workflow ⏳

**File:** `.github/workflows/pr-checks.yml`
**Current Status:** ❌ BLOCKED (can't merge)
**Change Required:** Use baseline to decide merge approval

**Changes:**

1. Run `npm audit --json`
2. Compare: current vs baseline
3. If vulnerabilities ≤ baseline: ✅ Allow merge
4. If vulnerabilities > baseline: ❌ Block merge
5. Comment with audit details
6. Link to vulnerability acceptance strategy doc

**Expected Time:** 1-2 hours
**Complexity:** MEDIUM

---

### Task 03.3.3: Update Release Workflow ⏳

**File:** `.github/workflows/release.yml`
**Current Status:** ❌ BLOCKED (can't release)
**Change Required:** Check baseline, allow release if within bounds

**Changes:**

1. Pre-release audit check
2. Compare against baseline
3. If within bounds: ✅ Proceed with release
4. If exceeds baseline: ❌ Block release
5. Add audit summary to release notes
6. Document known vulnerabilities in release

**Expected Time:** 1-2 hours
**Complexity:** MEDIUM

---

### Task 03.3.4: Create Monitoring Dashboard ⏳

**File:** `.github/WORKFLOWS-STATUS.md`
**Current Status:** NOT STARTED
**Content Required:**

- Current vulnerability status
- Workflow health (passing/failing)
- Timeline for vulnerability remediation
- Links to relevant issues and documentation

**Expected Time:** 1 hour
**Complexity:** LOW

---

### Task 03.3.5: Create GitHub Issues ⏳

**Current Status:** NOT STARTED
**Issues to Create:**

1. Child issue 03.3.1 - Update security.yml
2. Child issue 03.3.2 - Update pr-checks.yml
3. Child issue 03.3.3 - Update release.yml
4. Child issue 03.3.4 - Documentation & monitoring

**Expected Time:** 1-2 hours (implementation)
**Complexity:** LOW

---

## 🔧 Implementation Details

### Workflow Update Pattern

All three workflow updates follow the same pattern:

```yaml
name: [Workflow Name]

on: [triggers]

jobs:
  audit-baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Run npm audit
        run: npm audit --json > audit.json || true

      - name: Compare against baseline
        run: |
          # Load baseline and current audit
          BASELINE=$(cat .github/audit-baseline.json)
          CURRENT=$(cat audit.json)

          # Compare vulnerability counts
          BASELINE_COUNT=$(echo "$BASELINE" | jq '.totalVulnerabilities')
          CURRENT_COUNT=$(echo "$CURRENT" | jq '.metadata.vulnerabilities.total')

          # Check for new vulnerabilities
          if [ "$CURRENT_COUNT" -gt "$BASELINE_COUNT" ]; then
            echo "::error::New vulnerabilities detected!"
            exit 1
          fi

          echo "✅ Vulnerabilities within baseline: $CURRENT_COUNT <= $BASELINE_COUNT"

      - name: Comment on PR (if PR)
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const audit = require('./audit.json');
            const comment = `## 🔐 Security Audit\n\nVulnerabilities: ${audit.metadata.vulnerabilities.total}\n\nAll within baseline. ✅`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 📋 Implementation Checklist

### Phase 03.3.1: Update security.yml

- [ ] Add audit baseline comparison
- [ ] Implement continue-on-error for known vulnerabilities
- [ ] Add audit summary comment on PR
- [ ] Test with current vulnerabilities (should pass)
- [ ] Test with synthetic new vulnerability (should fail)
- [ ] Document changes in PR

### Phase 03.3.2: Update pr-checks.yml

- [ ] Add baseline checking logic
- [ ] Implement merge-blocking for excess vulnerabilities
- [ ] Add audit comment to PR
- [ ] Link to vulnerability acceptance strategy
- [ ] Test with current vulnerabilities (should allow merge)
- [ ] Test with synthetic new vulnerability (should block)

### Phase 03.3.3: Update release.yml

- [ ] Add pre-release audit check
- [ ] Compare against baseline
- [ ] Block release if exceeds baseline
- [ ] Add audit info to release notes
- [ ] Document known vulnerabilities in release
- [ ] Test release workflow

### Phase 03.3.4: Monitoring & Documentation

- [ ] Create WORKFLOWS-STATUS.md
- [ ] Document current vulnerability status
- [ ] Link all related issues and docs
- [ ] Create team communication
- [ ] Add to project documentation index

### Phase 03.3.5: GitHub Issues

- [ ] Create child issue 03.3.1
- [ ] Create child issue 03.3.2
- [ ] Create child issue 03.3.3
- [ ] Create child issue 03.3.4
- [ ] Link all to Epic #9
- [ ] Add to project board

---

## ✅ Success Criteria

Phase 03.3 is complete when:

- ✅ Audit baseline created and committed
- ✅ Vulnerability acceptance strategy documented
- ✅ Helper scripts functional and tested
- ✅ Security workflow updated and passing
- ✅ PR checks workflow allows merge with baseline
- ✅ Release workflow allows version bumping
- ✅ All workflow tests passing on main branch
- ✅ NEW vulnerabilities still caught and blocked
- ✅ Team documentation complete
- ✅ GitHub issues created and linked
- ✅ Working directory clean and all commits pushed

---

## 🚀 Benefits Realized

✅ **Unblocked Development**

- PRs can merge despite known vulnerabilities
- Releases can proceed with documented acceptance
- CI/CD pipelines continue to progress

✅ **Maintained Security**

- NEW vulnerabilities still caught
- Baseline prevents regressions
- Escalation procedures for violations

✅ **Clear Communication**

- Team understands acceptance strategy
- Vulnerabilities transparent and documented
- Timeline for remediation clear

✅ **Reduced Friction**

- No more manual workflow bypasses
- Automated vulnerability comparison
- Clear merge criteria

---

## 📖 Documentation to Create

1. **WORKFLOWS-STATUS.md** - Current health and timeline
2. **GitHub Issues** - 4 child issues tracking implementation
3. **PR Descriptions** - Clear explanation of changes
4. **Team Announcement** - Explain workflow improvements

---

## 🔗 Related Issues

- **Epic:** GitHub Issue #9 (Phase 03.3)
- **Parent Phase:** Phase 03.0 (GitHub Actions Workflow Robustness)
- **Previous Phase:** Phase 03.2 (Pre-Commit Hooks - Complete)
- **Future Phase:** Phase 03.1 Implementation (discord.js v15 migration)

---

## 📅 Timeline

| Task                          | Duration | Start  | End       | Status |
| ----------------------------- | -------- | ------ | --------- | ------ |
| 03.3.1 - Update security.yml  | 1-2h     | Jan 28 | Jan 28    | ⏳     |
| 03.3.2 - Update pr-checks.yml | 1-2h     | Jan 28 | Jan 29    | ⏳     |
| 03.3.3 - Update release.yml   | 1-2h     | Jan 29 | Jan 30    | ⏳     |
| 03.3.4 - Documentation        | 1h       | Jan 30 | Jan 30    | ⏳     |
| 03.3.5 - GitHub Issues        | 1-2h     | Jan 30 | Jan 31    | ⏳     |
| Testing & Validation          | 2h       | Jan 31 | Feb 1     | ⏳     |
| **PHASE 03.3 COMPLETE**       |          |        | **Feb 1** | ⏳     |

---

## 📞 Notes

- All deliverables focus on **unblocking pipelines** while **maintaining security**
- Accepted vulnerabilities are temporary (expires April 30, 2026)
- Remediation path is clear (discord.js v15 migration in Phase 03.1)
- Helper scripts are reusable for ongoing vulnerability management
- Monitoring and escalation policies ensure no regressions

---

**Status:** READY TO IMPLEMENT
**Last Updated:** January 28, 2026
**Next Steps:** Create GitHub issues and begin workflow updates
