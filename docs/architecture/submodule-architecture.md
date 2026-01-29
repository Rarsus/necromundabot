# NecromundaBot Submodule Architecture

## Overview

NecromundaBot uses a **Git submodule-based architecture** where each major component is maintained as an independent Git repository within the main monorepo. This document details the structure, responsibilities, and design of each submodule.

## Submodule Structure

```
NecromundaBot (Main Repo)
├── repos/necrobot-core/           # Bot engine & events
├── repos/necrobot-utils/          # Services & utilities
├── repos/necrobot-commands/       # Discord commands (Phase 2.5)
└── repos/necrobot-dashboard/      # Web UI & dashboard
```

## 1. necrobot-core

**Status:** ✅ Active  
**Version:** 0.3.0  
**Last Release:** v0.3.0 (January 27, 2026)  
**Purpose:** Bot engine, event handling, and core infrastructure

### Directory Structure

```
necrobot-core/
├── src/
│   ├── index.js                    # Bot entry point & initialization
│   ├── core/
│   │   └── EventBase.js            # Base class for event handlers
│   ├── middleware/
│   │   ├── errorHandler.js         # Centralized error handling
│   │   ├── logger.js               # Logging middleware
│   │   └── commandValidator.js     # Command validation
│   ├── events/
│   │   ├── ready.js               # Bot ready handler
│   │   ├── interactionCreate.js   # Slash command handler
│   │   └── messageCreate.js       # Prefix command handler
│   └── utils/
│       └── discord-service.js     # Discord API helpers
├── tests/
│   ├── unit/
│   │   └── test-event-base.test.js
│   └── integration/
│       └── test-event-handlers.test.js
├── package.json
└── README.md
```

### Key Responsibilities

1. **Bot Initialization**
   - Create and configure Discord.js client
   - Load environment variables
   - Initialize database connections
   - Register event listeners

2. **Event Management**
   - Handle Discord events (ready, interaction, message)
   - Route interactions to command handlers
   - Manage event lifecycle
   - Error handling for event handlers

3. **Middleware Pipeline**
   - Error handling and logging
   - Request validation
   - Cross-cutting concerns
   - Metrics and monitoring

4. **Interaction Routing**
   - Parse slash commands
   - Parse prefix commands
   - Route to appropriate handlers
   - Manage interaction responses

### Key Files

**`src/index.js`** - Bot entry point
```javascript
const { Client } = require('discord.js');
const DatabaseService = require('../../necrobot-utils/src/services/DatabaseService');

// Initialize bot
const client = new Client({ intents: [/* ... */] });

// Load events
client.on('ready', async () => { /* ... */ });
client.on('interactionCreate', async (interaction) => { /* ... */ });

// Connect to Discord
client.login(process.env.DISCORD_TOKEN);
```

**`src/core/EventBase.js`** - Event handler base class
```javascript
class EventBase {
  constructor(eventName) {
    this.name = eventName;
  }

  async execute(args) {
    throw new Error('Not implemented');
  }
}

module.exports = EventBase;
```

**`src/middleware/errorHandler.js`** - Error handling pipeline
```javascript
async function handleError(error, context) {
  // Log error
  logger.error(error, context);
  
  // Send user-friendly message
  if (context.interaction) {
    await sendError(context.interaction, 'An error occurred');
  }
}

module.exports = { handleError };
```

### Dependencies

```json
{
  "dependencies": {
    "discord.js": "^14.11.0",
    "necrobot-utils": "*"
  }
}
```

### Event Flow

```
Discord Event
    ↓
necrobot-core (event handler)
    ↓
Load command/handler from necrobot-commands or necrobot-utils
    ↓
Execute with error handling
    ↓
Call services from necrobot-utils
    ↓
Return response to Discord
```

### Exports

- `start()` - Initialize bot
- `client` - Discord.js client instance
- `EventBase` - Base class for event handlers
- Error handling middleware

---

## 2. necrobot-utils

**Status:** ✅ Active  
**Version:** 0.2.2  
**Last Release:** v0.2.2 (January 27, 2026)  
**Purpose:** Shared services, database layer, and utilities

### Directory Structure

```
necrobot-utils/
├── src/
│   ├── index.js                    # Module exports
│   ├── services/
│   │   ├── DatabaseService.js      # Database operations
│   │   ├── QuoteService.js         # Quote business logic
│   │   ├── ReminderService.js      # Reminder management
│   │   ├── ValidationService.js    # Input validation
│   │   ├── GuildAwareDatabaseService.js  # Guild context enforcement
│   │   └── GuildAwareReminderService.js  # Guild-aware reminders
│   ├── middleware/
│   │   ├── errorHandler.js         # Error handling utilities
│   │   └── logger.js               # Logging utilities
│   ├── utils/
│   │   └── helpers/
│   │       ├── response-helpers.js      # Discord formatting
│   │       ├── validation-helpers.js    # Input validation
│   │       └── data-helpers.js          # Data transformation
│   └── constants/
│       ├── messages.js             # Message templates
│       ├── errors.js               # Error definitions
│       └── discord-config.js       # Discord constants
├── tests/
│   ├── unit/
│   │   ├── test-database-service.test.js
│   │   ├── test-quote-service.test.js
│   │   ├── test-response-helpers.test.js
│   │   └── test-validation-helpers.test.js
│   └── integration/
│       └── test-database-integration.test.js
├── package.json
└── README.md
```

### Key Responsibilities

1. **Database Operations**
   - SQLite database abstraction
   - Query execution with parameter binding
   - Schema management
   - Guild-aware data access

2. **Business Logic Services**
   - Quote management (add, search, rate, tag)
   - Reminder management
   - User statistics
   - Guild-specific operations

3. **Validation & Helpers**
   - Input validation (quotes, reminders, user input)
   - Data transformation
   - Discord message formatting
   - Error message generation

4. **Guild-Aware Architecture**
   - Enforce mandatory guild context
   - Prevent cross-guild data access
   - Support multi-guild deployments
   - Per-guild isolation

### Key Files

**`src/services/DatabaseService.js`** - Core database layer
```javascript
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
}

module.exports = DatabaseService;
```

**`src/services/GuildAwareDatabaseService.js`** - Guild context enforcement
```javascript
class GuildAwareDatabaseService {
  constructor(db) {
    this.db = db;
  }

  async getQuotesForGuild(guildId) {
    // Enforce guild context - MANDATORY
    if (!guildId) throw new Error('Guild ID is required');
    
    return this.db.getMany(
      'SELECT * FROM quotes WHERE guild_id = ?',
      [guildId]
    );
  }
}

module.exports = GuildAwareDatabaseService;
```

**`src/services/QuoteService.js`** - Business logic for quotes
```javascript
class QuoteService {
  constructor(db) {
    this.db = db;
  }

  async addQuote(guildId, content, author) {
    // Validate input
    if (!content || !guildId) {
      throw new Error('Content and guild ID are required');
    }

    // Insert with guild context
    return this.db.executeQuery(
      'INSERT INTO quotes (guild_id, content, author) VALUES (?, ?, ?)',
      [guildId, content, author]
    );
  }

  async getRandomQuote(guildId) {
    // Retrieve random quote for guild
    return this.db.getOne(
      'SELECT * FROM quotes WHERE guild_id = ? ORDER BY RANDOM() LIMIT 1',
      [guildId]
    );
  }
}

module.exports = QuoteService;
```

**`src/utils/helpers/response-helpers.js`** - Discord message formatting
```javascript
async function sendQuoteEmbed(interaction, quote, title = 'Quote') {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(quote.content)
    .setFooter({ text: `— ${quote.author || 'Unknown'}` })
    .setColor(0x0099ff);

  return interaction.reply({ embeds: [embed] });
}

async function sendSuccess(interaction, message) {
  return interaction.reply({
    content: `✅ ${message}`,
    ephemeral: true
  });
}

async function sendError(interaction, message, ephemeral = true) {
  return interaction.reply({
    content: `❌ ${message}`,
    ephemeral
  });
}

module.exports = {
  sendQuoteEmbed,
  sendSuccess,
  sendError
};
```

### Dependencies

```json
{
  "dependencies": {
    "sqlite3": "^5.1.7"
  }
}
```

### Exports

All services, helpers, and constants are exported from `src/index.js`:

```javascript
module.exports = {
  // Services
  DatabaseService,
  QuoteService,
  ReminderService,
  ValidationService,
  GuildAwareDatabaseService,
  GuildAwareReminderService,
  
  // Helpers
  responseHelpers: {
    sendSuccess,
    sendError,
    sendQuoteEmbed
  },
  
  // Constants
  MESSAGES,
  ERRORS,
  DISCORD_CONFIG
};
```

---

## 3. necrobot-commands

**Status:** ✅ Active  
**Version:** 0.1.0  
**Last Release:** v0.1.0 (January 27, 2026)  
**Purpose:** Centralized command management and implementation

### Directory Structure

```
necrobot-commands/
├── src/
│   ├── index.js                    # Module entry point
│   ├── register-commands.js        # Command registration script
│   ├── core/
│   │   ├── CommandBase.js          # Base class for commands
│   │   └── CommandOptions.js       # Options builder
│   └── commands/
│       ├── misc/
│       │   ├── help.js            # Help command
│       │   ├── ping.js            # Ping command
│       │   └── info.js            # Bot info command
│       ├── gang/
│       │   ├── create-gang.js     # Gang management
│       │   └── list-gangs.js
│       ├── campaign/
│       │   ├── create-campaign.js # Campaign management
│       │   └── list-campaigns.js
│       ├── quote-discovery/
│       │   ├── random-quote.js
│       │   └── search-quotes.js
│       ├── quote-management/
│       │   ├── add-quote.js
│       │   ├── delete-quote.js
│       │   └── update-quote.js
│       ├── quote-social/
│       │   ├── rate-quote.js
│       │   └── tag-quote.js
│       └── quote-export/
│           └── export-quotes.js
├── tests/
│   ├── unit/
│   │   └── test-[command-name].test.js
│   └── integration/
│       └── test-command-registration.test.js
├── package.json
└── README.md
```

### Key Responsibilities

1. **Command Implementation**
   - Implement Discord.js slash commands
   - Implement legacy prefix commands
   - Organize commands by category
   - Maintain consistent command structure

2. **Command Registration**
   - Register slash commands with Discord API
   - Register prefix command handlers
   - Manage command metadata
   - Support dynamic loading

3. **Option Management**
   - Unified option definition (slash + prefix)
   - Type validation and conversion
   - Required/optional parameter handling
   - Help text and descriptions

4. **Error Handling**
   - Command-specific error handling
   - User-friendly error messages
   - Logging and debugging
   - Graceful failure modes

### Key Files

**`src/core/CommandBase.js`** - Base class for all commands
```javascript
class CommandBase {
  constructor(options) {
    this.name = options.name;
    this.description = options.description;
    this.data = options.data;
    this.options = options.options;
  }

  async execute(message, args) {
    try {
      // Implement in subclass
      throw new Error('execute() must be implemented');
    } catch (error) {
      // Automatic error handling
      logger.error(`Command ${this.name} failed:`, error);
      await message.reply('An error occurred executing this command.');
    }
  }

  async executeInteraction(interaction) {
    try {
      // Implement in subclass
      throw new Error('executeInteraction() must be implemented');
    } catch (error) {
      // Automatic error handling
      logger.error(`Command ${this.name} failed:`, error);
      await sendError(interaction, 'An error occurred executing this command.');
    }
  }

  register() {
    // Return self for chaining
    return this;
  }
}

module.exports = CommandBase;
```

**`src/core/CommandOptions.js`** - Unified option builder
```javascript
function buildCommandOptions(name, description, options = []) {
  // Slash command data
  const slashData = new SlashCommandBuilder()
    .setName(name)
    .setDescription(description);

  // Add options
  for (const opt of options) {
    if (opt.type === 'string') {
      slashData.addStringOption((option) =>
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
    options // Store original options for prefix commands
  };
}

module.exports = buildCommandOptions;
```

**Example Command** - `src/commands/misc/ping.js`
```javascript
const CommandBase = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');

const { data } = buildCommandOptions(
  'ping',
  'Check bot latency'
);

class PingCommand extends CommandBase {
  constructor() {
    super({
      name: 'ping',
      description: 'Check bot latency',
      data
    });
  }

  async execute(message) {
    const sent = await message.reply('Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    await message.reply(`Pong! Latency: ${latency}ms`);
  }

  async executeInteraction(interaction) {
    const sent = await interaction.reply('Pinging...');
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! Latency: ${latency}ms`);
  }
}

module.exports = new PingCommand().register();
```

### Dependencies

```json
{
  "dependencies": {
    "discord.js": "^14.11.0",
    "necrobot-core": "*",
    "necrobot-utils": "*"
  }
}
```

### Command Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `misc/` | General utilities | help, ping, info |
| `gang/` | Gang management | create-gang, list-gangs |
| `campaign/` | Campaign management | create-campaign, update-campaign |
| `quote-discovery/` | Finding quotes | random-quote, search-quotes |
| `quote-management/` | CRUD operations | add-quote, delete-quote |
| `quote-social/` | Social features | rate-quote, tag-quote |
| `quote-export/` | Data export | export-quotes |

### Command Registration Flow

```
register-commands.js
    ↓
Load all command files
    ↓
Extract SlashCommandBuilder from each
    ↓
Send to Discord API (/applications/{app_id}/commands)
    ↓
Verify registration
    ↓
Log results
```

---

## 4. necrobot-dashboard

**Status:** ✅ Active  
**Version:** 0.1.3  
**Last Release:** v0.1.3 (January 27, 2026)  
**Purpose:** Web-based management interface and data visualization

### Directory Structure

```
necrobot-dashboard/
├── src/
│   ├── pages/
│   │   ├── index.js                # Home page
│   │   ├── dashboard.js            # Main dashboard
│   │   ├── settings.js             # Guild settings
│   │   ├── api/
│   │   │   ├── guilds.js          # Guild data endpoint
│   │   │   ├── quotes.js          # Quote data endpoint
│   │   │   └── reminders.js       # Reminder data endpoint
│   │   └── _app.js                 # Next.js app wrapper
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation bar
│   │   ├── GangViewer.jsx          # Gang display
│   │   ├── CampaignForm.jsx        # Campaign entry form
│   │   ├── GuildSelector.jsx       # Guild selection
│   │   └── QuotesList.jsx          # Quotes display
│   ├── hooks/
│   │   ├── useGuilds.js            # Guild data hook
│   │   ├── useGangs.js             # Gang data hook
│   │   └── useAuth.js              # Authentication
│   ├── styles/
│   │   └── globals.css             # Global styles
│   └── utils/
│       ├── api-client.js           # API communication
│       └── formatters.js           # Data formatting
├── tests/
│   ├── unit/
│   │   ├── test-gang-viewer.test.js
│   │   └── test-use-gangs.test.js
│   └── integration/
│       └── test-dashboard-flows.test.js
├── package.json
├── next.config.js
└── README.md
```

### Key Responsibilities

1. **Web Interface**
   - Guild management dashboard
   - Data visualization
   - Settings configuration
   - Real-time updates

2. **API Integration**
   - Communicate with bot via API endpoints
   - Fetch guild-specific data
   - Update configurations
   - Handle authentication

3. **User Experience**
   - Responsive design
   - Intuitive navigation
   - Error handling
   - Loading states

4. **Data Management**
   - Cache frequently accessed data
   - Optimize API requests
   - Handle concurrent updates
   - Provide real-time feedback

### Key Technologies

- **Framework:** Next.js 14+
- **UI:** React 18+
- **Styling:** CSS Modules, Tailwind CSS
- **API:** REST endpoints via Next.js API routes
- **State:** React Context + Custom Hooks

### Example Component - GuildSelector

```javascript
import React, { useState, useEffect } from 'react';
import { useGuilds } from '../hooks/useGuilds';

export function GuildSelector({ onSelect }) {
  const { guilds, loading, error } = useGuilds();

  if (loading) return <div>Loading guilds...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="guild-selector">
      <h2>Select a Guild</h2>
      <ul>
        {guilds.map((guild) => (
          <li key={guild.id}>
            <button onClick={() => onSelect(guild)}>
              <img src={guild.icon} alt={guild.name} />
              {guild.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example Hook - useGuilds

```javascript
import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api-client';

export function useGuilds() {
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGuilds() {
      try {
        const response = await apiClient.get('/api/guilds');
        setGuilds(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGuilds();
  }, []);

  return { guilds, loading, error };
}
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "necrobot-utils": "*"
  }
}
```

---

## Submodule Dependencies

### Dependency Graph

```
┌──────────────────────┐
│  necrobot-dashboard  │
└──────────────┬───────┘
               │ depends on
               ▼
┌──────────────────────┐
│  necrobot-utils      │
└──────────────────────┘
       ▲       ▲
       │       │
   depends on dependencies on
       │       │
┌──────┴───────┴──────┐
│ necrobot-core    │
└──────────────────┘
       ▲
       │ depends on
       │
┌──────────────────────┐
│ necrobot-commands    │
└──────────────────────┘
```

### Version Management

All inter-module dependencies use workspace versions:

```json
{
  "dependencies": {
    "necrobot-core": "*",
    "necrobot-utils": "*",
    "necrobot-commands": "*"
  }
}
```

**Current Versions (January 27, 2026):**

| Module | Version | Status |
|--------|---------|--------|
| necrobot-core | 0.3.0 | ✅ Active |
| necrobot-utils | 0.2.2 | ✅ Active |
| necrobot-commands | 0.1.0 | ✅ Active |
| necrobot-dashboard | 0.1.3 | ✅ Active |

---

## Development Workflow

### Working Within a Submodule

```bash
# Navigate to submodule
cd repos/necrobot-core

# Install dependencies (all workspaces)
npm install

# Run tests for this submodule
npm test

# Run linter
npm run lint

# Run in development mode
npm run dev

# Create a release
../../scripts/create-release.sh

# Push changes
git push origin main --tags
```

### Testing Across Submodules

```bash
# Test single submodule
npm test --workspace=repos/necrobot-core

# Test all submodules
npm test -ws

# Generate coverage
npm test --workspace=repos/necrobot-utils -- --coverage
```

### Publishing Submodule to NPM

```bash
# From submodule directory
cd repos/necrobot-core

# Ensure version is updated in package.json
npm publish

# Or if using GitHub Packages:
npm publish --registry https://npm.pkg.github.com/
```

---

## Related Documentation

- [system-architecture.md](./system-architecture.md) - Overall system design
- [database-architecture.md](./database-architecture.md) - Data model and persistence
- [design-patterns.md](./design-patterns.md) - Service implementation patterns
- [guild-aware-architecture.md](./guild-aware-architecture.md) - Guild-aware design
