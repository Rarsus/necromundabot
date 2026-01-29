# GitHub Packages Publishing Guide

This document outlines how to publish NecroBot packages to GitHub Packages.

## Automatic Publishing (Recommended)

The `.github/workflows/publish-packages.yml` workflow automatically publishes packages when:

- Changes are pushed to `main` branch
- `repos/*/package.json` files are modified
- Manually triggered via GitHub Actions UI

### How it works:

1. **Detects version changes** in each package's `package.json`
2. **Checks if already published** to avoid duplicate uploads
3. **Publishes sequentially** to prevent race conditions
4. **Verifies publication** and reports status

### Trigger manually:

```bash
# Go to GitHub Actions tab → Publish Packages to GitHub Packages → Run workflow
```

## Manual Publishing (Local)

### Prerequisites

1. Create a GitHub Personal Access Token (PAT):
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Select "Tokens (classic)"
   - Click "Generate new token"
   - Grant `write:packages` and `read:packages` scopes
   - Copy the token

2. Configure local environment:
   ```bash
   export GH_TOKEN='your_github_token_here'
   npm config set @rarsus:registry https://npm.pkg.github.com
   npm config set //npm.pkg.github.com/:_authToken $GH_TOKEN
   ```

### Publish a single package:

```bash
cd repos/necrobot-core
npm publish

# Expected output:
# npm notice Publishing to GitHub Packages registry
# npm notice
# npm notice 📦  @rarsus/necrobot-core@0.3.1
```

### Publish all packages:

```bash
#!/bin/bash
# From root directory
for package in necrobot-core necrobot-utils necrobot-commands necrobot-dashboard; do
  echo "Publishing $package..."
  cd repos/$package
  npm publish
  cd ../..
  sleep 2  # Small delay between publishes
done
```

## Verify Publication

Check if packages are published:

```bash
npm view @rarsus/necrobot-core
npm view @rarsus/necrobot-utils
npm view @rarsus/necrobot-commands
npm view @rarsus/necrobot-dashboard
```

Or run the verification script:

```bash
npm run verify:packages
```

## Troubleshooting

### Error: "403 Forbidden"

- Cause: Invalid or expired GitHub token
- Fix: Generate new PAT with `write:packages` scope

### Error: "npm ERR! 400 Bad Request"

- Cause: Package name not scoped with `@rarsus/`
- Fix: Verify `package.json` has `"name": "@rarsus/package-name"`

### Error: "npm ERR! You do not have permission"

- Cause: Repository doesn't allow your token
- Fix: Ensure token has correct scopes and organization access

### Package shows in registry but npm install fails

- Wait 5-10 minutes for propagation across GitHub CDN
- Clear npm cache: `npm cache clean --force`
- Try again: `npm install @rarsus/package-name`

## Version Management

### Bump versions before publishing:

```bash
cd repos/necrobot-core
# Update version in package.json
# Then commit and push
git add package.json
git commit -m "chore: Bump necrobot-core to 0.3.2"
git push origin main
# GitHub Actions will automatically detect and publish
```

## Publishing Workflow

```
1. Modify package.json version
2. Commit and push to main
3. GitHub Actions detects change
4. Workflow publishes to GitHub Packages
5. Verify with: npm view @rarsus/package-name
6. Other projects can now: npm install @rarsus/package-name
```

## Security Notes

- ✅ Store GitHub tokens in environment variables, NOT in .npmrc files
- ✅ Use `secrets.GITHUB_TOKEN` in workflows (automatic, ephemeral)
- ✅ Rotate PATs regularly if manually created
- ❌ Never commit real tokens to git
- ❌ Don't share tokens publicly
