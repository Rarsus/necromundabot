# Contributing to necrobot-utils

Thank you for contributing to necrobot-utils! This module provides shared services, utilities, and helpers for the NecromundaBot ecosystem.

---

## Before You Start

1. Read the [Definition of Done](./DEFINITION-OF-DONE.md)
2. Review the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Follow [Main Contributing Guidelines](../../CONTRIBUTING.md)
4. Check existing services to avoid duplication

---

## Contribution Types

### 1. New Services

Services should be:
- **Stateless** or with clearly documented state
- **Guild-aware** (include guildId parameter)
- **Testable** (all dependencies mockable)
- **Documented** with JSDoc and README section

Example structure:
```javascript
/**
 * MyService - Provides specific functionality
 * @class
 */
class MyService {
  /**
   * Perform operation
   * @param {string} guildId - Guild identifier
   * @param {*} data - Input data
   * @returns {Promise<*>} Result
   * @throws {Error} If operation fails
   */
  async execute(guildId, data) {
    // Implementation
  }
}

module.exports = MyService;
```

### 2. Database Operations

All database changes require:
- Migration script in `src/migrations/`
- Rollback procedure documented
- Tests with in-memory SQLite
- Schema validation

```javascript
// Example migration
async function migrate(db) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY,
      guild_id TEXT NOT NULL,
      data TEXT
    )
  `);
}

async function rollback(db) {
  await db.run('DROP TABLE IF EXISTS new_table');
}

module.exports = { migrate, rollback, version: '1.0.0' };
```

### 3. Helper Functions

Helpers should be:
- **Pure functions** (no side effects)
- **Well-documented** with examples
- **Tested** for edge cases
- **Organized** by purpose

Example:
```javascript
/**
 * Format text for Discord
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum length
 * @returns {string} Formatted text
 */
function formatDiscordText(text, maxLength = 2000) {
  // Implementation
}
```

### 4. Testing

All contributions require tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/unit/test-my-service.test.js

# Check coverage
npm test -- --coverage
```

Test requirements:
- ✅ Happy path
- ✅ Error scenarios
- ✅ Edge cases (null, empty, boundaries)
- ✅ Database operations (in-memory SQLite)
- ✅ Mocked external dependencies

---

## Commit Message Format

This project uses **Semantic Versioning** with **Conventional Commits**. Format:

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
# New service
git commit -m "feat(services): add MyService for X functionality"

# Bug fix
git commit -m "fix(database): resolve connection timeout issue"

# Breaking change
git commit -m "feat(api): restructure service exports

BREAKING CHANGE: Service exports have changed. Update imports."
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

## Questions?

- Review [Main CONTRIBUTING.md](../../CONTRIBUTING.md)
- Check [Definition of Done](./DEFINITION-OF-DONE.md)
- Read [README.md](./README.md)
