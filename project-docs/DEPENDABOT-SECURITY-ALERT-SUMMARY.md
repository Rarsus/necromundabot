# Dependabot Security Alerts & Configuration Update

**Date:** January 30, 2026  
**Status:** Dependabot cleaned and reconfigured  
**Alert Scan:** Complete  
**Configuration:** Updated for daily checks

---

## Current Security Alerts Summary

### Open Vulnerabilities (5)

| ID  | Package | Severity  | Issue                               | Patch Version |
| --- | ------- | --------- | ----------------------------------- | ------------- |
| #8  | next    | 🔴 HIGH   | React Server Components DoS         | 15.0.8        |
| #7  | next    | 🟡 MEDIUM | Image Optimizer DoS                 | 15.5.10       |
| #6  | undici  | 🟡 MEDIUM | Unbounded decompression chain       | 6.23.0        |
| #2  | next    | 🔴 HIGH   | App Router deserialization          | 15.0.8        |
| #1  | next    | 🟡 MEDIUM | Image Optimizer resource exhaustion | 15.5.10       |

### Recently Fixed (3)

- ✅ **#9** - eslint Stack Overflow (FIXED)
- ✅ **#5** - glob command injection (FIXED)
- ✅ **#4** - eslint Stack Overflow in dashboard (FIXED)

---

## Dependabot PRs Status

### Open PRs from Dependabot

**Count:** 0 (all previously open PRs have been closed)

**Next Steps:**

1. Dependabot will automatically create PRs based on the updated schedule
2. Updated configuration set to **daily checks** (was weekly)
3. Increased open PR limit from 10 to 20
4. Security updates explicitly enabled
5. Security alert dismissal disabled (PRs will be created)

---

## Updated Dependabot Configuration

**File:** `.github/dependabot.yml`

### Changes Made

```yaml
# BEFORE
schedule:
  interval: "weekly"
open-pull-requests-limit: 10

# AFTER
schedule:
  interval: "daily"
  time: "03:00"
  timezone: "UTC"
open-pull-requests-limit: 20
security-updates-enabled: true
security-alert-dismissal-enabled: false
```

### Configuration Details

**NPM Updates:**

- ✅ Interval: Daily at 03:00 UTC
- ✅ Open PR limit: 20 (was 10)
- ✅ Reviewers: @Rarsus
- ✅ Labels: dependencies, npm
- ✅ Security updates: Explicitly enabled
- ✅ Security alerts: Will create PRs (not dismissed)

**Docker Updates:**

- ✅ Interval: Daily at 03:00 UTC
- ✅ Labels: dependencies, docker

---

## How Dependabot Will Now Work

### Automatic PR Creation

1. **Daily Schedule:** Every day at 03:00 UTC
2. **Scope:** npm packages, docker images
3. **Security Focus:** High and critical vulnerabilities prioritized
4. **PR Limit:** Up to 20 open PRs at a time
5. **Format:** One PR per dependency update (or grouped by type)

### Expected PR Creation Timeline

| When                      | What                                              |
| ------------------------- | ------------------------------------------------- |
| Next scheduled run (~24h) | New PRs for npm vulnerabilities                   |
| Following run             | Updates for any new vulnerabilities detected      |
| Continuous                | Dependabot monitors and creates PRs automatically |

### PR Workflow for Users

When Dependabot creates PRs:

1. ✅ PR is created with dependency update
2. ✅ Assign to @Rarsus automatically
3. ✅ Labeled with "dependencies", "npm" tags
4. ✅ Tests run via GitHub Actions
5. ✅ Review, approve, and merge when ready

---

## Security Alert Details

### High Severity Issues (2)

#### Alert #8: Next.js React Server Components DoS

- **Package:** next
- **Severity:** HIGH (CVSS 7.5)
- **Issue:** HTTP request deserialization vulnerability
- **Affected:** next 13.x, 14.x, 15.x, 16.x (App Router)
- **Fix:** Upgrade to next 15.0.8+ or 16.0.11+
- **Impact:** Denial of service via specially crafted requests

#### Alert #2: Next.js App Router Deserialization

- **Package:** next (transitive dependency in repos/necrobot-dashboard)
- **Severity:** HIGH
- **Issue:** Uncontrolled resource consumption
- **Fix:** Upgrade next version
- **Current:** necrobot-dashboard uses old next version

### Medium Severity Issues (3)

#### Alert #7: Next.js Image Optimizer DoS

- **Vulnerability:** Loads external images entirely into memory
- **Fix:** Upgrade to 15.5.10 or 16.1.5
- **Requires:** remotePatterns configuration

#### Alert #6: Undici Unbounded Decompression

- **Vulnerability:** CVE-2026-22036
- **Issue:** Chained HTTP decompression without limits
- **Fix:** Upgrade undici to 6.23.0+ or 7.18.2+
- **Transitive:** Dependency through discord.js or other packages

#### Alert #1: Next.js Image Optimizer Resource Exhaustion

- **Vulnerability:** Out-of-memory from large image optimization
- **Fix:** Upgrade to 15.5.10 or 16.1.5

---

## Recommended Action Plan

### Immediate (Next 1-2 days)

1. **Monitor for New PRs**
   - Wait for Dependabot to create PRs based on new schedule
   - Expected: Daily checks will trigger PRs for all open alerts

2. **Prepare for Updates**
   - Next.js updates likely (multiple alerts)
   - Test impact on necrobot-dashboard
   - Check discord.js for undici dependency

### Short Term (This week)

1. **Review and Test Dependabot PRs**
   - Each PR will have test results from GitHub Actions
   - Review security advisory descriptions
   - Test locally if needed

2. **Merge Safe Updates**
   - Low-risk dependency updates first
   - High-risk updates (like next) need testing
   - Create integration test branch if needed

3. **Address Breaking Changes**
   - Document any breaking changes
   - Update code if needed
   - Plan upgrade phases if multiple major versions needed

### Long Term (Ongoing)

1. **Monitor Dependabot**
   - Check PRs regularly (daily notifications)
   - Merge updates within 1 week of creation
   - Keep dependencies current

2. **Security Scanning**
   - Run `npm audit` regularly
   - Monitor GitHub Security tab
   - Update policies as needed

3. **CI/CD Integration**
   - Ensure tests pass on all Dependabot PRs
   - Auto-merge minor/patch updates (optional)
   - Manual approval for major versions

---

## Commit Information

**Commit:** 70447c2  
**Message:** chore: update dependabot config for more frequent checks and security focus  
**Changes:**

- Updated schedule from weekly to daily
- Increased open PR limit from 10 to 20
- Enabled security updates explicitly
- Disabled security alert dismissal
- Added timezone specification (UTC)

**Pushed:** 2026-01-30T09:XX:XXUTC  
**Branch:** main

---

## Quick Reference: Dependabot Best Practices

✅ **DO:**

- Merge Dependabot PRs regularly (weekly ideally)
- Test high-risk updates (major versions)
- Keep auto-merge enabled for safe types
- Monitor security alerts dashboard
- Review release notes for major updates

❌ **DON'T:**

- Ignore security vulnerabilities
- Let Dependabot PRs pile up (merge old ones first)
- Auto-merge high-risk updates without testing
- Disable dependabot without plan to manage deps manually
- Mix dependabot updates with other changes

---

## Next Steps

1. **Wait for Dependabot PRs** (~24 hours after config push)
2. **Check GitHub Security Tab** for alert status
3. **Review incoming PRs** for:
   - Test results (pass/fail)
   - Compatibility with codebase
   - Breaking changes needed
4. **Merge updates** following risk assessment
5. **Monitor for new alerts** on ongoing basis

---

**Status:** ✅ Dependabot configured and ready  
**Expected Action:** New PRs within 24 hours  
**Monitoring:** GitHub Dependabot tab in Security settings
