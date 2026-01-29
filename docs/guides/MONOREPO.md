# NecromundaBot Monorepo Guide

> Complete guide to working with the NecromundaBot npm monorepo architecture

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Workspace Packages](#workspace-packages)
- [Development Workflow](#development-workflow)
- [Installation & Setup](#installation--setup)
- [Running Commands](#running-commands)
- [Testing](#testing)
- [Workspace Management](#workspace-management)
- [Publishing](#publishing)
- [Troubleshooting](#troubleshooting)

---

## Overview

**NecromundaBot** is a **unified npm monorepo** containing 4 independent npm packages with shared development and deployment infrastructure.

### Architecture

```
necromundabot (root - v0.4.0)
├── npm workspaces orchestrator
├── Shared scripts and configuration
└── 4 independent packages:
    ├── repos/necrobot-utils (v0.2.4) - Shared services & utilities
    ├── repos/necrobot-core (v0.3.4) - Core bot functionality
    ├── repos/necrobot-commands (v0.3.0) - Discord commands
    └── repos/necrobot-dashboard (v0.2.3) - Web UI
```

### Key Benefits

✅ **Independent Versioning** - Each package versions separately  
✅ **Shared Dependencies** - Deduplication via npm workspaces  
✅ **Unified Publishing** - All packages publish together  
✅ **Single Test Suite** - Run tests across all packages  
✅ **Simplified CI/CD** - One workflow for entire monorepo

---

## Repository Structure

```
necromundabot/
├── repos/                              # Workspace packages
│   ├── necrobot-utils/                 # Shared utilities foundation
│   │   ├── src/
│   │   │   ├── services/              # Database, helpers, middleware
│   │   │   └── utils/
│   │   ├── tests/
│   │   └── package.json               # v0.2.4
│   │
│   ├── necrobot-core/                  # Core bot & command loader
│   │   ├── src/
│   │   │   ├── core/                  # CommandLoader, event handlers
│   │   │   ├── middleware/
│   │   │   └── services/
│   │   ├── tests/
│   │   └── package.json               # v0.3.4
│   │
│   ├── necrobot-commands/              # All Discord commands
│   │   ├── src/
│   │   │   └── commands/              # Organized by category
│   │   ├── tests/
│   │   └── package.json               # v0.3.0
│   │
│   └── necrobot-dashboard/             # React/Next.js dashboard
│       ├── src/
│       ├── pages/
│       └── package.json               # v0.2.3
│
├── scripts/                            # Workspace management scripts
│   ├── workspaces-status.js           # Show workspace health
│   ├── validate-workspaces.js         # Validate monorepo structure
│   └── validate-node-version.js       # Check Node.js version
│
├── .github/workflows/                  # GitHub Actions CI/CD
│   ├── testing.yml
│   ├── pr-checks.yml
│   ├── security.yml
│   ├── publish-packages.yml
│   └── ...
│
├── docs/                               # Documentation
│   ├── guides/
│   └── architecture/
│
├── package.json                        # Root workspace config
├── package-lock.json                   # Dependency lock file
├── jest.config.js                      # Jest test config
└── Dockerfile                          # Docker configuration
```

---

## Workspace Packages

### 1. necrobot-utils (Foundation)

**Purpose:** Shared utilities, services, and helpers

**Version:** 0.2.4  
**Status:** ✅ Foundation layer  
**Tests:** 2 files, 25 tests

**Exports:**

```javascript
const { DatabaseService } = require('necrobot-utils');
const { sendSuccess, sendError } = require('necrobot-utils');
const { errorHandler } = require('necrobot-utils');
```

**Location:** `repos/necrobot-utils/`

**Key Files:**

- `src/services/DatabaseService.js` - SQLite database wrapper
- `src/services/GuildAwareDatabaseService.js` - Guild-isolated database
- `src/utils/response-helpers.js` - Discord response formatting
- `src/middleware/error-handler.js` - Error handling middleware

---

### 2. necrobot-core (Core Engine)

**Purpose:** Core bot functionality, event handlers, command loading

**Version:** 0.3.4  
**Status:** ✅ Core functionality  
**Tests:** 5 files, 84 tests

**Depends on:**

- `necrobot-utils` (database, helpers, error handling)

**Key Exports:**

```javascript
const CommandLoader = require('necrobot-core');
const { InteractionHandler } = require('necrobot-core');
```

**Location:** `repos/necrobot-core/`

**Key Files:**

- `src/core/CommandLoader.js` - Loads Discord commands
- `src/core/CommandRegistrationHandler.js` - Discord API registration
- `src/core/InteractionHandler.js` - Interaction processing

---

### 3. necrobot-commands (Discord Commands)

**Purpose:** All Discord bot commands organized by category

**Version:** 0.3.0  
**Status:** ✅ Production commands  
**Tests:** 3 files, 36 tests

**Depends on:**

- `necrobot-core` (command loading)
- `necrobot-utils` (database, helpers)

**Command Categories:**

```
src/commands/
├── misc/           # General utilities (ping, help, info)
├── battle/         # Battle management commands
├── campaign/       # Campaign operations
├── gang/           # Gang/faction management
└── social/         # Social features
```

**Location:** `repos/necrobot-commands/`

---

### 4. necrobot-dashboard (Web UI)

**Purpose:** Next.js web dashboard for bot management

**Version:** 0.2.3  
**Status:** ✅ Web interface  
**Tests:** 0 (React components)

**Depends on:**

- `necrobot-utils` (database access, API client)

**Technology:** React, Next.js, TypeScript (optional)

**Location:** `repos/necrobot-dashboard/`

---

## Development Workflow

### First-Time Setup

```bash
# Clone repository
git clone https://github.com/Rarsus/necromundabot.git
cd necromundabot

# Install dependencies across all workspaces
npm ci --workspaces

# Verify installation
npm run workspaces:status
npm run workspaces:validate

# Run tests to verify everything works
npm test
```

### Daily Development

```bash
# Check workspace health
npm run workspaces:status

# Make code changes in one of the packages
# e.g., repos/necrobot-utils/src/services/DatabaseService.js

# Run tests (all workspaces)
npm test

# Lint and format code
npm run lint
npm run lint:fix
npm run format

# Commit changes
git add repos/necrobot-utils/src/services/DatabaseService.js
git commit -m "feat(utils): Add new database method"
```

### Testing Specific Workspace

```bash
# Test one workspace only
npm test --workspace=repos/necrobot-core

# Watch mode
npm run test:watch --workspace=repos/necrobot-commands

# With coverage
npm run test:coverage --workspace=repos/necrobot-utils
```

---

## Installation & Setup

### Prerequisites

- **Node.js:** >= 22.0.0
- **npm:** >= 10.0.0
- **Docker:** (Optional, for containerized development)

### Installation Steps

**Option 1: Clean Installation**

```bash
git clone https://github.com/Rarsus/necromundabot.git
cd necromundabot
npm ci --workspaces
npm test
```

**Option 2: Update Existing Installation**

```bash
git pull origin main
npm ci --workspaces
npm test
```

### Verify Installation

```bash
# Check Node.js and npm versions
npm run validate:node

# Check monorepo structure
npm run workspaces:validate

# List all workspaces
npm run workspaces:list

# View workspace health report
npm run workspaces:status
```

---

## Running Commands

### All Workspaces

```bash
# Run tests across all workspaces
npm test

# Run tests with coverage across all workspaces
npm run test:coverage

# Lint all code
npm run lint

# Fix all linting errors
npm run lint:fix

# Format all code
npm run format

# Check formatting without changes
npm run format:check

# Build all packages
npm run build
```

### Specific Workspace

```bash
# Run tests in one workspace
npm test --workspace=repos/necrobot-core

# Lint one workspace
npm run lint --workspace=repos/necrobot-commands

# Run custom script in one workspace
npm run custom:script --workspace=repos/necrobot-dashboard
```

### Workspace Management

```bash
# Show status of all workspaces
npm run workspaces:status

# Validate monorepo structure
npm run workspaces:validate

# List workspaces with dependencies
npm run workspaces:list

# Quick test run (bail on first failure)
npm run test:quick
```

---

## Testing

### Test Structure

```
repos/necrobot-utils/
├── tests/
│   ├── unit/
│   │   ├── test-database-service.test.js
│   │   └── test-response-helpers.test.js
│   └── integration/
│       └── test-database-integration.test.js
└── jest.config.js
```

### Running Tests

```bash
# Run all tests across all workspaces
npm test

# Run one workspace's tests
npm test --workspace=repos/necrobot-core

# Run specific test file
npm test -- test-command-loader.test.js

# Watch mode (rerun on file change)
npm run test:watch --workspace=repos/necrobot-commands

# With coverage report
npm run test:coverage --workspace=repos/necrobot-utils
```

### Test Coverage

**Targets:**

| Module        | Line | Function | Branch |
| ------------- | ---- | -------- | ------ |
| Core Services | 85%+ | 90%+     | 80%+   |
| Commands      | 80%+ | 85%+     | 75%+   |
| Utilities     | 90%+ | 95%+     | 85%+   |

### Writing Tests

**Location:** `repos/[workspace]/tests/unit/test-*.test.js`

```javascript
const assert = require('assert');

describe('MyFeature', () => {
  it('should work correctly', () => {
    const result = myFunction();
    assert.strictEqual(result, expectedValue);
  });
});
```

See [TESTING-PATTERNS.md](../testing/TESTING-PATTERNS.md) for detailed guidelines.

---

## Workspace Management

### Monitoring Workspace Health

```bash
# Display current status of all workspaces
npm run workspaces:status

# Output:
# 📊 NecromundaBot Workspace Status Report
# 1. repos/necrobot-utils@0.2.4
#    - Git: main, 2 test files
# 2. repos/necrobot-core@0.3.4
#    - Git: main, 5 test files
# ...
```

### Validating Monorepo Structure

```bash
# Run comprehensive validation
npm run workspaces:validate

# Checks:
# ✅ Root package.json has workspaces array
# ✅ All workspace directories exist
# ✅ All package.json files valid
# ✅ Dependencies resolve correctly
# ✅ Test files accessible
```

### Managing Dependencies

**Cross-Workspace Dependencies:**

```json
// repos/necrobot-core/package.json
{
  "dependencies": {
    "necrobot-utils": "*"
  }
}
```

The `"*"` version resolves to the local workspace during development, and to npm registry when published.

**Adding Dependencies:**

```bash
# Add to specific workspace
npm install some-package --workspace=repos/necrobot-core

# Add dev dependency
npm install --save-dev some-package --workspace=repos/necrobot-commands
```

**Deduplication:**

npm workspaces automatically deduplicates dependencies. View the dependency tree:

```bash
npm list --workspaces --depth=0
```

---

## Publishing

### Manual Publishing

```bash
# Update version in all package.json files
# Create git tags
# Push to GitHub

# Publish to GitHub Packages:
npm publish --workspace=repos/necrobot-utils
npm publish --workspace=repos/necrobot-core
npm publish --workspace=repos/necrobot-commands
npm publish --workspace=repos/necrobot-dashboard
```

### Automated Publishing

GitHub Actions workflow (`publish-packages.yml`) automatically publishes:

- When commits are pushed to `main` branch
- Publishes to `npm.pkg.github.com` (GitHub Packages)
- Enforces correct publish order (utils → core → commands → dashboard)

### Publishing Order

1. **necrobot-utils** - Foundation layer
2. **necrobot-core** - Depends on utils
3. **necrobot-commands** - Depends on core & utils
4. **necrobot-dashboard** - Depends on utils

---

## Troubleshooting

### Installation Issues

**Issue:** `npm ci` fails with dependency errors

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm ci --workspaces
```

**Issue:** Missing `node_modules` in workspace directories

```bash
# Solution: npm workspaces should handle this automatically
npm ci --workspaces

# If still missing:
npm install --workspace=repos/necrobot-utils
```

### Testing Issues

**Issue:** Tests fail with "Cannot find module 'necrobot-utils'"

```bash
# Solution: Reinstall dependencies
npm ci --workspaces

# Verify workspace resolution:
npm list --workspaces
```

**Issue:** "ENOENT: no such file or directory" in tests

```bash
# Solution: Check test file paths are relative to package root
# Correct: repos/necrobot-commands/tests/unit/test-command.test.js
# Correct: require('../../src/commands/mycommand.js')

# If issue persists:
npm test --workspace=repos/[workspace] -- --verbose
```

### Development Issues

**Issue:** Changes in one workspace don't reflect in another

```bash
# Solution: npm workspaces are linked, but need restart
npm run test --workspace=repos/necrobot-core
```

**Issue:** Port already in use (Docker)

```bash
# Find what's using the port
lsof -i :3000

# Or change port in docker-compose.yml
```

### Git Issues

**Issue:** "fatal: invalid gitlink" errors

```bash
# Solution: This repo is NOT using git submodules
# All packages are in-tree, no submodule configuration

# Verify:
git config --file .gitmodules --get-regexp 'submodule.*url'
# Should return: (nothing)
```

### Workspace Resolution Issues

**Issue:** npm workspaces not resolving

```bash
# Check root package.json has workspaces array:
cat package.json | grep -A 5 '"workspaces"'

# Verify all workspace directories exist:
ls -d repos/necrobot-*

# Reinstall if needed:
npm ci --workspaces
```

---

## Additional Resources

### Documentation

- [Architecture Overview](../architecture/system-architecture.md)
- [Testing Patterns](../testing/TESTING-PATTERNS.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

### GitHub

- [Repository](https://github.com/Rarsus/necromundabot)
- [Issues](https://github.com/Rarsus/necromundabot/issues)
- [Releases](https://github.com/Rarsus/necromundabot/releases)

### Community

- [Discord.js Guide](https://discordjs.guide/)
- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

---

## FAQ

**Q: How do I add a new package to the monorepo?**

A: Create a new directory in `repos/`, add a `package.json`, and add it to the root `package.json` `workspaces` array.

**Q: Can I use different Node versions for different packages?**

A: No, npm workspaces share the same Node version. All packages must support the root package's `engines` field.

**Q: How are versions managed?**

A: Each package has its own `version` in its `package.json`. They're independent and can be released separately.

**Q: What happens if a workspace is deleted?**

A: Remove it from the root `package.json` `workspaces` array and delete the directory.

**Q: Can I run a workspace-specific script?**

A: Yes: `npm run [script] --workspace=repos/necrobot-core`

---

**Last Updated:** January 29, 2026  
**Status:** ✅ Complete  
**Next:** See Phase 7 - Comprehensive Testing & Verification
