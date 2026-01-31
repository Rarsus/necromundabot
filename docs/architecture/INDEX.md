# Architecture Documentation Index

Complete architecture and design documentation for NecromundaBot.

## Core Architecture

### [system-architecture.md](./system-architecture.md)

**High-level system overview and component relationships**

- Architecture diagram showing all components
- Core principles (modularity, separation of concerns, dependency flow)
- Submodule responsibilities (necrobot-core, necrobot-utils, necrobot-commands, necrobot-dashboard)
- Data flow patterns (command execution, service layer)
- Layer architecture (presentation, application, service, infrastructure)
- Guild-aware architecture fundamentals
- Error handling architecture
- Testing architecture
- Deployment architecture
- Version management
- Key design decisions
- Extension points
- Scalability considerations

**Best for:** Getting a complete system overview, understanding how components interact

---

### [submodule-architecture.md](./submodule-architecture.md)

**Detailed structure and responsibilities of each npm workspace**

#### necrobot-core (Bot Engine)

- Directory structure and key files
- Bot initialization and lifecycle
- Event management and routing
- Middleware pipeline
- Event flow patterns
- Dependencies and exports

#### necrobot-utils (Services & Utilities)

- Service layer implementation
- Database operations and abstraction
- Business logic services (QuoteService, ReminderService)
- Validation and helpers
- Guild-aware architecture
- Response formatting helpers

#### necrobot-commands (Discord Commands)

- Command structure and organization
- CommandBase implementation
- CommandOptions builder
- Command categories and examples
- Command registration flow
- Dependencies and version info

#### necrobot-dashboard (Web UI)

- Dashboard structure and components
- React hooks and state management
- API integration patterns
- Example components and hooks
- Technologies and dependencies

**Best for:** Understanding individual submodule responsibilities, navigating specific module code

---

### [database-architecture.md](./database-architecture.md)

**Data model, schema design, and persistence patterns**

- Design principles (guild-aware, immutability, referential integrity)
- Schema overview with relationship diagrams
- Complete table definitions:
  - QUOTES (quote storage)
  - RATINGS (user ratings)
  - TAGS (quote categories)
  - QUOTE_TAGS (many-to-many relationships)
- Guild-aware enforcement patterns
- Service layer architecture (three-tier approach)
- Query patterns and examples
- Performance optimization (indexing, query optimization)
- Scalability considerations and limits
- Automatic initialization and migrations
- Backup and recovery procedures
- Security considerations (SQL injection prevention, validation)
- Testing database operations
- Real-world examples

**Best for:** Understanding data model, writing database queries, optimizing performance

---

### [design-patterns.md](./design-patterns.md)

**Software design patterns used throughout the codebase**

12 Design Patterns Explained:

1. **Command Pattern** - Command encapsulation (CommandBase)
2. **Service Layer Pattern** - Business logic separation
3. **Repository Pattern** - Data access abstraction
4. **Middleware Pattern** - Cross-cutting concerns (error handling, logging)
5. **Builder Pattern** - Complex object construction (CommandOptions)
6. **Factory Pattern** - Object creation abstraction
7. **Adapter Pattern** - Interface conversion (Discord API adaptation)
8. **Template Method Pattern** - Algorithm skeleton (Command lifecycle)
9. **Decorator Pattern** - Dynamic behavior addition (Middleware wrapping)
10. **Strategy Pattern** - Algorithm family encapsulation (Validation strategies)
11. **Observer Pattern** - Event notification system
12. **Singleton Pattern** - Single instance management (with caveats)

- Pattern selection guide table
- SOLID principles (SRP, OCP, LSP, ISP, DIP)
- Design principles (DRY, KISS, YAGNI, Fail Fast)
- Implementation examples for each pattern
- Benefits and when to use

**Best for:** Understanding design decisions, learning architecture patterns, implementing new features consistently

---

### [guild-aware-architecture.md](./guild-aware-architecture.md)

**Guild context enforcement and multi-guild data isolation**

- Why guild-aware architecture is necessary
- Core principles (mandatory context, validation, isolation)
- Database schema with guild context
- Guild-scoped indexes for performance
- Service layer implementation (database, business logic)
- Command implementation with guild extraction
- Guild validation middleware
- Complete testing examples:
  - Unit tests for guild context
  - Guild isolation tests
  - Integration tests across guilds
- Scalability options (read replicas, per-guild DBs, sharding)
- Best practices (DO/DON'T guidelines)

**Best for:** Understanding guild isolation, implementing guild-aware features, testing multi-guild scenarios

---

## Architecture Layers

```
┌──────────────────────────────────────────────────┐
│        Presentation Layer                        │
│ (Discord Commands, Dashboard, User Interface)    │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│        Application Layer                         │
│ (Command Handlers, Event Handlers, Orchestration)│
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│        Service Layer                             │
│ (Business Logic, Validation, Data Operations)    │
└────────────────┬─────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────┐
│        Infrastructure Layer                      │
│ (Database, Discord.js, Middleware)               │
└──────────────────────────────────────────────────┘
```

## Key Architectural Concepts

### Modularity & Independence

- 4 independent npm workspaces (single git repository)
- Each with own version, tests, and responsibility
- NPM workspace resolution for local development
- Clear dependency boundaries

### Guild-Aware Design

- **Mandatory guild context** for all data operations
- Data isolation across guilds
- Supports 10,000+ guilds in single database
- Per-guild customization capability

### Service Layer Pattern

- **DatabaseService** - Low-level database access
- **GuildAwareDatabaseService** - Guild context enforcement
- **BusinessServices** (QuoteService, etc.) - High-level logic
- **Helpers** - Formatting, validation, utilities

### Command Pattern

- **CommandBase** - Automatic error handling and lifecycle
- **Unified options** - Same definition for slash + prefix
- **Guild context extraction** - Automatic from interaction
- **Response helpers** - Consistent Discord formatting

### Event-Driven Architecture

- Discord.js events trigger handlers
- Service layer executes business logic
- Async/await for all I/O operations
- Error handling with middleware

## Development Workflows

### Adding a New Command

1. Choose appropriate category under `repos/necrobot-commands/src/commands/`
2. Extend `CommandBase`
3. Use `buildCommandOptions()` for options
4. Extract `guildId` from interaction
5. Call services with guild context
6. Use response helpers for Discord messages
7. Write tests with TDD approach
8. Register with Discord API

### Adding a New Service

1. Create in `repos/necrobot-utils/src/services/`
2. Accept `db` in constructor (dependency injection)
3. Validate guild context in all methods
4. Implement business logic
5. Write unit tests with in-memory database
6. Export from `repos/necrobot-utils/src/index.js`
7. Use from commands via import

### Adding Database Feature

1. Add table to schema in `schema-enhancement.js`
2. Create migration if altering existing table
3. Create guild-aware service for data access
4. Write tests verifying guild isolation
5. Update documentation
6. Test in both development and staging

### Release Workflow

1. Make changes and commit with conventional commit messages
2. Run tests: `npm test`
3. Run linter: `npm run lint`
4. Create release: `./scripts/create-release.sh`
5. Push with tags: `git push origin main --tags`
6. Publish to npm if applicable

## Versioning

| Component          | Current Version | Status    |
| ------------------ | --------------- | --------- |
| necrobot-core      | 0.3.0           | ✅ Active |
| necrobot-utils     | 0.2.2           | ✅ Active |
| necrobot-commands  | 0.1.0           | ✅ Active |
| necrobot-dashboard | 0.1.3           | ✅ Active |

**Versioning Scheme:** Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR:** Breaking changes
- **MINOR:** New features (new source files in src/)
- **PATCH:** Bug fixes, refactors, tests

## Performance Characteristics

| Operation        | Target      | Current      |
| ---------------- | ----------- | ------------ |
| Bot startup      | < 3 seconds | ~1-2 seconds |
| Command response | < 200ms     | ~50-100ms    |
| Database query   | < 100ms     | ~10-50ms     |
| Code coverage    | 90%+        | 79.5% lines  |

## Testing Overview

### Test Organization

- Unit tests: Single function/class in isolation
- Integration tests: Multiple components together
- Service tests: Business logic with real dependencies
- Command tests: Discord command execution

### Coverage Requirements

- necrobot-core: 85%+ lines
- necrobot-utils: 90%+ lines
- necrobot-commands: 80%+ lines
- necrobot-dashboard: 85%+ lines

### Test Patterns

- In-memory SQLite for database tests
- Mock Discord.js for interaction tests
- Dependency injection for isolation
- Guild context validation in tests
- Cross-guild isolation verification

## Security & Reliability

### Data Protection

- ✅ Guild context isolation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation at service layer
- ✅ Error messages don't leak sensitive info

### Error Handling

- ✅ CommandBase catches all errors
- ✅ Middleware provides logging
- ✅ User-friendly error messages
- ✅ Graceful failure modes

### Testing & Quality

- ✅ TDD-first development
- ✅ 100% test pass rate
- ✅ ESLint for code quality
- ✅ Prettier for code formatting

## Quick Links

### Getting Started

- [system-architecture.md](./system-architecture.md) - Start here for overview
- [submodule-architecture.md](./submodule-architecture.md) - Understand module structure
- [database-architecture.md](./database-architecture.md) - Learn data model

### Implementation Guides

- [design-patterns.md](./design-patterns.md) - Implementation patterns
- [guild-aware-architecture.md](./guild-aware-architecture.md) - Guild isolation
- [docs/guides/creating-commands.md](../user-guides/creating-commands.md) - Command creation

### Testing & Quality

- [docs/guides/testing-guide.md](../user-guides/testing-guide.md) - TDD approach
- [docs/testing/test-naming-convention-guide.md](../testing/test-naming-convention-guide.md) - Test naming
- [docs/testing/test-coverage-baseline-strategy.md](../testing/test-coverage-baseline-strategy.md) - Coverage strategy

### Operations

- [docs/guides/RELEASE-PROCESS.md](../guides/RELEASE-PROCESS.md) - Release workflow
- [docs/user-guides/docker-setup.md](../user-guides/docker-setup.md) - Docker deployment

## Document Updates

**Created:** January 27, 2026
**Last Updated:** January 27, 2026
**Status:** Complete Architecture Suite

### Document List

1. system-architecture.md - 600+ lines
2. submodule-architecture.md - 800+ lines
3. database-architecture.md - 700+ lines
4. design-patterns.md - 800+ lines
5. guild-aware-architecture.md - 600+ lines
6. INDEX.md (this file) - 400+ lines

**Total:** ~3,700 lines of architecture documentation

## See Also

- [docs/INDEX.md](../INDEX.md) - Complete documentation index
- [docs/reference/](../reference/) - Reference documentation
- [docs/best-practices/](../best-practices/) - Coding standards
- [docs/testing/](../testing/) - Testing documentation
- [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md) - Documentation standards
