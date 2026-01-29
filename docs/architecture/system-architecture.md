# NecromundaBot System Architecture

## Overview

NecromundaBot is a modular Discord bot built with a **submodule-based architecture** using Git submodules and NPM workspaces. The system is organized into independent, focused modules with clear responsibilities and dependency boundaries.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    NecromundaBot (Main Repo)                    │
│                   NPM Workspace Hub                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  necrobot-core   │  │ necrobot-utils   │  │necrobot-dash │  │
│  │                  │  │                  │  │ board        │  │
│  │ • Bot Engine     │  │ • Services       │  │              │  │
│  │ • Events         │  │ • Database       │  │ • UI Pages   │  │
│  │ • Middleware     │  │ • Validation     │  │ • Components │  │
│  │ • Handlers       │  │ • Helpers        │  │ • Routes     │  │
│  │                  │  │                  │  │              │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │          │
│           └─────────────────────┼────────────────────┘          │
│                                 │                               │
│           ┌─────────────────────▼──────────────────┐            │
│           │   necrobot-commands (Phase 2.5)       │            │
│           │                                        │            │
│           │ • Discord Commands                    │            │
│           │ • Command Organization                │            │
│           │ • Category Structure                  │            │
│           └────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Principles

### 1. Modularity
- Each module has a single, well-defined responsibility
- Modules are independently versioned and released
- Modules communicate through clear interfaces

### 2. Separation of Concerns
- **Bot Engine** (necrobot-core): Discord.js integration, event handling
- **Services** (necrobot-utils): Business logic, database operations
- **Presentation** (necrobot-dashboard): Web UI
- **Commands** (necrobot-commands): Discord command implementations

### 3. Dependency Flow
```
necrobot-dashboard ──┐
                     ├─→ necrobot-utils
necrobot-commands ───┤
                     │
necrobot-core ───────┘
```

**Rule:** Lower layers should NOT depend on higher layers.

### 4. Guild-Aware Architecture
All data operations enforce **mandatory guild context** to enable:
- Multi-guild isolation
- Per-guild configuration
- Scalable architecture

## Submodule Responsibilities

### necrobot-core

**Purpose:** Discord bot engine and core infrastructure

**Responsibilities:**
- Discord.js client initialization
- Event handler registration and execution
- Middleware pipeline (logging, error handling)
- Bot lifecycle management
- Interaction routing (slash commands, message commands)

**Key Files:**
- `src/index.js` - Bot entry point
- `src/core/EventBase.js` - Event handler base class
- `src/middleware/` - Cross-cutting concerns
- `src/events/` - Event handlers

**Dependencies:**
- Discord.js 14.11.0
- necrobot-utils (services layer)

**Exports:**
- Bot client instance
- Event management system
- Middleware pipeline

### necrobot-utils

**Purpose:** Shared services and utilities layer

**Responsibilities:**
- Database operations (SQLite)
- Business logic (quotes, reminders, validations)
- Discord message formatting (embeds, responses)
- Data validation and helpers
- Guild-aware service layer

**Key Files:**
- `src/services/` - Service implementations
- `src/middleware/` - Error handling, logging
- `src/utils/helpers/` - Formatting and utilities
- `src/constants/` - Constants and configurations

**Dependencies:**
- None (no dependencies on other modules)

**Exports:**
- Database services
- Validation services
- Response helpers
- Utility functions

### necrobot-commands

**Purpose:** Centralized command management

**Responsibilities:**
- Discord command implementations
- Command registration (slash + prefix)
- Command category organization
- Option building and validation
- Command-specific error handling

**Key Files:**
- `src/core/CommandBase.js` - Command base class
- `src/core/CommandOptions.js` - Options builder
- `src/commands/` - Command implementations
- `src/register-commands.js` - Registration script

**Dependencies:**
- necrobot-core (for Discord.js integration)
- necrobot-utils (for services and helpers)

**Exports:**
- Command implementations
- Command registration function

### necrobot-dashboard

**Purpose:** Web-based management interface

**Responsibilities:**
- Guild settings and configuration
- Data visualization and reporting
- Server management interface
- Real-time status updates

**Key Files:**
- `src/pages/` - Next.js pages
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/utils/` - API clients and helpers

**Dependencies:**
- necrobot-utils (for data access)

**Exports:**
- Next.js application

## Data Flow Patterns

### Command Execution Flow

```
Discord User Command
        │
        ▼
┌──────────────────────────┐
│  necrobot-core          │
│  - Intercept interaction │
│  - Route to handler      │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│  necrobot-commands       │
│  - Load command          │
│  - Execute handler       │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│  necrobot-utils          │
│  - Access services       │
│  - Fetch/update data     │
│  - Validate input        │
└───────────┬──────────────┘
            │
            ▼
        Database
```

### Service Layer Pattern

```
Command Handler
        │
        ▼
ServiceLayer (QuoteService, ValidationService, etc.)
        │
        ├─ DatabaseService ──→ SQLite Database
        ├─ ValidationService ─→ Business Rules
        └─ HelperService ────→ Utilities
```

## Layer Architecture

### Presentation Layer
- **Discord Commands** (necrobot-commands)
- **Dashboard UI** (necrobot-dashboard)
- Responsible for: User interaction, command parsing, UI rendering

### Application Layer
- **Command Handlers** (necrobot-commands)
- **Event Handlers** (necrobot-core)
- Responsible for: Business logic orchestration, error handling

### Service Layer
- **Services** (necrobot-utils)
  - Database operations
  - Validation logic
  - Business calculations
- Responsible for: Core business logic, data access

### Infrastructure Layer
- **Middleware** (necrobot-core, necrobot-utils)
- **Database** (SQLite)
- **Discord.js Integration** (necrobot-core)
- Responsible for: Cross-cutting concerns, external integration

## Communication Patterns

### Intra-Module (within necrobot-core)
```javascript
// Direct imports and function calls
const EventHandler = require('../events/EventHandler');
const handler = new EventHandler();
```

### Inter-Module (between submodules)
```javascript
// Workspace dependency resolution
const DatabaseService = require('../../necrobot-utils/src/services/DatabaseService');
const { sendSuccess } = require('../../necrobot-utils/src/utils/helpers/response-helpers');
```

### NPM Workspace Resolution
```json
{
  "dependencies": {
    "necrobot-utils": "*"
  }
}
```
- Resolves to local module during development
- Resolves to published version when consumed as package

## Dependency Management

### Workspace Dependencies (Production)

```
necrobot-core
  └─→ necrobot-utils (*)

necrobot-commands
  ├─→ necrobot-core (*)
  └─→ necrobot-utils (*)

necrobot-dashboard
  └─→ necrobot-utils (*)
```

### External Dependencies

```
necrobot-core
  └─→ discord.js (14.11.0)

necrobot-utils
  └─→ sqlite3 (5.1.7)

necrobot-dashboard
  └─→ react
  └─→ next.js
```

**Important:** Version `"*"` in workspace dependencies ensures:
- Automatic resolution to local workspace version during development
- Proper version pinning when published to npm
- Version independence between modules

## Guild-Aware Architecture

All data operations are guild-scoped to support:
- Multi-guild deployments
- Guild-specific configurations
- Data isolation
- Scalability

### Guild Context Pattern

```javascript
// Every operation requires explicit guild context
async function getQuotes(guildId) {
  // Get quotes only for this guild
  return db.query('SELECT * FROM quotes WHERE guild_id = ?', [guildId]);
}

// Service layer enforces guild context
class QuoteService {
  async getQuotes(guildId) {
    return await this.db.getGuildQuotes(guildId);
  }
}
```

### Database Schema with Guild Context

```sql
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,    -- ← Guild context
  content TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP
);

CREATE INDEX idx_guild_quotes ON quotes(guild_id);
```

## Error Handling Architecture

### Layered Error Handling

```
Discord Command
    │
    ├─ CommandBase ──→ Catches and wraps errors
    │
    ├─ Service Layer ──→ Business logic errors
    │
    ├─ Middleware ──→ Cross-cutting error handling
    │
    └─ Database Layer ──→ Data operation errors
```

### Error Flow

```
Try to execute command
    │
    ├─ Success ──→ Send response to user
    │
    ├─ Validation Error ──→ ErrorHandler ──→ sendError()
    │
    ├─ Database Error ──→ ErrorHandler ──→ Log + sendError()
    │
    └─ Unexpected Error ──→ ErrorHandler ──→ Log + Fallback Response
```

## Testing Architecture

### Test Organization

```
necrobot-core/tests/
  ├─ unit/
  │  ├─ test-event-base.test.js
  │  ├─ test-error-handler.test.js
  │  └─ test-middleware.test.js
  └─ integration/
     └─ test-event-handlers.test.js

necrobot-utils/tests/
  ├─ unit/
  │  ├─ test-database-service.test.js
  │  ├─ test-validation-service.test.js
  │  └─ test-response-helpers.test.js
  └─ integration/
     └─ test-database-operations.test.js
```

### Test Patterns

1. **Unit Tests** - Test individual functions/methods in isolation
2. **Integration Tests** - Test multiple components working together
3. **Service Tests** - Test business logic with real dependencies (in-memory DB)
4. **Mocking** - Mock external services (Discord.js, HTTP clients)

## Deployment Architecture

### Development Environment
```
Local Machine
  ├─ Node.js 22+
  ├─ npm workspace resolution (local modules)
  ├─ SQLite database (local file)
  └─ Discord bot token (.env)
```

### Production Environment
```
Server/Container
  ├─ Node.js 22+ runtime
  ├─ Published npm packages (from npm registry)
  ├─ SQLite database (persistent storage)
  ├─ Environment variables
  └─ Discord bot token (secrets management)
```

### Docker Architecture
```
Dockerfile
  ├─ Base: Node.js 22
  ├─ Install dependencies
  ├─ Copy application code
  ├─ Expose port (for dashboard)
  └─ Run bot
```

## Version Management

### Independent Versioning
Each module is independently versioned using Semantic Versioning:

```
necrobot-core: 0.3.0
necrobot-utils: 0.2.2
necrobot-dashboard: 0.1.3
necrobot-commands: 0.1.0
```

### Version Compatibility
- Workspace `"*"` dependencies ensure compatibility during development
- Published packages track actual semantic versions
- Breaking changes trigger MAJOR version bumps

## Key Design Decisions

### 1. Why Git Submodules?
- Independent version control
- Clear module boundaries
- Allows external consumers to depend on submodules
- Enables parallel development

### 2. Why NPM Workspaces?
- Unified dependency management
- Local development without npm install
- Simulates production npm resolution
- Simplifies CI/CD

### 3. Why Guild-Aware Architecture?
- Prevents cross-guild data leaks
- Supports multi-guild deployments
- Enables per-guild customization
- Scales to thousands of guilds

### 4. Why Service Layer?
- Business logic separation from Discord handling
- Testability (can test without Discord.js mocks)
- Reusability across commands
- Easier to understand and maintain

### 5. Why CommandBase Class?
- Consistent error handling across all commands
- Automatic logging and metrics
- Unified option handling
- Reduced boilerplate code

## Extension Points

### Adding New Commands
1. Create in `necrobot-commands/src/commands/{category}/{command-name}.js`
2. Extend `CommandBase`
3. Implement `execute()` and `executeInteraction()`
4. Use shared services from `necrobot-utils`

### Adding New Services
1. Create in `necrobot-utils/src/services/{ServiceName}.js`
2. Export from `src/index.js`
3. Test in `tests/unit/test-{service-name}.test.js`
4. Use from commands and other services

### Adding New Events
1. Create in `necrobot-core/src/events/{event-name}.js`
2. Extend `EventBase`
3. Register in bot initialization
4. Use shared services from `necrobot-utils`

### Adding Dashboard Features
1. Create React component in `necrobot-dashboard/src/components/`
2. Create Next.js page in `necrobot-dashboard/src/pages/`
3. Use API client from `necrobot-utils` services
4. Add tests in `tests/`

## Scalability Considerations

### Current Limitations
- Single SQLite database (suitable for ~10,000 guilds)
- All data in-memory (consider caching for large deployments)
- No clustering support (single bot instance)

### Future Scaling Options
- PostgreSQL for distributed deployments
- Redis caching layer
- Multiple bot instances with message queue
- Microservices architecture (split by domain)

## Security Architecture

### Data Protection
- Guild context isolation (prevent cross-guild access)
- Database query parameterization (SQL injection prevention)
- Input validation at service layer
- Error messages don't leak sensitive information

### Permission Checking
- Discord permission validation before command execution
- Role-based access control for sensitive operations
- Admin-only command separation

### Secrets Management
- `.env` file (never committed)
- Environment variables for sensitive data
- Discord bot token protection
- API keys in secure storage

## Related Documentation

- [submodule-architecture.md](./submodule-architecture.md) - Detailed submodule structure
- [database-architecture.md](./database-architecture.md) - Data model and persistence
- [design-patterns.md](./design-patterns.md) - Design pattern implementations
- [guild-aware-architecture.md](./guild-aware-architecture.md) - Guild isolation patterns
