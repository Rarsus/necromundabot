# Document Naming Convention - Quick Reference

**🚀 Quick Start**: Use these patterns when creating documentation.

---

## Pattern Cheat Sheet

### Root Level (`/`)
```
README.md                              # Project overview
CHANGELOG.md                           # Version history  
CONTRIBUTING.md                        # How to contribute
DEFINITION-OF-DONE.md                  # DoD checklist
DOCUMENTATION-INDEX.md                 # Master documentation index
```

### Directories (`docs/`, `project-docs/`)
```
docs/guides/setup-guide.md             # lowercase-kebab-case
docs/testing/TEST-NAMING-GUIDE.md      # TYPE-DESCRIPTOR
docs/reference/CONFIG-ESLINT-SETUP.md  # TYPE-DESCRIPTOR
docs/QRC/COMMAND-REFERENCE-QUICK.md    # Quick reference (in QRC folder)
docs/archived/PHASE-22.5-REPORT.md     # Historical (archived)

project-docs/PHASE-23.1/PHASE-23.1-COVERAGE-PLAN.md           # Phase deliverable
project-docs/PHASE-23.1a/PHASE-23.1a-SETUP-SUMMARY.md        # Sub-phase milestone
project-docs/planning/PLANNING-ROADMAP.md                     # Planning document
```

### Type Prefixes
```
TEST-*        = Testing documentation
CONFIG-*      = Configuration guides
TASK-*        = Task tracking & reports
DB-*          = Database documentation
PERM-*        = Permissions & access
ARCH-*        = Architecture decisions
REQ-*         = Requirements specification
PLANNING-*    = Planning documents
```

### Submodule Documentation
```
repos/necrobot-utils/README.md         # Submodule overview
repos/necrobot-utils/docs/setup.md     # Submodule guide
repos/necrobot-utils/CHANGELOG.md      # Submodule changelog
```

---

## Decision Tree

```
Is this a project-level governance document?
  ├─ YES → Use UPPER_CASE at root level
  │        Examples: README.md, CONTRIBUTING.md
  │
  └─ NO → Is it a phase deliverable?
           ├─ YES → Store in project-docs/ with PHASE-#.#-DESCRIPTOR format
           │        Examples: project-docs/PHASE-23.1/PHASE-23.1-COVERAGE-PLAN.md
           │
           └─ NO → Is it a quick reference?
                    ├─ YES → Store in docs/QRC/ with descriptive kebab-case or TYPE-DESCRIPTOR
                    │        Examples: docs/QRC/COMMAND-REFERENCE-QUICK.md
                    │
                    └─ NO → Is it in docs/, repos/, or project-docs/?
                             ├─ YES → Does it have a TYPE prefix (TEST-, CONFIG-, etc.)?
                             │        ├─ YES → Use TYPE-DESCRIPTOR format
                             │        │        Examples: TEST-NAMING-GUIDE.md
                             │        │
                             │        └─ NO → Use lowercase-kebab-case
                             │               Examples: setup-guide.md
                             │
                             └─ NO → Invalid location! Check DOCUMENT-NAMING-CONVENTION.md
```

---

## Common Scenarios

### Creating a new testing guide
```
Location: docs/testing/
Name: test-file-organization.md
✅ Correct: lowercase-kebab-case in directory
```

### Creating a TypeScript migration plan
```
Location: Root level
Name: TYPESCRIPT-MIGRATION-PLAN.md
✅ Correct: UPPER_CASE at root level
```

### Phase 23.1 completion report
```
Location: project-docs/PHASE-23.1/
Name: PHASE-23.1-COMPLETION-REPORT.md
✅ Correct: PHASE-#.#-TYPE format in project-docs folder
```

### Quick command reference
```
Location: docs/QRC/
Name: COMMAND-REFERENCE-QUICK.md
✅ Correct: Quick reference stored in QRC folder
```

### ESLint configuration guide
```
Location: docs/reference/configuration/
Name: CONFIG-ESLINT-SETUP.md
✅ Correct: TYPE-DESCRIPTOR format for typed docs
```

### Submodule database reference
```
Location: repos/necrobot-utils/docs/
Name: database-schema-reference.md
✅ Correct: lowercase-kebab-case in submodule directory
```

---

## ❌ Common Mistakes

| ❌ Wrong | ✅ Right | Issue |
|---------|----------|-------|
| `Setup Guide.md` | `setup-guide.md` | Spaces & PascalCase |
| `test_naming_guide.md` | `TEST-NAMING-GUIDE.md` | Wrong style & location |
| `Phase23Plan.md` | `PHASE-23.1-PLAN.md` | Missing version format |
| `DATABASE-SCHEMA.md` | `DB-SCHEMA-DESIGN.md` | Should use DB prefix |
| `My Document (v2).md` | `document-version-2.md` | Parentheses & spaces |
| `PLAN 2026.md` | `PLAN-2026-ROADMAP.md` | Spaces instead of hyphens |

---

## Validation Commands

```bash
# Check your documentation
npm run validate:docs

# Strict mode (fails on any issues)
npm run validate:docs:strict

# Verbose output (shows all files checked)
npm run validate:docs:verbose

# Full audit (naming + structure checks)
npm run audit:docs
```

---

## Character Rules

✅ **Allowed:**
- Letters: a-z, A-Z
- Numbers: 0-9
- Separator: hyphen (-), underscore (_)
- Extension: .md

❌ **Not Allowed:**
- Spaces
- Parentheses: ( )
- Brackets: [ ]
- Special chars: @ # $ % ^ & * etc.
- CamelCase except UPPER_CASE at root level

---

## Filename Length

- **Maximum**: 80 characters (for terminal compatibility)
- **Recommended**: 40-70 characters
- Includes `.md` extension

Examples:
- ✅ `PHASE-23.1-COVERAGE-EXPANSION-PLAN.md` (47 chars)
- ✅ `test-naming-convention-guide.md` (32 chars)
- ❌ `this-is-an-extremely-long-documentation-file-name-that-exceeds-the-maximum-recommended-length.md` (99 chars)

---

## When to Use What

| Situation | Format | Location |
|-----------|--------|----------|
| Project overview | `README.md` | Root |
| Version history | `CHANGELOG.md` | Root or `/repos/*/` |
| Phase deliverable | `PHASE-#.#-DESCRIPTOR.md` | `project-docs/PHASE-#.#/` |
| Planning document | `PLANNING-*.md` | `project-docs/planning/` |
| Quick reference | `*-QUICK.md` or `quick-*.md` | `docs/QRC/` |
| Testing guide | `test-*.md` or `TEST-*.md` | `docs/testing/` |
| Configuration | `CONFIG-*.md` | `docs/reference/configuration/` |
| Database docs | `DB-*.md` | `docs/reference/database/` |
| Architecture | `ARCH-*.md` or `arch-*.md` | `docs/reference/architecture/` |
| Setup instructions | `setup-guide.md` | `docs/guides/` |
| API reference | `api-reference.md` | Any subdirectory |

---

## File Organization Example

```
necromundabot/
├── README.md                                   ✅ Root overview
├── CHANGELOG.md                                ✅ Version history
├── CONTRIBUTING.md                             ✅ Governance
│
├── project-docs/
│   ├── INDEX.md                               ✅ Phase index
│   ├── PHASE-23.1/
│   │   └── PHASE-23.1-COMPLETION-REPORT.md    ✅ Phase deliverable
│   └── planning/
│       └── PLANNING-ROADMAP.md                ✅ Planning doc
│
├── docs/
│   ├── INDEX.md                               ✅ Doc index
│   ├── QRC/
│   │   ├── DOCUMENT-NAMING-QUICK-REFERENCE.md ✅ Quick reference
│   │   └── COMMAND-REFERENCE-QUICK.md         ✅ Quick reference
│   ├── testing/
│   │   ├── TEST-NAMING-CONVENTION-GUIDE.md    ✅ Typed doc
│   │   └── test-coverage-strategy.md          ✅ General doc
│   └── reference/
│       ├── architecture/
│       │   └── ARCH-SUBMODULE-DESIGN.md       ✅ Typed doc
│       └── configuration/
│           └── CONFIG-ESLINT-SETUP.md         ✅ Typed doc
│
└── repos/necrobot-utils/
    ├── README.md                              ✅ Submodule overview
    └── docs/
        └── database-api-reference.md          ✅ Submodule doc
```

---

## When Something Doesn't Fit

If your document doesn't fit these patterns:

1. **Check the full guide**: [DOCUMENT-NAMING-CONVENTION.md](../DOCUMENT-NAMING-CONVENTION.md)
2. **Ask on GitHub**: Open an issue with label `documentation`
3. **Use closest pattern**: If unsure, use `lowercase-kebab-case`

---

## Links

- **Full Convention**: [DOCUMENT-NAMING-CONVENTION.md](../DOCUMENT-NAMING-CONVENTION.md)
- **Validation Script**: [.github/scripts/validate-doc-naming.js](../.github/scripts/validate-doc-naming.js)
- **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)
