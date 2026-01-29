# PR Title Format Pattern

## 🎯 Overview

All pull requests in this repository **MUST** use Conventional Commits format for titles. This is enforced by GitHub Actions workflow `.github/workflows/pr-checks.yml`.

## ✅ Required Format

```
<type>: <description>
```

- **Type**: Must be one of the allowed prefixes (see below)
- **Colon**: Required after the type
- **Space**: Required after the colon
- **Description**: Clear, concise description in lowercase

## 📋 Allowed Type Prefixes

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat:` or `feature:` | New features | `feat: add gang creation command` |
| `fix:` or `bugfix:` | Bug fixes | `fix: resolve database connection timeout` |
| `docs:` | Documentation only | `docs: update API reference for commands` |
| `style:` | Code style/formatting | `style: format code with prettier` |
| `refactor:` | Code refactoring | `refactor: extract database logic to service` |
| `perf:` or `performance:` | Performance improvements | `perf: optimize query performance` |
| `test:` or `testing:` | Adding/updating tests | `test: add unit tests for gang service` |
| `chore:` | Maintenance tasks | `chore: upgrade dependencies` |
| `ci:` or `cd:` | CI/CD changes | `ci: update GitHub Actions workflow` |
| `revert:` | Reverting changes | `revert: undo breaking changes from #123` |
| `merge:` | Merge commits | `merge: resolve conflicts with main` |

## ✅ Good Examples

```
✅ feat: implement quote search functionality
✅ fix: resolve string comparison in workflow validation
✅ docs: add contributing guidelines for new developers
✅ chore: PHASE-04.0.2 - upgrade glob 7.x → 9.x
✅ test: add integration tests for campaign commands
✅ refactor: extract shared validation logic to utils
```

## ❌ Bad Examples

```
❌ Implement quote search functionality
   (Missing type prefix)

❌ Fix string comparison bug in GitHub Actions
   (Missing colon after 'Fix')

❌ feat add quote search
   (Missing colon after 'feat')

❌ Feature: Add quote search
   (Incorrect - should be lowercase 'feat:')

❌ adding new command
   (Missing type prefix and not in imperative mood)
```

## 🤖 For AI Agents (GitHub Copilot)

When creating a pull request:

1. **Always start with a valid prefix** from the table above
2. **Include the colon** immediately after the prefix (no space before)
3. **Add a space** after the colon
4. **Use lowercase** for the description (except proper nouns)
5. **Be concise** but descriptive
6. **Use imperative mood** ("add" not "adds" or "added")

### Examples by Task Type

| Task | PR Title Format |
|------|-----------------|
| Creating new Discord command | `feat: add /roll command for dice rolling` |
| Fixing a bug | `fix: correct permission check in gang delete` |
| Updating docs | `docs: update README with new command examples` |
| Refactoring code | `refactor: consolidate error handling in services` |
| Dependency updates | `chore: upgrade Discord.js to v15` |
| Workflow changes | `ci: add security scanning to PR checks` |
| Adding tests | `test: add unit tests for DatabaseService` |

## 🔍 Validation Process

The PR title is validated by GitHub Actions in `.github/workflows/pr-checks.yml`:

```yaml
- name: 🎯 Validate PR title
  uses: actions/github-script@v7
  with:
    script: |
      const pr = context.payload.pull_request;
      const validPrefixes = [
        'feat:', 'feature:',
        'fix:', 'bugfix:',
        'docs:',
        'style:',
        'refactor:',
        'perf:', 'performance:',
        'test:', 'testing:',
        'chore:',
        'ci:', 'cd:',
        'revert:',
        'merge:'
      ];

      const hasValidPrefix = validPrefixes.some(prefix =>
        pr.title.toLowerCase().startsWith(prefix)
      );

      if (!hasValidPrefix) {
        core.setFailed(
          `❌ PR title must start with one of: ${validPrefixes.join(', ')}\n` +
          `Current: "${pr.title}"`
        );
      }
```

**Note**: The validation is case-insensitive for the prefix (e.g., `Fix:` and `fix:` both work).

## 📝 Quick Reference Card

Copy this into your notes:

```
PR Title Format: <type>: <description>

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, revert, merge

Example: fix: resolve database connection timeout

Remember:
- Type must be lowercase
- Colon immediately after type
- Space after colon
- Description in imperative mood
```

## 🚨 Common Mistakes to Avoid

1. **Forgetting the colon**: `feat add command` → `feat: add command`
2. **Wrong case**: `Feat: add command` → `feat: add command`
3. **No prefix**: `Add new command` → `feat: add new command`
4. **Wrong prefix**: `feature add command` → `feat: add command`
5. **Past tense**: `feat: added command` → `feat: add command`

## 🔗 Related Documentation

- [GitHub Actions PR Checks](.github/workflows/pr-checks.yml)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Contributing Guidelines](../CONTRIBUTING.md)

---

**Last Updated**: January 29, 2026
