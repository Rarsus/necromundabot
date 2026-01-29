# Pattern: Service Layer & Workspace Imports

**Use workspace `"*"` versions for inter-module dependencies. Never use `file:../` paths.**

## Workspace Dependency Resolution

All inter-submodule dependencies use workspace version `"*"`:

```json
{
  "dependencies": {
    "necrobot-utils": "*",
    "necrobot-core": "*"
  }
}
```

### Why `"*"`?

- ✅ **During development:** Resolves to local workspace versions automatically
- ✅ **When publishing:** npm replaces `"*"` with fixed version (e.g., `0.2.2`)
- ✅ **No circular issues:** Avoids file:// path problems in monorepos
- ✅ **Independent versioning:** Each package versions separately
- ✅ **Publishing support:** Published packages reference npm registry

### ❌ WRONG: Never use file paths

```json
{
  "dependencies": {
    "necrobot-utils": "file:../necrobot-utils",
    "necrobot-core": "file:../necrobot-core"
  }
}
```

This breaks when packages are published to npm.pkg.github.com.

## Import Patterns

### From necrobot-commands

```javascript
// ✅ CORRECT - Standard require()
const CommandLoader = require('necrobot-core');
const { DatabaseService } = require('necrobot-utils');
const { sendSuccess } = require('necrobot-utils');
```

### From necrobot-core

```javascript
// ✅ CORRECT - Standard require()
const { DatabaseService } = require('necrobot-utils');
const { errorHandler } = require('necrobot-utils');
```

### From necrobot-dashboard

```javascript
// ✅ CORRECT - Standard require()
const { DatabaseService } = require('necrobot-utils');
```

### ❌ WRONG: Never import from deprecated locations

```javascript
// ❌ WRONG - Deprecated path
const db = require('../../repos/necrobot-utils/src/db');

// ❌ WRONG - File path
const service = require('file:../necrobot-utils');

// ❌ WRONG - Relative path with ../../
const helper = require('../../../../src/utils/helpers');
```

## Current Dependencies

```
necrobot-commands
  └─ Depends on:
     - necrobot-core (CommandLoader, event handlers)
     - necrobot-utils (DatabaseService, helpers, middleware)

necrobot-core
  └─ Depends on:
     - necrobot-utils (services, middleware, helpers)

necrobot-dashboard
  └─ Depends on:
     - necrobot-utils (database access, API client)

necrobot-utils
  └─ Depends on: Nothing (clean isolation layer)
```

## Service Layer Architecture

**necrobot-utils exports main services:**

```javascript
// Correct pattern for importing services
const { DatabaseService } = require('necrobot-utils');
const { errorHandler } = require('necrobot-utils');
const { sendSuccess, sendError } = require('necrobot-utils');
```

**Never access internal paths directly:**

```javascript
// ❌ WRONG - Accessing internal file
const db = require('necrobot-utils/src/services/DatabaseService');

// ✅ CORRECT - Exported from index.js
const { DatabaseService } = require('necrobot-utils');
```

## Package Publishing

When packages are published to npm.pkg.github.com:

1. Package versions are pinned (e.g., `"necrobot-utils": "0.2.2"`)
2. External projects use `npm install @rarsus/necrobot-utils`
3. File paths are no longer available
4. Only exported public APIs work

Using `"*"` during development ensures this works correctly.

## Verifying Workspace Resolution

```bash
# Check dependency tree
npm ls

# Output shows local resolution:
necromundabot@0.0.1 /home/olav/repo/necromundabot
├── repos/necrobot-core (0.3.0)
│   └── necrobot-utils (0.2.2) -> necrobot-utils@0.2.2
├── repos/necrobot-utils (0.2.2)
├── repos/necrobot-commands (0.1.0)
│   ├── necrobot-core (0.3.0) -> necrobot-core@0.3.0
│   └── necrobot-utils (0.2.2) -> necrobot-utils@0.2.2
```

## Troubleshooting

**Issue:** Getting UNMET DEPENDENCY warnings  
**Solution:**
```bash
npm install
npm ci --workspaces
```

**Issue:** Can't find module 'necrobot-utils'  
**Solution:**
```bash
# Check package.json has dependency
cat repos/YOUR_MODULE/package.json | grep necrobot

# Reinstall
npm install --workspace=repos/YOUR_MODULE
```

**Issue:** Package exports undefined  
**Solution:**
```bash
# Verify export in necrobot-utils/src/index.js
cat repos/necrobot-utils/src/index.js

# Should include the export you're trying to use
module.exports = {
  DatabaseService,
  errorHandler,
  sendSuccess,
  // etc...
};
```
