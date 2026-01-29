# Copilot Instructions for NecromundaBot

> Quick start for AI agents. Last Updated: January 28, 2026  
> For detailed scenarios and patterns, see subdirectories below.

## 🚨 CRITICAL ENFORCED REQUIREMENTS

### 1. Documentation Storage & Naming - MANDATORY

**ALL documentation must follow the naming convention AND be stored in the correct location. Violations result in PR rejection.**

#### Strict Storage Rules

```
ROOT LEVEL (./):
  - Governance docs only: README.md, CHANGELOG.md, CONTRIBUTING.md, etc.
  - Pattern: {UPPERCASE_NAME}.md
  - Examples: CODE_OF_CONDUCT.md, DEFINITION-OF-DONE.md, DOCUMENT-NAMING-CONVENTION.md

/docs/ folder:
  - User guides, architecture, best practices, testing guides
  - Subdirectories: admin-guides/, user-guides/, guides/, architecture/, reference/, best-practices/, testing/
  - Pattern: {lowercase-with-hyphens}.md
  - Examples: docs/guides/testing-guide.md, docs/user-guides/creating-commands.md

/project-docs/ folder:
  - Phase documents, planning, internal project governance
  - Pattern: PHASE-{#}.{optional-letter}-{TYPE}.md
  - Examples: PHASE-03.0-GITHUB-ACTIONS-WORKFLOW.md, PHASE-03.1-IMPLEMENTATION-ANALYSIS.md

DEPRECATED/ARCHIVED:
  - /docs/archived/ - Old documentation
  - /project-docs/_archive/ - Historical phase docs
  - Pattern: Same as original, but stored in archived location
```

#### Naming Pattern Enforcement

| Document Type | Location | Pattern | Example | Enforced |
|---|---|---|---|---|
| Root governance | `./` | `{UPPERCASE}.md` | `CONTRIBUTING.md` | ✅ STRICT |
| Phase deliverables | `/project-docs/` | `PHASE-{#}.{opt-letter}-{TYPE}.md` | `PHASE-03.0-GITHUB-ACTIONS.md` | ✅ STRICT |
| Test documentation | `/docs/testing/` | `TEST-{DESCRIPTOR}.md` or `test-{descriptor}.md` | `TEST-COVERAGE-ANALYSIS.md` | ✅ STRICT |
| User guides | `/docs/user-guides/` | `{action}.md` | `creating-commands.md` | ✅ STRICT |
| Developer guides | `/docs/guides/` | `{topic}.md` | `testing-guide.md` | ✅ STRICT |
| Architecture docs | `/docs/architecture/` | `{component}.md` | `guild-aware-architecture.md` | ✅ STRICT |

#### COPILOT WORKFLOW FOR DOCUMENTATION

**When creating ANY documentation:**

1. **Identify the document type first:**
   - Is this governance? (root level)
   - Is this a deliverable for a phase? (project-docs/)
   - Is this a guide or reference? (docs/)

2. **Check DOCUMENT-NAMING-CONVENTION.md for the exact pattern**

3. **Use ONLY the approved location and pattern** - no deviations

4. **Update index files when adding docs:**
   - Root-level docs → Update `DOCUMENTATION-INDEX.md`
   - docs/ folder → Update `docs/INDEX.md`
   - Phase documents → Update `project-docs/INDEX.md`

**❌ VIOLATIONS (will cause PR rejection):**
- Storing root governance docs in `/docs/` folder
- Using `lowercase-names` for root-level files
- Storing phase docs outside `/project-docs/`
- Creating docs without updating index files
- Deviating from the exact naming pattern

**✅ CORRECT Examples:**

```
Root governance:
  ✅ ./CONTRIBUTING.md (governance)
  ✅ ./CODE_OF_CONDUCT.md (governance)
  ✅ ./DOCUMENT-NAMING-CONVENTION.md (governance)

Phase deliverables:
  ✅ ./project-docs/PHASE-03.0-GITHUB-ACTIONS-WORKFLOW.md
  ✅ ./project-docs/PHASE-03.1-IMPLEMENTATION-ANALYSIS.md

Guides and references:
  ✅ ./docs/guides/testing-guide.md
  ✅ ./docs/user-guides/creating-commands.md
  ✅ ./docs/architecture/guild-aware-architecture.md
  ✅ ./docs/testing/test-coverage-baseline-strategy.md

Archived/Historical:
  ✅ ./docs/archived/old-process.md (moved from docs/)
  ✅ ./project-docs/_archive/phase-22/PHASE-22-SUMMARY.md (historical)
```

### 2. Test-Driven Development (TDD) - MANDATORY

**ALL code changes require TDD workflow:**

```
✅ Write tests FIRST (RED - fails)
✅ Implement code to pass (GREEN - passes)  
✅ Refactor while tests pass (REFACTOR)
✅ Commit tests + code together
```

**Real Example from Codebase:**

```javascript
// test-help-command.test.js (REQUIRED FIRST)
const assert = require('assert');
describe('Help Command', () => {
  it('should have required name property (CommandLoader requirement)', () => {
    assert.strictEqual(helpCommand.name, 'help');
  });
  // ... more tests define the contract
});

// THEN create: src/commands/misc/help.js
module.exports = {
  name: 'help',  // satisfies test
  description: 'Shows all available commands',
  data: new SlashCommandBuilder()...,
  async executeInteraction(interaction) { /* ... */ }
};
```

**Violation Consequences:** PR rejected, no exceptions.

### 3. Command Structure Validation - MANDATORY

**All commands MUST export exactly these 4 properties (CommandLoader validates):**

```javascript
module.exports = {
  name: 'cmdname',                              // string
  description: 'Description here',              // string
  data: new SlashCommandBuilder()...,           // SlashCommandBuilder
  async executeInteraction(interaction) { ... } // async function
};
```

CommandLoader warns if validation fails:
```
⚠️ Invalid command structure: bad-command.js ← Won't load
```

Tests MUST verify all 4 properties explicitly.

### 4. Workspace Aware Imports - MANDATORY

Commands and utilities in submodules use workspace `"*"` versions:

```json
{
  "dependencies": {
    "necrobot-utils": "*",
    "necrobot-core": "*"
  }
}
```

**Import patterns in necrobot-commands:**
```javascript
const CommandLoader = require('necrobot-core').CommandLoader;
const { DatabaseService } = require('necrobot-utils');
```

Never use `file:../` paths - npm ci handles workspace resolution.



## 📁 Actual Codebase Architecture (Real Jan 2026)

**This is a monorepo with 4 independent npm workspaces as Git submodules:**

```
necromundabot/                    # Main workspace hub
├── repos/necrobot-core/          # Discord.js client, events, command loading
├── repos/necrobot-utils/         # Services (DatabaseService), shared utilities  
├── repos/necrobot-commands/      # All Discord commands by category
└── repos/necrobot-dashboard/     # React/Next.js web UI (minimal, not active)
```

**Each submodule is independent:**
- Own `package.json`, `tests/`, `src/`
- Own git history (`.git/` directory)
- Versioned separately (v0.3.0, v0.2.2, etc.)
- Published to npm.pkg.github.com

### necrobot-core (Bot Engine)

**What lives here:**
- `src/bot.js` - Entry point, initializes Discord client
- `src/core/CommandLoader.js` - Dynamic command discovery & validation
- `src/core/CommandRegistrationHandler.js` - Slash command registration with Discord
- `src/core/InteractionHandler.js` - Routes interactions to commands
- `src/events/` - Discord event handlers (ready, interactionCreate, etc.)
- `src/services/` - Core services (some, others in necrobot-utils)
- `src/middleware/` - Error handling, logging

**Key Pattern:** CommandLoader validates commands have all 4 required properties, then loads from necrobot-commands/src/commands/

### necrobot-commands (All Commands)

**Organized by category:**
```
src/commands/
  ├── misc/            # help, ping
  ├── battle/          # battle management
  ├── campaign/        # campaign ops
  ├── gang/            # gang management
  └── social/          # social features
```

**Each command is a plain object export:**
```javascript
module.exports = {
  name: 'commandname',
  description: 'Description',
  data: new SlashCommandBuilder()...
  async executeInteraction(interaction) { ... }
};
```

**Tests are co-located:**
```
tests/unit/test-help-command.test.js  ← Tests help.js
tests/unit/test-command-structure.test.js  ← Tests all commands exist
```

### necrobot-utils (Shared Services)

**What lives here:**
- `src/services/DatabaseService.js` - SQLite wrapper with guild context
- `src/middleware/` - Shared middleware (error handler, logger)
- `src/utils/` - Shared helpers (response builders, validators)

### necrobot-dashboard (Web UI)

Minimal, not actively used. Contains Next.js skeleton.


## 🔑 Critical Development Workflows

### Running Tests (All Workspaces)

```bash
# Run tests in all workspaces
npm test

# Run tests with watch mode in one workspace
npm run test:watch --workspace=repos/necrobot-commands

# Generate coverage report
npm run test:coverage --workspace=repos/necrobot-core
```

### Linting & Formatting

```bash
# Lint all workspaces
npm run lint

# Fix linting errors
npm run lint:fix --workspace=repos/necrobot-commands

# Format code
npm run format --workspace=repos/necrobot-core
```

### Docker Development

```bash
# Build and run locally
docker-compose down && docker system prune -f
docker-compose up --build -d

# View logs
docker logs necromundabot -f

# Stop
docker-compose down
```

**⚠️ CRITICAL:** Use `npm ci` not `npm install` in Dockerfile. First build ~3-5min, rebuild ~30s with cache.

### Adding a New Command

1. Create test file first: `repos/necrobot-commands/tests/unit/test-{command}.test.js`
2. Write tests for all 4 required properties and functionality
3. Create command: `repos/necrobot-commands/src/commands/{category}/{command}.js`
4. Verify structure (name, description, data, executeInteraction)
5. Run: `npm test --workspace=repos/necrobot-commands`
6. Test in Discord with `/ping` or your command


## 🎯 Project Overview

NecromundaBot is a Discord bot for managing Necromunda campaigns with organized commands, modern architecture, and comprehensive testing. Features slash commands, database integration, and multi-workspace modular design.

**Current Status (Jan 2026):**
- necrobot-core v0.3.0 ✅
- necrobot-utils v0.2.2 ✅
- necrobot-dashboard v0.1.3 ✅
- necrobot-commands v0.1.0 ✅

**Technology Stack:**
- Node.js 22+ | Discord.js v14.11.0 | SQLite3 v5.1.7
- Jest tests | ESLint | Docker & Compose
├── DOCUMENTATION-INDEX.md     # Root docs navigation
└── COMMAND-REFERENCE-QUICK.md # Quick command reference
```

## 💻 Real Command Patterns from Codebase

### Actual Command Example: ping.js

```javascript
/**
 * Ping Command - Simple ping/pong command for testing
 * Example command demonstrating proper structure
 */

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for validation)
  name: 'ping',
  description: 'Replies with Pong! and bot latency',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! and bot latency'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    const reply = await interaction.editReply('🏓 Pong!');

    const latency = reply.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;

    await interaction.editReply(
      `🏓 Pong!\n` +
      `📊 Message latency: ${latency}ms\n` +
      `🌐 WebSocket latency: ${wsLatency}ms`
    );
  }
};
```

### Actual Command Example: help.js

```javascript
/**
 * Help Command - Shows all available commands
 * Dynamically displays loaded commands
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  // Command metadata (required for validation)
  name: 'help',
  description: 'Shows all available commands',

  // Command data (for slash command registration)
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands'),

  /**
   * Execute the slash command interaction
   * @param {CommandInteraction} interaction - Discord interaction
   * @returns {Promise<void>}
   */
  async executeInteraction(interaction) {
    const commandsByCategory = interaction.client.commandLoader.getCommandsByCategory();
    
    if (Object.keys(commandsByCategory).length === 0) {
      await interaction.editReply('❌ No commands available');
      return;
    }

    // Build help embed with commands organized by category
    const embed = new EmbedBuilder()
      .setTitle('📚 NecroBot Commands')
      .setColor(0x2F3136)
      .setDescription('Available commands organized by category');

    for (const [category, commands] of Object.entries(commandsByCategory)) {
      const categoryCommands = commands
        .map(cmd => `\`/${cmd.name}\` - ${cmd.description}`)
        .join('\n');
      embed.addFields({ name: category.charAt(0).toUpperCase() + category.slice(1), value: categoryCommands });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
```

### Actual Test Example: test-ping-command.test.js

```javascript
/**
 * Test Ping Command
 * Verifies that the ping command works correctly
 * Tests CommandLoader validation requirements
 */

const assert = require('assert');

describe('Ping Command', () => {
  let pingCommand;

  beforeEach(() => {
    // Clear require cache to get fresh module
    delete require.cache[require.resolve('../../src/commands/misc/ping.js')];
    pingCommand = require('../../src/commands/misc/ping.js');
  });

  describe('structure', () => {
    it('should be a valid command object', () => {
      assert(pingCommand, 'Ping command should exist');
      assert(typeof pingCommand === 'object', 'Ping command should be an object');
    });

    it('should have required name property (CommandLoader requirement)', () => {
      assert.strictEqual(pingCommand.name, 'ping');
    });

    it('should have required description property (CommandLoader requirement)', () => {
      assert.strictEqual(typeof pingCommand.description, 'string');
      assert.ok(pingCommand.description.length > 0);
    });

    it('should have required data property (CommandLoader requirement)', () => {
      assert.ok(pingCommand.data);
      assert.strictEqual(pingCommand.data.name, 'ping');
    });

    it('should have required executeInteraction method (CommandLoader requirement)', () => {
      assert.strictEqual(typeof pingCommand.executeInteraction, 'function');
    });
  });

  describe('functionality', () => {
    it('should respond to interaction', async () => {
      const mockInteraction = {
        editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now() }),
        createdTimestamp: Date.now() - 100,
        client: { ws: { ping: 50 } }
      };

      // Should not throw
      await pingCommand.executeInteraction(mockInteraction);
    });
  });
});
```

## 📋 Test-Driven Development (TDD) Workflow

**MANDATORY TDD Workflow:**

```
1. RED Phase - Write tests first
   ✅ Create test file with failing tests
   ✅ Run tests to confirm they fail (RED)
   ✅ Tests define the contract/requirements

2. GREEN Phase - Implement code
   ✅ Write minimal code to make tests pass
   ✅ Run tests to confirm they pass (GREEN)
   ✅ Focus on functionality, not optimization

3. REFACTOR Phase - Improve code
   ✅ Refactor while keeping tests passing
   ✅ Improve readability and performance
   ✅ Tests prevent regressions
```

### Coverage Requirements

| Module Type | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| Core Services | 85%+ | 90%+ | 80%+ |
| Commands | 80%+ | 85%+ | 75%+ |
| Utilities | 90%+ | 95%+ | 85%+ |
| New Features | 90%+ | 95%+ | 85%+ |

### Test Checklist (Before Every Commit)

- ✅ Test file created BEFORE implementation
- ✅ All public methods have test cases
- ✅ Happy path scenarios tested
- ✅ Error scenarios tested (all error types)
- ✅ Edge cases tested (boundary conditions, null/empty)
- ✅ Coverage thresholds met
- ✅ All tests PASS locally: `npm test`
- ✅ No ESLint errors: `npm run lint`

## 🔧 Common Development Tasks

### Creating a New Command (TDD Workflow)

```bash
# 1. Create test file FIRST
cat > repos/necrobot-commands/tests/unit/test-mycommand.test.js << 'EOF'
const assert = require('assert');
describe('MyCommand', () => {
  let myCommand;
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/commands/misc/mycommand.js')];
    myCommand = require('../../src/commands/misc/mycommand.js');
  });
  it('should have name property', () => {
    assert.strictEqual(myCommand.name, 'mycommand');
  });
  it('should have description property', () => {
    assert.ok(myCommand.description);
  });
  it('should have data property', () => {
    assert.ok(myCommand.data);
  });
  it('should have executeInteraction method', () => {
    assert.strictEqual(typeof myCommand.executeInteraction, 'function');
  });
});
EOF

# 2. Run tests (should FAIL - RED phase)
npm test --workspace=repos/necrobot-commands

# 3. Create implementation (make tests PASS - GREEN phase)
cat > repos/necrobot-commands/src/commands/misc/mycommand.js << 'EOF'
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'mycommand',
  description: 'My command description',
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),
  async executeInteraction(interaction) {
    await interaction.editReply('Hello!');
  }
};
EOF

# 4. Run tests again (should PASS - GREEN phase)
npm test --workspace=repos/necrobot-commands

# 5. Verify in Discord
# Use Discord bot to test /mycommand
```

### Debugging a Command

```bash
# Start bot in watch mode with debugging
node --inspect-brk repos/necrobot-core/src/bot.js

# OR with npm
npm run dev --workspace=repos/necrobot-core
```

### Running Tests for Specific Module

```bash
# Test one workspace
npm test --workspace=repos/necrobot-commands

# Run specific test file
npm test --workspace=repos/necrobot-core -- test-error-handler.test.js

# Run with coverage
npm run test:coverage --workspace=repos/necrobot-utils
```

## 📚 Key Files to Reference

**Bot Entry Point:**
- [repos/necrobot-core/src/bot.js](repos/necrobot-core/src/bot.js) - Initializes Discord client

**Command Loading:**
- [repos/necrobot-core/src/core/CommandLoader.js](repos/necrobot-core/src/core/CommandLoader.js) - Validates & loads commands

**Example Commands:**
- [repos/necrobot-commands/src/commands/misc/ping.js](repos/necrobot-commands/src/commands/misc/ping.js)
- [repos/necrobot-commands/src/commands/misc/help.js](repos/necrobot-commands/src/commands/misc/help.js)

**Database Service:**
- [repos/necrobot-utils/src/services/DatabaseService.js](repos/necrobot-utils/src/services/DatabaseService.js)

**Testing Examples:**
- [repos/necrobot-commands/tests/unit/test-ping-command.test.js](repos/necrobot-commands/tests/unit/test-ping-command.test.js)
- [repos/necrobot-commands/tests/unit/test-command-structure.test.js](repos/necrobot-commands/tests/unit/test-command-structure.test.js)

## 🚀 Tips for Copilot Usage

- **Always verify current submodule** before creating files
- **Use workspace commands:** `npm test --workspace=...` instead of `cd` and back
- **Check command structure examples** before implementing new commands
- **Run tests frequently** during development to catch issues early
- **Use git tags** from release script for version management
- **Follow TDD strictly** - no exceptions, tests first always
- **Maintain test co-location** - tests in same submodule as code

### Test-Driven Development (TDD) - MANDATORY

**⚠️ CRITICAL: COPILOT MUST FOLLOW TDD FOR ALL CODE CHANGES**

This is **NON-NEGOTIABLE**. Every code change, bug fix, feature, or implementation MUST follow the TDD workflow below. No exceptions.

**What triggers TDD requirement:**
- ✅ Creating new functions, methods, or classes
- ✅ Creating new services or utilities
- ✅ Adding new features or commands
- ✅ Fixing bugs (write test that reproduces bug first)
- ✅ Refactoring existing code
- ✅ Adding database migrations

**What does NOT require TDD:**
- ❌ Configuration file changes (`.env`, `.yml`, etc.)
- ❌ Documentation updates
- ❌ Dependency upgrades (unless code changes required)

**Copilot Workflow (MANDATORY):**

1. **BEFORE ANY CODE:** Ask user confirmation or proceed with explicit TDD workflow statement
2. **Create test file FIRST** - No implementation until tests exist
3. **Write RED phase tests** - All tests should initially FAIL
4. **Run tests** - Verify RED phase (tests fail as expected)
5. **Implement GREEN phase** - Write minimal code to pass tests
6. **Run tests again** - Verify GREEN phase (all tests pass)
7. **Check coverage** - Verify coverage meets thresholds
8. **Commit with message** - Include test file and implementation together

**All new code MUST follow strict Test-Driven Development principles:**

#### TDD Workflow (RED → GREEN → REFACTOR)

1. **RED Phase - Write Tests First**
   - Create test file BEFORE implementation
   - Define test cases for all scenarios (happy path, error paths, edge cases)
   - Run tests (should FAIL - RED)
   - Tests drive design and requirements

2. **GREEN Phase - Implement Minimum Code**
   - Write ONLY code needed to pass tests
   - Keep implementation focused and simple
   - All tests PASS (GREEN)
   - No over-engineering

3. **REFACTOR Phase - Improve Quality**
   - Optimize code while tests remain passing
   - Improve readability and maintainability
   - All tests STILL PASS
   - No new functionality during refactor

**This is NON-NEGOTIABLE for new code.**

#### Coverage Requirements by Module Type

| Module Type   | Lines    | Functions | Branches | Test Count |
| ------------- | -------- | --------- | -------- | ---------- |
| Core Services | **85%+** | **90%+**  | **80%+** | 20-30      |
| Utilities     | **90%+** | **95%+**  | **85%+** | 15-25      |
| Commands      | **80%+** | **85%+**  | **75%+** | 15-20      |
| Middleware    | **95%+** | **100%**  | **90%+** | 20-25      |
| New Features  | **90%+** | **95%+**  | **85%+** | 20-30      |

#### Test Requirements Checklist

Before ANY code is committed, verify:

- ✅ Test file created BEFORE implementation code
- ✅ **IMPORTANT: Import real code from NEW locations** (not deprecated paths)
- ✅ All public methods have test cases
- ✅ Happy path scenarios tested
- ✅ Error scenarios tested (all error types)
- ✅ Edge cases tested (boundary conditions, invalid inputs, null/empty values)
- ✅ Async/await error handling tested
- ✅ Database transactions tested (if applicable)
- ✅ Discord interaction mocking tested (if applicable)
- ✅ Coverage thresholds met (see table above)
- ✅ All tests PASS locally: `npm test`
- ✅ No ESLint errors: `npm run lint`
- ✅ Coverage maintained/improved: `npm test -- --coverage`

#### Import Rules for Tests (CRITICAL)

**What to import and test:**

```javascript
// ✅ Core modules - ALWAYS import and test these
const CommandBase = require('../../../src/core/CommandBase');
const CommandOptions = require('../../../src/core/CommandOptions');

// ✅ Services - ALWAYS import and test these
const DatabaseService = require('../../../src/services/DatabaseService');
const GuildAwareDatabaseService = require('../../../src/services/GuildAwareDatabaseService');
const QuoteService = require('../../../src/services/QuoteService');
const GuildAwareReminderService = require('../../../src/services/GuildAwareReminderService');

// ✅ Middleware - ALWAYS import and test these
const { logError } = require('../../../src/middleware/errorHandler');
const { validateInput } = require('../../../src/middleware/inputValidator');

// ✅ Helpers - ALWAYS import and test these
const { sendSuccess, sendError } = require('../../../src/utils/helpers/response-helpers');
```

**What NOT to import:**

```javascript
// ❌ DO NOT import from deprecated locations
const CommandBase = require('../../../src/utils/command-base');  // WRONG
const db = require('../../../src/db');  // WRONG
const errorHandler = require('../../../src/utils/error-handler');  // WRONG

// ❌ DO NOT avoid testing functionality to avoid deprecated code
// If you need database functionality, import DatabaseService (NEW)
// If you need error handling, import errorHandler (MIDDLEWARE)
// If you need validation, import inputValidator (MIDDLEWARE)
```

**Example: Correct test that imports real code:**

```javascript
// ✅ CORRECT - Imports from new location, tests actual service
const DatabaseService = require('../../../src/services/DatabaseService');
const QuoteService = require('../../../src/services/QuoteService');

describe('Quote Management', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  it('should add quote to database', async () => {
    const quote = await quoteService.addQuote(
      'guild-123',
      'Great quote',
      'Author'
    );
    assert.strictEqual(quote.guildId, 'guild-123');
  });
});
```

#### Test File Structure (MANDATORY)

```javascript
// tests/unit/test-{module-name}.js
const assert = require('assert');
const Module = require('../path/to/module');

describe('ModuleName', () => {
  let testData;

  beforeEach(() => {
    // Initialize test data
    testData = {
      /* ... */
    };
  });

  afterEach(() => {
    // Cleanup resources
    // Close databases, clear mocks, etc.
  });

  describe('methodName()', () => {
    // Test happy path
    it('should return expected result for valid input', () => {
      const result = Module.methodName(testData);
      assert.strictEqual(result, expected);
    });

    // Test error scenarios
    it('should throw error for invalid input', () => {
      assert.throws(() => {
        Module.methodName(null);
      }, /Expected error message/);
    });

    // Test edge cases
    it('should handle edge case: empty input', () => {
      const result = Module.methodName('');
      assert.strictEqual(result, null);
    });
  });
});
```

#### Mocking Standards

**Discord.js Mocking:**

```javascript
const mockInteraction = {
  user: { id: 'test-user-123', username: 'TestUser' },
  guildId: 'test-guild-456',
  channelId: 'test-channel-789',
  reply: async (msg) => ({ id: 'msg-123', ...msg }),
  deferReply: async () => ({}),
  editReply: async (msg) => ({ id: 'msg-123', ...msg }),
  followUp: async (msg) => ({ id: 'msg-456', ...msg }),
};
```

**Database Mocking:**

```javascript
// Use in-memory SQLite for isolated tests
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

// Initialize schema in beforeEach
// Reset/cleanup in afterEach
```

**Service Mocking:**

```javascript
// Mock external services to avoid dependencies
const mockService = {
  method: async (param) => {
    return { success: true, data: {} };
  },
};
```

#### Error Path Testing (CRITICAL)

Every error scenario must be tested:

```javascript
describe('error handling', () => {
  it('should handle database connection error', async () => {
    // Setup mock to throw error
    // Assert error is caught and handled
  });

  it('should handle invalid Discord permissions', async () => {
    // Setup mock user without permissions
    // Assert permission denial is handled
  });

  it('should handle timeout errors', async () => {
    // Setup slow/timeout scenario
    // Assert timeout handling
  });

  it('should handle race conditions', async () => {
    // Setup concurrent operations
    // Assert proper synchronization
  });
});
```

#### Integration Testing

For complex workflows, add integration tests:

```javascript
// tests/integration/test-integration-{feature}.js
describe('Feature Integration', () => {
  it('should complete full workflow', async () => {
    // Setup initial state
    // Perform multiple operations
    // Assert final state
  });
});
```

#### Pre-Commit Testing Workflow

MANDATORY before every commit:

```bash
# 1. Run specific module tests
npm test -- tests/unit/test-{module-name}.js

# 2. Check code style
npm run lint

# 3. Generate coverage report
npm test -- --coverage

# 4. Verify coverage meets thresholds
npm run coverage:validate

# 5. Run all tests before push
npm test

# Only commit if ALL checks pass
```

#### Coverage Maintenance

- **Current:** 79.5% (lines) | 82.7% (functions) | 74.7% (branches)
- **Target:** 90%+ (lines) | 95%+ (functions) | 85%+ (branches)
- **Never decrease** existing coverage
- **Always improve** coverage with new code

See `CODE-COVERAGE-ANALYSIS-PLAN.md` for detailed coverage roadmap and priorities.

#### Testing Guidelines Summary

- ✅ **Write tests FIRST**, not after
- ✅ **Test all code paths**, not just happy paths
- ✅ **Use mocks** for external dependencies
- ✅ **Keep tests focused** (one concept per test)
- ✅ **Name tests clearly** (describe what is being tested)
- ✅ **Cleanup after tests** (no side effects between tests)
- ✅ **Test async code properly** (promises, callbacks, streams)
- ✅ **Test error handling** (all error types and edge cases)
- ✅ **Maintain test documentation** (comment complex test logic)
- ✅ **Run tests frequently** (before every commit)

**Violation of TDD requirements will result in rejection of pull requests.**

#### TDD Violation Examples - DO NOT DO THESE

**❌ VIOLATION #1: Modify code first, add tests later**
```
# WRONG SEQUENCE - This violates TDD
1. Create src/commands/my-command.js
2. Modify src/commands/my-command.js 
3. Test in Discord
4. ❌ THEN add tests/unit/test-my-command.test.js (TOO LATE!)
```

**✅ CORRECT SEQUENCE - TDD Workflow**
```
# RIGHT SEQUENCE - Follows TDD
1. Create tests/unit/test-my-command.test.js (RED - initially fails)
2. Verify tests FAIL with clear error messages
3. Create src/commands/my-command.js
4. ✅ All tests PASS (GREEN)
5. Refactor/optimize while tests still pass
6. Commit tests + implementation together
```

**❌ VIOLATION #2: Updating command without updating tests**
```javascript
// WRONG - Changing implementation without verifying tests still pass
// User edits: executeInteraction() method
// Result: Tests fail but weren't run before committing
// Consequence: PR rejected, TDD violation flagged
```

**✅ CORRECT - Update tests first**
```javascript
// RIGHT - Update tests BEFORE changing implementation
1. Modify tests/unit/test-command.test.js to validate new behavior
2. Run: npm test - should initially FAIL (RED)
3. Update src/commands/command.js to make tests pass (GREEN)
4. Run: npm test - should now PASS
5. Commit both together with detailed message
```

### Command Validation & CommandLoader Requirements - ENFORCED

**⚠️ CRITICAL: All commands MUST meet CommandLoader validation**

The CommandLoader validates commands before loading them. Any command that doesn't match the requirements will be skipped with warning:
```
⚠️ Invalid command structure: help.js
```

**CommandLoader Validation Checklist (MANDATORY):**

Every command file MUST export an object with these 4 properties:

| Property | Type | Purpose | Example |
|----------|------|---------|---------|
| `name` | string | Command identifier | `name: 'help'` |
| `description` | string | User-facing description | `description: 'Shows all available commands'` |
| `data` | SlashCommandBuilder | Discord slash command builder | `data: new SlashCommandBuilder().setName('help')...` |
| `executeInteraction` | async function | Handler for slash interactions | `async executeInteraction(interaction) { ... }` |

**❌ INVALID Command Structure (will fail validation):**
```javascript
module.exports = {
  data: new SlashCommandBuilder()...
  execute(interaction) { ... }  // ❌ WRONG: method name is 'execute'
  // ❌ MISSING: name property
  // ❌ MISSING: description property
};
// Result: ⚠️ Invalid command structure: mycommand.js
```

**✅ VALID Command Structure (passes validation):**
```javascript
module.exports = {
  name: 'mycommand',                                    // ✅ Required
  description: 'Does something awesome',               // ✅ Required
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Does something awesome'),         // ✅ Required
  async executeInteraction(interaction) {              // ✅ Required
    // implementation
  }
};
// Result: ✅ Loaded: mycommand (mycommand.js)
```

**Tests MUST validate these properties:**

```javascript
describe('Command Validation', () => {
  it('should have required name property (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.name, 'string');
    assert.strictEqual(myCommand.name, 'mycommand');
  });

  it('should have required description property (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.description, 'string');
    assert.ok(myCommand.description.length > 0);
  });

  it('should have required data property (CommandLoader requirement)', () => {
    assert.ok(myCommand.data);
    assert.strictEqual(myCommand.data.name, 'mycommand');
  });

  it('should have required executeInteraction method (CommandLoader requirement)', () => {
    assert.strictEqual(typeof myCommand.executeInteraction, 'function');
  });
});
```

### Docker Build Performance - ENFORCED

**⚠️ CRITICAL: Docker performance directly impacts development speed**

**Issue:** Slow builds block development iteration cycles
**Root Cause:** Inefficient dependency installation and layer caching
**Solution:** Use npm ci with proper layer ordering

#### Docker Build Optimization Rules (ENFORCED)

**Rule 1: Use `npm ci` NOT `npm install` for workspaces**

```dockerfile
# ❌ WRONG - Slow, rebuilds every time
RUN npm install --workspaces

# ✅ CORRECT - Fast, uses package-lock.json, better caching
RUN npm ci --workspaces
```

**Why:** 
- `npm ci` (clean install) is 3-4x faster than `npm install`
- Always uses `package-lock.json` for reproducible builds
- Better Docker layer caching on rebuilds
- Deterministic build results

**Performance Impact:**
| Scenario | npm install | npm ci |
|----------|-------------|--------|
| First build | ~180s | ~50-70s |
| Rebuild (cached) | ~120s | ~10-15s |
| Layer cache hit | ❌ Weak | ✅ Strong |
| Speed improvement | — | **70-80% faster** |

**Rule 2: Order Dockerfile layers for maximum cache efficiency**

```dockerfile
# ✅ CORRECT - Ordered for cache efficiency
FROM node:22-alpine AS builder
WORKDIR /app

# Layer 1: Configuration (rarely changes)
COPY .npmrc ./

# Layer 2: Build dependencies (rarely changes)
RUN apk add --no-cache python3 make g++

# Layer 3: Package metadata (changes when deps update)
COPY package*.json ./
RUN npm ci --only=production && npm ci --only=development

# Layer 4: Workspace packages (changes frequently)
COPY repos ./repos

# Layer 5: Workspace dependencies (changes when workspace deps update)
RUN npm ci --workspaces  # ← Uses cache from Layer 3, faster!
```

**Cache Behavior:**
- If you modify application code → only Layer 4 rebuilds ✅ Fast (10-15s)
- If you add/update npm dependencies → Layers 3-5 rebuild (50-70s)
- If you modify .npmrc → All layers rebuild (3-5min)

**Rule 3: Don't include unnecessary files in build context**

```dockerfile
# .dockerignore
# ✅ CORRECT - Keep lock files for reproducible builds
# package-lock.json  ← KEEP, needed for npm ci

# ❌ Remove - Rebuild files, node_modules, cache
dist/
build/
*.log
.git/
node_modules/
coverage/
```

#### Docker Build Testing (MANDATORY)

Before committing Docker changes:

```bash
# Test local build
docker-compose down && docker system prune -f
docker-compose up --build -d

# Verify build time in output
# Should see: ✅ Build time ~3-5min for first build, ~30s for rebuild

# Verify bot starts
docker logs necromundabot | tail -20
# Should see: ✅ Bot logged in as [botname]#[number]

# Verify commands load
docker logs necromundabot | grep "Loaded"
# Should see: ✅ Loaded X command(s) from Y categor(y/ies)

# Test rebuild with cache
docker-compose down && docker-compose up --build -d
# Should see: << BUILD TIME SIGNIFICANTLY FASTER >> (10-30s)
```

**Optimization Validation Checklist:**

- ✅ First build completes in ~3-5 minutes
- ✅ Rebuild (with cache) completes in ~30 seconds or less
- ✅ Container starts within 10 seconds
- ✅ Bot successfully connects to Discord
- ✅ All commands load without warnings
- ✅ No "Invalid command structure" warnings in logs

**Violation of Docker optimization will result in performance regression and slow development cycles.**

## Command Categories

Commands are organized by purpose:

1. **misc/** - General utility commands (hi, ping, help, poem)
2. **quote-discovery/** - Finding quotes (random-quote, search-quotes, quote-stats)
3. **quote-management/** - CRUD operations (add-quote, delete-quote, update-quote, list-quotes, quote)
4. **quote-social/** - Social features (rate-quote, tag-quote)
5. **quote-export/** - Data export (export-quotes)

**When creating new commands:**

- Place in the appropriate category folder
- If creating a new category, follow the existing naming pattern
- Update help command if adding new command categories

## Development Workflow

### Creating a New Command

1. **Choose category** based on command purpose
2. **Create file** in appropriate `src/commands/` subdirectory
3. **Use Command base class** - extend from `Command`
4. **Build options** using `buildCommandOptions()`
5. **Use response helpers** for all Discord messages
6. **Add tests** in `tests/unit/` or `tests/integration/`
7. **Run tests** with `npm test`
8. **Lint code** with `npm run lint`
9. **Register commands** with `npm run register-commands`
10. **Test in Discord** to verify functionality

### Making Changes to Existing Commands

1. **Read existing code** to understand current implementation
2. **Maintain patterns** - don't break from Command base class usage
3. **Update tests** to reflect changes
4. **Run tests** to ensure nothing breaks
5. **Test in Discord** to verify changes work

### Testing Strategy

**TDD is mandatory for all development.** See section: **Test-Driven Development (TDD) - MANDATORY** above.

```bash
npm test                        # Quick sanity checks
npm run test:all               # All tests (500+ tests)
npm run test:coverage          # Coverage report
npm run test:quotes            # Quote system tests
npm run test:utils:base        # Command base tests
npm run test:utils:options     # Options builder tests
npm run test:utils:helpers     # Response helpers tests
npm run test:integration:*     # Integration tests
npm run lint                   # Code style checks
```

**Test Coverage Expectations:**

- **Line Coverage:** 90%+ (target from 79.5%)
- **Function Coverage:** 95%+ (target from 82.7%)
- **Branch Coverage:** 85%+ (target from 74.7%)
- **Test Pass Rate:** 100% (maintain)
- **All untested modules:** Eliminated (from 2 to 0)

**Coverage Priority Roadmap:**
See `CODE-COVERAGE-ANALYSIS-PLAN.md` for detailed implementation roadmap:

- Phase 1: Critical foundation (response-helpers, ReminderNotificationService, DatabaseService)
- Phase 2: Service completeness (ReminderService, errorHandler, WebhookListenerService, ProxyConfigService)
- Phase 3: New features (resolution-helpers, features.js)
- Phase 4: Optimization (branch coverage, edge cases, performance)

### Code Quality Standards

- **No ESLint errors** - Run `npm run lint` before committing
- **Tests passing** - Run `npm test` before committing
- **Consistent patterns** - Follow Command base class approach
- **Documentation** - Update docs when changing architecture
- **Minimal changes** - Make surgical, focused changes

## Environment Configuration

Required environment variables (`.env` file):

```env
# Required
DISCORD_TOKEN=your_bot_token_here         # Discord bot token
CLIENT_ID=your_client_id_here             # Discord application ID

# Optional
GUILD_ID=optional_test_guild_id           # Speeds up command registration
PREFIX=!                                   # Prefix for legacy commands (default: !)
HUGGINGFACE_API_KEY=optional_key          # For AI poem generation
```

## Important Implementation Notes

### Error Handling

- **NEVER** write manual try-catch blocks in command classes
- The Command base class handles ALL errors automatically
- Just write your logic; errors are caught and logged
- Use response helpers for user-facing error messages

### Command Registration

- Commands self-register via `.register()` method
- Both slash and prefix commands are supported
- Options are shared between both command types
- Registration script: `src/register-commands.js`

### Database Schema

- Auto-initialized on first run via `schema-enhancement.js`
- Tables: quotes, ratings, tags, quote_tags
- All queries use prepared statements for SQL injection protection

### Deprecation Notes & Testing Requirements

**Deprecated (DO NOT USE):**
- `src/utils/command-base.js` → **Use:** `src/core/CommandBase.js`
- `src/utils/command-options.js` → **Use:** `src/core/CommandOptions.js`
- `src/utils/response-helpers.js` → **Use:** `src/utils/helpers/response-helpers.js`
- `src/utils/error-handler.js` → **Use:** `src/middleware/errorHandler.js`
- `src/db.js` → **Use:** Guild-aware services (`src/services/GuildAwareDatabaseService.js`)

**What This Means for Testing:**
- ✅ **DO import** from `src/core/`, `src/services/`, `src/middleware/`
- ✅ **DO test** actual service implementations with real execution
- ✅ **DO test** database operations through DatabaseService
- ✅ **DO test** error handling through errorHandler middleware
- ❌ **DON'T import** from deprecated locations
- ❌ **DON'T mock** services when you can test real implementations
- ❌ **DON'T avoid** testing actual code to avoid deprecated imports

**Critical:** The deprecation applies to CODE LOCATIONS, not to functionality. You must still test all functionality—just import from NEW locations, not deprecated ones.

**Manual error handling in commands is deprecated** - Use CommandBase
**Raw Discord API calls in commands should use response helpers** - Use `src/utils/helpers/response-helpers.js`
**Inconsistent option definitions should use CommandOptions** - Use `src/core/CommandOptions.js`

## Documentation Resources

**Documentation Standards & Navigation:**

- [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md) - Complete naming convention guide (follow this for all new docs)
- [DOCUMENTATION-INDEX.md](../../DOCUMENTATION-INDEX.md) - Master root-level documentation index
- [docs/INDEX.md](../../docs/INDEX.md) - Complete docs/ folder navigation

**Development Guides (docs/guides/):**

- [RELEASE-PROCESS.md](../../docs/guides/RELEASE-PROCESS.md) - **NEW:** Complete release workflow & versioning guide
- [creating-commands.md](../../docs/user-guides/creating-commands.md) - Command creation guide
- [testing-guide.md](../../docs/user-guides/testing-guide.md) - Testing with TDD
- [docker-setup.md](../../docs/user-guides/docker-setup.md) - Docker containerization
- [huggingface-setup.md](../../docs/user-guides/huggingface-setup.md) - AI setup

**Technical Reference (docs/reference/):**

- [docs/reference/architecture/](../../docs/reference/architecture/) - System design and architecture
- [docs/reference/database/](../../docs/reference/database/) - Database schemas and operations
- [docs/reference/permissions/](../../docs/reference/permissions/) - Role-based access control
- [docs/reference/configuration/](../../docs/reference/configuration/) - Configuration and setup
- [docs/reference/quick-refs/](../../docs/reference/quick-refs/) - Quick reference guides
- [docs/reference/reports/](../../docs/reference/reports/) - Analysis and audit reports

**Testing Documentation (docs/testing/):**

- [test-naming-convention-guide.md](../../docs/testing/test-naming-convention-guide.md) - Test naming standards
- [test-file-audit-report.md](../../docs/testing/test-file-audit-report.md) - Test file organization
- [test-coverage-baseline-strategy.md](../../docs/testing/test-coverage-baseline-strategy.md) - Coverage strategy

**Project Organization (project-docs/):**

- [project-docs/INDEX.md](../../project-docs/INDEX.md) - Master project documentation index
- [project-docs/PHASE-01.0/](../../project-docs/PHASE-01.0/) - TDD Foundation phase
- [project-docs/PHASE-02.0/](../../project-docs/PHASE-02.0/) - Repository Synchronization phase
- [project-docs/setup/](../../project-docs/setup/) - Setup and initialization documentation

**External Resources:**

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Semantic Versioning Spec](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Documentation Standards & Naming Convention

**ALL new documentation must follow the standards in [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md).**

### Quick Reference - Document Naming Rules

**Root-Level Documents (Project Governance):**
- Pattern: `{DESCRIPTOR}.md` (e.g., `README.md`, `CHANGELOG.md`)
- Use UPPER-CASE for organizational documents
- Examples: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`

**Phase Documents (Planning & Deliverables):**
- Pattern: `PHASE-{#}.{a-z?}-{TYPE}.md`
- Examples: `PHASE-22.3-COVERAGE-EXPANSION-PLAN.md`, `PHASE-22.3a-INITIALIZATION-SUMMARY.md`

**Test & Quality Documents:**
- Pattern: `TEST-{DESCRIPTOR}.md` or `TESTING-{DESCRIPTOR}.md`
- Examples: `TEST-NAMING-CONVENTION-GUIDE.md`, `TEST-COVERAGE-ANALYSIS.md`

**Definition Documents:**
- Pattern: `DEFINITION-OF-{CONCEPT}.md`
- Examples: `DEFINITION-OF-DONE.md`, `DEFINITION-OF-READY.md`

**Subdirectory Files (use lowercase with hyphens):**
- `docs/admin-guides/{action}.md` - Admin how-to guides
- `docs/user-guides/{action}.md` - User how-to guides
- `docs/guides/{topic}.md` - Developer process guides
- `docs/reference/{component}-reference.md` - Technical reference
- `docs/architecture/{topic}.md` - System design docs
- `docs/best-practices/{topic}.md` - Coding standards
- `docs/testing/{topic}.md` - Testing documentation
- `docs/archived/{historical}.md` - Old or historical docs

### Creating New Documentation

1. **Identify the document type** (Phase, Test, Definition, Guide, Reference, etc.)
2. **Use the appropriate naming pattern** from DOCUMENT-NAMING-CONVENTION.md
3. **Choose the right location** (root, docs/*, or docs/archived/)
4. **Create with clear structure** - headers, examples, links
5. **Update DOCUMENTATION-INDEX.md** when adding root-level docs
6. **Link from docs/INDEX.md** when adding docs/ files

### Updating Links When Documents Change

When renaming or moving documents:
1. Update all markdown links in other documents
2. Update links in code comments
3. Update `DOCUMENTATION-INDEX.md` and `docs/INDEX.md`
4. Use grep to find all references: `grep -r "old-filename" src/ docs/`
5. Test all links before committing

## Common Tasks & Examples

### Adding a New Quote Command Feature

1. Identify category (discovery/management/social/export)
2. Create file using Command base class pattern
3. Use `buildCommandOptions()` for options
4. Use `sendQuoteEmbed()` for displaying quotes
5. Use `db` module for database operations
6. Add tests in appropriate test file
7. Update help command if needed

### Modifying Database Schema

1. Update `src/schema-enhancement.js`
2. Update corresponding `db.js` methods
3. Add migration logic if needed
4. Test with fresh database
5. Update documentation

### Adding Response Helper

1. Add function to `src/utils/helpers/response-helpers.js` or in the appropriate sub-module
2. Add tests in `tests/unit/test-response-helpers.js` or in the appropriate sub-module test file
3. Export function
4. Update this guide with usage example

## Performance Guidelines

- Bot startup: Should be < 3 seconds
- Command response: Target < 200ms
- Database queries: Keep < 100ms
- Use async/await for all I/O operations
- Defer interaction replies if processing takes > 3 seconds

## Security Best Practices

- **Never commit** `.env` file or secrets
- **Always use** prepared statements for database queries
- **Validate** all user input before processing
- **Check permissions** before executing admin commands
- **Rate limit** sensitive operations if needed
- **Sanitize** user input in embeds and messages

## Version Information

**Repository Versions (as of January 27, 2026):**

| Repository | Package | Version | Latest Tag | Status |
|-----------|---------|---------|-----------|--------|
| necrobot-core | necrobot-core | 0.3.0 | v0.3.0 | ✅ Released |
| necrobot-utils | necrobot-utils | 0.2.2 | v0.2.2 | ✅ Released |
| necrobot-dashboard | necrobot-dashboard | 0.1.3 | v0.1.3 | ✅ Released |
| necrobot-commands | necrobot-commands | 0.1.0 | v0.1.0 | ✅ Released |

**Runtime Requirements:**
- **Node.js:** 22+ (minimum v22.0.0, npm >=10.0.0)
- **Discord.js:** 14.11.0
- **Database:** SQLite3 v5.1.7

**Last Updated:** January 27, 2026

**Phase Status:**
- **PHASE-01.0:** TDD Foundation ✅ Complete
- **PHASE-02.0:** Repository Synchronization ✅ Complete
- **PHASE-03.0+:** Future development phases

## Tips for Copilot Usage

- Reference existing commands as examples for similar functionality
- Always extend Command base class for new commands
- Consult docs/ folder for architectural decisions
- Check tests/ folder for testing patterns
- Follow the principle of minimal changes
- Maintain consistency with existing code style
- When in doubt, use response helpers and utility modules
