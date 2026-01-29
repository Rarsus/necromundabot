# NecromundaBot Commands - Definition of Done (DoD)

**Version:** 1.0  
**Effective Date:** January 26, 2026  
**Scope:** All code changes in necrobot-commands submodule  
**Parent Document:** [Main DoD](../../DEFINITION-OF-DONE.md)

---

## Overview

necrobot-commands contains all Discord bot commands organized by category. This Definition of Done ensures consistent, high-quality command implementations.

**All changes to necrobot-commands must meet these criteria before merging.**

---

## Core Requirements

### 1. Code Quality

- [ ] ESLint passes: `npm run lint` → Zero errors
- [ ] Prettier formatting applied: `npm run format`
- [ ] Extends CommandBase class
- [ ] Uses response helpers for all Discord messages
- [ ] Guild-aware where needed
- [ ] Error handling through base class
- [ ] No raw Discord API calls

### 2. Testing (TDD - MANDATORY)

- [ ] Tests written BEFORE implementation
- [ ] All command paths tested (slash + prefix)
- [ ] Coverage targets: Lines 80%+, Functions 85%+, Branches 75%+
- [ ] Happy path scenario tested
- [ ] Error scenarios tested
- [ ] Edge cases tested
- [ ] Tests pass: `npm test` → 100% pass rate

### 3. Command Implementation

- [ ] Extends CommandBase
- [ ] Implements execute() for prefix commands
- [ ] Implements executeInteraction() for slash commands
- [ ] Uses buildCommandOptions() for shared options
- [ ] Implements proper error handling
- [ ] Command properly registered

### 4. Documentation

- [ ] Command purpose clearly documented
- [ ] All options documented in code comments
- [ ] README.md entry added (if command category added)
- [ ] Usage examples provided in command JSDoc
- [ ] CHANGELOG.md entry added
- [ ] Help command updated if needed

### 5. Discord Integration

- [ ] Both slash and prefix commands work
- [ ] Options validated before use
- [ ] Response embeds properly formatted
- [ ] Mentions and IDs properly resolved
- [ ] Permissions checked (if needed)
- [ ] Command properly sorted in help

### 6. Backwards Compatibility

- [ ] Command options unchanged (or documented)
- [ ] Behavior consistent across platforms
- [ ] No breaking changes to responses
- [ ] Legacy commands still supported

---

## Command-Specific Criteria

### Command Structure

```javascript
const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { sendSuccess, sendError } = require('../../utils/helpers/response-helpers');

const { data, options } = buildCommandOptions('cmd-name', 'Description', [
  { name: 'arg', type: 'string', required: true, description: 'Arg desc' }
]);

class MyCommand extends Command {
  constructor() {
    super({ name: 'cmd-name', description: 'Description', data, options });
  }

  async execute(message, args) {
    // Prefix command implementation
  }

  async executeInteraction(interaction) {
    // Slash command implementation
  }
}

module.exports = new MyCommand().register();
```

### Response Handling

- [ ] Use response helpers exclusively
- [ ] No raw Discord API calls
- [ ] Consistent formatting across commands
- [ ] Proper error messages for users

### Command Organization

- [ ] Placed in appropriate category folder
- [ ] Category folder: `src/commands/{category}/`
- [ ] File naming: `kebab-case.js`
- [ ] Registered in category index

---

## Categories

| Category | Purpose | Example Commands |
|----------|---------|------------------|
| `misc` | General utilities | ping, help, info |
| `admin` | Administrative | settings, config |
| `data` | Data management | list, search, export |
| `user` | User features | profile, stats |

---

## Before Merging

- [ ] All tests pass locally: `npm test`
- [ ] Coverage thresholds met: `npm test -- --coverage`
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier applied: `npm run format`
- [ ] CHANGELOG.md updated
- [ ] Semantic versioning commit message used
- [ ] Command tested in Discord (if possible)
- [ ] GitHub Actions pass (CI/CD)
- [ ] Pull request reviewed and approved

---

## See Also

- [Main Definition of Done](../../DEFINITION-OF-DONE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Repository README](./README.md)
