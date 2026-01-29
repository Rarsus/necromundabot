# Scenario: Cross-Module Changes

**When to use:** Making changes that affect multiple workspaces (necrobot-core, necrobot-utils, necrobot-commands)

## Prerequisites

- ✅ Understand [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Workspace dependencies
- ✅ Review [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Testing across modules
- ✅ All tests pass in all workspaces

## Why Cross-Module Changes Are Risky

```
Change in necrobot-utils → Breaks necrobot-commands (depends on utils)
                        → Breaks necrobot-core (depends on utils)

✅ Testing all affected modules prevents breakage
```

## Step 1: Identify Affected Modules

Ask: "Which workspaces depend on what I'm changing?"

```
necrobot-core
  ├── Exports: CommandLoader, CommandRegistrationHandler, InteractionHandler
  └── Depends on: necrobot-utils

necrobot-utils
  ├── Exports: DatabaseService, GuildAwareDatabaseService, response helpers
  └── Depends on: (none)

necrobot-commands
  ├── Exports: All Discord commands
  └── Depends on: necrobot-core, necrobot-utils

necrobot-dashboard
  ├── Exports: Web UI
  └── Depends on: (none)
```

**Example Changes & Affected Modules:**

| Change | Affects |
|--------|---------|
| Modify `DatabaseService` in utils | necrobot-core, necrobot-commands |
| Modify `response-helpers` in utils | necrobot-commands |
| Modify `CommandLoader` in core | necrobot-commands |
| Modify command structure | Only necrobot-commands |

## Step 2: Write Tests for New Behavior (TDD)

Write tests in ALL affected modules:

```bash
# If changing DatabaseService in necrobot-utils
repos/necrobot-utils/tests/unit/test-database-service.test.js ← Update here

# If other modules use DatabaseService, write integration tests
repos/necrobot-core/tests/unit/test-command-loader.test.js ← May use DatabaseService
repos/necrobot-commands/tests/integration/test-command-with-database.test.js ← Affected
```

**Example: Add parameter to DatabaseService**

```javascript
// repos/necrobot-utils/tests/unit/test-database-service.test.js (WRITE FIRST)
describe('DatabaseService with timeout', () => {
  it('should accept timeout parameter', async () => {
    const db = new DatabaseService(':memory:', { timeout: 5000 });
    assert.strictEqual(db.timeout, 5000);
  });

  it('should use timeout in queries', async () => {
    const db = new DatabaseService(':memory:', { timeout: 100 });
    const start = Date.now();
    try {
      await db.query('SELECT sleep(1)');  // Long query
    } catch (err) {
      assert(Date.now() - start < 200);  // Should timeout quickly
    }
  });
});

// repos/necrobot-commands/tests/integration/test-command-database.test.js (WRITE FIRST)
describe('Commands with database timeout', () => {
  it('should handle database timeout gracefully', async () => {
    const mockInteraction = { /* ... */ };
    const db = new DatabaseService(':memory:', { timeout: 100 });
    
    // Should not crash
    await command.executeInteraction(mockInteraction);
  });
});
```

## Step 3: Run Tests (RED Phase)

```bash
# Tests should FAIL initially
npm test --workspace=repos/necrobot-utils
npm test --workspace=repos/necrobot-core
npm test --workspace=repos/necrobot-commands

# Expected: Tests fail (RED phase)
```

## Step 4: Implement Changes (GREEN Phase)

Update the code in the module being changed:

```javascript
// repos/necrobot-utils/src/services/DatabaseService.js
class DatabaseService {
  constructor(dbPath, options = {}) {
    this.dbPath = dbPath;
    this.timeout = options.timeout || 5000;  // NEW parameter
    // ...
  }

  async query(sql, params) {
    // Use this.timeout in query execution
    // ...
  }
}
```

## Step 5: Run Tests in All Affected Modules

```bash
# Test the module where you made changes
npm test --workspace=repos/necrobot-utils

# Expected: Tests pass (GREEN)

# Test modules that DEPEND on what you changed
npm test --workspace=repos/necrobot-core
npm test --workspace=repos/necrobot-commands

# Expected: All pass (GREEN)
```

## Step 6: Test Workspace Integration

Run all tests across all workspaces:

```bash
# Run everything
npm test

# Expected: All tests pass ✅
# Tests in all 4 workspaces should pass
```

## Step 7: Linting All Modules

```bash
# Lint everything
npm run lint

# Expected: ✅ No errors

# If lint fails, fix in the specific module
npm run lint:fix --workspace=repos/necrobot-utils
```

## Step 8: Test in Docker (Full Integration)

```bash
# Docker uses all 4 modules together
docker-compose down && docker system prune -f
docker-compose up --build -d

# Wait for startup
sleep 10

# Check logs
docker logs necromundabot | tail -30

# Expected: ✅ Bot starts successfully
# ✅ All commands load
# ✅ No errors
```

## Example: Full Cross-Module Workflow

### Scenario: Add new response helper used by commands

**Step 1: Identify affected modules**
- Change: Add new function to `response-helpers.js` in necrobot-utils
- Affects: necrobot-commands (will use the new helper)

**Step 2: Write tests (TDD - RED)**

```javascript
// repos/necrobot-utils/tests/unit/test-response-helpers.test.js
describe('sendConfirmationEmbed', () => {
  it('should create confirmation embed with title and message', () => {
    const embed = sendConfirmationEmbed('Operation Complete', 'Quote added');
    assert.strictEqual(embed.title, 'Operation Complete');
    assert.ok(embed.data.description.includes('Quote added'));
  });
});

// repos/necrobot-commands/tests/unit/test-add-quote-command.test.js
describe('add-quote command with new helper', () => {
  it('should use sendConfirmationEmbed for success response', async () => {
    const mockInteraction = { /* ... */ };
    await command.executeInteraction(mockInteraction);
    // Verify confirmation embed was sent
  });
});
```

**Step 3: Implement (GREEN)**

```javascript
// repos/necrobot-utils/src/utils/helpers/response-helpers.js
function sendConfirmationEmbed(title, message) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(message)
    .setColor(0x00ff00);  // Green
}

module.exports = { sendConfirmationEmbed, /* ... other exports */ };
```

**Step 4: Update commands to use it**

```javascript
// repos/necrobot-commands/src/commands/quote-management/add-quote.js
const { sendConfirmationEmbed } = require('necrobot-utils');

module.exports = {
  // ... other properties
  async executeInteraction(interaction) {
    // ... create quote ...
    const embed = sendConfirmationEmbed('Quote Added', 'Your quote has been saved');
    await interaction.editReply({ embeds: [embed] });
  }
};
```

**Step 5: Test all modules**

```bash
npm test --workspace=repos/necrobot-utils    # ✅ New test passes
npm test --workspace=repos/necrobot-commands # ✅ Command tests pass
npm test                                      # ✅ All tests pass
```

## Critical Gotchas

### Gotcha 1: Dependency Version Mismatch

```json
{
  "dependencies": {
    "necrobot-utils": "*"    // ✅ CORRECT: Workspace version
  }
}

// ❌ WRONG:
{
  "dependencies": {
    "necrobot-utils": "^0.2.0"  // WRONG: Fixed version breaks workspace
  }
}
```

See [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) for details.

### Gotcha 2: Breaking API Changes

```javascript
// ❌ WRONG: Breaking change without deprecation
// OLD: sendResponse(message, color)
// NEW: sendResponse(config) where config = { message, color, title }

// ✅ CORRECT: Maintain backward compatibility first
function sendResponse(messageOrConfig, color = null) {
  if (typeof messageOrConfig === 'string') {
    // OLD API: sendResponse('message', color)
    return oldImplementation(messageOrConfig, color);
  } else {
    // NEW API: sendResponse({ message, color, title })
    return newImplementation(messageOrConfig);
  }
}
```

### Gotcha 3: Incomplete Testing

```bash
# ❌ WRONG: Test only the module you changed
npm test --workspace=repos/necrobot-utils

# ✅ CORRECT: Test all modules
npm test

# Then test in Docker
docker-compose up --build -d
docker logs necromundabot
```

## Cross-Module Testing Checklist

- [ ] All affected modules identified
- [ ] Tests written in ALL affected modules (TDD)
- [ ] Tests fail initially (RED phase)
- [ ] Changes implemented (GREEN phase)
- [ ] All module tests pass
- [ ] Full test suite passes: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Docker builds and starts successfully
- [ ] Bot logs show successful startup
- [ ] No "Invalid command structure" warnings

## Commit Message Example

```bash
git commit -m "feat: Add confirmation embed helper for commands

- Added sendConfirmationEmbed() to response-helpers in necrobot-utils
- Updated add-quote and update-quote commands to use new helper
- Tests added in both necrobot-utils and necrobot-commands
- All tests passing across all workspaces
- Docker tested and working"
```

## When to Split into Multiple Commits

For major cross-module changes, consider multiple commits:

```bash
# Commit 1: Add helper in necrobot-utils (with tests)
git commit -m "feat(utils): Add confirmation embed helper

- New sendConfirmationEmbed() function in response-helpers
- Complete test coverage
- Maintains backward compatibility"

# Commit 2: Update commands to use new helper
git commit -m "refactor(commands): Use new confirmation helper

- Updated add-quote command to use sendConfirmationEmbed()
- Updated update-quote command
- All tests passing"
```

## PR Title Format Reminder

When creating a pull request for cross-module changes, use appropriate format:

```
refactor: <description>  # For restructuring across modules
feat: <description>  # For new features spanning modules
fix: <description>  # For fixes affecting multiple modules
```

Examples:
- ✅ `refactor: consolidate database access across modules`
- ✅ `feat: add shared validation utilities`
- ✅ `fix: resolve circular dependency in service imports`

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## See Also

- [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Workspace dependencies & imports
- [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Testing workflow
- [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) - Unit & integration testing
- [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) - PR title requirements
