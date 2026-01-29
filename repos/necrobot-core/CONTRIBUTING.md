# Contributing to necrobot-core

Thank you for contributing to necrobot-core! This module provides core Discord bot infrastructure, middleware, and event handling.

---

## Before You Start

1. Read the [Definition of Done](./DEFINITION-OF-DONE.md)
2. Review the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Follow [Main Contributing Guidelines](../../CONTRIBUTING.md)
4. Understand the bot lifecycle and middleware chain

---

## Contribution Types

### 1. Event Handlers

Event handlers should:
- **Extend EventBase** from core
- **Be non-blocking** (use async)
- **Handle errors gracefully**
- **Log with context**

Example:
```javascript
const EventBase = require('../core/EventBase');

class ReadyEvent extends EventBase {
  constructor() {
    super({ name: 'ready' });
  }

  async execute(client) {
    // Handle ready event
  }
}

module.exports = new ReadyEvent().register();
```

### 2. Middleware

Middleware should:
- **Chain errors properly**
- **Not mutate input**
- **Have clear responsibilities**
- **Be tested with mocks**

Example:
```javascript
async function errorHandler(interaction, error) {
  logger.error('Command error', { 
    command: interaction.commandName, 
    error: error.message 
  });
  
  try {
    await sendError(interaction, 'An error occurred');
  } catch (e) {
    logger.error('Error handler failed', e);
  }
}

module.exports = { errorHandler };
```

### 3. Services

Services should:
- **Be guild-aware** if needed
- **Have clear interfaces**
- **Be fully testable**
- **Handle Discord API limits**

---

## Testing Requirements

All changes require tests:

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/unit/test-event.test.js

# Check coverage
npm test -- --coverage
```

Test requirements:
- ✅ Event execution flow
- ✅ Error handling paths
- ✅ Middleware chain
- ✅ Mock Discord.js interactions
- ✅ Edge cases and boundaries

---

## Commit Message Format

This project uses **Semantic Versioning** with **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature (MINOR version bump)
- `fix` - Bug fix (PATCH version bump)
- `docs` - Documentation (no version change)
- `test` - Tests (no version change)
- `refactor` - Refactoring (no version change)
- `chore` - Maintenance (no version change)

**Examples:**
```bash
# New event handler
git commit -m "feat(events): add custom event handler"

# Bug fix
git commit -m "fix(middleware): resolve error chain issue"

# Breaking change
git commit -m "feat(core): restructure middleware interface

BREAKING CHANGE: Middleware signature changed from (interaction) to (interaction, context)"
```

---

## Development Workflow

1. **Fork & Clone**: Fork the repository
2. **Create Branch**: `feature/my-feature` or `bugfix/issue-name`
3. **Write Tests First**: TDD is mandatory
4. **Implement**: Code implementation
5. **Run Tests**: `npm test` must pass
6. **Lint Code**: `npm run lint` must pass
7. **Format**: `npm run format` for consistency
8. **Commit**: Use semantic commit messages
9. **Push**: Push to your fork
10. **Pull Request**: Create PR with description

---

## Pull Request Checklist

- [ ] Tests written first (TDD)
- [ ] All tests pass: `npm test`
- [ ] Coverage thresholds met
- [ ] ESLint passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] CHANGELOG.md updated
- [ ] Semantic commit message used
- [ ] Related issues referenced
- [ ] Documentation updated if needed

---

## Architecture Notes

### Bot Lifecycle

1. Bot initializes
2. Events register
3. Middleware chains
4. Commands execute
5. Errors handled gracefully

### Error Handling

Errors flow through:
1. Command execution
2. ErrorHandler middleware
3. Logger
4. User notification

### Discord Limits

- Rate limiting: 10 requests per 10 seconds
- Message size: 2000 characters max
- Embed limit: 6000 characters total
- Timeout: 3 seconds per interaction

---

## Questions?

- Review [Main CONTRIBUTING.md](../../CONTRIBUTING.md)
- Check [Definition of Done](./DEFINITION-OF-DONE.md)
- Read [README.md](./README.md)
