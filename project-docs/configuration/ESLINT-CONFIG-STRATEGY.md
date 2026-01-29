# NecromundaBot ESLint Configuration Strategy

**Date:** January 26, 2026  
**Status:** Custom ESLint 9 configuration (Airbnb-compatible)

## Problem

ESLint 9 is the latest version, but `eslint-config-airbnb-base` only supports ESLint 7-8. Rather than downgrade, we've created a **custom ESLint configuration** that:

- ✅ Uses ESLint 9 (latest)
- ✅ Maintains Airbnb's quality standards
- ✅ Adds security best practices
- ✅ Supports all current and future features
- ✅ Provides consistent rules across all submodules

## Configuration Approach

### Root ESLint Configuration (`.eslintrc.js`)

Located at `/necromundabot/.eslintrc.js` - shared by all submodules.

**Key Rules:**
- Strict equality checking (`eqeqeq`)
- No eval() usage
- Security plugin for common vulnerabilities
- Complexity warnings (max 18 per function)
- Unused variable detection

**Test Exceptions:**
- Special rules for Jest test files
- Allows complex nested structures
- Disables security checks for test mocks/fixtures
- Allows intentionally unused parameters

### Per-Module Extensions

Each submodule can extend the root config:

**necrobot-core** (Discord bot logic):
```javascript
extends: ['../../.eslintrc.js']
```

**necrobot-utils** (Shared services):
```javascript
extends: ['../../.eslintrc.js']
```

**necrobot-dashboard** (React/Next.js):
```javascript
extends: ['../../.eslintrc.js']
env: { browser: true }
rules: { react/* rules */ }
```

**necrobot-commands** (Commands):
```javascript
extends: ['../../.eslintrc.js']
```

## Dependencies

```json
{
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-security": "^1.7.1",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-jsx-a11y": "^6.8.0"
  }
}
```

**Why this approach:**
- ✅ ESLint plugins are fully compatible with ESLint 9
- ✅ No deprecated config packages
- ✅ We get full control over rules
- ✅ Future-proof for ESLint 10+

## Core ESLint Rules (Equivalent to Airbnb)

### Import Rules
- `import/order` - Enforce consistent import order
- `import/newline-after-import` - Newline after imports
- `import/no-unresolved` - No missing imports
- `import/no-extraneous-dependencies` - No extra deps

### Code Quality Rules
- `eqeqeq: ['error', 'always']` - Strict equality
- `no-eval: 'error'` - Disable eval()
- `no-unused-vars` - Warn on unused (allow `_`)
- `complexity: ['warn', 18]` - Max complexity
- `max-lines-per-function: ['warn', 150]` - Max function lines

### Security Rules
- `security/detect-object-injection` - Object key injection
- `security/detect-non-literal-fs-filename` - Dynamic file paths
- `security/detect-unsafe-regex` - Dangerous regex patterns

### Error Handling
- `no-console: 'off'` - Allow console (development aid)
- `no-param-reassign: 'warn'` - Warn on param reassignment

## Why Custom Config?

| Aspect | Airbnb Config | Custom Config |
|--------|---------------|---------------|
| ESLint Version | 7-8 only | 9+ compatible |
| Future-Proof | Limited | Full control |
| Customization | Limited | Complete |
| Maintenance | External | Internal |
| Learning Value | Opaque | Clear rules |
| Flexibility | Restricted | Full |

## Implementation

### Root Level
- `.eslintrc.js` - Shared base configuration
- `.prettierrc.json` - Prettier formatting (unchanged)

### Per Submodule (optional)
- `.eslintrc.js` - Module-specific overrides
- Extends root config with module-specific rules

### Usage

```bash
# Lint all workspaces
npm run lint

# Auto-fix issues
npm run lint:fix

# Check specific file
npx eslint src/services/DatabaseService.js

# Generate report
npx eslint src --format json > eslint-report.json
```

## Migration Path

If a newer Airbnb config becomes available for ESLint 9:
1. Install `eslint-config-airbnb-base@latest`
2. Replace custom rules with extended config
3. Update documentation
4. No code changes needed (same rules)

## Documentation

- **Root Config:** `necromundabot/.eslintrc.js`
- **Prettier Config:** `necromundabot/.prettierrc.json`
- **Jest Config:** `necromundabot/jest.config.js`
- **Setup Guide:** `project-docs/necromundabot/configuration/eslint-setup.md`
