# Pattern: Test-Driven Development (TDD)

**ALL code changes require TDD workflow. This is NON-NEGOTIABLE.**

## Workflow: RED → GREEN → REFACTOR

```
1. RED Phase - Write tests first
   ✅ Create test file BEFORE implementation
   ✅ Write tests that fail (RED state)
   ✅ Tests define the contract/requirements
   ✅ Run tests: npm test

2. GREEN Phase - Implement code
   ✅ Write minimal code to pass tests
   ✅ Keep focus on functionality
   ✅ Run tests: npm test
   ✅ All tests PASS (GREEN state)

3. REFACTOR Phase - Improve quality
   ✅ Optimize code while keeping tests passing
   ✅ Improve readability and maintainability
   ✅ Run tests frequently to catch regressions
   ✅ Tests still PASS (GREEN state)
```

## Real Example

```javascript
// tests/unit/test-help-command.test.js (STEP 1 - RED phase)
const assert = require('assert');
describe('Help Command', () => {
  it('should have required name property', () => {
    assert.strictEqual(helpCommand.name, 'help');
  });
  // Test fails - command doesn't exist yet ✅ RED
});

// THEN: src/commands/misc/help.js (STEP 2 - GREEN phase)
module.exports = {
  name: 'help',  // Satisfies test
  description: 'Shows all available commands',
  data: new SlashCommandBuilder()...,
  async executeInteraction(interaction) { /* ... */ }
};

// npm test - All tests pass ✅ GREEN
```

## Coverage Requirements

| Module Type | Lines | Functions | Branches |
|-----------|-------|-----------|----------|
| Core Services | 85%+ | 90%+ | 80%+ |
| Commands | 80%+ | 85%+ | 75%+ |
| Utilities | 90%+ | 95%+ | 85%+ |
| New Features | 90%+ | 95%+ | 85%+ |

## Test Checklist (Before Every Commit)

- ✅ Test file created BEFORE implementation
- ✅ All public methods have test cases
- ✅ Happy path scenarios tested
- ✅ Error scenarios tested (all error types)
- ✅ Edge cases tested (boundary conditions, null/empty)
- ✅ Coverage thresholds met
- ✅ All tests PASS locally: `npm test`
- ✅ No ESLint errors: `npm run lint`

## ❌ VIOLATIONS (PR Rejection)

**Violation #1: Code before tests**
```
❌ WRONG: Create src/commands/my-command.js → Test manually → Later add tests
✅ RIGHT: Create tests first (RED) → Implement (GREEN) → Commit both
```

**Violation #2: Tests don't cover implementation**
```
❌ WRONG: Implement feature X, write tests that don't verify it
✅ RIGHT: Tests first verify X behavior, implementation makes tests pass
```

**Violation #3: Tests pass but coverage drops**
```
❌ WRONG: Add code without proportional test coverage
✅ RIGHT: New code coverage ≥ required thresholds
```

## Mocking Strategy

**Discord.js Mocking:**
```javascript
const mockInteraction = {
  user: { id: 'test-user-123', username: 'TestUser' },
  guildId: 'test-guild-456',
  reply: async (msg) => ({ id: 'msg-123', ...msg }),
  editReply: async (msg) => ({ id: 'msg-123', ...msg }),
};
```

**Service Mocking:**
```javascript
const mockService = {
  method: async (param) => ({ success: true, data: {} }),
};
```

**Database Testing:**
```javascript
// Use in-memory SQLite for isolated tests
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
```

## Testing Commands

```bash
# All workspaces
npm test

# One workspace
npm test --workspace=repos/necrobot-core

# Specific test file
npm test -- test-help-command.test.js

# With coverage
npm run test:coverage --workspace=repos/necrobot-commands
```
