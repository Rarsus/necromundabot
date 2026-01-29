# NecromundaBot Database Architecture

## Overview

NecromundaBot uses a **guild-aware SQLite database** that enforces data isolation across multiple Discord guilds. This document details the data model, schema, service layer, and persistence patterns.

## Design Principles

### 1. Guild-Aware Isolation
Every table includes a `guild_id` column as the primary tenant identifier:
- Prevents cross-guild data access
- Supports multi-guild deployments
- Enables per-guild customization
- Scalable to thousands of guilds

### 2. Immutability & Audit Trail
Key tables include:
- `created_at` timestamp (when record was created)
- `updated_at` timestamp (when record was last modified)
- No soft deletes (data is permanently deleted)

### 3. Referential Integrity
Foreign keys enforce relationships:
- `quotes` → `ratings` (one quote, many ratings)
- `quotes` → `quote_tags` (many-to-many)

### 4. Indexing for Performance
Indexes on frequently queried columns:
- Guild queries (mandatory filter)
- User queries (permissions, activity)
- Timestamps (sorting, filtering)

## Schema Overview

```
┌─────────────────────────────────────────────────┐
│                  QUOTES TABLE                   │
│ id (PK) | guild_id (FK) | content | author | ... │
└────────┬────────────────┬──────────────────────┘
         │                │
         └────────────────┼────────────┐
                          │            │
        ┌─────────────────▼──────┐  ┌──▼────────────────┐
        │   RATINGS TABLE       │  │  QUOTE_TAGS TABLE │
        │ quote_id | rating |..│  │quote_id | tag_id│
        └──────────────────────┘  └──────────┬────────┘
                                            │
                                 ┌──────────▼──────────┐
                                 │     TAGS TABLE      │
                                 │ id | name | guild_id│
                                 └─────────────────────┘
```

## Table Schemas

### QUOTES Table

**Purpose:** Store quote text, metadata, and authorship

**SQL Definition:**
```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(guild_id, content)
);

CREATE INDEX idx_quotes_guild ON quotes(guild_id);
CREATE INDEX idx_quotes_created ON quotes(guild_id, created_at DESC);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique quote identifier |
| `guild_id` | TEXT | NOT NULL, INDEXED | Guild context (mandatory) |
| `content` | TEXT | NOT NULL | Quote text |
| `author` | TEXT | NULLABLE | Quote attribution |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last modification |

**Constraints:**
- `UNIQUE(guild_id, content)` - Prevent duplicate quotes within guild
- Guild context is mandatory (prevents orphaned records)

**Example Data:**
```sql
INSERT INTO quotes (guild_id, content, author)
VALUES ('12345', 'The future is now', 'Someone Wise');
```

### RATINGS Table

**Purpose:** Store user ratings for quotes (1-5 stars)

**SQL Definition:**
```sql
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  quote_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(quote_id, user_id),
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE INDEX idx_ratings_quote ON ratings(quote_id);
CREATE INDEX idx_ratings_guild_user ON ratings(guild_id, user_id);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY | Rating identifier |
| `guild_id` | TEXT | NOT NULL | Guild context |
| `quote_id` | INTEGER | NOT NULL, FOREIGN KEY | Referenced quote |
| `user_id` | TEXT | NOT NULL | User who rated |
| `rating` | INTEGER | 1-5 CHECK | Rating value |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | When rated |

**Constraints:**
- `UNIQUE(quote_id, user_id)` - One rating per user per quote
- `FOREIGN KEY(quote_id)` - Referential integrity with cascade delete
- `CHECK (rating >= 1 AND rating <= 5)` - Valid rating range

**Example Data:**
```sql
INSERT INTO ratings (guild_id, quote_id, user_id, rating)
VALUES ('12345', 1, 'user-456', 5);
```

### TAGS Table

**Purpose:** Store reusable tags for categorizing quotes

**SQL Definition:**
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(guild_id, name)
);

CREATE INDEX idx_tags_guild ON tags(guild_id);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY | Tag identifier |
| `guild_id` | TEXT | NOT NULL | Guild context |
| `name` | TEXT | NOT NULL | Tag text |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation time |

**Constraints:**
- `UNIQUE(guild_id, name)` - Tag names unique within guild

**Example Data:**
```sql
INSERT INTO tags (guild_id, name)
VALUES ('12345', 'wisdom'), ('12345', 'funny'), ('12345', 'science');
```

### QUOTE_TAGS Table

**Purpose:** Many-to-many relationship between quotes and tags

**SQL Definition:**
```sql
CREATE TABLE quote_tags (
  quote_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (quote_id, tag_id),
  FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_quote_tags_tag ON quote_tags(tag_id);
```

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `quote_id` | INTEGER | PRIMARY KEY, FOREIGN KEY | Quote reference |
| `tag_id` | INTEGER | PRIMARY KEY, FOREIGN KEY | Tag reference |

**Constraints:**
- `PRIMARY KEY (quote_id, tag_id)` - Prevent duplicate associations
- Foreign keys with cascade delete ensure data consistency

**Example Data:**
```sql
INSERT INTO quote_tags (quote_id, tag_id) VALUES
(1, 1),  -- Quote 1 tagged as "wisdom"
(1, 3);  -- Quote 1 also tagged as "science"
```

## Guild-Aware Architecture

### Mandatory Guild Context

Every operation enforces guild context:

```javascript
// ❌ WRONG - No guild context
async function getQuotes() {
  return db.getMany('SELECT * FROM quotes');
}

// ✅ CORRECT - Guild context required
async function getQuotes(guildId) {
  if (!guildId) throw new Error('Guild ID is required');
  return db.getMany('SELECT * FROM quotes WHERE guild_id = ?', [guildId]);
}
```

### Service Layer Enforcement

Services enforce guild context at the API level:

```javascript
class QuoteService {
  async getQuotes(guildId) {
    // Validate guild context
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    // Query with guild isolation
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ? ORDER BY created_at DESC',
      [guildId]
    );
  }

  async addQuote(guildId, content, author) {
    // Enforce guild context here
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    // INSERT with guild_id
    const result = await this.db.executeQuery(
      'INSERT INTO quotes (guild_id, content, author) VALUES (?, ?, ?)',
      [guildId, content, author]
    );

    return result;
  }
}
```

### Prevention of Cross-Guild Access

The `UNIQUE(guild_id, content)` constraint prevents:
- Duplicate quotes within a guild
- Cross-guild confusion when querying

## Service Layer Architecture

### Database Service (Low-level)

```javascript
class DatabaseService {
  async executeQuery(sql, params = []) {
    // Execute INSERT/UPDATE/DELETE
  }

  async getOne(sql, params = []) {
    // Fetch single row
  }

  async getMany(sql, params = []) {
    // Fetch multiple rows
  }
}
```

### Guild-Aware Database Service (Mid-level)

```javascript
class GuildAwareDatabaseService {
  async getGuildQuotes(guildId) {
    // Fetch quotes for specific guild
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }

  async getGuildTags(guildId) {
    // Fetch tags for specific guild
    return this.db.getMany(
      'SELECT * FROM tags WHERE guild_id = ?',
      [guildId]
    );
  }
}
```

### Business Logic Services (High-level)

```javascript
class QuoteService {
  async searchQuotes(guildId, searchTerm) {
    // Business logic: Search + tag filtering + rating calculation
    return this.db.getMany(
      `SELECT q.*, 
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT qt.tag_id) as tag_count
       FROM quotes q
       LEFT JOIN ratings r ON q.id = r.quote_id
       LEFT JOIN quote_tags qt ON q.id = qt.quote_id
       WHERE q.guild_id = ?
       AND q.content LIKE ?
       GROUP BY q.id
       ORDER BY avg_rating DESC`,
      [guildId, `%${searchTerm}%`]
    );
  }
}
```

## Query Patterns

### 1. Get All Quotes for Guild

```javascript
const quotes = await db.getMany(
  'SELECT * FROM quotes WHERE guild_id = ? ORDER BY created_at DESC',
  [guildId]
);
```

**Index Used:** `idx_quotes_guild`, `idx_quotes_created`

### 2. Get Quote with Rating Average

```javascript
const quote = await db.getOne(
  `SELECT q.*, COALESCE(AVG(r.rating), 0) as avg_rating
   FROM quotes q
   LEFT JOIN ratings r ON q.id = r.quote_id
   WHERE q.id = ? AND q.guild_id = ?
   GROUP BY q.id`,
  [quoteId, guildId]
);
```

### 3. Get Quote with All Tags

```javascript
const quote = await db.getOne(
  `SELECT q.*, GROUP_CONCAT(t.name, ',') as tags
   FROM quotes q
   LEFT JOIN quote_tags qt ON q.id = qt.quote_id
   LEFT JOIN tags t ON qt.tag_id = t.id
   WHERE q.id = ? AND q.guild_id = ?
   GROUP BY q.id`,
  [quoteId, guildId]
);
```

### 4. Search by Tag

```javascript
const quotes = await db.getMany(
  `SELECT DISTINCT q.*
   FROM quotes q
   JOIN quote_tags qt ON q.id = qt.quote_id
   JOIN tags t ON qt.tag_id = t.id
   WHERE q.guild_id = ? AND t.name = ?`,
  [guildId, tagName]
);
```

### 5. Get Top-Rated Quotes

```javascript
const topQuotes = await db.getMany(
  `SELECT q.*, AVG(r.rating) as avg_rating, COUNT(r.id) as rating_count
   FROM quotes q
   LEFT JOIN ratings r ON q.id = r.quote_id
   WHERE q.guild_id = ?
   GROUP BY q.id
   HAVING rating_count > 0
   ORDER BY avg_rating DESC
   LIMIT 10`,
  [guildId]
);
```

## Performance Considerations

### Indexing Strategy

**Current Indexes:**
- `idx_quotes_guild` - Enable guild filtering (MANDATORY)
- `idx_quotes_created` - Enable chronological sorting
- `idx_ratings_quote` - Enable quote lookup in ratings
- `idx_ratings_guild_user` - Enable user activity queries
- `idx_tags_guild` - Enable tag filtering
- `idx_quote_tags_tag` - Enable tag-based searches

**Index Usage Examples:**

```sql
-- Uses idx_quotes_guild
SELECT * FROM quotes WHERE guild_id = '12345';

-- Uses idx_quotes_created (after guild filter)
SELECT * FROM quotes WHERE guild_id = '12345' ORDER BY created_at DESC;

-- Uses idx_ratings_quote (for aggregate queries)
SELECT AVG(rating) FROM ratings WHERE quote_id = 1;
```

### Query Optimization

1. **Always filter by guild_id first** - Reduces dataset before other filters
2. **Use parameterized queries** - Prevents SQL injection
3. **Limit result sets** - Especially for aggregate queries
4. **Avoid SELECT *** - Fetch only needed columns

**❌ Slow Query:**
```javascript
db.getMany('SELECT * FROM quotes'); // No guild filter!
```

**✅ Fast Query:**
```javascript
db.getMany(
  'SELECT id, content, author FROM quotes WHERE guild_id = ?',
  [guildId]
);
```

### Scalability Limits

**Current SQLite Limitations:**
- Single-file database (not distributed)
- Suitable for ~10,000 guilds
- ~1M quotes per guild recommended
- All data fits in memory (consider pagination)

**Future Scaling Options:**
1. **PostgreSQL** - Multi-user, ACID transactions, replication
2. **MongoDB** - Document model, horizontal scaling
3. **Distributed Architecture** - Separate databases per region
4. **Read Replicas** - Offload read queries

## Initialization & Migrations

### Automatic Schema Initialization

On first run, the bot automatically creates all tables:

```javascript
// src/schema-enhancement.js
async function initializeDatabase() {
  const db = new DatabaseService('./data/quotes.db');

  // Create QUOTES table
  await db.executeQuery(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guild_id, content)
    )
  `);

  // Create RATINGS table
  await db.executeQuery(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      quote_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(quote_id, user_id),
      FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    )
  `);

  // Create TAGS table
  await db.executeQuery(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(guild_id, name)
    )
  `);

  // Create QUOTE_TAGS table
  await db.executeQuery(`
    CREATE TABLE IF NOT EXISTS quote_tags (
      quote_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (quote_id, tag_id),
      FOREIGN KEY(quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
      FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
}
```

### Schema Versioning

Track schema version for future migrations:

```javascript
// Create schema_info table
CREATE TABLE schema_info (
  key TEXT PRIMARY KEY,
  value TEXT
);

INSERT INTO schema_info VALUES ('version', '1.0.0');
```

## Backup & Recovery

### Database Backup

```bash
# Create backup copy
cp data/quotes.db data/quotes.backup.db

# Or via SQLite
sqlite3 data/quotes.db ".backup data/quotes.backup.db"
```

### Data Export

```javascript
// Export guild data as JSON
async function exportGuildData(guildId) {
  const quotes = await quoteService.getAllQuotes(guildId);
  const tags = await tagService.getAllTags(guildId);
  
  return {
    guild_id: guildId,
    quotes,
    tags,
    exported_at: new Date()
  };
}
```

## Security Considerations

### SQL Injection Prevention

**Always use parameterized queries:**

```javascript
// ❌ WRONG - Vulnerable to SQL injection
db.getMany(`SELECT * FROM quotes WHERE guild_id = '${guildId}'`);

// ✅ CORRECT - Parameterized query
db.getMany('SELECT * FROM quotes WHERE guild_id = ?', [guildId]);
```

### Data Validation

All input must be validated before database insertion:

```javascript
async function addQuote(guildId, content, author) {
  // Validate guild context
  if (!guildId) throw new Error('Guild ID required');
  
  // Validate quote content
  if (!content || content.length === 0) {
    throw new Error('Quote content cannot be empty');
  }
  if (content.length > 2000) {
    throw new Error('Quote too long (max 2000 characters)');
  }

  // Validate author (optional)
  if (author && author.length > 100) {
    throw new Error('Author name too long');
  }

  // Safe to insert
  return db.executeQuery(
    'INSERT INTO quotes (guild_id, content, author) VALUES (?, ?, ?)',
    [guildId, content, author]
  );
}
```

### Access Control

All operations must verify user permissions before database access:

```javascript
async function deleteQuote(userId, guildId, quoteId) {
  // Check user has admin permission in guild
  const hasPermission = await discordService.hasAdminPermission(
    userId,
    guildId
  );

  if (!hasPermission) {
    throw new Error('You do not have permission to delete quotes');
  }

  // Only then delete
  return db.executeQuery(
    'DELETE FROM quotes WHERE id = ? AND guild_id = ?',
    [quoteId, guildId]
  );
}
```

## Testing Database Operations

### Unit Tests (In-Memory Database)

```javascript
describe('QuoteService', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    // Use in-memory SQLite for tests
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  it('should add quote with guild context', async () => {
    const quote = await quoteService.addQuote(
      'test-guild',
      'Test quote',
      'Test Author'
    );

    expect(quote.guildId).toBe('test-guild');
    expect(quote.content).toBe('Test quote');
  });

  it('should prevent quote without guild context', async () => {
    await expect(
      quoteService.addQuote(null, 'Test quote', 'Author')
    ).rejects.toThrow('Guild ID is required');
  });
});
```

## Related Documentation

- [system-architecture.md](./system-architecture.md) - System overview
- [submodule-architecture.md](./submodule-architecture.md) - Submodule details
- [design-patterns.md](./design-patterns.md) - Service patterns
- [guild-aware-architecture.md](./guild-aware-architecture.md) - Guild isolation patterns
