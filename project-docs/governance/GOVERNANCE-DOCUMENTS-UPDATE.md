# Governance Documents Update - January 26, 2026

## Overview

All governance documents have been updated to apply across NecromundaBot and all submodules. Each repository now has tailored Definition of Done, Contributing Guidelines, and Code of Conduct documents.

---

## Main Repository Updates

### 1. DEFINITION-OF-DONE.md
- **Updated**: Changed title from "VeraBot2.0" to "NecromundaBot"
- **Added**: Scope note that applies to main repo + all 4 submodules
- **Applies To**:
  - necromundabot (main)
  - necrobot-utils (submodule)
  - necrobot-core (submodule)
  - necrobot-commands (submodule)
  - necrobot-dashboard (submodule)

### 2. CONTRIBUTING.md
- **Updated**: Changed title and intro from "VeraBot" to "NecromundaBot"
- **Added**: Note that guide applies to all submodules
- **Sections**:
  - Commit message format (semantic versioning)
  - Contribution workflow
  - Coding standards
  - Test requirements
  - Pull request guidelines

### 3. DOCUMENT-NAMING-CONVENTION.md
- **Added**: "Submodule Governance Documents" section
- **Added**: Mandatory structure for each submodule root
- **Updated**: Directory hierarchy to include governance docs
- **Examples**: Shows CORRECT vs WRONG placement

**Mandatory Submodule Files**:
```
repos/necrobot-*/
├── DEFINITION-OF-DONE.md       ← Must be at root
├── CONTRIBUTING.md              ← Must be at root
├── CODE_OF_CONDUCT.md           ← Must be at root
├── README.md
├── CHANGELOG.md
└── ... other files
```

---

## Submodule-Specific Documents

### necrobot-utils (Shared Services)
**New Documents**:
- `DEFINITION-OF-DONE.md` - Service-specific criteria
- `CONTRIBUTING.md` - Guidelines for new services/utilities
- `CODE_OF_CONDUCT.md` - Shared with main repo

**Unique Sections**:
- Service development patterns
- Database operation testing
- Guild-aware service requirements
- Migration script requirements

### necrobot-core (Bot Infrastructure)
**New Documents**:
- `DEFINITION-OF-DONE.md` - Middleware/event-specific criteria
- `CONTRIBUTING.md` - Guidelines for events and middleware
- `CODE_OF_CONDUCT.md` - Shared with main repo

**Unique Sections**:
- Event handler patterns
- Middleware chain implementation
- Discord API integration
- Error propagation requirements

### necrobot-commands (Discord Commands)
**New Documents**:
- `DEFINITION-OF-DONE.md` - Command-specific criteria
- `CONTRIBUTING.md` - Guidelines for command creation
- `CODE_OF_CONDUCT.md` - Shared with main repo

**Unique Sections**:
- Command template structure
- CommandBase pattern usage
- Category organization
- Response helper usage

### necrobot-dashboard (Web UI)
**New Documents**:
- `DEFINITION-OF-DONE.md` - Component/UI-specific criteria
- `CONTRIBUTING.md` - Guidelines for components and pages
- `CODE_OF_CONDUCT.md` - Shared with main repo

**Unique Sections**:
- React component structure
- Custom hooks patterns
- Accessibility requirements (WCAG 2.1 AA)
- Responsive design guidelines
- Testing with React Testing Library

---

## Document Structure

All governance documents follow this structure:

### DEFINITION-OF-DONE.md
1. **Overview** - What applies and scope
2. **Core Requirements** - General criteria
3. **Module-Specific Criteria** - Unique requirements
4. **Before Merging** - Final checklist

### CONTRIBUTING.md
1. **Before You Start** - Links to related docs
2. **Contribution Types** - What can be contributed
3. **Testing Requirements** - TDD mandate
4. **Commit Message Format** - Semantic versioning
5. **Development Workflow** - Step-by-step process
6. **Pull Request Checklist** - Final verification
7. **Module-Specific Guidance** - How-to guides

### CODE_OF_CONDUCT.md
- **Shared across all repositories**
- Same community standards everywhere
- Consistent enforcement

---

## Key Standards

### All Modules

✅ **Test-Driven Development (TDD) - MANDATORY**
- Tests written BEFORE implementation
- All public methods tested
- Coverage thresholds: 80%+ lines, 85%+ functions, 75%+ branches
- 100% test pass rate required

✅ **Code Quality**
- ESLint zero errors
- Prettier formatting applied
- Consistent naming conventions
- No deprecated imports

✅ **Semantic Versioning with Conventional Commits**
- `feat:` → MINOR version bump
- `fix:` → PATCH version bump
- `BREAKING CHANGE:` → MAJOR version bump
- `docs:`, `test:`, `chore:` → No version change

✅ **Documentation**
- JSDoc comments for public APIs
- CHANGELOG.md entries
- README.md updates
- Clear code comments (WHY, not WHAT)

### Service-Specific

**necrobot-utils**:
- Guild-aware all operations
- Database transactions where needed
- Mock external dependencies
- Comprehensive error handling

**necrobot-core**:
- Non-blocking event handlers
- Proper middleware chain
- Error propagation
- Discord API limits respected

**necrobot-commands**:
- Extend CommandBase
- Use response helpers only
- Category organization
- Both slash and prefix support

**necrobot-dashboard**:
- Functional React components
- Accessibility (WCAG 2.1 AA)
- Responsive design
- User interaction testing

---

## Files Changed

### Main Repository
- ✅ `DEFINITION-OF-DONE.md` - Updated title + scope
- ✅ `CONTRIBUTING.md` - Updated title + scope
- ✅ `DOCUMENT-NAMING-CONVENTION.md` - Added submodule section

### necrobot-utils
- ✅ Created: `DEFINITION-OF-DONE.md` (320 lines)
- ✅ Created: `CONTRIBUTING.md` (230 lines)
- ✅ Copied: `CODE_OF_CONDUCT.md`

### necrobot-core
- ✅ Created: `DEFINITION-OF-DONE.md` (280 lines)
- ✅ Created: `CONTRIBUTING.md` (280 lines)
- ✅ Copied: `CODE_OF_CONDUCT.md`

### necrobot-commands
- ✅ Created: `DEFINITION-OF-DONE.md` (270 lines)
- ✅ Created: `CONTRIBUTING.md` (320 lines)
- ✅ Copied: `CODE_OF_CONDUCT.md`

### necrobot-dashboard
- ✅ Created: `DEFINITION-OF-DONE.md` (260 lines)
- ✅ Created: `CONTRIBUTING.md` (340 lines)
- ✅ Copied: `CODE_OF_CONDUCT.md`

---

## Git Commits

**Main Repository**:
```
9134bb6 - docs: update main repository governance documents
d781922 - chore: update submodule references for governance documentation
```

**Submodules**:
```
necrobot-utils:      fb12ce8 - docs: add DEFINITION-OF-DONE, CONTRIBUTING, and CODE_OF_CONDUCT
necrobot-core:       6fa90a4 - docs: add DEFINITION-OF-DONE, CONTRIBUTING, and CODE_OF_CONDUCT
necrobot-commands:   1f92cca - docs: add DEFINITION-OF-DONE, CONTRIBUTING, and CODE_OF_CONDUCT
necrobot-dashboard:  18a464b - docs: add DEFINITION-OF-DONE, CONTRIBUTING, and CODE_OF_CONDUCT
```

All pushed to origin/main ✅

---

## Validation Checklist

- ✅ Main repo governance docs updated
- ✅ All 4 submodules have DEFINITION-OF-DONE.md
- ✅ All 4 submodules have CONTRIBUTING.md
- ✅ All 4 submodules have CODE_OF_CONDUCT.md
- ✅ DOCUMENT-NAMING-CONVENTION.md updated with submodule requirements
- ✅ Documents tailored to each module's purpose
- ✅ All files placed at repository root (not in docs/)
- ✅ Cross-references between documents
- ✅ All commits use semantic versioning format
- ✅ All changes pushed to origin/main

---

## Usage

### For Contributors

1. Read the [main CONTRIBUTING.md](../../CONTRIBUTING.md)
2. Read the **module-specific** CONTRIBUTING.md in the submodule
3. Review [DEFINITION-OF-DONE.md](./DEFINITION-OF-DONE.md) for your changes
4. Follow [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) standards

### For Maintainers

1. Enforce DoD checklist on PRs
2. Check semantic commit messages
3. Validate coverage thresholds
4. Ensure all tests pass
5. Reference the appropriate module DoD

### For Project Leads

- All repositories follow same governance standards
- Consistent quality expectations across modules
- Clear contribution guidelines everywhere
- Community standards enforced universally

---

## Summary

All governance documents are now:
- ✅ **Comprehensive** - Detailed criteria for all contribution types
- ✅ **Consistent** - Same standards across main + 4 submodules
- ✅ **Clear** - Examples of CORRECT vs WRONG approaches
- ✅ **Actionable** - Checklists and step-by-step workflows
- ✅ **Accessible** - Available in each repository root

**Status**: COMPLETE AND DEPLOYED TO ALL REPOSITORIES ✓
