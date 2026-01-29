# PHASE-04.0 - Resolve Deprecated Dependencies & Modernize Toolchain

**Status:** ✅ PLANNING COMPLETE  
**Date:** January 29, 2026  
**Focus:** npm deprecation warning resolution, dependency modernization, 3-track implementation

---

## Phase Overview

**PHASE-04.0** addresses all 9 npm deprecation warnings identified in the project:

- ESLint 8.57.1 (deprecated, v9+ active)
- glob 7.2.3 (deprecated, v9+ required)
- rimraf 3.0.2 (deprecated, v4+ required)
- inflight 1.0.6 (memory leak, unsupported)
- @humanwhocodes/config-array (deprecated for @eslint/\*)
- @humanwhocodes/object-schema (deprecated for @eslint/\*)
- whatwg-encoding 2.0.0 (transitive dependency)
- abab 2.0.6 (transitive dependency)
- domexception 4.0.0 (transitive dependency)

**Goal:** Zero deprecation warnings, modernized toolchain, all tests passing

---

## Documents in This Phase

### 1. [PHASE-04.0-GITHUB-ISSUES-SUMMARY.md](./PHASE-04.0-GITHUB-ISSUES-SUMMARY.md)

**Purpose:** Quick reference and navigation guide for all GitHub issues

**Contains:**

- Links to all 8 issues (1 epic + 7 sub-issues)
- Summary of deprecated packages and solutions
- 3-week implementation timeline
- Key features of each issue
- Getting started instructions
- Success metrics and next actions

**Read this for:** Quick overview of all issues and how to get started

**Size:** 3KB, detailed index with links

---

## Related GitHub Issues

**Parent Epic:**

- [PHASE-04.0 - Resolve Deprecated Dependencies (#11)](https://github.com/Rarsus/necromundabot/issues/11)

**Sub-Issues (7 total):**

| Issue | Title                         | Track         | Hours |
| ----- | ----------------------------- | ------------- | ----- |
| #13   | ESLint 8.x → 9.x              | Critical      | 4-6   |
| #14   | glob/rimraf updates           | Critical      | 8-10  |
| #16   | inflight → lru-cache          | Critical      | 4-6   |
| #12   | @humanwhocodes migration      | Ecosystem     | 4-6   |
| #15   | Transitive deps investigation | Investigation | 6-10  |
| #18   | Testing & Validation          | QA            | 4-8   |
| #17   | Documentation & Release       | Release       | 2-4   |

**Completion Report:**

- [PHASE-04.0 Completion Report (#19)](https://github.com/Rarsus/necromundabot/issues/19)

---

## Key Metrics

- **Total Issues:** 8 (1 epic + 7 sub-issues)
- **Total Effort:** 40-60 hours
- **Timeline:** 3 weeks
- **Parallel Tracks:** 3 (critical path + 2 parallel)
- **Team Size:** 1-2 developers
- **Content Created:** 10,000+ words
- **Test Items:** 50+
- **Code Examples:** 20+

---

## Implementation Timeline

### Week 1: Critical Upgrades (Days 1-5)

- ESLint 9.x upgrade
- glob 7.x → 9.x & rimraf 3.x → 4.x
- inflight → lru-cache
- Effort: 20-28 hours

### Week 2: Ecosystem & Testing (Days 1-5)

- @humanwhocodes → @eslint migration (parallel)
- Transitive dependency investigation (parallel)
- Comprehensive testing (after Track 1 complete)
- Effort: 14-20 hours

### Week 3: Release (Days 1-2)

- Documentation & changelog
- GitHub release creation
- Team communication
- Effort: 2-4 hours

---

## Success Criteria

**PHASE-04.0 is complete when:**

1. ✅ All 9 deprecated package warnings resolved
2. ✅ All 7 sub-issues completed
3. ✅ All 131 tests passing
4. ✅ Docker build and bot functional
5. ✅ All GitHub Actions workflows passing
6. ✅ Zero regressions
7. ✅ v0.4.0 released with documentation

---

## Getting Started

**For Quick Reference:**
→ See [PHASE-04.0-GITHUB-ISSUES-SUMMARY.md](./PHASE-04.0-GITHUB-ISSUES-SUMMARY.md)

**For Detailed Planning:**
→ See Parent Epic #11 on GitHub

**For Execution:**

1. Assign issues from Track 1 (start with #13, #14, #16)
2. Create GitHub milestone "PHASE-04.0"
3. Link all 7 sub-issues to milestone
4. Begin Week 1 implementation

---

## Navigation

**Previous Phase:** [PHASE-03.3](../PHASE-03.3/PHASE-03.3-INDEX.md)  
**All Phases:** [Project Docs Index](../INDEX.md)  
**Next Phase:** TBD

---

**Created:** January 29, 2026  
**Status:** ✅ PLANNING COMPLETE  
**Ready for Execution:** ✅ YES
