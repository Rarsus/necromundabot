# Copilot Scenarios - Index

Quick reference for all development scenarios. Pick your scenario:

## By Task Type

### Adding New Code
1. [Creating a New Command](01-creating-new-command.md) - Add Discord slash command
2. [Database Operations](03-database-operations.md) - Create/update service layer code
3. [Refactoring Code](06-refactoring-code.md) - Improve existing code safely

### Fixing & Maintaining
2. [Fixing Bugs](02-fixing-bugs.md) - Reproduce and fix bugs with TDD
5. [Updating Dependencies](05-updating-dependencies.md) - Update packages safely

### Documentation
4. [Adding Documentation](04-adding-documentation.md) - Create/update docs (naming rules!)

### Infrastructure & Cross-Cutting
7. [Docker Changes](07-docker-changes.md) - Modify Dockerfile or docker-compose.yml
8. [Cross-Module Changes](08-cross-module-changes.md) - Changes affecting multiple workspaces

## By Module

### Working on necrobot-commands
- [Creating a New Command](01-creating-new-command.md) - New commands
- [Database Operations](03-database-operations.md) - Using DatabaseService in commands
- [Testing Commands](../copilot-patterns/TESTING-PATTERNS.md#testing-commands) - Command testing patterns

### Working on necrobot-core
- [Database Operations](03-database-operations.md) - Core services
- [Cross-Module Changes](08-cross-module-changes.md) - API changes affecting other modules
- [Docker Changes](07-docker-changes.md) - Bot startup, event handlers

### Working on necrobot-utils
- [Database Operations](03-database-operations.md) - Services layer development
- [Testing Patterns](../copilot-patterns/TESTING-PATTERNS.md) - Service testing

### Working on necrobot-dashboard
- [Adding Documentation](04-adding-documentation.md) - React component docs
- [Database Operations](03-database-operations.md) - Connecting to database layer

## Critical Enforced Patterns

All scenarios enforce these patterns - reference them for details:

| Pattern | File | When To Use |
|---------|------|------------|
| **Documentation** | [../copilot-patterns/DOCUMENTATION.md](../copilot-patterns/DOCUMENTATION.md) | Creating any docs (naming rules!) |
| **TDD Workflow** | [../copilot-patterns/TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) | Writing ANY code (tests first!) |
| **Command Structure** | [../copilot-patterns/COMMAND-STRUCTURE.md](../copilot-patterns/COMMAND-STRUCTURE.md) | Creating/validating commands |
| **Service Layer** | [../copilot-patterns/SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) | Working with dependencies & imports |
| **Error Handling** | [../copilot-patterns/ERROR-HANDLING.md](../copilot-patterns/ERROR-HANDLING.md) | Catching/throwing errors safely |
| **Testing Patterns** | [../copilot-patterns/TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) | Writing unit/integration tests |

## Quick Facts

- 📦 **4 npm workspaces:** core, utils, commands, dashboard
- 🧪 **TDD mandatory:** Tests before code, always
- 📁 **Docs rules:** Root = UPPERCASE, docs/ = lowercase-with-hyphens, project-docs/ = PHASE-X
- 🐳 **Docker:** Use `npm ci`, not `npm install`
- ✅ **Always start with:** TDD pattern, then your scenario
