# Scenario: Database Operations

**When to use:** Creating or modifying database services, queries, or schema

## Prerequisites

- ✅ Read [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - How imports work
- ✅ Read [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Tests first
- ✅ Read [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md#testing-services) - Service testing

## Step 1: Write Test First (RED)

```javascript
// repos/necrobot-utils/tests/unit/test-quote-service.test.js
const assert = require('assert');
const DatabaseService = require('../../src/services/DatabaseService');
const QuoteService = require('../../src/services/QuoteService');

describe('QuoteService', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    // Use in-memory database for isolated tests
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  afterEach(async () => {
    await db.close();
  });

  describe('addQuote()', () => {
    it('should add quote to database', async () => {
      const quote = await quoteService.addQuote(
        'guild-123',
        'Great quote',
        'Famous Person'
      );

      assert.strictEqual(quote.guildId, 'guild-123');
      assert.strictEqual(quote.text, 'Great quote');
      assert.strictEqual(quote.author, 'Famous Person');
      assert.ok(quote.id); // Should have generated ID
    });

    it('should require guild context', async () => {
      try {
        await quoteService.addQuote(null, 'text', 'author');
        assert.fail('Should have thrown');
      } catch (error) {
        assert.ok(error.message.includes('guild'));
      }
    });
  });

  describe('getQuotesByGuild()', () => {
    it('should return only quotes for specific guild', async () => {
      await quoteService.addQuote('guild-1', 'Quote 1', 'Author 1');
      await quoteService.addQuote('guild-2', 'Quote 2', 'Author 2');

      const guild1Quotes = await quoteService.getQuotesByGuild('guild-1');
      assert.strictEqual(guild1Quotes.length, 1);
      assert.strictEqual(guild1Quotes[0].text, 'Quote 1');
    });

    it('should return empty array for guild with no quotes', async () => {
      const quotes = await quoteService.getQuotesByGuild('empty-guild');
      assert.deepStrictEqual(quotes, []);
    });
  });
});
```

## Step 2: Run Test (Verify RED)

```bash
npm test --workspace=repos/necrobot-utils -- test-quote-service.test.js
# Expected: Tests FAIL ✅ RED (service doesn't exist yet)
```

## Step 3: Implement Service (GREEN)

```javascript
// repos/necrobot-utils/src/services/QuoteService.js
class QuoteService {
  constructor(db) {
    if (!db) throw new Error('DatabaseService required');
    this.db = db;
  }

  async addQuote(guildId, text, author) {
    if (!guildId) {
      throw new Error('Guild context required');
    }
    if (!text || !author) {
      throw new Error('Text and author required');
    }

    const id = Date.now(); // Simple ID generation
    await this.db.run(
      'INSERT INTO quotes (id, guildId, text, author) VALUES (?, ?, ?, ?)',
      [id, guildId, text, author]
    );

    return { id, guildId, text, author };
  }

  async getQuotesByGuild(guildId) {
    if (!guildId) {
      throw new Error('Guild context required');
    }

    const quotes = await this.db.all(
      'SELECT * FROM quotes WHERE guildId = ?',
      [guildId]
    );

    return quotes || [];
  }
}

module.exports = QuoteService;
```

## Step 4: Export Service

Update `repos/necrobot-utils/src/index.js`:

```javascript
const QuoteService = require('./services/QuoteService');

module.exports = {
  DatabaseService: require('./services/DatabaseService'),
  QuoteService,
  // ... other exports
};
```

## Step 5: Run Tests (Verify GREEN)

```bash
npm test --workspace=repos/necrobot-utils -- test-quote-service.test.js
# Expected: All tests PASS ✅ GREEN
```

## Step 6: Use Service in Commands

Now commands can use the service:

```javascript
// repos/necrobot-commands/src/commands/misc/add-quote.js
const { QuoteService } = require('necrobot-utils');
const { DatabaseService } = require('necrobot-utils');

module.exports = {
  name: 'add-quote',
  description: 'Add a quote to the database',
  data: new SlashCommandBuilder()
    .setName('add-quote')
    .setDescription('Add a quote')
    .addStringOption(o => o.setName('text').setRequired(true))
    .addStringOption(o => o.setName('author').setRequired(true)),
  
  async executeInteraction(interaction) {
    const db = new DatabaseService(); // Or use shared instance
    const quoteService = new QuoteService(db);
    
    const text = interaction.options.getString('text');
    const author = interaction.options.getString('author');
    
    const quote = await quoteService.addQuote(
      interaction.guildId,
      text,
      author
    );
    
    await interaction.editReply(`Quote #${quote.id} added!`);
  }
};
```

## Important: Guild Context

**All database operations must include guildId for isolation:**

```javascript
// ✅ CORRECT - Guild-aware
const quotes = await quoteService.getQuotesByGuild(interaction.guildId);

// ❌ WRONG - No guild isolation
const quotes = await db.all('SELECT * FROM quotes');
```

## Database Schema

Update schema if adding new tables:

```javascript
// repos/necrobot-utils/src/schema.js
const schema = {
  quotes: `
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY,
      guildId TEXT NOT NULL,
      text TEXT NOT NULL,
      author TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guildId, id)
    )
  `
};
```

## Testing Tips

- Use `:memory:` database in tests (fast, isolated)
- Always clean up after tests (close database)
- Test with and without guild context
- Test edge cases (null, empty strings, duplicates)
- Test error scenarios

## Checklist

- [ ] Test file created first
- [ ] Tests fail initially (RED)
- [ ] Service implemented
- [ ] Tests pass (GREEN)
- [ ] Service exported from index.js
- [ ] Guild context enforced
- [ ] No ESLint errors
- [ ] All workspace tests pass

## See Also

- [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Import/export patterns
- [TESTING-PATTERNS.md](../copilot-patterns/TESTING-PATTERNS.md) - Service testing
- [ERROR-HANDLING.md](../copilot-patterns/ERROR-HANDLING.md) - Error handling
