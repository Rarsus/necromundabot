# How AI Agents Use Copilot Instructions

This document explains how to ensure AI agents (GitHub Copilot, Cursor, etc.) always reference and follow the copilot instructions when working on NecromundaBot.

## 🎯 Quick Start for AI Agents

When you start working on ANY issue or task:

1. **Read the primary instruction file:**
   ```
   .github/copilot-instructions.md
   ```
   This router document will direct you to patterns and scenarios.

2. **Find your scenario** from the index:
   - [Copilot Scenarios Index](copilot-scenarios/_INDEX.md)
   - Choose by task type (creating commands, fixing bugs, etc.)
   - Or by affected module (necrobot-commands, necrobot-utils, etc.)

3. **Read the relevant scenario file:**
   Each scenario includes step-by-step workflow with examples.

4. **Reference critical patterns:**
   All scenarios enforce these patterns - see `copilot-patterns/`:
   - [TDD-WORKFLOW.md](copilot-patterns/TDD-WORKFLOW.md) - Write tests first
   - [COMMAND-STRUCTURE.md](copilot-patterns/COMMAND-STRUCTURE.md) - 4 required properties
   - [SERVICE-LAYER.md](copilot-patterns/SERVICE-LAYER.md) - Dependency management
   - [DOCUMENTATION.md](copilot-patterns/DOCUMENTATION.md) - Doc naming rules
   - [ERROR-HANDLING.md](copilot-patterns/ERROR-HANDLING.md) - Error patterns
   - [TESTING-PATTERNS.md](copilot-patterns/TESTING-PATTERNS.md) - Test strategies

## 📋 GitHub Integration Points

### 1. Issue Templates (Automatic Reminder)
When someone creates an issue, the template automatically:
- ✅ Links to [copilot-instructions.md](.github/copilot-instructions.md)
- ✅ Links to relevant scenario
- ✅ Lists key patterns to follow
- ✅ Provides file references for AI agents

**Files:**
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

### 2. Pull Request Template (Pre-Submission Reminder)
When someone creates a PR, the template checks:
- [ ] Followed relevant scenario
- [ ] All tests passing
- [ ] Linting passed
- [ ] TDD workflow used
- [ ] Checkboxes for different feature types

**File:** `.github/pull_request_template.md`

### 3. README.md Reference
The project README should link to the copilot instructions as the first step for developers.

### 4. CONTRIBUTING.md Reference
The contribution guide should emphasize the copilot instructions workflow.

### 5. GitHub Copilot Settings
VS Code and Cursor should be configured to use MCP servers for context.

**File:** `.mcp/servers.json` (already set up)

## 🤖 For GitHub Copilot in VS Code

### Setup Required

1. **Install GitHub Copilot Extension**
   - VS Code: Install `GitHub Copilot` extension
   - Cursor: Already built-in

2. **VS Code Settings** (`.vscode/settings.json`)
   ```json
   {
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "github.copilot.enable": {
       "*": true,
       "plaintext": false,
       "markdown": false
     }
   }
   ```

3. **MCP Configuration**
   - Automatic: VS Code reads `.mcp/servers.json`
   - Copilot can access filesystem, git, shell, database, npm servers

### How AI Agents Access Instructions

When Copilot or Cursor is asked to work on an issue:

1. **User Context:** "Fix the quote search bug" or "Create a new command"
2. **MCP Access:** Copilot can read:
   - `.github/copilot-instructions.md` (entry point)
   - `copilot-patterns/` (reusable guidance)
   - `copilot-scenarios/` (task-specific workflows)
   - Actual source code for examples
   - Git history for patterns

3. **Intelligent Routing:** Copilot reads the instructions and routes to:
   - Correct scenario (creating command? → scenario 01)
   - Relevant patterns (TDD? → TDD-WORKFLOW.md)
   - Actual examples from codebase

## 🔗 Making Instructions Discoverable

### For Manual Code Review
When you see AI agent output, check:
1. Did it follow the scenario from `copilot-scenarios/`?
2. Did it write tests first (TDD)?
3. Did it follow command structure (4 properties)?
4. Did it handle guild context correctly?

**If not → Link the agent to the relevant scenario**

### For GitHub Actions (Future)
Could implement:
- Comment on issues with link to copilot-instructions.md
- Comment on PRs if TDD pattern not followed
- Comment if tests aren't passing

## 📝 Best Practices for Asking AI Agents to Work

### Good: Provides Context
```
"Implement the quote search feature per the copilot instructions.
Start with scenario 03-database-operations.md for service layer development.
Must follow TDD workflow."
```

### Better: References Specific Files
```
"Implement quote search following:
- Scenario: .github/copilot-scenarios/03-database-operations.md
- Pattern: .github/copilot-patterns/TDD-WORKFLOW.md
- Pattern: .github/copilot-patterns/SERVICE-LAYER.md
Tests must pass (npm test) and cover error cases."
```

### Best: Uses Issue Description
The issue/PR template already includes this - just ensure the AI agent reads the issue description!

## ✅ Verification Checklist

Before assigning work to an AI agent:

- [ ] Issue/PR template is up to date
- [ ] Links to copilot-instructions.md are correct
- [ ] Links to copilot-scenarios/ are correct
- [ ] Links to copilot-patterns/ are correct
- [ ] MCP servers are configured (.mcp/servers.json)
- [ ] Example scenarios match actual project structure
- [ ] AI agent can access GitHub workspace (Copilot integration active)

## 📚 File Structure Reference

```
.github/
├── copilot-instructions.md           # Entry point (lean router)
├── COPILOT-WORKFLOW.md               # This file
├── copilot-patterns/                 # Reusable patterns
│   ├── DOCUMENTATION.md
│   ├── TDD-WORKFLOW.md
│   ├── COMMAND-STRUCTURE.md
│   ├── SERVICE-LAYER.md
│   ├── ERROR-HANDLING.md
│   └── TESTING-PATTERNS.md
├── copilot-scenarios/                # Task-specific scenarios
│   ├── _INDEX.md
│   ├── 01-creating-new-command.md
│   ├── 02-fixing-bugs.md
│   ├── 03-database-operations.md
│   ├── 04-adding-documentation.md
│   ├── 05-updating-dependencies.md
│   ├── 06-refactoring-code.md
│   ├── 07-docker-changes.md
│   └── 08-cross-module-changes.md
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
└── pull_request_template.md
```

## 🎯 Expected Flow

1. **Issue Created** → Template links to copilot-instructions.md
2. **AI Agent Assigned** → Agent reads the instructions
3. **Agent Routes** → Agent finds relevant scenario
4. **Agent Develops** → Agent follows step-by-step workflow
5. **PR Created** → Template reminds about TDD, testing, linting
6. **Review** → Reviewer can verify against patterns/scenarios

---

For detailed guidance, see:
- **[copilot-instructions.md](.github/copilot-instructions.md)** - Start here
- **[copilot-scenarios/_INDEX.md](copilot-scenarios/_INDEX.md)** - Find your task
- **[copilot-patterns/](copilot-patterns/)** - Understand the patterns
