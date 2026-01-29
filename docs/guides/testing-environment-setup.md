# Testing Environment Setup & Validation

**Last Updated:** January 29, 2026  
**Requirement:** Node.js >=22.0.0, npm >=10.0.0

## Overview

NecromundaBot's testing suite now includes automatic environment validation to ensure the correct Node.js version and dependencies are installed before running tests. This prevents cryptic test failures caused by version mismatches.

## Requirements

### Node.js Version

- **Required:** `>=22.0.0`
- **Recommended:** `22.22.0` or latest LTS in the v22 branch
- **Rationale:** Discord.js v14+ and modern npm workspaces support

### npm Version

- **Required:** `>=10.0.0`
- **Recommended:** `10.9.4` or latest
- **Rationale:** Workspace support and monorepo features

## Automatic Validation

### How It Works

The validation runs **automatically** before any test execution via npm lifecycle hooks:

```bash
npm test
  ↓
npm run pretest (automatic)
  ↓
npm run validate:node (checks versions)
  ↓
If valid: Continue to npm test
If invalid: Display error and exit with code 1
```

### When Validation Runs

Validation occurs automatically before:

- `npm test` - Full test suite
- `npm run test:quick` - Quick test suite
- Any custom test script (via pretest hook)

### GitHub Actions Validation

GitHub Actions workflows explicitly validate Node version at:

1. **Unit Tests Job** - After setup, before dependency installation
2. **Integration Tests Job** - After setup, before dependency installation

## Local Testing

### Verify Environment (Explicit)

```bash
npm run validate:node
```

**Output (Valid):**

```
🔍 Validating test environment...
════════════════════════════════════════════════════════════
✅ Node.js:
   Required: >=22.0.0
   Current:  v22.22.0
✅ npm:
   Required: >=10.0.0
   Current:  v10.9.4
════════════════════════════════════════════════════════════

✅ Environment is ready for testing!
```

**Output (Invalid):**

```
🔍 Validating test environment...
════════════════════════════════════════════════════════════
✅ Node.js:
   Required: >=22.0.0
   Current:  v20.11.0
❌ npm:
   Required: >=10.0.0
   Current:  v9.8.1
════════════════════════════════════════════════════════════

❌ Environment validation failed!

📝 Summary:
   • Node.js v20.11.0 does NOT meet requirement >=22.0.0
   • To fix: Install Node.js >=22.0.0
   • npm v9.8.1 does NOT meet requirement >=10.0.0
   • To fix: npm install -g npm@>=10.0.0

💡 Tip: Use nvm or nodeenv to manage Node versions
   $ nvm install 22
```

### Run Tests (Validation Included)

```bash
# Automatically validates environment, then runs tests
npm test

# Or for quick tests only
npm run test:quick
```

## Setting Up Node.js

### Using nvm (Recommended for Development)

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 22
nvm install 22

# Use Node 22 in current terminal
nvm use 22

# Verify
node --version  # Should show v22.x.x
npm --version   # Should show 10.x.x
```

### Using Homebrew (macOS)

```bash
# Install or update Node 22
brew install node@22

# Link it as the default
brew link node@22 --force
```

### Using apt (Ubuntu/Debian)

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js (includes npm)
sudo apt-get install -y nodejs
```

### Using Windows

- Download from [nodejs.org](https://nodejs.org) (v22 LTS)
- Or use [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/)
- Or use [Chocolatey](https://chocolatey.org/): `choco install nodejs`

## Dependency Installation

### Clean Install (Recommended)

```bash
# Clear node_modules and package-lock.json
rm -rf node_modules package-lock.json
rm -rf repos/*/node_modules

# Fresh install with exact versions
npm ci --workspaces

# Or use the convenience script
npm run install:all
```

### Why `npm ci` Instead of `npm install`?

| Feature              | `npm ci`                  | `npm install`        |
| -------------------- | ------------------------- | -------------------- |
| **Exact Versions**   | ✅ From package-lock.json | ❌ May install newer |
| **Reproducible**     | ✅ Always same result     | ❌ Can vary by time  |
| **Cache**            | ✅ Faster on CI           | ❌ Slower validation |
| **Breaking Changes** | ✅ Prevented              | ❌ Possible          |

**Best Practice:** Use `npm ci --workspaces` for:

- Local development (ensures consistent environment)
- GitHub Actions workflows (reproducible CI)
- Docker builds (same versions in container)

## Docker Testing Environment

The Dockerfile automatically uses Node 22:

```dockerfile
FROM node:22-alpine AS builder
```

To rebuild and test in Docker:

```bash
# Build fresh Docker image
docker-compose down
docker system prune -f
docker-compose up --build -d

# Verify Node version in container
docker exec necromundabot node --version
# Should output: v22.x.x
```

## Troubleshooting

### Problem: "Node version does not meet requirement"

**Symptom:**

```
❌ Node.js v20.11.0 does NOT meet requirement >=22.0.0
```

**Solution:**

```bash
# Check current version
node --version

# If v20.x:
nvm install 22          # If using nvm
nvm use 22

# Or install manually from nodejs.org

# Verify
node --version          # Should show v22.x.x
npm run validate:node   # Should pass
```

### Problem: "npm version does not meet requirement"

**Symptom:**

```
❌ npm v9.8.1 does NOT meet requirement >=10.0.0
```

**Solution:**

```bash
# Update npm globally
npm install -g npm@latest

# Or specific version
npm install -g npm@10

# Verify
npm --version           # Should show 10.x.x
npm run validate:node   # Should pass
```

### Problem: Tests fail with cryptic errors

**Most Common Cause:** Wrong Node version

**Solution:**

1. Run validation: `npm run validate:node`
2. Check output for version mismatches
3. Update Node.js to v22.x using steps above
4. Reinstall dependencies: `npm ci --workspaces`
5. Run tests again: `npm test`

### Problem: Docker build fails with version error

**Solution:**

```bash
# Ensure Dockerfile uses Node 22
grep "FROM node:" Dockerfile

# Should show: FROM node:22-alpine

# Rebuild without cache
docker-compose down
docker system prune -f
docker-compose up --build -d
```

## Validation Script Details

**File:** `scripts/validate-node-version.js`

**What It Does:**

1. Reads `package.json` for required versions
2. Checks current Node.js version from `process.version`
3. Checks current npm version via `npm -v` command
4. Compares using semantic versioning
5. Provides colored output with clear status

**Exit Codes:**

- `0` - Environment valid, ready for testing
- `1` - Environment invalid, displays errors

**Color Indicators:**

- 🟢 **Green** - Requirement met
- 🔴 **Red** - Requirement not met
- 🔵 **Cyan** - Information/details
- 🟡 **Yellow** - Suggestions/tips

## CI/CD Integration

### GitHub Actions Workflow

Both test jobs validate Node version:

```yaml
unit-tests:
  steps:
    - name: ✅ Validate Node.js version
      run: |
        npm run validate:node

    - name: 📚 Install dependencies
      run: npm ci --workspaces
```

### Workflow Guarantees

✅ Each job explicitly validates Node 22 is installed  
✅ Dependencies installed with `npm ci` (exact versions)  
✅ Validation runs before dependencies install  
✅ Clear failure messages if versions don't match  
✅ Blocks test execution if environment invalid

## Best Practices

1. **Always use `npm ci --workspaces`** (not `npm install`)
2. **Run validation before testing:** `npm run validate:node`
3. **Keep Node updated** within v22.x branch
4. **Use nvm to manage versions** if developing across projects
5. **Check environment after major system updates** (OS upgrades, etc.)
6. **Rebuild Docker image** after Node version changes

## See Also

- [Docker Troubleshooting Guide](../guides/DOCKER-TROUBLESHOOTING.md)
- [Testing Patterns](../testing/TESTING-PATTERNS.md)
- [Local Development Setup](docker-setup.md)
- [GitHub Actions Workflows](.github/workflows/testing.yml)

## Questions?

If you encounter environment validation issues:

1. Run: `npm run validate:node` (shows current state)
2. Check output for version mismatches
3. Update Node.js/npm as needed
4. Reinstall dependencies: `npm ci --workspaces`
5. Verify again: `npm run validate:node`

If issues persist, check the troubleshooting section above or consult the Docker setup guide.
