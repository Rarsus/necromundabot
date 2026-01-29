# Scenario: Adding Documentation

**When to use:** Creating or updating project documentation

## CRITICAL: Documentation Rules

**Before creating ANY documentation, read [DOCUMENTATION.md](../copilot-patterns/DOCUMENTATION.md)**

Documentation has STRICT naming and storage rules. Violations = PR rejection.

## Quick Rules

| Type | Location | Pattern | Example |
|------|----------|---------|---------|
| **Governance** | `./` | `{UPPERCASE}.md` | `CONTRIBUTING.md` |
| **Phases** | `project-docs/` | `PHASE-{#}.{letter?}-{TYPE}.md` | `PHASE-03.0-GITHUB-ACTIONS.md` |
| **Guides** | `docs/guides/` | `{topic}.md` | `testing-guide.md` |
| **User Guides** | `docs/user-guides/` | `{action}.md` | `creating-commands.md` |
| **Architecture** | `docs/architecture/` | `{component}.md` | `guild-aware-architecture.md` |
| **Reference** | `docs/reference/` | `{topic}-reference.md` | `database-reference.md` |

## Workflow

### 1. Identify Document Type

Ask yourself:
- Is this project governance? (root level)
- Is this a phase deliverable? (project-docs/)
- Is this a how-to guide? (docs/guides/)
- Is this architecture? (docs/architecture/)
- Is this a user guide? (docs/user-guides/)

### 2. Check DOCUMENT-NAMING-CONVENTION.md

```bash
cat DOCUMENT-NAMING-CONVENTION.md
```

Find the exact pattern for your document type.

### 3. Create in Correct Location with Exact Name

Example - Creating a user guide:

```bash
# ✅ CORRECT
cat > docs/user-guides/creating-commands.md << 'EOF'
# Creating Discord Commands

Guide content here...
EOF

# ❌ WRONG - Wrong location
cat > docs/creating-commands.md << 'EOF'  # Missing /user-guides/

# ❌ WRONG - Wrong pattern
cat > docs/user-guides/CREATING-COMMANDS.md << 'EOF'  # Should be lowercase
```

### 4. Update Index File

Add your document to the appropriate index:

```bash
# If root-level doc → Update DOCUMENTATION-INDEX.md
# If docs/ folder → Update docs/INDEX.md
# If project-docs/ → Update project-docs/INDEX.md
```

### 5. Create with Structure

```markdown
# Document Title

> Brief description of what this document covers.

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Section 1

Content with examples...

## Section 2

More content...

## See Also

- [Related Doc](./related-doc.md)
- [External Resource](https://example.com)
```

## Document Type Examples

### User Guide

```
File: docs/user-guides/creating-commands.md
Pattern: {action}.md (e.g., creating-commands, adding-tests, debugging-issues)
Contents: Step-by-step how-to guide
```

### Architecture Guide

```
File: docs/architecture/guild-aware-architecture.md
Pattern: {component}.md (e.g., guild-aware-architecture, database-design)
Contents: System design, diagrams, patterns
```

### Phase Document

```
File: project-docs/PHASE-03.1-IMPLEMENTATION-ANALYSIS.md
Pattern: PHASE-{number}.{letter?}-{TYPE}.md
Contents: Phase deliverables, analysis, implementation details
```

### Test Documentation

```
File: docs/testing/test-coverage-baseline-strategy.md
Pattern: TEST-{DESCRIPTOR}.md or test-{descriptor}.md
Contents: Testing strategies, coverage targets, guidelines
```

## Linking Between Docs

Use relative links:

```markdown
# Correct
- See [testing guide](../guides/testing-guide.md)
- See [user guide](../user-guides/creating-commands.md)
- See [database reference](../reference/database-reference.md)

# Avoid absolute paths or file:// URLs
```

## Internal Links

Use markdown headers:

```markdown
# Table of Contents
- [Section 1](#section-1)
- [Subsection](#subsection)

## Section 1

Content...

## Subsection

Content...
```

## Code Examples in Docs

Always show correct and incorrect patterns:

```markdown
## Example: Creating a Service

### ✅ Correct

\`\`\`javascript
const { DatabaseService } = require('necrobot-utils');
\`\`\`

### ❌ Wrong

\`\`\`javascript
const db = require('../../necrobot-utils/src/db');
\`\`\`
```

## Checklist

Before committing documentation:

- [ ] Read [DOCUMENTATION.md](../copilot-patterns/DOCUMENTATION.md)
- [ ] Correct document type identified
- [ ] Correct location used
- [ ] Exact naming pattern followed
- [ ] Index file updated
- [ ] Links are relative and correct
- [ ] Examples shown (correct + incorrect)
- [ ] Markdown is clean and readable
- [ ] No typos or grammar errors
- [ ] Commit message mentions doc type

## Example Commit

```bash
git add docs/user-guides/creating-commands.md DOCUMENTATION-INDEX.md

git commit -m "docs: Add user guide for creating commands

- Created docs/user-guides/creating-commands.md
- Follows naming convention pattern {action}.md
- Updated docs/INDEX.md with link
- Includes step-by-step workflow
- Covers TDD approach for new commands"
```

## Common Mistakes

❌ **Mistake:** Creating root-level doc with lowercase name  
✅ **Fix:** Root docs are UPPERCASE (README.md, CONTRIBUTING.md, etc.)

❌ **Mistake:** Storing guide in docs/ instead of docs/guides/  
✅ **Fix:** Use correct subdirectory

❌ **Mistake:** Creating phase doc outside project-docs/  
✅ **Fix:** Phase docs go in project-docs/ with PHASE-X pattern

❌ **Mistake:** Creating doc without updating index  
✅ **Fix:** Always update appropriate INDEX.md file

❌ **Mistake:** Using absolute paths in links  
✅ **Fix:** Use relative paths: `../guides/example.md`

## PR Title Format Reminder

When creating a pull request for documentation changes, use the format:

```
docs: <concise description of the documentation change>
```

Examples:
- ✅ `docs: update API reference for commands`
- ✅ `docs: add contributing guidelines`
- ✅ `docs: fix typos in README`
- ❌ `Update documentation` (missing prefix)
- ❌ `docs update API` (missing colon)

See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for complete details.

## Need Help?

- See [DOCUMENTATION.md](../copilot-patterns/DOCUMENTATION.md) for strict rules
- See [DOCUMENT-NAMING-CONVENTION.md](../../DOCUMENT-NAMING-CONVENTION.md) for patterns
- See [PR-TITLE-FORMAT.md](../copilot-patterns/PR-TITLE-FORMAT.md) for PR title requirements
- Check [DOCUMENTATION-INDEX.md](../../DOCUMENTATION-INDEX.md) for examples
