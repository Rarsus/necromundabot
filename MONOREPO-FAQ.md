# NecromundaBot Monorepo - Frequently Asked Questions

> Common questions about working with the NecromundaBot monorepo

---

## Architecture & Structure

### What is a monorepo?

A **monorepo** (monolithic repository) is a single Git repository containing multiple interdependent projects/packages. Benefits include:

- Easier code sharing and reuse
- Simplified dependency management
- Single point of version control
- Unified CI/CD pipeline

### Why did we switch to a monorepo?

**Before:** 4 separate git repositories (submodules) → Complexity, version sync issues  
**After:** 1 unified repository → Simpler, faster development, easier publishing

### How do packages communicate?

Via **npm workspaces** - a feature that allows packages to reference each other:

```javascript
// repos/necrobot-commands/src/commands/ping.js
const CommandLoader = require('necrobot-core');
const { DatabaseService } = require('necrobot-utils');
```

During development, `necrobot-core` and `necrobot-utils` resolve to local workspace packages. After publishing, they resolve from npm registry.

---

## Installation & Setup

### How do I install the project?

```bash
git clone https://github.com/Rarsus/necromundabot.git
cd necromundabot
npm ci --workspaces  # Use ci, not install
npm test
```

### What's the difference between `npm install` and `npm ci`?

- **`npm install`** - Flexible, may upgrade packages
- **`npm ci`** (Clean Install) - Reproducible, strict lock file

**Always use `npm ci --workspaces` for consistent environments.**

### Do I need to install each workspace separately?

No. `npm ci --workspaces` installs all workspaces and their dependencies at once.

### What Node.js version do I need?

**Minimum:** Node.js 22.0.0  
**Recommended:** Node.js 22.13.0 or later

Check your version:

```bash
node --version
npm --version
npm run validate:node
```

---

## Development Workflow

### How do I work on code in one package?

Edit files directly. Example:

```bash
# Edit file in necrobot-utils
vim repos/necrobot-utils/src/services/DatabaseService.js

# Test it
npm test --workspace=repos/necrobot-utils

# Commit
git add repos/necrobot-utils/
git commit -m "feat(utils): Add new database method"
```

### Do I need to rebuild anything?

No. npm workspaces link packages automatically. Changes are reflected immediately.

### How do I test my changes across packages?

```bash
# Test everything
npm test

# Test one package
npm test --workspace=repos/necrobot-core

# Watch mode (rerun on file change)
npm run test:watch --workspace=repos/necrobot-commands
```

### How do I run linting and formatting?

```bash
# Lint all code
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format all code
npm run format

# Check formatting without changes
npm run format:check
```

---

## Dependencies & Imports

### How do I import from another workspace?

Use the package name exactly as published:

```javascript
// ✅ CORRECT - Use package name
const { DatabaseService } = require('necrobot-utils');
const CommandLoader = require('necrobot-core');

// ❌ WRONG - Don't use file paths
const db = require('../../repos/necrobot-utils/src/services/DatabaseService');
```

### Can I add a dependency to a specific workspace?

Yes:

```bash
npm install some-package --workspace=repos/necrobot-core
```

The package is installed in that workspace's `node_modules`.

### How are dependencies deduplicated?

npm workspaces automatically deduplicate. If multiple packages need the same dependency, it's installed once in root `node_modules`.

View the deduplication:

```bash
npm list --workspaces --depth=0
```

### What's this "workspace:\*" syntax?

It means "use the local workspace version":

```json
// repos/necrobot-commands/package.json
{
  "dependencies": {
    "necrobot-core": "*", // Use local version during dev
    "necrobot-utils": "*" // Use local version during dev
  }
}
```

After publishing to npm, these are replaced with specific versions.

---

## Testing

### How do I run all tests?

```bash
npm test  # All workspaces
```

### How do I run tests for one workspace?

```bash
npm test --workspace=repos/necrobot-core
```

### Can I run a specific test file?

```bash
npm test -- test-command-loader.test.js
```

### How do I watch for changes and rerun tests?

```bash
npm run test:watch --workspace=repos/necrobot-commands
```

### What's the coverage requirement?

| Module        | Lines | Functions | Branches |
| ------------- | ----- | --------- | -------- |
| Core Services | 85%+  | 90%+      | 80%+     |
| Commands      | 80%+  | 85%+      | 75%+     |
| Utils         | 90%+  | 95%+      | 85%+     |

Check coverage:

```bash
npm run test:coverage --workspace=repos/necrobot-utils
```

### How do I write tests?

Create a file: `repos/[workspace]/tests/unit/test-*.test.js`

```javascript
const assert = require('assert');

describe('MyFeature', () => {
  it('should do something', () => {
    const result = myFunction();
    assert.strictEqual(result, expected);
  });
});
```

See [TESTING-PATTERNS.md](../testing/TESTING-PATTERNS.md) for detailed guidelines.

---

## Git & Version Control

### Do I use submodules?

No. The monorepo doesn't use submodules. All packages are in-tree.

Verify:

```bash
cat .gitmodules  # Should not exist
git config --file .gitmodules --list  # Should be empty
```

### How do I commit changes across multiple packages?

Just like normal:

```bash
git add repos/necrobot-utils/src/ repos/necrobot-core/src/
git commit -m "feat: Add new functionality"
```

### Can I commit to just one package?

Yes:

```bash
git add repos/necrobot-utils/
git commit -m "fix(utils): Bug fix"
```

### What branch should I work on?

Always work on a feature branch:

```bash
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: Add my feature"
git push origin feature/my-feature
# Create Pull Request on GitHub
```

### What's the commit message format?

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): description
fix(scope): description
docs(scope): description
test(scope): description
chore(scope): description
```

Examples:

```
feat(utils): Add new database helper
fix(commands): Handle empty input gracefully
docs(monorepo): Update README
test(core): Add CommandLoader tests
```

---

## Versioning & Publishing

### How are versions managed?

Each package has its own `version` in its `package.json`:

```json
// repos/necrobot-utils/package.json
{ "version": "0.2.4" }

// repos/necrobot-core/package.json
{ "version": "0.3.4" }
```

They're independent and can be released at different times.

### How do I release a new version?

**Option 1: Automated (Recommended)**

Push to `main` branch → GitHub Actions automatically publishes

**Option 2: Manual**

```bash
# Update version in package.json
# Create git tag
git tag v0.4.0

# Publish
npm publish --workspace=repos/necrobot-utils
npm publish --workspace=repos/necrobot-core
npm publish --workspace=repos/necrobot-commands
npm publish --workspace=repos/necrobot-dashboard
```

### Where do packages publish?

To **GitHub Packages** (npm.pkg.github.com)

Registry configured in root `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### What's the publish order?

1. **necrobot-utils** - No dependencies
2. **necrobot-core** - Depends on utils
3. **necrobot-commands** - Depends on core & utils
4. **necrobot-dashboard** - Depends on utils

GitHub Actions enforces this order automatically.

---

## Docker & Deployment

### How do I build a Docker image?

```bash
docker-compose up --build -d
```

The Dockerfile:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --workspaces  # Key line!
COPY . .
CMD ["node", "src/index.js"]
```

### Does Docker work with workspaces?

Yes, as long as you use `npm ci --workspaces` (not `npm install`).

### How do I test locally before pushing?

```bash
# 1. Run all tests
npm test

# 2. Build Docker image
docker-compose up --build -d

# 3. Check logs
docker logs necromundabot -f

# 4. Test the bot in Discord
# /ping → should reply with latency

# 5. Stop containers
docker-compose down
```

---

## Troubleshooting

### npm can't find modules

**Problem:** `Error: Cannot find module 'necrobot-utils'`

**Solution:**

```bash
npm ci --workspaces
npm list --workspaces
```

### Tests fail with "module not found"

**Problem:** `Error: Cannot find module '../../necrobot-utils/src/services'`

**Solution:** Use package names, not file paths:

```javascript
// ✅ CORRECT
const { DatabaseService } = require('necrobot-utils');

// ❌ WRONG
const db = require('../../repos/necrobot-utils/src/services/DatabaseService');
```

### Linting errors on commit

**Problem:** Git commit fails due to lint errors

**Solution:**

```bash
npm run lint:fix
git add .
git commit -m "chore: Fix linting errors"
```

### Docker build fails

**Problem:** `docker-compose up --build` fails

**Solution:**

```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Clean up old images
docker system prune -f

# Rebuild
docker-compose up --build -d
```

### Workspace changes not reflected

**Problem:** Changed code in one workspace, but other workspaces still see old version

**Solution:** npm workspaces link automatically, but restart may help:

```bash
npm test --workspace=repos/necrobot-core  # This forces reload
```

### GitHub Actions failures

**Problem:** Workflow fails after pushing

**Solution:**

1. Check the workflow logs: https://github.com/Rarsus/necromundabot/actions
2. Common causes:
   - Tests failing → Run `npm test` locally
   - Lint errors → Run `npm run lint:fix`
   - Dependency issues → Run `npm ci --workspaces`

---

## Advanced Topics

### Can I create a new workspace?

Yes:

1. Create directory: `repos/necrobot-new/`
2. Add `package.json`:
   ```json
   {
     "name": "@rarsus/necrobot-new",
     "version": "0.1.0",
     "main": "src/index.js"
   }
   ```
3. Add to root `package.json` `workspaces` array:
   ```json
   {
     "workspaces": [
       "repos/necrobot-utils",
       "repos/necrobot-core",
       "repos/necrobot-commands",
       "repos/necrobot-dashboard",
       "repos/necrobot-new" // Add here
     ]
   }
   ```
4. Run: `npm ci --workspaces`

### Can I delete a workspace?

Yes:

1. Remove from root `package.json` `workspaces` array
2. Delete the directory: `rm -rf repos/necrobot-old/`
3. Run: `npm ci --workspaces`

### How do I monitor workspace health?

```bash
npm run workspaces:status     # Show all workspaces
npm run workspaces:validate   # Validate structure
npm run workspaces:list       # List dependencies
```

### How do I check if all dependencies are installed?

```bash
npm ci --workspaces --dry-run  # Check without installing
npm list --workspaces          # Show dependency tree
```

---

## Getting Help

### Documentation

- [MONOREPO.md](./MONOREPO.md) - Full monorepo guide
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Contributing guidelines
- [Testing Guide](../testing/TESTING-PATTERNS.md) - Testing patterns

### Issues & Support

- [GitHub Issues](https://github.com/Rarsus/necromundabot/issues) - Report bugs
- [GitHub Discussions](https://github.com/Rarsus/necromundabot/discussions) - Ask questions

### External Resources

- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Discord.js](https://discordjs.guide/)
- [Node.js](https://nodejs.org/)

---

**Last Updated:** January 29, 2026  
**Status:** ✅ Complete  
**Maintainers:** NecromundaBot Team
