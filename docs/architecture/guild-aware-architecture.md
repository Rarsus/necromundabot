# Guild-Aware Architecture

## Overview

Guild-aware architecture is a **mandatory design principle** in NecromundaBot that enforces explicit guild context for every data operation. This ensures data isolation, prevents cross-guild access, and supports multi-guild deployments.

## Why Guild-Aware?

### Multi-Guild Problem

Discord bots serve multiple guilds (servers) simultaneously. Without proper isolation:

```javascript
// ❌ DANGEROUS - No guild context
async function getQuotes() {
  return db.getMany('SELECT * FROM quotes');  // ← Returns ALL quotes from ALL guilds!
}

// Usage in Guild A
const quotes = await getQuotes();  // ← Accidentally gets Guild B's quotes!
```

### Guild-Aware Solution

```javascript
// ✅ SAFE - Explicit guild context
async function getQuotes(guildId) {
  return db.getMany(
    'SELECT * FROM quotes WHERE guild_id = ?',
    [guildId]
  );
}

// Usage in Guild A
const quotes = await getQuotes(interaction.guildId);  // ← Only Guild A's quotes
```

## Core Principles

### 1. Mandatory Guild Context

**Every data operation MUST include guild context:**

```javascript
// Service layer
class QuoteService {
  // ❌ WRONG - No guild parameter
  async getQuotes() {
    return this.db.getMany('SELECT * FROM quotes');
  }

  // ✅ CORRECT - Guild required
  async getQuotes(guildId) {
    if (!guildId) throw new Error('Guild ID is required');
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }
}
```

### 2. Guild Context from Discord

Always extract guild context from Discord interaction:

```javascript
// Command handler
class GetQuoteCommand extends CommandBase {
  async executeInteraction(interaction) {
    // ✅ Get guild context from interaction
    const guildId = interaction.guildId;

    if (!guildId) {
      return sendError(interaction, 'This command only works in servers');
    }

    // Pass guild context to service
    const quotes = await quoteService.getQuotes(guildId);
  }
}
```

### 3. Guild Validation

Always validate guild context before accessing data:

```javascript
class QuoteService {
  async getQuotes(guildId) {
    // Validate guild context exists
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    // Validate guild context is string/valid format
    if (typeof guildId !== 'string' || guildId.length === 0) {
      throw new Error('Invalid guild ID format');
    }

    // Safe to query
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }
}
```

## Database Schema

### Guild Context in Tables

Every table includes `guild_id` as mandatory context:

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,      -- ← Mandatory guild context
  content TEXT NOT NULL,
  author TEXT,
  created_at DATETIME
);

CREATE TABLE ratings (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,      -- ← Mandatory guild context
  quote_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER,
  FOREIGN KEY(quote_id) REFERENCES quotes(id)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,      -- ← Mandatory guild context
  name TEXT NOT NULL,
  UNIQUE(guild_id, name)
);
```

### Guild-Scoped Indexes

Indexes enable efficient guild-filtered queries:

```sql
-- Every query starts with guild_id filter
CREATE INDEX idx_quotes_guild ON quotes(guild_id);
CREATE INDEX idx_ratings_guild ON ratings(guild_id, user_id);
CREATE INDEX idx_tags_guild ON tags(guild_id, name);

-- Query pattern: Always filter by guild first
SELECT * FROM quotes WHERE guild_id = ? ORDER BY created_at DESC;
```

## Service Layer Implementation

### Guild-Aware Database Service

Low-level service enforces guild context:

```javascript
class GuildAwareDatabaseService {
  constructor(db) {
    this.db = db;
  }

  async getGuildQuotes(guildId) {
    // Enforce guild context
    if (!guildId) throw new Error('Guild ID is required');

    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ? ORDER BY created_at DESC',
      [guildId]
    );
  }

  async addGuildQuote(guildId, content, author) {
    // Enforce guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Validate input
    if (!content) throw new Error('Content required');

    // Insert with explicit guild context
    return this.db.executeQuery(
      'INSERT INTO quotes (guild_id, content, author) VALUES (?, ?, ?)',
      [guildId, content, author]
    );
  }

  async deleteGuildQuote(guildId, quoteId) {
    // Enforce guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Query with guild context to prevent deletion of other guild's quotes
    return this.db.executeQuery(
      'DELETE FROM quotes WHERE id = ? AND guild_id = ?',
      [quoteId, guildId]
    );
  }

  async getGuildRatings(guildId, quoteId) {
    // Double-check guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Verify quote belongs to this guild before returning ratings
    const quote = await this.db.getOne(
      'SELECT * FROM quotes WHERE id = ? AND guild_id = ?',
      [quoteId, guildId]
    );

    if (!quote) {
      throw new Error('Quote not found in this guild');
    }

    return this.db.getMany(
      'SELECT * FROM ratings WHERE quote_id = ? AND guild_id = ?',
      [quoteId, guildId]
    );
  }
}
```

### Guild-Aware Business Service

Higher-level service adds business logic while maintaining guild context:

```javascript
class QuoteService {
  constructor(db) {
    this.db = db;
  }

  // Public API - always requires guildId
  async getQuotes(guildId) {
    // Validate guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Use guild-aware database service
    return this.db.getGuildQuotes(guildId);
  }

  async addQuote(guildId, content, author) {
    // Validate guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Validate business rules
    if (!content || content.trim().length === 0) {
      throw new Error('Quote content cannot be empty');
    }

    if (content.length > 2000) {
      throw new Error('Quote is too long (max 2000 characters)');
    }

    // Delegate to guild-aware database service
    return this.db.addGuildQuote(guildId, content, author);
  }

  async getTopQuotes(guildId, limit = 10) {
    // Validate guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Complex business logic with guild context
    return this.db.getMany(
      `SELECT q.*, 
              COUNT(r.id) as rating_count,
              COALESCE(AVG(r.rating), 0) as avg_rating
       FROM quotes q
       LEFT JOIN ratings r ON q.id = r.quote_id AND r.guild_id = ?
       WHERE q.guild_id = ?
       GROUP BY q.id
       HAVING rating_count > 0
       ORDER BY avg_rating DESC
       LIMIT ?`,
      [guildId, guildId, limit]
    );
  }

  async searchQuotes(guildId, searchTerm) {
    // Validate guild context
    if (!guildId) throw new Error('Guild ID is required');

    // Validate search input
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term cannot be empty');
    }

    // Search within guild only
    return this.db.getMany(
      `SELECT q.*,
              COALESCE(AVG(r.rating), 0) as avg_rating
       FROM quotes q
       LEFT JOIN ratings r ON q.id = r.quote_id
       WHERE q.guild_id = ? AND q.content LIKE ?
       GROUP BY q.id
       ORDER BY avg_rating DESC`,
      [guildId, `%${searchTerm}%`]
    );
  }

  async rateQuote(guildId, quoteId, userId, rating) {
    // Validate all context
    if (!guildId) throw new Error('Guild ID is required');
    if (!userId) throw new Error('User ID is required');

    // Validate quote belongs to this guild
    const quote = await this.db.getOne(
      'SELECT * FROM quotes WHERE id = ? AND guild_id = ?',
      [quoteId, guildId]
    );

    if (!quote) {
      throw new Error('Quote not found in this guild');
    }

    // Validate rating value
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Insert rating with guild context
    return this.db.executeQuery(
      `INSERT INTO ratings (guild_id, quote_id, user_id, rating)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(quote_id, user_id) DO UPDATE SET rating = ?`,
      [guildId, quoteId, userId, rating, rating]
    );
  }
}
```

## Command Implementation

### Extracting Guild Context

```javascript
class RandomQuoteCommand extends CommandBase {
  async executeInteraction(interaction) {
    // ✅ Extract guild context from interaction
    const guildId = interaction.guildId;

    // ✅ Validate guild context
    if (!guildId) {
      return sendError(
        interaction,
        'This command only works in servers'
      );
    }

    try {
      // ✅ Pass guild context to service
      const quote = await quoteService.getRandomQuote(guildId);

      if (!quote) {
        return sendError(interaction, 'No quotes in this server yet');
      }

      return sendQuoteEmbed(interaction, quote, 'Random Quote');
    } catch (error) {
      // Error handling (CommandBase may also handle)
      logger.error(error);
      throw error;
    }
  }
}
```

### Guild Validation Middleware

```javascript
// necrobot-core/src/middleware/guildValidator.js
function requireGuild(commandHandler) {
  return async (interaction) => {
    // Check guild context exists
    if (!interaction.guildId) {
      return sendError(
        interaction,
        'This command only works in servers, not DMs'
      );
    }

    // Continue with guild-aware handler
    return commandHandler(interaction);
  };
}

// Usage
let handler = async (interaction) => {
  // At this point, guildId is guaranteed to exist
  const guildId = interaction.guildId;
};

handler = requireGuild(handler);
```

## Testing Guild-Aware Code

### Unit Tests with Guild Context

```javascript
describe('QuoteService - Guild Awareness', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  describe('Guild Context Validation', () => {
    it('should throw error when guild ID is missing', async () => {
      await expect(
        quoteService.addQuote(null, 'Quote', 'Author')
      ).rejects.toThrow('Guild ID is required');
    });

    it('should throw error when guild ID is empty', async () => {
      await expect(
        quoteService.addQuote('', 'Quote', 'Author')
      ).rejects.toThrow();
    });

    it('should throw error when guild ID is invalid type', async () => {
      await expect(
        quoteService.addQuote(12345, 'Quote', 'Author')
      ).rejects.toThrow();
    });
  });

  describe('Guild Isolation', () => {
    it('should not return quotes from other guilds', async () => {
      // Add quotes to Guild A
      await quoteService.addQuote('guild-a', 'Quote A1', 'Author');
      await quoteService.addQuote('guild-a', 'Quote A2', 'Author');

      // Add quotes to Guild B
      await quoteService.addQuote('guild-b', 'Quote B1', 'Author');

      // Get quotes from Guild A
      const quotesA = await quoteService.getQuotes('guild-a');

      // Should only return Guild A's quotes
      expect(quotesA).toHaveLength(2);
      expect(quotesA.every(q => q.guild_id === 'guild-a')).toBe(true);
    });

    it('should prevent deleting other guild\'s quotes', async () => {
      // Add quote to Guild A
      const quoteA = await quoteService.addQuote('guild-a', 'Quote', 'Author');

      // Try to delete from Guild B's context
      await quoteService.deleteQuote('guild-b', quoteA.id);

      // Verify quote still exists (not deleted)
      const quote = await db.getOne(
        'SELECT * FROM quotes WHERE id = ?',
        [quoteA.id]
      );

      expect(quote).toBeDefined();
    });

    it('should validate quote belongs to guild before rating', async () => {
      // Add quote to Guild A
      const quoteA = await quoteService.addQuote('guild-a', 'Quote', 'Author');

      // Try to rate from Guild B's context
      await expect(
        quoteService.rateQuote('guild-b', quoteA.id, 'user-123', 5)
      ).rejects.toThrow('Quote not found in this guild');
    });
  });

  describe('Guild-Aware Operations', () => {
    it('should add quote with correct guild context', async () => {
      const quote = await quoteService.addQuote(
        'guild-123',
        'Test quote',
        'Test Author'
      );

      expect(quote.guild_id).toBe('guild-123');
    });

    it('should search only within guild', async () => {
      // Add quotes to multiple guilds
      await quoteService.addQuote('guild-a', 'Hello world', 'Author A');
      await quoteService.addQuote('guild-b', 'Hello there', 'Author B');

      // Search in Guild A
      const results = await quoteService.searchQuotes('guild-a', 'hello');

      // Should only find Guild A's quote
      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Hello world');
      expect(results[0].guild_id).toBe('guild-a');
    });
  });
});
```

### Integration Tests

```javascript
describe('Guild-Aware Integration', () => {
  it('should maintain complete guild isolation', async () => {
    const db = new DatabaseService(':memory:');
    const quoteService = new QuoteService(db);

    // Simulate multiple guilds
    const guilds = ['guild-1', 'guild-2', 'guild-3'];

    for (const guildId of guilds) {
      // Add 5 quotes to each guild
      for (let i = 1; i <= 5; i++) {
        await quoteService.addQuote(guildId, `Quote ${i}`, `Author ${i}`);
      }
    }

    // Verify each guild only sees its own quotes
    for (const guildId of guilds) {
      const quotes = await quoteService.getQuotes(guildId);

      expect(quotes).toHaveLength(5);
      quotes.forEach(q => {
        expect(q.guild_id).toBe(guildId);
      });
    }

    // Verify total quotes = 15
    const allQuotes = await db.getMany('SELECT * FROM quotes');
    expect(allQuotes).toHaveLength(15);
  });
});
```

## Scalability

### Single Database, Multiple Guilds

Current architecture supports:
- ✅ 10,000+ guilds in single database
- ✅ ~1M quotes per guild
- ✅ Per-guild performance optimization via `guild_id` indexes
- ✅ Data isolation via mandatory guild context

### Future Scaling

If single database becomes bottleneck:

**Option 1: Read Replicas**
```javascript
// Main database (writes)
const mainDb = new DatabaseService('data/quotes.db');

// Replica database (reads)
const replicaDb = new DatabaseService('data/quotes-replica.db');

class QuoteService {
  async getQuotes(guildId) {
    // Read from replica
    return replicaDb.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }

  async addQuote(guildId, content, author) {
    // Write to main
    return mainDb.executeQuery(
      'INSERT INTO quotes (...) VALUES (...)',
      [guildId, content, author]
    );
  }
}
```

**Option 2: Per-Guild Database**
```javascript
class GuildDatabaseFactory {
  static getDatabaseForGuild(guildId) {
    const filepath = `data/guild-${guildId}.db`;
    return new DatabaseService(filepath);
  }
}

class QuoteService {
  async getQuotes(guildId) {
    const db = GuildDatabaseFactory.getDatabaseForGuild(guildId);
    return db.getMany('SELECT * FROM quotes');
  }
}
```

**Option 3: Sharded MongoDB**
```javascript
// Shard by guild_id
db.quotes.createIndex({ guild_id: 1 });

// MongoDB automatically distributes by guild_id
const quotes = await db.quotes
  .find({ guild_id: guildId })
  .toArray();
```

## Best Practices

### ✅ DO

- ✅ Always extract `guildId` from interaction
- ✅ Always validate guild context exists
- ✅ Always include guild context in database queries
- ✅ Use guild-aware services for data access
- ✅ Test guild isolation in unit tests
- ✅ Document guild context requirements
- ✅ Use parameterized queries (prevents SQL injection)
- ✅ Index on `guild_id` for performance

### ❌ DON'T

- ❌ Query without guild context filter
- ❌ Pass data between guilds
- ❌ Trust client-provided guild context without validation
- ❌ Use global state for guild data
- ❌ Mix guild data in responses
- ❌ Create indexes that don't include guild_id
- ❌ Use string interpolation in queries
- ❌ Assume guild context is always present

## Related Documentation

- [database-architecture.md](./database-architecture.md) - Schema and persistence
- [submodule-architecture.md](./submodule-architecture.md) - Service layer implementation
- [design-patterns.md](./design-patterns.md) - Service layer pattern
- [guild-aware-pattern.md](../reference/patterns/guild-aware-pattern.md) - Quick reference
