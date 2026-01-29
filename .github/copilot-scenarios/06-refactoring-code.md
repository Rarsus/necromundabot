# Scenario: Refactoring Code

**When to use:** Improving code without changing functionality (renaming, restructuring, simplifying)

## Prerequisites

- ✅ Full test coverage of code being refactored
- ✅ Review [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - RED→GREEN→REFACTOR phase
- ✅ All existing tests pass before starting

## Critical: Don't Skip Tests

```bash
# Get baseline
npm test --workspace=repos/YOUR_MODULE

# MUST show: All tests passing before refactoring
# ✅ X tests passing
# ❌ 0 failures
```

## Step 1: Identify Code to Refactor

Choose one focused area:

```javascript
// ❌ DON'T refactor everything at once
// ✅ DO refactor one file, function, or pattern at a time

// Example: Refactor this repetitive code
async function addQuote(guildId, content, author) {
  const db = await connectToDatabase();
  await db.run('INSERT INTO quotes...', [guildId, content, author]);
  await db.close();
  return quote;
}

async function deleteQuote(guildId, quoteId) {
  const db = await connectToDatabase();
  await db.run('DELETE FROM quotes...', [guildId, quoteId]);
  await db.close();
  return deleted;
}
```

## Step 2: Create Tests for Current Behavior

Before changing a single line, ensure behavior is tested:

```javascript
// tests/unit/test-quote-service.test.js
describe('QuoteService (current behavior)', () => {
  it('should add quote to database', async () => {
    const quote = await service.addQuote('guild-123', 'content', 'author');
    assert.strictEqual(quote.guildId, 'guild-123');
  });

  it('should delete quote from database', async () => {
    const result = await service.deleteQuote('guild-123', 'quote-456');
    assert.strictEqual(result.success, true);
  });
});
```

Run tests (should pass):
```bash
npm test -- tests/unit/test-quote-service.test.js

# Must show: ✅ All tests passing
```

## Step 3: Apply Refactoring (Keep Tests Passing)

Now refactor with confidence:

```javascript
// REFACTOR PHASE: Extract common database operations
class QuoteService {
  constructor(db) {
    this.db = db;
  }

  async addQuote(guildId, content, author) {
    // Simplified, extracted database logic to helper
    return this.db.insert('quotes', { guildId, content, author });
  }

  async deleteQuote(guildId, quoteId) {
    // Simplified, using consistent method
    return this.db.delete('quotes', { guildId, id: quoteId });
  }

  // New internal helper method (extracted from both functions)
  async _withDatabase(callback) {
    const db = await this.db.connect();
    try {
      return await callback(db);
    } finally {
      await db.close();
    }
  }
}
```

## Step 4: Run Tests After Every Change

```bash
# Run tests frequently during refactoring
npm test -- tests/unit/test-quote-service.test.js

# If test fails:
# ❌ Revert changes
# ❌ Identify why refactoring broke behavior
# ❌ Fix and try again

# Once tests pass:
# ✅ Continue refactoring
# ✅ Tests verify behavior unchanged
```

## Step 5: Verify Behavior Unchanged

```bash
# Run the refactored code in a test scenario
npm test -- tests/integration/test-quote-workflow.test.js

# Expected: All integration tests pass
# This verifies end-to-end behavior is unchanged
```

## Step 6: Check Linting

```bash
npm run lint --workspace=repos/YOUR_MODULE

# Expected: ✅ No errors
# Check style consistency with new code
```

## Step 7: Check Coverage

```bash
npm run test:coverage --workspace=repos/YOUR_MODULE

# Expected: Coverage maintained or improved
# Should not decrease coverage %
```

## Refactoring Examples

### Example 1: Extract Helper Function

```javascript
// BEFORE (repetitive)
async function executeCommand(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('Result')
    .setColor(0x2F3136)
    .addFields({ name: 'Status', value: 'Success' });
  
  await interaction.editReply({ embeds: [embed] });
}

// AFTER (extracted, cleaner)
function buildResultEmbed(status) {
  return new EmbedBuilder()
    .setTitle('Result')
    .setColor(0x2F3136)
    .addFields({ name: 'Status', value: status });
}

async function executeCommand(interaction) {
  const embed = buildResultEmbed('Success');
  await interaction.editReply({ embeds: [embed] });
}
```

### Example 2: Simplify Naming

```javascript
// BEFORE (unclear)
const x = await db.getByGuildAndType('guild-123', 'quote');

// AFTER (clear intent)
const guildQuotes = await db.getQuotesByGuild('guild-123');
```

### Example 3: Extract Class

```javascript
// BEFORE (mixed concerns)
class Command {
  async handle(interaction) {
    const quotes = await this.db.query('SELECT * FROM quotes...');
    const formatted = quotes.map(q => `${q.content} - ${q.author}`);
    await interaction.reply(formatted.join('\n'));
  }
}

// AFTER (separated concerns)
class QuoteFormatter {
  format(quotes) {
    return quotes.map(q => `${q.content} - ${q.author}`).join('\n');
  }
}

class Command {
  async handle(interaction) {
    const quotes = await this.db.query('SELECT * FROM quotes...');
    const formatted = new QuoteFormatter().format(quotes);
    await interaction.reply(formatted);
  }
}
```

## Refactoring Patterns

### Safe Refactoring Checklist

- [ ] Current tests all pass
- [ ] Tests cover the behavior being refactored
- [ ] Refactoring is small and focused (one concern)
- [ ] Tests run and pass after each change
- [ ] No behavior changes (tests verify this)
- [ ] Linting passes
- [ ] Coverage maintained
- [ ] Code is more readable/maintainable

## What NOT to Refactor

**❌ DON'T mix refactoring with feature changes:**
```javascript
// WRONG: Refactoring + new feature in one commit
async function addQuote(guildId, content, author, tags) {
  // Extracted logic (refactoring)
  return this.db.insert('quotes', {
    guildId, content, author, tags  // NEW feature: tags
  });
}

// RIGHT: Separate commits
// Commit 1: Refactor extraction
// Commit 2: Add tags feature
```

**❌ DON'T refactor without tests:**
```javascript
// WRONG: Refactor without verifying behavior
function oldFunction() { /* ... */ }
// Change to: newFunction() { /* ... */ }
// Hope it still works

// RIGHT: Tests verify behavior unchanged
// Tests pass before refactoring
// Tests pass after refactoring
```

## Troubleshooting

**Issue:** Test fails after refactoring  
**Solution:** Revert change and understand why it broke

**Issue:** New code has lower test coverage  
**Solution:** Add tests for refactored code paths

**Issue:** Linting fails on refactored code  
**Solution:** Follow project style guide (run `npm run lint:fix`)

## Commit Message Example

```bash
git commit -m "refactor: Extract QuoteFormatter class

- Extracted quote formatting logic into QuoteFormatter class
- Reduces coupling between database and formatting concerns
- No behavior changes (all tests passing)
- Improves testability of formatting logic
- Closes related technical debt"
```

## PR Title Format Reminder

When creating a pull request for refactoring, use the format:

```
refactor: <description of what was refactored>
```

Examples:
- ✅ `refactor: extract database logic to service layer`
- ✅ `refactor: consolidate error handling in commands`
- ✅ `refactor: simplify gang creation workflow`

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## See Also

- [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - REFACTOR phase details
- [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) - Ensuring test coverage
- [COMMAND-STRUCTURE.md](../copilot-patterns/COMMAND-STRUCTURE.md) - Structure patterns
- [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) - PR title requirements
