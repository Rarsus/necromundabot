# Contributing to necrobot-commands

Thank you for contributing to necrobot-commands! This module contains all Discord bot commands organized by category.

---

## Before You Start

1. Read the [Definition of Done](./DEFINITION-OF-DONE.md)
2. Review the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Follow [Main Contributing Guidelines](../../CONTRIBUTING.md)
4. Review existing commands in your category

---

## Creating New Commands

### 1. Choose a Category

Commands are organized by purpose:

- **misc/** - General utilities (ping, help, info)
- **admin/** - Administrative (settings, config)
- **data/** - Data management (list, search, export)
- **user/** - User features (profile, stats)

Create new categories as needed, use lowercase-hyphenated names.

### 2. Command Template

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions(
  'command-name',
  'Short description',
  [
    { 
      name: 'parameter', 
      type: 'string', 
      required: true, 
      description: 'Parameter description' 
    }
  ]
);

/**
 * CommandName - Description of what this command does
 * 
 * Usage:
 *   /command-name parameter:value
 *   !command-name value
 */
class CommandName extends Command {
  constructor() {
    super({ 
      name: 'command-name', 
      description: 'Short description',
      data,
      options 
    });
  }

  async execute(message, args) {
    // Prefix command implementation
    // args contains parsed arguments
    try {
      // Implementation
      await sendSuccess(message, 'Success message');
    } catch (error) {
      // Errors auto-handled by base class
      throw error;
    }
  }

  async executeInteraction(interaction) {
    // Slash command implementation
    try {
      // Implementation
      await sendSuccess(interaction, 'Success message');
    } catch (error) {
      // Errors auto-handled by base class
      throw error;
    }
  }
}

module.exports = new CommandName().register();
```

### 3. Command Options

Use `buildCommandOptions()` to define options once:

```javascript
const { data, options } = buildCommandOptions(
  'my-command',
  'Does something useful',
  [
    {
      name: 'user',
      type: 'user',
      required: true,
      description: 'Target user'
    },
    {
      name: 'reason',
      type: 'string',
      required: false,
      description: 'Optional reason'
    }
  ]
);

// Use in both command types:
// Prefix: !my-command @user reason
// Slash: /my-command user:@user reason:text
```

---

## Testing Requirements

All commands require tests:

```bash
# Run all tests
npm test

# Run specific command test
npm test -- tests/unit/test-my-command.test.js

# Check coverage
npm test -- --coverage
```

Test requirements:
- ✅ Prefix command execution
- ✅ Slash command execution
- ✅ All options combinations
- ✅ Error scenarios
- ✅ Edge cases (missing args, invalid input)
- ✅ Mock Discord.js interactions

Example test structure:
```javascript
describe('MyCommand', () => {
  describe('execute() - prefix', () => {
    it('should execute prefix command', async () => {
      // Test implementation
    });
  });

  describe('executeInteraction() - slash', () => {
    it('should execute slash command', async () => {
      // Test implementation
    });
  });

  describe('error handling', () => {
    it('should handle invalid input', async () => {
      // Test implementation
    });
  });
});
```

---

## Commit Message Format

This project uses **Semantic Versioning** with **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New command/feature (MINOR version bump)
- `fix` - Bug fix (PATCH version bump)
- `docs` - Documentation (no version change)
- `test` - Tests (no version change)
- `refactor` - Refactoring (no version change)
- `chore` - Maintenance (no version change)

**Examples:**
```bash
# New command
git commit -m "feat(commands): add my-command to misc category"

# Bug fix
git commit -m "fix(commands): resolve option parsing issue"

# New category
git commit -m "feat(commands): create new-category folder and add commands"
```

---

## Development Workflow

1. **Fork & Clone**: Fork the repository
2. **Create Branch**: `feature/new-command` or `bugfix/command-fix`
3. **Write Tests First**: TDD is mandatory
4. **Implement Command**: Use template above
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
- [ ] Coverage thresholds met (80%+)
- [ ] ESLint passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] CHANGELOG.md updated
- [ ] Semantic commit message used
- [ ] Related issues referenced
- [ ] Command documentation complete
- [ ] Works in Discord (tested manually if possible)

---

## Response Helpers

Use these for consistent formatting:

```javascript
// Success response
await sendSuccess(interaction, 'Command completed successfully');

// Error response
await sendError(interaction, 'Error message', true);

// Embed response (quotes, user profiles, etc)
await sendQuoteEmbed(interaction, data, 'Title');

// Direct message
await sendDM(user, 'Direct message content');
```

---

## Questions?

- Review [Main CONTRIBUTING.md](../../CONTRIBUTING.md)
- Check [Definition of Done](./DEFINITION-OF-DONE.md)
- Read [README.md](./README.md)
- Look at existing commands in category folders
