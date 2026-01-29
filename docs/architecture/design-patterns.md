# NecromundaBot Design Patterns & Architecture Patterns

## Overview

NecromundaBot implements several well-established software design patterns to ensure maintainability, testability, and scalability. This document details the patterns used throughout the codebase.

## 1. Command Pattern

### Purpose
Encapsulate a command request as an object, allowing parameterization and queueing of requests.

### Implementation

All Discord commands inherit from `CommandBase`:

```javascript
// necrobot-commands/src/core/CommandBase.js
class CommandBase {
  constructor(options) {
    this.name = options.name;
    this.description = options.description;
    this.data = options.data;
    this.options = options.options;
  }

  async execute(message, args) {
    // Override in subclass - for prefix commands
    throw new Error('execute() must be implemented');
  }

  async executeInteraction(interaction) {
    // Override in subclass - for slash commands
    throw new Error('executeInteraction() must be implemented');
  }

  register() {
    // Chain for fluent API
    return this;
  }
}
```

### Usage

```javascript
// necrobot-commands/src/commands/misc/ping.js
class PingCommand extends CommandBase {
  constructor() {
    super({
      name: 'ping',
      description: 'Check bot latency'
    });
  }

  async execute(message) {
    // Prefix command handler
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await message.reply(`Pong! ${latency}ms`);
  }

  async executeInteraction(interaction) {
    // Slash command handler
    const sent = await interaction.reply('Pinging...');
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! ${latency}ms`);
  }
}

module.exports = new PingCommand().register();
```

### Benefits
- ✅ Consistent command structure
- ✅ Automatic error handling
- ✅ Unified option handling
- ✅ Automatic logging and metrics
- ✅ Reduced boilerplate

### When to Use
Every Discord command should extend `CommandBase`. It's the standard pattern for the bot.

---

## 2. Service Layer Pattern

### Purpose
Separate business logic from infrastructure concerns, making code testable and reusable.

### Architecture

```
Command Handler
        ↓
Service Layer (QuoteService, ValidationService, etc.)
        ↓
Data Access Layer (DatabaseService)
        ↓
Database (SQLite)
```

### Implementation

**Service Interface:**
```javascript
// necrobot-utils/src/services/QuoteService.js
class QuoteService {
  constructor(db) {
    this.db = db;  // Dependency injection
  }

  async addQuote(guildId, content, author) {
    // Validate input
    if (!content || !guildId) {
      throw new Error('Content and guild ID required');
    }

    // Business logic
    const quote = await this.db.executeQuery(
      'INSERT INTO quotes (guild_id, content, author) VALUES (?, ?, ?)',
      [guildId, content, author]
    );

    return quote;
  }

  async getRandomQuote(guildId) {
    // Fetch random quote for guild
    return this.db.getOne(
      'SELECT * FROM quotes WHERE guild_id = ? ORDER BY RANDOM() LIMIT 1',
      [guildId]
    );
  }

  async searchQuotes(guildId, searchTerm) {
    // Complex business logic
    return this.db.getMany(
      `SELECT q.*, AVG(r.rating) as avg_rating
       FROM quotes q
       LEFT JOIN ratings r ON q.id = r.quote_id
       WHERE q.guild_id = ? AND q.content LIKE ?
       GROUP BY q.id
       ORDER BY avg_rating DESC`,
      [guildId, `%${searchTerm}%`]
    );
  }
}

module.exports = QuoteService;
```

**Usage in Commands:**
```javascript
// necrobot-commands/src/commands/quote-discovery/random-quote.js
class RandomQuoteCommand extends CommandBase {
  async executeInteraction(interaction) {
    const quoteService = new QuoteService(db);
    
    try {
      const quote = await quoteService.getRandomQuote(
        interaction.guildId
      );

      if (!quote) {
        return sendError(interaction, 'No quotes found');
      }

      return sendQuoteEmbed(interaction, quote, 'Random Quote');
    } catch (error) {
      // Error automatically handled by CommandBase
      throw error;
    }
  }
}
```

### Key Principles

1. **Single Responsibility** - Each service handles one domain
2. **Dependency Injection** - Services receive dependencies in constructor
3. **Testability** - Services can be tested independently with mocks
4. **Reusability** - Same service used across multiple commands
5. **Separation of Concerns** - Business logic separate from Discord handling

### Guild-Aware Services

All services enforce guild context:

```javascript
class GuildAwareQuoteService {
  async getQuotes(guildId) {
    // MANDATORY: Validate guild context
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    // Query with guild isolation
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }
}
```

### Testing Services

```javascript
describe('QuoteService', () => {
  let db;
  let quoteService;

  beforeEach(async () => {
    // Inject mock database
    db = new DatabaseService(':memory:');
    await db.initialize();
    quoteService = new QuoteService(db);
  });

  it('should add quote with guild context', async () => {
    const quote = await quoteService.addQuote(
      'guild-123',
      'Test quote',
      'Author'
    );

    expect(quote.guildId).toBe('guild-123');
  });

  it('should throw error without guild context', async () => {
    await expect(
      quoteService.addQuote(null, 'Quote', 'Author')
    ).rejects.toThrow('Guild ID is required');
  });
});
```

---

## 3. Repository Pattern

### Purpose
Provide abstraction over data access, making it easy to swap implementations.

### Implementation

```javascript
// necrobot-utils/src/services/DatabaseService.js
class DatabaseService {
  constructor(filepath) {
    this.db = new sqlite3.Database(filepath);
  }

  async executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getMany(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}
```

### Benefits
- ✅ Abstraction of data source
- ✅ Easy to swap implementations (SQLite → PostgreSQL)
- ✅ Testable with in-memory database
- ✅ Centralized query execution
- ✅ Built-in error handling

### When to Use
Repository pattern is implemented through `DatabaseService` and higher-level services.

---

## 4. Middleware Pattern

### Purpose
Handle cross-cutting concerns (error handling, logging, validation) in a pipeline.

### Implementation

**Error Handling Middleware:**
```javascript
// necrobot-core/src/middleware/errorHandler.js
class ErrorHandler {
  static async handle(error, context) {
    // Log error
    logger.error(error.message, {
      stack: error.stack,
      context: context.commandName || context.eventName
    });

    // Determine error type
    if (error.message.includes('Guild ID')) {
      return 'Guild context required';
    }

    if (error.message.includes('Permission')) {
      return 'You do not have permission to use this command';
    }

    // Generic error
    return 'An error occurred. Please try again later.';
  }
}

module.exports = ErrorHandler;
```

**Usage in CommandBase:**
```javascript
class CommandBase {
  async executeInteraction(interaction) {
    try {
      // Run command
      await this.execute(interaction);
    } catch (error) {
      // Middleware handles error
      const message = await ErrorHandler.handle(error, {
        commandName: this.name
      });

      await sendError(interaction, message);
    }
  }
}
```

### Middleware Pipeline

```
Request
  ↓
Validate Input Middleware
  ↓
Permission Check Middleware
  ↓
Command Execution
  ↓
Response
  ↓
Error Handling Middleware (if error occurs)
```

---

## 5. Builder Pattern

### Purpose
Construct complex objects step by step with a fluent API.

### Implementation

**CommandOptions Builder:**
```javascript
// necrobot-commands/src/core/CommandOptions.js
function buildCommandOptions(name, description, options = []) {
  // Create slash command builder
  const slashData = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description);

  // Add options to slash command
  for (const opt of options) {
    if (opt.type === 'string') {
      slashData.addStringOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    }

    if (opt.type === 'number') {
      slashData.addNumberOption((option) =>
        option
          .setName(opt.name)
          .setDescription(opt.description)
          .setRequired(opt.required || false)
      );
    }

    // ... handle other types
  }

  return {
    data: slashData,
    options
  };
}

module.exports = buildCommandOptions;
```

**Usage:**
```javascript
const { data, options } = buildCommandOptions(
  'add-quote',
  'Add a new quote',
  [
    { name: 'content', type: 'string', required: true, description: 'Quote text' },
    { name: 'author', type: 'string', required: false, description: 'Author' }
  ]
);
```

### Benefits
- ✅ Clear, readable construction
- ✅ Single source of truth for options
- ✅ Reusable across slash and prefix commands
- ✅ Easy to extend with new option types

---

## 6. Factory Pattern

### Purpose
Create objects without specifying exact classes, using a factory function.

### Implementation

**Service Factory:**
```javascript
// necrobot-utils/src/services/index.js
class ServiceFactory {
  static createQuoteService(db) {
    return new QuoteService(db);
  }

  static createReminderService(db) {
    return new ReminderService(db);
  }

  static createValidationService() {
    return new ValidationService();
  }
}

module.exports = ServiceFactory;
```

**Usage:**
```javascript
const serviceFactory = require('../../necrobot-utils/src/services');

class AddQuoteCommand extends CommandBase {
  async executeInteraction(interaction) {
    // Create service using factory
    const quoteService = serviceFactory.createQuoteService(db);

    const quote = await quoteService.addQuote(
      interaction.guildId,
      interaction.options.getString('content'),
      interaction.options.getString('author')
    );
  }
}
```

### Benefits
- ✅ Decouples object creation from usage
- ✅ Easier to mock for testing
- ✅ Centralized service creation logic
- ✅ Easy to add service initialization

---

## 7. Adapter Pattern

### Purpose
Convert interface of one class to another, allowing incompatible classes to work together.

### Implementation

**Discord API Adapter:**
```javascript
// necrobot-core/src/utils/discord-service.js
class DiscordService {
  static async hasAdminPermission(userId, guildId) {
    // Convert Discord permission object to boolean
    const member = await guild.members.fetch(userId);
    return member.permissions.has('ADMINISTRATOR');
  }

  static async isGuildOwner(userId, guildId) {
    // Adapt guild owner check
    const guild = await client.guilds.fetch(guildId);
    return guild.ownerId === userId;
  }

  static async getUserInfo(userId) {
    // Adapt user object to standard format
    const user = await client.users.fetch(userId);
    return {
      id: user.id,
      username: user.username,
      avatar: user.displayAvatarURL(),
      bot: user.bot
    };
  }
}

module.exports = DiscordService;
```

**Usage:**
```javascript
class DeleteQuoteCommand extends CommandBase {
  async executeInteraction(interaction) {
    // Check permission using adapter
    const hasPermission = await DiscordService.hasAdminPermission(
      interaction.user.id,
      interaction.guildId
    );

    if (!hasPermission) {
      return sendError(interaction, 'You need admin permission');
    }

    // Delete quote
  }
}
```

### Benefits
- ✅ Isolates Discord.js API changes
- ✅ Provides consistent interface to bot code
- ✅ Easier to test (mock adapter instead of Discord.js)
- ✅ Simpler to replace Discord library if needed

---

## 8. Template Method Pattern

### Purpose
Define skeleton of algorithm, with steps implemented by subclasses.

### Implementation

**CommandBase as Template:**
```javascript
class CommandBase {
  // Template method
  async executeInteraction(interaction) {
    try {
      // Step 1: Validate input
      this.validateInput(interaction);

      // Step 2: Execute command logic (implemented by subclass)
      await this.handle(interaction);

      // Step 3: Log execution
      logger.info(`Command ${this.name} executed by ${interaction.user.id}`);
    } catch (error) {
      // Step 4: Handle errors
      await this.handleError(error, interaction);
    }
  }

  // To be implemented by subclass
  async handle(interaction) {
    throw new Error('handle() must be implemented');
  }

  validateInput(interaction) {
    if (!interaction.guildId) {
      throw new Error('Command only works in guilds');
    }
  }

  async handleError(error, interaction) {
    logger.error(error);
    await sendError(interaction, 'An error occurred');
  }
}
```

### Benefits
- ✅ Enforces consistent command lifecycle
- ✅ Automatic error handling
- ✅ Automatic logging
- ✅ Reduces code duplication

---

## 9. Decorator Pattern

### Purpose
Attach additional responsibilities to object dynamically.

### Implementation

**Command Decorators (via middleware):**
```javascript
// necrobot-core/src/middleware/commandValidator.js
function validateGuild(commandHandler) {
  return async (interaction) => {
    // Decorator: Check if command is in guild
    if (!interaction.guildId) {
      return sendError(interaction, 'This command only works in servers');
    }

    // Call original handler
    return commandHandler(interaction);
  };
}

function requireAdmin(commandHandler) {
  return async (interaction) => {
    // Decorator: Check admin permission
    const hasPermission = await DiscordService.hasAdminPermission(
      interaction.user.id,
      interaction.guildId
    );

    if (!hasPermission) {
      return sendError(interaction, 'You need admin permission');
    }

    return commandHandler(interaction);
  };
}

// Usage
let handler = async (interaction) => { /* ... */ };
handler = validateGuild(handler);
handler = requireAdmin(handler);
```

### Benefits
- ✅ Adds behavior without modifying class
- ✅ Can combine multiple decorators
- ✅ Keeps classes single-responsibility
- ✅ Easy to test each decorator separately

---

## 10. Strategy Pattern

### Purpose
Define family of algorithms, encapsulate each, and make them interchangeable.

### Implementation

**Validation Strategies:**
```javascript
// necrobot-utils/src/services/ValidationService.js
class ValidationStrategy {
  validate(input) {
    throw new Error('validate() must be implemented');
  }
}

class QuoteValidationStrategy extends ValidationStrategy {
  validate(quote) {
    if (!quote.content) throw new Error('Quote content required');
    if (quote.content.length > 2000) throw new Error('Quote too long');
    return true;
  }
}

class ReminderValidationStrategy extends ValidationStrategy {
  validate(reminder) {
    if (!reminder.text) throw new Error('Reminder text required');
    if (!reminder.dueDate) throw new Error('Due date required');
    return true;
  }
}

class ValidationService {
  constructor() {
    this.strategies = {
      quote: new QuoteValidationStrategy(),
      reminder: new ReminderValidationStrategy()
    };
  }

  validate(type, data) {
    return this.strategies[type].validate(data);
  }
}
```

**Usage:**
```javascript
const validationService = new ValidationService();

// Validate quote
validationService.validate('quote', {
  content: 'The future is now',
  author: 'Someone'
});

// Validate reminder
validationService.validate('reminder', {
  text: 'Remember this',
  dueDate: new Date()
});
```

### Benefits
- ✅ Easy to add new validation strategies
- ✅ Strategies can be swapped at runtime
- ✅ Each strategy is testable independently
- ✅ Follows Open-Closed Principle

---

## 11. Observer Pattern

### Purpose
Define one-to-many dependency between objects so when one changes, all dependents are notified.

### Implementation

**Event System:**
```javascript
// necrobot-core/src/events/ready.js
class BotReadyEvent {
  static async execute(client) {
    // Notify all observers
    console.log('Bot is ready!');
    
    // Could emit event
    client.emit('bot:ready', {
      timestamp: Date.now(),
      guilds: client.guilds.cache.size
    });
  }
}
```

**Observer (Listener):**
```javascript
client.on('bot:ready', (event) => {
  console.log(`Connected to ${event.guilds} servers`);
  // Update status, log metrics, etc.
});
```

### Benefits
- ✅ Loose coupling between components
- ✅ Easy to add/remove observers
- ✅ Supports real-time notifications
- ✅ Scales to many observers

---

## 12. Singleton Pattern

### Purpose
Ensure a class has only one instance and provide global access to it.

### Implementation

**Database Singleton:**
```javascript
// necrobot-utils/src/services/DatabaseService.js
class DatabaseService {
  private static instance = null;

  private constructor(filepath) {
    this.db = new sqlite3.Database(filepath);
  }

  static getInstance(filepath = 'data/quotes.db') {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(filepath);
    }
    return DatabaseService.instance;
  }
}

// Usage
const db = DatabaseService.getInstance();
```

### ⚠️ Note
Singletons should be used sparingly. **Prefer dependency injection** (which is more testable):

```javascript
// Better approach with dependency injection
const db = new DatabaseService('data/quotes.db');
const quoteService = new QuoteService(db);
```

---

## Pattern Selection Guide

| Problem | Pattern | Use Case |
|---------|---------|----------|
| Command implementation | Command | All Discord commands |
| Business logic | Service Layer | Quotes, reminders, validation |
| Data access | Repository | Database operations |
| Cross-cutting concerns | Middleware | Error handling, logging |
| Complex object creation | Builder | Command options |
| Object creation | Factory | Service creation |
| Interface incompatibility | Adapter | Discord API adaptation |
| Algorithm skeleton | Template Method | Command lifecycle |
| Adding behavior dynamically | Decorator | Middleware wrapping |
| Algorithm families | Strategy | Different validation types |
| One-to-many notification | Observer | Event system |
| Single instance required | Singleton | Database connection (rare) |

---

## Architectural Principles

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each class has one reason to change
   - QuoteService handles quotes, not validation

2. **Open-Closed Principle (OCP)**
   - Open for extension, closed for modification
   - Add new commands by extending CommandBase

3. **Liskov Substitution Principle (LSP)**
   - Subtypes must be substitutable for base types
   - All commands extend CommandBase consistently

4. **Interface Segregation Principle (ISP)**
   - Clients depend on specific interfaces
   - Services provide focused APIs

5. **Dependency Inversion Principle (DIP)**
   - Depend on abstractions, not concretions
   - Inject DatabaseService, not SQLite directly

### Design Principles

- **DRY (Don't Repeat Yourself)** - Reuse code through services and helpers
- **KISS (Keep It Simple, Stupid)** - Simple, understandable implementations
- **YAGNI (You Aren't Gonna Need It)** - Don't over-engineer
- **Fail Fast** - Validate early, provide clear error messages

---

## Related Documentation

- [system-architecture.md](./system-architecture.md) - Overall system design
- [submodule-architecture.md](./submodule-architecture.md) - Submodule structure
- [service-layer-design.md](./service-layer-design.md) - Detailed service patterns
- [docs/reference/patterns/](../reference/patterns/) - Pattern reference guides
