# Pattern: Documentation Storage & Naming

**ALL documentation must follow strict naming conventions and storage rules. Violations result in PR rejection.**

## Strict Storage Rules

```
ROOT LEVEL (./):
  - Governance docs only: README.md, CHANGELOG.md, CONTRIBUTING.md, etc.
  - Pattern: {UPPERCASE_NAME}.md
  - Examples: CODE_OF_CONDUCT.md, DEFINITION-OF-DONE.md, DOCUMENT-NAMING-CONVENTION.md

/docs/ folder:
  - User guides, architecture, best practices, testing guides
  - Subdirectories: admin-guides/, user-guides/, guides/, architecture/, reference/, best-practices/, testing/
  - Pattern: {lowercase-with-hyphens}.md
  - Examples: docs/guides/testing-guide.md, docs/user-guides/creating-commands.md

/project-docs/ folder:
  - Phase documents, planning, internal project governance
  - Root-level: INDEX.md, configuration notes, governance updates
  - Phase subdirectories: PHASE-{#}.{optional-letter}/ containing phase-specific deliverables
  - Pattern: PHASE-{#}.{optional-letter}-{TYPE}.md
  - Examples:
    - project-docs/PHASE-03.0-GITHUB-ACTIONS-WORKFLOW.md (if at root)
    - project-docs/PHASE-03.1/PHASE-03.1-IMPLEMENTATION-PLAN.md (if in subdirectory)

DEPRECATED/ARCHIVED:
  - /docs/archived/ - Old documentation
  - /project-docs/_archive/ - Historical phase docs
  - Pattern: Same as original, but stored in archived location
```

## Naming Pattern Enforcement

| Document Type      | Location              | Pattern                                          | Example                        | Status    |
| ------------------ | --------------------- | ------------------------------------------------ | ------------------------------ | --------- |
| Root governance    | `./`                  | `{UPPERCASE}.md`                                 | `CONTRIBUTING.md`              | ✅ STRICT |
| Phase deliverables | `/project-docs/`      | `PHASE-{#}.{opt-letter}-{TYPE}.md`               | `PHASE-03.0-GITHUB-ACTIONS.md` | ✅ STRICT |
| Test documentation | `/docs/testing/`      | `TEST-{DESCRIPTOR}.md` or `test-{descriptor}.md` | `TEST-COVERAGE-ANALYSIS.md`    | ✅ STRICT |
| User guides        | `/docs/user-guides/`  | `{action}.md`                                    | `creating-commands.md`         | ✅ STRICT |
| Developer guides   | `/docs/guides/`       | `{topic}.md`                                     | `testing-guide.md`             | ✅ STRICT |
| Architecture docs  | `/docs/architecture/` | `{component}.md`                                 | `guild-aware-architecture.md`  | ✅ STRICT |

## Copilot Workflow

**When creating ANY documentation:**

1. **Identify the document type first:**
   - Is this governance? (root level)
   - Is this a deliverable for a phase? (project-docs/)
   - Is this a guide or reference? (docs/)

2. **Check DOCUMENT-NAMING-CONVENTION.md for the exact pattern**

3. **Use ONLY the approved location and pattern** - no deviations

4. **Update index files when adding docs:**
   - Root-level docs → Update `DOCUMENTATION-INDEX.md`
   - docs/ folder → Update `docs/INDEX.md`
   - Phase documents → Update `project-docs/INDEX.md`

## ✅ CORRECT Examples

```
Root governance:
  ✅ ./CONTRIBUTING.md
  ✅ ./CODE_OF_CONDUCT.md
  ✅ ./DOCUMENT-NAMING-CONVENTION.md

Phase deliverables:
  ✅ ./project-docs/PHASE-03.0-GITHUB-ACTIONS-WORKFLOW.md
  ✅ ./project-docs/PHASE-03.1-IMPLEMENTATION-ANALYSIS.md

Guides and references:
  ✅ ./docs/guides/testing-guide.md
  ✅ ./docs/user-guides/creating-commands.md
  ✅ ./docs/architecture/guild-aware-architecture.md
  ✅ ./docs/testing/test-coverage-baseline-strategy.md

Archived/Historical:
  ✅ ./docs/archived/old-process.md
  ✅ ./project-docs/_archive/phase-22/PHASE-22-SUMMARY.md
```

## ❌ VIOLATIONS (PR Rejection)

- Storing root governance docs in `/docs/` folder
- Using `lowercase-names` for root-level files
- Storing phase docs outside `/project-docs/`
- Creating docs without updating index files
- Deviating from the exact naming pattern
