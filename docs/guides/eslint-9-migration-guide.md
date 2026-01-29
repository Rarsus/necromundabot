# ESLint 9.x Migration Guide for NecromundaBot Developers

**For NecromundaBot Developers | January 29, 2026**

This guide helps developers understand the ESLint 9.x upgrade and what (if anything) you need to know when contributing to the project.

---

## TL;DR - Do I Need to Do Anything?

**No.** If you're contributing code, nothing changes for you. All existing workflows remain the same:

```bash
npm run lint       # Still works
npm run lint:fix   # Still works
npm test          # Still works
```

The upgrade is transparent to your development workflow.

---

## What Changed?

### 1. ESLint Version

- **Before:** ESLint 8.57.1 (deprecated, no longer maintained)
- **After:** ESLint 9.17.0 (latest stable, actively maintained)

### 2. Configuration Format

- **Before:** `.eslintrc.js` files (legacy format)
- **After:** `eslint.config.js` files (flat config format)

**Why?** ESLint 9 requires the new flat config format. Legacy formats are no longer supported.

### 3. Security Plugin

- **Before:** `eslint-plugin-security@1.7.1`
- **After:** `eslint-plugin-security@3.0.1`

**Why?** Version 3.x is required for ESLint 9 compatibility.

### 4. Removed Packages

- ❌ `eslint-config-airbnb` (no ESLint 9 support)
- ❌ `eslint-config-next` (no ESLint 9 support)

**Why?** These packages haven't been updated for ESLint 9 yet. Their rules are now explicitly defined in our config files.

---

## For New Contributors

### Setting Up Your Environment

1. **Clone the repo:**

   ```bash
   git clone https://github.com/Rarsus/necromundabot.git
   cd necromundabot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify linting works:**
   ```bash
   npm run lint
   ```

That's it! ESLint 9 will work automatically.

---

## For Existing Contributors

### After Pulling This Update

1. **Update your dependencies:**

   ```bash
   git pull origin main  # or your branch
   npm install
   ```

2. **Verify everything works:**
   ```bash
   npm test
   npm run lint
   ```

If you see any errors, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Common Scenarios

### Scenario 1: "My editor shows ESLint errors"

**Solution:** Your editor's ESLint plugin may need to be updated or restarted.

**VS Code:**

1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
2. Type "Reload Window"
3. Press Enter

**Other Editors:**

- Restart your editor or reload the window
- Ensure your ESLint plugin is up to date

### Scenario 2: "Linting fails in my PR"

**Solution:** Run auto-fix before committing:

```bash
npm run lint:fix
git add .
git commit -m "Fix linting issues"
```

### Scenario 3: "I need to add a new ESLint rule"

**Location:** Edit the appropriate `eslint.config.js` file:

- Root: `/eslint.config.js`
- Core: `/repos/necrobot-core/eslint.config.js`
- Utils: `/repos/necrobot-utils/eslint.config.js`
- Commands: `/repos/necrobot-commands/eslint.config.js`
- Dashboard: `/repos/necrobot-dashboard/eslint.config.js`

**Format Example:**

```javascript
rules: {
  'new-rule-name': ['error', { option: 'value' }],
  // ...other rules
}
```

---

## Flat Config Format Quick Reference

### Before (`.eslintrc.js` - Legacy)

```javascript
module.exports = {
  env: {
    node: true,
  },
  extends: ['eslint:recommended'],
  plugins: ['import'],
  rules: {
    'no-console': 'off',
  },
};
```

### After (`eslint.config.js` - Flat Config)

```javascript
const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-console': 'off',
    },
  },
];
```

**Key Differences:**

1. Config is now an **array** of config objects
2. `extends` is replaced by including config objects directly
3. `plugins` are imported as modules
4. `env` is replaced by `languageOptions.globals`

---

## Security Notes

### Pre-existing Warnings

You may see 4 security warnings in `CommandLoader.js`:

```
security/detect-non-literal-fs-filename
```

**These are expected and safe.** They're for the command loading system which needs to dynamically load files. This is by design and has been reviewed.

### New Security Features

ESLint 9 + Security Plugin 3.x provide:

- ✅ Better detection of timing attacks
- ✅ Improved regex safety checks
- ✅ Enhanced object injection detection

---

## Testing Your Changes

### Before Committing

Always run:

```bash
npm run lint        # Check for errors
npm run lint:fix    # Auto-fix issues
npm test           # Run all tests
```

### Pre-commit Hook

The repo has pre-commit hooks that will:

1. Format your code with Prettier
2. Run linting checks

If the hook fails, fix the issues and try again.

---

## Troubleshooting

### Problem: `npm install` fails

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problem: ESLint can't find plugins

**Solution:**
Ensure you've run `npm install` in the root directory. The monorepo structure requires root-level installation.

### Problem: Different linting results locally vs CI

**Solution:**

```bash
npm ci  # Use exact versions from lock file
npm run lint
```

---

## FAQ

**Q: Can I still use Airbnb style rules?**  
A: Yes! The rules from Airbnb config are now explicitly defined in the config files. The linting behavior is the same.

**Q: Do I need to learn flat config format?**  
A: Not unless you're adding/modifying linting rules. For regular development, you don't need to interact with the config files.

**Q: Will this affect my existing PRs?**  
A: You may need to rebase your branch and run `npm install` again. Linting rules haven't changed significantly, so your code should still pass.

**Q: What if I find a linting issue?**  
A: Open an issue on GitHub or submit a PR with a fix to the appropriate `eslint.config.js` file.

---

## Resources

**Official Documentation:**

- [ESLint 9.x Configuration](https://eslint.org/docs/latest/use/configure/)
- [Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)

**Project-Specific:**

- [Completion Report](./PHASE-04.0.1-ESLINT-UPGRADE-COMPLETE.md)
- [Copilot Instructions](./.github/copilot-instructions.md)

---

## Need Help?

**General Questions:**

- Check this guide first
- Review [docs/guides/](../../docs/guides/)
- Search existing GitHub issues

**ESLint-Specific Issues:**

- Open a GitHub issue with the `linting` label
- Include the error message and your config file

**Urgent Issues:**

- Tag @maintainers in Slack/Discord
- Reference this migration guide

---

**Last Updated:** January 29, 2026  
**ESLint Version:** 9.17.0  
**Status:** ✅ Active
