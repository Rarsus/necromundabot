# Document Naming Convention - NecromundaBot

**Version**: 1.0  
**Last Updated**: January 26, 2026  
**Scope**: All documentation files in NecromundaBot monorepo and submodules  
**Validation**: Enforced by GitHub Workflows (`documentation-validation.yml`)

---

## Table of Contents

1. [Overview](#overview)
2. [Naming Convention Rules](#naming-convention-rules)
3. [Root-Level Documents](#root-level-documents)
4. [Phase & Deliverable Documents](#phase--deliverable-documents)
5. [Technical Documentation](#technical-documentation)
6. [Submodule-Specific Documentation](#submodule-specific-documentation)
7. [Directory Structure & Validation](#directory-structure--validation)
8. [Automated Linting & Validation](#automated-linting--validation)

---

## Overview

The document naming convention is designed to be:

- **Scalable**: Supports growth across multiple submodules and documentation layers
- **Searchable**: Consistent patterns make documents discoverable
- **Validatable**: Compatible with GitHub workflow linting and automation
- **Hierarchical**: Clear folder structure reflects document purpose and audience
- **Maintainable**: Simple rules reduce cognitive load for contributors

### Key Principles

✅ **DO:**
- Use UPPER_SNAKE_CASE for root-level governance documents
- Use lowercase-kebab-case for subdirectory files
- Include meaningful prefixes that indicate document type
- Use sequential numbering for phases and iterations
- Keep filenames under 80 characters (for terminal compatibility)
- Use hyphens to separate words, underscores only for multi-word phrases

❌ **DON'T:**
- Mix naming styles (no camelCase or PascalCase in document names)
- Use spaces in filenames
- Create deeply nested directories (max 3 levels deep)
- Use generic names like `document.md`, `info.md`, `notes.md`
- Include dates in filenames (use git history instead)
- Use symbols except hyphens and underscores

---

## Naming Convention Rules

### Pattern Reference

```
ROOT_LEVEL_DOCS.md                    # Governance, project-wide decisions
DESCRIPTOR-REPORT.md                  # Analysis, findings, audit results
DEFINITION-OF-CONCEPT.md              # Standards, definitions, guidelines
PHASE-#.#X-TYPE-DESCRIPTOR.md         # Phase deliverables & summaries
folder/
├── lowercase-document-name.md         # Section-specific documentation
├── TYPE-document-descriptor.md        # Typed documents (TEST-*, CONFIG-*, etc.)
└── YYYY-MM-DD-document-name.md        # Time-sensitive reports (ONLY with date)
```

### Naming Components

| Component | Format | Examples | When to Use |
|-----------|--------|----------|------------|
| **Root Document** | `DESCRIPTOR.md` or `DESCRIPTOR-DESCRIPTOR.md` | `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` | Project-level governance |
| **Phase Marker** | `PHASE-#.#[a-z]?` | `PHASE-23.1`, `PHASE-23.1a` | Phase/iteration deliverables |
| **Numbered Sections** | `SECTION-###-DESCRIPTOR` | `TEST-001-COVERAGE-ANALYSIS` | Multi-part technical specifications |
| **Document Type** | `[TYPE]-DESCRIPTOR` | `CONFIG-ESLINT-SETUP`, `TEST-NAMING-GUIDE` | Categorized technical docs |
| **Subdirectory Files** | `lowercase-kebab-case.md` | `setup-guide.md`, `quick-reference.md` | Implementation guides |
| **Date Stamping** | `YYYY-MM-DD-descriptor` | `2026-01-26-incident-report` | Time-sensitive reports ONLY |

---

## Root-Level Documents

Root-level documents (`/`) are project governance and should use **UPPER_CASE with underscores for multi-word concepts**.

### Standard Root Documents

```
README.md                              # Project overview (required)
CHANGELOG.md                           # Version history
CONTRIBUTING.md                        # Contribution guidelines
CODE_OF_CONDUCT.md                     # Community standards
LICENSE                                # Project license
```

### Governance & Standards Documents

```
DEFINITION-OF-DONE.md                  # Definition of Done checklist
DEFINITION-OF-READY.md                 # Definition of Ready for issues
DOCUMENT-NAMING-CONVENTION.md          # This file - naming standards
DOCUMENTATION-INDEX.md                 # Master documentation index
CONTRIBUTING.md                        # Contribution guidelines
CODE_OF_CONDUCT.md                     # Community standards
CHANGELOG.md                           # Version history
```

### Submodule Governance Documents

**Each submodule MUST include these files at root level** (same as main repository):

```
repos/necrobot-*/
├── DEFINITION-OF-DONE.md              # Submodule-specific DoD
├── CONTRIBUTING.md                    # Submodule contribution guidelines
├── CODE_OF_CONDUCT.md                 # Community standards (shared)
├── CHANGELOG.md                       # Version history
└── README.md                          # Overview
```

✅ **CORRECT**: `repos/necrobot-utils/DEFINITION-OF-DONE.md`  
✅ **CORRECT**: `repos/necrobot-core/CONTRIBUTING.md`  
❌ **WRONG**: `repos/necrobot-utils/docs/DEFINITION-OF-DONE.md` (should be at root)

---

### Quick Command Reference

```
COMMAND-REFERENCE-QUICK.md             # Quick command reference
```

### Phase & Planning Documents

```
PHASE-23.0-COMPLETION-REPORT.md        # Phase completion summary
PHASE-23.1-COVERAGE-EXPANSION-PLAN.md  # Coverage implementation plan
PHASE-23.1a-INITIALIZATION-SUMMARY.md  # Sub-phase milestone
PLANNING-ROADMAP.md                    # High-level project planning
PLANNING-SPRINT-001.md                 # Sprint planning document
```

### Analysis & Status Documents

```
ANALYSIS-SUMMARY.md                    # Overview of analysis findings
ANALYSIS-CODE-COVERAGE.md              # Coverage analysis details
STATUS-CHECKLIST.md                    # Project status tracking
GITHUB-ISSUES-CREATED-SUMMARY.md       # Issue creation summary
```

### TypeScript/Migration Documents

```
TYPESCRIPT-MIGRATION-PLAN.md           # Migration planning
TYPESCRIPT-MIGRATION-STATUS.md         # Current migration status
TYPESCRIPT-ASSESSMENT.md               # Technology assessment
```

---

## Phase & Deliverable Documents

Phase documents track project milestones and deliverables using structured naming. All phase documents are stored in the **`project-docs/`** folder.

### Phase Document Location

**ALL phase documents MUST be stored in the `project-docs/` folder** - never at root level.

```
project-docs/
├── INDEX.md                            # Master index of all phases
├── PHASE-23.0/
│   ├── PHASE-23.0-COMPLETION-REPORT.md
│   └── PHASE-23.0-INDEX.md
├── PHASE-23.1/
│   ├── PHASE-23.1-COVERAGE-EXPANSION-PLAN.md
│   ├── PHASE-23.1-COMPLETION-REPORT.md
│   └── PHASE-23.1-INDEX.md
├── PHASE-23.1a/
│   └── PHASE-23.1a-INITIALIZATION-SUMMARY.md
├── planning/
│   ├── PLANNING-ROADMAP.md
│   └── PLANNING-SPRINT-001.md
└── analysis/
    ├── ANALYSIS-SUMMARY.md
    └── ANALYSIS-CODE-COVERAGE.md
```

✅ **CORRECT**: `project-docs/PHASE-23.1/PHASE-23.1-COMPLETION-REPORT.md`  
❌ **WRONG**: `PHASE-23.1-COMPLETION-REPORT.md` (root level)  
❌ **WRONG**: `docs/PHASE-23.1-COMPLETION-REPORT.md` (should be in project-docs)

### Phase Document Format

```
project-docs/PHASE-{#}.{#}[a-z?]/PHASE-{#}.{#}[a-z?]-{TYPE}.md
                                         ↑   ↑      ↑    ↑
                                         │   │      │    └─ Document type (see table below)
                                         │   │      └─────── Optional sub-phase letter
                                         │   └──────────── Minor version (0-9)
                                         └─────────────── Major version (23+)
```

### Phase Document Types

| Type | Format | Example | Purpose |
|------|--------|---------|---------|
| **Summary** | `PHASE-#.#-SUMMARY` | `PHASE-23.1-SUMMARY` | Quick overview of phase |
| **Plan** | `PHASE-#.#-{TOPIC}-PLAN` | `PHASE-23.1-COVERAGE-PLAN` | Implementation roadmap |
| **Report** | `PHASE-#.#-COMPLETION-REPORT` | `PHASE-23.1-COMPLETION-REPORT` | Final deliverables & outcomes |
| **Index** | `PHASE-#.#-INDEX` | `PHASE-23.1-INDEX` | Links to all phase documents |
| **Sub-phase** | `PHASE-#.#a-{TOPIC}` | `PHASE-23.1a-INITIALIZATION` | Sub-milestone within phase |

### Examples

```
project-docs/PHASE-22.0/PHASE-22.0-COMPLETION-REPORT.md
project-docs/PHASE-23.0/PHASE-23.0-INITIALIZATION-SUMMARY.md
project-docs/PHASE-23.1/PHASE-23.1-COVERAGE-EXPANSION-PLAN.md
project-docs/PHASE-23.1a/PHASE-23.1a-DATABASE-SETUP-SUMMARY.md
project-docs/PHASE-23.1/PHASE-23.1-COMPLETION-REPORT.md
project-docs/planning/PLANNING-ROADMAP.md
project-docs/INDEX.md                   # Master index of all phases
```

---

## Quick Reference Collection (QRC)

Quick Reference Collection documents provide condensed, at-a-glance information for common tasks. **ALL QRC documents MUST be stored in `docs/QRC/`**.

### QRC Document Location

```
docs/QRC/
├── DOCUMENT-NAMING-QUICK-REFERENCE.md      # Naming convention summary
├── COMMAND-REFERENCE-QUICK.md              # Quick command reference
├── SETUP-QUICK-REFERENCE.md                # Setup quick guide
├── TROUBLESHOOTING-QUICK-REFERENCE.md      # Common issues & solutions
└── INDEX.md                                # Index of all QRC documents
```

### QRC Document Format

```
# {Topic} - Quick Reference

**Last Updated**: YYYY-MM-DD  
**Audience**: {Target users}  
**Length**: 1-3 pages maximum  
**Purpose**: Quick lookup, not comprehensive guide

## Quick Start
[Condensed steps - 5 minutes or less]

## Common Tasks
[Bullet points with examples]

## Troubleshooting
[Quick solutions to common problems]

## See Also
- [Link to comprehensive guide]
- [Link to related QRC]
```

### QRC Naming Rules

✅ **CORRECT**: `docs/QRC/SETUP-QUICK-REFERENCE.md`  
❌ **WRONG**: `SETUP-QUICK-REFERENCE.md` (should be in docs/QRC/)  
❌ **WRONG**: `docs/setup-quick-reference.md` (use UPPER_CASE with hyphens for QRC)  
❌ **WRONG**: `docs/guides/SETUP-QUICK-REFERENCE.md` (must be in docs/QRC/)

---



Technical documentation uses structured prefixes for discoverability and automation.

### Document Type Prefixes

| Prefix | Directory | Purpose | Example |
|--------|-----------|---------|---------|
| **TEST-** | `docs/testing/` | Testing frameworks, patterns, coverage | `TEST-NAMING-CONVENTION.md` |
| **CONFIG-** | `docs/reference/configuration/` | Configuration and setup guides | `CONFIG-ESLINT-STRATEGY.md` |
| **TASK-** | `docs/reference/reports/` | Task tracking and closure reports | `TASK-66-VALIDATION-REPORT.md` |
| **DB-** | `docs/reference/database/` | Database schema, migrations | `DB-SCHEMA-DESIGN.md` |
| **PERM-** | `docs/reference/permissions/` | Permission & role documentation | `PERM-RBAC-GUIDE.md` |
| **ARCH-** | `docs/reference/architecture/` | Architecture decisions, patterns | `ARCH-SUBMODULE-STRUCTURE.md` |

### Technical Document Naming

```
docs/reference/
├── database/
│   ├── DB-SCHEMA-DESIGN.md
│   ├── DB-MIGRATION-STRATEGY.md
│   └── db-connection-pooling.md
├── testing/
│   ├── TEST-NAMING-CONVENTION-GUIDE.md
│   ├── TEST-COVERAGE-BASELINE.md
│   └── test-file-audit-report.md
├── configuration/
│   ├── CONFIG-ESLINT-SETUP.md
│   ├── CONFIG-PRETTIER-FORMATTING.md
│   └── config-environment-variables.md
└── architecture/
    ├── ARCH-SUBMODULE-DESIGN.md
    └── architecture-decision-records.md
```

---

## Submodule-Specific Documentation

Each submodule has its own documentation structure, following the **exact same naming conventions** as the main repository.

### Submodule Documentation Location

**All submodules follow this mandatory structure:**

```
repos/necrobot-utils/
├── README.md                                   # Submodule overview
├── CHANGELOG.md                                # Submodule version history
├── DEFINITION-OF-DONE.md                       # Submodule DoD checklist
├── CONTRIBUTING.md                             # Contribution guidelines
├── CODE_OF_CONDUCT.md                          # Community standards
├── project-docs/                               # Phase & planning docs
│   ├── INDEX.md
│   └── PHASE-*/
│       └── PHASE-*-*.md
├── docs/                                       # Main documentation
│   ├── INDEX.md
│   ├── QRC/                                   # Quick Reference Collection
│   │   ├── QUICK-REFERENCE.md
│   │   └── INDEX.md
│   ├── admin-guides/
│   ├── user-guides/
│   ├── guides/
│   ├── reference/
│   ├── testing/
│   ├── best-practices/
│   └── archived/
└── tests/

repos/necrobot-commands/
├── README.md
├── CHANGELOG.md
├── DEFINITION-OF-DONE.md                       # Submodule DoD checklist
├── CONTRIBUTING.md                             # Contribution guidelines
├── CODE_OF_CONDUCT.md                          # Community standards
├── project-docs/                               # Phase & planning
│   └── PHASE-*/
├── docs/                                       # Main documentation
│   ├── QRC/                                   # Quick Reference
│   ├── guides/
│   ├── reference/
│   └── testing/
└── tests/

repos/necrobot-core/
├── README.md
├── CHANGELOG.md
├── DEFINITION-OF-DONE.md                       # Submodule DoD checklist
├── CONTRIBUTING.md                             # Contribution guidelines
├── CODE_OF_CONDUCT.md                          # Community standards
├── CHANGELOG.md
├── project-docs/
├── docs/
│   ├── QRC/
│   ├── reference/
│   └── testing/
└── tests/

repos/necrobot-dashboard/
├── README.md
├── CHANGELOG.md
├── project-docs/
├── docs/
│   ├── QRC/
│   ├── guides/
│   └── testing/
└── tests/
```

### Submodule Naming Rules (Same as Main Repository)

✅ **CORRECT**: `repos/necrobot-utils/project-docs/PHASE-23.1/PHASE-23.1-COMPLETION-REPORT.md`  
✅ **CORRECT**: `repos/necrobot-utils/docs/QRC/API-QUICK-REFERENCE.md`  
✅ **CORRECT**: `repos/necrobot-commands/docs/guides/command-development-guide.md`  

❌ **WRONG**: `repos/necrobot-utils/PHASE-23.1-REPORT.md` (should be in project-docs/)  
❌ **WRONG**: `repos/necrobot-core/docs/QUICK-REFERENCE.md` (should be in docs/QRC/)  

### Submodule README Structure

```markdown
# Module Name

**Version**: X.Y.Z  
**Latest Update**: YYYY-MM-DD  
**Stable**: ✅

## Overview
## Quick Start
## Usage
## API Reference
## Development
## Testing
## Contributing
## See Also
- [Main NecromundaBot Docs](../../docs/)
- [Main Project README](../../README.md)
```

---

## Setup & Configuration Documentation

Setup, configuration, and project initialization documents track how the project was set up and how to replicate that setup. **ALL setup and configuration documentation MUST be stored in `project-docs/`** with appropriate subdirectories.

### Setup & Configuration Document Location

```
project-docs/
├── setup/                                      # Setup & initialization docs
│   ├── SETUP-COMPLETE.md                      # Setup completion report
│   ├── WORKSPACE-DEPENDENCIES-RESOLVED.md     # Workspace configuration
│   ├── GPM-PUBLISHING-SETUP-COMPLETE.md       # Package publishing setup
│   └── setup-troubleshooting.md                # Setup troubleshooting guide
├── configuration/                              # Configuration documentation
│   ├── DOCUMENTATION-STRATEGY-UPDATE.md       # Documentation strategy
│   ├── ESLINT-CONFIG-STRATEGY.md              # ESLint configuration
│   ├── prettier-configuration.md               # Prettier setup
│   └── environment-variables-guide.md          # Environment setup
└── governance/                                 # Governance documentation
    ├── GOVERNANCE-DOCUMENTS-UPDATE.md         # Governance doc updates
    └── governance-review-checklist.md         # Governance checklist
```

### Setup & Configuration Document Format

```
project-docs/{category}/{DOCUMENT-DESCRIPTOR}.md
           ↑              ↑
           │              └─ UPPER_CASE for project docs, lowercase-kebab for guides
           └─ Category: setup, configuration, governance
```

### Setup & Configuration Document Types

| Type | Location | Example | Purpose |
|------|----------|---------|---------|
| **Setup Report** | `project-docs/setup/` | `SETUP-COMPLETE.md` | Final setup status and summary |
| **Config Update** | `project-docs/configuration/` | `DOCUMENTATION-STRATEGY-UPDATE.md` | Configuration changes and rationale |
| **Governance** | `project-docs/governance/` | `GOVERNANCE-DOCUMENTS-UPDATE.md` | Governance document updates |
| **Setup Guide** | `project-docs/setup/` | `setup-troubleshooting.md` | How-to guides (lowercase) |

### Examples

```
✅ CORRECT: project-docs/setup/SETUP-COMPLETE.md
✅ CORRECT: project-docs/setup/WORKSPACE-DEPENDENCIES-RESOLVED.md
✅ CORRECT: project-docs/configuration/DOCUMENTATION-STRATEGY-UPDATE.md
✅ CORRECT: project-docs/governance/GOVERNANCE-DOCUMENTS-UPDATE.md
✅ CORRECT: project-docs/setup/setup-troubleshooting-guide.md (lowercase for guides)

❌ WRONG: SETUP-COMPLETE.md (root level)
❌ WRONG: docs/SETUP-COMPLETE.md (should be in project-docs)
❌ WRONG: project-docs/SETUP-COMPLETE.md (should be in project-docs/setup/)
```

### When to Use Setup & Configuration Docs

Create setup/configuration documentation when:
- ✅ Documenting project initialization steps
- ✅ Recording configuration changes (ESLint, Prettier, workflows)
- ✅ Reporting on workspace/dependency setup
- ✅ Updating governance policies
- ✅ Publishing workflow changes (CI/CD, versioning)
- ✅ Tracking infrastructure changes

Do NOT use setup docs for:
- ❌ Phase deliverables (use `project-docs/PHASE-*/` instead)
- ❌ Quick references (use `docs/QRC/` instead)
- ❌ Development guides (use `docs/guides/` instead)
- ❌ Technical specifications (use `docs/reference/` instead)

---

## Directory Structure & Validation

### Approved Directory Hierarchy

```
necromundabot/                                   # Main monorepo
├── README.md                                   # Project overview
├── CHANGELOG.md                                # Version history
├── CONTRIBUTING.md                             # Contribution guidelines
├── DOCUMENT-NAMING-CONVENTION.md              # This file
├── DOCUMENTATION-INDEX.md                      # Master index

├── DEFINITION-OF-DONE.md                       # DoD criteria
├── project-docs/                               # Phase & Planning documents
│   ├── INDEX.md                               # Master phase index
│   ├── PHASE-23.0/
│   │   ├── PHASE-23.0-COMPLETION-REPORT.md
│   │   └── PHASE-23.0-INDEX.md
│   ├── PHASE-23.1/
│   │   ├── PHASE-23.1-COVERAGE-EXPANSION-PLAN.md
│   │   ├── PHASE-23.1-COMPLETION-REPORT.md
│   │   └── PHASE-23.1-INDEX.md
│   ├── planning/
│   │   ├── PLANNING-ROADMAP.md
│   │   └── PLANNING-SPRINT-001.md
│   └── analysis/
│       ├── ANALYSIS-SUMMARY.md
│       └── ANALYSIS-CODE-COVERAGE.md
├── docs/                                       # Main documentation
│   ├── INDEX.md                               # Documentation index
│   ├── QRC/                                   # Quick Reference Collection
│   │   ├── COMMAND-REFERENCE-QUICK.md
│   │   ├── DOCUMENT-NAMING-QUICK-REFERENCE.md
│   │   └── quick-reference.md
│   ├── admin-guides/                          # Administrator guides
│   │   ├── user-management.md
│   │   ├── guild-configuration.md
│   │   └── backup-procedures.md
│   ├── user-guides/                           # End-user guides
│   │   ├── getting-started.md
│   │   ├── command-usage.md
│   │   └── faq.md
│   ├── guides/                                # Developer guides
│   │   ├── setup-guide.md
│   │   ├── development-workflow.md
│   │   └── git-workflow.md
│   ├── reference/                             # Technical reference
│   │   ├── architecture/
│   │   │   ├── ARCH-*.md
│   │   │   └── architecture-overview.md
│   │   ├── database/
│   │   │   ├── DB-*.md
│   │   │   └── schema-reference.md
│   │   ├── configuration/
│   │   │   ├── CONFIG-*.md
│   │   │   └── environment-setup.md
│   │   ├── permissions/
│   │   │   └── PERM-*.md
│   │   └── reports/
│   │       ├── TASK-*.md
│   │       └── analysis-reports.md
│   ├── testing/                               # Testing documentation
│   │   ├── TEST-*.md
│   │   ├── test-strategies.md
│   │   └── coverage-guide.md
│   ├── best-practices/                        # Coding standards
│   │   ├── code-style.md
│   │   ├── naming-conventions.md
│   │   └── design-patterns.md
│   └── archived/                              # Historical docs
│       └── PHASE-22.*.md
│
├── project-docs/                               # Project planning
│   ├── INDEX.md
│   ├── PROJECT-OVERVIEW.md
│   ├── planning/
│   │   ├── PLANNING-ROADMAP.md
│   │   └── PLANNING-SPRINT-*.md
│   ├── requirements/
│   │   ├── REQ-001-CORE-FEATURES.md
│   │   └── REQ-002-SCALABILITY.md
│   └── test/
│       └── TEST-*.md
│
├── repos/                                      # Submodules
│   ├── necrobot-core/
│   │   ├── README.md
│   │   ├── docs/
│   │   └── CHANGELOG.md
│   ├── necrobot-utils/
│   │   ├── README.md
│   │   ├── docs/
│   │   └── CHANGELOG.md
│   ├── necrobot-commands/
│   │   ├── README.md
│   │   ├── docs/
│   │   └── CHANGELOG.md
│   └── necrobot-dashboard/
│       ├── README.md
│       ├── docs/
│       └── CHANGELOG.md
│
└── .github/
    ├── copilot-instructions.md
    └── workflows/
        └── documentation-validation.yml
```

### Maximum Nesting Rule

- **Root level**: Allows up to 3 levels deep (`docs/reference/architecture/`)
- **Submodules**: Same structure applies independently
- **Archive level**: Historical docs go to `docs/archived/` to keep active docs clean

---

## Automated Linting & Validation

### GitHub Workflow Validation

The `documentation-validation.yml` workflow validates:

✅ **Link Integrity**
- All markdown links resolve to valid files
- Cross-module links use correct relative paths
- No broken cross-references

✅ **Naming Compliance**
- Files match approved naming patterns
- Directory structure matches conventions
- No files with invalid characters

✅ **Content Requirements**
- Root documents have metadata headers
- Phase documents include version numbers
- Technical docs include purpose statements

### Local Validation

Run these commands before pushing documentation changes:

```bash
# Validate documentation links
npm run validate:links

# Check document naming compliance
npm run validate:docs

# Format documentation (auto-fix)
npm run format:docs

# Full documentation audit
npm run audit:docs
```

### Naming Validation Script

Create `.github/scripts/validate-doc-naming.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Valid patterns for different locations
const patterns = {
  root: /^[A-Z_]+([-][A-Z_]+)*\.md$/,                    // ROOT_LEVEL.md
  docs: /^[a-z]+([_-][a-z0-9]+)*\.md$/,                  // lowercase-kebab.md
  phases: /^PHASE-\d+\.\d+[a-z]?(-[A-Z0-9_-]+)?\.md$/,   // PHASE-#.#-DESC.md
  technical: /^(TEST|CONFIG|TASK|DB|PERM|ARCH)-/,        // TYPE-descriptor.md
};

const errors = [];
const rootDir = process.argv[2] || '.';

// Scan directories
const scanDir = (dir, isRoot = true) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      scanDir(filePath, false);
    } else if (file.endsWith('.md')) {
      validateFilename(file, dir, isRoot);
    }
  });
};

const validateFilename = (file, dir, isRoot) => {
  const type = getDocType(dir);
  const pattern = patterns[type];
  
  if (!pattern.test(file)) {
    errors.push(`❌ ${path.join(dir, file)}\n   Expected pattern: ${type}`);
  }
};

scanDir(rootDir);

if (errors.length > 0) {
  console.error('Naming validation failed:\n' + errors.join('\n'));
  process.exit(1);
} else {
  console.log('✅ All documentation files follow naming conventions');
}
```

---

## Implementation Checklist

When creating new documentation:

- [ ] Document type matches one of approved patterns
- [ ] Filename is under 80 characters
- [ ] Using hyphens (not spaces or underscores for separation)
- [ ] Location follows directory hierarchy
- [ ] Includes metadata header (title, date, version)
- [ ] Cross-references use relative paths
- [ ] Includes Table of Contents if > 100 lines
- [ ] Links validated with `npm run validate:links`
- [ ] Conforms to naming patterns with `npm run validate:docs`

---

## Examples

### ✅ CORRECT

```
docs/testing/TEST-NAMING-CONVENTION-GUIDE.md
docs/reference/architecture/ARCH-SUBMODULE-DESIGN.md
docs/guides/development-workflow.md
docs/QRC/COMMAND-REFERENCE-QUICK.md
docs/QRC/DOCUMENT-NAMING-QUICK-REFERENCE.md
project-docs/PHASE-23.1/PHASE-23.1-COVERAGE-EXPANSION-PLAN.md
project-docs/planning/PLANNING-ROADMAP.md
repos/necrobot-utils/docs/database-api-reference.md
DOCUMENTATION-INDEX.md
```

### ❌ INCORRECT

```
docs/Testing Guide.md                    # Spaces & PascalCase
document.md                              # Too generic
Phase23.1 Coverage Plan.docx             # Wrong format & extension
DOCS/archive/old_document_v2.md         # Mixed case & underscores
/docs/TypeScript Migration Analysis.md   # Leading slash & spaces
```

---

## Migration Guide

### For Existing Documents

If you have documents not following this convention:

1. **Identify current naming style**
2. **Map to new convention** using the tables above
3. **Rename files** maintaining git history:
   ```bash
   git mv old-name.md NEW-CONVENTION-NAME.md
   ```
4. **Update all cross-references** in other documents
5. **Verify links** with `npm run validate:links`
6. **Commit with message**: `docs: rename [old] to [new] - align with naming convention`

### Grandfather Clause

Historical documents (pre-2026) can be archived in `docs/archived/` without renaming. New documents MUST follow convention.

---

## Support & Updates

For questions or to propose updates to this convention:

1. Open an issue with label `documentation`
2. Reference this document: `DOCUMENT-NAMING-CONVENTION.md`
3. Propose specific changes with examples
4. Update this document when convention changes
5. Run validation workflows after updates

---

## Related Documents

- [DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md) - Master documentation index
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [.github/workflows/documentation-validation.yml](./.github/workflows/documentation-validation.yml) - Automated validation
- [docs/best-practices/](./docs/best-practices/) - Additional best practices
