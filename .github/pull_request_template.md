## 🚨 Important: Copilot Instructions

**Before submitting, ensure compliance with [Copilot Instructions](.github/copilot-instructions.md):**

- [ ] Read relevant scenario from [copilot-scenarios/](./copilot-scenarios/)
- [ ] Followed [TDD Workflow](./copilot-patterns/TDD-WORKFLOW.md) (tests first)
- [ ] All tests passing: `npm test` ✅
- [ ] Linting passed: `npm run lint` ✅
- [ ] No ESLint errors in new code

---

## 📋 Description

What does this PR accomplish?

## 🎯 Related Issue

Closes #(issue number)

## ✅ Checklist

### Code Quality
- [ ] Tests written before implementation (TDD)
- [ ] All tests passing locally
- [ ] ESLint shows no errors
- [ ] Code follows project patterns
- [ ] No breaking changes (or documented)

### Specific to Feature Type

#### If Creating/Modifying Commands
- [ ] Has all 4 required properties: name, description, data, executeInteraction
- [ ] Command structure validated
- [ ] Works in Discord

#### If Creating Services/Database Features
- [ ] Uses workspace `"*"` versions for dependencies
- [ ] Guild context properly handled
- [ ] Read-only operations when appropriate
- [ ] Error handling implemented

#### If Cross-Module Changes
- [ ] All affected modules tested
- [ ] Tests in all dependent modules pass
- [ ] No breaking changes to APIs
- [ ] Backward compatibility maintained

### Documentation & Testing
- [ ] Tests cover happy path + error scenarios
- [ ] Test coverage meets requirements
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)

---

## 📝 Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## 🔗 Scenario Used

Which scenario from [copilot-scenarios/](./copilot-scenarios/) did you follow?
- [ ] [01-creating-new-command.md](./copilot-scenarios/01-creating-new-command.md)
- [ ] [02-fixing-bugs.md](./copilot-scenarios/02-fixing-bugs.md)
- [ ] [03-database-operations.md](./copilot-scenarios/03-database-operations.md)
- [ ] [04-adding-documentation.md](./copilot-scenarios/04-adding-documentation.md)
- [ ] [05-updating-dependencies.md](./copilot-scenarios/05-updating-dependencies.md)
- [ ] [06-refactoring-code.md](./copilot-scenarios/06-refactoring-code.md)
- [ ] [07-docker-changes.md](./copilot-scenarios/07-docker-changes.md)
- [ ] [08-cross-module-changes.md](./copilot-scenarios/08-cross-module-changes.md)

## 🧪 Testing

How was this tested?

## 📸 Additional Context

Any additional information reviewers should know?
