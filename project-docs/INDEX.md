# Project Documentation Index

**Current Status:** Phase 03.3 ✅ COMPLETE  
**Latest Version:** 1.5.0  
**Last Updated:** January 31, 2026

This directory contains all project-level documentation including phase deliverables, infrastructure fixes, planning documents, and system governance.

---

## ⚡ Quick Links

- **[Phase 03.3 (Current)](./PHASE-03.3/)** - Latest phase with Docker dual-container builds
- **[Obsolete Documents Archive](./archive/)** - Historical documentation (moved for cleanup)
- **[Infrastructure Fixes](./infrastructure/)** - GitHub Actions, Docker, Git submodules
- **[Testing & Coverage](./testing/)** - Test strategies and coverage analysis

---

## Directory Organization

Project documentation is organized into four main categories for better navigation:

### [Infrastructure](./infrastructure/)

GitHub Actions workflows, deployment, Docker, and system configuration management.

**Key Documents:**

- [GIT-SUBMODULE-CHECKOUT-FIX.md](./infrastructure/GIT-SUBMODULE-CHECKOUT-FIX.md) - Git submodule URL configuration
- [GITHUB-ACTIONS-PUBLISHING-ASSESSMENT.md](./infrastructure/GITHUB-ACTIONS-PUBLISHING-ASSESSMENT.md) - Publishing workflow assessment
- [DOCKER-FIXES-SUMMARY.md](./infrastructure/DOCKER-FIXES-SUMMARY.md) - Docker build improvements
- [SECURITY-WORKFLOW-FIX-SUMMARY.md](./infrastructure/SECURITY-WORKFLOW-FIX-SUMMARY.md) - Security scanning fixes
- [WORKFLOW-SUBMODULES-FIX.md](./infrastructure/WORKFLOW-SUBMODULES-FIX.md) - GitHub Actions fixes
- [VULNERABILITY-ACCEPTANCE-AUTOMATION-COMPLETE.md](./infrastructure/VULNERABILITY-ACCEPTANCE-AUTOMATION-COMPLETE.md) - Vulnerability management

### [Testing & Code Coverage](./testing/)

Code coverage analysis, test enhancements, and testing strategies.

**Key Documents:**

- Coverage improvements and analysis reports
- Test execution logs and results
- Code quality metrics and trends

### [Planning & Governance](./planning/)

Phase planning, milestones, action items, and team communication.

**Key Documents:**

- [PHASE-03-ACTION-ITEMS-SUMMARY.md](./planning/PHASE-03-ACTION-ITEMS-SUMMARY.md) - Current action items
- [PHASE-03-DOCUMENTATION-INDEX.md](./planning/PHASE-03-DOCUMENTATION-INDEX.md) - Phase documentation index
- [START-PHASE-03-NOW.md](./planning/START-PHASE-03-NOW.md) - Phase initiation guide
- [MONOREPO-MIGRATION-PLAN-A.md](./planning/MONOREPO-MIGRATION-PLAN-A.md) - Monorepo migration plan
- [TEAM-ANNOUNCEMENT-PHASE-03.2.md](./planning/TEAM-ANNOUNCEMENT-PHASE-03.2.md) - Team announcements
- [SYNC-STATUS-REPORT.md](./planning/SYNC-STATUS-REPORT.md) - Synchronization status

### [Governance](./governance/)

Project governance, configuration, and setup guides.

**Key Documents:**

- Project-level policies and procedures
- Configuration templates and guides
- Setup documentation

---

## 📋 Phase Documentation

### [Phase 03.3 - CURRENT ✅](./PHASE-03.3/)

**Status:** Complete | **Focus:** Docker Dual-Container Builds & Dashboard Integration

Latest phase with full implementation of dual-container strategy (bot + dashboard parallel builds):

- Dual-container build implementation
- Dashboard React/Next.js integration
- Workflow optimization (70% size reduction: 942MB → 277MB)
- Test results and verification
- Complete implementation guide

**Key Achievements:**

- ✅ Bot container: ghcr.io/Rarsus/necromundabot:v1.5.0
- ✅ Dashboard container: ghcr.io/Rarsus/necromundabot-dashboard:v1.5.0
- ✅ Parallel builds reduce CI time
- ✅ 145/145 tests passing (85%+ coverage)
- ✅ All workflows operational

### [Phase 03.2](./PHASE-03.2/)

**Status:** Complete | **Focus:** GitHub Actions Publishing Pipeline

GitHub Actions publishing pipeline and vulnerability fixes:

- Completion reports
- Progress summaries
- Task completion details

### [Phase 03.1](./PHASE-03.1/)

**Status:** Complete | **Focus:** Discord.js v15 Preparation

Discord.js v15 migration preparation and publishing pipeline setup:

- [PHASE-03.1-INDEX.md](./PHASE-03.1/PHASE-03.1-INDEX.md) - Phase overview
- Breaking change analysis
- Migration strategies
- Test planning

### [Phase 03.0](./PHASE-03.0/)

**Status:** Complete | **Focus:** GitHub Actions Workflow Robustness

GitHub Actions workflow robustness and pre-commit hook automation:

- [PHASE-03.0-GITHUB-ACTIONS-WORKFLOW-ROBUSTNESS.md](./PHASE-03.0/PHASE-03.0-GITHUB-ACTIONS-WORKFLOW-ROBUSTNESS.md)

### [Phase 02.0 & Earlier](./PHASE-02.0/)

Previous phase documentation - see PHASE-02.0 and PHASE-01.0 folders

---

## Setup & Configuration

See [configuration/](./configuration/) for setup guides.

## Governance

See [governance/](./governance/) for governance documents.

## Setup Instructions

See [setup/](./setup/) for initial setup guides.

---

## 🗂️ Archive

**[Archive Folder](./archive/)** contains historical and completed project documents:

- Docker separation implementation docs (completed in Phase 03.3)
- Monorepo migration docs (completed, now workspaces-based)
- Dependabot workflow documents (historical)
- Configuration reorganization docs (completed)
- Previous phase indexes and startup docs
- Copilot instructions analysis (historical)

These documents are preserved in git history for reference but are no longer active project documentation.
