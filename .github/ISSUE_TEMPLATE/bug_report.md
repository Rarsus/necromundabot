---
name: Bug Report
about: Report a bug in NecromundaBot
title: "[BUG] "
labels: bug
---

## 🚨 Important: Read First

**Before working on this issue, review the [Copilot Instructions](.github/copilot-instructions.md):**
- Pattern: [TDD Workflow](../copilot-patterns/TDD-WORKFLOW.md) - Write tests first, always
- Scenario: [Fixing Bugs](../copilot-scenarios/02-fixing-bugs.md) - Bug reproduction & TDD-based fix

---

## 📋 Bug Description

**Describe the bug:**
A clear and concise description of what the bug is.

**Expected behavior:**
What should happen instead?

**Actual behavior:**
What actually happened?

## 🔬 Reproduction Steps

Steps to reproduce the behavior:
1. Go to...
2. Do...
3. See error...

## 📸 Additional Context

- **Environment:** (e.g., Node 22, Docker, local dev)
- **Branch:** (e.g., main, feature-x)
- **Screenshots/Logs:** (if applicable)

## 🤖 For AI Agents (Copilot)

### Development Workflow
1. Read relevant scenario: [Fixing Bugs](../copilot-scenarios/02-fixing-bugs.md)
2. Write failing test first (RED phase) - See [TDD Workflow](../copilot-patterns/TDD-WORKFLOW.md)
3. Implement fix (GREEN phase)
4. Run all tests: `npm test`
5. Verify linting: `npm run lint`

### Key Patterns to Follow
- **TDD:** Write tests before fixing code
- **Testing:** All tests must pass before committing
- **Linting:** No ESLint errors allowed
- **Scope:** Focus on single issue, don't add features

### Files You'll Need
- Workspace: Check [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Patterns: See `copilot-patterns/` directory
- Scenarios: See `copilot-scenarios/` directory
