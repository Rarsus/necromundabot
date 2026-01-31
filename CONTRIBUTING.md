# Contributing to NecromundaBot

Thank you for contributing to NecromundaBot! This is a monorepo containing 4 npm workspaces that together form the bot, utilities, commands, and dashboard.

---

## Before You Start

1. Read the [Code of Conduct](./CODE_OF_CONDUCT.md) - Community standards
2. Review the [Definition of Done](./DEFINITION-OF-DONE.md) - Quality requirements
3. Understand the [Monorepo Structure](./docs/guides/MONOREPO.md) - How workspaces are organized
4. Understand the [Copilot Instructions](./github/copilot-instructions.md) - Development patterns and TDD workflow (for AI-assisted development)

---

---

## Repository Structure

The NecromundaBot monorepo contains 4 npm workspaces:

```
repos/
├── necrobot-utils            (v0.2.4) - Shared services & utilities
│   └── Exports: DatabaseService, response helpers, middleware
│   └── Dependency: none (clean isolation layer)
│
├── necrobot-core             (v0.3.4) - Core Discord bot functionality
│   ├── Exports: CommandLoader, event handlers
│   └── Dependencies: necrobot-utils
│
├── necrobot-commands         (v0.3.0) - All Discord slash commands
│   ├── Organized by: misc, battle, campaign, gang, social
│   └── Dependencies: necrobot-core, necrobot-utils
│
└── necrobot-dashboard        (v0.2.3) - React/Next.js web UI
    └── Dependencies: necrobot-utils
```

### Dependency Graph

```
necrobot-utils (no dependencies) → foundation layer
    ↓
necrobot-core (depends on utils) → bot logic
    ↓
necrobot-commands (depends on core, utils) → all commands
    ↓
necrobot-dashboard (depends on utils) → web UI
```

**Key Principle:** Never import upward in the dependency chain. Commands cannot import from core, for example.

---

## Development Setup

### Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **Git**: For version control
- **Docker**: For local testing (optional but recommended)

### First-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/Rarsus/necromundabot.git
cd necromundabot

# 2. Verify Node.js version (22+)
node --version

# 3. Install dependencies for all workspaces
npm ci --workspaces

# 4. Verify setup
npm test                       # All tests should pass (145/145)
npm run lint                   # No lint errors
docker-compose pull            # Prepare Docker images
```

### Daily Development

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes, test frequently
npm test                         # Test all workspaces
npm test --workspace=repos/YOUR_MODULE  # Test specific module

# Format and lint
npm run lint:fix                # Auto-fix linting issues

# When ready to commit
git add .
git commit -m "feat: Your feature description"  # Use conventional commits
git push origin feature/your-feature

# Create Pull Request on GitHub
```

---

## Contribution Types

### 1. New Commands (necrobot-commands)

Commands provide Discord slash command functionality. See [Creating a New Discord Command](./docs/user-guides/creating-commands.md) for detailed instructions.

**Requirements:**

- Command has all 4 required properties: `name`, `description`, `data` (SlashCommandBuilder), `executeInteraction`
- TDD workflow: tests written first, then implementation
- 80%+ test coverage
- ESLint passes
- Works in Discord

Example command structure:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'mycommand',
  description: 'Description of what the command does',
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Description of what the command does')
    .addStringOption((option) => option.setName('text').setDescription('Input text').setRequired(true)),
  async executeInteraction(interaction) {
    const input = interaction.options.getString('text');
    await interaction.editReply(`You said: ${input}`);
  },
};
```

### 2. Services & Utilities (necrobot-utils)

Services provide shared functionality used by other modules.

**Requirements:**

- 90%+ test coverage (highest standard)
- No dependencies on other necrobot packages (clean isolation)
- Properly exported from `src/index.js`
- Guild-aware where applicable
- Comprehensive error handling

Example service:

```javascript
class MyService {
  constructor(db) {
    this.db = db;
  }

  async getData(guildId, id) {
    if (!guildId) throw new Error('Guild context required');
    return await this.db.query('SELECT * FROM table WHERE guildId = ? AND id = ?', [guildId, id]);
  }
}

module.exports = MyService;
```

### 3. Core Functionality (necrobot-core)

Core handles bot initialization, event handling, and command loading.

**Requirements:**

- 85%+ test coverage
- Proper error handling and logging
- Graceful shutdown handling
- Discord.js best practices

### 4. Dashboard Components (necrobot-dashboard)

Dashboard provides web UI for bot management using React/Next.js.

**Requirements:**

- Functional React components (use Hooks)
- 80%+ test coverage
- Accessibility compliance (WCAG AA)
- Responsive design (mobile-first)
- Proper TypeScript types if using TypeScript

Dashboard-specific guidelines:

- Use CSS Modules or styled-components
- Components should be reusable
- Support dark mode if applicable
- Proper loading and error states

Example dashboard component:

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}

export default UserProfile;
```

---

## Testing Requirements (TDD Mandatory)

**All code changes require Test-Driven Development (TDD) workflow:**

1. **RED Phase** - Write failing tests first
2. **GREEN Phase** - Write minimal code to pass tests
3. **REFACTOR Phase** - Improve code while keeping tests passing

### Coverage Standards

| Module Type   | Lines | Functions | Branches |
| ------------- | ----- | --------- | -------- |
| Core Services | 85%+  | 90%+      | 80%+     |
| Commands      | 80%+  | 85%+      | 75%+     |
| Utilities     | 90%+  | 95%+      | 85%+     |
| New Features  | 90%+  | 95%+      | 85%+     |

### Running Tests

```bash
# All tests in all workspaces
npm test

# Specific workspace
npm test --workspace=repos/necrobot-core

# Specific test file
npm test -- test-my-service.test.js

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage --workspace=repos/necrobot-core
```

### Test Example

```javascript
const assert = require('assert');
const { DatabaseService } = require('necrobot-utils');

describe('MyService', () => {
  let db;
  let service;

  beforeEach(async () => {
    db = new DatabaseService(':memory:');
    await db.initialize();
    service = new MyService(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('should fetch data for specific guild', async () => {
    const data = await service.getData('guild-123', 1);
    assert.ok(data);
    assert.strictEqual(data.guildId, 'guild-123');
  });

  it('should throw error without guild context', async () => {
    try {
      await service.getData(null, 1);
      assert.fail('Should have thrown');
    } catch (error) {
      assert.ok(error.message.includes('guild'));
    }
  });
});
```

---

## Commit Message Format

This project uses **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body (optional)>

<footer (optional)>
```

### Type

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code restructuring
- `style:` - Formatting/style changes
- `perf:` - Performance improvements
- `chore:` - Maintenance/dependencies
- `ci:` - CI/CD changes
- `revert:` - Revert previous commit

### Scope

Optional, but helpful. Examples:

- `feat(commands): add new roll command`
- `fix(core): resolve event handler crash`
- `docs(guides): update testing documentation`
- `refactor(utils): extract database logic`

### Subject

- Imperative mood ("add" not "adds" or "added")
- Lowercase first letter
- No period at end
- 50 characters or less

### Examples

```bash
# New feature
git commit -m "feat(commands): add quote search functionality"

# Bug fix
git commit -m "fix(core): resolve Discord event timeout"

# Documentation
git commit -m "docs: update contributing guidelines"

# Refactoring
git commit -m "refactor(utils): consolidate database access patterns"

# Multiple lines
git commit -m "feat(dashboard): add user statistics page

- Display guild member stats
- Add chart visualization
- Cache results for 1 hour"
```

---

## Pull Request Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/descriptive-name
# or
git checkout -b fix/issue-number
# or
git checkout -b docs/improvement
```

### 2. Make Changes & Test

```bash
# Make your changes
# ...test frequently...

# Run all checks
npm test                    # All tests pass (145/145)
npm run lint               # ESLint: 0 errors
npm run format             # Consistent formatting
docker-compose up --build -d  # Docker builds (optional)
```

### 3. Commit Changes

Use conventional commit format (see Commit Message Format above)

```bash
git add .
git commit -m "feat(commands): add new command"
```

### 4. Push to GitHub

```bash
git push origin feature/descriptive-name
```

### 5. Create Pull Request

- Title should match your commit message format
- Description should explain what changed and why
- Link related issues
- Ensure all CI checks pass
- Request review from maintainers

### PR Checklist

Before submitting a PR, verify:

- [ ] Tests written first (TDD)
- [ ] All tests passing: `npm test`
- [ ] Coverage requirements met (see standards above)
- [ ] ESLint passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Commit message uses conventional format
- [ ] PR title matches commit format
- [ ] Related issues referenced
- [ ] Documentation updated if needed
- [ ] No console.log() or debug code left
- [ ] Backwards compatibility maintained (or breaking changes documented)

---

## Code Quality Standards

### Linting & Formatting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format code
npm run format
```

### Imports & Dependencies

**Use workspace package imports, not relative paths:**

```javascript
// ✅ CORRECT - Import from workspace package
const { DatabaseService } = require('necrobot-utils');
const CommandLoader = require('necrobot-core');

// ❌ WRONG - Relative paths
const db = require('../../../repos/necrobot-utils/src/db');
const loader = require('file:../necrobot-core');
```

For inter-workspace dependencies, use `"*"` version in package.json:

```json
{
  "dependencies": {
    "necrobot-utils": "*",
    "necrobot-core": "*"
  }
}
```

### Error Handling

Always handle errors appropriately:

```javascript
// ✅ CORRECT - Proper error handling
try {
  const result = await someOperation();
  if (!result) {
    throw new Error('Expected result not found');
  }
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  throw new Error(`Failed to perform operation: ${error.message}`);
}

// ❌ WRONG - Silent failures
try {
  await someOperation();
} catch (error) {
  // Silently ignored
}
```

### Guild Context

Always include guild context for data operations:

```javascript
// ✅ CORRECT - Guild-aware
async getData(guildId, id) {
  return await this.db.get('SELECT * FROM table WHERE guildId = ? AND id = ?', [guildId, id]);
}

// ❌ WRONG - No guild isolation
async getData(id) {
  return await this.db.get('SELECT * FROM table WHERE id = ?', [id]);
}
```

---

## Workspace-Specific Guidelines

### necrobot-utils

- Pure services, no Discord.js dependencies
- Highest test coverage: 90%+
- Exported via `src/index.js`
- Guild-aware where applicable
- Database service foundation for others

### necrobot-core

- Discord bot initialization and events
- Command registration and loading
- 85%+ test coverage
- Depends only on necrobot-utils
- No command implementations

### necrobot-commands

- Organized by category: misc, battle, campaign, gang, social
- Each command: separate file with 4 required properties
- 80%+ test coverage per command
- Depends on necrobot-core and necrobot-utils
- Use shared response helpers from necrobot-utils

### necrobot-dashboard

- React/Next.js web UI
- 80%+ test coverage on components
- Functional components using Hooks
- Accessible (WCAG AA compliance)
- Responsive mobile-first design

---

## Local Development with Docker

### Build Local Image

```bash
# Build both bot and dashboard containers
docker-compose up --build -d

# View logs
docker logs necromundabot -f
docker logs necromundabot-dashboard -f

# Stop containers
docker-compose down
```

### Test in Discord

1. Start the bot: `docker-compose up --build -d`
2. Wait for startup logs
3. In Discord server, test a command: `/ping`
4. Check logs: `docker logs necromundabot | tail -20`

### Common Docker Commands

```bash
# Rebuild without cache
docker-compose up --build --no-cache -d

# Stop and remove everything
docker-compose down && docker system prune -f

# View specific container logs
docker logs -f necromundabot

# Run command in container
docker exec necromundabot npm test

# Rebuild single container
docker-compose up -d --build necromundabot
```

---

## Performance Considerations

### Database Queries

- Use prepared statements (parameterized queries)
- Cache results when appropriate
- Avoid N+1 queries
- Use indexes on frequently queried columns
- Guild-specific queries for isolation

### Discord.js

- Don't fetch data on every interaction (cache when possible)
- Use bulk operations when available
- Proper rate-limit handling
- Efficient permission checking
- Message caching strategies

### General

- Minimize dependencies
- Tree-shake unused code
- Lazy load heavy modules
- Profile performance regularly
- Monitor bot memory usage

---

## Questions & Support

- **Monorepo Questions?** → See [Monorepo Guide](./docs/guides/MONOREPO.md)
- **How to write tests?** → See [Testing Patterns](./docs/testing/TESTING-PATTERNS.md)
- **Need help with commands?** → See [Creating Commands](./docs/user-guides/creating-commands.md)
- **Docker issues?** → See [Docker Guide](./docs/guides/DOCKER.md)
- **Code of Conduct questions?** → See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

## Recognition

Contributors who submit quality PRs following this guide will be recognized in:

- Project README.md
- Releases notes
- GitHub contributors page

Thank you for making NecromundaBot better! 🎉
