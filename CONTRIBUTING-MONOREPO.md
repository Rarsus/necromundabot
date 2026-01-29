# Contributing to NecromundaBot Monorepo

> Guidelines for developing and contributing to the NecromundaBot monorepo

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Quality Standards](#code-quality-standards)
- [Workspace-Specific Guidelines](#workspace-specific-guidelines)

---

## Getting Started

### 1. Read the Essential Documents

- [MONOREPO.md](./docs/guides/MONOREPO.md) - Complete monorepo guide
- [MONOREPO-FAQ.md](./MONOREPO-FAQ.md) - Frequently asked questions
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
- [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md) - Quality requirements

### 2. Understand the Structure

The monorepo contains 4 npm workspaces:

```
necromundabot/
├── repos/necrobot-utils       (v0.2.4) - Shared services & utilities
├── repos/necrobot-core        (v0.3.4) - Core bot functionality
├── repos/necrobot-commands    (v0.3.0) - Discord commands
└── repos/necrobot-dashboard   (v0.2.3) - Web UI
```

Each workspace is independently versioned and can be developed in isolation.

### 3. Know the Dependency Graph

```
necrobot-commands
  ├─ depends on: necrobot-core
  └─ depends on: necrobot-utils

necrobot-core
  └─ depends on: necrobot-utils

necrobot-dashboard
  └─ depends on: necrobot-utils

necrobot-utils
  └─ depends on: (nothing)
```

---

## Development Setup

### First Time

```bash
# 1. Clone repository
git clone https://github.com/Rarsus/necromundabot.git
cd necromundabot

# 2. Verify Node.js version
npm run validate:node

# 3. Install dependencies (all workspaces)
npm ci --workspaces

# 4. Verify installation
npm run workspaces:validate
npm run workspaces:status

# 5. Run tests
npm test

# 6. Create feature branch
git checkout -b feature/my-feature
```

### Daily Development

```bash
# Pull latest
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Run tests
npm test

# Make changes, test frequently
npm test --workspace=repos/necrobot-core

# Format and lint
npm run lint:fix
npm run format

# Commit
git add repos/necrobot-core/src/
git commit -m "feat(core): Add new functionality"

# Push
git push origin feature/my-feature

# Create Pull Request on GitHub
```

---

## Making Changes

### 1. Choose a Workspace

Determine which workspace needs changes:

| Change Type                          | Workspace            |
| ------------------------------------ | -------------------- |
| Database, response helpers, services | `necrobot-utils`     |
| Command loading, event handling      | `necrobot-core`      |
| Discord commands, command features   | `necrobot-commands`  |
| Web dashboard, UI components         | `necrobot-dashboard` |

### 2. Work Within One Workspace

Make all related changes in one workspace before committing:

```bash
# Edit files in repos/necrobot-utils/
vim repos/necrobot-utils/src/services/DatabaseService.js
vim repos/necrobot-utils/tests/unit/test-database.test.js

# Test changes
npm test --workspace=repos/necrobot-utils

# If tests pass, check other workspaces that depend on this one
npm test --workspace=repos/necrobot-core
```

### 3. Test Cross-Workspace Changes

If your change affects multiple packages:

```bash
# Test all packages
npm test

# Run linting
npm run lint

# Check formatting
npm run format:check
```

### 4. Verify the Entire Monorepo

```bash
# Full validation
npm run workspaces:validate

# View workspace status
npm run workspaces:status

# Double-check all tests
npm test
```

---

## Submitting Changes

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<workspace>): <description>

<body (optional)>

<footer (optional)>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Test changes
- `chore` - Build, dependencies, etc
- `refactor` - Code restructuring

**Workspace Examples:**

- `feat(utils): Add new database helper`
- `fix(commands): Handle empty input`
- `docs(monorepo): Update README`
- `test(core): Add CommandLoader tests`

### Pull Request Checklist

Before submitting:

- [ ] All tests pass: `npm test`
- [ ] Code is linted: `npm run lint` (no errors)
- [ ] Code is formatted: `npm run format`
- [ ] Monorepo is valid: `npm run workspaces:validate`
- [ ] Changes are committed with clear message
- [ ] Branch is based on latest `main`: `git pull origin main`
- [ ] No merge conflicts
- [ ] PR title follows conventional commits
- [ ] PR description explains the change

### Creating a Pull Request

1. Push your branch: `git push origin feature/my-feature`
2. Go to https://github.com/Rarsus/necromundabot
3. Click "New Pull Request"
4. Select your branch
5. Fill in title and description
6. Submit!

### What Happens Next

1. **Automated Checks**
   - GitHub Actions runs linting
   - GitHub Actions runs tests
   - GitHub Actions runs security scanning

2. **Code Review**
   - Maintainers review your code
   - May request changes

3. **Merge**
   - Once approved, maintainers merge your PR
   - Automatic deployment (if on main)

---

## Code Quality Standards

### Testing (TDD)

All code must have tests. Follow Test-Driven Development:

1. **Write failing tests first** (RED)
2. **Implement code** (GREEN)
3. **Refactor** (REFACTOR)

**Coverage Requirements:**

| Module        | Lines | Functions | Branches |
| ------------- | ----- | --------- | -------- |
| Core Services | 85%+  | 90%+      | 80%+     |
| Commands      | 80%+  | 85%+      | 75%+     |
| Utils         | 90%+  | 95%+      | 85%+     |

**Run coverage:**

```bash
npm run test:coverage --workspace=repos/necrobot-utils
```

### Linting

Code must pass ESLint checks:

```bash
# Check
npm run lint

# Auto-fix
npm run lint:fix
```

### Formatting

Code must be formatted with Prettier:

```bash
# Check
npm run format:check

# Auto-format
npm run format
```

### Pre-Commit Checks

Husky pre-commit hooks automatically:

- Run ESLint
- Run Prettier
- Prevent commits with errors

### Documentation

All public APIs must have JSDoc comments:

```javascript
/**
 * Validates user input
 * @param {string} input - The input to validate
 * @returns {boolean} True if valid, false otherwise
 * @throws {Error} If input is null/undefined
 */
function validateInput(input) {
  // ...
}
```

---

## Workspace-Specific Guidelines

### Working on necrobot-utils

**Purpose:** Shared services and utilities

**Key Files:**

- `src/services/DatabaseService.js`
- `src/utils/response-helpers.js`
- `src/middleware/error-handler.js`

**Testing:**

- Tests in `tests/unit/`
- Integration tests in `tests/integration/`
- Use in-memory SQLite for database tests

**Checklist:**

- [ ] All utilities are exported from `src/index.js`
- [ ] No Discord.js dependencies
- [ ] Can be used independently
- [ ] Fully documented
- [ ] Tests pass locally

### Working on necrobot-core

**Purpose:** Core bot functionality and command loading

**Key Files:**

- `src/core/CommandLoader.js`
- `src/core/CommandRegistrationHandler.js`
- `src/core/InteractionHandler.js`

**Testing:**

- Tests in `tests/unit/`
- Integration tests with commands
- Mock Discord interactions

**Checklist:**

- [ ] CommandLoader validates all 4 required properties
- [ ] Event handlers properly typed
- [ ] Integration tests with necrobot-commands
- [ ] Backward compatible with existing commands
- [ ] Tests pass locally

### Working on necrobot-commands

**Purpose:** Discord bot commands

**Key Files:**

- `src/commands/` organized by category
- Each command is a separate file
- One command per file

**Command Structure (Required):**

```javascript
module.exports = {
  name: 'mycommand',          // string - unique identifier
  description: 'Description', // string - user-facing
  data: new SlashCommandBuilder()..., // SlashCommandBuilder object
  async executeInteraction(interaction) {
    // Handler function
  }
};
```

**Testing:**

- Test file per command
- Test all 4 required properties
- Mock Discord interactions
- Test error scenarios

**Checklist:**

- [ ] Command has all 4 required properties
- [ ] Command name matches file name
- [ ] Tests verify all properties
- [ ] Error handling implemented
- [ ] Tests pass locally

### Working on necrobot-dashboard

**Purpose:** Web UI and dashboard

**Key Files:**

- `src/components/` - React components
- `pages/` - Next.js pages
- `styles/` - CSS modules

**Guidelines:**

- Functional components with Hooks
- Props well-documented
- Reusable and accessible
- Follow React best practices

**Checklist:**

- [ ] Components are functional
- [ ] Props are documented
- [ ] Accessible (ARIA labels, etc)
- [ ] Follows React patterns
- [ ] No TypeScript errors

---

## Common Workflows

### Adding a New Command

1. Create test file: `repos/necrobot-commands/tests/unit/test-mycommand.test.js`
2. Write tests that fail (RED)
3. Create command file: `repos/necrobot-commands/src/commands/[category]/mycommand.js`
4. Implement to make tests pass (GREEN)
5. Run full test suite: `npm test`
6. Commit: `git commit -m "feat(commands): Add mycommand"`

See [01-creating-new-command.md](/.github/copilot-scenarios/01-creating-new-command.md) for detailed guide.

### Fixing a Bug

1. Write test that reproduces bug (RED)
2. Fix the code (GREEN)
3. Run tests: `npm test`
4. Commit: `git commit -m "fix(scope): Fix bug description"`

See [02-fixing-bugs.md](/.github/copilot-scenarios/02-fixing-bugs.md) for detailed guide.

### Working with Database

1. Write tests first (RED)
2. Implement database logic (GREEN)
3. Test with other packages
4. Run full suite: `npm test`

See [03-database-operations.md](/.github/copilot-scenarios/03-database-operations.md) for detailed guide.

### Cross-Package Changes

1. Identify all affected packages
2. Write tests in all affected packages
3. Implement changes
4. Run: `npm test` (all packages)
5. Verify imports and exports
6. Commit with clear message

See [08-cross-module-changes.md](/.github/copilot-scenarios/08-cross-module-changes.md) for detailed guide.

---

## Getting Help

### Documentation

- [MONOREPO.md](./docs/guides/MONOREPO.md) - Full guide
- [MONOREPO-FAQ.md](./MONOREPO-FAQ.md) - Common questions
- [Copilot Instructions](./.github/copilot-instructions.md) - Detailed patterns

### Files to Review

- [Definition of Done](./DEFINITION-OF-DONE.md) - Quality standards
- [Code of Conduct](./CODE_OF_CONDUCT.md) - Community rules
- [Testing Patterns](./.github/copilot-patterns/TESTING-PATTERNS.md) - Testing guide

### Issues & Questions

- [GitHub Issues](https://github.com/Rarsus/necromundabot/issues) - Report bugs
- [GitHub Discussions](https://github.com/Rarsus/necromundabot/discussions) - Ask questions

---

**Welcome to the NecromundaBot community!** 🎉

We appreciate your contributions and look forward to working with you.

**Last Updated:** January 29, 2026
