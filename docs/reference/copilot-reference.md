# NecromundaBot - Copilot Instructions

> This file is automatically loaded by VS Code Copilot chat.
> Last Updated: January 28, 2026

---

## 🎯 Quick Access

You are working on **NecromundaBot**, a Discord bot for Necromunda games with 4 npm workspaces.

**For detailed instructions, see:**

- **Main Instructions:** [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- **Critical Patterns:** [.github/copilot-patterns/](./.github/copilot-patterns/)
- **Development Scenarios:** [.github/copilot-scenarios/](./.github/copilot-scenarios/)

---

## 🚨 FOUR CRITICAL ENFORCED REQUIREMENTS

### 1. **Documentation Storage & Naming**

- Root level (./): `{UPPERCASE}.md` (e.g., `CONTRIBUTING.md`, `DOCUMENT-NAMING-CONVENTION.md`)
- `/docs/`: `{lowercase-with-hyphens}.md` (e.g., `testing-guide.md`, `guild-aware-architecture.md`)
- `/project-docs/`: `PHASE-{#}.{letter?}-{TYPE}.md` (e.g., `PHASE-03.0-GITHUB-ACTIONS.md`)
- **See:** [.github/copilot-patterns/DOCUMENTATION.md](./.github/copilot-patterns/DOCUMENTATION.md)

### 2. **Test-Driven Development (TDD) - MANDATORY**

- **ALWAYS write tests BEFORE code** (RED phase)
- Test files live alongside implementation in `tests/` folder
- Minimum coverage: Services 85%+ lines, Commands 80%+, Utils 90%+
- **See:** [.github/copilot-patterns/TDD-WORKFLOW.md](./.github/copilot-patterns/TDD-WORKFLOW.md)

### 3. **Command Structure Validation - MANDATORY**

All commands MUST export exactly these 4 properties (CommandLoader validates):

```javascript
module.exports = {
  name: 'cmdname',                              // string
  description: 'Description here',              // string
  data: new SlashCommandBuilder()...,           // SlashCommandBuilder
  async executeInteraction(interaction) { ... } // async function
};
```

- **See:** [.github/copilot-patterns/COMMAND-STRUCTURE.md](./.github/copilot-patterns/COMMAND-STRUCTURE.md)

### 4. **Workspace Aware Imports - MANDATORY**

- Use workspace `"*"` versions for inter-module dependencies (NOT `file:../` paths)
- Example: `"dependencies": { "necrobot-utils": "*", "necrobot-core": "*" }`
- **See:** [.github/copilot-patterns/SERVICE-LAYER.md](./.github/copilot-patterns/SERVICE-LAYER.md)

---

## 📦 Monorepo Structure

```
repos/
├── necrobot-core          # Discord.js client, events, command loading
├── necrobot-utils         # Shared services (DatabaseService), middleware, helpers
├── necrobot-commands      # All Discord commands by category (misc, battle, campaign, gang, social)
└── necrobot-dashboard     # React/Next.js web UI (minimal, not active)
```

Each workspace:

- Has own `package.json`, `tests/`, `src/`
- Independent git history (`.git/` in each)
- Versioned together (v0.3.0, v0.2.2, etc.)

---

## 🎬 Pick Your Scenario

### Creating New Code

1. [Creating a New Command](./.github/copilot-scenarios/01-creating-new-command.md)
2. [Database Operations](./.github/copilot-scenarios/03-database-operations.md)
3. [Refactoring Code](./.github/copilot-scenarios/06-refactoring-code.md)

### Fixing & Maintaining

2. [Fixing Bugs](./.github/copilot-scenarios/02-fixing-bugs.md)
3. [Updating Dependencies](./.github/copilot-scenarios/05-updating-dependencies.md)

### Documentation

4. [Adding Documentation](./.github/copilot-scenarios/04-adding-documentation.md)

### Infrastructure

5. [Docker Changes](./.github/copilot-scenarios/07-docker-changes.md)
6. [Cross-Module Changes](./.github/copilot-scenarios/08-cross-module-changes.md)

**See all scenarios:** [.github/copilot-scenarios/\_INDEX.md](./.github/copilot-scenarios/_INDEX.md)

---

## 🧪 Testing & Development Commands

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

## 📋 Reusable Patterns

| Pattern               | File                                                                                             | Use When                               |
| --------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| **TDD Workflow**      | [.github/copilot-patterns/TDD-WORKFLOW.md](./.github/copilot-patterns/TDD-WORKFLOW.md)           | Writing ANY code (tests first, always) |
| **Command Structure** | [.github/copilot-patterns/COMMAND-STRUCTURE.md](./.github/copilot-patterns/COMMAND-STRUCTURE.md) | Creating/validating Discord commands   |
| **Service Layer**     | [.github/copilot-patterns/SERVICE-LAYER.md](./.github/copilot-patterns/SERVICE-LAYER.md)         | Working with dependencies & imports    |
| **Error Handling**    | [.github/copilot-patterns/ERROR-HANDLING.md](./.github/copilot-patterns/ERROR-HANDLING.md)       | Catching/throwing errors safely        |
| **Testing Patterns**  | [.github/copilot-patterns/TESTING-PATTERNS.md](./.github/copilot-patterns/TESTING-PATTERNS.md)   | Writing unit/integration tests         |
| **Documentation**     | [.github/copilot-patterns/DOCUMENTATION.md](./.github/copilot-patterns/DOCUMENTATION.md)         | Creating any docs (naming rules!)      |

---

## ✅ Current Status (Jan 28, 2026)

| Package            | Version | Status      |
| ------------------ | ------- | ----------- |
| necrobot-core      | 0.3.0   | ✅ Released |
| necrobot-utils     | 0.2.2   | ✅ Released |
| necrobot-dashboard | 0.1.3   | ✅ Released |
| necrobot-commands  | 0.1.0   | ✅ Released |

**Runtime:** Node.js 22+ | Discord.js v14.11.0 | SQLite3 v5.1.7

---

## 🚀 Get Started

1. **First time?** Read [.github/copilot-instructions.md](./.github/copilot-instructions.md)
2. **Need a scenario?** Pick from [.github/copilot-scenarios/](./.github/copilot-scenarios/)
3. **Need a pattern?** Check [.github/copilot-patterns/](./.github/copilot-patterns/)
4. **Questions?** See [.github/copilot-scenarios/\_INDEX.md](./.github/copilot-scenarios/_INDEX.md)
