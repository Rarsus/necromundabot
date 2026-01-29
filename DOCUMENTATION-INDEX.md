# Documentation Index - Root Level Governance

This page indexes all root-level governance and policy documentation for the NecromundaBot project.

---

## Root-Level Governance Documents

These are mandatory governance documents for the project:

### Project Overview

- **[README.md](./README.md)** - Project overview, quick start, and feature overview

### Contribution Guidelines

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community code of conduct
- **[DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md)** - Definition of Done criteria for tasks
- **[CONTRIBUTING-MONOREPO.md](./CONTRIBUTING-MONOREPO.md)** - Monorepo-specific contribution guidelines

### Documentation Standards

- **[DOCUMENT-NAMING-CONVENTION.md](./DOCUMENT-NAMING-CONVENTION.md)** - Naming conventions for all documentation files
- **[DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)** (this file) - Root-level governance documentation index

### License

- **[LICENSE](./LICENSE)** - Project license

---

## Documentation Hierarchy

The NecromundaBot project uses a three-tier documentation structure:

### 1. Root Level (Governance)

**Location:** `/`  
**Pattern:** `{UPPERCASE}_NAME.md`  
**Purpose:** Project governance, policies, and community guidelines  
**Examples:** CONTRIBUTING.md, CODE_OF_CONDUCT.md, DEFINITION-OF-DONE.md

See: [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)

### 2. User-Facing Guides & References

**Location:** `/docs/`  
**Pattern:** `{lowercase-with-hyphens}.md` in subdirectories  
**Purpose:** User guides, developer guides, architecture docs, testing docs  
**Subdirectories:**

- `docs/guides/` - Implementation guides, troubleshooting
- `docs/user-guides/` - How-to guides for developers
- `docs/architecture/` - System design documentation
- `docs/testing/` - Testing strategies and coverage analysis
- `docs/reference/` - API and reference documentation
- `docs/best-practices/` - Best practices for development

See: [docs/INDEX.md](./docs/INDEX.md)

### 3. Project Planning & Phases

**Location:** `/project-docs/`  
**Pattern:** `PHASE-{#}.{optional-letter}-{TYPE}.md` or by category subdirectory  
**Purpose:** Phase deliverables, infrastructure changes, planning documents  
**Subdirectories:**

- `project-docs/infrastructure/` - GitHub Actions, Docker, deployment
- `project-docs/testing/` - Coverage analysis and test reports
- `project-docs/planning/` - Action items, phase planning
- `project-docs/governance/` - Project governance documents
- `project-docs/PHASE-XX.Y/` - Phase-specific deliverables

See: [project-docs/INDEX.md](./project-docs/INDEX.md)

---

## Quick Links

### For Developers

- **Getting Started:** [CONTRIBUTING.md](./CONTRIBUTING.md) → [docs/user-guides/](./docs/user-guides/)
- **Project Architecture:** [docs/architecture/](./docs/architecture/)
- **Testing Guide:** [docs/testing/](./docs/testing/)
- **Monorepo Info:** [CONTRIBUTING-MONOREPO.md](./CONTRIBUTING-MONOREPO.md) → [docs/guides/MONOREPO.md](./docs/guides/MONOREPO.md)

### For Project Managers

- **Phase Status:** [project-docs/INDEX.md](./project-docs/INDEX.md)
- **Current Phase:** [project-docs/PHASE-03.3/](./project-docs/PHASE-03.3/)
- **Planning Docs:** [project-docs/planning/](./project-docs/planning/)

### For Infrastructure/DevOps

- **GitHub Actions:** [project-docs/infrastructure/](./project-docs/infrastructure/)
- **Docker Setup:** [docs/guides/DOCKER-TROUBLESHOOTING.md](./docs/guides/DOCKER-TROUBLESHOOTING.md)
- **Publishing:** [docs/guides/github-packages-publishing.md](./docs/guides/github-packages-publishing.md)

---

## Documentation Standards Compliance

All documentation in this project must comply with:

- **Naming:** [DOCUMENT-NAMING-CONVENTION.md](./DOCUMENT-NAMING-CONVENTION.md)
- **Storage:** Must be in correct folder per [.github/copilot-patterns/DOCUMENTATION.md](./.github/copilot-patterns/DOCUMENTATION.md)
- **Validation:** GitHub Actions workflow validates naming and structure

---

## Navigation

- **← Governance:** [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md), [CONTRIBUTING.md](./CONTRIBUTING.md)
- **→ Developer Docs:** [docs/INDEX.md](./docs/INDEX.md)
- **→ Project Planning:** [project-docs/INDEX.md](./project-docs/INDEX.md)

---

**Last Updated:** January 29, 2026  
**Status:** ✅ Documentation reorganized to comply with DOCUMENT-NAMING-CONVENTION.md
