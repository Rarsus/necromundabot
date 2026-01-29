# Scenario: Updating Dependencies

**When to use:** Adding, updating, or removing npm packages

## Prerequisites

- ✅ Understand [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Workspace versions
- ✅ Review [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Tests for new features

## Step 1: Assess Dependency Need

Ask:
- Is this package truly needed?
- Will other modules benefit?
- Does it conflict with existing dependencies?

```bash
# Check current dependencies
cat repos/YOUR_MODULE/package.json | grep -A 10 '"dependencies"'

# Check for conflicts
npm ls

# Check version compatibility
npm info PACKAGE_NAME
```

## Step 2: Add Dependency

```bash
# Add to specific workspace
npm install PACKAGE_NAME --workspace=repos/necrobot-core

# Check if it's a dev dependency
npm install PACKAGE_NAME --save-dev --workspace=repos/necrobot-core
```

## Step 3: Verify package-lock.json Updated

```bash
git status
# Should show: repos/necrobot-core/package.json and package-lock.json modified
```

## Step 4: Test Compatibility

```bash
# Run tests for workspace
npm test --workspace=repos/necrobot-core

# Run all tests
npm test

# Expected: All tests pass ✅
```

## Step 5: Update Code if Needed

If adding new functionality from the package:

```javascript
// Write test first (TDD)
describe('new feature', () => {
  it('should use new package', () => {
    const result = newPackage.method();
    assert.ok(result);
  });
});

// Then implement
const newPackage = require('package-name');
const result = newPackage.method();
```

## Step 6: Linting

```bash
npm run lint --workspace=repos/YOUR_MODULE

# Should pass with no errors ✅
```

## Step 7: Commit

```bash
git add repos/YOUR_MODULE/package.json package-lock.json

git commit -m "chore: Add PACKAGE_NAME dependency

- Added PACKAGE_NAME to repos/YOUR_MODULE/package.json
- Used for: Brief description of usage
- All tests passing
- No eslint errors"
```

## Updating Dependencies

To update an existing package:

```bash
# Check for updates
npm outdated --workspace=repos/necrobot-core

# Update specific package
npm update PACKAGE_NAME --workspace=repos/necrobot-core

# Update all packages
npm update --workspace=repos/necrobot-core
```

## Major Version Updates

For major version changes:

1. Check CHANGELOG for breaking changes
2. Run full test suite
3. Fix any breaking changes
4. Verify linting
5. Test in Docker

```bash
# Check breaking changes
npm info PACKAGE_NAME

# Update carefully
npm install PACKAGE_NAME@X.Y.Z --workspace=repos/YOUR_MODULE

# Run comprehensive tests
npm test
npm run lint
docker-compose up --build -d
```

## Removing Dependencies

If removing a package:

```bash
# Remove it
npm uninstall PACKAGE_NAME --workspace=repos/YOUR_MODULE

# Verify nothing broke
npm test
npm run lint
grep -r "require.*PACKAGE_NAME" repos/YOUR_MODULE/src

# Should return nothing
```

## Workspace Dependencies

**For inter-module dependencies, use `"*"` version:**

```json
{
  "dependencies": {
    "necrobot-utils": "*",
    "necrobot-core": "*"
  }
}
```

See [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) for details.

## Testing Dependency Updates

After updating, run full test suite:

```bash
npm test                                    # All tests
npm run lint                                # Linting
docker-compose up --build -d                # Docker build
docker logs necromundabot -f                # Verify startup
```

## Checklist

- [ ] Dependency is needed (not bloat)
- [ ] No conflicts with existing deps
- [ ] package.json and package-lock.json updated
- [ ] All tests pass
- [ ] Linting passes
- [ ] Docker builds successfully
- [ ] Commit message clear and descriptive

## Troubleshooting

**Issue:** npm test fails after adding package  
**Solution:** Check for incompatibilities, consider version constraints

**Issue:** package-lock.json has conflicts  
**Solution:** 
```bash
rm package-lock.json
npm ci
```

**Issue:** Different node_modules in Docker vs local  
**Solution:** Use `npm ci` not `npm install` in Dockerfile

## See Also

- [SERVICE-LAYER.md](../copilot-patterns/SERVICE-LAYER.md) - Workspace versions
- [TDD-WORKFLOW.md](../copilot-patterns/TDD-WORKFLOW.md) - Testing new code
