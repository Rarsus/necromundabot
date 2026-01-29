# Documentation Index

## Core Documentation

### [Architecture](./architecture/INDEX.md)

- [Guild-Aware Architecture](./architecture/guild-aware-architecture.md) - Core system design for multi-guild isolation
- [System Architecture](./architecture/system-architecture.md) - Overall system structure
- [Database Architecture](./architecture/database-architecture.md) - Database design and schemas
- [Design Patterns](./architecture/design-patterns.md) - Reusable patterns used in codebase
- [Submodule Architecture](./architecture/submodule-architecture.md) - Organization of npm workspaces

### User Guides (How-To for Developers)

#### Pre-Commit Hooks & Code Quality

- [Pre-Commit Hooks Guide](./user-guides/pre-commit-hooks-guide.md) - Comprehensive guide to using pre-commit hooks
  - Quick start with examples
  - How the hook system works
  - Common scenarios (bug fixes, features, refactoring)
  - Best practices and team coordination
- [Code Quality Workflow](./user-guides/code-quality-workflow.md) - Integration with development workflow
  - Before/after workflow comparison
  - Daily development workflow steps
  - Integration with Copilot instructions
  - Team coordination tips

#### Monorepo & Workspace Guides

- [Monorepo FAQ](./user-guides/monorepo-faq.md) - Common questions about monorepo setup and usage

#### Setup Guides

- [Docker Setup](./user-guides/docker-setup.md) - How to set up and run the bot with Docker

### Developer Guides (Implementation & Troubleshooting)

#### Pre-Commit Hooks

- [Pre-Commit Hooks Troubleshooting](./guides/pre-commit-hooks-troubleshooting.md) - Solutions to common pre-commit issues
  - 10 common issues with step-by-step fixes
  - Root cause analysis
  - Windows-specific troubleshooting
  - Debugging guide

#### Testing & Environment

- [Testing Environment Setup](./guides/testing-environment-setup.md) - Ensure correct Node 22+ and npm versions
  - Automatic version validation
  - Local development setup
  - Docker environment verification
  - Troubleshooting guide

#### Docker & Infrastructure

- [Docker Troubleshooting](./guides/DOCKER-TROUBLESHOOTING.md) - Solutions to Docker-related problems
- [Release Process](./guides/RELEASE-PROCESS.md) - How to create releases
- [GitHub Packages Publishing](./guides/github-packages-publishing.md) - Publishing to GitHub Packages registry

#### Scripts & npm Tools

- [NPM Scripts Mapping](./guides/NPM-SCRIPTS-MAPPING.md) - Complete mapping of all npm scripts
- [Scripts Analysis Report](./guides/SCRIPTS-ANALYSIS-REPORT.md) - Detailed analysis of all available scripts
- [Scripts Analysis Summary](./guides/SCRIPTS-ANALYSIS-SUMMARY.md) - Summary of script functionality
- [Scripts Analysis Complete](./guides/SCRIPTS-ANALYSIS-COMPLETE.md) - Complete scripts analysis
- [Scripts Execution Guide](./guides/SCRIPTS-EXECUTION-VALIDATION-GUIDE.md) - How to execute scripts
- [Scripts Quick Reference](./guides/SCRIPTS-QUICK-REFERENCE.md) - Quick lookup for common scripts
- [Scripts TDD Execution Guide](./guides/SCRIPTS-TDD-EXECUTION-SUMMARY.md) - TDD script execution patterns

#### Copilot & AI Tools

- [Using Copilot Instructions](./guides/using-copilot-instructions.md) - Guide to project-specific Copilot patterns
- [Copilot Reference](./reference/copilot-reference.md) - Complete reference for Copilot commands and patterns

### Best Practices

- [Best Practices Directory](./best-practices/) - General project best practices

### Testing & Code Coverage

- [Code Coverage Analysis](./testing/CODE-COVERAGE-ANALYSIS.md) - Detailed coverage analysis across all workspaces
- [Coverage Improvements Summary](./testing/COVERAGE-IMPROVEMENTS-SUMMARY.md) - Summary of coverage improvements
- [Test Coverage Index](./testing/TEST-COVERAGE-INDEX.md) - Index of test coverage files
- [Test Quick Reference](./testing/TEST-QUICK-REFERENCE.md) - Quick test reference
- [Test Results Summary](./testing/TEST-RESULTS-SUMMARY.md) - Summary of test results
- [Command Files Coverage Enhancement](./testing/COMMAND-FILES-COVERAGE-ENHANCEMENT.md) - Coverage enhancement for command files
- [Command Files Session Summary](./testing/COMMAND-FILES-SESSION-SUMMARY.md) - Session summary for command file testing

### Quick Reference Cards (QRC)

- [Quick Reference Cards](./QRC/INDEX.md) - Fast lookup reference cards
  - [Docker Quick Reference](./QRC/DOCKER-QUICK-REFERENCE.md) - Common Docker commands
  - [Document Naming Quick Reference](./QRC/DOCUMENT-NAMING-QUICK-REFERENCE.md) - Documentation naming rules

## Quick Navigation

**For New Developers:**

1. Start with [Guild-Aware Architecture](./architecture/guild-aware-architecture.md)
2. Read [Pre-Commit Hooks Guide](./user-guides/pre-commit-hooks-guide.md)
3. Review [Code Quality Workflow](./user-guides/code-quality-workflow.md)
4. Check [Docker Setup](./user-guides/docker-setup.md)

**For Troubleshooting:**

1. [Pre-Commit Hooks Troubleshooting](./guides/pre-commit-hooks-troubleshooting.md) - Hook issues
2. [Docker Troubleshooting](./guides/DOCKER-TROUBLESHOOTING.md) - Docker issues
3. [QRC/DOCKER-QUICK-REFERENCE.md](./QRC/DOCKER-QUICK-REFERENCE.md) - Quick Docker commands

**For Implementation:**

1. [Copilot Instructions](../.github/copilot-instructions.md) - AI-assisted development patterns
2. [Architecture Documents](./architecture/) - System design
3. [Release Process](./guides/RELEASE-PROCESS.md) - How to release

## Archive

Outdated or historical documentation is stored in:

- [docs/archived/](./archived/) - Old versions of guides

## See Also

- **Project Documentation:** [project-docs/INDEX.md](../project-docs/INDEX.md) - Phase planning and completion reports
- **Root Documentation:** [CONTRIBUTING.md](../CONTRIBUTING.md), [README.md](../README.md)
- **Copilot Patterns:** [.github/copilot-instructions.md](../.github/copilot-instructions.md)
