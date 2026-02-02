# NecroBot Utils

Shared utilities, database layer, services, and helpers for NecromundaBot.

## Overview

The `@rarsus/necrobot-utils` package provides core services and utilities used across the NecromundaBot monorepo. This package is designed to be imported by other workspaces (necrobot-core, necrobot-commands, necrobot-dashboard) to provide consistent functionality.

## Installation

```bash
npm install @rarsus/necrobot-utils
```

Or in a workspace:

```bash
npm install @rarsus/necrobot-utils --workspace=repos/necrobot-core
```

## Services

### DatabaseService

Core database abstraction layer for SQLite operations.

```javascript
const { DatabaseService } = require('@rarsus/necrobot-utils');

const db = new DatabaseService('./data/necrobot.db');
await db.initialize();

const results = db.executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
```

### DashboardAuthService

Discord OAuth 2.0 authentication service for dashboard integration.

```javascript
const { DashboardAuthService } = require('@rarsus/necrobot-utils');

const authService = new DashboardAuthService(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_CLIENT_SECRET,
  process.env.DISCORD_GUILD_ID,
  process.env.DISCORD_BOT_TOKEN
);

// Generate OAuth URL
const authUrl = authService.getAuthorizationUrl(redirectUri, state);

// Exchange code for tokens
const tokens = await authService.exchangeCodeForTokens(code, redirectUri);

// Get user profile
const profile = await authService.getUserProfile(tokens.accessToken);

// Verify guild membership
const isMember = await authService.isGuildMember(tokens.accessToken);
```

**[📚 Full API Documentation](../../docs/reference/dashboard-auth-service.md)**

## Response Helpers

Utilities for sending formatted Discord responses.

```javascript
const { sendSuccess, sendError, sendInfo, sendDM, sendDataEmbed } = require('@rarsus/necrobot-utils');

// Success message
await sendSuccess(interaction, 'Operation completed!');

// Error message (ephemeral)
await sendError(interaction, 'Something went wrong', true);

// Info message
await sendInfo(interaction, 'Here is some information');

// Send DM
await sendDM(user, 'Private message');

// Send embed with data
await sendDataEmbed(interaction, 'Title', { key: 'value' });
```

## Error Handling

Middleware for consistent error handling across commands.

```javascript
const { logError, handleCommandError, wrapCommandHandler } = require('@rarsus/necrobot-utils');

// Log errors with context
logError(error, 'Failed to process command');

// Handle command errors automatically
await handleCommandError(interaction, error);

// Wrap command handler with automatic error handling
const wrappedHandler = wrapCommandHandler(async (interaction) => {
  // Your command logic
});
```

## Development

### Running Tests

```bash
# Run all tests
npm test --workspace=repos/necrobot-utils

# Run specific test file
npm test --workspace=repos/necrobot-utils -- test-dashboard-auth-service.test.js

# Run with coverage
npm run test:coverage --workspace=repos/necrobot-utils
```

### Linting

```bash
# Check for issues
npm run lint --workspace=repos/necrobot-utils

# Auto-fix issues
npm run lint:fix --workspace=repos/necrobot-utils
```

### Formatting

```bash
# Check formatting
npm run format:check --workspace=repos/necrobot-utils

# Auto-format
npm run format --workspace=repos/necrobot-utils
```

## Testing

This package includes comprehensive test coverage:

- ✅ DatabaseService: 28 tests
- ✅ DashboardAuthService: 33 tests (91.46% coverage)
- ✅ Response Helpers: 13 tests
- ✅ Overall: >85% test coverage

## Dependencies

### Production

- `better-sqlite3` - SQLite3 database driver
- `dotenv` - Environment variable management

### Development

- `jest` - Testing framework
- `eslint` - Code linting
- `prettier` - Code formatting

## Package Information

- **Name**: `@rarsus/necrobot-utils`
- **Version**: 1.0.0
- **License**: MIT
- **Repository**: [Rarsus/necromundabot](https://github.com/Rarsus/necromundabot)
- **Directory**: `repos/necrobot-utils`

## Related Packages

- `@rarsus/necrobot-core` - Discord.js client and event handling
- `@rarsus/necrobot-commands` - Discord slash commands
- `@rarsus/necrobot-dashboard` - Web dashboard (React/Next.js)

## Documentation

- [DashboardAuthService API Reference](../../docs/reference/dashboard-auth-service.md)
- [Architecture Documentation](../../docs/architecture/)
- [Testing Guides](../../docs/testing/)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.
