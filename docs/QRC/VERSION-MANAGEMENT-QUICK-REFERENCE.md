# Version Management Quick Reference

> **Use this checklist before every version bump and package publication**

## 🚀 Quick Start: Publishing a Package

### Before You Start

- [ ] Code changes are complete
- [ ] All tests pass: `npm test --workspaces`
- [ ] No lint errors: `npm run lint`

### Step-by-Step

1. **Edit package.json** - Update version number

   ```bash
   cd repos/necrobot-PACKAGE
   # Edit package.json: "version": "X.Y.Z"
   ```

2. **Verify** - Check dependencies

   ```bash
   npm ls --workspaces
   ```

3. **Test** - Run all tests

   ```bash
   npm test --workspaces
   ```

4. **Commit** - Save version bump

   ```bash
   git add repos/necrobot-PACKAGE/package.json
   git commit -m "chore: Bump necrobot-PACKAGE to X.Y.Z"
   ```

5. **Push** - Trigger GitHub Actions

   ```bash
   git push origin main
   ```

6. **Monitor** - Watch workflow
   - Go to: Actions tab → publish-packages workflow
   - Verify all jobs pass

---

## ✅ Pre-Publication Checklist

**Code Quality:**

- [ ] Code changes tested locally
- [ ] All tests pass: `npm test --workspaces`
- [ ] Linting passes: `npm run lint`
- [ ] No warnings in `npm ls` output

**Version Management:**

- [ ] Version number updated in package.json
- [ ] Follows semantic versioning (MAJOR.MINOR.PATCH)
- [ ] Updated in dependency order (utils → core → commands → dashboard)
- [ ] Previous versions are released and working

**Dependency Verification:**

- [ ] All internal dependencies use `"*"` (not pinned versions)
- [ ] No relative paths (no `file:../` or `../../`)
- [ ] Dependency tree is clean: `npm ls --workspaces`
- [ ] No unintended extraneous packages

**Documentation & Commits:**

- [ ] Commit message includes version number
- [ ] Commit includes version change only (separate from code changes when possible)
- [ ] CHANGELOG updated (if applicable)

**Automation Ready:**

- [ ] GitHub Actions workflow is enabled
- [ ] .npmrc files present in all packages
- [ ] LICENSE files present in all packages
- [ ] publishConfig set to GitHub Packages registry

---

## 🔍 Verification Commands

### Check Current Versions

```bash
grep '"version"' repos/necrobot-*/package.json
```

### Verify Dependency Tree

```bash
npm ls --workspaces
```

### Check Specific Package Dependencies

```bash
# Which packages depend on necrobot-utils?
npm ls necrobot-utils --workspaces

# Which packages depend on necrobot-core?
npm ls necrobot-core --workspaces
```

### Dry-Run Publish Check

```bash
cd repos/necrobot-PACKAGE
npm ls
# Shows what will be published (with pinned versions)
```

### Test Before Publishing

```bash
npm test --workspaces
# All tests must PASS ✅
```

---

## ⚠️ Common Mistakes to Avoid

| Mistake               | Example                                      | Fix                            |
| --------------------- | -------------------------------------------- | ------------------------------ |
| Hardcoded version     | `"necrobot-utils": "0.2.3"`                  | Use `"*"` instead              |
| File path             | `"necrobot-utils": "file:../necrobot-utils"` | Use `"*"` instead              |
| Wrong order           | Update commands before core                  | Update utils → core → commands |
| No test               | Skip `npm test` before push                  | Always run tests first         |
| Forgotten version     | Only commit code, not version                | Commit both together           |
| Inconsistent versions | Mix old and new versions                     | Update in dependency order     |

---

## 📊 Dependency Hierarchy

```
necrobot-utils@X.Y.Z (foundation - no dependencies)
  ↑
  ├── necrobot-core@A.B.C depends on utils
  │   ↑
  │   └── necrobot-commands@D.E.F depends on core & utils
  │
  ├── necrobot-commands@D.E.F depends on utils
  │
  └── necrobot-dashboard@G.H.I depends on utils
```

**Update Order:**

1. Update necrobot-utils (if changed)
2. Update necrobot-core (if changed)
3. Update necrobot-commands (if changed)
4. Update necrobot-dashboard (if changed)

---

## 🔐 Version Guarantee

**How to Ensure Correct Versions:**

1. ✅ Use wildcard `*` for internal dependencies (npm handles resolution)
2. ✅ Update in dependency order (base packages first)
3. ✅ Test all packages together before publishing
4. ✅ Let GitHub Actions handle publishing (uses exact versions)
5. ✅ Verify published versions in GitHub Packages registry

**Result:** Correct versions automatically used everywhere

---

## 📋 Publishing Workflow Summary

```
Code Changes
    ↓
npm test --workspaces ← Must pass ✅
    ↓
Update version in package.json
    ↓
npm ls --workspaces ← Verify dependencies
    ↓
git commit + git push
    ↓
GitHub Actions detects version change
    ↓
Runs tests + publishes to GitHub Packages
    ↓
Verify in registry: https://github.com/YOUR_ORG/necromundabot/packages
    ↓
Done! ✅
```

---

## 🎯 Decision Tree: Should I Bump Version?

```
Did I change the published package contents?
├─ YES: Code, exports, or APIs changed
│  └─ Is it a breaking change?
│     ├─ YES: Bump MAJOR (0.2.3 → 1.0.0)
│     └─ NO: Is it a new feature?
│        ├─ YES: Bump MINOR (0.2.3 → 0.3.0)
│        └─ NO: Bump PATCH (0.2.3 → 0.2.4)
│
└─ NO: Only tests or docs changed
   └─ Skip version bump, don't publish
```

---

## 🆘 Troubleshooting

**Problem:** GitHub Actions didn't publish
**Check:** Did you bump the version in package.json?

```bash
grep '"version"' repos/necrobot-PACKAGE/package.json
```

**Problem:** Dependency tree shows warnings
**Check:** Are all internal dependencies using `"*"`?

```bash
grep -A5 '"dependencies"' repos/necrobot-*/package.json
```

**Problem:** Import errors about missing modules
**Check:** Are you using package names or relative paths?

```bash
grep "require.*necrobot" repos/necrobot-*/src/ -r
```

**Problem:** Tests fail before publishing
**Action:** Fix code, re-run tests, then update version

```bash
npm test --workspaces
```

---

## 📚 Full Documentation

For complete details, see: [VERSION-MANAGEMENT-STRATEGY.md](./VERSION-MANAGEMENT-STRATEGY.md)
