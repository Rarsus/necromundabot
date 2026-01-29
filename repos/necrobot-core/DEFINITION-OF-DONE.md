# NecromundaBot Core - Definition of Done (DoD)

**Version:** 1.0  
**Effective Date:** January 26, 2026  
**Scope:** All code changes in necrobot-core submodule  
**Parent Document:** [Main DoD](../../DEFINITION-OF-DONE.md)

---

## Overview

necrobot-core provides core bot infrastructure, middleware, event handlers, and Discord service utilities. This Definition of Done ensures all code meets quality and reliability standards.

**All changes to necrobot-core must meet these criteria before merging.**

---

## Core Requirements

### 1. Code Quality

- [ ] ESLint passes: `npm run lint` → Zero errors
- [ ] Prettier formatting applied: `npm run format`
- [ ] No deprecated imports (see parent DoD)
- [ ] Error handling comprehensive
- [ ] Middleware properly chains errors
- [ ] No blocking operations
- [ ] Proper async/await patterns

### 2. Testing (TDD - MANDATORY)

- [ ] Tests written BEFORE implementation
- [ ] All public methods have test cases
- [ ] Coverage targets: Lines 85%+, Functions 90%+, Branches 80%+
- [ ] Event handlers tested with mocked Discord.js
- [ ] Middleware tested with mock interactions
- [ ] Error scenarios tested
- [ ] Tests pass: `npm test` → 100% pass rate

### 3. Documentation

- [ ] Code comments explain WHY (not WHAT)
- [ ] Public APIs have JSDoc comments
- [ ] Event handler documentation
- [ ] Middleware behavior documented
- [ ] README.md updated if changes affect integration
- [ ] CHANGELOG.md entry added

### 4. Event Handlers

- [ ] Use EventBase class
- [ ] Handle all error cases
- [ ] No blocking operations
- [ ] Proper error propagation
- [ ] Rate limiting if needed
- [ ] Tested with mocked Discord events

### 5. Middleware

- [ ] Proper error handling
- [ ] Error chains through middleware
- [ ] No mutation of context
- [ ] Logging at appropriate levels
- [ ] Performance acceptable
- [ ] Tested for all code paths

### 6. Backwards Compatibility

- [ ] Public API unchanged (or deprecation documented)
- [ ] Event signatures unchanged
- [ ] Middleware behavior backward compatible
- [ ] Breaking changes documented in CHANGELOG

---

## Module-Specific Criteria

### Event Handlers (src/events/)

- [ ] Use EventBase pattern
- [ ] All Discord events mocked in tests
- [ ] Error handling for network failures
- [ ] Proper logging with context
- [ ] No blocking long operations
- [ ] Timeout handling documented

### Middleware (src/middleware/)

- [ ] Proper error catching
- [ ] Error chain documented
- [ ] No mutations of input
- [ ] Clear error messages
- [ ] Performance tested
- [ ] All code paths covered

### Services (src/services/)

- [ ] Guild-aware if accessing data
- [ ] Stateless or documented state
- [ ] Clear dependencies
- [ ] Error handling comprehensive
- [ ] Fully tested

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
