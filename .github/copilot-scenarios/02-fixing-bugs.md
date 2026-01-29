# Scenario: Fixing Bugs

**When to use:** Reproducing and fixing a bug in existing code

## TDD First: Write a Failing Test

Before fixing the bug, write a test that reproduces it:

```javascript
// tests/unit/test-my-service.test.js
describe('MyService - Bug Fix', () => {
  it('should handle empty string input (BUG FIX)', () => {
    // This test currently FAILS - it reproduces the bug ✅ RED
    const result = service.parseInput('');
    assert.ok(result === null); // Expected behavior
  });
});
```

## Run Test to Confirm Failure

```bash
npm test --workspace=repos/necrobot-commands -- test-my-service.test.js
# Expected: Test FAILS (confirms bug exists)
```

## Fix the Code

Now fix the implementation to make the test pass:

```javascript
// src/services/MyService.js
class MyService {
  parseInput(input) {
    if (!input || input.trim() === '') {
      return null; // FIX: Handle empty string
    }
    return input.toUpperCase();
  }
}
```

## Verify Test Passes

```bash
npm test --workspace=repos/necrobot-commands -- test-my-service.test.js
# Expected: Test PASSES ✅ GREEN
```

## Check for Regressions

```bash
npm test --workspace=repos/necrobot-commands
# All tests should pass ✅
```

## Commit with Context

```bash
git commit -m "fix(service): Handle empty string input in parseInput

- Added test-my-service.test.js with failing test for empty string
- Updated parseInput() to return null for empty input
- Fixes bug where empty strings caused crash
- All tests passing"
```

## Complex Bug Fixes

**For multi-part bugs, test each part:**

```javascript
describe('Bug: Incorrect calculation in processData', () => {
  it('should calculate total correctly', () => {
    const result = service.calculateTotal([10, 20, 30]);
    assert.strictEqual(result, 60); // Was returning 50
  });

  it('should handle zero values', () => {
    const result = service.calculateTotal([0, 10, 20]);
    assert.strictEqual(result, 30);
  });

  it('should handle negative values', () => {
    const result = service.calculateTotal([10, -5, 20]);
    assert.strictEqual(result, 25);
  });
});
```

## Bug in Integration

If bug is in cross-module code:

1. Write integration test that reproduces bug
2. Fix the underlying cause (not a workaround)
3. Verify test passes AND no regressions

```javascript
// tests/integration/test-command-with-database.js
describe('Bug: Command fails to save data', () => {
  let db;
  let command;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    command = require('../../src/commands/misc/save-data.js');
  });

  it('should save data to database (bug fix)', async () => {
    const mockInteraction = {
      options: { getString: () => 'test data' },
      editReply: async (msg) => ({ id: 'msg-123' })
    };

    // This test currently fails - reproduces the bug
    await command.executeInteraction(mockInteraction);
    
    const saved = await db.getData('test data');
    assert.ok(saved); // Should find saved data
  });
});
```

## Checklist

- [ ] Test written first (reproduces bug)
- [ ] Test fails initially (RED)
- [ ] Bug fix implemented
- [ ] Test now passes (GREEN)
- [ ] No regressions in other tests
- [ ] Linter passes
- [ ] Commit explains bug and fix
- [ ] **PR title uses `fix:` prefix** (e.g., `fix: resolve database timeout issue`)

## PR Title Format Reminder

When creating a pull request for a bug fix, use the format:

```
fix: <concise description of what was fixed>
```

Examples:
- ✅ `fix: resolve database connection timeout`
- ✅ `fix: correct permission check in gang delete`
- ✅ `fix: prevent crash on empty string input`
- ❌ `Fix database connection timeout` (missing colon)
- ❌ `Fixed database timeout` (wrong tense)

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## See Also

- [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Testing patterns
- [ERROR-HANDLING.md](../copilot-patterns/ERROR-HANDLING.md) - Error handling patterns
- [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) - Advanced testing
- [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) - PR title requirements
