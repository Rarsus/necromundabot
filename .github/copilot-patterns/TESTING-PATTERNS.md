# Pattern: Testing Strategies

**Comprehensive testing approach covering unit, integration, and edge cases.**

## Test File Structure

**Co-locate tests with code in same workspace:**

```
repos/necrobot-commands/
├── src/commands/misc/help.js
├── tests/unit/test-help-command.test.js  ← Tests for help.js
└── tests/integration/test-command-registration.test.js
```

## Unit Test Template

```javascript
const assert = require('assert');
const MyModule = require('../src/my-module');

describe('MyModule', () => {
  let testData;

  beforeEach(() => {
    // Initialize test data
    testData = {
      validInput: { id: 1, name: 'Test' },
      invalidInput: { id: null, name: '' }
    };
  });

  afterEach(() => {
    // Cleanup (close databases, clear mocks, etc.)
  });

  describe('methodName()', () => {
    // Happy path
    it('should return expected result for valid input', () => {
      const result = MyModule.methodName(testData.validInput);
      assert.strictEqual(result.id, 1);
    });

    // Error scenarios
    it('should throw error for invalid input', () => {
      assert.throws(() => {
        MyModule.methodName(testData.invalidInput);
      }, /Expected error message/);
    });

    // Edge cases
    it('should handle edge case: null input', () => {
      const result = MyModule.methodName(null);
      assert.strictEqual(result, null);
    });
  });
});
```

## Testing Commands

```javascript
const assert = require('assert');

describe('HelpCommand', () => {
  let helpCommand;

  beforeEach(() => {
    // Fresh require for each test
    delete require.cache[require.resolve('../../src/commands/misc/help.js')];
    helpCommand = require('../../src/commands/misc/help.js');
  });

  describe('structure (CommandLoader requirements)', () => {
    it('should have name property', () => {
      assert.strictEqual(helpCommand.name, 'help');
    });

    it('should have description property', () => {
      assert.strictEqual(typeof helpCommand.description, 'string');
      assert.ok(helpCommand.description.length > 0);
    });

    it('should have data property', () => {
      assert.ok(helpCommand.data);
      assert.strictEqual(helpCommand.data.name, 'help');
    });

    it('should have executeInteraction method', () => {
      assert.strictEqual(typeof helpCommand.executeInteraction, 'function');
    });
  });

  describe('functionality', () => {
    it('should respond to interaction', async () => {
      const mockInteraction = {
        editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now() }),
        client: { commandLoader: { getCommandsByCategory: () => ({}) } }
      };

      await helpCommand.executeInteraction(mockInteraction);
      // If no exception, test passes
    });

    it('should handle no commands available', async () => {
      const mockInteraction = {
        editReply: async (msg) => {
          assert.ok(msg.includes('No commands available'));
          return { id: 'msg-123' };
        },
        client: { commandLoader: { getCommandsByCategory: () => ({}) } }
      };

      await helpCommand.executeInteraction(mockInteraction);
    });
  });
});
```

## Testing Services

```javascript
const assert = require('assert');
const DatabaseService = require('../../src/services/DatabaseService');

describe('DatabaseService', () => {
  let db;

  beforeEach(async () => {
    // Use in-memory SQLite for tests
    db = new DatabaseService(':memory:');
    await db.initialize();
  });

  afterEach(async () => {
    await db.close();
  });

  describe('getItem()', () => {
    it('should retrieve stored item', async () => {
      await db.insert('items', { id: 1, name: 'Test' });
      const item = await db.getItem(1);
      assert.strictEqual(item.name, 'Test');
    });

    it('should throw error for non-existent item', async () => {
      try {
        await db.getItem(999);
        assert.fail('Should have thrown');
      } catch (error) {
        assert.ok(error.message.includes('not found'));
      }
    });
  });
});
```

## Mocking Discord.js

```javascript
const mockInteraction = {
  // User info
  user: { id: 'user-123', username: 'TestUser' },
  
  // Guild/channel info
  guildId: 'guild-456',
  channelId: 'channel-789',
  
  // Reply methods
  reply: async (msg) => ({ id: 'msg-123', ...msg }),
  deferReply: async () => ({}),
  editReply: async (msg) => ({ id: 'msg-123', createdTimestamp: Date.now(), ...msg }),
  followUp: async (msg) => ({ id: 'msg-456', ...msg }),
  
  // Client
  client: {
    commandLoader: { getCommandsByCategory: () => ({}) },
    ws: { ping: 50 }
  }
};
```

## Mocking Services

```javascript
const mockDatabaseService = {
  getQuote: async (guildId, id) => ({
    id,
    guildId,
    text: 'Test quote',
    author: 'Test Author'
  }),
  
  addQuote: async (guildId, text, author) => ({
    id: 1,
    guildId,
    text,
    author
  })
};
```

## Integration Testing

**Test how components work together:**

```javascript
// tests/integration/test-command-workflow.js
const assert = require('assert');
const CommandLoader = require('../../src/core/CommandLoader');
const DatabaseService = require('../../src/services/DatabaseService');

describe('Full Command Workflow', () => {
  let loader;
  let db;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    loader = new CommandLoader(db);
  });

  it('should load commands and execute with database', async () => {
    const commands = loader.loadCommands();
    assert.ok(commands.length > 0);
    
    const pingCommand = commands.find(c => c.name === 'ping');
    assert.ok(pingCommand);
    
    const mockInteraction = {
      editReply: async (msg) => ({ id: 'msg-123' }),
      client: { ws: { ping: 50 } },
      createdTimestamp: Date.now()
    };
    
    await pingCommand.executeInteraction(mockInteraction);
  });
});
```

## Testing Error Scenarios

```javascript
describe('error handling', () => {
  it('should handle database connection error', async () => {
    const mockDb = {
      query: async () => { throw new Error('Connection failed'); }
    };
    const service = new MyService(mockDb);
    
    try {
      await service.getData();
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('Connection failed'));
    }
  });

  it('should handle timeout', async () => {
    const slowOperation = new Promise(resolve =>
      setTimeout(() => resolve('done'), 5000)
    );
    
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 100)
    );
    
    try {
      await Promise.race([slowOperation, timeout]);
      assert.fail('Should have timed out');
    } catch (error) {
      assert.strictEqual(error.message, 'Timeout');
    }
  });

  it('should handle invalid input gracefully', () => {
    assert.throws(() => {
      validateInput(null);
    }, /Input required/);
  });
});
```

## Running Tests

```bash
# All tests in all workspaces
npm test

# Specific workspace
npm test --workspace=repos/necrobot-commands

# Specific test file
npm test -- test-help-command.test.js

# Watch mode
npm run test:watch --workspace=repos/necrobot-core

# With coverage
npm run test:coverage --workspace=repos/necrobot-utils
```

## Coverage Standards

| Module Type | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| Core Services | 85%+ | 90%+ | 80%+ |
| Commands | 80%+ | 85%+ | 75%+ |
| Utilities | 90%+ | 95%+ | 85%+ |
| New Features | 90%+ | 95%+ | 85%+ |

## Test Checklist

Before committing:
- ✅ Tests cover happy path
- ✅ Tests cover error scenarios
- ✅ Tests cover edge cases
- ✅ All tests pass: `npm test`
- ✅ No ESLint errors: `npm run lint`
- ✅ Coverage meets thresholds
- ✅ Tests are deterministic (no random failures)
- ✅ Tests clean up after themselves (no side effects)

## Common Assertions

```javascript
// Equality
assert.strictEqual(actual, expected);
assert.deepStrictEqual(obj1, obj2);

// Existence
assert.ok(value);
assert(value, 'message');

// Errors
assert.throws(() => fn(), /error message/);
assert.rejects(async () => fn(), /error message/);

// Type checking
assert.strictEqual(typeof value, 'string');
assert.ok(Array.isArray(value));
```
