# Documentation Strategy Update - January 26, 2026

## Overview

Documentation organization has been standardized across the main repository and all submodules to ensure consistency and discoverability.

---

## Key Changes

### 1. Phase Documents (project-docs/)

**MANDATORY Location**: `project-docs/PHASE-*/`

All phase deliverables, planning documents, and project milestones MUST be stored in the `project-docs/` folder hierarchy - **NEVER at root level**.

✅ **CORRECT**: `project-docs/PHASE-23.1/PHASE-23.1-COMPLETION-REPORT.md`  
❌ **WRONG**: `PHASE-23.1-COMPLETION-REPORT.md` (root level)

**Applied to**: Main repository + all 4 submodules
- `necrobot-utils/project-docs/`
- `necrobot-core/project-docs/`
- `necrobot-commands/project-docs/`
- `necrobot-dashboard/project-docs/`

### 2. Quick Reference Collection (docs/QRC/)

**MANDATORY Location**: `docs/QRC/`

All quick reference documents MUST be stored in the `docs/QRC/` folder.

✅ **CORRECT**: `docs/QRC/COMMAND-REFERENCE-QUICK.md`  
❌ **WRONG**: `COMMAND-REFERENCE-QUICK.md` (root level)  
❌ **WRONG**: `docs/guides/COMMAND-REFERENCE-QUICK.md` (wrong location)

**Characteristics**:
- Maximum 1-3 pages
- Direct, actionable content
- Condensed information for quick lookup
- Name format: `UPPERCASE-HYPHENATED-NAME.md`

**Applied to**: Main repository + all 4 submodules
- `docs/QRC/` → Main repository quick references
- `repos/necrobot-utils/docs/QRC/`
- `repos/necrobot-core/docs/QRC/`
- `repos/necrobot-commands/docs/QRC/`
- `repos/necrobot-dashboard/docs/QRC/`

### 3. Submodule Standardization

Each submodule now follows the SAME documentation structure as the main repository:

```
repos/necrobot-*/
├── README.md
├── CHANGELOG.md
├── project-docs/                    # Phase & planning documents
│   ├── INDEX.md
│   └── PHASE-*/
├── docs/                            # Main documentation
│   ├── QRC/                        # Quick references
│   ├── guides/
│   ├── reference/
│   ├── testing/
│   └── archived/
└── tests/
```

---

## Files Modified

### Documentation Strategy

| File | Change | Reason |
|------|--------|--------|
| `DOCUMENT-NAMING-CONVENTION.md` | Updated with explicit folder requirements for phases and QRC | Clarify mandatory locations |
| `docs/QRC/INDEX.md` | Created | New documentation hub for quick references |
| Moved `DOCUMENT-NAMING-QUICK-REFERENCE.md` to `docs/QRC/` | Consistency | QRC documents belong in docs/QRC/ |

### Folder Structure

**Main Repository**:
- Created: `docs/QRC/` → Index + quick references hub
- Already exists: `project-docs/` → Phase & planning documents

**All Submodules** (necrobot-utils, necrobot-core, necrobot-commands, necrobot-dashboard):
- Created: `project-docs/INDEX.md`
- Created: `docs/QRC/INDEX.md`

### Workflows Updated

Updated all versioning workflows to ignore phase and QRC changes (don't trigger releases):

| Workflow | Path Ignores Added |
|----------|-------------------|
| `.github/workflows/documentation.yml` | `docs/QRC/**`, `project-docs/**` |
| `.github/workflows/documentation-validation.yml` | Already had these paths ✓ |
| `repos/necrobot-utils/.github/workflows/versioning.yml` | `docs/QRC/**`, `project-docs/**` |
| `repos/necrobot-core/.github/workflows/versioning.yml` | `docs/QRC/**`, `project-docs/**` |
| `repos/necrobot-commands/.github/workflows/versioning.yml` | `docs/QRC/**`, `project-docs/**` |
| `repos/necrobot-dashboard/.github/workflows/versioning.yml` | `docs/QRC/**`, `project-docs/**` |

---

## Validation

✅ All folders created with INDEX.md templates
✅ Main DOCUMENT-NAMING-CONVENTION.md updated with explicit rules
✅ All workflows updated to handle new folder structure
✅ Submodule documentation strategy standardized
✅ Quick reference documents centralized in docs/QRC/

---

## Next Steps

1. ✓ Move any existing root-level phase documents to `project-docs/`
2. ✓ Move any QRC documents to `docs/QRC/`
3. Review existing documentation and reorganize as needed
4. Use this new structure for all future phase and QRC documents
5. Monitor GitHub Actions to ensure no validation failures

---

## References

- [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md) - Full naming guide
- [docs/QRC/INDEX.md](../../docs/QRC/INDEX.md) - Quick reference index
- [project-docs/INDEX.md](../../project-docs/INDEX.md) - Phase documentation index
