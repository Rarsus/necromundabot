# NecromundaBot Utils - Definition of Done (DoD)

**Version:** 1.0  
**Effective Date:** January 26, 2026  
**Scope:** All code changes in necrobot-utils submodule  
**Parent Document:** [Main DoD](../../DEFINITION-OF-DONE.md)

---

## Overview

necrobot-utils provides shared services, database utilities, and helper functions for the NecromundaBot ecosystem. This Definition of Done ensures consistency with the main repository while addressing module-specific requirements.

**All changes to necrobot-utils must meet these criteria before merging.**

---

## Core Requirements

### 1. Code Quality

- [ ] ESLint passes: `npm run lint` → Zero errors
- [ ] Prettier formatting applied: `npm run format`
- [ ] No deprecated imports (see parent DoD)
- [ ] Services are stateless or cleanly documented
- [ ] Error handling is comprehensive
- [ ] All database operations use transactions where applicable
- [ ] No sensitive data in logs or errors

### 2. Testing (TDD - MANDATORY)

- [ ] Tests written BEFORE implementation
- [ ] All public methods have test cases
- [ ] Coverage targets: Lines 90%+, Functions 95%+, Branches 85%+
- [ ] All database operations tested with SQLite in-memory
- [ ] Error paths tested for all error types
- [ ] Mock external dependencies (Discord.js, etc.)
- [ ] Tests pass: `npm test` → 100% pass rate

### 3. Documentation

- [ ] Code comments explain WHY (not WHAT)
- [ ] Public methods have JSDoc comments with @param and @returns
- [ ] README.md updated if API changes
- [ ] CHANGELOG.md entry added for notable changes
- [ ] Database schema changes documented

### 4. Database Operations

- [ ] All operations use guild-aware services
- [ ] NEVER use deprecated db.js wrapper
- [ ] Prepared statements for all queries
- [ ] No raw SQL in commands/services
- [ ] Transactions used for multi-step operations
- [ ] Rollback behavior documented
- [ ] Migration tests pass

### 5. Backwards Compatibility

- [ ] Exported API unchanged (or deprecation documented)
- [ ] Database schema migrations reversible
- [ ] New dependencies don't break existing consumers
- [ ] Changelog documents breaking changes

---

## Service-Specific Criteria

### DatabaseService

- [ ] All query methods tested with in-memory SQLite
- [ ] Connection pooling behavior tested
- [ ] Timeout handling implemented
- [ ] Retry logic (max 3 attempts) documented
- [ ] Schema validation before writes

### ValidationService

- [ ] All validators have positive/negative test cases
- [ ] Error messages are user-friendly
- [ ] Edge cases covered (null, empty, very long inputs)
- [ ] Performance acceptable for large datasets

### Response Helpers

- [ ] All embeds tested with Discord.js validation
- [ ] Truncation behavior tested for long text
- [ ] Accessibility considerations documented
- [ ] Template examples provided

---

## Before Merging

- [ ] All tests pass locally: `npm test`
- [ ] Coverage thresholds met: `npm test -- --coverage`
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier applied: `npm run format`
- [ ] CHANGELOG.md updated
- [ ] Semantic versioning commit message used
- [ ] GitHub Actions pass (CI/CD)
- [ ] Pull request reviewed and approved

---

## See Also

- [Main Definition of Done](../../DEFINITION-OF-DONE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Repository README](./README.md)
