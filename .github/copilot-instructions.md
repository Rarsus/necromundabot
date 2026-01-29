# Copilot Instructions for NecromundaBot

> Quick start for AI agents. Last Updated: January 29, 2026
> For detailed scenarios and patterns, see subdirectories below.
> **Infrastructure Status:** GitHub Actions publishing pipeline ✅ operational with git submodule support

## 🚨 Four Critical Enforced Requirements

1. **Documentation Storage & Naming** → See [patterns/DOCUMENTATION.md](copilot-patterns/DOCUMENTATION.md)
2. **Test-Driven Development (TDD)** → See [patterns/TDD-WORKFLOW.md](copilot-patterns/TDD-WORKFLOW.md)
3. **Command Structure Validation** → See [patterns/COMMAND-STRUCTURE.md](copilot-patterns/COMMAND-STRUCTURE.md)
4. **Workspace Aware Imports** → See [patterns/SERVICE-LAYER.md](copilot-patterns/SERVICE-LAYER.md)

**These are NON-NEGOTIABLE. Violations result in PR rejection.**

---

## Quick Start by Scenario

Pick your task:

- **Adding a new command?** → [scenarios/01-creating-new-command.md](copilot-scenarios/01-creating-new-command.md)
- **Fixing a bug?** → [scenarios/02-fixing-bugs.md](copilot-scenarios/02-fixing-bugs.md)
- **Working with database?** → [scenarios/03-database-operations.md](copilot-scenarios/03-database-operations.md)
- **Creating documentation?** → [scenarios/04-adding-documentation.md](copilot-scenarios/04-adding-documentation.md)
- **Updating dependencies?** → [scenarios/05-updating-dependencies.md](copilot-scenarios/05-updating-dependencies.md)
- **Refactoring code?** → [scenarios/06-refactoring-code.md](copilot-scenarios/06-refactoring-code.md)
- **Docker/infrastructure changes?** → [scenarios/07-docker-changes.md](copilot-scenarios/07-docker-changes.md)
- **Cross-module changes?** → [scenarios/08-cross-module-changes.md](copilot-scenarios/08-cross-module-changes.md)

**→ Full scenario index:** [scenarios/\_INDEX.md](copilot-scenarios/_INDEX.md)

---

## Architecture Overview

**Monorepo with 4 npm workspaces:**

```
repos/
├── necrobot-core          # Discord.js client, events, command loading
├── necrobot-utils         # Shared services (DatabaseService), middleware, helpers
├── necrobot-commands      # All Discord commands by category (misc, battle, campaign, gang, social)
└── necrobot-dashboard     # React/Next.js web UI (minimal, not active)
```

**Key facts:**

- Each submodule has own package.json, tests/, src/
- Independent git history (.git/ directory in each)
- Versioned together (v0.3.0, v0.2.2, etc.)
- Strong coupling: commands → core → utils

---

## Key Development Workflows

```bash
# Run tests in all workspaces
npm test

# Run tests for one workspace
npm test --workspace=repos/necrobot-core

# Lint all code
npm run lint

# Local development (bot + database)
docker-compose up --build -d
docker logs necromundabot -f
```

---

## Reusable Patterns (Reference)

All scenarios enforce these patterns - referenced from:

| Pattern               | File                                                                   | Use When                               |
| --------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| **TDD Workflow**      | [patterns/TDD-WORKFLOW.md](copilot-patterns/TDD-WORKFLOW.md)           | Writing any code (tests first, always) |
| **Command Structure** | [patterns/COMMAND-STRUCTURE.md](copilot-patterns/COMMAND-STRUCTURE.md) | Creating/validating Discord commands   |
| **Service Layer**     | [patterns/SERVICE-LAYER.md](copilot-patterns/SERVICE-LAYER.md)         | Working with dependencies & imports    |
| **Error Handling**    | [patterns/ERROR-HANDLING.md](copilot-patterns/ERROR-HANDLING.md)       | Catching/throwing errors safely        |
| **Testing Patterns**  | [patterns/TESTING-PATTERNS.md](copilot-patterns/TESTING-PATTERNS.md)   | Writing unit/integration tests         |
| **Documentation**     | [patterns/DOCUMENTATION.md](copilot-patterns/DOCUMENTATION.md)         | Creating any docs (naming rules!)      |

---

## Current Status (Jan 29, 2026)

| Package            | Version | Status      | Branch |
| ------------------ | ------- | ----------- | ------ |
| necrobot-core      | 0.3.2   | ✅ Released | v0.3.2 |
| necrobot-utils     | 0.2.4   | ✅ Released | v0.2.4 |
| necrobot-dashboard | 0.2.2   | ✅ Released | v0.2.2 |
| necrobot-commands  | 0.2.2   | ✅ Released | v0.2.2 |

**Runtime:** Node.js 20-22 | Discord.js v14.11.0 | SQLite3 v5.1.7

**GitHub Actions Status:**

- ✅ Security workflow: npm workspace support fixed
- ✅ Publishing workflow: Sequential job dependencies enforced (utils → core → commands → dashboard)
- ✅ Git submodules: Absolute GitHub URLs deployed in `.gitmodules`
- ✅ Test suite: `test:quick` script available for CI/CD

---

## Infrastructure & Deployment Docs

**GitHub Actions Publishing Pipeline (Phase 03.1.2):**

- [SUBMODULE-FIX-DEPLOYMENT-STATUS.md](../project-docs/SUBMODULE-FIX-DEPLOYMENT-STATUS.md) - Git submodule URL fix & deployment status
- [PHASE-03.1-INDEX.md](../project-docs/PHASE-03.1/PHASE-03.1-INDEX.md) - Phase 03.1 completion overview
- [PHASE-03.0-GITHUB-ACTIONS-WORKFLOW-ROBUSTNESS.md](../project-docs/PHASE-03.0/PHASE-03.0-GITHUB-ACTIONS-WORKFLOW-ROBUSTNESS.md) - GitHub Actions workflow analysis
- [GIT-SUBMODULE-CHECKOUT-FIX.md](../project-docs/GIT-SUBMODULE-CHECKOUT-FIX.md) - Technical details of submodule URL resolution
- [PUBLISHING-WORKFLOW-ORDER.md](../project-docs/PUBLISHING-WORKFLOW-ORDER.md) - Publishing job order enforcement

---

## Need Help?

- **Can't find your scenario?** → Check [scenarios/\_INDEX.md](copilot-scenarios/_INDEX.md)
- **Want to understand a pattern?** → See `copilot-patterns/`
- **Need architecture details?** → See [../docs/architecture/](../docs/architecture/)
- **Looking for code examples?** → See existing commands: `repos/necrobot-commands/src/commands/misc/`
- **GitHub Actions issues?** → Check [SUBMODULE-FIX-DEPLOYMENT-STATUS.md](../project-docs/SUBMODULE-FIX-DEPLOYMENT-STATUS.md)
