---
name: Feature Request
about: Suggest a new feature for NecromundaBot
title: "[FEATURE] "
labels: enhancement
---

## 🚨 Important: Read First

**Before working on this feature, review the [Copilot Instructions](.github/copilot-instructions.md):**
- Pattern: [TDD Workflow](../copilot-patterns/TDD-WORKFLOW.md) - Tests before code, always
- Scenario: [Creating New Commands](../copilot-scenarios/01-creating-new-command.md) - For new Discord commands
- Scenario: [Database Operations](../copilot-scenarios/03-database-operations.md) - For service layer features
- Scenario: [Cross-Module Changes](../copilot-scenarios/08-cross-module-changes.md) - For multi-module features

---

## 💡 Feature Description

**What problem does this solve?**
A clear description of the problem or use case.

**Proposed solution:**
Your idea for how to implement this feature.

**Alternatives considered:**
Other approaches you've thought about.

## 📋 Acceptance Criteria

- [ ] Feature works as described
- [ ] All tests passing
- [ ] No ESLint errors
- [ ] Documentation updated
- [ ] Works in Discord (if applicable)

## 🤖 For AI Agents (Copilot)

### Development Workflow

Choose your scenario based on feature type:

#### For Discord Commands
1. Read: [Creating New Commands](../copilot-scenarios/01-creating-new-command.md)
2. Write tests first (RED phase)
3. Implement command (GREEN phase)
4. Test in Discord

#### For Database/Service Features
1. Read: [Database Operations](../copilot-scenarios/03-database-operations.md)
2. Write tests first for service layer
3. Implement service methods
4. Test with commands

#### For Cross-Module Features
1. Read: [Cross-Module Changes](../copilot-scenarios/08-cross-module-changes.md)
2. Write tests in all affected modules
3. Implement changes incrementally
4. Test all modules together

### Key Patterns to Follow
- **TDD:** Write tests before implementation
- **Command Structure:** 4 required properties (name, description, data, executeInteraction)
- **Service Layer:** Use workspace `"*"` versions for dependencies
- **Testing:** Minimum 80% coverage required
- **Documentation:** See [Documentation Pattern](../copilot-patterns/DOCUMENTATION.md)

### Files You'll Need
- Workspace: Check [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Patterns: See `copilot-patterns/` directory
- Scenarios: See `copilot-scenarios/` directory
- Examples: Check `repos/necrobot-commands/src/commands/` for command examples
